import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

/**
 * 故意只查一件事：Rules of Hooks。
 *
 * 早退 `return` 后面声明的 hook 会让组件抛错，React 把整棵树卸掉 —— 用户看到
 * 的只有白屏，没有任何别的症状。这一类 bug 在 code review 里看不出来，
 * TypeScript 也管不着，所以交给机器，并且接在 `npm run build` 上。
 *
 * 风格规则一条都不加：一个会因为格式意见而让发布构建失败的 lint 关卡，
 * 迟早会被人关掉 —— 关掉的时候，上面这条检查跟着一起没了。
 */
export default [
  { ignores: ["frontend/**", "dist/**", "node_modules/**"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
