/** 预览色的组数，对应 tokens.css 里的 --art-1 … --art-6。 */
export const ART_COUNT = 6;

/** 没有真图时的底色：按标识从预览色里取一个，同一个标识每次相同。 */
export function artOf(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + (ch.codePointAt(0) ?? 0)) % 9973;
  return `var(--art-${(h % ART_COUNT) + 1})`;
}

/** 名称的首字：跳过开头的空白和标点，英文字母转大写。取不到时返回空串。 */
export function artInitial(name: string): string {
  for (const ch of name.trim()) {
    if (/[\p{L}\p{N}]/u.test(ch)) return ch.toLocaleUpperCase();
  }
  return "";
}
