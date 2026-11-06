import { ComposerInput } from "./ComposerInput";
import { Icon } from "./Icon";
import { Btn } from "./ui";

export type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  sendLabel: string;
  ariaLabel?: string;
  disabled?: boolean;
  sending?: boolean;
  maxHeight?: number;
  className?: string;
};

/** Keep drafts and send results with the caller so changing conversations cannot lose a reply. */
export function ChatComposer({
  value, onChange, onSend, placeholder, sendLabel, ariaLabel, disabled = false, sending = false,
  maxHeight = 200, className = "",
}: ChatComposerProps) {
  const canSend = !disabled && !sending && Boolean(value.trim());
  const send = () => { if (canSend) onSend(); };
  return <div className={`trm-chat-composer ${className}`} aria-busy={sending || undefined}>
    <ComposerInput className="trm-input trm-chat-composer-input" value={value}
      onChange={event => onChange(event.target.value)} onSubmit={send} canSubmit={canSend}
      disabled={disabled || sending} maxHeight={maxHeight} placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder} />
    <Btn primary disabled={!canSend} busy={sending} ariaLabel={sendLabel} onClick={send}
      className="inline-flex flex-none items-center justify-center">
      <Icon name="send" size={16} />
    </Btn>
  </div>;
}
