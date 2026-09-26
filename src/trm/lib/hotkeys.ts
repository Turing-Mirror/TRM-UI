/**
 * 快捷键的写法与比对。
 *
 * 组合写成 CmdOrCtrl+Shift+K 这样的字符串，修饰键顺序固定为 CmdOrCtrl → Ctrl → Alt → Shift：
 * 录制与比对都走同一条规则，同一个组合不会有两种写法、比出来永远不相等。
 * CmdOrCtrl 在 macOS 上是 ⌘，在 Windows 上是 Ctrl。
 */

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

/** 把一次按键写成组合字符串。只按了修饰键、或是输入法正在组字时返回空串。 */
export function comboFromEvent(e: KeyboardEvent): string {
  if (e.isComposing || e.getModifierState?.("AltGraph")) return "";
  const mods: string[] = [];
  if (isMac) {
    if (e.metaKey) mods.push("CmdOrCtrl");
    if (e.ctrlKey) mods.push("Ctrl");
  } else {
    if (e.ctrlKey) mods.push("CmdOrCtrl");
    if (e.metaKey) mods.push("Super");
  }
  if (e.altKey) mods.push("Alt");
  if (e.shiftKey) mods.push("Shift");
  const code = e.code;
  let main = "";
  if (/^Key[A-Z]$/.test(code)) main = code.slice(3);
  else if (/^Digit[0-9]$/.test(code)) main = code.slice(5);
  else if (/^F([1-9]|1[0-9]|2[0-4])$/.test(code)) main = code;
  else if (/^(Arrow(Up|Down|Left|Right)|Backquote|Backslash|BracketLeft|BracketRight|Comma|Equal|Minus|Period|Quote|Semicolon|Slash|Backspace|Enter|Space|Tab|Delete|End|Home|PageDown|PageUp)$/.test(code)) main = code;
  return main ? [...mods, main].join("+") : "";
}

const KEYS: Record<string, [mac: string, win: string]> = {
  ArrowLeft: ["←", "←"],
  ArrowRight: ["→", "→"],
  ArrowUp: ["↑", "↑"],
  ArrowDown: ["↓", "↓"],
  BracketLeft: ["[", "["],
  BracketRight: ["]", "]"],
  Backslash: ["\\", "\\"],
  Comma: [",", ","],
  Period: [".", "."],
  Slash: ["/", "/"],
  Semicolon: [";", ";"],
  Quote: ["'", "'"],
  Backquote: ["`", "`"],
  Minus: ["-", "-"],
  Equal: ["=", "="],
  Backspace: ["⌫", "Backspace"],
  Enter: ["↩", "Enter"],
};
const MODS: Record<string, [mac: string, win: string]> = {
  CmdOrCtrl: ["⌘", "Ctrl"],
  Ctrl: ["⌃", "Ctrl"],
  Super: ["⌘", "Win"],
  Alt: ["⌥", "Alt"],
  Shift: ["⇧", "Shift"],
};

/** 组合在界面上怎么写：macOS 用 ⌘⇧ 符号连写，Windows 用 Ctrl+Shift+ 连接。 */
export function comboLabel(combo: string): string {
  if (!combo) return "";
  const parts = combo.split("+");
  const main = parts.pop() ?? "";
  const i = isMac ? 0 : 1;
  const mods = parts.map((m) => MODS[m]?.[i] ?? m);
  const key = KEYS[main]?.[i] ?? main;
  return isMac ? [...mods, key].join("") : [...mods, key].join("+");
}

/** 正在打字（输入框、可编辑区域、录制快捷键的按钮）时，一般的快捷键不该触发。 */
export function typingInto(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el?.tagName) return false;
  if (el.closest?.("[data-hotkey-recorder]")) return true;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}
