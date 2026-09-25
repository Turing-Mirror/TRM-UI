/**
 * 右上角的消息，照 macOS 的通知来：从右边拉进来，关掉时向右收回，
 * 下面的往上补位。两种：
 *
 * - 提示（tip）只有一句话，几秒后自己收回，没有关闭按钮；
 * - 通知（notice）一直留着，指到时左上角露出一个半压在卡片上的圆形关闭按钮，
 *   点卡片执行它的 onOpen 并收起。两条以上时可以一次全部清除。
 *
 * 用法：外层包一个 NoticeProvider，页面里 useNotify() 发消息，
 * 在根部放一个 <Notices top={…} /> 画出来。
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useI18n } from "../i18n";
import { Icon, isIconName } from "./Icon";

/** 提示停留多久，毫秒。 */
const TIP_MS = 2800;
/** 收回动画的总时长：滑出 0.36s，再合上占位 0.26s，与 index.css 里 .notice-out、.notice-row-out 一致。 */
export const NOTICE_OUT_MS = 620;

export type Notice = {
  id: string;
  kind: "tip" | "notice";
  title: string;
  text?: string;
  /** 图标名，见 Icon。 */
  icon?: string;
  /** 点开时做什么。 */
  onOpen?: () => void;
  at: number;
  /** 正在收回，动画放完后从列表里去掉。 */
  leaving?: boolean;
};

export type NoticeInput = Omit<Notice, "id" | "kind" | "at" | "leaving">;

type Api = {
  /** 一句提示，自己会消失。 */
  tip: (title: string) => void;
  /** 一条通知，留着直到用户处理。返回它的 id。 */
  notice: (n: NoticeInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ListCtx = createContext<Notice[]>([]);
const ApiCtx = createContext<Api | null>(null);

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Notice[]>([]);
  const seq = useRef(0);

  // 先标为收回，放完动画再去掉
  const dismiss = useCallback((id: string) => {
    setList((l) => l.map((n) => (n.id === id ? { ...n, leaving: true } : n)));
    window.setTimeout(() => setList((l) => l.filter((n) => n.id !== id)), NOTICE_OUT_MS);
  }, []);
  const push = useCallback((n: Omit<Notice, "id" | "at">) => {
    const id = `notice-${++seq.current}`;
    setList((l) => [{ ...n, id, at: Date.now() }, ...l]);
    return id;
  }, []);
  const api = useMemo<Api>(
    () => ({
      tip: (title) => {
        const id = push({ kind: "tip", title });
        window.setTimeout(() => dismiss(id), TIP_MS);
      },
      notice: (n) => push({ ...n, kind: "notice" }),
      dismiss,
      clear: () => {
        setList((l) => l.map((n) => ({ ...n, leaving: true })));
        window.setTimeout(() => setList([]), NOTICE_OUT_MS);
      },
    }),
    [push, dismiss],
  );
  return (
    <ApiCtx.Provider value={api}>
      <ListCtx.Provider value={list}>{children}</ListCtx.Provider>
    </ApiCtx.Provider>
  );
}

/** 发消息。引用固定，只发消息的组件不会因为消息列表变化而重绘。 */
export function useNotify(): Api {
  const v = useContext(ApiCtx);
  if (!v) throw new Error("useNotify 必须在 NoticeProvider 里用");
  return v;
}

/** 画出消息。top 是离窗口顶部的距离，通常是标题栏高度再加一点空隙。 */
export function Notices({ top = 62 }: { top?: number }) {
  const { t } = useI18n();
  const list = useContext(ListCtx);
  const { dismiss, clear } = useNotify();
  const [, tick] = useState(0);
  const lasting = list.filter((n) => n.kind === "notice" && !n.leaving).length;

  // 「刚刚」「10:32」随时间变
  useEffect(() => {
    if (!list.length) return;
    const id = window.setInterval(() => tick((x) => x + 1), 30_000);
    return () => window.clearInterval(id);
  }, [list.length]);

  if (!list.length) return null;
  return (
    // 整块区域不接鼠标，只有卡片本身接：卡片之间的空隙与下方的空白不挡住后面的页面
    <div className="group/stack fixed right-4 z-[55] w-[344px] max-w-[calc(100vw-32px)] flex flex-col pointer-events-none" style={{ top }} aria-live="polite">
      {list.map((n) => (
        <Row key={n.id} n={n} onClose={() => dismiss(n.id)} />
      ))}
      {lasting > 1 ? (
        <div className="flex justify-end pt-1 opacity-0 group-hover/stack:opacity-100 transition-opacity pointer-events-auto">
          <button type="button" onClick={clear} className="h-7 px-3 rounded-full border-0 cursor-pointer text-[12px] text-[var(--ink-muted)] hover:text-[var(--ink)] bg-[var(--surface)] shadow-[var(--pop-shadow)]">
            {t("ui.notice.clearAll")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Row({ n, onClose }: { n: Notice; onClose: () => void }) {
  const { t, locale } = useI18n();
  const tip = n.kind === "tip";
  const icon = n.icon && isIconName(n.icon) ? n.icon : null;
  const fresh = Date.now() - n.at < 60_000;
  const clock = new Date(n.at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

  const open = () => {
    if (tip) return;
    n.onOpen?.();
    onClose();
  };

  return (
    // 外层管占位的高度：进来时展开、收回时合上，下面的消息跟着平滑补位
    <div className={`notice-row ${n.leaving ? "notice-row-out" : ""}`}>
      <div className="min-h-0">
        <div className="pb-2.5">
          <div
            role={tip ? "status" : "button"}
            tabIndex={tip ? undefined : 0}
            onClick={open}
            onKeyDown={(e) => e.key === "Enter" && open()}
            className={`group relative notice-card pointer-events-auto ${n.leaving ? "notice-out pointer-events-none" : "notice-in"} ${tip ? "" : "cursor-pointer"}`}
          >
            <div className={`flex items-start gap-3 rounded-[16px] bg-[var(--surface)] shadow-[var(--pop-shadow)] ${tip ? "px-3.5 py-3" : "p-3.5"}`}>
              {icon ? (
                <span className="w-8 h-8 flex-none grid place-items-center rounded-[9px] bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] text-[var(--ink-muted)]">
                  <Icon name={icon} size={16} />
                </span>
              ) : null}
              <div className={`min-w-0 flex-1 ${icon ? "" : "pl-0.5"}`}>
                <div className="flex items-baseline gap-2">
                  <span className={`min-w-0 flex-1 text-[13px] leading-snug ${tip ? "text-[var(--ink)]" : "font-medium text-[var(--ink)] truncate"}`}>{n.title}</span>
                  {tip ? null : <span className="flex-none text-[11.5px] text-[var(--meta)]">{fresh ? t("ui.notice.now") : clock}</span>}
                </div>
                {n.text ? <div className="mt-0.5 text-[12.5px] text-[var(--ink-muted)] leading-snug">{n.text}</div> : null}
              </div>
            </div>
            {tip ? null : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                aria-label={t("ui.common.close")}
                className="absolute -left-[9px] -top-[9px] w-[22px] h-[22px] grid place-items-center rounded-full border-0 cursor-pointer bg-[var(--surface)] text-[var(--ink-muted)] hover:text-[var(--ink)] shadow-[0_1px_4px_rgba(20,30,45,0.18),0_0_0_0.5px_var(--hairline)] opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 focus-visible:opacity-100 transition-[opacity,scale] duration-200"
              >
                <Icon name="close" size={11} stroke={2.2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
