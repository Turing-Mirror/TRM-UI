import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  PagePad,
  PageHead,
  Block,
  Btn,
  Tabs,
  Panes,
  Pane,
  Swap,
  Filters,
  Comments,
  Wizard,
  WizardPill,
  Nudge,
  ErrorNote,
  Ring,
  SidePanel,
  useSidePanel,
  useSnapDrag,
  stagger,
  Icon,
  useI18n,
  type CommentItem,
  type SnapPos,
} from "../trm";

const TABS = ["a", "b", "c"] as const;
const TAB_KEYS = { a: "demo.inter.tab.a", b: "demo.inter.tab.b", c: "demo.inter.tab.c" } as const;
const FILTER_KEYS = { x: "demo.inter.filter.x", y: "demo.inter.filter.y", z: "demo.inter.filter.z" } as const;
const STEP_KEYS = { one: "demo.inter.step.one", two: "demo.inter.step.two", three: "demo.inter.step.three" } as const;

/** 演示用的评论，全部由语言包给出文字。 */
function seed(t: (k: string) => string): CommentItem[] {
  const at = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
  return [
    { id: "1", author: "mika", text: t("demo.inter.c1"), at: at(30), likes: 12, verdict: "ok" },
    { id: "1a", author: "author", text: t("demo.inter.r1"), at: at(28), likes: 3, parent: "1" },
    { id: "1b", author: "yuzu", text: t("demo.inter.r2"), at: at(20), likes: 1, parent: "1" },
    { id: "1c", author: "nagisa", text: t("demo.inter.r3"), at: at(18), likes: 0, parent: "1", replyTo: "yuzu" },
    { id: "2", author: "hoshino", text: t("demo.inter.c2"), at: at(50), likes: 4, verdict: "issue" },
  ];
}

/**
 * 交互：页内交叠切换、评论、分步引导、底部提示、报错、环形图、可拖动的浮动按钮、底部面板。
 * 每一个都能真的操作。
 */
export function InteractionPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<(typeof TABS)[number]>("a");
  const [filter, setFilter] = useState<"x" | "y" | "z">("x");
  const [items, setItems] = useState<CommentItem[]>(() => seed(t));
  const [wizard, setWizard] = useState<{ open: boolean; step: string; pill: boolean }>({ open: false, step: "one", pill: false });
  const [nudge, setNudge] = useState(false);
  const dock = useSidePanel("demo.dock", { def: 160, min: 100, max: 300 });

  const ago = (iso: string) => t("demo.inter.ago", { n: Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 3_600_000)) });

  return (
    <PagePad>
      <PageHead title={t("nav.interaction")} sub={t("demo.inter.sub")} />

      <Block title={t("demo.inter.panes")}>
        <Tabs value={tab} onChange={setTab} options={TABS.map((id) => ({ id, label: t(TAB_KEYS[id]) }))} />
        <Panes value={tab} order={TABS}>
          {TABS.map((id, k) => (
            <Pane key={id} id={id}>
              <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="rise aspect-[4/3] rounded-[var(--r)]" style={{ ...stagger(i), background: `var(--art-${((i + k) % 6) + 1})` }} />
                ))}
              </div>
            </Pane>
          ))}
        </Panes>
        <div className="mt-6">
          <Filters value={filter} onChange={setFilter} options={(["x", "y", "z"] as const).map((id) => ({ id, label: t(FILTER_KEYS[id]) }))} />
          <Swap k={filter} className="mt-3">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
              {Array.from({ length: filter === "x" ? 4 : filter === "y" ? 2 : 1 }, (_, i) => (
                <div key={i} className="rise h-16 rounded-[var(--r)] bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]" style={stagger(i)} />
              ))}
            </div>
          </Swap>
        </div>
      </Block>

      <Block title={t("demo.inter.comments")}>
        <Comments
          items={items}
          me="you"
          owner="author"
          verdicts={[
            { id: "ok", label: t("demo.inter.ok"), tone: "ok" },
            { id: "issue", label: t("demo.inter.issue"), tone: "warn" },
          ]}
          ago={ago}
          onPost={(text, o) => setItems((l) => [...l, { id: String(Date.now()), author: "you", text, at: new Date().toISOString(), likes: 0, mine: true, verdict: o.verdict, parent: o.parent, replyTo: o.replyTo }])}
          onLike={(id) => setItems((l) => l.map((c) => (c.id === id ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) } : c)))}
          onDelete={(id) => setItems((l) => l.filter((c) => c.id !== id && c.parent !== id))}
        />
      </Block>

      <Block title={t("demo.inter.guides")}>
        <div className="flex items-center gap-2 flex-wrap">
          <Btn onClick={() => setWizard((w) => ({ ...w, open: true, pill: false }))}>{t("demo.inter.openWizard")}</Btn>
          <Btn onClick={() => setNudge(!nudge)}>{t("demo.inter.toggleNudge")}</Btn>
        </div>
        <div className="mt-4">
          <Nudge
            open={nudge}
            title={t("demo.inter.nudgeTitle")}
            actions={
              <>
                <Btn onClick={() => setNudge(false)}>{t("demo.inter.later")}</Btn>
                <Btn primary onClick={() => setNudge(false)}>{t("demo.inter.go")}</Btn>
              </>
            }
          >
            {t("demo.inter.nudgeBody")}
          </Nudge>
        </div>
        <ErrorNote text={"Traceback (most recent call last):\n  File \"main.py\", line 12, in <module>\nValueError: sample rate 44100 is not supported"} action={{ label: t("demo.inter.fix"), run: () => undefined }} />
      </Block>

      <Block title={t("demo.inter.ring")}>
        <Ring
          center="14.2 GB"
          sub={t("demo.inter.free")}
          segments={[
            { id: "a", label: t("demo.inter.seg.a"), value: 6.2, color: "var(--accent)", note: "6.2 GB" },
            { id: "b", label: t("demo.inter.seg.b"), value: 3.6, color: "var(--ok)", note: "3.6 GB" },
            { id: "c", label: t("demo.inter.seg.c"), value: 2.1, color: "var(--art-ink)", note: "2.1 GB" },
            { id: "d", label: t("demo.inter.seg.d"), value: 1.2, color: "var(--warn)", note: "1.2 GB" },
          ]}
        />
      </Block>

      <Block title={t("demo.inter.dock")}>
        <div className="h-[340px] flex flex-col rounded-[var(--r)] bg-[color-mix(in_srgb,var(--ink)_3%,transparent)] p-3">
          <div className="flex-1 min-h-0 rounded-[var(--rs)] bg-[var(--surface)] grid place-items-center text-[12.5px] text-[var(--meta)]">{t("demo.inter.main")}</div>
          <SidePanel panel={dock} side="bottom" rest={40} label={t("demo.inter.dockLabel")}>
            <button type="button" onClick={dock.toggle} className="mt-2 w-full h-8 flex items-center gap-2 border-0 bg-transparent cursor-pointer text-left text-[13px] font-medium text-[var(--ink)]">
              {t("demo.inter.dockLabel")}
              <Icon name="down" size={14} className={`ml-auto text-[var(--meta)] transition-transform duration-300 ${dock.open ? "" : "rotate-180"}`} />
            </button>
          </SidePanel>
        </div>
      </Block>

      <Bubble />

      <Wizard
        open={wizard.open}
        title={t("demo.inter.wizardTitle")}
        step={wizard.step}
        onStep={(step) => setWizard((w) => ({ ...w, step }))}
        onMinimize={() => setWizard((w) => ({ ...w, open: false, pill: true }))}
        onFinish={() => setWizard({ open: false, step: "one", pill: false })}
        steps={(["one", "two", "three"] as const).map((id, i) => ({ id, title: t(STEP_KEYS[id]), done: i === 0, body: <p className="m-0 text-[13px] text-[var(--help)] leading-relaxed">{t("demo.inter.stepBody")}</p> }))}
      />
      {wizard.pill && !wizard.open ? <WizardPill label={t("demo.inter.resume")} onOpen={() => setWizard((w) => ({ ...w, open: true, pill: false }))} onClose={() => setWizard({ open: false, step: "one", pill: false })} /> : null}
    </PagePad>
  );
}

/** 可以拖到左右两侧、松手贴边的浮动按钮。 */
function Bubble() {
  const { t } = useI18n();
  const [area, setArea] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [pos, setPos] = useState<SnapPos>({ side: "right", bottom: 84 });
  useEffect(() => {
    const fn = () => setArea({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  const d = useSnapDrag({ size: 48, area, pos, onDrop: setPos });
  // 挂到页面最外层：放在换页动画的那一层里，fixed 会跟着那一层走
  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[30]">
      <button
        type="button"
        {...d.handlers}
        onClick={() => d.wasDrag()}
        aria-label={t("demo.inter.bubble")}
        title={t("demo.inter.bubble")}
        className="pointer-events-auto absolute left-0 top-0 w-12 h-12 grid place-items-center rounded-full border-0 bg-[var(--surface)] text-[var(--ink-muted)] shadow-[var(--glass),0_0_0_1px_var(--hairline)] cursor-grab active:cursor-grabbing"
        style={{ transform: `translate3d(${d.at.x}px, ${d.at.y}px, 0)`, transition: d.dragging ? "none" : "transform 0.55s var(--spring-gentle)" }}
      >
        <Icon name="chat" size={20} />
      </button>
    </div>,
    document.body,
  );
}
