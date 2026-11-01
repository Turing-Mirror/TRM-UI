import { useLayoutEffect, useRef, type Ref, type TextareaHTMLAttributes } from "react";

export type ComposerInputProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue"> & {
  value: string;
  ref?: Ref<HTMLTextAreaElement>;
  maxHeight?: number;
  minHeight?: number;
  onHeightChange?: (height: number) => void;
  onSubmit?: () => void;
  canSubmit?: boolean;
};

/** Controlled multiline input. The caller owns the draft, layout, labels and submit action. */
export function ComposerInput({ value, ref, maxHeight = 200, minHeight = 0, onHeightChange, onSubmit, canSubmit = true, onKeyDown, rows = 1, ...props }: ComposerInputProps) {
  const area = useRef<HTMLTextAreaElement | null>(null);
  const heightChanged = useRef(onHeightChange);
  useLayoutEffect(() => { heightChanged.current = onHeightChange; });
  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    const fit = () => {
      el.style.height = "auto";
      const style = getComputedStyle(el);
      const border = (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0);
      const padding = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
      const measured = el.scrollHeight + (style.boxSizing === "border-box" ? border : -padding);
      const height = Math.max(minHeight, Math.min(maxHeight, measured));
      el.style.height = height + "px";
      heightChanged.current?.(height);
    };
    fit();
    let width = el.clientWidth;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      fit();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, maxHeight, minHeight]);
  return <textarea {...props} ref={(el) => {
    area.current = el;
    if (typeof ref === "function") return ref(el);
    if (ref) ref.current = el;
  }} value={value} rows={rows} onKeyDown={(e) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || !onSubmit || e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return;
    e.preventDefault();
    if (canSubmit && !props.disabled && !props.readOnly) onSubmit();
  }} />;
}
