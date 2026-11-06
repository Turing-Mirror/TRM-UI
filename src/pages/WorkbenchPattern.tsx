import { useState } from "react";
import {
  Block, Btn, ChatComposer, Collapse, Empty, Filters, FlowList, Icon, Roll, Tag, TextArea,
  Workbench, WorkbenchDetail, WorkbenchItem, stagger, useI18n,
} from "../trm";

const ENTRIES = [
  { id: "access", hits: 12 },
  { id: "export", hits: 8 },
  { id: "invite", hits: 3 },
] as const;
type Entry = (typeof ENTRIES)[number];
type Status = "pending" | "approved" | "rejected";
type Filter = "all" | "pending";
const INITIAL_LIMIT = 2;

function ReviewDetail({ item, status, answer, onAnswer, onReview }: {
  item: Entry;
  status: Status;
  answer: string;
  onAnswer: (value: string) => void;
  onReview: (status: Status) => void;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const pending = status === "pending";
  return <WorkbenchDetail title={t(`demo.workbench.${item.id}.question`)}
    sub={[t(`demo.workbench.${status}`), t("demo.workbench.hits", { n: item.hits })]}
    actions={pending ? <Btn onClick={() => setEditing(value => !value)}>
      {t(editing ? "demo.workbench.done" : "demo.workbench.edit")}
    </Btn> : undefined}
    footMode="inline" foot={pending ? <>
      <Btn primary disabled={!answer.trim()} onClick={() => onReview("approved")}>
        {t("demo.workbench.approve")}
      </Btn>
      <Btn onClick={() => onReview("rejected")}>{t("demo.workbench.reject")}</Btn>
    </> : <Tag tone={status === "approved" ? "ok" : "muted"}>{t(`demo.workbench.${status}`)}</Tag>}>
      <div className="max-w-[var(--page-w-read)] text-[13px]">
        <h4 className="m-0 font-medium">{t("demo.workbench.answer")}</h4>
        <p className="mt-2 whitespace-pre-wrap text-[var(--ink-muted)]">{answer}</p>
      </div>
      <Collapse open={editing && pending} className="max-w-[var(--page-w-read)]">
        <TextArea aria-label={t("demo.workbench.answer")} value={answer} onChange={onAnswer} rows={5} />
      </Collapse>
      <div className="max-w-[var(--page-w-read)] text-[13px]">
        <h4 className="m-0 font-medium">{t("demo.workbench.sources")}</h4>
        <p className="mt-2 text-[var(--ink-muted)]">{t("demo.workbench.source")}</p>
      </div>
  </WorkbenchDetail>;
}

export function WorkbenchPattern() {
  const { t, locale } = useI18n();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("pending");
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flowing, setFlowing] = useState(false);
  const status = (id: string) => statuses[id] ?? "pending";
  // Drafts belong to the queue so switching details or resizing does not discard an edit.
  const answer = (id: string) => answers[`${locale}:${id}`] ?? t(`demo.workbench.${id}.answer`);
  const filtered = ENTRIES.filter(item => filter === "all" || status(item.id) === "pending");
  const shown = filtered.slice(0, limit);
  const current = ENTRIES.find(item => item.id === selected);
  const pending = ENTRIES.filter(item => status(item.id) === "pending").length;
  const review = (next: Status) => {
    if (!current) return;
    setFlowing(true);
    setStatuses(previous => ({ ...previous, [current.id]: next }));
    if (filter === "pending") setSelected(null);
  };

  return <><Block title={t("demo.workbench.title")}>
    <div className="h-[480px]">
      <Workbench selected={selected} order={ENTRIES.map(item => item.id)} onBack={() => setSelected(null)}
        empty={<Empty icon="chat" title={t("demo.workbench.choose")} />}
        listHead={<>
          <div className="trm-workbench-heading">
            <h3>{t("demo.workbench.pending")}</h3><Roll value={String(pending)} />
          </div>
          <div className="trm-workbench-filters">
            <Filters value={filter} onChange={value => {
              setFlowing(true);
              setFilter(value);
              setLimit(INITIAL_LIMIT);
              const next = ENTRIES.filter(item => value === "all" || status(item.id) === "pending");
              if (!next.slice(0, INITIAL_LIMIT).some(item => item.id === selected)) setSelected(null);
            }} options={(["pending", "all"] as const).map(id => ({ id, label: t(`demo.workbench.${id}`) }))} />
          </div>
        </>}
        list={<div className="trm-workbench-rows">
            {/* Only the initial list staggers; later changes use FlowList's expand/collapse motion. */}
            <FlowList items={shown} keyOf={item => item.id} className={flowing ? "flow-quiet" : ""}
              render={(item, i) => (
              <div className="rise" style={stagger(i)}>
                <WorkbenchItem title={t(`demo.workbench.${item.id}.question`)}
                  meta={t("demo.workbench.hits", { n: item.hits })} preview={answer(item.id)}
                  tag={<Tag>{t(`demo.workbench.${status(item.id)}`)}</Tag>}
                  selected={selected === item.id} onClick={() => setSelected(item.id)} />
              </div>
            )} />
            {!shown.length ? <Empty icon="check" title={t("demo.workbench.clear")} /> : null}
            {shown.length < filtered.length ? <div className="p-4 text-center">
              <Btn onClick={() => { setFlowing(true); setLimit(value => value + INITIAL_LIMIT); }}>
                {t("demo.workbench.more")}
              </Btn>
            </div> : null}
          </div>}
        detail={current ? <ReviewDetail key={current.id} item={current} status={status(current.id)}
          answer={answer(current.id)} onReview={review}
          onAnswer={value => setAnswers(previous => ({ ...previous, [`${locale}:${current.id}`]: value }))}
        /> : null} />
    </div>
  </Block><ChatQueue /></>;
}

function ChatQueue() {
  const { t, locale } = useI18n();
  const [selected, select] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [replies, setReplies] = useState<Record<string, string[]>>({});
  const [noticeHidden, setNoticeHidden] = useState<Record<string, boolean>>({});
  const current = ENTRIES.find(item => item.id === selected);
  const key = `${locale}:${selected}`;
  const messages = replies[key] ?? [];
  const draft = drafts[key] ?? "";
  const send = () => {
    if (!draft.trim()) return;
    setReplies(previous => ({ ...previous, [key]: [...(previous[key] ?? []), draft.trim()] }));
    setDrafts(previous => ({ ...previous, [key]: "" }));
  };
  return <Block title={t("demo.workbench.chat.title")}>
    <div className="h-[560px]">
      <Workbench selected={selected} order={ENTRIES.map(item => item.id)} onBack={() => select(null)}
        listHead={<div className="trm-workbench-heading"><h3>{t("demo.workbench.chat.queue")}</h3></div>}
        empty={<Empty icon="chat" title={t("demo.workbench.chat.choose")} />}
        list={<div className="trm-workbench-rows">
          {ENTRIES.map(item => <WorkbenchItem key={item.id} title={t(`demo.workbench.chat.${item.id}`)}
            avatar={<Icon name="chat" size={24} />} preview={t(`demo.workbench.${item.id}.question`)}
            selected={selected === item.id} onClick={() => select(item.id)} />)}
        </div>}
        detail={current ? <WorkbenchDetail title={t(`demo.workbench.chat.${current.id}`)}
          sub={[t("demo.workbench.chat.platform"),
            t(messages.length ? "demo.workbench.chat.replied" : "demo.workbench.chat.waiting")]}
          actions={<Btn onClick={() => setNoticeHidden(previous => ({ ...previous, [key]: !previous[key] }))}>
            {t(noticeHidden[key] ? "demo.workbench.chat.showNotice" : "demo.workbench.chat.hideNotice")}
          </Btn>}
          notice={!noticeHidden[key] ? <div className="rounded-[var(--rs)] bg-[var(--group)] p-3 text-[13px]">
            {t("demo.workbench.chat.notice")}
          </div> : null}
          footMode="pinned" foot={<ChatComposer value={draft} placeholder={t("demo.workbench.chat.placeholder")}
            sendLabel={t("demo.workbench.chat.send")} onSend={send}
            onChange={value => setDrafts(previous => ({ ...previous, [key]: value }))} />}>
          <div key="incoming" className="w-fit max-w-[70%] rounded-[var(--r)] bg-[var(--group)] p-3 text-[13px]">
            {t(`demo.workbench.${current.id}.question`)}
          </div>
          <div key="replies" role="log" aria-label={t("demo.workbench.chat.reply")}>
            <FlowList items={messages.map((message, i) => ({ id: String(i), message }))}
              keyOf={message => message.id} itemClassName="pb-3" render={({ message }) => (
                <div className="ml-auto w-fit max-w-[70%] whitespace-pre-wrap rounded-[var(--r)]
                  bg-[var(--accent-soft)] p-3 text-[13px]">{message}</div>
              )} />
          </div>
        </WorkbenchDetail> : null} />
    </div>
  </Block>;
}
