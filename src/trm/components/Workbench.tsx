import {
  Children, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState,
  type CSSProperties, type ReactNode,
} from "react";
import { useI18n } from "../i18n";
import { Icon } from "./Icon";
import { Collapse, FlowList, FLOW_MS, Morph, Pane, Panes, Roll, stagger } from "./motion";

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
  list, listHead, detail, selected, onBack, listWidth, narrowAt = 900, empty, className = "",
}: WorkbenchProps) {
  const { t } = useI18n();
  const narrow = useNarrow(narrowAt);
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef(selected);
  const returnTo = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    // Query the rendered order so FlowList wrappers and collapsing rows do not create trailing lines.
    const rows = Array.from(root.current?.querySelectorAll<HTMLElement>(
      ".trm-workbench-list .trm-workbench-item",
    ) ?? []).filter(row => !row.closest('[data-phase="leave"], [inert]'));
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
    )).filter(row => !row.closest('[data-phase="leave"], [inert]'));
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
    {/* Selection changes data, not the detail's identity. Empty still replaces it without overlap. */}
    <div className="trm-workbench-stage">
      {selected === null ? <div className="trm-workbench-empty">{empty}</div> : detail}
    </div>
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
  /** Change identity for a rich title; its complete node rolls while the heading stays mounted. */
  titleText?: string;
  sub?: ReactNode;
  actions?: ReactNode;
  notice?: ReactNode;
  /** Top-level keys identify FlowList blocks. Include the item ID for item-specific content. */
  children: ReactNode;
  foot?: ReactNode;
  /** Form actions follow their fields; only a conversation composer needs a pinned foot. */
  footMode?: "inline" | "pinned";
  /** Change this token to follow the content end during a conversation switch or append. */
  scrollToEnd?: string | number;
};

function field(node: ReactNode) {
  return typeof node === "string" || typeof node === "number" ? <Roll value={String(node)} /> : node;
}

export function WorkbenchDetail({
  title, titleText, sub, actions, notice, children, foot, footMode = "inline", scrollToEnd,
}: WorkbenchDetailProps) {
  const id = useId();
  const fields = Children.toArray(sub);
  const blocks = Children.toArray(children).map((node, i) => ({
    key: isValidElement(node) ? String(node.key) : String(i), node,
  }));
  const signature = blocks.map(block => block.key).join("\n");
  const [entrance, setEntrance] = useState({ signature, quiet: false });
  if (entrance.signature !== signature) setEntrance({ signature, quiet: true });
  const body = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);
  useLayoutEffect(() => {
    const el = body.current;
    if (!el || scrollToEnd === undefined) return;
    const instant = firstScroll.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    firstScroll.current = false;
    const from = el.scrollTop;
    const started = performance.now();
    let frame = 0;
    // Follow the moving end, rather than jumping after FlowList removes the old bubbles.
    // Wheel/touch input cancels following so reading older messages remains under user control.
    const follow = () => {
      const progress = instant ? 1 : Math.min(1, (performance.now() - started) / FLOW_MS);
      const end = Math.max(0, el.scrollHeight - el.clientHeight);
      el.scrollTop = from + (end - from) * (1 - (1 - progress) ** 3);
      if (progress < 1) frame = requestAnimationFrame(follow);
    };
    follow();
    const cancel = () => cancelAnimationFrame(frame);
    el.addEventListener("wheel", cancel, { passive: true });
    el.addEventListener("touchstart", cancel, { passive: true });
    return () => {
      cancel();
      el.removeEventListener("wheel", cancel);
      el.removeEventListener("touchstart", cancel);
    };
  }, [scrollToEnd]);
  const footer = foot == null ? null
    : <footer className="trm-workbench-foot" data-mode={footMode}>{foot}</footer>;
  return <section className="trm-workbench-detail" aria-labelledby={id}>
    <header className="trm-workbench-heading">
      <div className="trm-workbench-title">
        <h3 id={id} className="trm-workbench-part rise" style={stagger(0)}>
          {titleText === undefined ? field(title) : <Roll value={titleText}>{title}</Roll>}
        </h3>
        {fields.length ? <div className="trm-workbench-sub">
          {fields.map((node, i) => <div key={i} className="trm-workbench-field trm-workbench-part rise"
            style={stagger(i + 1)}>{field(node)}</div>)}
        </div> : null}
      </div>
      {actions != null ? <div className="trm-workbench-actions">{actions}</div> : null}
    </header>
    <div ref={body} className="trm-workbench-body" data-follow-end={scrollToEnd !== undefined || undefined}>
      {/* FlowList already morphs keyed changes; a second height transition would lag behind the scroll end. */}
      <Morph className="trm-workbench-read" disabled={entrance.quiet}>
        <Collapse open={notice != null && notice !== false} className="trm-workbench-notice">
          <div className="trm-workbench-notice-content">{notice}</div>
        </Collapse>
        <FlowList items={blocks} keyOf={block => block.key} className={entrance.quiet ? "flow-quiet" : ""}
          itemClassName="trm-workbench-block" render={(block, i) => <div
            className="trm-workbench-part rise" style={stagger(fields.length + 1 + Math.min(i, 3))}>
            {block.node}
          </div>} />
        {footMode === "inline" ? footer : null}
      </Morph>
    </div>
    {footMode === "pinned" ? footer : null}
  </section>;
}
