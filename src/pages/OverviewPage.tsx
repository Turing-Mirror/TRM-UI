import { useEffect, useState } from "react";
import {
  PagePad,
  PageHead,
  Block,
  Group,
  Field,
  Select,
  Toggle,
  ListItem,
  useI18n,
  LOCALES,
  inHost,
  hostCall,
  type LocaleCode,
  type ThemeMode,
} from "../trm";

type AutostartStatus = { enabled: boolean; path: string };

export function OverviewPage({
  theme,
  onTheme,
}: {
  theme: ThemeMode;
  onTheme: (v: ThemeMode) => void;
}) {
  const { t, locale, setLocale } = useI18n();
  const [uiSource, setUiSource] = useState("");
  const [autostart, setAutostart] = useState(false);

  // 没有壳时 hostCall 返回 null，这两句就是空转 —— 不需要在调用点再判一次。
  useEffect(() => {
    void hostCall<string>("ui_source").then((v) => setUiSource(v ?? ""));
    void hostCall<AutostartStatus>("autostart_get").then((v) =>
      setAutostart(Boolean(v?.enabled)),
    );
  }, []);

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

      <Block title={t("demo.shell.title")}>
        <Group>
          <div className="py-3 flex flex-col gap-5">
            <div className="text-[12.5px] text-[var(--help)] leading-relaxed">
              {inHost ? t("demo.shell.host") : t("demo.shell.web")}
            </div>
            {inHost ? (
              <>
                <Field
                  inline
                  label={t("demo.shell.source")}
                  tip={t("demo.shell.sourceTip")}
                  control={
                    <span className="text-[13px] text-[var(--ink-muted)] select-text">
                      {uiSource || "—"}
                    </span>
                  }
                />
                <Toggle
                  checked={autostart}
                  tip={t("demo.shell.autostartTip")}
                  label={t("demo.shell.autostart")}
                  onChange={(v) => {
                    // 先乐观置位，再按壳返回的真实状态回正 —— 非 Windows 上
                    // autostart_set 会明确报错，开关必须弹回去而不是停在错的位置。
                    setAutostart(v);
                    void hostCall("autostart_set", { enabled: v }).then(() =>
                      hostCall<AutostartStatus>("autostart_get").then((st) =>
                        setAutostart(Boolean(st?.enabled)),
                      ),
                    );
                  }}
                />
              </>
            ) : null}
          </div>
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
