/** 支持的界面语言。语言包放在 `i18n/locales/{code}.json`。 */
export type LocaleCode =
  | "zh-CN"
  | "en-US"
  | "es-ES"
  | "fr-FR"
  | "ja-JP"
  | "ko-KR"
  | "ru-RU"
  | "zh-TW";

/** 语言选择器里的顺序。中文在前是因为这是母语市场优先的产品。 */
export const LOCALES: { id: LocaleCode; labelKey: string }[] = [
  { id: "zh-CN", labelKey: "locale.zh-CN" },
  { id: "zh-TW", labelKey: "locale.zh-TW" },
  { id: "en-US", labelKey: "locale.en-US" },
  { id: "ja-JP", labelKey: "locale.ja-JP" },
  { id: "ko-KR", labelKey: "locale.ko-KR" },
  { id: "es-ES", labelKey: "locale.es-ES" },
  { id: "fr-FR", labelKey: "locale.fr-FR" },
  { id: "ru-RU", labelKey: "locale.ru-RU" },
];

export const DEFAULT_LOCALE: LocaleCode = "zh-CN";

export function isLocaleCode(v: unknown): v is LocaleCode {
  return (
    typeof v === "string" && (LOCALES as { id: string }[]).some((l) => l.id === v)
  );
}

/**
 * 把系统/浏览器的语言标记映射到我们支持的某一种。
 *
 * 不能只做精确匹配：真实世界里拿到的是 `zh-Hans-CN`、`en-GB`、`ja` 这种，
 * 精确匹配一个都对不上，结果就是所有非简中用户都掉进默认语言。
 * 繁体要单独判：zh-TW / zh-HK / zh-MO / zh-Hant 都归 zh-TW，
 * 其余 zh-* 归 zh-CN。
 */
export function detectSystemLocale(tag?: string | null): LocaleCode {
  const raw = (
    tag ||
    (typeof navigator !== "undefined"
      ? navigator.language || navigator.languages?.[0]
      : "") ||
    DEFAULT_LOCALE
  )
    .toString()
    .trim()
    .replace(/_/g, "-");
  if (!raw) return DEFAULT_LOCALE;
  if (isLocaleCode(raw)) return raw;
  const lower = raw.toLowerCase();
  if (lower.startsWith("zh")) {
    if (
      lower.includes("tw") ||
      lower.includes("hk") ||
      lower.includes("mo") ||
      lower.includes("hant")
    ) {
      return "zh-TW";
    }
    return "zh-CN";
  }
  const base = lower.split("-")[0];
  const map: Record<string, LocaleCode> = {
    en: "en-US",
    ja: "ja-JP",
    ko: "ko-KR",
    es: "es-ES",
    fr: "fr-FR",
    ru: "ru-RU",
  };
  return map[base] ?? DEFAULT_LOCALE;
}

export type Dict = Record<string, unknown>;

export type TVars = Record<string, string | number | undefined | null>;

export type TranslateFn = (key: string, vars?: TVars) => string;
