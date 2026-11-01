import { PagePad, PageHead, useI18n } from "../trm";
import { RuleBlock } from "./RuleList";
import { TEXT_RULES } from "./textRules";

export function TextPage() {
  const { t } = useI18n();
  return (
    <PagePad>
      <PageHead title={t("nav.text")} />
      {TEXT_RULES.map((rule) => (
        <RuleBlock key={rule.id} rule={rule} />
      ))}
    </PagePad>
  );
}
