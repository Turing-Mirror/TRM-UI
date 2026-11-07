import type { ReactNode } from "react";
import { ComposerInput } from "./ComposerInput";
import { Icon } from "./Icon";

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
  state?: ReactNode;
  className?: string;
};

/** Keep drafts and send results with the caller so changing conversations cannot lose a reply. */
export function ChatComposer({
  value, onChange, onSend, placeholder, sendLabel, ariaLabel, disabled = false, sending = false,
  maxHeight = 200, state, className = "",
}: ChatComposerProps) {
  const canSend = !disabled && !sending && Boolean(value.trim());
  const send = () => { if (canSend) onSend(); };
  return <div className={`trm-chat-composer ${className}`} aria-busy={sending || undefined}>
    {state}
    <div className="trm-chat-composer-field">
      <ComposerInput className="trm-chat-composer-input" value={value}
        onChange={event => onChange(event.target.value)} onSubmit={send} canSubmit={canSend}
        disabled={disabled || sending} minHeight={32} maxHeight={maxHeight} placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder} />
      <button type="button" disabled={!canSend} aria-busy={sending || undefined}
        aria-label={sendLabel} onClick={send} className="trm-chat-composer-send">
        {sending ? <span className="trm-chat-composer-spinner" aria-hidden /> : <Icon name="send" size={18} />}
      </button>
    </div>
  </div>;
}
