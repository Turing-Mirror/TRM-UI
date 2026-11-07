import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { Roll } from "./motion";

export type ChatStateProps = {
  label: string;
  tone?: "assistant" | "human";
  icon?: ReactNode;
  action?: ReactNode;
};

/** Keep ownership visible beside the draft, independent of the message history's scroll position. */
export function ChatState({ label, tone = "assistant", icon, action }: ChatStateProps) {
  return <div className="trm-chat-state" data-tone={tone}>
    <span className="trm-chat-state-icon" aria-hidden>{icon ?? <Icon name={tone === "assistant" ? "chip" : "user"}
      size={18} />}</span>
    <span className="trm-chat-state-label" role="status"><Roll value={label} /></span>
    {action != null ? <span className="trm-chat-state-action">{action}</span> : null}
  </div>;
}
