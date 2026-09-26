/**
 * 可以拖动、松手贴向较近一侧的浮动按钮（比如角落里的对话气泡）。
 *
 * 位置记作「贴哪一边、离底边多远」，窗口改变大小时仍在同一侧同一高度。
 * 拖动时跟手、不走过渡；松手后由调用方把 dragging 置空，交给 CSS 过渡贴过去。
 * 挪动不到 slop 像素算点击；拖过之后紧接着的那一下 click 不算点开。
 */
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export type SnapPos = { side: "left" | "right"; bottom: number };

export function useSnapDrag({ size, area, pos, onDrop, slop = 5 }: { size: number; area: { w: number; h: number }; pos: SnapPos; onDrop: (p: SnapPos) => void; slop?: number }) {
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const from = useRef<{ px: number; py: number; x: number; y: number; moved: boolean; at?: { x: number; y: number } } | null>(null);
  const rest = { x: pos.side === "left" ? 0 : area.w - size, y: area.h - pos.bottom - size };
  const handlers = {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      from.current = { px: e.clientX, py: e.clientY, x: rest.x, y: rest.y, moved: false };
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      const d = from.current;
      if (!d) return;
      const dx = e.clientX - d.px;
      const dy = e.clientY - d.py;
      if (!d.moved && Math.hypot(dx, dy) < slop) return;
      if (!d.moved) e.currentTarget.setPointerCapture(e.pointerId);
      d.moved = true;
      d.at = { x: Math.min(Math.max(0, d.x + dx), area.w - size), y: Math.min(Math.max(0, d.y + dy), area.h - size) };
      setDrag(d.at);
    },
    onPointerUp: () => {
      const d = from.current;
      if (d) from.current = d.moved ? { ...d, px: NaN } : null;
      if (!d?.moved || !d.at) return;
      onDrop({ side: d.at.x + size / 2 < area.w / 2 ? "left" : "right", bottom: Math.round(area.h - d.at.y - size) });
      setDrag(null);
    },
  };
  /** 这次 click 是不是拖动之后的那一下。用过即清。 */
  const wasDrag = () => {
    const moved = Boolean(from.current?.moved);
    from.current = null;
    return moved;
  };
  return { at: drag ?? rest, dragging: Boolean(drag), handlers, wasDrag };
}
