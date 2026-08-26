/**
 * 复制文本。
 *
 * WebView 里 `navigator.clipboard` 可能被拒（非安全上下文、权限没给），
 * 拒了就退回 `execCommand`。**返回值一定要用**：按了没反应比没有那个按钮更伤，
 * 调用方必须根据结果给出「已复制」或「复制失败」的回执。
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
