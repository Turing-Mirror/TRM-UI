import {
  Children, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode,
} from "react";
import { useI18n } from "../i18n";
import { Icon } from "./Icon";
import { Collapse, Morph, Pane, Panes, Roll, Swap, stagger, useDir } from "./motion";

export type WorkbenchProps = {
  list: ReactNode;
  listHead?: ReactNode;
  detail: ReactNode;
  selected: string | null;
  /** Supply keys in list order, including unloaded/filtered keys when their order is known. */
  order: readonly string[];
  onBack: () => void;
  listWidth?: CSSProperties["width"];
  narrowAt?: number;
  empty?: ReactNode;
  className?: string;
};

function useNarrow(px: number) {
  const query = `(max-width: ${px}px)`;
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return narrow;
}

/** The caller owns selection and data; the workspace owns navigation and independent scroll areas. */
export function Workbench({
  list, listHead, detail, selected, order, onBack, listWidth, narrowAt = 900, empty, className = "",
}: WorkbenchProps) {
  const { t } = useI18n();
  const narrow = useNarrow(narrowAt);
  const dir = useDir(selected === null ? -1 : order.indexOf(selected));
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef(selected);
  const returnTo = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    // Query the rendered order so FlowList wrappers and collapsing rows do not create trailing lines.
    const rows = Array.from(root.current?.querySelectorAll<HTMLElement>(
      ".trm-workbench-list .trm-workbench-item",
    ) ?? []).filter(row => !row.closest('[data-phase="leave"]'));
    rows.forEach((row, i) => {
      row.toggleAttribute("data-divider", i < rows.length - 1);
      row.toggleAttribute("data-next-selected", rows[i + 1]?.getAttribute("aria-pressed") === "true");
    });
  });
  useLayoutEffect(() => {
    if (narrow && selected !== previous.current) {
      if (selected !== null && previous.current === null) {
        root.current?.querySelector<HTMLButtonElement>(".trm-workbench-back")?.focus();
      } else if (selected === null) {
        // The list stays mounted in Panes, so keyboard users return to their original row.
        if (returnTo.current?.isConnected && !returnTo.current.closest("[inert]")) returnTo.current.focus();
        else {
          const rows = root.current?.querySelectorAll<HTMLButtonElement>(".trm-workbench-item");
          Array.from(rows ?? []).find(row => !row.closest("[inert]"))?.focus();
        }
      }
    }
    previous.current = selected;
  }, [narrow, selected]);

  const listPane = <div className="trm-workbench-list" onPointerOver={event => {
    const rows = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      '.trm-workbench-item:not([inert])',
    )).filter(row => !row.closest('[data-phase="leave"]'));
    const hovered = (event.target as HTMLElement).closest(".trm-workbench-item");
    rows.forEach((row, i) => row.toggleAttribute("data-next-hovered", rows[i + 1] === hovered));
  }} onPointerLeave={event => {
    event.currentTarget.querySelectorAll("[data-next-hovered]")
      .forEach(row => row.removeAttribute("data-next-hovered"));
  }} onFocusCapture={(event) => {
    returnTo.current = event.target;
  }}>
    {listHead != null ? <div className="trm-workbench-list-head">{listHead}</div> : null}
    {list}
  </div>;
  const detailPane = <div className="trm-workbench-main">
    {narrow ? <div className="trm-workbench-navigation">
      <button type="button" className="trm-workbench-back" onClick={onBack}>
        <Icon name="back" size={18} />{t("ui.common.back")}
      </button>
    </div> : null}
    {/* Empty is a different view, not a queue item; discard its outgoing layer before showing detail. */}
    <Swap key={selected === null ? "empty" : "detail"}
      k={selected === null ? "empty" : `item:${selected}`} dir={dir}
      variant="parts" className="trm-workbench-swap">
      {selected === null ? <div className="trm-workbench-empty">{empty}</div> : detail}
    </Swap>
  </div>;
  const style = listWidth === undefined ? undefined : {
    "--workbench-list-width": typeof listWidth === "number" ? `${listWidth}px` : listWidth,
  } as CSSProperties;

  return <div ref={root} className={`trm-workbench ${className}`} data-narrow={narrow || undefined} style={style}>
    {narrow ? <Panes value={selected === null ? "list" : "detail"} order={["list", "detail"]}
      layout="fill" className="trm-workbench-panes">
      <Pane id="list">{listPane}</Pane>
      <Pane id="detail">{detailPane}</Pane>
    </Panes> : <>{listPane}{detailPane}</>}
  </div>;
}

export type WorkbenchItemProps = {
  title: string;
  meta?: ReactNode;
  preview?: string;
  tag?: ReactNode;
  avatar?: ReactNode;
  selected: boolean;
  onClick: () => void;
};

export function WorkbenchItem({ title, meta, preview, tag, avatar, selected, onClick }: WorkbenchItemProps) {
  return <button type="button" className="trm-workbench-item" aria-pressed={selected} onClick={onClick}>
    {avatar != null ? <span className="trm-workbench-avatar" aria-hidden>{avatar}</span> : null}
    <span className="trm-workbench-item-text">
      <span className="trm-workbench-item-line">
        <strong className="trm-workbench-item-title">{title}</strong>
        {meta != null ? <span className="trm-workbench-meta">{meta}</span> : null}
      </span>
      {preview != null || tag != null ? <span className="trm-workbench-item-line">
        <span className="trm-workbench-preview">{preview}</span>
        {tag != null ? <span className="trm-workbench-tag">{tag}</span> : null}
      </span> : null}
    </span>
  </button>;
}

export type WorkbenchDetailProps = {
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
  notice?: ReactNode;
  /** Each top-level child is an entrance part; keep stable keys when adding or removing blocks. */
  children: ReactNode;
  foot?: ReactNode;
  /** Form actions follow their fields; only a conversation composer needs a pinned foot. */
  footMode?: "inline" | "pinned";
};

function field(node: ReactNode) {
  return typeof node === "string" || typeof node === "number" ? <Roll value={String(node)} /> : node;
}

export function WorkbenchDetail({
  title, sub, actions, notice, children, foot, footMode = "inline",
}: WorkbenchDetailProps) {
  const id = useId();
  const fields = Children.toArray(sub);
  const bodyStart = fields.length + 3;
  const blocks = Children.toArray(children).length;
  // Form actions act on the fields above them, so they enter after the last body part instead of before it.
  const footer = foot == null ? null : footMode === "inline"
    ? <footer className="trm-workbench-foot trm-workbench-part rise" data-mode={footMode}
      style={stagger(bodyStart + Math.min(blocks, 4))}>{foot}</footer>
    : <footer className="trm-workbench-foot" data-mode={footMode}>{foot}</footer>;
  return <section className="trm-workbench-detail" aria-labelledby={id}>
    <header className="trm-workbench-heading">
      <div className="trm-workbench-title">
        <h3 id={id} className="trm-workbench-part rise" style={stagger(0)}>{field(title)}</h3>
        {fields.length ? <div className="trm-workbench-sub">
          {fields.map((node, i) => <div key={i} className="trm-workbench-field trm-workbench-part rise"
            style={stagger(i + 1)}>{field(node)}</div>)}
        </div> : null}
      </div>
      {actions != null ? <div className="trm-workbench-actions trm-workbench-part rise"
        style={stagger(fields.length + 1)}>{actions}</div> : null}
    </header>
    <div className="trm-workbench-body">
      <Morph className="trm-workbench-read">
        <div className="trm-workbench-part rise" style={stagger(fields.length + 2)}>
          <Collapse open={notice != null && notice !== false} className="trm-workbench-notice">
            <div className="trm-workbench-notice-content">{notice}</div>
          </Collapse>
        </div>
        {Children.map(children, (node, i) => node != null && <div
          className="trm-workbench-part trm-workbench-block rise" style={stagger(bodyStart + Math.min(i, 3))}>
          {node}
        </div>)}
        {footMode === "inline" ? footer : null}
      </Morph>
    </div>
    {footMode === "pinned" ? footer : null}
  </section>;
}
