import { Component, type ErrorInfo, type ReactNode } from "react";
import { t } from "../i18n/t";

type Props = {
  children: ReactNode;
  /**
   * 把崩溃详情送到哪儿去。接进 Tauri 时传 `(line) => invoke("ui_log", { line })`，
   * 这样用户报障时日志里带着原因。不传就只在控制台里留一份。
   */
  onError?: (detail: string) => void;
};
type State = { error: Error | null; stack: string };

/**
 * 白屏的最后一道防线。
 *
 * index.html 里那个内联守卫管的是「包根本没加载/没跑起来」；这里管另一半：
 * 包跑起来了，然后在渲染时抛错 —— React 的回应是把整棵树卸掉，于是页面
 * 白了，但原因完全不同。
 *
 * 两条路都要留下可读的记录，用户报障时才带得走原因。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, stack: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // WebKit 的 `error.stack` 里不带 message，只有栈等于只知道在哪、
    // 不知道是什么。所以永远先写 name + message。
    const head = `${error.name}: ${error.message}`;
    const stack = `${head}\n${error.stack ?? ""}\n${info.componentStack ?? ""}`;
    this.setState({ stack });
    try {
      this.props.onError?.(stack);
    } catch {
      // 记日志本身不许成为「用另一个白屏换掉这个白屏」的原因。
    }
    console.error(stack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 10,
          padding: "0 56px",
          // 这一屏必须自带兜底颜色：如果坏掉的正好是设计令牌那张表，
          // var() 会取空，整屏就是黑字黑底。
          background: "var(--bg, #f4f6f8)",
          color: "var(--ink-muted, #5d6874)",
          // 用户得能把这段选中复制走。
          userSelect: "text",
        }}
      >
        <div style={{ fontSize: 17, color: "var(--ink, #1e242b)" }}>
          {t("ui.error.title")}
        </div>
        <div>{t("ui.error.hint")}</div>
        <pre
          style={{
            margin: 0,
            maxHeight: "46vh",
            overflow: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            fontSize: 12,
            color: "var(--meta, #8a949e)",
          }}
        >
          {this.state.stack || String(this.state.error)}
        </pre>
      </div>
    );
  }
}
