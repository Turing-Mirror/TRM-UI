import { NEUTRAL_TONE, sampleWallpaper } from "./wallpaperTone";

export type ThemeMode = "system" | "light" | "dark";

export type Appearance = {
  /** 界面配色。"system" 表示跟随操作系统。 */
  themeMode?: ThemeMode;
  /** 壁纸文件路径或 URL。空 = 不画壁纸。 */
  wallpaper?: string;
  /** 壁纸模糊，0–100。 */
  wallpaperBlur?: number;
  /** 壁纸不透明度，0–100。 */
  wallpaperOpacity?: number;
};

/** 磨砂滑杆是 0–100，换算成实际的高斯半径。24px 上限是试出来的：
 *  再糊下去就只剩一团颜色，看不出用的是哪张图了。 */
const MAX_BLUR_PX = 24;

/**
 * 应用外观：配色 + 壁纸 + 磨砂 + 不透明度。
 *
 * 全都是往 `<html>` 上写几个 CSS 变量，真正画图的是 index.css 里的
 * `body::before`。所以「生效」这件事本身是零成本的 —— 一次 style 写入，
 * 下一帧就变了。
 *
 * **写设置的地方和启动的地方都要调它，传当时最新的整份外观配置。**
 * 这一段最早长在某个 `useEffect` 里、依赖数组写的是 `[page]`，于是它只在
 * **换页**的时候才重新读一次 —— 用户在设置页选了壁纸、拖了磨砂和不透明度，
 * 界面一动不动，非得切到别的页再切回来才看得见。三个开关一个都不「实时」，
 * 看着就像整块功能是坏的。
 *
 * @param resolveAsset 本地文件路径 → 可用的 URL。Tauri 里传
 *   `convertFileSrc`；纯网页里不用传（壁纸直接给 URL 即可）。
 * @param readWallpaperBytes 本地文件路径 → data URL。壁纸色调采样要把图画进
 *   canvas 读像素，而 `resolveAsset` 给出的地址通常是另一个源，画上去 canvas
 *   会被标成 tainted、`getImageData` 抛 SecurityError。传了这个就有退路。
 *   不传也不会坏，只是遇到那种宿主时色调退回中庸值。
 */
export function applyAppearance(
  a: Appearance,
  resolveAsset?: (path: string) => string,
  readWallpaperBytes?: (path: string) => Promise<string>,
): void {
  const el = document.documentElement;

  const mode = a.themeMode ?? "system";
  // "system" 是**移除属性**，不是写上 "system"：CSS 那边靠属性在不在来区分
  // 「跟随系统」和「明确选了某一种」。写上字符串等于三种状态全都匹配不上。
  if (mode === "system") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", mode);

  el.style.setProperty(
    "--wp-blur",
    `${(clamp(a.wallpaperBlur ?? 40, 0, 100) / 100) * MAX_BLUR_PX}px`,
  );
  el.style.setProperty(
    "--wp-opacity",
    String(clamp(a.wallpaperOpacity ?? 70, 0, 100) / 100),
  );

  const path = a.wallpaper ?? "";
  if (path) {
    try {
      const url = resolveAsset ? resolveAsset(path) : path;
      // 路径里可能有引号，转义掉，否则 url("…") 会被提前截断。
      el.style.setProperty("--wp-image", `url("${url.replace(/"/g, '\\"')}")`);
      // 设了图就先把开关打上，别等采样。采样要解码一张几兆的图，慢的话是几十
      // 毫秒；这中间卡片如果还是「没有壁纸」那一套，用户会看见界面闪一下。
      // `--wp-detail` 有默认值 0.5，先按中庸那档画，采完再落到准确值。
      el.setAttribute("data-wallpaper", "on");
      void applyTone(el, path, url, readWallpaperBytes);
    } catch {
      // resolveAsset 在没有宿主环境时会抛。壁纸本来就只在装好的软件里
      // 有意义，抛了就当没设。
      el.style.removeProperty("--wp-image");
      clearTone(el);
    }
  } else {
    el.style.removeProperty("--wp-image");
    clearTone(el);
  }
}

/** 上一次采过的图。同一张图换个磨砂值不必重采。 */
let sampledPath = "";

function clearTone(el: HTMLElement): void {
  sampledPath = "";
  el.removeAttribute("data-wallpaper");
  el.style.removeProperty("--wp-tint");
  el.style.removeProperty("--wp-detail");
}

async function applyTone(
  el: HTMLElement,
  path: string,
  url: string,
  readBytes?: (path: string) => Promise<string>,
): Promise<void> {
  if (path === sampledPath) return;
  sampledPath = path;
  // 直接采样多半会被 canvas 的同源策略挡下来（宿主给的 asset 地址是另一个
  // 源）。挡下来就走宿主给的那条退路，把字节读成 data URL 再采一次。
  const tone = await sampleWallpaper(
    url,
    readBytes ? () => readBytes(path) : undefined,
  ).catch(() => NEUTRAL_TONE);
  // 采样是异步的，这中间用户可能已经换了图甚至清空了。以最后一次为准。
  if (sampledPath !== path) return;
  el.style.setProperty("--wp-tint", `rgb(${tone.tint})`);
  el.style.setProperty("--wp-detail", String(Math.round(tone.detail * 100) / 100));
}

function clamp(v: number, lo: number, hi: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}
