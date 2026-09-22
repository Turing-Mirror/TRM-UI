import { useEffect, useRef, type RefObject } from "react";

const modalStack: { ref: RefObject<HTMLElement | null> }[] = [];
const focusSelector = 'button, input, select, textarea, a[href], area[href], summary, [contenteditable="true"], [tabindex]';
function available(el: HTMLElement): boolean {
  if (el.matches(':disabled, input[type="hidden"]') || el.closest('[hidden], [inert]')) return false;
  if (getComputedStyle(el).visibility === "hidden") return false;
  for (let p: HTMLElement | null = el; p; p = p.parentElement) {
    if (getComputedStyle(p).display === "none") return false;
  }
  return true;
}
function focusables(dlg: HTMLElement): HTMLElement[] {
  return Array.from(dlg.querySelectorAll<HTMLElement>(focusSelector))
    .filter(el => el.tabIndex >= 0 && available(el))
    .sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity));
}

/**
 * 弹层共用的一套键盘/焦点契约：打开时焦点收进弹层、Tab 在弹层里
 * 转圈、Escape 走「取消」语义、关掉时焦点还给打开前的控件。
 *
 * 确认、输入及自定义弹层使用同一套行为。动作语义归调用方。
 */
export function useModalKeys(
  open: boolean,
  dialogRef: RefObject<HTMLElement | null>,
  opts: {
    /** Escape 的取消语义（confirm = 否，prompt = 取消）。 */
    onEscape?: () => void;
    /**
     * 打开时优先聚焦的元素；缺省聚焦弹层里第一个可聚焦控件，
     * 再退到弹层本身。
     */
    focus?: () => HTMLElement | null | undefined;
  } = {},
): void {
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const token = { ref: dialogRef };
    modalStack.push(token);
    const isTop = () => {
      let top = modalStack[modalStack.length - 1];
      // React 先运行子级 effect：DOM 中更深的弹窗不能被父级抢走优先级。
      for (const entry of [...modalStack].reverse()) {
        if (entry !== top && entry.ref.current && top?.ref.current?.contains(entry.ref.current)) top = entry;
      }
      return top === token;
    };
    const el = document.activeElement;
    prevFocusRef.current = el instanceof HTMLElement ? el : null;
    // 等一帧再聚焦：弹层刚挂进 DOM，同步 focus 会被浏览器丢掉。
    const id = window.setTimeout(() => {
      const dlg = dialogRef.current;
      if (!dlg || !isTop()) return;
      const preferred = optsRef.current.focus?.();
      (preferred && dlg.contains(preferred) && available(preferred)
        ? preferred : focusables(dlg)[0] ?? dlg).focus();
    }, 0);
    const onKey = (e: KeyboardEvent) => {
      // 这按键已经回答过别的东西（比如弹窗输入框的 Enter 就地截停），
      // 或者还在 IME 组词 —— 都不算对弹层的回答。
      if (!isTop() || e.defaultPrevented || e.isComposing) return;
      if (e.key === "Escape") {
        // 长按不连关。
        if (e.repeat) return;
        e.preventDefault();
        optsRef.current.onEscape?.();
        return;
      }
      if (e.key !== "Tab") return;
      // 焦点圈在弹层里：遮罩后的页面不参与 Tab 序。
      const dlg = dialogRef.current;
      if (!dlg) return;
      const targets = focusables(dlg);
      if (!targets.length) {
        e.preventDefault();
        dlg.focus();
        return;
      }
      const first = targets[0];
      const last = targets[targets.length - 1];
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && targets.includes(active);
      if (!e.shiftKey && (!inside || active === last)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (!inside || active === first)) {
        e.preventDefault();
        last.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
      const wasTop = isTop();
      modalStack.splice(modalStack.indexOf(token), 1);
      if (wasTop && prevFocusRef.current?.isConnected) prevFocusRef.current.focus();
      prevFocusRef.current = null;
    };
  }, [open, dialogRef]);
}
