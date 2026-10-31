import type { LocaleCode } from "../trm";

/**
 * 规则的数据模型。「文本要求」「交互」两页都照这套结构渲染。
 *
 * 规则本身（标题、说明、原则）八种语言写全，少一种 TypeScript 就报错。
 * 示范按语言挂：只适用于某一种语言的示范（例如中文里的「·」拼接）只写那一种，
 * 页面只显示当前语言有的示范。
 */

/** 八种语言写全的一段文字。 */
export type Text = Record<LocaleCode, string>;

/** 一组示范：先错后对。 */
export type Pair = readonly [wrong: string, right: string];

export type Example = {
  /** 这组示范属于哪一类，例如「分隔点」。连续几组同类时只在第一组上显示。 */
  term?: Partial<Text>;
  /** 示范出自哪里，例如「RVC Fabric (s.1db2e283ac)」。真实条目才写。 */
  source?: string;
  /** 各语言的示范。没有当前语言的那组，页面上不显示。 */
  pairs: Partial<Record<LocaleCode, Pair>>;
};

export type Rule = {
  id: string;
  title: Text;
  lead?: Text[];
  /** 编号列出的几条原则。 */
  list?: Text[];
  examples: Example[];
  /** 列在示范之后的补充说明。 */
  note?: Text;
};

/** 只有中文的一组示范。 */
export function zh(wrong: string, right: string, term?: string): Example {
  return { term: term ? { "zh-CN": term } : undefined, pairs: { "zh-CN": [wrong, right] } };
}
