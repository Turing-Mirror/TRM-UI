import { Block, Group, useI18n } from "../trm";
import type { Example, Rule } from "./rules";

/** 示范里的代码行（以 < 开头）用等宽字，其余按正文排。 */
function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) =>
        line.startsWith("<") ? (
          <code key={i} className="block mt-1 text-[12px] font-mono break-all text-[var(--ink-muted)]">{line}</code>
        ) : (
          <span key={i} className="block">{line}</span>
        ),
      )}
    </>
  );
}

function ExampleRow({ e, term }: { e: Example; term: string }) {
  const { t, locale } = useI18n();
  const pair = e.pairs[locale];
  if (!pair) return null;
  return (
    <div className="py-3.5">
      {term ? <div className="text-[13px] font-medium mb-2">{term}</div> : null}
      <div className="grid gap-x-6 gap-y-2.5 min-[900px]:grid-cols-2">
        <div className="min-w-0">
          <div className="text-[11.5px] text-[var(--meta)] mb-1">{t("demo.text.wrong")}</div>
          <div className="text-[13.5px] leading-relaxed text-[var(--ink-muted)]">
            <Lines text={pair[0]} />
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[11.5px] text-[var(--meta)] mb-1">{t("demo.text.right")}</div>
          <div className="text-[13.5px] leading-relaxed">
            <Lines text={pair[1]} />
          </div>
        </div>
      </div>
      {e.source ? <div className="text-[11.5px] text-[var(--meta)] mt-1.5">{t("demo.text.source", { v: e.source })}</div> : null}
    </div>
  );
}

/** 一条规则：标题、说明、编号原则、当前语言的示范、补充说明。 */
export function RuleBlock({ rule }: { rule: Rule }) {
  const { locale } = useI18n();
  const shown = rule.examples.filter((e) => e.pairs[locale]);
  return (
    <Block title={rule.title[locale]}>
      {rule.lead?.map((p) => (
        <p key={p[locale]} className="text-[12.5px] text-[var(--help)] leading-relaxed m-0 mb-3">{p[locale]}</p>
      ))}
      {rule.list?.length ? (
        <Group>
          <ol className="list-decimal m-0 py-2 pl-5 flex flex-col gap-2.5 text-[13.5px] leading-relaxed">
            {rule.list.map((item) => (
              <li key={item[locale]}>{item[locale]}</li>
            ))}
          </ol>
        </Group>
      ) : null}
      {shown.length ? (
        <Group>
          {shown.map((e, i) => {
            // 连续几组属于同一类时，类名只在第一组上写一次。
            const term = e.term?.[locale] ?? "";
            return <ExampleRow key={i} e={e} term={term !== shown[i - 1]?.term?.[locale] ? term : ""} />;
          })}
        </Group>
      ) : null}
      {rule.note ? (
        <p className="text-[12.5px] text-[var(--help)] leading-relaxed m-0 mt-3">{rule.note[locale]}</p>
      ) : null}
    </Block>
  );
}
