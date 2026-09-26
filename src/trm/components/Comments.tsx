/**
 * 评论区：发表、回复（楼中楼）、点赞、删除自己的，按最热或最新排。
 * 可以带一组「评价」（比如可用、存在问题），发表时选一个，列表可按它筛选。
 *
 * 数据由外面给：items 是扁平的一串，回复用 parent 挂在所回复的那一楼下面。
 */
import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { Btn } from "./ui";
import { SegmentControl } from "./SegmentControl";
import { Empty, Filters, Tag, type Tone } from "./display";
import { Icon } from "./Icon";
import { Swap, stagger } from "./motion";

export type CommentItem = {
  id: string;
  author: string;
  text: string;
  /** ISO 时间。 */
  at: string;
  likes: number;
  liked?: boolean;
  /** 评价的 id，对应 verdicts 里的一项。 */
  verdict?: string;
  parent?: string;
  replyTo?: string;
  mine?: boolean;
};

export type Verdict = { id: string; label: string; tone: Tone };

type Sort = "hot" | "new";

/** 一楼下面默认露出几条回复，其余点开再看。 */
const REPLIES_SHOWN = 2;

/** 头像：名字的首字母，按名字取一种淡色。 */
export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const art = ([...name].reduce((h, c) => h + c.charCodeAt(0), 0) % 6) + 1;
  return (
    <span
      aria-hidden
      className="flex-none grid place-items-center rounded-full font-semibold text-[var(--ink-muted)]"
      style={{ width: size, height: size, fontSize: size * 0.4, background: `linear-gradient(145deg, var(--art-${art}), var(--art-${(art % 6) + 1}))` }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function Comments({
  items,
  me,
  owner,
  verdicts,
  ago,
  onPost,
  onLike,
  onDelete,
  onReport,
  quick,
}: {
  items: CommentItem[];
  /** 当前用户的名字，发表框旁的头像用它。 */
  me: string;
  /** 被评论内容的作者，他的回复标「作者」。 */
  owner?: string;
  verdicts?: Verdict[];
  /** 把时间写成「3 天前」这类相对时间。 */
  ago: (iso: string) => string;
  onPost: (text: string, opts: { verdict?: string; parent?: string; replyTo?: string }) => void | Promise<void>;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  onReport?: (id: string) => void;
  /** 发表框下方的快捷短语（比如颜文字），点一下插到光标处。 */
  quick?: string[];
}) {
  const { t } = useI18n();
  const [sort, setSort] = useState<Sort>("hot");
  const [verdict, setVerdict] = useState("all");
  const tops = items.filter((c) => !c.parent);
  const repliesOf = (id: string) => items.filter((c) => c.parent === id).sort((a, b) => a.at.localeCompare(b.at));
  const heat = (c: CommentItem) => c.likes + repliesOf(c.id).length * 2;
  const shown = tops.filter((c) => verdict === "all" || c.verdict === verdict).sort((a, b) => (sort === "new" ? b.at.localeCompare(a.at) : heat(b) - heat(a)));
  const ctx = { me, owner, verdicts, ago, onPost, onLike, onDelete, onReport, quick };

  return (
    <div>
      <Composer ctx={ctx} />
      <div className="mt-6 flex items-center gap-3 flex-wrap">
        {verdicts?.length ? (
          <Filters
            value={verdict}
            onChange={setVerdict}
            options={[{ id: "all", label: t("ui.comments.all"), count: tops.length }, ...verdicts.map((v) => ({ id: v.id, label: v.label, count: tops.filter((c) => c.verdict === v.id).length }))]}
          />
        ) : (
          <span className="text-[13.5px] font-medium">{t("ui.comments.count", { n: items.length })}</span>
        )}
        <span className="ml-auto">
          <Filters
            value={sort}
            onChange={setSort}
            options={[
              { id: "hot" as const, label: t("ui.comments.hot") },
              { id: "new" as const, label: t("ui.comments.new") },
            ]}
          />
        </span>
      </div>
      <Swap k={`${sort}|${verdict}`} className="mt-3">
        {shown.length ? shown.map((c, i) => <Floor key={c.id} i={i} c={c} replies={repliesOf(c.id)} ctx={ctx} />) : <Empty icon="chat" title={t("ui.comments.none")} />}
      </Swap>
    </div>
  );
}

type Ctx = {
  me: string;
  owner?: string;
  verdicts?: Verdict[];
  ago: (iso: string) => string;
  onPost: (text: string, opts: { verdict?: string; parent?: string; replyTo?: string }) => void | Promise<void>;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  onReport?: (id: string) => void;
  quick?: string[];
};

function Floor({ c, replies, ctx, i }: { c: CommentItem; replies: CommentItem[]; ctx: Ctx; i: number }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [replying, setReplying] = useState<string | null>(null);
  const more = replies.length - REPLIES_SHOWN;
  const list = open ? replies : replies.slice(0, REPLIES_SHOWN);
  return (
    <div className="rise py-4" style={stagger(i)}>
      <Item c={c} ctx={ctx} onReply={() => setReplying(c.author)} />
      {replies.length || replying ? (
        <div className="ml-[40px] mt-2 flex flex-col gap-3">
          {list.map((r) => (
            <div key={r.id} className="fade-in">
              <Item c={r} ctx={ctx} small onReply={() => setReplying(r.author)} />
            </div>
          ))}
          {more > 0 ? (
            <button type="button" onClick={() => setOpen(!open)} className="self-start h-7 -ml-2 px-2 inline-flex items-center gap-1 rounded-[var(--rs)] border-0 bg-transparent cursor-pointer text-[12.5px] text-[var(--accent)] hover:bg-[var(--accent-soft)]">
              {open ? t("ui.comments.fold") : t("ui.comments.moreReplies", { n: more })}
              <Icon name="down" size={13} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </button>
          ) : null}
          {replying ? (
            <div className="fade-in">
              <Composer
                ctx={ctx}
                parent={c.id}
                replyTo={replying === c.author ? undefined : replying}
                placeholder={t("ui.comments.replyTo", { name: replying })}
                autoFocus
                onDone={() => {
                  setReplying(null);
                  setOpen(true);
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Item({ c, ctx, small = false, onReply }: { c: CommentItem; ctx: Ctx; small?: boolean; onReply: () => void }) {
  const { t } = useI18n();
  const v = ctx.verdicts?.find((x) => x.id === c.verdict);
  const act = "h-7 px-2 inline-flex items-center gap-1 rounded-[var(--rs)] border-0 bg-transparent cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]";
  return (
    <div className="group flex gap-3">
      <Avatar name={c.author} size={small ? 22 : 28} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[13px] leading-[22px] flex-wrap">
          <span className="font-medium">{c.author}</span>
          {ctx.owner && c.author === ctx.owner ? <Tag tone="accent">{t("ui.comments.author")}</Tag> : null}
          {v ? <Tag tone={v.tone}>{v.label}</Tag> : null}
          {c.replyTo ? (
            <span className="text-[var(--meta)]">
              {t("ui.comments.replied")} <span className="text-[var(--ink-muted)]">{c.replyTo}</span>
            </span>
          ) : null}
          <span className="text-[12px] text-[var(--meta)]">{ctx.ago(c.at)}</span>
        </div>
        <div className={`mt-0.5 whitespace-pre-wrap break-words leading-relaxed select-text ${small ? "text-[13px]" : "text-[13.5px]"}`}>{c.text}</div>
        <div className="mt-1 -ml-2 flex items-center gap-0.5 text-[12px] text-[var(--meta)]">
          <button type="button" aria-pressed={Boolean(c.liked)} onClick={() => ctx.onLike(c.id)} className={`${act} ${c.liked ? "text-[var(--accent)]" : "hover:text-[var(--ink)]"}`}>
            <Icon name="thumbUp" size={13} className={c.liked ? "pop-like" : ""} />
            {c.likes || t("ui.comments.like")}
          </button>
          <button type="button" onClick={onReply} className={`${act} hover:text-[var(--ink)]`}>
            <Icon name="chat" size={13} />
            {t("ui.comments.reply")}
          </button>
          {c.mine && ctx.onDelete ? (
            <button type="button" onClick={() => ctx.onDelete?.(c.id)} className={`${act} opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-[var(--danger)]`}>
              {t("ui.comments.delete")}
            </button>
          ) : !c.mine && ctx.onReport ? (
            <button type="button" onClick={() => ctx.onReport?.(c.id)} className={`${act} opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-[var(--ink)]`}>
              {t("ui.comments.report")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** 发表框。有评价时先选一项；回复框收起时交回 onDone。Enter 发出，Shift + Enter 换行。 */
function Composer({ ctx, parent, replyTo, placeholder, autoFocus = false, onDone }: { ctx: Ctx; parent?: string; replyTo?: string; placeholder?: string; autoFocus?: boolean; onDone?: () => void }) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [verdict, setVerdict] = useState(ctx.verdicts?.[0]?.id ?? "");
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(160, el.scrollHeight)}px`;
  }, [text]);
  const withVerdict = Boolean(ctx.verdicts?.length) && !parent;
  const hint = placeholder ?? t(withVerdict ? "ui.comments.reviewHint" : "ui.comments.hint");
  const send = async () => {
    const v = text.trim();
    if (!v) return;
    await ctx.onPost(v, { verdict: withVerdict ? verdict : undefined, parent, replyTo });
    setText("");
    onDone?.();
  };
  // 快捷短语插到光标处，插完光标落在它后面
  const insert = (k: string) => {
    const el = area.current;
    const at = el ? el.selectionStart : text.length;
    const to = el ? el.selectionEnd : text.length;
    setText(text.slice(0, at) + k + text.slice(to));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + k.length, at + k.length);
    });
  };
  return (
    <div className="flex items-start gap-3">
      {parent ? null : <Avatar name={ctx.me} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 min-w-0 rounded-[var(--r)] shadow-[inset_0_0_0_1px_var(--line)] focus-within:shadow-[inset_0_0_0_1px_var(--focus-line)] transition-shadow">
            <textarea
              ref={area}
              value={text}
              rows={1}
              autoFocus={autoFocus}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send();
                }
                if (e.key === "Escape" && onDone) {
                  e.stopPropagation();
                  onDone();
                }
              }}
              placeholder={hint}
              aria-label={hint}
              className="block w-full resize-none bg-transparent border-0 outline-none px-3.5 py-2 text-[13.5px] leading-[1.6] text-[var(--ink)] placeholder:text-[var(--meta)] select-text"
            />
          </div>
          {onDone ? <Btn onClick={onDone} className="h-[38px]">{t("ui.common.cancel")}</Btn> : null}
          <Btn primary disabled={!text.trim()} onClick={() => void send()} className="h-[38px] px-4">
            {t(parent ? "ui.comments.reply" : "ui.comments.post")}
          </Btn>
        </div>
        {ctx.quick?.length || withVerdict ? (
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {ctx.quick?.length ? (
              <span className="flex items-center gap-0.5 flex-wrap" role="group" aria-label={t("ui.comments.quick")}>
                {ctx.quick.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insert(k)}
                    className="h-6 px-1.5 rounded-[var(--rs)] border-0 bg-transparent cursor-pointer text-[11.5px] text-[var(--meta)] whitespace-nowrap transition-colors hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]"
                  >
                    {k}
                  </button>
                ))}
              </span>
            ) : null}
            {withVerdict && ctx.verdicts ? (
              <span className="ml-auto">
                <SegmentControl value={verdict} onChange={setVerdict} options={ctx.verdicts.map((v) => ({ id: v.id, label: v.label }))} />
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
