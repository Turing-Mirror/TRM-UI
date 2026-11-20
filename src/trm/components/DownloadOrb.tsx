import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { t } from "../i18n";
import { useModalKeys } from "../hooks/useModalKeys";
import { useSnapDrag, type SnapPos } from "../lib/snapDrag";
import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";
import { FLOW_MS } from "./motion";
import { usePresence } from "./overlay";

export type OrbAttention = "idle" | "ready" | "error";

const ORB_SIZE = 48;
const ORB_MARGIN = 20;
const ORB_STEP = 58;
const ORB_RADIUS = 24;
const CARD_RADIUS = 14;
const RING_R = 20;
const RING_CIRC = 2 * Math.PI * RING_R;

type Box = { left: number; top: number; width: number; height: number; radius: number };

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clampArea(el: HTMLElement | null, contained: boolean): { w: number; h: number } {
  if (contained && el) {
    return { w: el.clientWidth, h: el.clientHeight };
  }
  if (typeof window === "undefined") return { w: 0, h: 0 };
  return { w: window.innerWidth, h: window.innerHeight };
}

function defaultOrbRect(area: { w: number; h: number }, slot: number, pos?: SnapPos): Box {
  const left = pos
    ? (pos.side === "left" ? ORB_MARGIN + slot * ORB_STEP : Math.max(ORB_MARGIN, area.w - ORB_MARGIN - ORB_SIZE - slot * ORB_STEP))
    : ORB_MARGIN + slot * ORB_STEP;
  const bottom = pos ? Math.min(Math.max(ORB_MARGIN, pos.bottom), Math.max(ORB_MARGIN, area.h - ORB_SIZE - ORB_MARGIN)) : ORB_MARGIN;
  return {
    left: Math.min(left, Math.max(ORB_MARGIN, area.w - ORB_SIZE - ORB_MARGIN)),
    top: Math.max(ORB_MARGIN, area.h - bottom - ORB_SIZE),
    width: ORB_SIZE,
    height: ORB_SIZE,
    radius: ORB_RADIUS,
  };
}

function OrbRingFace({
  percent,
  attention = "idle",
}: {
  percent?: number;
  attention?: OrbAttention;
}) {
  const pct = percent === undefined ? undefined : Math.min(100, Math.max(0, percent));
  const showNumber = attention === "idle" && pct !== undefined && pct > 0;
  const dashOffset = pct === undefined ? 0 : RING_CIRC * (1 - pct / 100);
  const stroke = attention === "error" ? "var(--chip-danger-ink)" : "var(--accent)";

  return (
    <span className="relative grid h-full w-full place-items-center">
      <svg
        width={ORB_SIZE}
        height={ORB_SIZE}
        viewBox={`0 0 ${ORB_SIZE} ${ORB_SIZE}`}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <circle
          cx={ORB_SIZE / 2}
          cy={ORB_SIZE / 2}
          r={RING_R}
          fill="none"
          stroke="color-mix(in srgb, var(--ink) 10%, transparent)"
          strokeWidth={2.5}
        />
        {attention === "idle" && pct === undefined ? (
          <circle
            cx={ORB_SIZE / 2}
            cy={ORB_SIZE / 2}
            r={RING_R}
            fill="none"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="36 90"
            className="trm-orb-spin"
          />
        ) : (
          <circle
            cx={ORB_SIZE / 2}
            cy={ORB_SIZE / 2}
            r={RING_R}
            fill="none"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={attention !== "idle" ? 0 : dashOffset}
            transform={`rotate(-90 ${ORB_SIZE / 2} ${ORB_SIZE / 2})`}
            className="trm-orb-arc"
          />
        )}
      </svg>

      {attention === "error" ? (
        <span className="grid place-items-center text-[var(--chip-danger-ink)]">
          <Icon name="alert" size={18} />
        </span>
      ) : showNumber ? (
        <span className="text-[11.5px] font-semibold tabular-nums text-[var(--ink)]">
          {pct >= 100 ? "100%" : `${Math.min(99, Math.round(pct))}%`}
        </span>
      ) : (
        <span className="grid place-items-center text-[var(--accent)]">
          <Icon name="download" size={18} />
        </span>
      )}

      {attention === "ready" ? (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--notify)] animate-[pulse_2.4s_var(--ease)_infinite]"
        />
      ) : attention === "error" ? (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--chip-danger-ink)]"
        />
      ) : null}
    </span>
  );
}

function useHostArea(active: boolean, hostRef: React.RefObject<HTMLDivElement | null>, contained: boolean) {
  const [area, setArea] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  useLayoutEffect(() => {
    if (!active) return;
    const measure = () => setArea(clampArea(hostRef.current, contained));
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const target = contained ? hostRef.current : document.documentElement;
    if (!target) return;
    const ro = new ResizeObserver(measure);
    ro.observe(target);
    return () => ro.disconnect();
  }, [active, hostRef, contained]);
  return area;
}

function useCornerOrb({
  area,
  slot,
  draggable,
}: {
  area: { w: number; h: number };
  slot: number;
  draggable: boolean;
}) {
  const [pos, setPos] = useState<SnapPos>({ side: "left", bottom: ORB_MARGIN });
  const usableW = Math.max(ORB_SIZE, area.w - ORB_MARGIN * 2);
  const usableH = Math.max(ORB_SIZE, area.h);
  const snap = useSnapDrag({
    size: ORB_SIZE,
    area: { w: usableW, h: usableH },
    pos: {
      side: pos.side,
      bottom: Math.min(Math.max(ORB_MARGIN, pos.bottom), Math.max(ORB_MARGIN, usableH - ORB_SIZE - ORB_MARGIN)),
    },
    onDrop: (next) =>
      setPos({
        side: next.side,
        bottom: Math.min(Math.max(ORB_MARGIN, next.bottom), Math.max(ORB_MARGIN, usableH - ORB_SIZE - ORB_MARGIN)),
      }),
  });

  const hasArea = area.w > 0 && area.h > 0;
  const rawLeft = hasArea
    ? ORB_MARGIN + (pos.side === "left" ? slot * ORB_STEP : -slot * ORB_STEP) + (draggable ? snap.at.x : defaultOrbRect(area, slot, pos).left - ORB_MARGIN)
    : ORB_MARGIN + slot * ORB_STEP;
  const clampedLeft = hasArea ? Math.min(Math.max(ORB_MARGIN, rawLeft), Math.max(ORB_MARGIN, area.w - ORB_SIZE - ORB_MARGIN)) : ORB_MARGIN + slot * ORB_STEP;
  const style: CSSProperties = hasArea
    ? { left: clampedLeft, top: draggable ? snap.at.y : defaultOrbRect(area, slot, pos).top }
    : { left: clampedLeft, bottom: ORB_MARGIN };

  return { pos, snap, style };
}

function CornerOrbButton({
  buttonRef,
  label,
  tooltip,
  percent,
  attention = "idle",
  onClick,
  leaving = false,
  animateIn = false,
  draggable,
  orb,
}: {
  buttonRef?: Ref<HTMLButtonElement>;
  label?: string;
  tooltip?: string;
  percent?: number;
  attention?: OrbAttention;
  onClick: () => void;
  leaving?: boolean;
  animateIn?: boolean;
  draggable: boolean;
  orb: ReturnType<typeof useCornerOrb>;
}) {
  const { snap, style } = orb;
  const button = (
    <button
      ref={buttonRef}
      type="button"
      data-dragging={draggable && snap.dragging ? "" : undefined}
      aria-label={label || t("ui.download.expand")}
      onClick={() => {
        if (draggable && snap.wasDrag()) return;
        onClick();
      }}
      {...(draggable ? snap.handlers : {})}
      className={[
        "trm-orb h-12 w-12 rounded-full border-0 bg-[var(--surface)] p-0",
        "shadow-[var(--glass),0_0_0_1px_var(--hairline)] outline-none",
        leaving ? "trm-orb-out pointer-events-none" : animateIn ? "trm-orb-in" : "",
      ].join(" ")}
    >
      <OrbRingFace percent={percent} attention={attention} />
    </button>
  );

  return (
    <div style={style} className="pointer-events-auto absolute h-12 w-12">
      {tooltip ? (
        <Tooltip
          text={tooltip}
          disabled={draggable && snap.dragging}
          triggerClassName="block h-12 w-12"
        >
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </div>
  );
}

export type ProgressOrbProps = {
  open: boolean;
  label?: string;
  tooltip?: string;
  percent?: number;
  attention?: OrbAttention;
  onClick: () => void;
  contained?: boolean;
  z?: number;
  slot?: number;
  draggable?: boolean;
};

/**
 * 角落里的圆形后台进度球。默认停在左下角，可拖到两侧任意高度，松手贴边。
 */
export function ProgressOrb({
  open,
  label,
  tooltip,
  percent,
  attention = "idle",
  onClick,
  contained = true,
  z = 50,
  slot = 0,
  draggable = true,
}: ProgressOrbProps) {
  const { mounted, leaving } = usePresence(open);
  const hostRef = useRef<HTMLDivElement>(null);
  const area = useHostArea(mounted, hostRef, contained);
  const orb = useCornerOrb({ area, slot, draggable });

  if (!mounted) return null;

  const layer = (
    <div
      ref={hostRef}
      className={`${contained ? "absolute" : "fixed"} inset-0 pointer-events-none`}
      style={{ zIndex: z }}
    >
      <CornerOrbButton
        label={label}
        tooltip={tooltip}
        percent={percent}
        attention={attention}
        onClick={onClick}
        leaving={leaving}
        animateIn
        draggable={draggable}
        orb={orb}
      />
    </div>
  );

  return contained ? layer : createPortal(layer, document.body);
}

export type DockableModalProps = {
  open: boolean;
  minimized: boolean;
  onMinimizedChange?: (minimized: boolean) => void;
  /** Allow backdrop click and Escape to minimize to the corner orb. */
  canMinimize?: boolean;
  /** Optional explicit dismiss callback when not busy and backdrop/Esc closes the dialog. */
  onClose?: () => void;
  maxWidth?: number;
  contained?: boolean;
  z?: number;
  label: string;
  orbLabel?: string;
  percent?: number;
  attention?: OrbAttention;
  tooltip?: string;
  slot?: number;
  draggable?: boolean;
  children: ReactNode;
};

type MorphMode = "open" | "docking" | "docked" | "expanding";

/**
 * 居中弹窗与左下角进度小球一体切换组件：
 * 收起到后台时沿着 --ease-nav 曲线从屏幕中心平滑缩成左下角圆球，点击圆球原路展开。
 */
export function DockableModal({
  open,
  minimized,
  onMinimizedChange,
  canMinimize = false,
  onClose,
  maxWidth = 520,
  contained = true,
  z = 50,
  label,
  orbLabel,
  percent,
  attention = "idle",
  tooltip,
  slot = 0,
  draggable = true,
  children,
}: DockableModalProps) {
  const { mounted, leaving } = usePresence(open);
  const hostRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const orbBtnRef = useRef<HTMLButtonElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<MorphMode>(minimized ? "docked" : "open");
  const prevMin = useRef(minimized);
  const [box, setBox] = useState<Box | null>(null);
  const [morphActive, setMorphActive] = useState(false);
  const lastCardSize = useRef<{ width: number; height: number }>({ width: maxWidth, height: 240 });
  const timerRef = useRef<number | null>(null);

  const area = useHostArea(mounted, hostRef, contained);
  const orb = useCornerOrb({ area, slot, draggable });

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const dismissOrMinimize = useCallback(() => {
    if (canMinimize && onMinimizedChange) {
      onMinimizedChange(true);
    } else if (onClose) {
      onClose();
    }
  }, [canMinimize, onMinimizedChange, onClose]);

  useModalKeys(open && !minimized && !leaving && (canMinimize || Boolean(onClose)), cardRef, {
    onEscape: dismissOrMinimize,
  });

  useLayoutEffect(() => {
    if (!open) {
      clearTimer();
      setMorphActive(false);
      setBox(null);
      setMode(minimized ? "docked" : "open");
      prevMin.current = minimized;
      return;
    }
    if (prevMin.current === minimized) return;
    prevMin.current = minimized;

    const host = hostRef.current;
    const hostRect = host?.getBoundingClientRect();
    const curArea = clampArea(host, contained);
    const hasArea = curArea.w > 0 && curArea.h > 0 && !reducedMotion();

    if (minimized) {
      const cardRect = cardRef.current?.getBoundingClientRect();
      if (!hasArea || !cardRect || !hostRect || cardRect.width <= 0 || cardRect.height <= 0) {
        setMode("docked");
        setMorphActive(false);
        setBox(null);
        return;
      }
      lastCardSize.current = { width: cardRect.width, height: cardRect.height };
      const fromBox: Box = {
        left: cardRect.left - hostRect.left,
        top: cardRect.top - hostRect.top,
        width: cardRect.width,
        height: cardRect.height,
        radius: CARD_RADIUS,
      };
      const toBox = defaultOrbRect(curArea, slot, orb.pos);
      clearTimer();
      setMode("docking");
      setMorphActive(false);
      setBox(fromBox);
      const raf = window.requestAnimationFrame(() => {
        void shellRef.current?.offsetWidth;
        setMorphActive(true);
        setBox(toBox);
      });
      timerRef.current = window.setTimeout(() => {
        setMorphActive(false);
        setBox(null);
        setMode("docked");
      }, FLOW_MS + 40);
      return () => window.cancelAnimationFrame(raf);
    }

    const orbRect = orbBtnRef.current?.getBoundingClientRect();
    const probeRect = probeRef.current?.getBoundingClientRect();
    if (!hasArea || !orbRect || !hostRect || orbRect.width <= 0) {
      setMode("open");
      setMorphActive(false);
      setBox(null);
      return;
    }
    const targetW = probeRect && probeRect.width > 0 ? probeRect.width : Math.min(maxWidth, curArea.w - 48);
    const targetH = probeRect && probeRect.height > 0 ? probeRect.height : lastCardSize.current.height;
    const fromBox: Box = {
      left: orbRect.left - hostRect.left,
      top: orbRect.top - hostRect.top,
      width: ORB_SIZE,
      height: ORB_SIZE,
      radius: ORB_RADIUS,
    };
    const toBox: Box = {
      left: Math.max(24, (curArea.w - targetW) / 2),
      top: Math.max(24, (curArea.h - targetH) / 2),
      width: targetW,
      height: targetH,
      radius: CARD_RADIUS,
    };
    clearTimer();
    setMode("expanding");
    setMorphActive(false);
    setBox(fromBox);
    const raf = window.requestAnimationFrame(() => {
      void shellRef.current?.offsetWidth;
      setMorphActive(true);
      setBox(toBox);
    });
    timerRef.current = window.setTimeout(() => {
      setMorphActive(false);
      setBox(null);
      setMode("open");
    }, FLOW_MS + 40);
    return () => window.cancelAnimationFrame(raf);
  }, [open, minimized, contained, slot, orb.pos, maxWidth, clearTimer]);

  if (!mounted) return null;

  const isMorphing = mode === "docking" || mode === "expanding";
  const scrimVisible = (mode === "open" || (mode === "expanding" && morphActive)) && !leaving;

  const layer = (
    <div
      ref={hostRef}
      className={`${contained ? "absolute" : "fixed"} inset-0 pointer-events-none`}
      style={{ zIndex: z }}
    >
      {/* Hidden probe measures the expanded card height before morphing back up from the orb. */}
      {mode === "docked" ? (
        <div className="pointer-events-none invisible absolute inset-0 grid place-items-center p-6" aria-hidden>
          <div ref={probeRef} className="w-full" style={{ maxWidth }}>
            {children}
          </div>
        </div>
      ) : null}

      {mode !== "docked" ? (
        <div
          className={[
            "trm-dock-scrim absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_28%,transparent)]",
            scrimVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          ].join(" ")}
          onClick={leaving ? undefined : (canMinimize || onClose ? dismissOrMinimize : undefined)}
        />
      ) : null}

      {mode === "open" ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center p-6">
          <div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className={[
              "pointer-events-auto w-full rounded-[var(--r)] bg-[var(--surface)] shadow-[0_22px_56px_-18px_var(--scrim)] outline-none",
              leaving ? "fade-out pointer-events-none" : "",
            ].join(" ")}
            style={{ maxWidth }}
          >
            {children}
          </div>
        </div>
      ) : null}

      {isMorphing && box ? (
        <div
          ref={shellRef}
          className={[
            "pointer-events-none absolute overflow-hidden bg-[var(--surface)]",
            morphActive ? "trm-dock-morph" : "",
            mode === "docking" && morphActive
              ? "shadow-[var(--glass),0_0_0_1px_var(--hairline)]"
              : "shadow-[0_22px_56px_-18px_var(--scrim)]",
          ].join(" ")}
          style={{
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            borderRadius: box.radius,
          }}
        >
          <div className={mode === "docking" ? "trm-dock-face-out" : "trm-dock-face-in"}>
            {children}
          </div>
          <div
            className={[
              "absolute inset-0 grid place-items-center",
              mode === "docking" ? "trm-dock-face-in" : "trm-dock-face-out",
            ].join(" ")}
          >
            <div className="h-12 w-12">
              <OrbRingFace percent={percent} attention={attention} />
            </div>
          </div>
        </div>
      ) : null}

      {mode === "docked" ? (
        <CornerOrbButton
          buttonRef={orbBtnRef}
          label={orbLabel}
          tooltip={tooltip}
          percent={percent}
          attention={attention}
          onClick={() => onMinimizedChange?.(false)}
          leaving={leaving}
          draggable={draggable}
          orb={orb}
        />
      ) : null}
    </div>
  );

  return contained ? layer : createPortal(layer, document.body);
}
