import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  PagePad,
  PageHead,
  Block,
  Group,
  Btn,
  ListItem,
  ActivityRow,
  Mark,
  Tabs,
  Panes,
  Pane,
  Morph,
  FlowList,
  Filters,
  Roll,
  SegmentControl,
  Modal,
  Drawer,
  Nudge,
  StepBar,
  Ring,
  stagger,
  useI18n,
  type Art,
} from "../trm";
import { MOTION_TERMS } from "./motionTerms";

const CURVES = [
  { token: "--ease-nav", noteKey: "demo.motion.easeNav" },
  { token: "--spring", noteKey: "demo.motion.spring" },
  { token: "--ease", noteKey: "demo.motion.ease" },
  { token: "--ease-soft", noteKey: "demo.motion.easeSoft" },
  { token: "--spring-settle", noteKey: "demo.motion.springSettle" },
  { token: "--spring-gentle", noteKey: "demo.motion.springGentle" },
  { token: "--spring-bouncy", noteKey: "demo.motion.springBouncy" },
] as const;

/** 读一条曲线令牌的实际值；取不到时退回线性，演示照样能放。 */
function curveOf(token: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || "linear";
}

/** 把一条曲线算成 0 到 1 之间的若干个点，画曲线图用。支持 cubic-bezier 与 linear(…)。 */
function sample(value: string, n = 48): number[] {
  const bez = /cubic-bezier\(([^)]+)\)/.exec(value);
  if (bez) {
    const [x1, y1, x2, y2] = bez[1].split(",").map(Number);
    const at = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
    return Array.from({ length: n + 1 }, (_, i) => {
      const x = i / n;
      let lo = 0;
      let hi = 1;
      for (let k = 0; k < 24; k++) {
        const mid = (lo + hi) / 2;
        if (at(mid, x1, x2) < x) lo = mid;
        else hi = mid;
      }
      return at((lo + hi) / 2, y1, y2);
    });
  }
  const lin = /linear\(([^)]+)\)/.exec(value);
  if (lin) return lin[1].split(",").map((v) => parseFloat(v));
  return Array.from({ length: n + 1 }, (_, i) => i / n);
}

const SWAP_TABS = ["a", "b", "c"] as const;
const SWAP_KEYS = { a: "demo.inter.tab.a", b: "demo.inter.tab.b", c: "demo.inter.tab.c" } as const;
const STEP_KEYS = ["demo.motion.step1", "demo.motion.step2", "demo.motion.step3", "demo.motion.step4", "demo.motion.step5"] as const;
const WINDOWS = [
  { id: "w1", art: 1 as Art },
  { id: "w2", art: 3 as Art },
  { id: "w3", art: 5 as Art },
  { id: "w4", art: 2 as Art },
];

/** 每个名字下面的示范。 */
const TERM_DEMOS: Record<string, () => ReactNode> = {
  push: PushDemo,
  stretch: StretchDemo,
  flow: FlowDemo,
  roll: RollDemo,
  curtain: CurtainDemo,
  collapse: CollapseDemo,
  glass: GlassDemo,
  flip: FlightDemo,
  stagger: RiseDemo,
};

/**
 * 动效：七条曲线逐条可放；每个动效的名字、说明与能操作的示范；浮层与持续状态的实物预览。
 */
export function MotionPage() {
  const { t, locale } = useI18n();
  const [fresh, setFresh] = useState(true);
  return (
    <PagePad>
      <PageHead title={t("nav.motion")} sub={t("demo.motion.sub")} />
      <Curves />

      {MOTION_TERMS.map((term) => {
        const Demo = TERM_DEMOS[term.id];
        return (
          <Block key={term.id} title={term.name[locale]} note={term.code}>
            <p className="m-0 mb-3 text-[12.5px] text-[var(--help)] leading-relaxed">{term.desc[locale]}</p>
            {Demo ? <Demo /> : null}
          </Block>
        );
      })}

      <LayerDemo />
      <LiveDemo />

      <Block title={t("demo.motion.flow")}>
        <div className="max-w-[260px]">
          <ActivityRow
            collapsed={false}
            label={t("demo.motion.flowLabel")}
            sub={t("demo.motion.flowSub")}
            icon={<Mark art={1} text="" glyph="image" size={20} plain />}
            status={t(fresh ? "demo.motion.done" : "demo.motion.seen")}
            fresh={fresh}
            onClick={() => setFresh((v) => !v)}
          />
        </div>
      </Block>

      <Block title={t("demo.motion.reduce")}>
        <Group>
          <div className="py-4 flex items-center gap-4">
            {/* 不确定进度条：不知道要多久，只表示「在动」。 */}
            <div className="relative flex-1 h-1 rounded-full overflow-hidden bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]">
              <span className="trm-bar-indeterminate absolute inset-y-0 left-0 w-1/4 rounded-full bg-[var(--accent)]" />
            </div>
            <span aria-hidden className="btn-dots text-[var(--ink-muted)]" />
          </div>
        </Group>
      </Block>
    </PagePad>
  );
}

/**
 * 七条曲线：每一行是令牌名、实际取值、用途、曲线图和一条轨道。
 * 点一行只放这一条；「全部播放」让七条同时跑同样的距离，谁起步快、谁冲过头、谁收尾长一眼看出来。
 */
function Curves() {
  const { t } = useI18n();
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const [values, setValues] = useState<string[]>([]);
  useLayoutEffect(() => setValues(CURVES.map((c) => curveOf(c.token))), []);
  const play = (only?: number) => {
    dots.current.forEach((el, i) => {
      if (!el || (only !== undefined && only !== i)) return;
      const track = el.parentElement?.clientWidth ?? 0;
      el.animate([{ transform: "translateX(0)" }, { transform: `translateX(${track - 14}px)` }], { duration: 900, easing: curveOf(CURVES[i].token), fill: "both" });
    });
  };
  return (
    <Block title={t("demo.motion.curves")} action={<Btn primary onClick={() => play()}>{t("demo.motion.playAll")}</Btn>}>
      <Group>
        {CURVES.map((c, i) => {
          const v = values[i] ?? "";
          const pts = sample(v);
          const lo = Math.min(0, ...pts);
          const hi = Math.max(1, ...pts);
          const path = pts.map((y, k) => `${k ? "L" : "M"}${((k / (pts.length - 1)) * 64).toFixed(1)},${(40 - ((y - lo) / (hi - lo)) * 36).toFixed(1)}`).join(" ");
          return (
            <button key={c.token} type="button" onClick={() => play(i)} className="w-full py-3.5 grid grid-cols-[minmax(0,1fr)_72px_minmax(160px,0.8fr)] items-center gap-5 border-0 bg-transparent cursor-pointer text-left text-[var(--ink)] max-[760px]:grid-cols-[minmax(0,1fr)_72px]">
              <span className="min-w-0">
                <span className="block text-[13px] font-mono">{c.token}</span>
                <span className="block mt-0.5 text-[11px] text-[var(--meta)] font-mono truncate" title={v}>
                  {v.length > 44 ? `${v.slice(0, 42)}…` : v}
                </span>
                <span className="block mt-1 text-[12.5px] text-[var(--help)] leading-relaxed">{t(c.noteKey)}</span>
              </span>
              <svg width="72" height="44" viewBox="-4 0 72 44" aria-hidden className="text-[var(--accent)]">
                <path d="M0,40 L64,4" stroke="var(--hairline)" strokeWidth="1" fill="none" />
                <path d={path} stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              </svg>
              <span className="relative h-[14px] rounded-full bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] max-[760px]:col-span-2">
                <span
                  ref={(el) => {
                    dots.current[i] = el;
                  }}
                  className="absolute left-0 top-0 w-[14px] h-[14px] rounded-full bg-[var(--accent)]"
                />
              </span>
            </button>
          );
        })}
      </Group>
      <p className="m-0 mt-2 text-[12px] text-[var(--meta)]">{t("demo.motion.curvesHint")}</p>
    </Block>
  );
}

/** 推移：换分栏时新旧内容沿同一方向推过，外层同时伸缩。 */
function PushDemo() {
  const { t } = useI18n();
  const [tab, setTab] = useState<(typeof SWAP_TABS)[number]>("a");
  return (
    <>
      <Tabs value={tab} onChange={setTab} options={SWAP_TABS.map((id) => ({ id, label: t(SWAP_KEYS[id]) }))} />
      <Panes value={tab} order={SWAP_TABS} className="mt-3">
        {SWAP_TABS.map((id, k) => (
          <Pane key={id} id={id}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
              {Array.from({ length: 2 + k * 2 }, (_, i) => (
                <div key={i} className="h-16 rounded-[var(--r)]" style={{ background: `linear-gradient(145deg, var(--art-${((i + k) % 6) + 1}), var(--art-${((i + k + 1) % 6) + 1}))` }} />
              ))}
            </div>
          </Pane>
        ))}
      </Panes>
    </>
  );
}

/** 伸缩：底板不动，加减几行时高度平滑变化。 */
function StretchDemo() {
  const { t } = useI18n();
  const [n, setN] = useState(2);
  return (
    <>
      <div className="flex gap-2">
        <Btn onClick={() => setN((v) => Math.min(6, v + 1))}>{t("demo.motion.addRow")}</Btn>
        <Btn onClick={() => setN((v) => Math.max(1, v - 1))}>{t("demo.motion.removeRow")}</Btn>
      </div>
      <Morph className="mt-3 bg-[var(--group)] rounded-[var(--r)]">
        <div className="px-4 py-2">
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="py-2 text-[13px]">
              {t("demo.rules.item", { n: i + 1 })}
            </div>
          ))}
        </div>
      </Morph>
    </>
  );
}

const FLOW_ITEMS = [
  { id: "a", n: 1, tag: "ok", likes: 12 },
  { id: "b", n: 2, tag: "issue", likes: 3 },
  { id: "c", n: 3, tag: "ok", likes: 7 },
  { id: "d", n: 4, tag: "issue", likes: 9 },
  { id: "e", n: 5, tag: "ok", likes: 1 },
];

/** 流动列表：筛选与排序时条目滑动、收拢、撑开。 */
function FlowDemo() {
  const { t } = useI18n();
  const [f, setF] = useState<"all" | "ok" | "issue">("all");
  const [sort, setSort] = useState<"n" | "hot">("n");
  const items = FLOW_ITEMS.filter((x) => f === "all" || x.tag === f).sort((a, b) => (sort === "hot" ? b.likes - a.likes : a.n - b.n));
  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        <Filters value={f} onChange={setF} options={[{ id: "all", label: t("ui.comments.all") }, { id: "ok", label: t("demo.inter.ok") }, { id: "issue", label: t("demo.inter.issue") }]} />
        <span className="ml-auto">
          <Filters value={sort} onChange={setSort} options={[{ id: "n", label: t("demo.motion.byOrder") }, { id: "hot", label: t("ui.comments.hot") }]} />
        </span>
      </div>
      <div className="mt-3 bg-[var(--group)] rounded-[var(--r)] px-4 py-1">
        <FlowList
          items={items}
          keyOf={(x) => x.id}
          render={(x) => (
            <div className="flex items-center gap-3 py-2.5 text-[13px]">
              <span className="w-7 h-7 rounded-[8px]" style={{ background: `var(--art-${x.n})` }} />
              {t("demo.rules.item", { n: x.n })}
              <span className="ml-auto text-[12px] text-[var(--meta)] tabular-nums">{t("demo.motion.likes", { n: x.likes })}</span>
            </div>
          )}
        />
      </div>
    </>
  );
}

const ROLL_KEYS = ["demo.more.e1", "demo.more.e2", "demo.more.e3", "demo.more.e4", "demo.more.e5"] as const;

/** 滚字：同一处的名称换了。 */
function RollDemo() {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  return (
    <div className="flex items-center gap-4">
      <Btn onClick={() => setI((v) => (v + 1) % ROLL_KEYS.length)}>{t("demo.motion.next")}</Btn>
      <div className="text-[15px] font-semibold min-w-[120px]">
        <Roll value={t(ROLL_KEYS[i])} />
      </div>
    </div>
  );
}

/** 拉幕：第一次出现时从上往下展开，关掉时收回。 */
function CurtainDemo() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  if (open && !shown) setShown(true);
  useEffect(() => {
    if (open) return;
    const id = window.setTimeout(() => setShown(false), 420);
    return () => window.clearTimeout(id);
  }, [open]);
  return (
    <>
      <Btn on={open} onClick={() => setOpen((v) => !v)}>
        {t(open ? "demo.motion.close" : "demo.motion.open")}
      </Btn>
      <div className="mt-3 h-[120px]">
        {shown ? (
          <div className={`${open ? "curtain-in" : "curtain-out"} h-full rounded-[var(--r)] bg-[var(--group)] p-4`}>
            <div className="text-[15px] font-semibold">{t("demo.more.e2")}</div>
            <p className="m-0 mt-2 text-[12.5px] text-[var(--help)]">{t("demo.more.editNote")}</p>
          </div>
        ) : null}
      </div>
    </>
  );
}

/** 折叠：展开与收起都有高度过渡。 */
function CollapseDemo() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <Group>
      <ListItem
        title={t("demo.list.item1")}
        desc={t("demo.list.item1Desc")}
        expanded={open}
        onClick={() => setOpen((v) => !v)}
        rightInteractive={false}
        right={<span className="text-[13.5px] text-[var(--ink-muted)]">{open ? "−" : "+"}</span>}
      >
        {t("demo.list.item1Body")}
      </ListItem>
    </Group>
  );
}

/** 液态玻璃滑块：可以点，也可以按住拖、用力甩。 */
function GlassDemo() {
  const { t } = useI18n();
  const [v, setV] = useState<"a" | "b" | "c" | "d">("a");
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <SegmentControl
        value={v}
        onChange={setV}
        options={[
          { id: "a", label: t("demo.seg.a") },
          { id: "b", label: t("demo.seg.b") },
          { id: "c", label: t("demo.seg.c") },
          { id: "d", label: t("demo.seg.d") },
        ]}
      />
      <span className="text-[12px] text-[var(--meta)]">{t("demo.motion.glassHint")}</span>
    </div>
  );
}

/** 依次浮现：列表与网格第一次出现时用这一下。 */
function RiseDemo() {
  const { t } = useI18n();
  const [round, setRound] = useState(0);
  return (
    <>
      <Btn onClick={() => setRound((r) => r + 1)}>{t("demo.motion.replay")}</Btn>
      <div key={round} className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-3">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="rise aspect-square rounded-[var(--r)] bg-[var(--group)] shadow-[inset_0_0_0_1px_var(--hairline)] grid place-items-center text-[12px] text-[var(--meta)] tabular-nums" style={stagger(i)}>
            {i + 1}
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * 换位飞行：点左侧一扇小窗，它从原位飞到中间放大，中间那扇缩回它空出的位置。
 * 先量好起点，换完位置再量终点，用变换把新位置倒推回起点再放开（FLIP）。
 */
function FlightDemo() {
  const { t } = useI18n();
  const [order, setOrder] = useState(WINDOWS.map((w) => w.id));
  const box = useRef<HTMLDivElement>(null);
  const before = useRef(new Map<string, DOMRect>());
  const pick = (id: string) => {
    box.current?.querySelectorAll<HTMLElement>("[data-win]").forEach((el) => before.current.set(el.dataset.win ?? "", el.getBoundingClientRect()));
    setOrder((o) => [id, ...o.filter((x) => x !== id)]);
  };
  useLayoutEffect(() => {
    const easing = curveOf("--ease-nav");
    box.current?.querySelectorAll<HTMLElement>("[data-win]").forEach((el) => {
      const from = before.current.get(el.dataset.win ?? "");
      if (!from) return;
      const to = el.getBoundingClientRect();
      if (!to.width || (from.left === to.left && from.top === to.top && from.width === to.width)) return;
      el.animate(
        [
          { transformOrigin: "top left", transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})` },
          { transformOrigin: "top left", transform: "none" },
        ],
        { duration: 560, easing },
      );
    });
    before.current.clear();
  }, [order]);
  const art = (id: string) => WINDOWS.find((w) => w.id === id)?.art ?? 1;
  const tile = (id: string) => ({ background: `linear-gradient(145deg, var(--art-${art(id)}), var(--art-${(art(id) % 6) + 1}))` });
  return (
    <div ref={box} className="flex gap-4 h-[220px]">
      <div className="w-[96px] flex-none flex flex-col gap-3 justify-center">
        {order.slice(1).map((id) => (
          <button key={id} type="button" data-win={id} onClick={() => pick(id)} aria-label={t("demo.motion.flightPick")} className="h-[56px] rounded-[8px] border-0 cursor-pointer shadow-[var(--glass)] transition-transform duration-300 hover:scale-[1.05]" style={tile(id)} />
        ))}
      </div>
      <div key={order[0]} data-win={order[0]} className="flex-1 rounded-[14px] shadow-[var(--pop-shadow)]" style={tile(order[0])} />
    </div>
  );
}

/** 浮层：弹窗、抽屉、底部提示，打开与收起各放一段，收起放完才卸下。 */
function LayerDemo() {
  const { t } = useI18n();
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [nudge, setNudge] = useState(false);
  return (
    <Block title={t("demo.motion.layers")}>
      <div className="flex gap-2 flex-wrap">
        <Btn onClick={() => setModal(true)}>{t("demo.motion.openModal")}</Btn>
        <Btn onClick={() => setDrawer(true)}>{t("demo.motion.openDrawer")}</Btn>
        <Btn on={nudge} onClick={() => setNudge((v) => !v)}>
          {t("demo.motion.toggleNudge")}
        </Btn>
      </div>
      <div className="mt-3 max-w-[560px]">
        <Nudge open={nudge} title={t("demo.motion.nudgeTitle")} actions={<Btn onClick={() => setNudge(false)}>{t("demo.motion.close")}</Btn>}>
          {t("demo.motion.nudgeBody")}
        </Nudge>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} label={t("demo.motion.openModal")} width={420}>
        <div className="p-6">
          <div className="text-[16px] font-semibold">{t("demo.motion.openModal")}</div>
          <p className="mt-2 mb-5 text-[13px] text-[var(--ink-muted)] leading-relaxed">{t("demo.motion.modalBody")}</p>
          <div className="flex justify-end">
            <Btn primary onClick={() => setModal(false)}>
              {t("demo.motion.close")}
            </Btn>
          </div>
        </div>
      </Modal>
      <Drawer open={drawer} onClose={() => setDrawer(false)} label={t("demo.motion.openDrawer")}>
        <div className="p-6">
          <div className="text-[16px] font-semibold">{t("demo.motion.openDrawer")}</div>
          <p className="mt-2 mb-5 text-[13px] text-[var(--ink-muted)] leading-relaxed">{t("demo.motion.drawerBody")}</p>
          <Btn onClick={() => setDrawer(false)}>{t("demo.motion.close")}</Btn>
        </div>
      </Drawer>
    </Block>
  );
}

/** 持续状态：分步进度自己往前走，正在播放的小竖条，环形图从零长到比例。 */
function LiveDemo() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [round, setRound] = useState(0);
  useEffect(() => {
    if (step >= STEP_KEYS.length - 1) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), 1400);
    return () => window.clearTimeout(id);
  }, [step, round]);
  const replay = () => {
    setStep(0);
    setRound((r) => r + 1);
  };
  return (
    <Block title={t("demo.motion.live")} action={<Btn onClick={replay}>{t("demo.motion.replay")}</Btn>}>
      <Group>
        <div className="py-4 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <StepBar index={step} count={STEP_KEYS.length} label={t(STEP_KEYS[step])} />
            <span className="text-[12.5px] text-[var(--ink-muted)]">
              <Roll value={t("demo.motion.stepOf", { n: step + 1, total: STEP_KEYS.length, label: t(STEP_KEYS[step]) })} />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex items-end gap-[2px] h-3 w-3">
              {[0, 1, 2].map((i) => (
                <span key={i} className="eq-bar w-[2px] rounded-full bg-[var(--accent)]" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </span>
            <span className="text-[13px]">{t("demo.motion.playing")}</span>
          </div>
          <div key={round}>
            <Ring
              size={110}
              center="72%"
              segments={[
                { id: "a", label: t("demo.motion.ringA"), value: 5, color: "var(--accent)" },
                { id: "b", label: t("demo.motion.ringB"), value: 3, color: "color-mix(in srgb, var(--accent) 50%, var(--surface))" },
                { id: "c", label: t("demo.motion.ringC"), value: 2, color: "color-mix(in srgb, var(--ink) 18%, var(--surface))" },
              ]}
            />
          </div>
        </div>
      </Group>
    </Block>
  );
}
