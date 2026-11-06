import { useState } from "react";
import {
  Block, Btn, Collapse, Empty, Filters, FlowList, Roll, Tag, TextArea,
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
    sub={<Tag>{t(`demo.workbench.${status}`)}</Tag>}
    actions={pending ? <Btn onClick={() => setEditing(value => !value)}>
      {t(editing ? "demo.workbench.done" : "demo.workbench.edit")}
    </Btn> : undefined}
    foot={pending ? <>
      <Btn primary disabled={!answer.trim()} onClick={() => onReview("approved")}>
        {t("demo.workbench.approve")}
      </Btn>
      <Btn onClick={() => onReview("rejected")}>{t("demo.workbench.reject")}</Btn>
    </> : <Tag tone={status === "approved" ? "ok" : "muted"}>{t(`demo.workbench.${status}`)}</Tag>}>
    <div className="flex flex-col gap-4 text-[13px]">
      <div>
        <h4 className="m-0 font-medium">{t("demo.workbench.answer")}</h4>
        <p className="mt-2 whitespace-pre-wrap text-[var(--ink-muted)]">{answer}</p>
      </div>
      <Collapse open={editing && pending}>
        <TextArea aria-label={t("demo.workbench.answer")} value={answer} onChange={onAnswer} rows={5} />
      </Collapse>
      <div className="text-[var(--ink-muted)]">{t("demo.workbench.hits", { n: item.hits })}</div>
      <div>
        <h4 className="m-0 font-medium">{t("demo.workbench.sources")}</h4>
        <p className="mt-2 text-[var(--ink-muted)]">{t("demo.workbench.source")}</p>
      </div>
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

  return <Block title={t("demo.workbench.title")}>
    <div className="h-[480px]">
      <Workbench selected={selected} order={ENTRIES.map(item => item.id)} onBack={() => setSelected(null)}
        empty={<Empty icon="chat" title={t("demo.workbench.choose")} />}
        list={<>
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
          <div className="trm-workbench-rows">
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
          </div>
        </>}
        detail={current ? <ReviewDetail key={current.id} item={current} status={status(current.id)}
          answer={answer(current.id)} onReview={review}
          onAnswer={value => setAnswers(previous => ({ ...previous, [`${locale}:${current.id}`]: value }))}
        /> : null} />
    </div>
  </Block>;
}
