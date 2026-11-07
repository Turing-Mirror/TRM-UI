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

`RowGroup({ title?, note?, action?, children })` 在标题与备注下面显示分组卡片，相邻 `Row` 之间使用细线。`Row({ title, desc?, tip?, control?, stacked?, onClick?, children? })` 左侧显示标题与说明，右侧显示控件；`stacked` 将控件置于下方并占满宽度，容器不足 560px 时普通行也换行。`children` 用于行下方补充内容。

只传 `onClick` 而不传 `control` 时，行使用原生按钮和右箭头，支持 Enter 与空格；此时 `tip` 使用原生提示，避免按钮嵌套。原生控件自动关联标题与说明，保留调用方显式标签；复合控件置于有名称的 group 内，调用方仍应提供控件自身的 `label` 或 `ariaLabel`。`Field`、`Group` 和 `Block` 保持原有接口。参考实现见 `src/pages/SettingsPage.tsx`。

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
| Workbench 可选参数 | `listHead`、`listWidth`、`narrowAt`、`empty`、`className`。 |
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
详情保留页面底色，不增加卡片。标题、正文、提示和底部横向占满详情，统一使用 `--workbench-padding`（16px）。
原有 `.trm-workbench-read` 类继续保留，但不再限宽和居中。阅读宽度上限只加在单独的段落或字段上，靠起始边对齐；
聊天消息示例最大宽度为正文的 70%。
`narrowAt` 默认为 900，视口宽度不大于该值时，列表与详情使用两个全高 `Panes`。
`onBack` 由调用方将 `selected` 设为 null；返回按钮使用通用语言包，列表保留滚动与输入状态，并恢复操作焦点。
跨越宽窄断点会重新挂载插槽；需要跨断点保留的草稿、筛选与业务状态应由调用方持有。

`order` 保留为业务列表的键顺序；条目切换不再按此顺序重播详情入场，窄屏列表与详情仍使用 `Panes` 推移。
空字符串也是有效键；只有 null 显示 `empty`。传入 `<Empty icon="chat" title={chooseText} />` 即可显示居中的图标与文字。
`WorkbenchItem` 是原生按钮，用 `aria-pressed` 表达选中状态，支持 Enter 与空格。插槽中不要嵌套交互控件。
`WorkbenchDetail` 固定头部，正文独立滚动，并使用 `Morph` 处理内容高度变化。
`footMode` 默认 `inline`，表单操作紧跟字段；聊天输入框使用 `pinned`，固定在详情底部。
旧版固定底部的调用方需显式传入 `footMode="pinned"`，其他既有参数继续支持。
`sub` 可传单个节点或数组，数组各项独立排列，字符串和数值自动用 `Roll` 更新；自定义节点中的文字变化由调用方包裹 `Roll`。
`title` 为字符串或数值时自动使用 `Roll`；富文本标题可提供 `titleText` 作为变化标识，整个节点随文字滚动。
需要保留标题图标时，将 `Roll` 放在标题节点的文字部分。`Roll` 新增可选 `children`，`value` 仍是变化标识。
宽屏切换条目保持一个详情实例，不使用 `Swap`。调用方不要给详情组件设置随条目变化的 React key。
标题与子字段更新使用 `Roll`；操作、菜单、输入框与底部不播放位移或淡入淡出。提示仅使用 `Collapse`。
正文顶层子节点自动交给 `FlowList`。会话消息使用包含会话 ID 的稳定 key；共同内容使用相同 key 保留 DOM。
退出块收起，新增块展开，间距写在块内；FlowList 自身连续改变正文高度，不再叠加 Morph 的延迟过渡。
首次显示标题、字段与正文时可依次浮现；后续切换不重播。空态与详情直接替换，维持第 6 轮的无重叠行为。
减少动态效果时，滚字、折叠、消息增删及自动滚动立即完成。

聊天可设置 `scrollToEnd={conversationId + ":" + messageCount}`。首次挂载在绘制前定位末尾；
令牌变化后在 `FLOW_MS` 内平滑跟随正在伸缩的内容末尾，不在移除旧气泡后突然跳转。
滚轮或触摸会中断跟随；输入草稿不改变令牌，因此不会打断向上阅读。正文禁用浏览器滚动锚定以免互相干扰。
草稿、处理状态与消息由调用方按会话保存；组件保留 DOM 不代表共享不同会话的业务数据。

`ChatComposer` 基于 `ComposerInput`，输入高度自动增长至 `maxHeight`（默认 200px），清空后自动收缩。
Enter 与发送按钮调用 `onSend`；Shift + Enter 换行，输入法确认不发送；空白草稿、禁用和发送中均禁止发送。
`sending` 显示按钮忙碌状态并禁用输入。草稿与发送结果由调用方维护，组件不会自行清空；占位符和按钮名称由语言包传入。
输入与发送按钮位于同一个 `--surface` 圆角区域，使用 `--r`、`--line` 内描边与强调色焦点环。
单行输入行与圆形发送按钮均为 32px，按钮距区域右下各 8px；固定底部时多行输入向上增长。
可发送时使用 `--accent` / `--accent-ink`；空白或禁用时使用中性 `--rail` / `--ink-muted`，不降低整体透明度。
发送中以居中 16px spinner 替换发送图标。`maxHeight` 限制文本输入本身，不包含区域的上下内边距。
`state` 放在输入区域上方。`ChatState` 默认 `tone="assistant"`，使用 `--accent-soft`；人工状态使用 `--rail`。
状态条满宽、最小高度 40px、14px 中等字重、`--r` 圆角；标签使用 Roll，底色沿 `--flow-ms` / `--ease` 过渡。
默认图标为芯片或人员，可由 `icon` 替换；`action` 可放安静的 `Btn`，不提供时没有操作占位。
`AlertMark` 为 16px 圆形 `--surface` 底、1px `--hairline` 环与实心 `--danger` 感叹号，支持聚焦查看 Tooltip。
在相对定位的气泡内使用 `<span className="trm-alert-mark-corner"><AlertMark label={label} /></span>`，
标记在右下边缘向外重叠 4px。深色主题继续使用相应表面与危险色令牌。

`listHead` 内使用 `.trm-workbench-heading`、`.trm-workbench-filters`，`list` 使用 `.trm-workbench-rows` 独立滚动。
工作台按实际行顺序标记 `data-divider`，忽略退出中的 FlowList 行；最后一项不画线。
分隔线是文字列的伪元素，自动避开头像与两侧内边距，悬停或选中行两侧的线隐藏。
所有 WorkbenchItem 的悬停与选中背景按 `--workbench-row-inset`（8px）横向内缩，
使用 `--rs` 圆角；行宽扣除两侧外边距，因此背景不接触列表卡片边缘。
行内左右各留 8px，与列表头共用外层内缩，内容和右侧元信息距卡片边缘均为 16px。
分隔线继续对齐行文字列，有头像时避开头像。
审核画廊的 Pending 初始包含 3 条待处理记录，先显示 2 条；All 显示这 3 条及 2 条已处理记录。
列表头标题与总数随筛选使用 Roll 更新，总数包含尚未加载显示的匹配记录。
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

`QueueList<T>` 接受 `items`、`keyOf`、`render`、`scope`，可选 `order`、`dir`、`className`、
`itemClassName`、`empty`、`foot`。`scope` 表示筛选或查询，不包含条数；`order` 是页签 ID 顺序，
也可直接给 `dir={1 | -1}`。没有可比较的顺序时从右侧进入。
`className` 用于组件自身的滚动容器；父布局需限制高度，工作台使用 `trm-workbench-rows`。
空态和加载更多按钮分别放在 `empty`、`foot`，与当前列表同属一个内容层。
切换 scope 时新旧内容全程不透明、并排整宽平移：向右切换时旧层从 0 到 -100%，新层从 +100% 到 0，
向左切换方向相反。复用导航节奏 420ms、`--ease-nav`，不缩放、不改变透明度；推移期间横向裁切，纵向仍可滚动。
同时重置新列表滚动位置，旧层保留切换前的视觉位置并设为 inert。行内不重播 rise、FLIP 或展开动画。
连续切换先完成当前两层的推移，再前往最后请求的 scope，避免新层与尚未入场完毕的内容交叠。
同一 scope 内追加只展开新行，既有行保持 DOM 与滚动位置；原位内容更新不播放行级动效。
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
