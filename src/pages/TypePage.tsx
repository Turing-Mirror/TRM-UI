import { PagePad, PageHead, Block, Group, useI18n } from "../trm";

/** 字号档位是定死的。要加一档先想清楚它和相邻两档的分工，别随手插中间值。 */
const SCALE = [
  { px: 25, weight: 600, roleKey: "demo.overview.title", note: "PageHead" },
  { px: 15.5, weight: 600, roleKey: "nav.components", note: "Block" },
  { px: 15, weight: 400, roleKey: "demo.type.roleBody", note: "body" },
  { px: 14, weight: 400, roleKey: "demo.type.roleBody", note: "ListItem" },
  { px: 12.5, weight: 400, roleKey: "demo.type.roleHelp", note: "--help" },
  { px: 11.5, weight: 400, roleKey: "demo.type.roleMeta", note: "--meta" },
] as const;

export function TypePage() {
  const { t } = useI18n();
  return (
    <PagePad>
      <PageHead title={t("nav.type")} sub={t("demo.type.sub")} />

      <Block title={t("nav.type")}>
        <Group>
          <div className="py-3 flex flex-col divide-y divide-[var(--hairline)]">
            {SCALE.map((s, i) => (
              <div key={i} className="py-3.5 flex items-baseline gap-5">
                <div className="w-[110px] flex-none text-[11.5px] text-[var(--meta)] tabular-nums">
                  {s.px}px · {s.weight} · {s.note}
                </div>
                <div
                  className="min-w-0 truncate"
                  style={{ fontSize: s.px, fontWeight: s.weight }}
                >
                  {t("demo.type.sample")}
                </div>
              </div>
            ))}
          </div>
        </Group>
      </Block>

      <Block title={t("demo.type.roleHelp")}>
        <Group>
          <div className="py-4 flex flex-col gap-2">
            <div className="text-sm">{t("demo.type.sample")}</div>
            <div className="text-[12.5px] text-[var(--help)]">
              {t("demo.type.sample")}
            </div>
            <div className="text-[11.5px] text-[var(--meta)]">
              {t("demo.type.sample")}
            </div>
          </div>
        </Group>
      </Block>
    </PagePad>
  );
}
