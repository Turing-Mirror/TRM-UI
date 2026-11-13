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

不用 Tailwind 的应用引入预编译样式表：

```ts
import "trm-ui/compiled.css";
```

`compiled.css` 包含共享变量、组件样式和组件包自己用到的工具类，引入后全部组件可以直接使用。两种入口只选一种。应用自己的页面样式由应用负责。

两种入口都带简体中文字体 Noto Sans SC（SIL OFL 1.1），只在界面语言是简体中文时使用。分发产品时附带 `licenses/NotoSansSC-OFL.txt`。

`styles.css` 包含共享变量和组件样式，并通过 `@source` 指向包内 JavaScript。消费方不需要扫描另一个本地仓库。也可以单独导入 `trm-ui/tokens.css` 或 `trm-ui/components.css`。React 和 React DOM 由消费方提供，避免两份 React。

## 产品接口

- 产品已有语言状态时，以 `I18nScope value={{locale, setLocale, ready, t}}` 包裹内容。产品翻译优先；缺少通用键时使用包内对应语言的 `ui` 翻译。作用域切换不重挂子树。静态翻译调用方可同步 `setTLocale`。
- 产品自己的页面、音频处理、引擎消息、术语表和配置存储不放入组件包。
- `Block collapsible="稳定标识"` 保留可折叠分区及其本机收起状态。产品原有的 `trm.collapsed.<标识>` 设置继续生效。
- `Pager showSinglePage` 在单页列表中保留当前页及禁用的前后翻页按钮，默认仍隐藏单页。固定页脚可通过 `--pager-margin-top` 调整顶部间距，默认 `2rem`。
- `ModalLayer` 接受产品提供的面板；`Leave` 保留条件渲染内容直到退场完成；`Modal` 继续提供完整对话框。
- `PopupSelect` 提供自绘下拉列表，`Select` 保留原生选择框。`MenuPopup` 提供锚定菜单和关闭原因回调。
- `Swap` 支持 `push` 和 `fade`；`stagger` 接受间隔与数量；`Collapse` 接受卸载延迟。产品通过参数保留已有节奏。
- 页面顶部间距、菜单和依次出现的动效参数可以通过 CSS 变量配置。产品差异写在产品样式中，共用实现不在产品中修改。
- 已有主题系统的产品可以只引用交互逻辑，不导入全局样式。`Tooltip` 的 `className` 替换面板外观，`triggerClassName` 设置触发区域，`exitMs` 对齐产品的退场时长。触发按钮已经打开详情面板时可设置 `disabled`，避免重复提示；Escape 关闭说明并保留按钮焦点。
- `FlowList` 的 `motion` 接受 `durationMs`、`easing` 和 `reduced`，同时控制 JavaScript 动画和卸载时间；`layout="grid"` 支持网格的横纵换位。`Morph disabled` 关闭高度过渡。产品仍需提供对应的局部 CSS，并将这些参数连接到自己的主题设置。

## 外壳与窗口

- 根容器加 `page-shell`，内容区加 `page-workspace`：标题栏与侧栏使用 `--shell-bg`，内容区使用 `--workspace-bg`，右侧与底部留出 `--shell-gap` 并带圆角。没有侧栏的单独窗口再加 `page-workspace-detached`。设置背景图时外壳与内容区自动改为半透明。
- `openWindow(params)` 把一个页面开成单独的窗口。桌面版由壳的 `open_window` 命令开窗，外观与主窗口相同，标签为 `win-1`、`win-2` 等；浏览器预览中打开浏览器窗口。关闭主窗口时整个程序退出。
- 菜单与下拉挂在 body 上。悬停展开的侧栏这类区域要把从自己这里打开的浮层算作内部时，用 `PopoverOwner value={标识}` 包裹，再读取浮层的 `data-popover-owner`。
- 产品自己管理页面时，用 `PageActive value={是否显示}` 包裹页面内容。`PageHost` 已自动提供。菜单、下拉与页标题读取 `usePageActive()`，页面被切走时浮层自动收起。
- `PageHost keep` 让页面离开后保留输入、筛选和滚动位置。返回 `true` 的页照常运行；返回 `"paused"` 的页停掉副作用，回来时重新执行，数据照样刷新。`warm` 列出空闲时提前搭好的页，第一次进入没有搭建的停顿。常驻页用 `usePageLeave(fn)` 在被切走时清掉一次性的结果文字。只在页面初次进入时该做一次的事（例如按请求滚动到某一段）要自己记住已处理过的请求，因为 `"paused"` 的页每次回来都会重新执行副作用。

## 图片与缩略图

- `ThumbImage` 用于列表里的图片：原图最长边超过目标尺寸时先缩成缩略图再显示，缩略图存在本地数据库，下次直接读取。`px` 是缩略图最长边的像素数，默认 640。原图本来不大、环境不支持或生成失败时显示原图。
- 没有封面图时用 `CoverPlaceholder`：名称首字压在预览色上。`name` 是名称，`seed` 决定底色，同名不同版本的条目传各自的 id。只要底色时用 `artOf(seed)`，只要首字时用 `artInitial(name)`。
- `CatalogCover` 的 `placeholder` 传完整名称，`seed` 可选。
- `CatalogCover` 已使用缩略图。自己写 `<img>` 时用 `useThumb(src, px)` 取地址，返回空串表示还在生成，先画占位。
- 原图换了内容而地址不变时调用 `forgetThumb(src)`，不传地址时全部重新生成。

## Fabric 系列共用代码

几款 Fabric 产品里完全相同、又不是界面组件的代码放在 `src/trm/fabric/`，从单独的入口引入：

```ts
import { askConfirm, pickPath, splitErrorText } from "trm-ui/fabric";
```

这个入口不引用组件包，也不带样式。只收不依赖某一款产品自己的文案和接口的模块；清单在画廊的「共用代码」页，数据在 `src/pages/sharedModules.ts`，新增模块时一并登记。

## 设计规范检查

- `trm-design-check` 在源码里查规范之外的字号、圆角、时长、层叠数值和手写输入框。`design-baseline.json` 记下现有数量，检查只在数量增加时失败。`--update` 更新基线，`--list` 列出每一处。
- 自定义有三种方式：覆盖变量（`var(--xxx)` 不在检查范围内）；在 `design-check.config.json` 里改 `allow`、`include` 或关掉某条规则；个别例外在该行或上一行写注释 `design-allow: 原因`。

## 构建与升级

```sh
npm run build
npm test
npm run build:lib
npm pack
```

`lib/` 是生成目录，不入 Git。包内仅含编译结果、类型声明、共享样式与公共 UI 翻译，不包含画廊页面和示例文案。

共享样式包含纵向换页、通知、下拉菜单、侧栏和减少动态效果的规则。组件所需样式维护在 `src/trm/styles/`，画廊样式入口只负责导入，产品无需复制画廊样式。

修改共享组件后，在本仓库运行验证并提交；消费方更新依赖提交、运行其自身构建与回归验证，再独立发布。组件包采用 npm 所需的语义版本，首版为 `1.0.0`，Git 标签为 `v1`。已有源码副本的产品在迁移前仍需按原方式同步；升级本包不会修改这些副本。

## 持续存在的输入区

`ComposerInput` 是受控多行输入组件，自动伸缩、Enter 提交、Shift + Enter 换行，并保留输入法选字行为。草稿、附件、提交状态、按钮与样式由调用方持有。通过 `maxHeight`、`minHeight` 和 `onHeightChange` 连接已有布局。禁用或只读时不提交。

`useMorphState` 在目标页面完成布局后切换容器形态，默认等待两帧；`useLeavingValue` 保留旧内容直到离场结束。容器应挂在路由内容之外，切换页面、输入类型或语言不重建草稿。调用方保留原有几何、拖动、动效类与持续时间。

## 滑块数值输入

`Slider` 右侧数字支持双击直接输入，也可聚焦数字后按 Enter 或空格进入编辑。编辑框使用原始 `value`，不含 `format` 添加的单位，也不受显示精度影响。Enter 或失焦提交，Esc 取消；Enter 与 Esc 结束后焦点返回数字，失焦提交不抢回焦点。

`SliderValue` 可独立放在 `RangeBar` 旁，供自定义布局复用同一数值输入。参数为 `value`、`min`、`max`、`step`、`onChange`，可选 `format`、`ariaLabel`、`disabled`、`className`；类型为 `SliderValueProps`。不传 `className` 时沿用 Slider 的 13px、最小宽度 56px、右对齐等宽数字；传入时替换这组显示样式。

编辑框默认至少 80px 宽、30px 高，左右留出 8px 内边距。它沿数字右侧向左展开，不改变静态数字和滑轨布局；可通过 `--slider-value-edit-width`、`--slider-value-edit-height` 调整编辑尺寸。

提交按 `min` 起算的 `step` 校准，并限制在范围内；支持小数与科学记数。空值或无效数字取消本次输入。编辑期间外部更新不覆盖草稿，禁用时不可编辑。重复失焦不会重复提交，数值编辑的双击、Enter 与 Esc 不触发父级快捷操作。RangeBar 的拖动和产品既有轨道双击复位逻辑保持不变。

若产品显示百分比，应向数值编辑器传入百分比尺度的 `value/min/max/step`，并在 `onChange` 中换算回存储值；不要通过 `format` 隐藏这层尺度差异。

## 通用输入与数据组件

| 导出 | 参数 |
| --- | --- |
| `TextInput` / `TextInputProps` | `value: string`、`onChange(string)`、`invalid?`、原生输入属性；`type` 支持 text、password、number。 |
| `TextArea` / `TextAreaProps` | `value: string`、`onChange(string)`、`invalid?`、原生 textarea 属性；默认 3 行。 |
| `ChipInput` / `ChipInputProps` | `value: string[]`、`onChange`、`label`、`disabled?`、`placeholder?`、`separators?`；默认中英文逗号。 |
| `Chip` / `ChipProps` | `children: string`；可选 `icon: IconName`、`tone: Tone`、`onRemove`、`disabled`。 |
| `DataTable<T>` / `DataTableProps<T>` | `rows`、`columns`、`keyOf`、`label`、`onRowClick?`。 |
| `DataColumn<T>` | `key`、`label`、`render(row)`、`align?: "start" \| "end"`、`width?: string`。 |
| `BarChart` / `BarChartProps` | `title`、`data: BarChartItem[]`、`formatValue?`、`formatLabel?`、`describe?`、`showTableToggle?`。 |
| `BarChartItem` / `niceTick(max)` | 数据项为 `{ label: string; value: number }`；`niceTick` 返回适合三段纵轴的刻度间隔。 |
| `ConfirmDialog` / `ConfirmDialogProps` | `open`、`title`、`text`、`confirm`、`danger?`、`busy`、`onClose`、`onConfirm`。 |

`ChipInput` 在输入法组合期间保留草稿，逗号、Enter 或失焦提交并去重，空草稿下 Backspace 移除末项。
其标签直接使用 `Chip`；只读关键词也使用同一组件，提供 `onRemove` 时显示带本地化名称的移除按钮。
`Chip` 使用 12.5px 文字、24px 最小高度、`--rs` 圆角，无边线。`--chip` 是 `--ink` 的 10% 与
`--surface` 的不透明混合色，`--chip-ink` 使用 `--ink-muted`，随根主题切换。
默认主题文字对比度为浅色 4.68:1、深色 5.57:1；填充不透明，因此页面、分组和表面底色不影响该比值。
颜色或主题覆盖后应重新计算对比度。状态继续使用无填充的 `Tag`，用途规则见 `interactionRules.ts`。
`tone` 与 Tag 共用 `Tone` 类型，默认 `muted`；ChipInput 继续使用此默认值。
所有 tone 保留同一个 `--chip` 填充与尺寸，只改变文字和图标颜色。分类色使用
`--chip-ok-ink`、`--chip-warn-ink`、`--chip-accent-ink`、`--chip-danger-ink`；
浅色主题加深文字，深色主题的 ok、warn 复用现有颜色，accent、danger 使用提高亮度后的专用文字色。
画廊在页面和分组底色上并列展示全部 Chip tone 与相同 tone 的 Tag，跟随深浅主题切换。
默认令牌的文字对比度如下，显式深色与跟随系统深色使用同一组结果：

| tone | 浅色 | 深色 |
| --- | --- | --- |
| muted | 4.68:1 | 5.57:1 |
| ok | 4.81:1 | 5.51:1 |
| warn | 4.94:1 | 6.64:1 |
| accent | 4.70:1 | 5.10:1 |
| danger | 4.84:1 | 4.95:1 |

`DataTable` 自带分组底色、圆角与横向滚动，行回调支持点击、Enter 和空格；单元格内的控件独立响应。
`BarChart` 用于非负单序列数据，负值按零高度显示；`formatLabel` 接收标签字符串，`describe` 接收数据项。
`showTableToggle` 默认关闭，启用后提供图表与表格切换。密集序列保留 2px 柱间距并横向滚动。
`ConfirmDialog` 复用 `Modal` 和 `Btn`；忙碌时取消、遮罩与 Escape 均不关闭，确认操作不重复触发。
`PromptDialog` 仍用于输入名称，两者不混用。配套样式随 `trm-ui/styles.css` 提供。

## 页面宽度与设置行

`PagePad` 新增 `width?: "full" | "wide" | "read"`，默认 `full` 保持现有布局。`read` 和 `wide` 居中，最大宽度分别由 `--page-w-read`（760px）和 `--page-w-wide`（1160px）控制，包含原有响应式左右留白。内部 `PageHead` 自动跟随；三种宽度均支持 `fill`。

`RowGroup({ id?, title?, note?, action?, children })` 在标题与备注下面显示分组卡片，相邻 `Row` 之间使用细线。`Row({ title, desc?, tip?, control?, stacked?, onClick?, children? })` 左侧显示标题与说明，右侧显示控件；`stacked` 将控件置于下方并占满宽度，容器不足 560px 时普通行也换行。`children` 用于行下方补充内容。

多个 `RowGroup` 连续排列，可放在同一个普通章节标题下，不得互相嵌套。误嵌套时，内部组自动展平为父卡片中的小标题与行，不再生成第二个卡片底色；开发环境输出一次提示。

只传 `onClick` 而不传 `control` 时，行使用原生按钮和右箭头，支持 Enter 与空格；此时 `tip` 使用原生提示，避免按钮嵌套。原生控件自动关联标题与说明，保留调用方显式标签；复合控件置于有名称的 group 内，调用方仍应提供控件自身的 `label` 或 `ariaLabel`。`Field`、`Group` 和 `Block` 保持原有接口。参考实现见 `src/pages/SettingsPage.tsx`。

`Outline({ items, label, offset? })` 是分组较多的读宽页面的快捷菜单，`items` 为 `{ id, label }`，`id` 对应页内元素，`RowGroup` 可用 `id` 直接作为目标。读宽内容左侧放得下时，菜单停在左上角并随滚动保持可见；放不下时排在内容上方。点击平滑滚到对应章节，减少动态效果时直接跳转；选中项跟随当前章节，点击后立即选中，滚动途中不经过中间各项。`offset` 为章节标题停在滚动区顶边下方的距离，默认 24px。

`CenterPanel({ title, sub?, width?, children, foot? })` 在父工作区内居中，默认卡片宽度 400px；`width` 接受像素数值或 CSS 长度。父容器需提供确定高度，内容过长时自然增长，由父容器滚动。它使用普通 section，不创建遮罩、焦点陷阱或 portal。

布局规则统一维护在 `src/pages/interactionRules.ts`，模式页提供三种宽度与确认密钥的可操作示例。

## 网页外壳与设置开关

| 导出 | 参数 |
| --- | --- |
| `Sidebar` | `collapsed`、`label`、`children`、`head?: ReactNode`、`foot?: ReactNode`。 |
| `SidebarBrand` | `brand: ReactNode`、`collapsed: boolean`、`onToggle: () => void`。 |
| `Switch` | `checked: boolean`、`onChange: (value: boolean) => void`、`label: string`、`disabled?: boolean`。 |

`Sidebar.head` 与 `foot` 固定，导航内容单独滚动。`SidebarBrand` 高 52px，收起时只显示居中的开关。
`Switch.label` 仅作为无障碍名称，使用原生复选框的 Space 行为，提供焦点环并遵循减少动态效果设置。
`Toggle` 保留原有的可见标签接口。

浏览器页面使用如下结构；父容器需有确定高度。操作传入已有的 `PageHead.actions`，状态放入 `foot`。

```tsx
<div className="page-shell flex h-full min-h-0">
  <Sidebar collapsed={collapsed} label={navLabel} foot={status}
    head={<SidebarBrand brand={brand} collapsed={collapsed} onToggle={toggle} />}>{items}</Sidebar>
  <main className="page-workspace-flush">
    <PagePad><PageHead title={title} actions={actions} />{content}</PagePad>
  </main>
</div>
```

`.page-workspace-flush` 可单独使用或与 `.page-workspace` 组合，取消外边距与圆角，提供全高滚动区。
新增内部类为 `.sidebar-head`、`.sidebar-brand`、`.sidebar-brand-text`、`.trm-switch`、`.trm-switch-track`。
桌面窗口继续使用原有 `AppBar` 与 `.page-workspace`，默认行为不变。

## 全高工作区

### 列表详情工作台

| 导出 | 参数 |
| --- | --- |
| `Workbench` / `WorkbenchProps` | `list`、`detail`、`selected: string \| null`、`order: readonly string[]`、`onBack`。 |
| Workbench 可选参数 | `listHead`、`pager`、`listWidth`、`narrowAt`、`empty`、`className`。 |
| `WorkbenchItem` / `WorkbenchItemProps` | `title`、`selected`、`onClick`；可选 `meta`、`preview`、`tag`、`avatar`。 |
| `WorkbenchDetail` / `WorkbenchDetailProps` | `title`、`children`。 |
| WorkbenchDetail 可选参数 | `titleText`、`sub`、`actions`、`notice`、`foot`、`footMode`、`scrollToEnd`。 |
| `ChatComposer` / `ChatComposerProps` | `value`、`onChange`、`onSend`、`placeholder`、`sendLabel`。 |
| ChatComposer 可选参数 | `ariaLabel`、`disabled`、`sending`、`maxHeight`、`state`、`className`。 |
| `ChatState` / `ChatStateProps` | `label`；可选 `tone: "assistant" \| "human"`、`icon`、`action`。 |
| `AlertMark` / `AlertMarkProps` | `label`，同时作为无障碍名称与 Tooltip 文案。 |

父容器需提供确定高度。列表宽度由 `--workbench-list-width: clamp(280px, 28%, 380px)` 自适应；
`listWidth` 接受像素数值或 CSS 长度，覆盖默认变量。
工作台在给定高度内保留等量上下留白 `--workbench-space`（16px），列表底部不贴窗口边缘。
列表标题和筛选放在 `listHead`，与列表共用分组底色；原有 `list` 内的标题、筛选组合仍可使用。
标题、筛选和搜索统一使用 `--workbench-list-content-inset`（默认 16px），等于行外侧内缩加行内留白。数量和刷新操作放在同一标题行右侧；搜索使用 `.trm-workbench-search`。筛选文字与指示器不越过内容左边缘。
`pager` 接受现有 `<Pager page={page} pages={pages} onChange={setPage} />`，固定在列表卡片底部，位于滚动列表之外，不随列表推移。
详情保留页面底色，不增加卡片。标题、正文、提示和底部横向占满详情，统一使用 `--workbench-padding`（16px）。
原有 `.trm-workbench-read` 类继续保留，但不再限宽和居中。阅读宽度上限只加在单独的段落或字段上，靠起始边对齐；
聊天消息示例最大宽度为正文的 70%。
`narrowAt` 默认为 900，视口宽度不大于该值时，列表与详情使用两个全高 `Panes`。
`onBack` 由调用方将 `selected` 设为 null；返回按钮使用通用语言包，列表保留滚动与输入状态，并恢复操作焦点。
跨越宽窄断点会重新挂载插槽；需要跨断点保留的草稿、筛选与业务状态应由调用方持有。

`order` 是完整业务列表的键顺序，决定所有详情正文的推移方向；包含当前未显示页的键。窄屏列表与详情仍使用 `Panes` 推移。
空字符串也是有效键；只有 null 显示 `empty`。传入 `<Empty icon="chat" title={chooseText} />` 即可显示居中的图标与文字。
`WorkbenchItem` 是原生按钮，用 `aria-pressed` 表达选中状态，支持 Enter 与空格。插槽中不要嵌套交互控件。
`WorkbenchDetail` 固定头部，正文独立滚动。在 Workbench 内，所有操作与 foot 均保持在正文推移区域之外；普通表单与聊天使用同一切换方式。
独立使用 WorkbenchDetail 时，`footMode` 默认 `inline`，表单操作紧跟字段；`pinned` 固定在详情底部。
`sub` 可传单个节点或数组，数组各项独立排列，字符串和数值自动用 `Roll` 更新；自定义节点中的文字变化由调用方包裹 `Roll`。
`title` 为字符串或数值时自动使用 `Roll`；富文本标题可提供 `titleText` 作为变化标识，整个节点随文字滚动。
需要保留标题图标时，将 `Roll` 放在标题节点的文字部分。`Roll` 新增可选 `children`，`value` 仍是变化标识。
宽屏切换条目保持一个详情实例，不使用 `Swap`。调用方不要给详情组件设置随条目变化的 React key。
标题与子字段更新使用 `Roll`；操作、菜单、输入框与底部不播放位移或淡入淡出。提示仅使用 `Collapse`。
所有详情从 Workbench 获取 `selected` 与 `order`：切换条目只对整个正文做一次竖向推移，不要求设置 `scrollToEnd`。选择列表下方条目向上推，上方条目向下推。
同一条目内的内容增删由 `FlowList` 处理，间距写在块内；不叠加 Morph 的延迟过渡。切换条目时新正文默认从顶部显示，聊天通过 `scrollToEnd` 选择末尾。
新旧正文使用两个等高相邻层，始终不透明、不重叠，裁切在正文窗口中，共用 `FLOW_MS`（420ms）与 `--ease-nav`。连续选择同方向第三项时直接替换入场层内容，沿当前位移完成；反向选择复用两层，从当前绘制位置返回，不叠加第三层。
推移期间正文内部（包括嵌套 FlowList）直接显示常驻内容，取消子元素的入场与淡入淡出，不叠加逐块或逐条气泡伸缩；推移完成后，同一条目追加仍逐条展开。消息使用包含会话 ID 的稳定 key。提示位于固定正文上方，操作、ChatState 与 composer 不参与正文推移。
首次显示标题和字段时可依次浮现；后续切换移除 rise，只沿列表方向全程不透明地竖向滚字。同项更新保留标签滚字，不触发正文推移或标题入场。空态与详情直接替换，维持无重叠行为。
减少动态效果时，滚字、折叠、消息增删及自动滚动立即完成。

聊天可设置 `scrollToEnd={conversationId + ":" + messageCount}`。首次挂载在绘制前定位末尾；
切换条目时新层在绘制前定位末尾，入场后不再跳转；同一条目令牌变化后在 `FLOW_MS` 内跟随正在伸缩的消息末尾。
滚轮或触摸会中断跟随；输入草稿不改变令牌，因此不会打断向上阅读。正文禁用浏览器滚动锚定以免互相干扰。
草稿、处理状态与消息由调用方按会话保存；组件保留 DOM 不代表共享不同会话的业务数据。

`ChatComposer` 基于 `ComposerInput`，输入高度自动增长至 `maxHeight`（默认 200px），清空后自动收缩。
Enter 与发送按钮调用 `onSend`；Shift + Enter 换行，输入法确认不发送；空白草稿、禁用和发送中均禁止发送。
`sending` 显示按钮忙碌状态并禁用输入。草稿与发送结果由调用方维护，组件不会自行清空；占位符和按钮名称由语言包传入。
输入区域使用 `--surface`、`--r`、`--line` 内描边与强调色焦点环。发送按钮位于输入区域外侧的右边，间距 8px，与输入区域底部对齐。
单行文本输入高 32px，加上下各 8px 内边距后，整个输入区域与圆形发送按钮均高 48px。固定底部时多行输入向上增长，按钮保持原尺寸。
可发送时使用 `--accent` / `--accent-ink`；空白或禁用时使用中性 `--rail` / `--ink-muted`，不降低整体透明度。
发送中立即设置 `aria-busy` 并阻止重复提交；达到 `BUSY_DELAY_MS`（300ms）才以居中 16px spinner 替换发送图标。`maxHeight` 限制文本输入本身，不包含区域的上下内边距。
`state` 放在整个输入和按钮行上方并占满宽度。`ChatState` 默认 `tone="assistant"`，使用 `--accent-soft`；人工状态使用 `--rail`。图标和标签作为一组居中，action 独立放在右侧，不挤偏中心。
状态条满宽、最小高度 40px、14px 中等字重、`--r` 圆角；标签使用 Roll，底色沿 `--flow-ms` / `--ease` 过渡。
默认图标为芯片或人员，可由 `icon` 替换；`action` 可放安静的 `Btn`，不提供时没有操作占位。

所有 `Btn busy` 共用 `BUSY_DELAY_MS`：立即禁用重复点击并设置 `aria-busy`，延迟前保持原标签；延迟后 spinner 覆盖在中心，原标签继续占位，按钮宽度不变。短请求结束会取消计时，下一次请求重新计时。

`SidebarStatus({ icon, label, tone?, onClick, collapsed })` 用于侧栏底部的连接或服务状态，标签同时包含对象与状态。行高 36px、水平内边距 13px、图标 18px、间距 12px、字号 13.5px，与 SidebarItem 共用尺寸。`tone` 为 `ok | warn | danger | muted`，默认 muted，只给图标着色。标签使用 Roll，图标使用淡换；收起后保留图标、完整 Tooltip 和无障碍名称。在线与离线使用 `online` / `offline`，错误与待登录复用 `alert` / `scan`。
`AlertMark` 为 16px 圆形 `--surface` 底、1px `--hairline` 环与实心 `--danger` 感叹号，支持聚焦查看 Tooltip。
在相对定位的气泡内使用 `<span className="trm-alert-mark-corner"><AlertMark label={label} /></span>`，
标记在右下边缘向外重叠 4px。深色主题继续使用相应表面与危险色令牌。

`listHead` 内使用 `.trm-workbench-heading`、`.trm-workbench-filters`，`list` 使用 `.trm-workbench-rows` 独立滚动。
工作台按实际行顺序标记 `data-divider`，忽略退出中的 FlowList 行；最后一项不画线。
分隔线是文字列的伪元素，自动避开头像与两侧内边距，悬停或选中行两侧的线隐藏。
所有 WorkbenchItem 的悬停与选中背景按 `--workbench-row-inset`（8px）横向内缩，
使用 `--rs` 圆角；行宽扣除两侧外边距，因此背景不接触列表卡片边缘。
行内左右留白由 `--workbench-row-padding`（8px）控制，列表头统一使用外缩与行内留白之和，内容和右侧元信息默认距卡片边缘 16px。
分隔线继续对齐行文字列，有头像时避开头像。
审核画廊的 Pending 包含 3 条待处理记录，All 包含这 3 条及 2 条已处理记录。审核与聊天队列均每页 2 条，使用 Pager 页码；筛选回第一页，审核后页码越界则回到剩余最后一页。
列表头标题与总数随筛选使用 Roll 更新，总数包含所有页面的匹配记录。
分隔线适用范围以 `interactionRules.ts` 的 `denseListDividers` 为准；设置行卡片已移除外框与行间边框。
长队列列表使用 `QueueList`；计数用 `Roll`，编辑器展开用 `Collapse`。
这些动效沿用共享原语的减少动态效果规则。完整示例见 `src/pages/WorkbenchPattern.tsx`，规则见 `interactionRules.ts`。

以下为 JSX 示例。`rows`、`current`、`selected`、`select`、`approve`、`reject` 由产品提供，文案来自产品语言包。

```tsx
<Workbench selected={selected} order={rows.map(row => row.id)} onBack={() => select(null)}
  empty={<Empty icon="chat" title={t("review.choose")} />}
  list={<QueueList scope="all" className="trm-workbench-rows" items={rows} keyOf={row => row.id}
    render={row => <WorkbenchItem title={row.question} preview={row.answer} selected={selected === row.id}
      onClick={() => select(row.id)} />} />}
  detail={current && <WorkbenchDetail title={current.question}
    foot={<><Btn primary onClick={approve}>{t("review.approve")}</Btn>
      <Btn onClick={reject}>{t("review.reject")}</Btn></>}>
    <p>{current.answer}</p></WorkbenchDetail>} />
```

样式类统一使用 `trm-workbench` 前缀，主要包括 `-list`、`-main`、`-panes`、`-stage`、`-empty`、`-back`、
`-item`、`-item-line`、`-item-title`、`-preview`、`-meta`、`-tag`、`-avatar`、`-detail`、`-heading`、`-body`、`-read`、`-foot`，
以及 `-list-head`、`-part`、`-field`、`-block`、`-notice`。回复输入框使用 `trm-chat-composer` 和 `trm-chat-composer-input`。

`Panes layout="fill"` 用于画布、编辑器或占满父容器的工作区。父容器必须提供确定高度；此模式直接定位子视图，不经过按内容伸缩的 Morph 容器。默认 `layout="content"` 保持列表和设置页面的高度伸缩。离场完成后的 Pane 使用 hidden 和 inert，同时保留输入状态。

### 长队列列表

`QueueList<T>` 接受 `items`、`keyOf`、`render`、`scope`，可选 `page`（默认 1）、`order`、`dir`、`className`、
`itemClassName`、`empty`、`foot`。`scope` 表示筛选或查询，不包含条数；`order` 是页签 ID 顺序，
也可直接给 `dir={1 | -1}`。没有可比较的顺序时从右侧进入。
`className` 用于组件自身的滚动容器；父布局需限制高度，工作台使用 `trm-workbench-rows`。
工作队列使用分页：当前页数据传入 items，页码传入 page，现有 Pager 放在 Workbench.pager，固定在列表卡片底部。使用 `usePaged` 可按筛选复位并在数据减少后限制页码。
空态放在 `empty`。`foot` 保留显式追加操作，供信息流等其他用途选用；工作队列不使用无限加载。
切换 scope 或 page 时新旧内容全程不透明、并排整宽平移：下一页旧层从 0 到 -100%，新层从 +100% 到 0，
向左切换方向相反。复用导航节奏 420ms、`--ease-nav`，不缩放、不改变透明度；推移期间横向裁切，纵向仍可滚动。
同时重置新列表滚动位置，旧层保留切换前的视觉位置并设为 inert。行内不重播 rise、FLIP 或展开动画。
同一 scope 内按 page 数值判断方向，上一页从左侧进入；scope 改变时使用页签 order 或显式 dir，不受页码复位影响。
连续切换先完成当前两层的推移，再前往最后请求的 scope/page，避免新层与尚未入场完毕的内容交叠。
同一 scope/page 内追加只展开新行，既有行保持 DOM 与滚动位置；原位内容更新不播放行级动效。
中间插入或删除使用行高展开或收起，自然带动相邻行，不再叠加 FLIP。
调用方应保持既有行顺序，加载更多只追加结果；不要在追加后重新排序已有数据。
减少动态效果时立即替换。短选项、标签和小卡片列表继续使用默认 `FlowList` 完整重排动效。

`Swap` 与默认 `Panes` 的紧凑推移仍同时淡入淡出，中途反向时从当前显示状态继续。
全高画布使用 `Panes layout="fill"`，不为其外层测量内容高度。

## 页面与浮层退场

- 页面退场保留当前组件实例、DOM、输入与滚动位置。`Swap` 的当前项和离场项沿用同一个 key 与包裹结构；不能为离场项另加 key 前缀。
- 嵌套页面继续继承父级可见状态。隐藏页面不响应删除、提交等快捷键。
- 浮层关闭时立即进入离场状态，动画结束后再卸载。不要先返回空节点，再在 effect 中补回离场内容。
- 持续存在的输入框在换内部内容时，同一帧记录旧内容。不要在离场结束时更换新内容的入场动画类，否则会重新从透明开始播放。

验证：`swap.test.tsx` 检查离场 DOM 身份、草稿状态、挂载次数及嵌套可见状态；`useMorphState.test.tsx` 检查延迟变形与旧内容留存。


## 连续进退与隐藏视图

`Morph` 不把祖先隐藏时测得的零高度当作内容变化。重新显示时直接建立自然高度，避免列表从零展开；高度过渡被新目标打断时，不用旧的取消事件清除新目标。

`Panes keepScroll` 在布局切换前记录已稳定的滚动位置。该模式保留推移动效，但不伸缩整页高度，防止恢复位置被短暂变矮的容器截断。

推移动效通过 Web Animations 从当前绘制的透明度与位移继续。动画途中反向时不恢复到全亮。正常完成的方向、时长与前后淡入淡出节奏保持一致；减少动态效果时立即到位。取消旧动画时处理 `finished` 的正常拒绝，行为依据 [MDN 的 cancel 说明](https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel)。

回归覆盖：隐藏后重新显示、持续修改高度、滚动范围收缩、当前透明度为 0.18 时返回，以及已有 DOM 和草稿留存。

## 封面裁剪

`ImageCropDialog` 提供封面选择、裁剪、预览和导出。调用方传入展示名称、`pickImage`、可选的 `loadInitialImage`，以及 `onSave` 和 `onClose`。图片回调返回可由浏览器读取的图片地址，选择取消时返回 `null`。`onSave` 收到 JPEG data URL。文件选择、写入和刷新模型清单由产品负责。

默认选区为 4:3，可切换至 1:1 或自由比例。预览按帧绘制，点击保存时才编码完整 JPEG。弹窗沿用 TRM UI 的焦点和 Esc 行为。

## 资源下载行

`ResourceDownloadRow` 共用下载、卸载、已安装和进度的显示。传入资源名称、说明、大小等详情，以及安装状态和操作回调。下载、卸载、并发限制与错误恢复仍由产品负责。

## 广场封面与安装进度

`CatalogCover` 接收按优先级排列的图片地址，加载失败时尝试下一张。封面保留完整图片，发布标记、附加标记和下载进度由调用方提供。

`TransferProgress` 显示当前步骤、速度、进度、已传输量和用时。调用方在没有可用比例时省略 `percent`，例如等待连接时。产品负责下载任务和重试提示。
