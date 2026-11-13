import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { useModalKeys } from "../hooks/useModalKeys";
import { usePageActive } from "./PageHost";
import { ModalLayer, useLeaving } from "./overlay";
import { Btn } from "./ui";
import { coverSize } from "./coverSize";

type Ratio = "4:3" | "1:1" | "free";

const RATIO_PAIRS: Record<Exclude<Ratio, "free">, [number, number]> = {
  "4:3": [4, 3],
  "1:1": [1, 1],
};

function loadImageEl(src: string, error: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(error));
    img.src = src;
  });
}

export type ImageCropDialogProps = {
  name: string;
  /** Return a browser-readable image source, or null when the picker is canceled. */
  pickImage: () => Promise<string | null>;
  /** Load the image being edited, if the caller has one. */
  loadInitialImage?: () => Promise<string>;
  onClose: () => void;
  /** Save the full-resolution JPEG. The caller owns persistence and completion. */
  onSave: (dataUrl: string) => Promise<void>;
};

export function ImageCropDialog({ name, pickImage, loadInitialImage, onClose, onSave }: ImageCropDialogProps) {
  const { t } = useI18n();
  const active = usePageActive();
  const leaving = useLeaving();
  const dialog = useRef<HTMLDivElement>(null);
  const badImage = t("ui.crop.badImage");
  // Replaced by a new ticket whenever the source or dialog changes.
  const sourceRequest = useRef(0);
  const dragCleanup = useRef<(() => void) | null>(null);
  const [picking, setPicking] = useState(false);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [ratio, setRatio] = useState<Ratio>("4:3");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [outputSize, setOutputSize] = useState("");
  const previewCanvas = useRef<HTMLCanvasElement>(null);
  const previewFrame = useRef<number | null>(null);
  const close = () => {
    if (!busy && !picking && !leaving && active) onClose();
  };
  useModalKeys(active && !leaving, dialog, { onEscape: close });

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  // 变换与选区放 ref 里：拖动是每帧的事，不该牵着 React 重渲染。
  const tf = useRef({ scale: 1, ox: 0, oy: 0 });
  const crop = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const ratioRef = useRef<Ratio>("4:3");
  const imgRef = useRef<HTMLImageElement | null>(null);

  const clampCrop = useCallback(() => {
    const im = imgRef.current;
    if (!im) return;
    const iw = im.naturalWidth;
    const ih = im.naturalHeight;
    const MIN = 8;
    const c = crop.current;
    c.w = Math.min(Math.max(c.w, MIN), iw);
    c.h = Math.min(Math.max(c.h, MIN), ih);
    c.x = Math.min(Math.max(c.x, 0), Math.max(0, iw - c.w));
    c.y = Math.min(Math.max(c.y, 0), Math.max(0, ih - c.h));
  }, []);

  const applyRatio = useCallback(() => {
    const r = ratioRef.current;
    if (r === "free") return;
    const im = imgRef.current;
    if (!im) return;
    const [rw, rh] = RATIO_PAIRS[r];
    const iw = im.naturalWidth;
    const ih = im.naturalHeight;
    let { x, y, w, h } = crop.current;
    const cx = x + w / 2;
    const cy = y + h / 2;
    if (w / h > rw / rh) h = (w * rh) / rw;
    else w = (h * rw) / rh;
    const scale = Math.min(1, iw / w, ih / h);
    w *= scale;
    h *= scale;
    x = Math.min(Math.max(0, cx - w / 2), iw - w);
    y = Math.min(Math.max(0, cy - h / 2), ih - h);
    crop.current = { x, y, w, h };
  }, []);

  const positionBox = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const { scale, ox, oy } = tf.current;
    const c = crop.current;
    box.style.left = `${ox + c.x * scale}px`;
    box.style.top = `${oy + c.y * scale}px`;
    box.style.width = `${c.w * scale}px`;
    box.style.height = `${c.h * scale}px`;
  }, []);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    const im = imgRef.current;
    if (!cv || !im) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const { scale, ox, oy } = tf.current;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = getComputedStyle(cv).getPropertyValue("--group").trim() || getComputedStyle(cv).backgroundColor;
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);
    ctx.drawImage(im, 0, 0, im.naturalWidth, im.naturalHeight);
    ctx.restore();
  }, []);

  const paintCrop = useCallback((canvas: HTMLCanvasElement, preview = false) => {
    const im = imgRef.current;
    if (!im) return null;
    const c = crop.current;
    const x = Math.round(c.x);
    const y = Math.round(c.y);
    const w = Math.max(1, Math.round(c.w));
    const h = Math.max(1, Math.round(c.h));
    const [outW, outH] = coverSize(w, h);
    const scale = preview ? Math.min(1, 480 / Math.max(outW, outH)) : 1;
    const width = Math.max(1, Math.round(outW * scale));
    const height = Math.max(1, Math.round(outH * scale));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingQuality = "high";
    // Use the same opaque background for transparent images in preview and export.
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--group-ink").trim();
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(im, x, y, w, h, 0, 0, width, height);
    return `${outW}×${outH}`;
  }, []);

  const updatePreview = useCallback(() => {
    if (previewFrame.current !== null) return;
    previewFrame.current = requestAnimationFrame(() => {
      previewFrame.current = null;
      const canvas = previewCanvas.current;
      if (canvas) setOutputSize(paintCrop(canvas, true) ?? "");
    });
  }, [paintCrop]);

  const fitCanvas = useCallback(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    const im = imgRef.current;
    if (!wrap || !cv || !im) return;
    const cw = Math.max(120, wrap.clientWidth);
    const iw = im.naturalWidth;
    const ih = im.naturalHeight;
    cv.width = cw;
    cv.height = Math.max(120, Math.min(360, Math.round((cw * ih) / iw)));
    const vs = Math.min(cv.width / iw, cv.height / ih);
    tf.current = {
      scale: vs,
      ox: (cv.width - iw * vs) / 2,
      oy: (cv.height - ih * vs) / 2,
    };
    draw();
    positionBox();
  }, [draw, positionBox]);

  const startEditor = useCallback(
    (im: HTMLImageElement) => {
      imgRef.current = im;
      const r = ratioRef.current;
      const iw = im.naturalWidth;
      const ih = im.naturalHeight;
      let w: number;
      let h: number;
      if (r === "free") {
        w = iw;
        h = ih;
      } else {
        const [rw, rh] = RATIO_PAIRS[r];
        if (iw / ih > rw / rh) {
          h = ih;
          w = (ih * rw) / rh;
        } else {
          w = iw;
          h = (iw * rh) / rw;
        }
      }
      crop.current = { x: (iw - w) / 2, y: Math.max(0, (ih - h) * 0.3), w, h };
      // 脸通常偏上：初始选区贴向中上。
      setImg(im);
    },
    [],
  );

  const openPicker = useCallback(async () => {
    const request = ++sourceRequest.current;
    setPicking(true);
    setErr("");
    try {
      const data = await pickImage();
      if (!data || request !== sourceRequest.current) return;
      const el = await loadImageEl(data, badImage);
      if (request !== sourceRequest.current) return;
      startEditor(el);
    } catch (e) {
      if (request === sourceRequest.current) setErr(String(e));
    } finally {
      setPicking(false);
    }
  }, [badImage, pickImage, startEditor]);

  useEffect(() => {
    if (!active || leaving) return;
    const request = ++sourceRequest.current;
    if (loadInitialImage) {
      void loadInitialImage().then(src => loadImageEl(src, badImage)).then(el => {
        if (request === sourceRequest.current) startEditor(el);
      }).catch((error) => {
        if (request === sourceRequest.current) setErr(String(error));
      });
    }
    const counter = sourceRequest;
    const drag = dragCleanup;
    const frame = previewFrame;
    return () => {
      counter.current++;
      drag.current?.();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [active, leaving, badImage, loadInitialImage, startEditor]);

  // 编辑器 DOM 挂上之后再量宽度。以前 startEditor 里立刻 rAF，那时
  // wrap 还没渲染，画布 0 宽，预览区也是空的。
  useEffect(() => {
    if (!img) return;
    const id = requestAnimationFrame(() => {
      fitCanvas();
      updatePreview();
    });
    return () => cancelAnimationFrame(id);
  }, [img, fitCanvas, updatePreview]);

  // 画布跟随窗口宽度重排。
  useEffect(() => {
    if (!img || !active || leaving || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      fitCanvas();
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [active, leaving, img, fitCanvas]);

  const zoomAt = useCallback((factor: number, mx: number, my: number) => {
    const cur = tf.current;
    const ns = Math.min(20, Math.max(0.02, cur.scale * factor));
    const k = ns / cur.scale;
    tf.current = {
      scale: ns,
      ox: mx - (mx - cur.ox) * k,
      oy: my - (my - cur.oy) * k,
    };
    draw();
    positionBox();
  }, [draw, positionBox]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!img || !wrap || !canvas || !active || leaving || busy || picking) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * canvas.width / rect.width;
      const y = (event.clientY - rect.top) * canvas.height / rect.height;
      zoomAt(event.deltaY < 0 ? 1.15 : 0.87, x, y);
    };
    wrap.addEventListener("wheel", wheel, { passive: false });
    return () => wrap.removeEventListener("wheel", wheel);
  }, [active, leaving, img, busy, picking, zoomAt]);

  const onCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!imgRef.current || e.button !== 0 || busy || picking) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = "grabbing";
    const start = { x: e.clientX, y: e.clientY, ox: tf.current.ox, oy: tf.current.oy };
    const move = (ev: PointerEvent) => {
      tf.current.ox = start.ox + (ev.clientX - start.x);
      tf.current.oy = start.oy + (ev.clientY - start.y);
      draw();
      positionBox();
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      dragCleanup.current = null;
      const cvs = canvasRef.current;
      if (cvs) cvs.style.cursor = "grab";
    };
    dragCleanup.current?.();
    dragCleanup.current = up;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onBoxPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imgRef.current || e.button !== 0 || busy || picking) return;
    e.stopPropagation();
    e.preventDefault();
    const target = e.target as HTMLElement;
    const handle = target.closest("[data-h]");
    const mode: string = handle
      ? (handle as HTMLElement).dataset.h || "move"
      : "move";
    const p0 = { x: e.clientX, y: e.clientY };
    const c0 = { ...crop.current };
    const s0 = tf.current.scale;
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - p0.x) / s0;
      const dy = (ev.clientY - p0.y) / s0;
      let c = { ...c0 };
      const r = ratioRef.current;
      if (mode === "move") {
        c.x = c0.x + dx;
        c.y = c0.y + dy;
      } else {
        let rw: number | null = null;
        let rh: number | null = null;
        if (r !== "free") [rw, rh] = RATIO_PAIRS[r];
        let nx = c0.x;
        let ny = c0.y;
        let nw = c0.w;
        let nh = c0.h;
        if (mode.includes("e")) nw = c0.w + dx;
        if (mode.includes("s")) nh = c0.h + dy;
        if (mode.includes("w")) {
          nw = c0.w - dx;
          nx = c0.x + dx;
        }
        if (mode.includes("n")) {
          nh = c0.h - dy;
          ny = c0.y + dy;
        }
        if (rw && rh) {
          if (mode.includes("e") || mode.includes("w")) nh = (nw * rh) / rw;
          else nw = (nh * rw) / rh;
          if (mode.includes("n")) ny = c0.y + (c0.h - nh);
          if (mode.includes("w")) nx = c0.x + (c0.w - nw);
        }
        c = { x: nx, y: ny, w: nw, h: nh };
      }
      crop.current = c;
      clampCrop();
      applyRatio();
      positionBox();
      updatePreview();
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      dragCleanup.current = null;
    };
    dragCleanup.current?.();
    dragCleanup.current = up;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const changeRatio = (r: Ratio) => {
    ratioRef.current = r;
    setRatio(r);
    applyRatio();
    positionBox();
    updatePreview();
  };

  const save = async () => {
    if (busy || picking) return;
    setBusy(true);
    setErr("");
    try {
      const canvas = document.createElement("canvas");
      if (!paintCrop(canvas)) throw new Error(badImage);
      let dataUrl: string;
      try {
        dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      } catch {
        throw new Error(badImage);
      }
      await onSave(dataUrl);
    } catch (error) {
      setErr(String(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalLayer open={active} z={92} onBackdrop={close}>
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog" aria-modal="true" aria-label={t("ui.crop.title")}
        className="w-full max-w-[860px] max-h-[86vh] flex flex-col overflow-hidden rounded-[var(--r)] bg-[var(--surface)] p-5 shadow-[0_20px_60px_var(--scrim)] outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 mb-1">
          <h3 className="m-0 text-[16px] font-semibold">{t("ui.crop.title")}</h3>
        </div>
        <p className="m-0 mb-3 shrink-0 text-[12.5px] text-[var(--ink-muted)]">
          {t("ui.crop.lead", { v0: name })}
        </p>

        <div className="min-h-0 overflow-y-auto">
          {!img ? (
            <div className="flex flex-col items-start gap-3 py-8">
              <span className="text-[12.5px] text-[var(--meta)]">{t("ui.crop.pickHint")}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[820px]:grid-cols-[minmax(0,1fr)_minmax(220px,300px)]">
              <div>
                <div
                  ref={wrapRef}
                  className="relative w-full rounded-lg overflow-hidden bg-[var(--group)] touch-none select-none"
                >
                  <canvas
                    ref={canvasRef}
                    onPointerDown={onCanvasPointerDown}
                    className="block w-full h-auto cursor-grab"
                  />
                  <div
                    ref={boxRef}
                    onPointerDown={onBoxPointerDown}
                    className="absolute border-2 border-[var(--accent)] shadow-[0_0_0_9999px_color-mix(in_srgb,var(--surface)_65%,transparent)] cursor-move"
                  >
                    <div className="absolute left-0 right-0 top-1/3 h-px bg-[color-mix(in_srgb,var(--surface)_55%,transparent)]" />
                    <div className="absolute left-0 right-0 top-2/3 h-px bg-[color-mix(in_srgb,var(--surface)_55%,transparent)]" />
                    <div className="absolute top-0 bottom-0 left-1/3 w-px bg-[color-mix(in_srgb,var(--surface)_55%,transparent)]" />
                    <div className="absolute top-0 bottom-0 left-2/3 w-px bg-[color-mix(in_srgb,var(--surface)_55%,transparent)]" />
                    {[
                      ["nw", "-top-[7px] -left-[7px] cursor-nwse-resize"],
                      ["n", "-top-[7px] left-1/2 -translate-x-1/2 cursor-ns-resize"],
                      ["ne", "-top-[7px] -right-[7px] cursor-nesw-resize"],
                      ["e", "top-1/2 -right-[7px] -translate-y-1/2 cursor-ew-resize"],
                      ["se", "-bottom-[7px] -right-[7px] cursor-nwse-resize"],
                      ["s", "-bottom-[7px] left-1/2 -translate-x-1/2 cursor-ns-resize"],
                      ["sw", "-bottom-[7px] -left-[7px] cursor-nesw-resize"],
                      ["w", "top-1/2 -left-[7px] -translate-y-1/2 cursor-ew-resize"],
                    ].map(([h, cls]) => (
                      <span
                        key={h}
                        data-h={h}
                        className={`absolute w-3 h-3 bg-[var(--surface)] border border-[var(--accent)] rounded-[3px] ${cls}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Btn disabled={busy || picking} onClick={() => zoomAt(1.3, (canvasRef.current?.width || 0) / 2, (canvasRef.current?.height || 0) / 2)}>
                      {t("ui.crop.zoomIn")}
                    </Btn>
                    <Btn disabled={busy || picking} onClick={() => zoomAt(1 / 1.3, (canvasRef.current?.width || 0) / 2, (canvasRef.current?.height || 0) / 2)}>
                      {t("ui.crop.zoomOut")}
                    </Btn>
                    <Btn disabled={busy || picking} onClick={fitCanvas}>{t("ui.crop.fit")}</Btn>
                    <Btn disabled={busy || picking}
                      onClick={() => {
                        tf.current = { scale: 1, ox: 0, oy: 0 };
                        draw();
                        positionBox();
                      }}
                    >
                      {t("ui.crop.zoom100")}
                    </Btn>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[12.5px] text-[var(--meta)]">
                      {t("ui.crop.ratioLabel")}
                    </span>
                    {(["4:3", "1:1", "free"] as Ratio[]).map((r) => (
                      <Btn disabled={busy || picking} key={r} on={ratio === r} onClick={() => changeRatio(r)}>
                        {r === "free" ? t("ui.crop.free") : r}
                      </Btn>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="rounded-[var(--rs)] shadow-[inset_0_0_0_1px_var(--line)] p-2.5">
                  <div className="text-[12.5px] text-[var(--meta)] mb-1.5">
                    {t("ui.crop.previewAfter")}
                  </div>
                  <div className="aspect-[4/3] rounded-md overflow-hidden bg-[color-mix(in_srgb,var(--ink)_7%,transparent)]">
                    <canvas ref={previewCanvas} className="block w-full h-full object-contain" />
                  </div>
                  {outputSize ? (
                    <div className="text-[11.5px] text-[var(--meta)] mt-1.5">{t("ui.crop.previewNote", { v0: outputSize })}</div>
                  ) : null}
                </div>
                <div className="rounded-[var(--rs)] shadow-[inset_0_0_0_1px_var(--line)] p-2.5">
                  <div className="text-[12.5px] text-[var(--meta)] mb-1.5">
                    {t("ui.crop.previewBefore")}
                  </div>
                  <div className="aspect-[4/3] rounded-md overflow-hidden bg-[color-mix(in_srgb,var(--ink)_7%,transparent)]">
                    <img src={img.src} alt="" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {err ? (
            <p role="alert" className="mt-3 mb-0 text-[12.5px] text-[var(--danger-text)] break-all">{err}</p>
          ) : null}

        </div>
        <div className="mt-4 flex shrink-0 flex-wrap items-center justify-end gap-2.5">
          <Btn disabled={busy || picking} onClick={close}>{t("ui.common.cancel")}</Btn>
          <Btn primary={!img} disabled={busy} busy={picking} onClick={() => void openPicker()}>
            {t(img ? "ui.crop.repick" : "ui.crop.pick")}
          </Btn>
          {img ? (
            <Btn primary busy={busy} disabled={picking} onClick={() => void save()}>
              {t("ui.crop.save")}
            </Btn>
          ) : null}
        </div>
      </div>
    </ModalLayer>
  );
}
