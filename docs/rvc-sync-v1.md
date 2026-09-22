# RVC Fabric 界面回流 v1

日期：2026-09-22。参照本地 RVC Fabric `1e1265b` 的通用界面实现；仅更新 TRM UI，不改动产品仓库。

## 本次范围

问号提示分别处理悬停和焦点；点击后保留说明，Escape 关闭，滚动关闭后可再次点击打开。Toggle 将问号移出 label，避免点击文字触发问号、点击一次重复切换。

PageHost 保留同一个页面节点直到离场结束，不再重新挂载旧页。快速返回时保留表单状态；离场页面不参与键盘操作。保留原有导航顺序、420ms 换页动效及减少动态效果设置。

RangeBar、Slider、Toggle 支持 disabled。保留 Slider 原有 ariaLabel 接口。SegmentControl 的选项标识改为无歧义序列，保留药丸的完整滑动动效。

新增 AccordionGroup 和 useModalKeys 导出。折叠列表的纯文本触发区使用原生按钮；带交互操作区的列表不嵌套按钮。弹窗支持初始聚焦、Tab 循环、Escape 取消及关闭后还原焦点。

## 使用约定

下载、说明等操作放在 PageHead.actions 或 Block.action。独立工具窗口已在标题栏显示名称时，不再重复添加内容标题；用 Block 承载说明和操作。设置项沿用间距分组，不新增分割线。

useModalKeys 的 dialogRef 指向带 role="dialog"、aria-modal="true"、tabIndex={-1} 的容器；onEscape 由产品定义取消语义。本次没有复制 RVC 的运行时、下载器、音色或音频引擎逻辑，也没有替换模板的主题和八语言结构。

## 验证

`npm run build` 通过，八语言共 91 条翻译校验通过；`npm test` 的 5 个文件、24 项测试全部通过。测试覆盖问号事件边界、弹窗焦点、快速往返切页、连续 100 次换页、禁用控件和折叠列表。未构建安装包，未执行 Windows WebView 的视觉验收。
