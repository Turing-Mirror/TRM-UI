# TRM UI 修整 v1

2026-09-22。在 RVC Fabric 回流基础上修复模板自身问题，保持颜色、尺寸、布局和原有动效风格，不修改桌面壳。

列表右侧交互区现在独立处理点击，不会连带触发整行操作。药丸页签补充方向键循环、Home/End 和单一 Tab 入口；普通分段按钮暴露选中状态，不拦截方向键。

药丸的位移和挤压效果分层，切换时仅重新挂载视觉子层，不再强制回流，也不会重建滑动容器。换页途中开启“减少动态效果”会立即移除离场层；演示按钮定时器在卸载时清理。

弹窗焦点包含下拉框、多行输入框及链接，跳过禁用和隐藏元素；无可聚焦控件时焦点留在容器。叠加及嵌套弹窗仅由最上层响应按键，关闭后还原焦点。

键盘交互参考 W3C [Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) 和 [Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)。使用弹窗 hook 时，容器仍须配置 role="dialog"、aria-modal="true"、tabIndex={-1}；该 hook 负责键盘焦点，不代替产品的遮罩层。

验证：`npm run build` 通过，八语言各 91 条翻译校验通过；`npm test` 共 6 个文件、33 项测试全部通过。未制作安装包，未进行 Windows WebView 的视觉实测。
