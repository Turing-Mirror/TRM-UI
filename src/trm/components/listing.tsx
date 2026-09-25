/**
 * 列表页共用的小件：常驻分栏、左侧筛选列、搜索框、「…」按钮，以及拖拽收尾。
 */
import type { MouseEvent, ReactNode } from "react";
import { useI18n } from "../i18n";
import { Icon, type IconName } from "./Icon";

/** 拖拽收尾最多等多久，毫秒。拖到窗口外松开时不一定有 dragend。 */
const DRAG_END_WAIT = 400;

/**
 * 放下之后要把被拖的那一项挪走时，等这次拖拽完全结束再挪。
 * 被拖的元素若在拖拽结束前被卸掉，浏览器收不到 dragend，会一直停在拖拽状态：
 * 指针始终是箭头，直到切走窗口再回来。
 */
export function afterDrag(fn: () => void) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    window.removeEventListener("dragend", run, true);
    fn();
  };
  window.addEventListener("dragend", run, true);
  window.setTimeout(run, DRAG_END_WAIT);
}

/** 页内一个分栏。常驻不卸载，切走时只是藏起来，筛选、页码都留着。 */
export function Pane({ on, children }: { on: boolean; children: ReactNode }) {
  return <div className={on ? "fade-in" : "hidden"}>{children}</div>;
}

/** 左侧的筛选列。窄窗口下收起，筛选挪到网格上方的下拉里。 */
export function Side({ children }: { children: ReactNode }) {
  return <aside className="w-[188px] flex-none pr-3 max-[860px]:hidden flex flex-col gap-0.5">{children}</aside>;
}

export function SideHead({ label, action }: { label: string; action?: { icon: IconName; label: string; run: () => void } }) {
  return (
    <div className="mt-5 first:mt-0 mb-1 pl-3 pr-1 h-6 flex items-center text-[11.5px] text-[var(--meta)]">
      <span className="flex-1">{label}</span>
      {action ? (
        <button type="button" onClick={action.run} aria-label={action.label} title={action.label} className="w-6 h-6 grid place-items-center rounded-[6px] border-0 bg-transparent cursor-pointer text-[var(--meta)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]">
          <Icon name={action.icon} size={14} />
        </button>
      ) : null}
    </div>
  );
}

export function SideItem({
  label,
  count,
  on,
  icon,
  onClick,
  onContextMenu,
}: {
  label: string;
  count?: number;
  on: boolean;
  icon?: IconName;
  onClick: () => void;
  onContextMenu?: (e: MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      aria-pressed={on}
      className={[
        "w-full h-8 flex items-center gap-2 px-3 rounded-[var(--rs)] border-0 cursor-pointer text-[13px] text-left transition-colors",
        on ? "bg-[color-mix(in_srgb,var(--ink)_7%,transparent)] text-[var(--ink)] font-medium" : "bg-transparent text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_4%,transparent)]",
      ].join(" ")}
    >
      {icon ? <Icon name={icon} size={15} className={on ? "text-[var(--accent)]" : "text-[var(--meta)]"} /> : null}
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined ? <span className="text-[11.5px] text-[var(--meta)] font-normal">{count}</span> : null}
    </button>
  );
}

export function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useI18n();
  return (
    <div className="flex-1 max-w-[320px] h-8 flex items-center gap-2 px-2.5 rounded-[var(--rs)] bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]">
      <Icon name="search" size={15} className="text-[var(--meta)]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("ui.common.search")}
        className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[13px] text-[var(--ink)] placeholder:text-[var(--meta)] selectable"
      />
      {value ? (
        <button type="button" onClick={() => onChange("")} aria-label={t("ui.common.clear")} className="w-5 h-5 grid place-items-center rounded-full border-0 bg-transparent cursor-pointer text-[var(--meta)] hover:text-[var(--ink)]">
          <Icon name="close" size={12} />
        </button>
      ) : null}
    </div>
  );
}

/** 条目上的「…」。默认悬停时才出现（键盘聚焦时也出现）；always 则一直显示。 */
export function MoreBtn({ onOpen, always = false }: { onOpen: (el: Element) => void; always?: boolean }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      aria-label={t("ui.common.more")}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(e.currentTarget);
      }}
      className={[
        "w-7 h-7 grid place-items-center rounded-[var(--rs)] border-0 cursor-pointer text-[var(--ink-muted)] hover:text-[var(--ink)] transition-opacity",
        always
          ? "bg-transparent hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
          : "bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
      ].join(" ")}
    >
      <Icon name="more" size={16} stroke={2.4} />
    </button>
  );
}
