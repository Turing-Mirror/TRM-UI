import type { Dict, LocaleCode, TVars } from "./types";
import zh from "../../../i18n/locales/zh-CN.json";
import tw from "../../../i18n/locales/zh-TW.json";
import en from "../../../i18n/locales/en-US.json";
import ja from "../../../i18n/locales/ja-JP.json";
import ko from "../../../i18n/locales/ko-KR.json";
import es from "../../../i18n/locales/es-ES.json";
import fr from "../../../i18n/locales/fr-FR.json";
import ru from "../../../i18n/locales/ru-RU.json";

/** 语言包在构建时就打进产物（Vite 直接 import JSON），运行时不再有网络或
 *  文件读取 —— 换语言是一次同步的对象切换，不会有「先显示 key 再变成文字」。 */
const PACKS: Record<LocaleCode, Dict> = {
  "zh-CN": zh as Dict,
  "zh-TW": tw as Dict,
  "en-US": en as Dict,
  "ja-JP": ja as Dict,
  "ko-KR": ko as Dict,
  "es-ES": es as Dict,
  "fr-FR": fr as Dict,
  "ru-RU": ru as Dict,
};

export function packOf(locale: LocaleCode): Dict {
  return PACKS[locale] ?? PACKS["zh-CN"];
}

/** 兜底语言包。任何一条在当前语言里查不到，都回落到这里。 */
export function fallbackPack(): Dict {
  return PACKS["zh-CN"];
}

/**
 * 点号路径查找："ui.window.close" → pack.ui.window.close
 *
 * 中途还会试一次「剩下的整串当成一个字面 key」：这样 JSON 里既可以写成嵌套
 * 对象，也可以写成 `"ui.window.close": "关闭"` 这种平铺的一行，两种写法都能查到。
 */
export function lookup(dict: Dict, key: string): unknown {
  const parts = key.split(".").filter(Boolean);
  if (!parts.length) return undefined;
  let cur: unknown = dict;
  for (let i = 0; i < parts.length; i++) {
    if (cur == null || typeof cur !== "object") return undefined;
    const part = parts[i];
    const obj = cur as Dict;
    if (part in obj) {
      cur = obj[part];
      continue;
    }
    const rest = parts.slice(i).join(".");
    return obj[rest];
  }
  return cur;
}

/**
 * 填充 `{name}` 占位符。
 *
 * 同时接受两种历史写法：`${name}`，以及从左到右按 `v0`、`v1`… 取值的裸 `{}`。
 * 后者是为了让同一份语言包能被 Rust 侧复用 —— 那边的格式化宏用的就是裸括号。
 */
export function interpolate(template: string, vars?: TVars): string {
  if (!vars) return template;
  let slot = 0;
  return template
    .replace(/\$\{(\w+)\}/g, (_, k: string) => {
      const v = vars[k];
      return v == null ? "" : String(v);
    })
    .replace(/\{(\w+)\}/g, (_, k: string) => {
      const v = vars[k];
      return v == null ? "" : String(v);
    })
    .replace(/\{\}/g, () => {
      const v = vars[`v${slot++}`];
      return v == null ? "{}" : String(v);
    });
}

/** 一次查找 + 填充。查不到就把 key 本身还回去 —— 开发时一眼看得出哪条漏了。 */
export function translate(
  primary: Dict,
  fallback: Dict,
  key: string,
  vars?: TVars,
): string {
  let v = lookup(primary, key);
  if (typeof v !== "string") v = lookup(fallback, key);
  if (typeof v !== "string") return key;
  return interpolate(v, vars);
}
