import { PagePad, PageHead, Block, Group, useI18n } from "../trm";
import { TEXT_RULES, type TextExample } from "./textRules";

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

function Example({ e, showTerm }: { e: TextExample; showTerm: boolean }) {
  const { t } = useI18n();
  return (
    <div className="py-3.5">
      {showTerm && e.term ? <div className="text-[13px] font-medium mb-2">{e.term}</div> : null}
      <div className="grid gap-x-6 gap-y-2.5 min-[900px]:grid-cols-2">
        <div className="min-w-0">
          <div className="text-[11.5px] text-[var(--meta)] mb-1">{t("demo.text.wrong")}</div>
          <div className="text-[13.5px] leading-relaxed text-[var(--ink-muted)]">
            <Lines text={e.wrong} />
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[11.5px] text-[var(--meta)] mb-1">{t("demo.text.right")}</div>
          <div className="text-[13.5px] leading-relaxed">
            <Lines text={e.right} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TextPage() {
  const { t } = useI18n();
  return (
    <PagePad>
      <PageHead title={t("nav.text")} sub={t("demo.text.sub")} />

      {TEXT_RULES.map((rule) => (
        <Block key={rule.title} title={rule.title}>
          {rule.lead?.map((p) => (
            <p key={p} className="text-[12.5px] text-[var(--help)] leading-relaxed m-0 mb-3">{p}</p>
          ))}
          {rule.list?.length ? (
            <Group>
              <ol className="list-decimal m-0 py-2 pl-5 flex flex-col gap-2.5 text-[13.5px] leading-relaxed">
                {rule.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </Group>
          ) : null}
          {rule.examples.length ? (
            <Group>
              {rule.examples.map((e, i) => (
                // 连续几组属于同一类时，类名只在第一组上写一次。
                <Example key={i} e={e} showTerm={e.term !== rule.examples[i - 1]?.term} />
              ))}
            </Group>
          ) : null}
          {rule.note ? (
            <p className="text-[12.5px] text-[var(--help)] leading-relaxed m-0 mt-3">{rule.note}</p>
          ) : null}
        </Block>
      ))}
    </PagePad>
  );
}
