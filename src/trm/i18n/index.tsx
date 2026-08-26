/**
 * 轻量 i18n，不依赖 react-i18next。
 *
 * 语言包是 `i18n/locales/{code}.json`，八种语言结构必须完全一致 ——
 * 这一点由 `scripts/check_i18n.mjs` 在构建时强制，不是靠自觉。
 *
 * 用法：
 *   const { t, locale, setLocale } = useI18n();
 *   t("ui.window.close")
 *   t("demo.greeting", { name: "Kara" })
 *
 * 持久化是**注入进来的**，不是写死的。默认存 localStorage；接进 Tauri 时
 * 把读写换成 config 命令即可，见 README 的「接进 Tauri」一节。
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fallbackPack, packOf, translate } from "./dict";
import {
  DEFAULT_LOCALE,
  LOCALES,
  detectSystemLocale,
  isLocaleCode,
  type LocaleCode,
  type TVars,
  type TranslateFn,
} from "./types";
import { setTLocale, t as tStatic } from "./t";

export type { LocaleCode, TVars, TranslateFn };
export { LOCALES, DEFAULT_LOCALE, detectSystemLocale, isLocaleCode };
export { t, setTLocale, getTLocale } from "./t";

/** 语言的读写。宿主可以换成任何存储 —— 返回 Promise 或同步值都行。 */
export type LocaleStore = {
  load: () => Promise<string | null | undefined> | string | null | undefined;
  save: (code: LocaleCode) => void | Promise<void>;
};

const STORAGE_KEY = "trm.ui.locale";

/** 默认存储：localStorage。隐私模式下 localStorage 会抛，抛了就当没存过。 */
const localStorageStore: LocaleStore = {
  load: () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  save: (code) => {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* 存不下就算了，本次会话内照样是对的 */
    }
  },
};

type I18nCtx = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: TranslateFn;
  /** 语言已经从存储里读出来了。false 时可以先不画正文，避免闪一下默认语言。 */
  ready: boolean;
};

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({
  children,
  store = localStorageStore,
}: {
  children: ReactNode;
  store?: LocaleStore;
}) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      let code = detectSystemLocale();
      try {
        const saved = await store.load();
        // 存过就用存的；没存过（新装）按系统语言预选。
        if (isLocaleCode(saved)) code = saved;
      } catch {
        /* 读不出来就按系统语言 */
      }
      if (!alive) return;
      setLocaleState(code);
      setTLocale(code);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
    // store 只在挂载时读一次；宿主换 store 实例不该重新触发一次读取。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback(
    (code: LocaleCode) => {
      setLocaleState(code);
      setTLocale(code);
      document.documentElement.lang = code;
      void store.save(code);
    },
    [store],
  );

  useEffect(() => {
    setTLocale(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const primary = useMemo(() => packOf(locale), [locale]);
  const fallback = useMemo(() => fallbackPack(), []);

  const t = useCallback<TranslateFn>(
    (key, vars) => translate(primary, fallback, key, vars),
    [primary, fallback],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, ready }),
    [locale, setLocale, t, ready],
  );

  // 不要用 key={locale} 去重挂 children。
  //
  // 那样做等于换个语言就把整棵树连同所有状态一起拆掉重建：正在进行的任务、
  // 已经填好的表单、滚动位置全没了。换语言不是重启。
  // 文案靠 context 刷新（组件用 useI18n 订阅），静态调用方靠 setTLocale。
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const v = useContext(Ctx);
  if (!v) {
    // Provider 之外也要能渲染（测试、独立挂载的小窗）—— 退回默认语言的静态翻译，
    // 而不是抛错。一个组件放错位置不该让整个界面白屏。
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key, vars) => tStatic(key, vars),
      ready: true,
    };
  }
  return v;
}
