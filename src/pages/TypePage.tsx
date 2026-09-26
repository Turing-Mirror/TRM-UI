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

/** 排版样张：一句西文、一句中文，两套字形在每一档字号下都要看一遍。样张是固定内容，不随界面语言变。 */
const SPECIMENS = ["Touching the setsuna, reaching the future.", "学园 × 青春 × 物语"] as const;

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
                <div className="min-w-0 flex flex-col gap-1" style={{ fontSize: s.px, fontWeight: s.weight }}>
                  {SPECIMENS.map((x) => (
                    <span key={x} className="truncate">{x}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Group>
      </Block>

      <Block title={t("demo.type.roleHelp")}>
        <Group>
          <div className="py-4 flex flex-col gap-4">
            {SPECIMENS.map((x) => (
              <div key={x} className="flex flex-col gap-1">
                <div className="text-sm">{x}</div>
                <div className="text-[12.5px] text-[var(--help)]">{x}</div>
                <div className="text-[11.5px] text-[var(--meta)]">{x}</div>
              </div>
            ))}
          </div>
        </Group>
      </Block>
    </PagePad>
  );
}
