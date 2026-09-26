/**
 * 录一个快捷键：点一下开始录，按下组合键就记下；Esc 取消，Backspace 清空。
 * 只按修饰键不算：按下 ⌘ 的那一刻就记下的话，永远录不出 ⌘K。
 */
import { useState, type KeyboardEvent } from "react";
import { useI18n } from "../i18n";
import { comboFromEvent, comboLabel } from "../lib/hotkeys";

export function HotkeyInput({ value, onChange, label }: { value: string; onChange: (combo: string) => void; label: string }) {
  const { t } = useI18n();
  const [recording, setRecording] = useState(false);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!recording) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === "Escape") return setRecording(false);
    if (e.key === "Backspace" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      setRecording(false);
      return onChange("");
    }
    const combo = comboFromEvent(e.nativeEvent);
    if (!combo) return;
    setRecording(false);
    onChange(combo);
  };
  return (
    <button
      type="button"
      data-hotkey-recorder
      aria-label={label}
      aria-pressed={recording}
      onClick={() => setRecording(true)}
      onBlur={() => setRecording(false)}
      onKeyDown={onKeyDown}
      className={[
        "min-w-[108px] h-8 px-3 rounded-[var(--rs)] border-0 cursor-pointer text-[12.5px] tabular-nums bg-transparent transition-[color,box-shadow] duration-200",
        recording
          ? "text-[var(--accent)] shadow-[inset_0_0_0_1px_var(--accent)]"
          : `${value ? "text-[var(--ink)]" : "text-[var(--meta)]"} shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1px_var(--focus-line)]`,
      ].join(" ")}
    >
      {recording ? t("ui.hotkey.press") : value ? comboLabel(value) : t("ui.hotkey.none")}
    </button>
  );
}
