import { cloneElement, createContext, isValidElement, useContext, useEffect, useId, useRef, type AriaAttributes, type CSSProperties, type ReactNode } from "react";
import { HelpMark } from "./Tooltip";
import { Icon } from "./Icon";

export type RowGroupProps = { title?: string; note?: string; action?: ReactNode; children: ReactNode };
const RowGroupContext = createContext(false);

/** Settings cards deliberately have separators; the older Field/Group pattern remains unchanged. */
export function RowGroup({ title, note, action, children }: RowGroupProps) {
  const id = useId();
  const nested = useContext(RowGroupContext);
  const warned = useRef(false);
  useEffect(() => {
    if (import.meta.env.DEV && nested && !warned.current) {
      warned.current = true;
      console.warn("RowGroup must not nest. Use consecutive RowGroups under a plain section heading. The nested group is rendered flat.");
    }
  }, [nested]);
  const Heading = nested ? "h4" : "h3";
  return <RowGroupContext.Provider value={true}><section className={nested ? "trm-row-subgroup" : "trm-row-group"} aria-labelledby={title ? id : undefined}>
    {title || note || action ? <div className="trm-row-heading">
      <div>{title ? <Heading id={id}>{title}</Heading> : null}{note ? <p>{note}</p> : null}</div>
      {action ? <div className="trm-row-action">{action}</div> : null}
    </div> : null}
    {nested ? children : <div className="trm-row-card">{children}</div>}
  </section></RowGroupContext.Provider>;
}

export type RowProps = {
  title: string;
  desc?: string;
  tip?: string;
  control?: ReactNode;
  stacked?: boolean;
  onClick?: () => void;
  children?: ReactNode;
};

export function Row({ title, desc, tip, control, stacked = false, onClick, children }: RowProps) {
  const id = useId();
  const labelId = `${id}-title`;
  const descId = desc ? `${id}-desc` : undefined;
  const clickable = Boolean(onClick) && control == null;
  // Native controls can receive ARIA directly. Composite controls retain their own
  // labels and are enclosed in a labelled group; never assume they forward props.
  const labelledControl = isValidElement<AriaAttributes>(control) && typeof control.type === "string" && ["input", "select", "textarea", "button"].includes(control.type)
    ? cloneElement(control, {
      "aria-labelledby": control.props["aria-labelledby"] ?? (control.props["aria-label"] ? undefined : labelId),
      "aria-describedby": [control.props["aria-describedby"], descId].filter(Boolean).join(" ") || undefined,
    }) : control;
  const text = <span className="trm-row-text">
    <span id={labelId} className="trm-row-title">{title}{tip && !clickable ? <HelpMark title={tip} /> : null}</span>
    {desc ? <span id={descId} className="trm-row-desc">{desc}</span> : null}
  </span>;
  return <div className={`trm-row${stacked ? " trm-row-stacked" : ""}`}>
    {clickable ? <button type="button" className="trm-row-main trm-row-button" onClick={onClick} aria-labelledby={labelId} aria-describedby={descId} title={tip}>
      {text}<Icon name="chevron" size={16} />
    </button> : <div className="trm-row-main">
      {text}
      {control != null ? <div className="trm-row-control" role="group" aria-labelledby={labelId} aria-describedby={descId}>{labelledControl}</div> : null}
    </div>}
    {children != null ? <div className="trm-row-body">{children}</div> : null}
  </div>;
}

export type CenterPanelProps = { title: string; sub?: string; width?: CSSProperties["maxInlineSize"]; children: ReactNode; foot?: ReactNode };

/** In-flow workspace content, not a dialog. The parent supplies its workspace height. */
export function CenterPanel({ title, sub, width = 400, children, foot }: CenterPanelProps) {
  const id = useId();
  return <div className="trm-center-panel">
    <section className="trm-center-card" style={{ maxInlineSize: width }} aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {sub ? <p className="trm-center-sub">{sub}</p> : null}
      <div className="trm-center-content">{children}</div>
      {foot ? <div className="trm-center-foot">{foot}</div> : null}
    </section>
  </div>;
}
