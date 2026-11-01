import { useRef, useState, type ReactNode } from "react";
import {
  Btn,
  Filters,
  FlowList,
  HelpMark,
  HoverStyleProvider,
  Icon,
  IconBtn,
  MenuBtn,
  Pager,
  Popover,
  Swap,
  anchorOf,
  hoverInk,
  stagger,
  useDir,
  useI18n,
  type Anchor,
  type HoverStyle,
  type IconName,
} from "../trm";

/**
 * 交互约定的实物示范：每条约定左边是错误的做法，右边是正确的做法，都能真的操作。
 * 错误示范是故意照错的写法做的，只用在这一页。
 */
export const RULE_DEMOS: Record<string, () => ReactNode> = {
  iconBtn: IconBtnDemo,
  anchor: AnchorDemo,
  hoverStyle: HoverStyleDemo,
  keepPanel: KeepPanelDemo,
  paired: PairedDemo,
  arrow: ArrowDemo,
  paging: PagingDemo,
};

/** 一左一右两格：默认左边错误示范、右边正确示范；两边都可用时由 labels 换成各自的名字。 */
function Pair({ wrong, right, labels }: { wrong: ReactNode; right: ReactNode; labels?: [string, string] }) {
  const { t } = useI18n();
  return (
    <div className="bg-[var(--group)] rounded-[var(--r)] px-5 py-4 mb-3 grid gap-x-6 gap-y-5 min-[900px]:grid-cols-2">
      <div className="min-w-0">
        <div className="text-[11.5px] text-[var(--meta)] mb-2.5">{labels?.[0] ?? t("demo.text.wrong")}</div>
        {wrong}
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] text-[var(--meta)] mb-2.5">{labels?.[1] ?? t("demo.text.right")}</div>
        {right}
      </div>
    </div>
  );
}

const ICONS: { icon: IconName; key: string }[] = [
  { icon: "edit", key: "demo.patterns.rename" },
  { icon: "external", key: "demo.patterns.open" },
  { icon: "trash", key: "demo.patterns.delete" },
];

function IconBtnDemo() {
  const { t } = useI18n();
  return (
    <Pair
      wrong={
        <div className="flex items-center gap-1">
          {ICONS.map((x) => (
            <button key={x.icon} type="button" aria-label={t(x.key)} title={t(x.key)} className="w-8 h-8 grid place-items-center rounded-full border-0 bg-transparent cursor-pointer text-[var(--ink-muted)] hover:bg-[color-mix(in_srgb,var(--ink)_9%,transparent)] hover:scale-110">
              <Icon name={x.icon} size={18} />
            </button>
          ))}
        </div>
      }
      right={
        <div className="flex items-center gap-1">
          {ICONS.map((x) => (
            <IconBtn key={x.icon} icon={x.icon} label={t(x.key)} />
          ))}
        </div>
      }
    />
  );
}

function AnchorDemo() {
  const { t } = useI18n();
  const [open, setOpen] = useState<{ which: "wrong" | "right"; anchor: Anchor; trigger: Element } | null>(null);
  const row = useRef<HTMLDivElement>(null);
  const items = ICONS.map((x) => (
    <div key={x.icon} className="flex items-center gap-2.5 h-8 px-2.5 text-[13px] text-[var(--ink)]">
      <Icon name={x.icon} size={15} className="text-[var(--ink-muted)]" />
      {t(x.key)}
    </div>
  ));
  const toggle = (which: "wrong" | "right", el: HTMLElement) => {
    if (open?.which === which) return setOpen(null);
    const anchor = which === "wrong" && row.current ? { ...anchorOf(row.current), x: anchorOf(row.current).x + anchorOf(row.current).w - 180, w: 180 } : anchorOf(el);
    setOpen({ which, anchor, trigger: el });
  };
  return (
    <>
      <Pair
        wrong={
          <div ref={row} className="flex items-center rounded-[var(--rs)] shadow-[inset_0_0_0_1px_var(--hairline)] px-3 h-10">
            <Btn onClick={(e) => toggle("wrong", e.currentTarget)}>{t("demo.patterns.menuBtn")}</Btn>
          </div>
        }
        right={
          <div className="flex items-center rounded-[var(--rs)] shadow-[inset_0_0_0_1px_var(--hairline)] px-3 h-10">
            <Btn onClick={(e) => toggle("right", e.currentTarget)}>{t("demo.patterns.menuBtn")}</Btn>
          </div>
        }
      />
      {open ? (
        <Popover anchor={open.anchor} trigger={open.trigger} onClose={() => setOpen(null)}>
          {items}
        </Popover>
      ) : null}
    </>
  );
}

const VERDICTS = ["all", "ok", "issue"] as const;

function HoverStyleDemo() {
  const { t } = useI18n();
  return <Pair labels={[t("demo.rules.soft"), t("demo.rules.plain")]} wrong={<StyleSample look="soft" />} right={<StyleSample look="plain" />} />;
}

/** 同一组控件分别按两种样式画出来。这一条两边都对，左右只是两种可选的写法。 */
function StyleSample({ look }: { look: HoverStyle }) {
  const { t } = useI18n();
  const [v, setV] = useState<(typeof VERDICTS)[number]>("all");
  const [liked, setLiked] = useState(false);
  const act = `h-7 px-2 inline-flex items-center gap-1 rounded-[var(--rs)] border-0 bg-transparent cursor-pointer text-[12px] text-[var(--meta)] transition-colors ${hoverInk(look)}`;
  return (
    <HoverStyleProvider value={look}>
      <Filters value={v} onChange={setV} options={VERDICTS.map((id) => ({ id, label: t(id === "all" ? "ui.comments.all" : id === "ok" ? "demo.inter.ok" : "demo.inter.issue") }))} />
      <div className="mt-2 -ml-2 flex items-center gap-0.5">
        <button type="button" aria-pressed={liked} onClick={() => setLiked(!liked)} className={`${act} ${liked ? "!text-[var(--accent)]" : ""}`}>
          <Icon name="thumbUp" size={13} className={liked ? "pop-like" : ""} />
          {liked ? 1 : t("ui.comments.like")}
        </button>
        <button type="button" className={act}>
          <Icon name="chat" size={13} />
          {t("ui.comments.reply")}
        </button>
      </div>
    </HoverStyleProvider>
  );
}

const SIZES = { x: 4, y: 2, z: 1 } as const;
const SIZE_KEYS = { x: "demo.inter.filter.x", y: "demo.inter.filter.y", z: "demo.inter.filter.z" } as const;

function KeepPanelDemo() {
  return <Pair wrong={<PanelSample keep={false} />} right={<PanelSample keep />} />;
}

/** 换筛选：错误的做法整块换掉再一项项浮现，正确的做法底板不动、条目流动。 */
function PanelSample({ keep }: { keep: boolean }) {
  const { t } = useI18n();
  const [f, setF] = useState<keyof typeof SIZES>("x");
  const items = Array.from({ length: SIZES[f] }, (_, i) => i);
  const row = (i: number) => (
    <div className="flex items-center gap-2.5 py-2 px-1 text-[13px]">
      <span className="w-6 h-6 rounded-[6px]" style={{ background: `var(--art-${i + 1})` }} />
      {t("demo.rules.item", { n: i + 1 })}
    </div>
  );
  return (
    <>
      <Filters value={f} onChange={setF} options={(Object.keys(SIZES) as (keyof typeof SIZES)[]).map((id) => ({ id, label: t(SIZE_KEYS[id]) }))} />
      {keep ? (
        <div className="mt-2 bg-[var(--surface)] rounded-[var(--rs)] px-2 py-1">
          <FlowList items={items} keyOf={(i) => String(i)} render={(i) => row(i)} />
        </div>
      ) : (
        <div key={f} className="mt-2 bg-[var(--surface)] rounded-[var(--rs)] px-2 py-1 fade-in">
          {items.map((i) => (
            <div key={i} className="rise" style={stagger(i)}>
              {row(i)}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function PairedDemo() {
  const { t } = useI18n();
  const [shown, setShown] = useState(false);
  return (
    <Pair
      wrong={
        <span className="relative inline-flex items-center gap-1.5 text-[13px]" onPointerEnter={() => setShown(true)} onPointerLeave={() => setShown(false)}>
          {t("demo.rules.tipLabel")}
          <span className="w-[17px] h-[17px] rounded-full grid place-items-center text-[11px] text-[var(--meta)] shadow-[inset_0_0_0_1px_var(--line)] tooltip-in">?</span>
          {shown ? <span className="absolute left-0 bottom-full mb-2 w-[240px] rounded-[var(--rs)] bg-[var(--surface)] px-3 py-2 text-[13px] shadow-[var(--pop-shadow)] tooltip-in">{t("demo.rules.tipText")}</span> : null}
        </span>
      }
      right={
        <span className="inline-flex items-center gap-1.5 text-[13px]">
          {t("demo.rules.tipLabel")}
          <HelpMark title={t("demo.rules.tipText")} />
        </span>
      }
    />
  );
}

function ArrowDemo() {
  const { t } = useI18n();
  const [open, setOpen] = useState<HTMLElement | null>(null);
  const items = [
    { id: "open", label: t("demo.patterns.open"), icon: "external" as const },
    { id: "rename", label: t("demo.patterns.rename"), icon: "edit" as const },
  ];
  return (
    <>
      <Pair
        wrong={
          <Btn onClick={(e) => setOpen(open ? null : e.currentTarget)}>
            <span className="inline-flex items-center gap-1.5">
              {t("demo.patterns.menuBtn")}
              <Icon name="down" size={14} />
            </span>
          </Btn>
        }
        right={<MenuBtn label={t("demo.patterns.menuBtn")} items={items} />}
      />
      {open ? (
        <Popover anchor={anchorOf(open)} trigger={open} onClose={() => setOpen(null)}>
          {items.map((x) => (
            <div key={x.id} className="flex items-center gap-2.5 h-8 px-2.5 text-[13px]">
              <Icon name={x.icon} size={15} className="text-[var(--ink-muted)]" />
              {x.label}
            </div>
          ))}
        </Popover>
      ) : null}
    </>
  );
}

const PER = 4;
const TOTAL = 22;

function PagingDemo() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const dir = useDir(page);
  const pages = Math.ceil(TOTAL / PER);
  const row = (n: number) => (
    <div key={n} className="flex items-center gap-2.5 py-2 text-[13px]">
      <span className="w-6 h-6 rounded-[6px]" style={{ background: `var(--art-${(n % 6) + 1})` }} />
      {t("demo.rules.item", { n })}
    </div>
  );
  return (
    <Pair
      wrong={
        <div className="relative h-[232px] overflow-hidden">
          {Array.from({ length: TOTAL }, (_, i) => row(i + 1))}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(transparent,var(--group))]" />
        </div>
      }
      right={
        <div>
          <Swap k={String(page)} dir={dir}>
            <div>{Array.from({ length: Math.min(PER, TOTAL - (page - 1) * PER) }, (_, i) => row((page - 1) * PER + i + 1))}</div>
          </Swap>
          <div className="-mt-6">
            <Pager page={page} pages={pages} onChange={setPage} />
          </div>
        </div>
      }
    />
  );
}
