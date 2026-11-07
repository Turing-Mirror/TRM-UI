import { useLayoutEffect, useRef, type ReactNode } from "react";
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
  const bar = useRef<HTMLDivElement>(null);
  const actionSlot = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    // Reserve the action's width on both sides so a translated action cannot push the label off-center.
    const measure = () => bar.current?.style.setProperty("--chat-state-action-width", `${actionSlot.current?.offsetWidth ?? 0}px`);
    measure();
    const observer = new ResizeObserver(measure);
    if (actionSlot.current) observer.observe(actionSlot.current);
    return () => observer.disconnect();
  }, [action]);
  return <div ref={bar} className="trm-chat-state" data-tone={tone}>
    <span className="trm-chat-state-center">
    <span className="trm-chat-state-icon" aria-hidden>{icon ?? <Icon name={tone === "assistant" ? "chip" : "user"}
      size={18} />}</span>
    <span className="trm-chat-state-label" role="status"><Roll value={label} /></span>
    </span>
    {action != null ? <span ref={actionSlot} className="trm-chat-state-action">{action}</span> : null}
  </div>;
}
