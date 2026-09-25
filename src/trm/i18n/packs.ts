import type { Dict, LocaleCode } from "./types";

/**
 * 语言包按文件发现：`i18n/locales/` 里有哪几份，界面就提供哪几种语言。
 * 加一种语言只加一个文件，不改代码。构建时整批打进产物，运行时没有读取。
 */
const files = import.meta.glob<Dict>("../../../i18n/locales/*.json", {
  eager: true,
  import: "default",
});

export const PACKS: Partial<Record<LocaleCode, Dict>> = Object.fromEntries(
  Object.entries(files).map(([path, dict]) => [
    path.slice(path.lastIndexOf("/") + 1, -".json".length),
    dict,
  ]),
);
