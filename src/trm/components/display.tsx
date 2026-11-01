/**
 * 内容里反复出现的小件：标签、说明行、应用标、进度条、小节、空状态、页内分栏、翻页。
 * 控件在 ui.tsx 与 controls.tsx，这里管「内容怎么排」。
 */
import { startTransition, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "../i18n";
import { Icon, isIconName, type IconName } from "./Icon";
import { FLOW_MS, curve, sliderStyle, useSlider } from "./motion";
import { hoverInk, useHoverStyle } from "../lib/hoverStyle";

export type Tone = "ok" | "warn" | "muted" | "accent" | "danger";

const TONE_TEXT: Record<Tone, string> = {
  ok: "text-[var(--ok)]",
  warn: "text-[var(--warn-ink)]",
  accent: "text-[var(--accent)]",
  danger: "text-[var(--danger)]",
  muted: "text-[var(--meta)]",
};

/**
 * 标签：一段小字，靠颜色区分。不画底色、不画胶囊、不加色点。
 * 一行里放几个标签时只靠间距隔开，不用「·」（见 Meta）。
 */
export function Tag({ tone = "muted", children, icon }: { tone?: Tone; children: ReactNode; icon?: IconName }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[12px] leading-none whitespace-nowrap ${TONE_TEXT[tone]}`}>
      {icon ? <Icon name={icon} size={12} stroke={1.9} /> : null}
      {children}
    </span>
  );
}

/**
 * 一行小字说明。每项写成「名称：值」，各项之间只靠间距隔开，不用「·」「|」拼接。
 * 空的项跳过。规则见 src/pages/textRules.ts。
 */
export function Meta({ children, className = "" }: { children: ReactNode[]; className?: string }) {
  const parts = children.filter((c) => c !== null && c !== undefined && c !== false && c !== "");
  return (
    <span className={`inline-flex items-center gap-x-3 gap-y-0.5 flex-wrap text-[12px] text-[var(--meta)] ${className}`}>
      {parts.map((c, i) => (
        <span key={i} className="inline-flex items-center">
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
        // 图标按钮没有底：悬停、选中都只改图标本身的颜色，见 src/pages/interactionRules.ts
        "w-8 h-8 grid place-items-center rounded-[var(--rs)] border-0 bg-transparent cursor-pointer transition-colors",
        active ? "text-[var(--accent)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
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
 * 不用胶囊底色，也不画整条分割线。点下去的那一刻指示条就走，内容的更新放进过渡里，
 * 内容再多也不会先卡住指示条。
 */
export function Tabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string; count?: number }[];
  onChange: (v: T) => void;
}) {
  const [shown, setShown] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setShown(value);
  }
  const { box, pos, armed, jump } = useSlider<HTMLDivElement>();
  return (
    <div ref={box} role="tablist" className="relative flex items-center gap-5 flex-wrap">
      {options.map((o) => {
        const on = o.id === shown;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={(e) => {
              if (o.id === shown) return;
              jump(e.currentTarget);
              setShown(o.id);
              startTransition(() => onChange(o.id));
            }}
            className={[
              "relative h-8 px-0 border-0 bg-transparent cursor-pointer text-[13.5px] transition-colors duration-200 whitespace-nowrap",
              on ? "text-[var(--ink)] font-medium" : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            {o.label}
            {o.count !== undefined ? <span className="ml-1.5 text-[var(--meta)] font-normal">{o.count}</span> : null}
          </button>
        );
      })}
      {pos ? <span aria-hidden data-armed={armed || undefined} className="slider h-[2px] rounded-full bg-[var(--accent)]" style={{ ...sliderStyle(pos, "bar"), top: pos.y + pos.h - 2 }} /> : null}
    </div>
  );
}

/**
 * 列表上方的一排筛选。比分栏轻一级。默认（soft）选中的一项底色略深，换项时底色滑过去；
 * plain 样式下不画底，选中项换成强调色。见 lib/hoverStyle。
 */
export function Filters<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  const look = useHoverStyle();
  const [shown, setShown] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setShown(value);
  }
  const { box, pos, armed, jump } = useSlider<HTMLDivElement>();
  return (
    <div ref={box} className="relative flex items-center gap-1 flex-wrap" role="radiogroup">
      {pos && look === "soft" ? <span aria-hidden data-armed={armed || undefined} className="slider rounded-[var(--rs)] bg-[color-mix(in_srgb,var(--ink)_7%,transparent)]" style={sliderStyle(pos, "box")} /> : null}
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === shown}
          onClick={(e) => {
            if (o.id === shown) return;
            jump(e.currentTarget);
            setShown(o.id);
            startTransition(() => onChange(o.id));
          }}
          className={`relative h-7 px-2.5 inline-flex items-center gap-1.5 rounded-[var(--rs)] border-0 cursor-pointer text-[12.5px] bg-transparent transition-colors duration-200 ${o.id === shown ? (look === "plain" ? "text-[var(--accent)] font-medium" : "text-[var(--ink)] font-medium") : `text-[var(--ink-muted)] ${hoverInk(look)}`}`}
        >
          {o.label}
          {o.count !== undefined ? <span className="text-[11.5px] text-[var(--meta)] font-normal tabular-nums">{o.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

/**
 * 翻页。只有一页时不显示；页码多时中间用省略号。
 * 换页时当前页的标记滑过去；留下的页码滑到新位置，新出现的页码淡入，离开的页码原地淡出，整排不跳。
 */
export function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  const { t } = useI18n();
  const look = useHoverStyle();
  const { box, pos, armed } = useSlider<HTMLDivElement>();
  const lefts = useRef<Map<string, { x: number; label: string }> | null>(null);
  const [ghosts, setGhosts] = useState<{ key: string; x: number; label: string; seq: number }[]>([]);
  const list = pageList(page, pages);
  // 省略号按它前面那个页码取名，前后页码不变时它也算同一个
  const keyed = list.map((p, i) => ({ p, key: p === null ? `gap-${list[i - 1]}` : `p${p}` }));
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const now = new Map<string, { x: number; label: string }>();
    const easing = curve("--ease-nav");
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.querySelectorAll<HTMLElement>(":scope > [data-k]").forEach((node) => {
      const key = node.dataset.k ?? "";
      now.set(key, { x: node.offsetLeft, label: node.textContent ?? "" });
      const was = lefts.current?.get(key);
      if (quiet || !lefts.current) return;
      if (!was) node.animate([{ opacity: 0, transform: "scale(0.86)" }, { opacity: 1, transform: "none" }], { duration: FLOW_MS, easing });
      else if (was.x !== node.offsetLeft) node.animate([{ transform: `translate3d(${was.x - node.offsetLeft}px, 0, 0)` }, { transform: "none" }], { duration: FLOW_MS, easing });
    });
    const gone = lefts.current ? [...lefts.current].filter(([k]) => !now.has(k)) : [];
    lefts.current = now;
    if (gone.length && !quiet) setGhosts(gone.map(([key, v]) => ({ key, ...v, seq: Date.now() })));
  }, [page, pages, box]);
  useLayoutEffect(() => {
    if (!ghosts.length) return;
    const id = window.setTimeout(() => setGhosts([]), FLOW_MS);
    return () => window.clearTimeout(id);
  }, [ghosts]);
  if (pages <= 1) return null;
  const btn = "relative h-8 min-w-8 px-2 grid place-items-center rounded-[var(--rs)] border-0 bg-transparent cursor-pointer text-[13px] tabular-nums transition-colors disabled:opacity-30 disabled:cursor-default";
  const hover = hoverInk(look);
  return (
    <nav aria-label={t("ui.pager.label")} className="mt-8 flex items-center justify-center gap-1">
      <button type="button" aria-label={t("ui.pager.prev")} disabled={page <= 1} onClick={() => onChange(page - 1)} className={`${btn} text-[var(--ink-muted)] ${hover}`}>
        <Icon name="back" size={15} />
      </button>
      <div ref={box} className="relative flex items-center gap-1">
        {pos && look === "soft" ? <span aria-hidden data-armed={armed || undefined} className="slider rounded-[var(--rs)] bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]" style={sliderStyle(pos, "box")} /> : null}
        {keyed.map(({ p, key }) =>
          p === null ? (
            <span key={key} data-k={key} aria-hidden className="h-8 min-w-6 grid place-items-center text-[13px] text-[var(--meta)]">
              …
            </span>
          ) : (
            <button
              key={key}
              data-k={key}
              type="button"
              aria-current={p === page ? "page" : undefined}
              onClick={() => onChange(p)}
              className={`${btn} ${p === page ? (look === "plain" ? "text-[var(--accent)] font-medium" : "text-[var(--ink)] font-medium") : `text-[var(--ink-muted)] ${hover}`}`}
            >
              {p}
            </button>
          ),
        )}
        {ghosts.map((g) => (
          <span key={`${g.key}-${g.seq}`} aria-hidden className="fade-out absolute top-0 h-8 min-w-8 px-2 grid place-items-center text-[13px] tabular-nums text-[var(--ink-muted)] pointer-events-none" style={{ left: g.x }}>
            {g.label}
          </span>
        ))}
      </div>
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
