/**
 * 桌面窗口默认使用 AppBar + Sidebar + .page-workspace，保留拖动区与内嵌页面。
 * 浏览器页面省略 AppBar，将 SidebarBrand 放入 Sidebar.head，内容使用 .page-workspace-flush。
 * 网页操作放入 PageHead.actions，状态放入 Sidebar.foot；浏览器已有窗口边框，不再重复画一层。
 *
 * 侧栏与内容区靠底色区分，不画分隔线。侧栏可以收起成图标列，宽度变化有过渡。
 * 导航项、小节标题、进行中的事，各有一个组件。
 * 换页配 PageHost 的 axis="y"：导航竖着排，新旧页同时上下推移，向下导航时新页从下方进入。
 */
import type { MouseEvent, ReactNode } from "react";
import { useI18n } from "../i18n";
import { Icon, type IconName } from "./Icon";
import { IconBtn } from "./display";
import { WinBtn, type WindowControls } from "./TitleBar";
import { Roll } from "./motion";
import { Tooltip } from "./Tooltip";
import { useMenu } from "./Menu";

// Share the geometry so foot states keep the same icon anchor as navigation, including when collapsed.
const SIDEBAR_ROW = "relative w-full flex-none flex items-center gap-3 h-9 px-[13px] rounded-[var(--rs)] border-0 cursor-pointer text-[13px] transition-colors overflow-hidden";
const SIDEBAR_HOVER = "bg-transparent hover:bg-[color-mix(in_srgb,var(--ink)_4%,transparent)]";
const STATUS_TONE = {
  ok: "text-[var(--ok)]",
  warn: "text-[var(--warn)]",
  danger: "text-[var(--danger)]",
  muted: "text-[var(--meta)]",
} as const;

export type SidebarStatusProps = {
  icon: IconName;
  /** Name both the subject and its state; the icon alone cannot identify the connection. */
  label: string;
  tone?: keyof typeof STATUS_TONE;
  onClick: (e: MouseEvent) => void;
  collapsed: boolean;
};

/** A connection or service state belongs to the foot's list, not to a separate badge. */
export function SidebarStatus({ icon, label, tone = "muted", onClick, collapsed }: SidebarStatusProps) {
  return (
    <Tooltip text={label} disabled={!collapsed} triggerClassName="flex w-full flex-none min-w-0">
      <button type="button" onClick={onClick} aria-label={label} data-collapsed={collapsed || undefined}
        className={`${SIDEBAR_ROW} ${SIDEBAR_HOVER} text-[var(--ink-muted)]`}>
        {/* Keep the glyph slot fixed; only the glyph fades when its shape or tone changes. */}
        <Roll value={`${icon}:${tone}`} className="sidebar-status-icon flex-none w-[18px] h-[18px]">
          <Icon name={icon} size={18} className={STATUS_TONE[tone]} />
        </Roll>
        <span className="side-label min-w-0 text-left" aria-hidden={collapsed || undefined}>
          <Roll value={label} className="max-w-full" />
        </span>
      </button>
    </Tooltip>
  );
}

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
        className="flex items-center gap-2.5 flex-none select-none transition-[width] duration-[420ms] ease-[var(--ease-nav)]"
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

/**
 * 侧栏本体。head 和 foot 固定在两端，children 是中间可滚动的导航。
 * 收起与展开时各项的图标留在原位，只有宽度变化、文字淡出淡入；不换排法，所以不会先跳一下再收。
 */
export function Sidebar({ collapsed, label, head, children, foot }: {
  collapsed: boolean;
  label: string;
  head?: ReactNode;
  children: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <nav
      aria-label={label}
      data-collapsed={collapsed || undefined}
      className="flex-none flex flex-col pb-3 transition-[width] duration-[420ms] ease-[var(--ease-nav)]"
      style={{ width: collapsed ? SIDEBAR_W.collapsed : SIDEBAR_W.open }}
    >
      {head ? <div className="sidebar-head">{head}</div> : null}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2.5 pt-1 flex flex-col gap-0.5">{children}</div>
      {foot ? <div className="flex-none px-2.5 pt-2 flex flex-col gap-0.5">{foot}</div> : null}
    </nav>
  );
}

/** 网页的品牌与侧栏开关放在导航顶部，收起后仍可从同一列展开。 */
export function SidebarBrand({ brand, collapsed, onToggle }: {
  brand: ReactNode;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="sidebar-brand" data-collapsed={collapsed || undefined}>
      {!collapsed ? <span className="sidebar-brand-text">{brand}</span> : null}
      <IconBtn
        icon="sidebar"
        label={t(collapsed ? "ui.sidebar.expand" : "ui.sidebar.collapse")}
        onClick={onToggle}
      />
    </div>
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
        // 左右留白固定：收起后按钮宽 44，18 的图标正好居中；展开时图标也在这个位置
        SIDEBAR_ROW,
        on ? "bg-[color-mix(in_srgb,var(--ink)_7%,transparent)] text-[var(--ink)] font-medium" : `${SIDEBAR_HOVER} text-[var(--ink-muted)] hover:text-[var(--ink)]`,
      ].join(" ")}
    >
      <Icon name={icon} size={18} className={on ? "text-[var(--accent)]" : ""} />
      <span className="side-label truncate" aria-hidden={collapsed || undefined}>{label}</span>
      {dot ? <span aria-label={dot} className={`absolute w-[6px] h-[6px] rounded-full bg-[var(--notify)] transition-[top,right] duration-300 ${collapsed ? "top-1.5 right-2" : "top-[15px] right-3"}`} /> : null}
    </button>
  );
}

/**
 * 侧栏里切换当前范围（店铺、工作区等）的一行：图标、当前项名称和向下箭头，点开是选项菜单，当前项带勾。
 * 和导航项同一套行高与图标位置，收起后只剩图标，悬停显示当前项。
 */
export function SidebarSwitch<T extends string>({
  icon,
  label,
  value,
  options,
  onChange,
  collapsed,
}: {
  icon: IconName;
  /** 这一行切换的是什么，读屏读出来，例如「店铺」。 */
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
  collapsed: boolean;
}) {
  const menu = useMenu();
  const current = options.find((o) => o.id === value)?.label ?? "";
  const open = Boolean(menu.openOn);
  return (
    <>
      <button
        type="button"
        aria-label={`${label}：${current}`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={collapsed ? current : undefined}
        onClick={(e) =>
          menu.open(
            e.currentTarget,
            options.map((o) => ({ id: o.id, label: o.label, checked: o.id === value, onSelect: () => onChange(o.id) })),
          )
        }
        className={[SIDEBAR_ROW, open ? "bg-[color-mix(in_srgb,var(--ink)_4%,transparent)] text-[var(--ink)]" : `${SIDEBAR_HOVER} text-[var(--ink)]`].join(" ")}
      >
        <Icon name={icon} size={18} />
        <span className="side-label flex-1 min-w-0 truncate text-start" aria-hidden={collapsed || undefined}>
          {current}
        </span>
        <span className="side-label flex" aria-hidden>
          <Icon name="down" size={14} className={`text-[var(--meta)] transition-transform duration-300 ease-[var(--ease)] ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {menu.node}
    </>
  );
}

/** 侧栏里的小节标题，右边可放几个小按钮（见 SidebarHeadBtn）。收起时文字淡出，高度不变。 */
export function SidebarHead({ label, collapsed = false, children }: { label: string; collapsed?: boolean; children?: ReactNode }) {
  return (
    <div className="mt-5 mb-1 pl-3 pr-1 h-6 flex items-center gap-1 text-[11.5px] text-[var(--meta)] overflow-hidden">
      <span className="side-label flex-1 truncate" aria-hidden={collapsed || undefined}>{label}</span>
      <span className="side-label flex items-center gap-1">{children}</span>
    </div>
  );
}

export function SidebarHeadBtn({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="w-6 h-6 grid place-items-center rounded-[var(--rs)] border-0 bg-transparent cursor-pointer text-[var(--meta)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]">
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
      title={collapsed ? `${label}
${status}` : undefined}
      className={[
        // 与导航项同一套留白：收起后 20 的图标正好居中，展开时也在这个位置
        "relative w-full flex-none flex items-center gap-2.5 rounded-[var(--rs)] border-0 cursor-pointer text-left transition-colors overflow-hidden px-3 py-2 min-h-10",
        on ? "bg-[color-mix(in_srgb,var(--ink)_7%,transparent)]" : "bg-transparent hover:bg-[color-mix(in_srgb,var(--ink)_4%,transparent)]",
      ].join(" ")}
    >
      <span className="flex-none grid place-items-center w-5 h-5 text-[var(--ink-muted)]">{icon}</span>
      <span className="side-label min-w-0 flex-1" aria-hidden={collapsed || undefined}>
        <span className="block text-[13px] text-[var(--ink)] truncate">{label}</span>
        {sub ? <span className="block text-[11.5px] text-[var(--meta)] truncate">{sub}</span> : null}
      </span>
      <span className={`side-label flex-none text-[11.5px] tabular-nums ${failed ? "text-[var(--danger-text)]" : "text-[var(--meta)]"}`}>{status}</span>
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
