/**
 * 侧栏式外壳：顶上一条细的标题栏，左边一列侧栏，右边是页面。
 *
 * 侧栏与内容区同一底色，不画分隔线。可以收起成只剩图标的一列，宽度变化有过渡。导航项、小节标题、进行中的事，各有一个组件。
 * 换页配 PageHost 的 axis="y"：导航竖着排，页面就上下推。
 */
import type { MouseEvent, ReactNode } from "react";
import { useI18n } from "../i18n";
import { Icon, type IconName } from "./Icon";
import { IconBtn } from "./display";
import { WinBtn, type WindowControls } from "./TitleBar";

/** 侧栏宽度：展开与收起。 */
export const SIDEBAR_W = { open: 244, collapsed: 64 } as const;

/** 标题栏：牌子、侧栏开关、右侧的操作、窗口按钮。整条可以拖动窗口。 */
export function AppBar({
  brand,
  sidebarOpen,
  onSidebar,
  actions,
  windowControls,
  inset = 18,
}: {
  brand: ReactNode;
  sidebarOpen: boolean;
  onSidebar: () => void;
  /** 右侧的操作，比如搜索入口、账号。 */
  actions?: ReactNode;
  windowControls?: WindowControls;
  /** 左侧留白。macOS 用系统红黄绿按钮时，要让出那块位置（约 84）。 */
  inset?: number;
}) {
  const { t } = useI18n();
  return (
    <header data-tauri-drag-region className="flex-none h-[52px] flex items-center gap-3 pr-2" style={{ paddingLeft: inset }}>
      <div
        data-tauri-drag-region
        className="flex items-center gap-2.5 flex-none select-none transition-[width] duration-[380ms] ease-[var(--ease-soft)]"
        style={{ width: sidebarOpen ? SIDEBAR_W.open - inset - 6 : 150 }}
      >
        {typeof brand === "string" ? (
          <span data-tauri-drag-region className="text-[15px] font-semibold tracking-tight">
            {brand}
          </span>
        ) : (
          brand
        )}
        <span className="ml-auto" onPointerDown={(e) => e.stopPropagation()}>
          <IconBtn icon="sidebar" label={t(sidebarOpen ? "ui.sidebar.collapse" : "ui.sidebar.expand")} onClick={onSidebar} />
        </span>
      </div>
      <div data-tauri-drag-region className="flex-1 self-stretch" />
      <div className="flex items-center gap-1 flex-none" onPointerDown={(e) => e.stopPropagation()}>
        {actions}
        {windowControls ? (
          <div className="flex ml-2 text-[var(--meta)]">
            <WinBtn label={t("ui.window.minimize")} onClick={windowControls.minimize}>
              —
            </WinBtn>
            <WinBtn label={t("ui.window.maximize")} onClick={windowControls.toggleMaximize}>
              □
            </WinBtn>
            <WinBtn label={t("ui.window.close")} danger onClick={windowControls.close}>
              ✕
            </WinBtn>
          </div>
        ) : null}
      </div>
    </header>
  );
}

/** 侧栏本体。main 放上面可滚动的部分，foot 固定在最下面。 */
export function Sidebar({ collapsed, label, children, foot }: { collapsed: boolean; label: string; children: ReactNode; foot?: ReactNode }) {
  return (
    <nav
      aria-label={label}
      className="flex-none flex flex-col pb-3 transition-[width] duration-[380ms] ease-[var(--ease-soft)]"
      style={{ width: collapsed ? SIDEBAR_W.collapsed : SIDEBAR_W.open }}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2.5 pt-1 flex flex-col gap-0.5">{children}</div>
      {foot ? <div className="flex-none px-2.5 pt-2 flex flex-col gap-0.5">{foot}</div> : null}
    </nav>
  );
}

/** 一个导航项。dot 给了就在右边亮一个小圆点，内容是读屏读出来的说明。 */
export function SidebarItem({
  icon,
  label,
  on = false,
  collapsed,
  dot,
  onClick,
  onContextMenu,
}: {
  icon: IconName;
  label: string;
  on?: boolean;
  collapsed: boolean;
  dot?: string;
  onClick: (e: MouseEvent) => void;
  onContextMenu?: (e: MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      aria-current={on ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={[
        "relative w-full flex-none flex items-center gap-3 h-9 rounded-[var(--rs)] border-0 cursor-pointer text-[13.5px] transition-colors",
        collapsed ? "justify-center px-0" : "px-3",
        on ? "bg-[color-mix(in_srgb,var(--ink)_7%,transparent)] text-[var(--ink)] font-medium" : "bg-transparent text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_4%,transparent)]",
      ].join(" ")}
    >
      <Icon name={icon} size={18} className={on ? "text-[var(--accent)]" : ""} />
      {collapsed ? null : <span className="truncate">{label}</span>}
      {dot ? <span aria-label={dot} className={`absolute w-[6px] h-[6px] rounded-full bg-[var(--notify)] ${collapsed ? "top-1.5 right-3" : "right-3"}`} /> : null}
    </button>
  );
}

/** 侧栏里的小节标题，右边可放几个小按钮（见 SidebarHeadBtn）。收起时只留一段空白。 */
export function SidebarHead({ label, collapsed = false, children }: { label: string; collapsed?: boolean; children?: ReactNode }) {
  if (collapsed) return <div className="h-4" />;
  return (
    <div className="mt-5 mb-1 pl-3 pr-1 h-6 flex items-center gap-1 text-[11.5px] text-[var(--meta)]">
      <span className="flex-1 truncate">{label}</span>
      {children}
    </div>
  );
}

export function SidebarHeadBtn({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="w-6 h-6 grid place-items-center rounded-[6px] border-0 bg-transparent cursor-pointer text-[var(--meta)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]">
      <Icon name={icon} size={14} />
    </button>
  );
}

/**
 * 进行中的一件事：图标、名字、一行副标题、右边的状态。
 * 在跑时底下一条细线是进度；做完而还没看，没有底轨，只有一段光沿着它流过，
 * 点开看过（fresh 变 false）就不再显示。失败不画线，状态文字变红。
 */
export function ActivityRow({
  collapsed,
  label,
  sub,
  icon,
  status,
  progress,
  fresh = false,
  failed = false,
  on = false,
  onClick,
  onContextMenu,
}: {
  collapsed: boolean;
  label: string;
  sub?: string;
  icon: ReactNode;
  /** 右边的状态文字，比如「62%」「完成」。 */
  status: string;
  /** 0–1，在跑时给。 */
  progress?: number;
  /** 做完了而还没看。 */
  fresh?: boolean;
  failed?: boolean;
  on?: boolean;
  onClick: () => void;
  onContextMenu?: (e: MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={collapsed ? `${label} · ${status}` : undefined}
      className={[
        "relative w-full flex-none flex items-center gap-2.5 rounded-[var(--rs)] border-0 cursor-pointer text-left transition-colors",
        on ? "bg-[color-mix(in_srgb,var(--ink)_7%,transparent)]" : "bg-transparent hover:bg-[color-mix(in_srgb,var(--ink)_4%,transparent)]",
        collapsed ? "justify-center h-10" : "px-3 py-2 min-h-10",
      ].join(" ")}
    >
      <span className="flex-none grid place-items-center w-5 h-5 text-[var(--ink-muted)]">{icon}</span>
      {collapsed ? null : (
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] text-[var(--ink)] truncate">{label}</span>
          {sub ? <span className="block text-[11.5px] text-[var(--meta)] truncate">{sub}</span> : null}
        </span>
      )}
      {collapsed ? null : <span className={`flex-none text-[11.5px] tabular-nums ${failed ? "text-[var(--danger)]" : "text-[var(--meta)]"}`}>{status}</span>}
      {failed ? null : progress !== undefined ? (
        <span aria-hidden className={`row-line ${collapsed ? "row-line-sm" : ""}`}>
          <i style={{ transform: `scaleX(${progress})` }} />
        </span>
      ) : fresh ? (
        <span aria-hidden className={`row-line row-line-done ${collapsed ? "row-line-sm" : ""}`}>
          <i />
        </span>
      ) : null}
    </button>
  );
}
