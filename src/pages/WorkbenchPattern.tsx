import { useEffect, useRef, useState } from "react";
import {
  AlertMark, Block, Btn, ChatComposer, ChatState, Collapse, Empty, Filters, Icon, QueueList, Roll, Tag, TextArea,
  Tooltip, IconBtn, Pager, usePaged,
  Workbench, WorkbenchDetail, WorkbenchItem, useI18n,
} from "../trm";

const ENTRIES = [
  { id: "access", hits: 12 },
  { id: "export", hits: 8 },
  { id: "invite", hits: 3 },
] as const;
const REVIEW_ENTRIES = [
  ...ENTRIES,
  { id: "billing", hits: 6 },
  { id: "password", hits: 4 },
] as const;
type Entry = (typeof REVIEW_ENTRIES)[number];
type Status = "pending" | "approved" | "rejected";
type Filter = "all" | "pending";
const PAGE_SIZE = 2;
const INITIAL_STATUSES: Record<string, Status> = { billing: "approved", password: "rejected" };

function ReviewDetail({ item, status, answer, onAnswer, onReview }: {
  item: Entry;
  status: Status;
  answer: string;
  onAnswer: (value: string) => void;
  onReview: (status: Status) => void;
}) {
  const { t } = useI18n();
  const [edits, setEdits] = useState<Record<string, boolean>>({});
  const editing = edits[item.id] ?? false;
  const pending = status === "pending";
  return <WorkbenchDetail title={t(`demo.workbench.${item.id}.question`)}
    sub={[t(`demo.workbench.${status}`), t("demo.workbench.hits", { n: item.hits })]}
    actions={pending ? <Btn onClick={() => setEdits(value => ({ ...value, [item.id]: !editing }))}>
      {t(editing ? "demo.workbench.done" : "demo.workbench.edit")}
    </Btn> : undefined}
    footMode="inline" foot={pending ? <>
      <Btn primary disabled={!answer.trim()} onClick={() => onReview("approved")}>
        {t("demo.workbench.approve")}
      </Btn>
      <Btn onClick={() => onReview("rejected")}>{t("demo.workbench.reject")}</Btn>
    </> : <Tag tone={status === "approved" ? "ok" : "muted"}>{t(`demo.workbench.${status}`)}</Tag>}>
      <div key={`${item.id}:answer`} className="max-w-[var(--page-w-read)] text-[13px]">
        <h4 className="m-0 font-medium">{t("demo.workbench.answer")}</h4>
        <p className="mt-2 whitespace-pre-wrap text-[var(--ink-muted)]">{answer}</p>
      </div>
      <Collapse key={`${item.id}:editor`} open={editing && pending} className="max-w-[var(--page-w-read)]">
        <TextArea aria-label={t("demo.workbench.answer")} value={answer} onChange={onAnswer} rows={5} />
      </Collapse>
      <div key={`${item.id}:sources`} className="max-w-[var(--page-w-read)] text-[13px]">
        <h4 className="m-0 font-medium">{t("demo.workbench.sources")}</h4>
        <p className="mt-2 text-[var(--ink-muted)]">{t("demo.workbench.source")}</p>
      </div>
  </WorkbenchDetail>;
}

export function WorkbenchPattern() {
  const { t, locale } = useI18n();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("pending");
  const [statuses, setStatuses] = useState<Record<string, Status>>(INITIAL_STATUSES);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const status = (id: string) => statuses[id] ?? "pending";
  // Drafts belong to the queue so switching details or resizing does not discard an edit.
  const answer = (id: string) => answers[`${locale}:${id}`] ?? t(`demo.workbench.${id}.answer`);
  const filtered = REVIEW_ENTRIES.filter(item => filter === "all" || status(item.id) === "pending");
  const { page, pages, setPage, slice: shown } = usePaged(filtered, PAGE_SIZE, filter);
  const current = REVIEW_ENTRIES.find(item => item.id === selected);
  const review = (next: Status) => {
    if (!current) return;
    setStatuses(previous => ({ ...previous, [current.id]: next }));
    if (filter === "pending") setSelected(null);
  };

  return <><Block title={t("demo.workbench.title")}>
    <div className="h-[480px]">
      <Workbench selected={selected} order={REVIEW_ENTRIES.map(item => item.id)} onBack={() => setSelected(null)}
        empty={<Empty icon="chat" title={t("demo.workbench.choose")} />}
        listHead={<>
          <div className="trm-workbench-heading">
            <h3><Roll value={t(`demo.workbench.${filter}`)} /></h3>
            <Roll value={String(filtered.length)} />
          </div>
          <div className="trm-workbench-filters">
            <Filters value={filter} onChange={value => {
              setFilter(value);
              const next = REVIEW_ENTRIES.filter(item => value === "all" || status(item.id) === "pending");
              if (!next.some(item => item.id === selected)) setSelected(null);
            }} options={(["pending", "all"] as const).map(id => ({ id, label: t(`demo.workbench.${id}`) }))} />
          </div>
        </>}
        pager={<Pager page={page} pages={pages} onChange={setPage} showSinglePage />}
        list={<QueueList scope={filter} page={page} order={["pending", "all"]} className="trm-workbench-rows"
            items={shown} keyOf={item => item.id} render={item => (
              <WorkbenchItem title={t(`demo.workbench.${item.id}.question`)}
                  meta={t("demo.workbench.hits", { n: item.hits })} preview={answer(item.id)}
                  tag={<Tag>{t(`demo.workbench.${status(item.id)}`)}</Tag>}
                  selected={selected === item.id} onClick={() => setSelected(item.id)} />
            )} empty={<Empty icon="check" title={t("demo.workbench.clear")} />} />}
        detail={current ? <ReviewDetail item={current} status={status(current.id)}
          answer={answer(current.id)} onReview={review}
          onAnswer={value => setAnswers(previous => ({ ...previous, [`${locale}:${current.id}`]: value }))}
        /> : null} />
    </div>
  </Block><ChatQueue /></>;
}

function ChatQueue() {
  const { t, locale } = useI18n();
  const [selected, select] = useState<string | null>(null);
  const { page, pages, setPage, slice: shown } = usePaged([...ENTRIES], PAGE_SIZE);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [replies, setReplies] = useState<Record<string, string[]>>({});
  const [noticeHidden, setNoticeHidden] = useState<Record<string, boolean>>({});
  const [handlers, setHandlers] = useState<Record<string, boolean>>({ access: true });
  const current = ENTRIES.find(item => item.id === selected);
  const key = `${locale}:${selected}`;
  const messages = replies[key] ?? [];
  const draft = drafts[key] ?? "";
  const human = handlers[selected ?? ""] ?? false;
  const [sending, setSending] = useState(false);
  const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (sendTimer.current !== null) clearTimeout(sendTimer.current); }, []);
  const send = () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    sendTimer.current = setTimeout(() => {
      setReplies(previous => ({ ...previous, [key]: [...(previous[key] ?? []), draft.trim()] }));
      setDrafts(previous => ({ ...previous, [key]: "" }));
      setSending(false);
    }, 650);
  };
  return <Block title={t("demo.workbench.chat.title")}>
    <div className="h-[560px]">
      <Workbench selected={selected} order={ENTRIES.map(item => item.id)} onBack={() => select(null)}
        listHead={<div className="trm-workbench-heading"><h3>{t("demo.workbench.chat.queue")}</h3></div>}
        empty={<Empty icon="chat" title={t("demo.workbench.chat.choose")} />}
        pager={<Pager page={page} pages={pages} onChange={setPage} showSinglePage />}
        list={<QueueList scope="all" page={page} className="trm-workbench-rows" items={shown} keyOf={item => item.id}
          render={item => <WorkbenchItem title={t(`demo.workbench.chat.${item.id}`)}
            avatar={<Icon name="chat" size={24} />} preview={t(`demo.workbench.${item.id}.question`)}
            selected={selected === item.id} onClick={() => select(item.id)} />} />}
        detail={current ? <WorkbenchDetail title={<span className="inline-flex items-center gap-2">
          <Tooltip text={t("demo.workbench.chat.platform")}>
            <span role="img" aria-label={t("demo.workbench.chat.platform")}><Icon name="globe" size={18} /></span>
          </Tooltip>
          <Roll value={t(`demo.workbench.chat.${current.id}`)} />
        </span>}
          sub={t(messages.length ? "demo.workbench.chat.replied" : "demo.workbench.chat.waiting")}
          scrollToEnd={`${key}:${messages.length}`}
          actions={<>
            <Btn disabled={!human}
              onClick={() => setHandlers(previous => ({ ...previous, [current.id]: false }))}>
              {t("demo.workbench.chat.assignAssistant")}
            </Btn>
            <Btn onClick={() => setNoticeHidden(previous => ({ ...previous, [key]: !previous[key] }))}>
              {t(noticeHidden[key] ? "demo.workbench.chat.showNotice" : "demo.workbench.chat.hideNotice")}
            </Btn>
          </>}
          notice={!noticeHidden[key] ? <div className="rounded-[var(--rs)] bg-[var(--group)] p-3 text-[13px]">
            {t("demo.workbench.chat.notice")}
          </div> : null}
          footMode="pinned" foot={<ChatComposer value={draft} sending={sending} placeholder={t("demo.workbench.chat.placeholder")}
            state={<ChatState tone={human ? "human" : "assistant"}
              action={<IconBtn icon={human ? "chip" : "user"}
                label={t(human ? "demo.workbench.chat.assistant" : "demo.workbench.chat.human")}
                onClick={() => setHandlers(previous => ({ ...previous, [current.id]: !human }))} />}
              label={t(human ? "demo.workbench.chat.human" : "demo.workbench.chat.assistant")} />}
            sendLabel={t("demo.workbench.chat.send")} onSend={send}
            onChange={value => setDrafts(previous => ({ ...previous, [key]: value }))} />}>
          <div key={`${key}:incoming`}
            className="relative w-fit max-w-[70%] rounded-[var(--r)] bg-[var(--group)] p-3 text-[13px]">
            {t(`demo.workbench.${current.id}.question`)}
            {current.id === "access" ? <span className="trm-alert-mark-corner">
              <AlertMark label={t("demo.workbench.chat.needsHuman")} />
            </span> : null}
          </div>
          {messages.map((message, i) => <div key={`${key}:reply:${i}`} role="log"
            aria-label={t("demo.workbench.chat.reply")}
            className="ml-auto w-fit max-w-[70%] whitespace-pre-wrap rounded-[var(--r)]
              bg-[var(--accent-soft)] p-3 text-[13px]">{message}</div>)}
        </WorkbenchDetail> : null} />
    </div>
  </Block>;
}
