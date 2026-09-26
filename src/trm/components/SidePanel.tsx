import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useI18n } from "../i18n";
import { Icon } from "./Icon";

/** 面板尺寸与开合记在本机的键前缀。 */
const KEY = "trm.ui.panel.";

type Saved = { w: number; open: boolean };

function read(key: string): Partial<Saved> {
  try {
    return (JSON.parse(localStorage.getItem(KEY + key) ?? "null") as Saved | null) ?? {};
  } catch {
    return {};
  }
}

export type PanelState = ReturnType<typeof useSidePanel>;

/**
 * 一侧可伸缩的面板：拖动内侧边缘改宽度（底部面板改高度），可整体收起。尺寸与开合按 key
 * 记在本机，下次打开还是原样。尺寸统一记作 width，底部面板里它就是高度。
 */
export function useSidePanel(key: string, { def, min, max }: { def: number; min: number; max: number }) {
  const saved = read(key);
  const clamp = (w: number) => Math.min(max, Math.max(min, w));
  const [width, setWidth] = useState(clamp(saved.w ?? def));
  const [open, setOpen] = useState(saved.open ?? true);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(KEY + key, JSON.stringify({ w: width, open }));
    } catch {
      /* 存不下就只在本次有效 */
    }
  }, [key, width, open]);
  return { width, open, setOpen, toggle: () => setOpen((o) => !o), dragging, setDragging, setWidth: (w: number) => setWidth(clamp(w)) };
}

/**
 * 面板本体。side 指它贴在内容区的哪一侧，拖柄在朝向内容区的那条边上。
 * 左右两侧改的是宽，底部改的是高；收起时宽或高收到 rest（默认 0），
 * 底部面板一般留出自己的标题行，收起后仍能看到并点开。
 */
export function SidePanel({ panel, side, children, className = "", label, rest = 0, fill = false }: { panel: PanelState; side: "left" | "right" | "bottom"; children: ReactNode; className?: string; label: string; rest?: number; fill?: boolean }) {
  const start = useRef<{ p: number; size: number } | null>(null);
  const vertical = side === "bottom";
  const at = (e: PointerEvent<HTMLDivElement>) => (vertical ? e.clientY : e.clientX);
  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { p: at(e), size: panel.width };
    panel.setDragging(true);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const d = at(e) - start.current.p;
    panel.setWidth(start.current.size + (side === "left" ? d : -d));
  };
  const up = () => {
    start.current = null;
    panel.setDragging(false);
  };
  // fill：占满所在的一侧，比如软件交给独立窗口后，底部的能力面板升上来占满
  const size = fill ? "100%" : panel.open ? panel.width : rest;
  const dim = vertical ? "height" : "width";
  return (
    <div className={`relative flex-none ${vertical ? "w-full" : "h-full"}`} style={{ [dim]: size, transition: panel.dragging ? "none" : `${dim} 480ms var(--spring-settle)` }}>
      <div className={`${vertical ? "w-full h-full" : "h-full"} overflow-hidden flex ${side === "right" ? "justify-end" : ""} ${vertical ? "items-start" : ""}`}>
        <div
          inert={!panel.open && !rest}
          aria-label={label}
          className={`${vertical ? "w-full" : "h-full"} flex-none ${className}`}
          style={{ [dim]: fill ? "100%" : panel.width, opacity: panel.open || rest || fill ? 1 : 0, transition: "opacity 220ms var(--ease-soft)" }}
        >
          {children}
        </div>
      </div>
      {panel.open && !fill ? (
        <div
          role="separator"
          aria-orientation={vertical ? "horizontal" : "vertical"}
          aria-label={label}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className={`group absolute z-[2] touch-none ${vertical ? "left-0 right-0 h-3 -top-1.5 cursor-row-resize" : `top-0 bottom-0 w-3 cursor-col-resize ${side === "right" ? "-left-1.5" : "-right-1.5"}`}`}
        >
          <span className={`absolute transition-colors duration-200 ${vertical ? "left-2 right-2 top-1/2 h-px" : "top-2 bottom-2 left-1/2 w-px"} ${panel.dragging ? "bg-[var(--focus-line)]" : "bg-transparent group-hover:bg-[var(--line)]"}`} />
        </div>
      ) : null}
    </div>
  );
}

/** 页头上开合一侧面板的按钮。 */
export function PanelToggle({ panel, label, flip = false }: { panel: PanelState; label: string; flip?: boolean }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={panel.toggle}
      aria-pressed={panel.open}
      aria-label={t(panel.open ? "ui.panel.hide" : "ui.panel.show", { name: label })}
      title={t(panel.open ? "ui.panel.hide" : "ui.panel.show", { name: label })}
      className={`w-8 h-8 grid place-items-center rounded-[var(--rs)] border-0 bg-transparent cursor-pointer transition-colors ${panel.open ? "text-[var(--ink)]" : "text-[var(--meta)]"} hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]`}
    >
      <Icon name="sidebar" size={16} className={flip ? "-scale-x-100" : ""} />
    </button>
  );
}
