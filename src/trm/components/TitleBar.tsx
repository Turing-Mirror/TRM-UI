import type { ReactNode } from "react";
import { SegmentControl } from "./SegmentControl";
import type { Nav } from "../lib/nav";
import { useI18n } from "../i18n";

/**
 * 窗口按钮的三个动作。接进 Tauri 时这样接：
 *
 *   import { getCurrentWindow } from "@tauri-apps/api/window";
 *   const w = getCurrentWindow();
 *   <TitleBar windowControls={{
 *     minimize: () => void w.minimize(),
 *     toggleMaximize: () => void w.toggleMaximize(),
 *     close: () => void w.close(),
 *   }} … />
 *
 * 不传就不画这三个按钮 —— 纯网页预览下它们没有意义，画出来点了也没反应，
 * 而「看着能点、点了没反应」比没有按钮更伤。
 */
export type WindowControls = {
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
};

type Props<T extends string> = {
  /** 左上角的牌子。传字符串就按字标排版，传节点可以放 <img>。 */
  brand: ReactNode;
  nav: Nav<T>;
  page: T;
  onPage: (id: T) => void;
  /** 哪些页签要亮小圆点。默认全不亮。 */
  badges?: Partial<Record<T, boolean>>;
  /** 窄布局：不画滑块，退回逐项高亮。 */
  compactNav?: boolean;
  windowControls?: WindowControls;
};

/**
 * 无边框窗口的标题栏：牌子 + 页签 + 窗口按钮。
 *
 * `data-tauri-drag-region` 让整条栏可以拖动窗口。**可交互的元素必须
 * `stopPropagation`**，否则在按钮上按下会被当成拖窗口的起手 —— 表现是
 * 「点页签有时候点不中，反而把窗口挪了」。
 */
export function TitleBar<T extends string>({
  brand,
  nav,
  page,
  onPage,
  badges,
  compactNav = false,
  windowControls,
}: Props<T>) {
  const { t, locale } = useI18n();

  // locale 参与依赖，语言变了标签要重新解析。
  void locale;
  const pages = nav.pages();

  const options = pages.map((p) => ({
    id: p.id,
    label: (
      <span className="inline-flex items-center">
        {p.label}
        {p.badge && badges?.[p.id] ? (
          <span
            className="inline-block w-[5px] h-[5px] rounded-full bg-[var(--notify)] ml-1.5 align-middle animate-[pulse_2.4s_var(--ease)_infinite]"
            aria-label={t("ui.nav.newContent")}
          />
        ) : null}
      </span>
    ),
  }));

  return (
    <header
      className="flex-none h-[54px] flex items-center pl-[22px] pr-2"
      data-tauri-drag-region
    >
      {typeof brand === "string" ? (
        <span
          data-tauri-drag-region
          className="text-[15px] font-semibold tracking-tight select-none flex-none"
        >
          {brand}
        </span>
      ) : (
        <span data-tauri-drag-region className="flex-none inline-flex items-center">
          {brand}
        </span>
      )}

      <div className="ml-auto flex items-center min-w-0" data-tauri-drag-region>
        <div className="min-w-0" onPointerDown={(e) => e.stopPropagation()}>
          <SegmentControl
            role="tablist"
            options={options}
            value={page}
            onChange={onPage}
            compact={compactNav}
          />
        </div>

        {windowControls ? (
          <div
            className="flex text-[var(--meta)] ml-3.5"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <WinBtn label={t("ui.window.minimize")} onClick={windowControls.minimize}>
              —
            </WinBtn>
            <WinBtn
              label={t("ui.window.maximize")}
              onClick={windowControls.toggleMaximize}
            >
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

function WinBtn({
  children,
  label,
  onClick,
  danger = false,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        "w-10 h-[34px] grid place-items-center text-xs rounded-md border-0 bg-transparent cursor-pointer",
        "text-[var(--meta)] transition-[background,color] duration-150 ease-[var(--ease)]",
        // 关闭按钮悬停变红，是 Windows 上所有人都认的约定。
        // 这一处红色不走 token：它属于系统语汇，不属于产品配色。
        danger
          ? "hover:bg-[#e81123] hover:text-white"
          : "hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] hover:text-[var(--ink)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
