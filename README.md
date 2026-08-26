# TRM UI

图灵镜（Turing Mirror Software）桌面产品的 UI/UX 模板：设计令牌、组件库、八语言 i18n，以及一份开箱能跑的工程配置。

从 [RVC Fabric](https://github.com/Turing-Mirror/RVC-Fabric) 的界面层抽取而来，**不包含任何产品代码**。

[English](./README_en.md)

---

## 为什么有它

「照抄 RVC Fabric 的 UI」这句话，曾经被反复执行成「复制整个仓库再魔改」。结果是每个新产品都从一堆用不上的代码开始，设计系统靠人肉同步，每同步一次就歪一点。

把界面这一层单独拿出来之后：新产品从它起步，改进也回流到它 —— 而不是回流到五份互相分叉的副本里。

## 里面有什么

```
src/trm/                 ← 模板本体，可以整个复制走
├── index.ts             出口
├── components/
│   ├── ui.tsx           PagePad PageHead Block Group Btn ListItem
│   ├── controls.tsx     Field Select RangeBar Slider Toggle
│   ├── SegmentControl.tsx
│   ├── Tooltip.tsx      Tooltip HelpMark
│   ├── TitleBar.tsx     无边框窗口的标题栏
│   ├── PageHost.tsx     方向性换页
│   └── ErrorBoundary.tsx
├── i18n/                八语言，构建时打包，同步切换
└── lib/                 nav / clipboard / appearance

src/index.css            设计令牌 + 主题 + 动画  ← 核心资产
src/pages/               演示站（可删）
i18n/locales/*.json      八份语言包
scripts/check_i18n.mjs   三道 i18n 硬校验
index.html               白窗兜底守卫
```

## 跑起来

```bash
npm install && npm run dev
```

打开 http://localhost:1410 —— 一个组件画廊，每一个都是真能操作的控件。

```bash
npm run build
```

构建会依次跑 `eslint` → `tsc` → `check_i18n` → `vite build`，任何一步失败就停。

## 三条硬规矩

**一、颜色只从令牌取。** 写死的颜色字面量在另一个主题下必然是错的，而且只有换主题时才看得出来 —— 也就是说，正常开发流程里没有任何一步会发现它。

**二、文案只从语言包取。** 八种语言的结构由 `scripts/check_i18n.mjs` 在构建时强制一致，不是靠自觉。它查三件事：结构对齐、占位符对齐、**代码里 `t("…")` 引用到的 key 必须真的存在**。第三条最重要 —— 前两条只做语言包之间的横向比对，一个八份里都没有的 key 可以一路绿灯，然后在界面上显示成 `s.a1b2c3`。

**三、`src/trm/` 不引用它自己以外的东西。** 除了 react 和语言包。一旦它引了产品代码，模板就退化成了「某个产品的一部分」，而这正是它要解决的问题。

## 主题有三种状态，不是两种

这是最容易写错的一处，写错的表现是「某些用户看到白底白字」。

| 用户设置 | `<html>` | 靠什么区分 |
| --- | --- | --- |
| 明确选浅色 | `data-theme="light"` | 属性 |
| 明确选深色 | `data-theme="dark"` | 属性 |
| 跟随系统（默认） | *没有属性* | `prefers-color-scheme` |

所以深色要写两遍：一遍在媒体查询里（并且用 `:not([data-theme="light"])` 排除「系统深色但用户选了浅色」），一遍在 `[data-theme="dark"]` 里。

**任何颜色都不许把唯一的定义放在媒体查询或 `[data-theme]` 块里** —— 那样它在「跟随系统」这个默认状态下根本不存在。

## 接进 Tauri

模板本身不依赖 Tauri，纯网页也能跑。要接进去的话只有三个注入点：

**语言持久化** —— 默认存 `localStorage`，换成你的配置命令：

```tsx
<I18nProvider store={{
  load: () => invoke<Config>("config_get").then((c) => c.ui_locale),
  save: (code) => void invoke("config_set", { patch: { ui_locale: code } }),
}}>
```

**窗口按钮** —— 不传 `windowControls` 就不画那三个按钮（纯网页下它们点了也没反应，而「看着能点、点了没反应」比没有按钮更伤）：

```tsx
const w = getCurrentWindow();
<TitleBar
  windowControls={{
    minimize: () => void w.minimize(),
    toggleMaximize: () => void w.toggleMaximize(),
    close: () => void w.close(),
  }}
  …
/>
```

**崩溃日志** —— 让报障能带走原因：

```tsx
<ErrorBoundary onError={(detail) => void invoke("ui_log", { line: detail })}>
```

壁纸如果是本地文件，`applyAppearance` 的第二个参数传 `convertFileSrc`。

`index.html` 里的白窗守卫和 `vite.config.ts` 里的 `stripCrossorigin` 都是为 Tauri 准备的，纯网页下无害：前者管「包根本没加载」，后者管自定义协议下因 `crossorigin` 取不到脚本导致的整窗白屏。

## 从这里开一个新产品

1. 复制整个仓库，改 `package.json` 的 `name`、`index.html` 的 `<title>`、`vite.config.ts` 的 `port`（各产品端口互不相同，否则 WebView2 按端口分的缓存会串味）
2. 删掉 `src/pages/`，写你自己的页面
3. 删掉语言包里的 `demo` 节点，保留 `ui` 和 `locale`
4. 改 `src/App.tsx` 里的 `createNav`，顺序就是换页动画的方向依据
5. `TitleBar` 的 `brand` 换成你的牌子

## 那些注释

代码里的中文注释密度偏高，而且大多在解释「为什么不能改成看起来更合理的写法」。它们不是话多 —— 每一条背后都是一个已经发生过的问题：滑块跟不上手、切页时窗口边缘露出一条缝、语言换了但药丸宽度停在旧文字上、点一下问号把开关也切了。

删掉注释不会让代码更短多少，但会让下一个人重新踩一遍。

## 许可

MIT。见 [LICENSE](./LICENSE)。
