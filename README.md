# TRM UI

图灵镜（Turing Mirror）桌面应用程序家族的共享组件包与设计系统参考实现。**不包含任何产品代码。**

[English](./README_en.md)

---

TRM UI 不另写规范文档。界面本身就是示范，代码本身就是说明：每条规则只在一个数据文件里写一次，画廊页面照它渲染，人在界面上看到效果，Agent 读同一个文件。

## Agent 怎么用这个项目

1. **先看界面。** `npm install && npm run dev`，打开 http://localhost:1410。侧栏每一页既是规范，也是能操作的示范。
2. **按下表找到对应代码。**

   | 侧栏 | 内容 | 代码 |
   | --- | --- | --- |
   | 概览 | 外壳、主题、整体结构 | `src/pages/OverviewPage.tsx` |
   | 组件 | 全部基础组件 | `src/pages/ComponentsPage.tsx`、`src/trm/components/` |
   | 模式 | 列表、详情、清理、下载等整页模式 | `src/pages/PatternsPage.tsx`、`src/pages/MorePatterns.tsx` |
   | 交互 | 交互约定，每条附错误与正确的实物示范 | `src/pages/interactionRules.ts`、`src/pages/ruleDemos.tsx`、`src/pages/InteractionPage.tsx` |
   | 文案 | 界面文字的写法，附错误示范与正确示范 | `src/pages/textRules.ts` |
   | 排版 | 字号档位 | `src/pages/TypePage.tsx` |
   | 配色 | 颜色变量及其用途 | `src/pages/colorRoles.ts`、`src/trm/styles/tokens.css` |
   | 动效 | 曲线，以及每种动效的名字、说明与示范 | `src/pages/motionTerms.ts`、`src/pages/MotionPage.tsx`、`src/trm/components/motion.tsx`、`src/trm/styles/` |
   | 历史 | 已被取代的成熟设计，按日期排列 | `src/pages/historyEntries.ts` |
   | 设置 | 设置页的写法 | `src/pages/SettingsPage.tsx` |

3. **做产品界面时：** 组件通过 `trm-ui` 包引用，颜色只用 `src/trm/styles/tokens.css` 的变量，文字照 `textRules.ts`，交互照 `interactionRules.ts`，动效用 `motionTerms.ts` 里的名字沟通。
4. **换掉一个成熟的设计时：** 在 `historyEntries.ts` 记一条，写明日期、旧设计、新设计和原因。
5. **改规范时：** 改对应的数据文件，八种语言写全，少一种 `tsc` 会报错；画廊页面自动跟着变。不新建 Markdown 文档，也不把规则复制进产品仓库。
6. **改组件时：** 修改这里 `src/trm/` 的实现，构建、测试并提交后，在产品中升级固定版本的 `trm-ui` 依赖。接入与升级步骤见 [组件包 v1](docs/components-v1.md)。
7. **改完检查：** `npm run build`，依次运行 eslint、tsc、i18n 校验和 vite build，任何一步失败就停。

规则的来历和取舍写在代码注释里，大多在解释「为什么不能改成看起来更合理的写法」。注释背后都是已经发生过的问题，不要删。

## 目录

```
src/trm/                 共享组件源码，画廊与组件包使用同一份
├── components/          全部组件，入口是 src/trm/index.ts
├── i18n/                八种语言，构建时打包，同步切换
└── lib/                 导航、剪贴板、外观、与壳的桥（host.ts）、快捷键、鼠标侧键
src/trm/styles/          共享颜色、圆角、曲线、主题与组件样式
src/index.css            画廊样式入口
lib/                     组件包构建产物（不入 Git）
src/pages/               画廊页面与规则数据
i18n/locales/*.json      八份语言包，界面和壳共用
scripts/check_i18n.mjs   语言包结构、占位符与代码引用的校验
index.html               白窗兜底

src-tauri/src/           桌面壳
├── lib.rs               启动顺序、命令、两个看门狗
├── window_watch.rs      无边框窗口：圆角、最大化、窗口跑丢后找回
├── ui_assets.rs         自定义协议提供界面，exe 旁的 frontend/ 可替换
├── config.rs            app_config.json：原子写入、坏文件留档、默认值补齐
├── logging.rs           shell.log，按天分文件
├── i18n.rs              壳侧翻译，和界面共用语言包
├── paths.rs             产品根目录与 User_Data
├── tray.rs              托盘
├── autostart.rs         开机自启（注册表）
└── asset_scope.rs       asset 协议的运行时放行
```

## 运行与构建

```bash
npm install && npm run dev          # 只看界面，不需要 Rust
npm install && npm run tauri:dev    # 连桌面壳一起运行
npm run build                       # eslint、tsc、i18n 校验、画廊构建
npm run build:lib                   # 组件包、类型声明与共享样式
npm test                           # 组件与交互回归
npm run tauri:build                 # 以上步骤加打包安装程序
cargo test --manifest-path src-tauri/Cargo.toml
```

## 三条硬规矩

1. **颜色只从变量取。** 写死的颜色在另一个主题下必然是错的，而且只有换主题时才看得出来。
2. **界面文字只从语言包取。** `scripts/check_i18n.mjs` 在构建时检查八种语言的结构和占位符一致，并确认代码里 `t("…")` 引用的 key 真实存在。
3. **`src/trm/` 不引用它以外的东西。** react、语言包和 `host.ts` 这一个桥除外。一旦引用了产品代码，模板就成了某个产品的一部分。

## 从这里开一个新产品

1. 按 [组件包 v1](docs/components-v1.md) 安装依赖并导入样式。需要桌面壳时可以以 `src-tauri/` 和构建配置为起点；产品语言包由产品维护。画廊页面与规则数据留在 TRM UI。
2. 改 `package.json` 的 `name`、`index.html` 的 `<title>`、`vite.config.ts` 的端口。各产品端口互不相同，否则 WebView2 按端口区分的缓存会混在一起。
3. 改壳里标了注释的六处：

   | 位置 | 改什么 |
   | --- | --- |
   | `src-tauri/tauri.conf.json` | `productName`、`identifier`、`devUrl` 端口 |
   | `src-tauri/src/lib.rs` | `APP_TITLE` |
   | `src-tauri/src/paths.rs` | `ROOT_MARKERS`，选一个一定随产品发布的文件 |
   | `src-tauri/src/autostart.rs` | `VALUE_NAME`，发布之后不要再改 |
   | `src-tauri/src/config.rs` | 在 `defaults()` 里加产品自己的键 |
   | `src-tauri/icons/` | `npx tauri icon your-logo.png -o src-tauri/icons` |

4. 产品语言包放产品文案，通用 `ui` 与 `locale` 随组件包提供；已有语言状态通过 `I18nScope` 接入。
5. 在 `src/App.tsx` 的 `createNav` 里列出页面。顺序决定换页动画的方向。

## 许可

MIT。见 [LICENSE](./LICENSE)。
