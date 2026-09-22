/**
 * TRM UI — 出口。
 *
 * 这个目录**不引用它自己以外的任何东西**（除了 react 和语言包），
 * 所以可以整个复制到别的工程里，也可以将来直接发成 npm 包。
 * 往里加东西时请守住这条：一旦引了产品自己的模块，模板就退化成了「某个
 * 产品的一部分」，而这正是它要解决的问题。
 */

export { PagePad, PageHead, Block, Group, Btn, ListItem, HelpMark } from "./components/ui";
export { Field, Select, RangeBar, Slider, Toggle } from "./components/controls";
export { SegmentControl, type SegmentOption } from "./components/SegmentControl";
export { Tooltip } from "./components/Tooltip";
export { PageHost } from "./components/PageHost";
export { TitleBar, type WindowControls } from "./components/TitleBar";
export { ErrorBoundary } from "./components/ErrorBoundary";

export { createNav, type Nav, type NavDef } from "./lib/nav";
export { copyText } from "./lib/clipboard";
export {
  inHost,
  call as hostCall,
  configGet,
  configSet,
  hostLocaleStore,
  hostWindowControls,
  logToHost,
  markReady,
  type HostConfig,
} from "./lib/host";
export {
  applyAppearance,
  type Appearance,
  type ThemeMode,
} from "./lib/appearance";
// 壁纸色调：applyAppearance 自己会用，单独导出是给需要自己算一遍的地方
// （比如设置页想在选图时先预览一下卡片会变多实）。
export {
  sampleWallpaper,
  toneFromPixels,
  NEUTRAL_TONE,
  type WallpaperTone,
} from "./lib/wallpaperTone";

export {
  I18nProvider,
  useI18n,
  t,
  setTLocale,
  getTLocale,
  LOCALES,
  DEFAULT_LOCALE,
  detectSystemLocale,
  isLocaleCode,
  type LocaleCode,
  type LocaleStore,
  type TranslateFn,
  type TVars,
} from "./i18n";

export { AccordionGroup, type AccordionItem } from "./components/ui";
export { useModalKeys } from "./hooks/useModalKeys";
