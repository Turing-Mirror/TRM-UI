# TRM UI v1 组件包

TRM UI 的通用组件、交互实现、设计变量和样式由本仓库维护。产品通过 `trm-ui` 包引用固定提交，不再复制组件源码。画廊仍使用 `src/trm/`，与组件包共用实现。

## 安装与引用

使用 Git 依赖固定到已经验证的提交；`package-lock.json` 一起提交。安装 Git 依赖时，npm 会运行 `prepare`，构建 JavaScript、类型声明和样式。

```sh
npm install --save-exact "git+https://github.com/Turing-Mirror/TRM-UI.git#<commit>"
```

```tsx
import { Btn, Tooltip, PopupSelect, ModalLayer } from "trm-ui";
```

Tailwind v4 应用的样式入口：

```css
@import "tailwindcss";
@import "trm-ui/styles.css";
```

`styles.css` 包含共享变量和组件样式，并通过 `@source` 指向包内 JavaScript。消费方不需要扫描另一个本地仓库。也可以单独导入 `trm-ui/tokens.css` 或 `trm-ui/components.css`。React 和 React DOM 由消费方提供，避免两份 React。

## 产品接口

- 产品已有语言状态时，以 `I18nScope value={{locale, setLocale, ready, t}}` 包裹内容。产品翻译优先；缺少通用键时使用包内对应语言的 `ui` 翻译。作用域切换不重挂子树。静态翻译调用方可同步 `setTLocale`。
- 产品自己的页面、音频处理、引擎消息、术语表和配置存储不放入组件包。
- `ModalLayer` 接受产品提供的面板；`Leave` 保留条件渲染内容直到退场完成；`Modal` 继续提供完整对话框。
- `PopupSelect` 提供自绘下拉列表，`Select` 保留原生选择框。`MenuPopup` 提供锚定菜单和关闭原因回调。
- `Swap` 支持 `push` 和 `fade`；`stagger` 接受间隔与数量；`Collapse` 接受卸载延迟。产品通过参数保留已有节奏。
- 页面顶部间距、菜单和依次出现的动效参数可以通过 CSS 变量配置。产品差异写在产品样式中，共用实现不在产品中修改。
- 已有主题系统的产品可以只引用交互逻辑，不导入全局样式。`Tooltip` 的 `className` 替换面板外观，`triggerClassName` 设置触发区域，`exitMs` 对齐产品的退场时长。触发按钮已经打开详情面板时可设置 `disabled`，避免重复提示；Escape 关闭说明并保留按钮焦点。
- `FlowList` 的 `motion` 接受 `durationMs`、`easing` 和 `reduced`，同时控制 JavaScript 动画和卸载时间；`layout="grid"` 支持网格的横纵换位。`Morph disabled` 关闭高度过渡。产品仍需提供对应的局部 CSS，并将这些参数连接到自己的主题设置。

## 构建与升级

```sh
npm run build
npm test
npm run build:lib
npm pack
```

`lib/` 是生成目录，不入 Git。包内仅含编译结果、类型声明、共享样式与公共 UI 翻译，不包含画廊页面和示例文案。

修改共享组件后，在本仓库运行验证并提交；消费方更新依赖提交、运行其自身构建与回归验证，再独立发布。组件包采用 npm 所需的语义版本，首版为 `1.0.0`，Git 标签为 `v1`。已有源码副本的产品在迁移前仍需按原方式同步；升级本包不会修改这些副本。
