/**
 * 浮层：居中弹窗与右侧抽屉。打开有入场，关掉先放完收起的动画再卸下，
 * 不凭空出现、也不凭空消失。
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useModalKeys } from "../hooks/useModalKeys";

/** 浮层收起的时长，与 index.css 里 .pop-out、.fade-out、.drawer-out、.menu-out 一致。 */
export const OUT_MS = 200;

/**
 * 让浮层有退场：关掉后再挂一小会儿，放完收起的动画才卸下。
 * 返回 mounted（要不要渲染）与 leaving（正在收起）。
 */
export function usePresence(open: boolean, ms = OUT_MS) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), ms);
    return () => window.clearTimeout(t);
  }, [open, ms]);
  return { mounted: open || mounted, leaving: !open && mounted };
}

/** 记住最近一次不为空的值。浮层收起时内容还要照原样显示，不能跟着数据一起消失。 */
export function useLatest<T>(value: T | null | undefined): T | null | undefined {
  const last = useRef(value);
  if (value !== null && value !== undefined) last.current = value;
  return value ?? last.current;
}

/** 居中弹窗。点遮罩或按 Esc 关闭。 */
export function Modal({ open, onClose, children, width = 560, label }: { open: boolean; onClose: () => void; children: ReactNode; width?: number; label: string }) {
  const { mounted, leaving } = usePresence(open);
  if (!mounted) return null;
  return createPortal(
    <ModalBody onClose={onClose} width={width} label={label} leaving={leaving}>
      {children}
    </ModalBody>,
    document.body,
  );
}

function ModalBody({ onClose, children, width, label, leaving }: { onClose: () => void; children: ReactNode; width: number; label: string; leaving: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useModalKeys(!leaving, ref, { onEscape: onClose });
  return (
    <div className={`fixed inset-0 z-40 grid place-items-center p-6 bg-[var(--scrim)] ${leaving ? "fade-out pointer-events-none" : "fade-in"}`} onPointerDown={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onPointerDown={(e) => e.stopPropagation()}
        className={`${leaving ? "pop-out" : "pop-in"} w-full max-h-[86vh] overflow-y-auto bg-[var(--surface)] rounded-[calc(var(--r)+4px)] shadow-[var(--pop-shadow)] outline-none`}
        style={{ maxWidth: width }}
      >
        {children}
      </div>
    </div>
  );
}

/** 右侧抽屉：看一件东西的详情，不离开当前页。 */
export function Drawer({ open, onClose, children, label, width = 460 }: { open: boolean; onClose: () => void; children: ReactNode; label: string; width?: number }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  const { mounted, leaving } = usePresence(open);
  if (!mounted) return null;
  return createPortal(
    <div className={`fixed inset-0 z-30 bg-[var(--scrim)] ${leaving ? "fade-out pointer-events-none" : "fade-in"}`} onPointerDown={onClose}>
      <aside
        role="dialog"
        aria-label={label}
        onPointerDown={(e) => e.stopPropagation()}
        className={`${leaving ? "drawer-out" : "drawer-in"} absolute right-0 top-0 bottom-0 bg-[var(--surface)] shadow-[var(--pop-shadow)] overflow-y-auto`}
        style={{ width: `min(${width}px, 92vw)` }}
      >
        {children}
      </aside>
    </div>,
    document.body,
  );
}
