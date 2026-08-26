/**
 * 宿主壳的接线。
 *
 * 这一层的存在理由：**组件库本身不许依赖 Tauri**。依赖了就意味着这套界面
 * 只能在桌面壳里跑，没法在浏览器里预览、没法做组件画廊、也没法被别的宿主复用。
 *
 * 所以所有和壳打交道的东西都收在这里，每一项都在没有壳的时候安静降级：
 * 纯网页里语言存 localStorage、窗口按钮干脆不画、崩溃日志只进控制台。
 *
 * 判断有没有壳看 `__TAURI_INTERNALS__` —— 这是 Tauri 注入到页面里的对象，
 * 比 try/catch 一次 invoke 要可靠，也不会在控制台里留下一条吓人的报错。
 */
import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { LocaleStore } from "../i18n";
import type { WindowControls } from "../components/TitleBar";
import { isLocaleCode, type LocaleCode } from "../i18n";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

/** 现在跑在桌面壳里吗。 */
export const inHost: boolean =
  typeof window !== "undefined" && Boolean(window.__TAURI_INTERNALS__);

/**
 * 调壳里的命令。没有壳时返回 `null`，**不抛错**。
 *
 * 返回 null 而不是抛：调用方几乎总是「有就用，没有就算了」，
 * 强迫每个调用点写 try/catch 只会让人偷懒去掉它。
 */
export async function call<T>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T | null> {
  if (!inHost) return null;
  try {
    return await tauriInvoke<T>(cmd, args);
  } catch (e) {
    console.error(`[host] ${cmd} 失败`, e);
    return null;
  }
}

/** 壳里的配置。键与 `src-tauri/src/config.rs` 的 `defaults()` 对应。 */
export type HostConfig = Record<string, unknown>;

export function configGet(): Promise<HostConfig | null> {
  return call<HostConfig>("config_get");
}

export function configSet(patch: HostConfig): Promise<HostConfig | null> {
  return call<HostConfig>("config_set", { patch });
}

/**
 * 语言的读写。有壳时存进 app_config.json，没壳时交回默认的 localStorage。
 *
 * 返回 `undefined` 让 `I18nProvider` 用它自己的默认存储 —— 不要在这里
 * 自己实现一份 localStorage，那就有两份会走偏的实现了。
 */
export const hostLocaleStore: LocaleStore | undefined = inHost
  ? {
      load: async () => {
        const cfg = await configGet();
        const v = cfg?.ui_locale;
        return isLocaleCode(v) ? v : null;
      },
      save: (code: LocaleCode) => {
        void configSet({ ui_locale: code });
      },
    }
  : undefined;

/**
 * 窗口按钮。没有壳时返回 `undefined`，`TitleBar` 就不画那三个按钮。
 *
 * 不画比画了不响应好：一个看着能点、点了没反应的按钮，用户会以为软件坏了。
 */
export function hostWindowControls(): WindowControls | undefined {
  if (!inHost) return undefined;
  try {
    const w = getCurrentWindow();
    return {
      minimize: () => void w.minimize(),
      toggleMaximize: () => void w.toggleMaximize(),
      close: () => void w.close(),
    };
  } catch {
    return undefined;
  }
}

/** 把一行写进壳的日志。用户报障时带得走原因。 */
export function logToHost(line: string): void {
  if (!inHost) return;
  void call("ui_log", { line });
}

/**
 * 告诉壳「界面已经挂起来了」。
 *
 * 这是壳唯一能拿到的**正面**信号 —— 没有它，壳分不清「界面还在加载」和
 * 「界面根本没跑起来」。白窗看门狗全靠这一条。挂载后必须调，一次就够。
 */
export function markReady(): void {
  if (!inHost) return;
  void call("ui_ready");
}
