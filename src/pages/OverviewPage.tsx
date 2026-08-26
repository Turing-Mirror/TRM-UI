import {
  PagePad,
  PageHead,
  Block,
  Group,
  Field,
  Select,
  ListItem,
  useI18n,
  LOCALES,
  type LocaleCode,
  type ThemeMode,
} from "../trm";

export function OverviewPage({
  theme,
  onTheme,
}: {
  theme: ThemeMode;
  onTheme: (v: ThemeMode) => void;
}) {
  const { t, locale, setLocale } = useI18n();

  return (
    <PagePad>
      <PageHead title={t("demo.overview.title")} sub={t("demo.overview.sub")} />

      <Block title={t("demo.overview.whatTitle")}>
        <div className="text-sm text-[var(--ink-muted)] leading-relaxed whitespace-pre-line">
          {t("demo.overview.whatBody")}
        </div>
      </Block>

      <Block title={t("demo.overview.whyTitle")}>
        <div className="text-sm text-[var(--ink-muted)] leading-relaxed whitespace-pre-line">
          {t("demo.overview.whyBody")}
        </div>
      </Block>

      <Block title={t("demo.overview.ruleTitle")}>
        <Group>
          <ListItem title="1" desc={t("demo.overview.rule1")} />
          <ListItem title="2" desc={t("demo.overview.rule2")} />
          <ListItem title="3" desc={t("demo.overview.rule3")} />
        </Group>
      </Block>

      <Block title={t("nav.color")}>
        <Group>
          <div className="py-3 flex flex-col gap-5">
            <Field
              inline
              label={t("demo.overview.themeLabel")}
              tip={t("demo.overview.themeTip")}
              control={
                <Select
                  value={theme}
                  onChange={(v) => onTheme(v as ThemeMode)}
                  options={[
                    { id: "system", label: t("demo.theme.system") },
                    { id: "light", label: t("demo.theme.light") },
                    { id: "dark", label: t("demo.theme.dark") },
                  ]}
                />
              }
            />
            <Field
              inline
              label={t("demo.overview.langLabel")}
              tip={t("demo.overview.langTip")}
              control={
                <Select
                  value={locale}
                  onChange={(v) => setLocale(v as LocaleCode)}
                  options={LOCALES.map((l) => ({ id: l.id, label: t(l.labelKey) }))}
                />
              }
            />
          </div>
        </Group>
      </Block>
    </PagePad>
  );
}
