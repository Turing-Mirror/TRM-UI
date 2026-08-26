import { t } from "../i18n/t";

export type NavDef<T extends string> = {
  id: T;
  /** 语言包里的 key，不是文字本身 —— 标签要跟着语言走。 */
  labelKey: string;
  /** 页签上画一个小圆点（有新内容）。是否真的画由调用方另外控制。 */
  badge?: boolean;
};

export type Nav<T extends string> = {
  defs: readonly NavDef<T>[];
  /** 按当前语言解析出来的页签。切语言后重新调用即可。 */
  pages: () => { id: T; label: string; badge?: boolean }[];
  index: (id: T) => number;
  /** 换页动画的方向：正数 = 在导航顺序里往右走。 */
  direction: (from: T, to: T) => 1 | -1 | 0;
};

/**
 * 定义一个产品的导航。
 *
 * 顺序**就是**换页动画的方向依据 —— 数组里靠后的页在右边，从左边的页切过去
 * 时新页从右侧推入。所以这个数组的顺序必须和标题栏上看到的顺序一致，
 * 否则动画方向会和用户的手感反着来。
 *
 *   const nav = createNav([
 *     { id: "home",     labelKey: "nav.home" },
 *     { id: "settings", labelKey: "nav.settings" },
 *   ] as const);
 */
export function createNav<T extends string>(defs: readonly NavDef<T>[]): Nav<T> {
  const index = (id: T) => defs.findIndex((d) => d.id === id);
  return {
    defs,
    pages: () =>
      defs.map((d) => ({
        id: d.id,
        label: t(d.labelKey),
        ...(d.badge ? { badge: true as const } : {}),
      })),
    index,
    direction: (from, to) => {
      const a = index(from);
      const b = index(to);
      if (a < 0 || b < 0 || a === b) return 0;
      return b > a ? 1 : -1;
    },
  };
}
