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
 */
export function applyAppearance(
  a: Appearance,
  resolveAsset?: (path: string) => string,
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
    } catch {
      // resolveAsset 在没有宿主环境时会抛。壁纸本来就只在装好的软件里
      // 有意义，抛了就当没设。
      el.style.removeProperty("--wp-image");
    }
  } else {
    el.style.removeProperty("--wp-image");
  }
}

function clamp(v: number, lo: number, hi: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}
