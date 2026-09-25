import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { Icon } from "./Icon";
import { usePresence } from "./overlay";

/** 本地日期的键，形如 2026-09-24。时间戳按本机时区换算，不按 UTC 切。 */
export function dayKey(at: string | Date): string {
  const d = typeof at === "string" ? new Date(at) : at;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 美式习惯从周日排起，其余从周一排起。 */
const sundayFirst = (locale: string) => locale === "en-US";

/**
 * 月历。有内容的日子用深色字，没有的用浅色字，不加色点；今天画一圈细线，
 * 选中的日子实心。左右翻月，「今天」一键回到本月。
 */
export function Calendar({ value, onChange, marked = new Set(), now }: { value: string | null; onChange: (day: string) => void; marked?: ReadonlySet<string>; now?: Date }) {
  const { t, locale } = useI18n();
  const today = dayKey(now ?? new Date());
  const start = value ?? today;
  const [month, setMonth] = useState(() => ({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 }));

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    // 2026-09-06 是周日
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2026, 8, 6 + i + (sundayFirst(locale) ? 0 : 1))));
  }, [locale]);

  const first = new Date(month.y, month.m, 1);
  const lead = (first.getDay() - (sundayFirst(locale) ? 0 : 1) + 7) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => new Date(month.y, month.m, 1 - lead + i));
  // 最后一行全在下个月就不画
  const rows = cells[35].getMonth() !== month.m ? 5 : 6;
  const shift = (n: number) => setMonth(({ y, m }) => ({ y: y + Math.floor((m + n) / 12), m: (((m + n) % 12) + 12) % 12 }));
  const title = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(first);

  return (
    <div className="w-[280px] p-3 select-none">
      <div className="flex items-center gap-1 pl-2 pb-2">
        <span className="text-[13.5px] font-medium flex-1">{title}</span>
        <button
          type="button"
          onClick={() => setMonth({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 })}
          className="h-7 px-2 rounded-[var(--rs)] border-0 bg-transparent cursor-pointer text-[12px] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
        >
          {t("ui.cal.today")}
        </button>
        <NavBtn label={t("ui.cal.prev")} flip onClick={() => shift(-1)} />
        <NavBtn label={t("ui.cal.next")} onClick={() => shift(1)} />
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] text-[var(--meta)] pb-1">
        {weekdays.map((w, i) => (
          <span key={i} className="h-6 leading-6">{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.slice(0, rows * 7).map((d) => {
          const k = dayKey(d);
          const inMonth = d.getMonth() === month.m;
          const has = marked.has(k);
          const on = k === value;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChange(k)}
              aria-pressed={on}
              aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(d)}
              className={[
                "mx-auto w-9 h-9 rounded-full border-0 cursor-pointer text-[12.5px] tabular-nums transition-colors",
                on
                  ? "bg-[var(--ink)] text-[var(--bg)] font-medium"
                  : [
                      k === today ? "shadow-[inset_0_0_0_1px_var(--focus-line)]" : "",
                      has ? "text-[var(--ink)] font-medium" : "text-[var(--meta)]",
                      inMonth ? "" : "opacity-40",
                      "bg-transparent hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]",
                    ].join(" "),
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavBtn({ label, onClick, flip = false }: { label: string; onClick: () => void; flip?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="w-7 h-7 grid place-items-center rounded-[var(--rs)] border-0 bg-transparent cursor-pointer text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]">
      <Icon name={flip ? "back" : "chevron"} size={15} />
    </button>
  );
}

/** 挂在按钮下方的浮层。点外面或按 Esc 收起。 */
export function useAnchoredPop() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("keydown", key);
    };
  }, [open]);
  // 收起时也放一段动画再卸下
  const { mounted, leaving } = usePresence(open);
  return { open, setOpen, box, mounted, leaving };
}
