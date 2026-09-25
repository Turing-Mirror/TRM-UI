/**
 * 内容里反复出现的小件：标签、说明行、应用标、进度条、小节、空状态、页内分栏、翻页。
 * 控件在 ui.tsx 与 controls.tsx，这里管「内容怎么排」。
 */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "../i18n";
import { Icon, isIconName, type IconName } from "./Icon";

export type Tone = "ok" | "warn" | "muted" | "accent" | "danger";

const TONE_TEXT: Record<Tone, string> = {
  ok: "text-[var(--ok)]",
  warn: "text-[var(--warn-ink)]",
  accent: "text-[var(--accent)]",
  danger: "text-[var(--danger)]",
  muted: "text-[var(--meta)]",
};

/**
 * 标签：一段小字，靠颜色区分。不画底色、不画胶囊、不加色点，
 * 一行里的几个标签之间用「·」隔开（见 Meta）。
 */
export function Tag({ tone = "muted", children, icon }: { tone?: Tone; children: ReactNode; icon?: IconName }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[12px] leading-none whitespace-nowrap ${TONE_TEXT[tone]}`}>
      {icon ? <Icon name={icon} size={12} stroke={1.9} /> : null}
      {children}
    </span>
  );
}

/** 一行小字说明，各项之间用间隔号隔开。空的项跳过。 */
export function Meta({ children, className = "" }: { children: ReactNode[]; className?: string }) {
  const parts = children.filter((c) => c !== null && c !== undefined && c !== false && c !== "");
  return (
    <span className={`inline-flex items-center gap-x-1.5 flex-wrap text-[12px] text-[var(--meta)] ${className}`}>
      {parts.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i ? <span aria-hidden>·</span> : null}
          {c}
        </span>
      ))}
    </span>
  );
}

/** 六组浅色，给没有真图的图块、应用标轮换着用。 */
export type Art = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 应用的标。有真图标就放真图标；没有时画一个线条图标或首字母。
 * plain 不垫底色，只留图标本身，用在侧栏这类一行一项的地方。
 */
export function Mark({ art, text, size = 40, glyph, plain = false }: { art: Art; text: string; size?: number; glyph?: string; plain?: boolean }) {
  const icon = glyph && isIconName(glyph) ? glyph : null;
  if (plain) {
    return (
      <span className="flex-none grid place-items-center font-semibold" style={{ width: size, height: size, fontSize: size * 0.5, color: `color-mix(in srgb, var(--art-${art}) 35%, var(--ink-muted))` }}>
        {icon ? <Icon name={icon} size={Math.round(size * 0.8)} stroke={1.7} /> : text.slice(0, 1)}
      </span>
    );
  }
  return (
    <span
      className="flex-none grid place-items-center rounded-[calc(var(--rs)+2px)] text-[var(--ink-muted)] font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.32, background: `linear-gradient(145deg, var(--art-${art}), color-mix(in srgb, var(--art-${art}) 60%, var(--surface)))` }}
    >
      {icon ? <Icon name={icon} size={Math.round(size * 0.5)} stroke={1.7} className="text-[color-mix(in_srgb,var(--ink)_62%,transparent)]" /> : text}
    </span>
  );
}

/** 细进度条。 */
export function Bar({ value, tone = "accent", thin = false }: { value: number; tone?: "accent" | "ok" | "warn" | "danger"; thin?: boolean }) {
  return (
    <div className={`w-full rounded-full bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] overflow-hidden ${thin ? "h-1" : "h-1.5"}`}>
      <div className="h-full rounded-full transition-[width] duration-200 ease-[var(--ease)]" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: `var(--${tone})` }} />
    </div>
  );
}

/** 页面内的小节：标题一行，右边可放操作。比 Block 紧凑，给卡片网格与列表用。 */
export function Section({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`mt-7 ${className}`}>
      <div className="flex items-center mb-3 gap-3">
        <h3 className="m-0 text-[15px] font-semibold">{title}</h3>
        {action ? <div className="ml-auto flex items-center gap-2">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** 只有图标的按钮。label 必给，读屏与悬停提示都用它。 */
export function IconBtn({ icon, label, onClick, active = false, size = 18 }: { icon: IconName; label: string; onClick?: () => void; active?: boolean; size?: number }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={[
        "w-8 h-8 grid place-items-center rounded-[var(--rs)] border-0 cursor-pointer transition-colors",
        active ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-transparent text-[var(--ink-muted)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] hover:text-[var(--ink)]",
      ].join(" ")}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}

/** 空状态：一个图标、一句标题，可带一句说明与一个操作。 */
export function Empty({ icon, title, desc, action }: { icon: IconName; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="py-14 flex flex-col items-center text-center gap-2 text-[var(--ink-muted)]">
      <span className="text-[var(--meta)]">
        <Icon name={icon} size={28} stroke={1.4} />
      </span>
      <div className="text-sm text-[var(--ink)]">{title}</div>
      {desc ? <div className="text-[12.5px] text-[var(--help)] max-w-[360px]">{desc}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/**
 * 页内的分类切换：一排文字，选中的那项下面有一小段指示条，换项时滑过去。
 * 不用胶囊底色，也不画整条分割线。
 */
export function Tabs<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  const row = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
  const [armed, setArmed] = useState(false);
  useLayoutEffect(() => {
    const el = row.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!el) return;
    setBar({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value, options.length]);
  // 第一次量完之前不开过渡，免得指示条从最左边滑进来
  useEffect(() => {
    if (bar && !armed) requestAnimationFrame(() => setArmed(true));
  }, [bar, armed]);
  return (
    <div ref={row} role="tablist" className="relative flex items-center gap-5 flex-wrap">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.id)}
            className={["relative h-8 px-0 border-0 bg-transparent cursor-pointer text-[13.5px] transition-colors whitespace-nowrap", on ? "text-[var(--ink)] font-medium" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"].join(" ")}
          >
            {o.label}
            {o.count !== undefined ? <span className="ml-1.5 text-[var(--meta)] font-normal">{o.count}</span> : null}
          </button>
        );
      })}
      {bar ? (
        <span
          aria-hidden
          className={`absolute bottom-0 h-[2px] rounded-full bg-[var(--accent)] ${armed ? "transition-[left,width] duration-[340ms] ease-[var(--ease-soft)]" : ""}`}
          style={{ left: bar.left, width: bar.width }}
        />
      ) : null}
    </div>
  );
}

/** 列表上方的一排筛选，比 Tabs 轻一级：选中的一项底色略深。 */
export function Filters<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center gap-1 flex-wrap" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          onClick={() => onChange(o.id)}
          className={`h-7 px-2.5 inline-flex items-center gap-1.5 rounded-[var(--rs)] border-0 cursor-pointer text-[12.5px] transition-colors ${o.id === value ? "bg-[color-mix(in_srgb,var(--ink)_7%,transparent)] text-[var(--ink)] font-medium" : "bg-transparent text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_4%,transparent)]"}`}
        >
          {o.label}
          {o.count !== undefined ? <span className="text-[11.5px] text-[var(--meta)] font-normal tabular-nums">{o.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** 翻页。只有一页时不显示；页码多时中间用省略号。 */
export function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  const { t } = useI18n();
  if (pages <= 1) return null;
  const btn = "h-8 min-w-8 px-2 grid place-items-center rounded-[var(--rs)] border-0 bg-transparent cursor-pointer text-[13px] transition-colors disabled:opacity-30 disabled:cursor-default";
  const hover = "hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]";
  return (
    <nav aria-label={t("ui.pager.label")} className="mt-8 flex items-center justify-center gap-1">
      <button type="button" aria-label={t("ui.pager.prev")} disabled={page <= 1} onClick={() => onChange(page - 1)} className={`${btn} text-[var(--ink-muted)] ${hover}`}>
        <Icon name="back" size={15} />
      </button>
      {pageList(page, pages).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} aria-hidden className="h-8 min-w-6 grid place-items-center text-[13px] text-[var(--meta)]">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
            className={`${btn} ${p === page ? "text-[var(--ink)] font-medium bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]" : `text-[var(--ink-muted)] ${hover}`}`}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" aria-label={t("ui.pager.next")} disabled={page >= pages} onClick={() => onChange(page + 1)} className={`${btn} text-[var(--ink-muted)] ${hover}`}>
        <Icon name="chevron" size={15} />
      </button>
    </nav>
  );
}

/** 页码多时只列首尾与当前页前后各一页，中间用省略号。null 是省略号。 */
export function pageList(page: number, pages: number): (number | null)[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const keep = new Set([1, pages, page - 1, page, page + 1, ...(page <= 3 ? [2, 3, 4] : []), ...(page >= pages - 2 ? [pages - 3, pages - 2, pages - 1] : [])]);
  const list = [...keep].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  return list.flatMap((p, i) => (i && p - list[i - 1] > 1 ? [null, p] : [p]));
}

/** 按页取一段。筛选条件（reset）一变就回到第一页；页码超出时退回最后一页。 */
export function usePaged<T>(items: T[], size: number, reset = "") {
  const [page, setPage] = useState(1);
  const [lastReset, setLastReset] = useState(reset);
  if (reset !== lastReset) {
    setLastReset(reset);
    setPage(1);
  }
  const pages = Math.max(1, Math.ceil(items.length / size));
  const at = Math.min(page, pages);
  return { page: at, pages, setPage, slice: items.slice((at - 1) * size, at * size) };
}
