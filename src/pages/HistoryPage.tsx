import { useState } from "react";
import { PagePad, PageHead, Block, Empty, FlowList, Collapse, SearchBox, useI18n } from "../trm";
import { HISTORY } from "./historyEntries";

/** 历史：已被取代的成熟设计，按日期从新到旧，可搜索。数据在 historyEntries.ts。 */
export function HistoryPage() {
  const { t, locale } = useI18n();
  const [q, setQ] = useState("");
  const day = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" });
  const needle = q.trim().toLowerCase();
  const shown = [...HISTORY]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((e) => !needle || [e.date, e.old[locale], e.now[locale], e.why[locale]].some((s) => s.toLowerCase().includes(needle)));
  return (
    <PagePad>
      <PageHead title={t("nav.history")} />
      <Block title={t("demo.history.list")} note={t("demo.history.count", { n: shown.length })} extra={<SearchBox value={q} onChange={setQ} />}>
        <div className="bg-[var(--group)] rounded-[var(--r)] px-5">
          <FlowList
            items={shown}
            keyOf={(e) => e.id}
            render={(e) => (
              <div className="py-4">
                <div className="text-[11.5px] text-[var(--meta)] tabular-nums">{day.format(new Date(`${e.date}T00:00:00`))}</div>
                <div className="mt-1 text-[14px] leading-snug">{e.old[locale]}</div>
                <div className="mt-1.5 text-[13px] leading-relaxed text-[var(--ink-muted)]">{t("demo.history.now", { v: e.now[locale] })}</div>
                <div className="mt-1 text-[12.5px] leading-relaxed text-[var(--help)]">{t("demo.history.why", { v: e.why[locale] })}</div>
              </div>
            )}
          />
          <Collapse open={!shown.length}>
            <Empty icon="search" title={t("demo.history.none")} />
          </Collapse>
        </div>
      </Block>
    </PagePad>
  );
}
