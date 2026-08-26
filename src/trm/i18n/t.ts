/**
 * 不依赖 React 的翻译函数。
 *
 * 给两类调用方用：纯逻辑模块（拿不到 hook），以及在 Provider 之外渲染的组件。
 * 它自己记一份当前语言，`I18nProvider` 切语言时会同步过来。
 *
 * 注意它**不会触发重渲染** —— 组件里显示的文案请用 `useI18n().t`，
 * 否则换语言时那几行字会停在旧语言上，直到别的原因导致重渲染。
 */
import { fallbackPack, packOf, translate } from "./dict";
import { DEFAULT_LOCALE, type LocaleCode, type TVars } from "./types";

let _locale: LocaleCode = DEFAULT_LOCALE;

export function setTLocale(code: LocaleCode) {
  _locale = code;
}

export function getTLocale(): LocaleCode {
  return _locale;
}

export function t(key: string, vars?: TVars): string {
  return translate(packOf(_locale), fallbackPack(), key, vars);
}
