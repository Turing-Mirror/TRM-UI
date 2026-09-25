import type { MouseEvent, ReactNode } from "react";
import { HelpMark } from "./Tooltip";

/** 页面内容的左右留白。窄窗口下逐档收窄，不是一刀切。 */
export function PagePad({ children }: { children: ReactNode }) {
  return (
    <div className="px-[30px] pb-[34px] max-[1020px]:px-[22px] max-[1020px]:pb-[30px] max-[720px]:px-4 max-[720px]:pb-[26px]">
      {children}
    </div>
  );
}

/** 页头：大标题 + 一行灰色副标题 + 右侧动作区。 */
export function PageHead({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="pt-2 pb-1.5 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h2 className="text-[25px] font-semibold tracking-tight m-0 max-[860px]:text-[22px]">
          {title}
        </h2>
        {sub ? (
          <div className="text-[12.5px] text-[var(--meta)] mt-1.5">{sub}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2 flex-wrap">{actions}</div>
      ) : null}
    </div>
  );
}

/** 一节内容：小标题 +（可选）问号、备注、右侧动作。 */
export function Block({
  title,
  titleTip,
  note,
  action,
  children,
  className = "",
  id,
}: {
  title?: string;
  /** 标题后面的小问号。 */
  titleTip?: string;
  note?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mt-[30px] ${className}`}>
      {(title || note || action) && (
        // items-center（不是 baseline）：标题旁的小问号是 17px 的圆，按基线
        // 对齐会整颗往下掉一截，看起来比标题低半个字。
        <div className="flex items-center gap-[11px] mb-[15px] flex-wrap">
          {title ? (
            <h3 className="text-[15.5px] font-semibold m-0 inline-flex items-center gap-1.5 leading-none">
              <span className="leading-normal">{title}</span>
              {titleTip ? <HelpMark title={titleTip} /> : null}
            </h3>
          ) : null}
          {note ? (
            <span className="text-xs text-[var(--meta)] leading-none">{note}</span>
          ) : null}
          {action ? <span className="ml-auto">{action}</span> : null}
        </div>
      )}
      {children}
    </section>
  );
}

/** 把若干行圈成「一组」的浅色底块。相邻的设置项靠它表示归属关系。 */
export function Group({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[var(--group)] rounded-[var(--r)] px-5 py-2">{children}</div>
  );
}

export function Btn({
  children,
  primary = false,
  on = false,
  uw = false,
  disabled = false,
  busy = false,
  onClick,
  className = "",
  ariaLabel,
}: {
  children: ReactNode;
  /** 主按钮：实心强调色。一屏最多一个。 */
  primary?: boolean;
  /** 已选中态：描边 + 强调色文字。 */
  on?: boolean;
  /** 等宽。用于「使用 / 使用中」这种切换后字数会变的按钮，避免按一下宽度跳一下。 */
  uw?: boolean;
  disabled?: boolean;
  /**
   * 请求在途。会禁用按钮，并在文字前面点三个点。
   *
   * 只变灰是不够的：用户点了一下，按钮灰了，界面别的地方没有任何变化 ——
   * 他分不出「正在做」和「点了没反应」，于是再点，或者来群里问。灰是状态，
   * 动的那三个点才是回执。
   */
  busy?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  /** 按钮上只有图形没有字时（比如「⋯」）必须给，否则读屏读不出这是什么。 */
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      className={[
        "text-[12.5px] border-0 rounded-[var(--rs)] cursor-pointer whitespace-nowrap",
        "transition-[transform,background,color,box-shadow] duration-200 ease-[var(--ease)]",
        "active:scale-[0.955] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
        uw ? "min-w-[74px] text-center px-0 py-1.5" : "px-[13px] py-1.5",
        primary
          ? "bg-[var(--accent)] text-[var(--accent-ink)] font-semibold shadow-none hover:brightness-95"
          : on
            ? "bg-transparent text-[var(--accent)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_42%,transparent)]"
            : "bg-transparent text-[var(--ink-muted)] shadow-[inset_0_0_0_1px_var(--line)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_4%,transparent)]",
        disabled || busy ? "cursor-default active:scale-100" : "",
        className,
      ].join(" ")}
    >
      {busy ? (
        <span aria-hidden className="btn-dots mr-1.5 inline-block align-middle" />
      ) : null}
      {children}
    </button>
  );
}

/** 列表里的一行。可展开时，正文画在行下面。 */
export function ListItem({
  title,
  titleTip,
  desc,
  meta,
  right,
  rightInteractive = true,
  children,
  clickable = false,
  expanded,
  onClick,
}: {
  title?: string;
  /** 标题后面的小问号。专有名词的解释统一从 lib/glossary 取。 */
  titleTip?: string;
  desc?: string;
  meta?: string;
  right?: ReactNode;
  /** 仅含文字的右侧内容可设为 false，整行使用原生按钮。 */
  rightInteractive?: boolean;
  /** Body revealed under the row; only rendered when `expanded`. */
  children?: ReactNode;
  clickable?: boolean;
  expanded?: boolean;
  onClick?: () => void;
}) {
  // `clickable` used to be styling only — rows could look interactive and be
  // completely inert, which is what the four 「展开」 rows on the help page were.
  const act = onClick;
  const isBtn = Boolean(act);
  const rowClass = [
    "flex items-center gap-3.5 py-3.5 rounded-[var(--rs)]",
    clickable || isBtn
      ? "cursor-pointer -mx-3.5 px-3.5 hover:bg-[color-mix(in_srgb,var(--ink)_4%,transparent)] transition-colors"
      : "",
    isBtn
      ? "focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[-2px]"
      : "",
  ].join(" ");
  // Use spans inside the native button: a button cannot contain divs, and the
  // previous role=button wrapper also made keyboard support needlessly manual.
  const content = (
    <>
      <span className="min-w-0">
        {meta ? (
          <span className="block text-[11.5px] text-[var(--meta)] mb-0.5">{meta}</span>
        ) : null}
        {title ? (
          <span className="inline-flex items-center gap-1.5 text-sm leading-snug">
            <span>{title}</span>
            {titleTip ? <HelpMark title={titleTip} /> : null}
          </span>
        ) : null}
        {desc ? (
          <span className="block text-[12.5px] text-[var(--help)] mt-0.5 leading-relaxed">
            {desc}
          </span>
        ) : null}
      </span>
      {right ? (
        <span className="ml-auto flex-none flex items-center gap-2"
          onClick={rightInteractive ? (e) => e.stopPropagation() : undefined}
        >{right}</span>
      ) : null}
    </>
  );
  // The current expandable rows have text-only right content. Keep the
  // fallback for a future clickable row with a tooltip, where nesting the
  // HelpMark button inside another button would be invalid HTML.
  const nativeButton = isBtn && !titleTip && (!right || !rightInteractive);
  const body = nativeButton ? (
    <button
      type="button"
      aria-expanded={expanded !== undefined ? expanded : undefined}
      onClick={act}
      className={[rowClass, "w-[calc(100%+1.75rem)] appearance-none border-0 bg-transparent text-left font-[inherit] text-[inherit]"].join(" ")}
    >
      {content}
    </button>
  ) : (
    <div
      role={isBtn ? "button" : undefined}
      tabIndex={isBtn ? 0 : undefined}
      aria-expanded={isBtn && expanded !== undefined ? expanded : undefined}
      onClick={act}
      onKeyDown={
        isBtn
          ? (e) => {
              if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                act?.();
              }
            }
          : undefined
      }
      className={rowClass}
    >
      {content}
    </div>
  );
  if (!children) return body;
  return (
    <div>
      {body}
      {/* 正文和标题行之间要留出气口。原来是 -mt-1，正文顶边正好压在标题行
          悬停灰底的底边上 —— 鼠标停在标题上时，灰块下沿和文字挨成一条，
          看着像文字被切了一刀。 */}
      {expanded ? (
        // 别再往这儿加 `max-w-[NNch]`：`ch` 是「0」字形的宽度（12.5px 字号下
        // 实测 6.95px），只有一个汉字（12.5px）的一半。按拉丁文校准的 74ch
        // 折成中文就只剩 41 字、约容器宽度的 47% —— 用户看到的就是「一行话
        // 没走到一半就断了」。DonateNote 早前是同一个毛病，改成 w-full
        // min-w-0 治好的，这里跟它对齐。
        <div className="pt-2 pb-4 text-[12.5px] text-[var(--ink-muted)] leading-relaxed whitespace-pre-line w-full min-w-0">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export type AccordionItem = {
  id: string;
  title: string;
  desc?: string;
  content: ReactNode;
};

/** Shared grouped accordion rows used by the help sections. */
export function AccordionGroup({
  items,
  openId,
  onToggle,
  openLabel,
  closedLabel,
}: {
  items: readonly AccordionItem[];
  openId: string;
  onToggle: (id: string) => void;
  openLabel: ReactNode;
  closedLabel: ReactNode;
}) {
  return (
    <Group>
      {items.map((item) => {
        const expanded = openId === item.id;
        return (
          <ListItem
            key={item.id}
            title={item.title}
            desc={item.desc}
            expanded={expanded}
            onClick={() => onToggle(item.id)}
            rightInteractive={false}
            right={
              <span className="text-[13.5px] text-[var(--ink-muted)]">
                {expanded ? openLabel : closedLabel}
              </span>
            }
          >
            {item.content}
          </ListItem>
        );
      })}
    </Group>
  );
}

export { HelpMark };
