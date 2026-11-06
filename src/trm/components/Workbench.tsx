import {
  useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode,
} from "react";
import { useI18n } from "../i18n";
import { Icon } from "./Icon";
import { Morph, Pane, Panes, Swap, useDir } from "./motion";

export type WorkbenchProps = {
  list: ReactNode;
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
  list, detail, selected, order, onBack, listWidth, narrowAt = 900, empty, className = "",
}: WorkbenchProps) {
  const { t } = useI18n();
  const narrow = useNarrow(narrowAt);
  const dir = useDir(selected === null ? -1 : order.indexOf(selected));
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef(selected);
  const returnTo = useRef<HTMLElement | null>(null);
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

  const listPane = <div className="trm-workbench-list" onFocusCapture={(event) => {
    returnTo.current = event.target;
  }}>{list}</div>;
  const detailPane = <div className="trm-workbench-main">
    {narrow ? <div className="trm-workbench-navigation">
      <button type="button" className="trm-workbench-back" onClick={onBack}>
        <Icon name="back" size={18} />{t("ui.common.back")}
      </button>
    </div> : null}
    <Swap k={selected === null ? "empty" : `item:${selected}`} dir={dir} className="trm-workbench-swap">
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
  children: ReactNode;
  foot?: ReactNode;
};

export function WorkbenchDetail({ title, sub, actions, children, foot }: WorkbenchDetailProps) {
  const id = useId();
  return <section className="trm-workbench-detail" aria-labelledby={id}>
    <header className="trm-workbench-heading">
      <div className="trm-workbench-title">
        <h3 id={id}>{title}</h3>
        {sub != null ? <div className="trm-workbench-sub">{sub}</div> : null}
      </div>
      {actions != null ? <div className="trm-workbench-actions">{actions}</div> : null}
    </header>
    <div className="trm-workbench-body">
      <Morph className="trm-workbench-read">{children}</Morph>
    </div>
    {foot != null ? <footer className="trm-workbench-foot">{foot}</footer> : null}
  </section>;
}
