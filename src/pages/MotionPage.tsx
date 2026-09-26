import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  Swap,
  Modal,
  Drawer,
  Nudge,
  StepBar,
  Ring,
  stagger,
  useI18n,
  type Art,
} from "../trm";

const CURVES = [
  { token: "--ease-nav", value: "cubic-bezier(0.32, 0.72, 0, 1)", noteKey: "demo.motion.easeNav" },
  { token: "--spring", value: "cubic-bezier(0.34, 1.42, 0.64, 1)", noteKey: "demo.motion.spring" },
  { token: "--ease", value: "cubic-bezier(0.22, 1, 0.36, 1)", noteKey: "demo.motion.ease" },
  { token: "--ease-soft", value: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", noteKey: "demo.motion.easeSoft" },
  { token: "--spring-settle", value: "linear(…)", noteKey: "demo.motion.springSettle" },
  { token: "--spring-gentle", value: "linear(…)", noteKey: "demo.motion.springGentle" },
  { token: "--spring-bouncy", value: "linear(…)", noteKey: "demo.motion.springBouncy" },
] as const;

/** 读一条曲线令牌的实际值；取不到时退回线性，演示照样能放。 */
function curveOf(token: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || "linear";
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

/**
 * 动效：曲线逐条对比，以及每一种切换、浮层、持续状态的实物预览。每一块都能重放。
 */
export function MotionPage() {
  const { t } = useI18n();
  const [fresh, setFresh] = useState(true);
  return (
    <PagePad>
      <PageHead title={t("nav.motion")} sub={t("demo.motion.sub")} />
      <Curves />
      <SwapDemo />
      <RiseDemo />
      <FlightDemo />
      <LayerDemo />
      <LiveDemo />

      <Block title={t("demo.motion.curves")}>
        <Group>
          {CURVES.map((c) => (
            <ListItem key={c.token} meta={c.value} title={c.token} desc={t(c.noteKey)} />
          ))}
        </Group>
      </Block>

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

/** 七条曲线同时跑一段同样的距离：谁起步快、谁冲过头、谁收尾长，一眼看出来。 */
function Curves() {
  const { t } = useI18n();
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const play = () => {
    dots.current.forEach((el, i) => {
      if (!el) return;
      const track = el.parentElement?.clientWidth ?? 0;
      el.animate([{ transform: "translateX(0)" }, { transform: `translateX(${track - 14}px)` }], { duration: 900, easing: curveOf(CURVES[i].token), fill: "both" });
    });
  };
  return (
    <Block title={t("demo.motion.playground")} action={<Btn primary onClick={play}>{t("demo.motion.play")}</Btn>}>
      <Group>
        <div className="py-3 flex flex-col gap-2.5">
          {CURVES.map((c, i) => (
            <div key={c.token} className="flex items-center gap-4">
              <span className="w-[120px] flex-none text-[12px] text-[var(--ink-muted)] font-mono">{c.token}</span>
              <div className="relative flex-1 h-[14px] rounded-full bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]">
                <span ref={(el) => { dots.current[i] = el; }} className="absolute left-0 top-0 w-[14px] h-[14px] rounded-full bg-[var(--accent)]" />
              </div>
            </div>
          ))}
        </div>
      </Group>
    </Block>
  );
}

/** 分栏切换：旧内容淡出、朝来处让一小步，新内容从去向那一侧浮上来。 */
function SwapDemo() {
  const { t } = useI18n();
  const [tab, setTab] = useState<(typeof SWAP_TABS)[number]>("a");
  const n = SWAP_TABS.indexOf(tab) + 2;
  return (
    <Block title={t("demo.motion.swap")}>
      <Tabs value={tab} onChange={setTab} options={SWAP_TABS.map((id) => ({ id, label: t(SWAP_KEYS[id]) }))} />
      <Swap k={tab} className="mt-3">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="rise h-16 rounded-[var(--r)]" style={{ ...stagger(i), background: `linear-gradient(145deg, var(--art-${((i + n) % 6) + 1}), var(--art-${((i + n + 1) % 6) + 1}))` }} />
          ))}
        </div>
      </Swap>
    </Block>
  );
}

/** 条目依次浮现：列表与网格刚出现、换了一批时都用这一下。 */
function RiseDemo() {
  const { t } = useI18n();
  const [round, setRound] = useState(0);
  return (
    <Block title={t("demo.motion.rise")} action={<Btn onClick={() => setRound((r) => r + 1)}>{t("demo.motion.replay")}</Btn>}>
      <div key={round} className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-3">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="rise aspect-square rounded-[var(--r)] bg-[var(--group)] shadow-[inset_0_0_0_1px_var(--hairline)] grid place-items-center text-[12px] text-[var(--meta)] tabular-nums" style={stagger(i)}>
            {i + 1}
          </div>
        ))}
      </div>
    </Block>
  );
}

/**
 * 换位飞行：点左侧一扇小窗，它从原位飞到中间放大，中间那扇缩回它空出的位置。
 * 先量好起点，换完位置再量终点，用变换把新位置「倒推」回起点再放开（FLIP）。
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
    const easing = curveOf("--spring-settle");
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
        { duration: 520, easing },
      );
    });
    before.current.clear();
  }, [order]);
  const art = (id: string) => WINDOWS.find((w) => w.id === id)?.art ?? 1;
  const tile = (id: string) => ({ background: `linear-gradient(145deg, var(--art-${art(id)}), var(--art-${(art(id) % 6) + 1}))` });
  return (
    <Block title={t("demo.motion.flight")} note={t("demo.motion.flightSub")}>
      <div ref={box} className="flex gap-4 h-[220px]">
        <div className="w-[96px] flex-none flex flex-col gap-3 justify-center">
          {order.slice(1).map((id) => (
            <button key={id} type="button" data-win={id} onClick={() => pick(id)} aria-label={t("demo.motion.flightPick")} className="h-[56px] rounded-[8px] border-0 cursor-pointer shadow-[var(--glass)] transition-transform duration-300 hover:scale-[1.05]" style={tile(id)} />
          ))}
        </div>
        <div key={order[0]} data-win={order[0]} className="flex-1 rounded-[14px] shadow-[var(--pop-shadow)]" style={tile(order[0])} />
      </div>
    </Block>
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
        <Btn on={nudge} onClick={() => setNudge((v) => !v)}>{t("demo.motion.toggleNudge")}</Btn>
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
            <Btn primary onClick={() => setModal(false)}>{t("demo.motion.close")}</Btn>
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
            <span className="text-[12.5px] text-[var(--ink-muted)]">{t("demo.motion.stepOf", { n: step + 1, total: STEP_KEYS.length, label: t(STEP_KEYS[step]) })}</span>
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
