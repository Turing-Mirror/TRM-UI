# TRM UI

图灵镜（Turing Mirror Software）桌面产品的 UI/UX 模板：设计令牌、组件库、八语言 i18n，外加一个能直接开窗的 Tauri 壳。

从 [RVC Fabric](https://github.com/Turing-Mirror/RVC-Fabric) 抽取而来，**不包含任何产品代码**。

[English](./README_en.md)

---

## 为什么有它

「照抄 RVC Fabric 的 UI」这句话，曾经被反复执行成「复制整个仓库再魔改」。结果是每个新产品都从一堆用不上的代码开始，设计系统靠人肉同步，每同步一次就歪一点。

把界面这一层单独拿出来之后：新产品从它起步，改进也回流到它 —— 而不是回流到五份互相分叉的副本里。

## 里面有什么

```
src/trm/                 ← 界面模板本体，可以整个复制走
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
└── lib/                 nav / clipboard / appearance / host

src/index.css            设计令牌 + 三态主题 + 动画  ← 核心资产
src/pages/               演示画廊（可删）
i18n/locales/*.json      八份语言包，界面和壳共用
scripts/check_i18n.mjs   三道 i18n 硬校验
index.html               白窗兜底守卫

src-tauri/               ← 桌面壳
├── src/
│   ├── lib.rs           启动顺序、命令、两个看门狗
│   ├── window_watch.rs  无边框窗口：圆角、最大化钳制、跑丢了捞回来
│   ├── ui_assets.rs     自定义协议供界面，exe 旁的 frontend/ 可替换
│   ├── config.rs        app_config.json，原子写入、坏文件留档
│   ├── logging.rs       shell.log，按天分文件，48 小时保留
│   ├── i18n.rs          壳侧翻译，和界面共用语言包
│   ├── paths.rs         产品根 / User_Data
│   ├── tray.rs          托盘
│   ├── autostart.rs     开机自启（注册表）
│   └── asset_scope.rs   asset 协议运行时放行
└── icons/
```


## 跑起来

**只看界面**（不用装 Rust）：

```bash
npm install && npm run dev
```

打开 http://localhost:1410 —— 一个组件画廊，每一个都是真能操作的控件。

**连壳一起跑**：

```bash
npm install && npm run tauri:dev
```

开出一扇无边框窗口：Win11 上是系统圆角，标题栏按钮可用，托盘常驻，日志写在
`User_Data/logs/shell/`。

**构建**：

```bash
npm run build          # eslint → tsc → check_i18n → vite build
npm run tauri:build    # 上面这些 + 打包安装程序
cargo test --manifest-path src-tauri/Cargo.toml
```

任何一步失败就停。

## 三条硬规矩

**一、颜色只从令牌取。** 写死的颜色字面量在另一个主题下必然是错的，而且只有换主题时才看得出来 —— 也就是说，正常开发流程里没有任何一步会发现它。

**二、文案只从语言包取。** 八种语言的结构由 `scripts/check_i18n.mjs` 在构建时强制一致，不是靠自觉。它查三件事：结构对齐、占位符对齐、**代码里 `t("…")` 引用到的 key 必须真的存在**。第三条最重要 —— 前两条只做语言包之间的横向比对，一个八份里都没有的 key 可以一路绿灯，然后在界面上显示成 `s.a1b2c3`。

**三、`src/trm/` 不引用它自己以外的东西。** 除了 react、语言包，和 `host.ts` 那一个桥。一旦它引了产品代码，模板就退化成了「某个产品的一部分」，而这正是它要解决的问题。

## 主题有三种状态，不是两种

这是最容易写错的一处，写错的表现是「某些用户看到白底白字」。

| 用户设置 | `<html>` | 靠什么区分 |
| --- | --- | --- |
| 明确选浅色 | `data-theme="light"` | 属性 |
| 明确选深色 | `data-theme="dark"` | 属性 |
| 跟随系统（默认） | *没有属性* | `prefers-color-scheme` |

所以深色要写两遍：一遍在媒体查询里（并且用 `:not([data-theme="light"])` 排除「系统深色但用户选了浅色」），一遍在 `[data-theme="dark"]` 里。

**任何颜色都不许把唯一的定义放在媒体查询或 `[data-theme]` 块里** —— 那样它在「跟随系统」这个默认状态下根本不存在。

## 界面和壳是怎么接上的

界面**不依赖壳**。所有和壳打交道的东西都收在 `src/trm/lib/host.ts` 一个文件里，
每一项在没有壳的时候安静降级：

| 能力 | 有壳 | 没壳（浏览器） |
| --- | --- | --- |
| 语言持久化 | `app_config.json` | `localStorage` |
| 窗口按钮 | 最小化 / 最大化 / 关闭 | **不画** |
| 崩溃日志 | 写进 `shell.log` | 只进控制台 |
| 界面已挂载信号 | 喂给白窗看门狗 | 空操作 |

窗口按钮在浏览器里选择「不画」而不是「画了不响应」：一个看着能点、点了没反应的
按钮，用户会以为软件坏了。

判断有没有壳看 `window.__TAURI_INTERNALS__`，不靠 try/catch 试一次 invoke ——
后者会在控制台里留下一条吓人的报错。

## 壳做对了什么

这几件事都是踩过才知道要做的，注释里写了各自的来历：

**无边框窗口**（`window_watch.rs`）。Win11 的圆角走 DWM 属性，不走「透明窗口 +
CSS 圆角」—— 后者会连系统投影一起丢掉，四角还会露锯齿。Win10 没有这个属性，
退到 `SetWindowRgn` 自己裁。最大化的尺寸在 `WM_WINDOWPOSCHANGING` 里**落地前**
钳到工作区，不是事后 `SetWindowPos` 去改（那会毁掉还原矩形，窗口再也缩不回
最大化前的大小）。`WM_NCCALCSIZE` 一律让客户区铺满整个窗口，否则 Win10 上会留
一圈没人画的非客户区，表现为「拖动之后出现、再也不消失的左缘竖带」。

**窗口跑丢了能捞回来**。`.center()` 只认主显示器，而多显示器的人正在看的往往
不是主屏 —— 窗口连同任务栏按钮一起去了另一块屏，用户这头一点动静都没有，和
「根本没启动」长得一模一样。所以启动时按光标所在的屏摆窗口。

**两个看门狗**（`lib.rs`）。「打开是白的」和「打开就未响应」是用户唯一描述不出、
我们也看不见的两种故障。前者靠界面挂载信号 + 资源请求计数（「0 个请求」和
「12 个请求、1 个 404」是完全不同的两个 bug）；后者靠一个普通线程去 ping 事件
循环，日志里有没有那几行，直接区分「Rust 侧停了」和「WebView 卡住了」。

**界面可单独替换**（`ui_assets.rs`）。界面走自定义协议提供，exe 旁边的
`frontend/` 目录能替换掉随包发布的那份，不用重编译 exe。只改界面的补丁因此
可以做得很小。

**配置不会把用户的设置搞丢**（`config.rs`）。原子写入（临时文件 + rename），
解析失败时把坏文件改名留档而不是覆盖，升级新增的键用默认值补齐而不是读出 null。

## 从这里开一个新产品

1. 复制整个仓库，改 `package.json` 的 `name`、`index.html` 的 `<title>`、
   `vite.config.ts` 的 `port`（各产品端口互不相同，否则 WebView2 按端口分的
   缓存会串味）
2. 壳里有六处要改，全都标了注释：

   | 位置 | 改什么 |
   | --- | --- |
   | `src-tauri/tauri.conf.json` | `productName` / `identifier` / `devUrl` 端口 |
   | `src-tauri/src/lib.rs` | `APP_TITLE` |
   | `src-tauri/src/paths.rs` | `ROOT_MARKERS` —— 挑一个一定会跟着产品走的文件 |
   | `src-tauri/src/autostart.rs` | `VALUE_NAME`，**发布之后就别再改** |
   | `src-tauri/src/config.rs` | `defaults()` 里加你自己的键 |
   | `src-tauri/icons/` | `npx tauri icon your-logo.png -o src-tauri/icons` |

3. 删掉 `src/pages/`，写你自己的页面
4. 删掉语言包里的 `demo` 节点，保留 `ui` 和 `locale`
5. 改 `src/App.tsx` 里的 `createNav`，顺序就是换页动画的方向依据
6. `TitleBar` 的 `brand` 换成你的牌子

## 那些注释

代码里的中文注释密度偏高，而且大多在解释「为什么不能改成看起来更合理的写法」。它们不是话多 —— 每一条背后都是一个已经发生过的问题：滑块跟不上手、切页时窗口边缘露出一条缝、语言换了但药丸宽度停在旧文字上、点一下问号把开关也切了。

删掉注释不会让代码更短多少，但会让下一个人重新踩一遍。`window_watch.rs` 里
有好几段是「这里曾经写过 X，别再写回来」—— 那些是花了最多时间才换来的。

## 许可

MIT。见 [LICENSE](./LICENSE)。
