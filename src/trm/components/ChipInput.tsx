import { useRef, useState } from "react";
import { Chip } from "./Chip";

export type ChipInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  disabled?: boolean;
  placeholder?: string;
  separators?: RegExp;
};

export function ChipInput({
  value, onChange, label, disabled = false, placeholder, separators = /[,，]/,
}: ChipInputProps) {
  const [draft, setDraft] = useState("");
  const composing = useRef(false);
  // Global and sticky expressions must not carry lastIndex between keystrokes.
  const separator = new RegExp(separators.source, separators.flags.replace(/[gy]/g, ""));
  const add = (text: string) => {
    if (disabled) return;
    const chips = text.split(separator).map((chip) => chip.trim()).filter(Boolean);
    const next = [...new Set([...value, ...chips])];
    if (next.length !== value.length) onChange(next);
    setDraft("");
  };
  return (
    <div className="trm-chip-input" data-disabled={disabled || undefined}>
      {value.map((chip, index) => (
        <Chip key={chip} disabled={disabled}
          onRemove={() => onChange(value.filter((_, i) => i !== index))}>{chip}</Chip>
      ))}
      <input
        aria-label={label}
        disabled={disabled}
        placeholder={placeholder}
        value={draft}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={(e) => {
          composing.current = false;
          const text = e.currentTarget.value;
          if (separator.test(text)) add(text);
          else setDraft(text);
        }}
        onChange={(e) => {
          const text = e.target.value;
          if (!composing.current && !(e.nativeEvent as InputEvent).isComposing && separator.test(text)) add(text);
          else setDraft(text);
        }}
        onBlur={(e) => {
          // Blur ends editing even if a platform omits the final composition event.
          composing.current = false;
          add(e.currentTarget.value);
        }}
        onKeyDown={(e) => {
          if (disabled || composing.current || e.nativeEvent.isComposing || e.keyCode === 229) return;
          if (e.key === "Enter" || (e.key.length === 1 && separator.test(e.key))) {
            e.preventDefault();
            e.stopPropagation();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            e.preventDefault();
            onChange(value.slice(0, -1));
          }
        }}
      />
    </div>
  );
}
