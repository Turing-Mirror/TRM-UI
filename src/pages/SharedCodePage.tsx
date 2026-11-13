import { useState } from "react";
import { PagePad, PageHead, Block, Empty, FlowList, Collapse, SearchBox, useI18n } from "../trm";
import { SHARED_FROM, SHARED_MODULES } from "./sharedModules";

/** 共用代码：Fabric 系列产品共用、又不是界面组件的模块，可搜索。数据在 sharedModules.ts。 */
export function SharedCodePage() {
  const { t, locale } = useI18n();
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = SHARED_MODULES.filter((m) => !needle || [m.id, ...m.names, m.what[locale]].some((s) => s.toLowerCase().includes(needle)));
  return (
    <PagePad>
      <PageHead title={t("nav.sharedCode")} />
      <Block title={t("demo.sharedCode.list")} note={t("demo.sharedCode.count", { n: shown.length })} extra={<SearchBox value={q} onChange={setQ} />}>
        <div className="bg-[var(--group)] rounded-[var(--r)] px-5">
          <FlowList
            items={shown}
            keyOf={(m) => m.id}
            render={(m) => (
              <div className="py-4">
                <div className="text-[13px] leading-snug font-mono break-words">{m.names.join("  ")}</div>
                <div className="mt-1.5 text-[13px] leading-relaxed text-[var(--ink-muted)]">{m.what[locale]}</div>
                <div className="mt-1 text-[12.5px] leading-relaxed text-[var(--help)]">{t("demo.sharedCode.from", { v: SHARED_FROM })}</div>
              </div>
            )}
          />
          <Collapse open={!shown.length}>
            <Empty icon="search" title={t("demo.sharedCode.none")} />
          </Collapse>
        </div>
      </Block>
    </PagePad>
  );
}
