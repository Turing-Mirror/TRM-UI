/**
 * 文字按钮与筛选项的悬停、选中样式，产品自己选一种，全站统一。
 *
 * - soft（默认）：悬停时文字变深，并垫一层很浅的底；选中项用一块浅底标出，换项时底色滑过去。
 * - plain：任何时候都不垫底，悬停与选中只改文字和图标本身的颜色。与「图标按钮没有底」同一个原则。
 *
 * 只管轻量的文字按钮（评论里的赞与回复、展开回复、筛选、页码、左侧筛选列），
 * 带描边的 Btn、菜单项、输入框不受影响。
 */
import { createContext, useContext, type ReactNode } from "react";

export type HoverStyle = "soft" | "plain";

const Ctx = createContext<HoverStyle>("soft");

export function HoverStyleProvider({ value, children }: { value: HoverStyle; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useHoverStyle = () => useContext(Ctx);

/** 普通文字按钮悬停时的类名。 */
export function hoverInk(style: HoverStyle): string {
  return style === "plain" ? "hover:text-[var(--ink)]" : "hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]";
}

/** 强调色文字按钮（例如「展开其余回复」）悬停时的类名。 */
export function hoverAccent(style: HoverStyle): string {
  return style === "plain" ? "hover:text-[color-mix(in_srgb,var(--accent)_72%,var(--ink))]" : "hover:bg-[var(--accent-soft)]";
}
