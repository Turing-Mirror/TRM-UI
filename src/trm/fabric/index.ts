/**
 * Fabric 系列产品共用的代码：不是界面组件，但几款产品里一模一样。
 * 从 trm-ui/fabric 引入，与组件入口分开。清单见画廊的「共用代码」页。
 */
export { splitErrorText } from "./errorText";
export { noteMount, noteUnmount, mountCounts, resetMountCounts } from "./lifecycle";
export { MAX_SHOT_BYTES, MAX_SHOTS, base64Bytes, prepareShot, imageFilesFrom, type Shot } from "./shots";
export {
  registerDialogHandler, askConfirm, askPrompt,
  type ConfirmRequest, type PromptRequest, type DialogRequest,
} from "./webDialog";
export { subscribeNativeDialogHint, pickPath } from "./nativeDialog";
