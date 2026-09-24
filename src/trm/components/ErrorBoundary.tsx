import { Component, type CSSProperties, type ErrorInfo, type ReactNode } from "react";
import { t } from "../i18n/t";
import { copyText } from "../lib/clipboard";

type Props = {
  children: ReactNode;
  /**
   * 把崩溃详情送到哪儿去。接进 Tauri 时传 `(line) => invoke("ui_log", { line })`，
   * 这样用户报障时日志里带着原因。不传就只在控制台里留一份。
   */
  onError?: (detail: string) => void;
  /**
   * screen：整个窗口的最后一道防线，铺满屏幕。
   * page：只包一页。这一页坏了，标题栏、导航照常能用，用户可以换到别的页。
   */
  variant?: "screen" | "page";
  /** 回到首页。由产品传入，因为只有产品知道首页在哪。不传就不显示这个按钮。 */
  onHome?: () => void;
  /**
   * 恢复默认界面：比如换回官方主题、清掉界面缓存。只动界面，不碰用户数据。
   * 由产品传入，做完后这里会重新载入。不传就不显示这个按钮。
   */
  onResetUi?: () => void;
  /** 这个值一变就自动清掉错误重画，比如换了页、换了路由参数。 */
  resetKey?: unknown;
};
type State = { error: Error | null; stack: string; copied: boolean | null };

/**
 * 白屏的最后一道防线，也是用户的出路。
 *
 * index.html 里那个内联守卫管的是「包根本没加载/没跑起来」；这里管另一半：
 * 包跑起来了，然后在渲染时抛错 —— React 的回应是把整棵树卸掉，于是页面白了。
 *
 * 只告诉用户「出错了」是不够的：他不知道自己的东西还在不在，也不知道下一步
 * 点什么。所以这一屏先说数据没事，再给几个按钮，从轻到重：重试、回首页、
 * 重新载入、恢复默认界面。技术细节收在最下面，要报障时再展开复制。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, stack: "", copied: null };

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

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.retry();
  }

  retry = () => this.setState({ error: null, stack: "", copied: null });

  home = () => {
    this.retry();
    this.props.onHome?.();
  };

  resetUi = () => {
    try {
      this.props.onResetUi?.();
    } finally {
      window.location.reload();
    }
  };

  copy = () => {
    void copyText(this.state.stack || String(this.state.error)).then((ok) => this.setState({ copied: ok }));
  };

  render() {
    if (!this.state.error) return this.props.children;
    const page = this.props.variant === "page";
    return (
      <div
        role="alert"
        style={{
          position: page ? "absolute" : "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 56px",
          overflow: "auto",
          // 这一屏必须自带兜底颜色：如果坏掉的正好是设计令牌那张表，
          // var() 会取空，整屏就是黑字黑底。
          background: "var(--bg, #f4f6f8)",
          color: "var(--ink-muted, #5d6874)",
          fontSize: 13.5,
          lineHeight: 1.7,
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: "var(--ink, #1e242b)" }}>{t("ui.error.title")}</div>
          <div style={{ marginTop: 8 }}>{t("ui.error.safe")}</div>
          <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" onClick={this.retry} style={primary}>
              {t("ui.error.retry")}
            </button>
            {this.props.onHome ? (
              <button type="button" onClick={this.home} style={secondary}>
                {t("ui.error.home")}
              </button>
            ) : null}
            {page ? null : (
              <button type="button" onClick={() => window.location.reload()} style={secondary}>
                {t("ui.error.reload")}
              </button>
            )}
            {this.props.onResetUi ? (
              <button type="button" onClick={this.resetUi} style={secondary}>
                {t("ui.error.resetUi")}
              </button>
            ) : null}
          </div>
          {this.props.onResetUi ? (
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--help, #8a949e)" }}>{t("ui.error.resetNote")}</div>
          ) : null}
          <details style={{ marginTop: 28 }}>
            <summary style={{ cursor: "pointer", fontSize: 12.5, color: "var(--help, #8a949e)" }}>{t("ui.error.details")}</summary>
            <div style={{ marginTop: 8, fontSize: 12.5 }}>{t("ui.error.hint")}</div>
            <pre
              style={{
                margin: "8px 0 0",
                maxHeight: "36vh",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                fontSize: 12,
                color: "var(--meta, #8a949e)",
                // 用户得能把这段选中复制走。
                userSelect: "text",
              }}
            >
              {this.state.stack || String(this.state.error)}
            </pre>
            <button type="button" onClick={this.copy} style={{ ...secondary, marginTop: 10 }}>
              {this.state.copied === null ? t("ui.error.copy") : t(this.state.copied ? "ui.error.copied" : "ui.error.copyFailed")}
            </button>
          </details>
        </div>
      </div>
    );
  }
}

// 按钮不用 Btn 组件、不用 Tailwind：这一屏可能正是因为它们坏了才出现的。
const base: CSSProperties = {
  font: "inherit",
  fontSize: 13,
  padding: "7px 16px",
  borderRadius: 8,
  cursor: "pointer",
  border: 0,
};
const primary: CSSProperties = {
  ...base,
  background: "var(--accent, #1289f0)",
  color: "var(--accent-ink, #ffffff)",
};
const secondary: CSSProperties = {
  ...base,
  background: "transparent",
  color: "var(--ink, #1e242b)",
  boxShadow: "inset 0 0 0 1px var(--line, rgba(30, 36, 43, 0.14))",
};
