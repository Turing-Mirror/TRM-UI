/**
 * 页标题放在标题栏里：返回箭头、标题、跟在后面的一行小字，右边是这一页的操作。
 * 内容区因此从顶上就开始，各页标题的位置天然一致。
 *
 * 页面常驻时，每一页各自往标题栏里放一份，只有正显示的那一页露出来（active）；
 * 换页时旧标题淡出、新标题浮上来，与换页同一节奏。没有标题栏的窗口里，
 * 标题就留在页面顶上。
 */
import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n";
import { Icon } from "./Icon";
import { usePaneOn } from "./motion";

const HostCtx = createContext<HTMLElement | null>(null);
const SetHostCtx = createContext<(el: HTMLElement | null) => void>(() => undefined);

/** 标题栏与页面之间的约定：标题栏提供放标题的位置，页面往里放。 */
export function TitleHostProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  return (
    <SetHostCtx.Provider value={setHost}>
      <HostCtx.Provider value={host}>{children}</HostCtx.Provider>
    </SetHostCtx.Provider>
  );
}

/** 标题栏里放标题的那一段。空着的地方照样可以拖动窗口。 */
export function TitleHost({ className = "" }: { className?: string }) {
  const set = useContext(SetHostCtx);
  return <div ref={set} data-tauri-drag-region className={`relative ${className}`} />;
}

export type TitleProps = {
  title: string;
  /** 有它就在标题前放一个返回箭头。 */
  back?: () => void;
  /** 跟在标题后面的小字：状态、版本、作者等。 */
  meta?: ReactNode;
  /** 右侧这一页的操作。 */
  actions?: ReactNode;
  /** 标题前的小图标。 */
  lead?: ReactNode;
  /** 这一页此刻是否正显示着。页面常驻时由外面传进来；只有一页时不用管。 */
  active?: boolean;
};

/**
 * 一页的标题。在主窗口里放进标题栏；在单独的窗口里留在页面顶上。
 * 同一页里换了标题（列表进详情），新旧标题交叠着换。
 */
export function PageTitle(props: TitleProps) {
  const host = useContext(HostCtx);
  // 页面露着、所在的视图也露着才算：列表与详情各放一个标题，谁露着显示谁
  const pageOn = props.active ?? true;
  const paneOn = usePaneOn();
  const active = pageOn && paneOn;
  // 预先挂好、还没露过面的页不放退场，免得标题栏里闪一下
  const [seen, setSeen] = useState(active);
  if (active && !seen) setSeen(true);
  if (!host) return active ? <InlineTitle {...props} /> : null;
  return createPortal(
    <div inert={!active} aria-hidden={!active || undefined} className={`absolute inset-y-0 left-8 right-3 max-[900px]:left-5 flex items-center min-w-0 ${active ? "title-in" : seen ? "title-out pointer-events-none" : "invisible pointer-events-none"}`}>
      <TitleRow key={props.title} {...props} />
    </div>,
    host,
  );
}

function TitleRow({ title, back, meta, actions, lead }: Omit<TitleProps, "active">) {
  const { t } = useI18n();
  return (
    <div className="title-swap flex-1 min-w-0 h-full flex items-center gap-2">
      <div data-tauri-drag-region className="min-w-0 flex items-center gap-2">
        {back ? (
          <button
            type="button"
            onClick={back}
            aria-label={t("ui.common.back")}
            title={t("ui.common.back")}
            className="-ml-1.5 w-8 h-8 flex-none grid place-items-center rounded-[var(--rs)] border-0 bg-transparent cursor-pointer text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] transition-colors"
          >
            <Icon name="back" size={17} />
          </button>
        ) : null}
        {lead}
        <h1 data-tauri-drag-region className="m-0 text-[17px] font-semibold tracking-tight truncate">
          {title}
        </h1>
        {meta ? (
          <span data-tauri-drag-region className="min-w-0 flex items-center gap-2 text-[12px] text-[var(--meta)] truncate">
            {meta}
          </span>
        ) : null}
      </div>
      <div data-tauri-drag-region className="flex-1 self-stretch" />
      {actions ? <div className="flex-none flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** 单独窗口里的标题：留在页面顶上，样式与标题栏里的一致。 */
function InlineTitle(props: TitleProps) {
  return <div className="h-[52px] flex items-center">{<TitleRow {...props} />}</div>;
}
