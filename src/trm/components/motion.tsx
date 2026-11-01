/**
 * 页内动效，全站共用一套。名字与用途见画廊「动效」页的「名词」一节。
 *
 * - 伸缩（Morph）：内容区的底板不重画，只把高度平滑地伸长或缩短。
 * - 推移（Swap、Panes）：换一批内容时，旧的朝来处退一小步、先淡掉，新的从去向那一侧推进来，
 *   两层同一条曲线、同样的时长，外面的底板同时伸缩。不再让每一项重新浮现一遍。
 * - 流动列表（FlowList）：同一份列表筛选、排序、展开时，留下的项滑到新位置，
 *   离开的项收拢、新来的项撑开，整块区域不重载。
 * - 滚字（Roll）：同一处的文字换了，旧字向下滑出，新字从上方滑入。
 * - 折叠（Collapse）：展开与收起都有高度过渡，收起放完才卸下内容。
 *
 * 时长与曲线在 index.css 的「页内动效」一段，与这里的常量一致。
 */
import { createContext, memo, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { usePresence } from "./overlay";

/** 推移、伸缩、流动列表共用的时长。与 index.css 的 --flow-ms 一致。 */
export const FLOW_MS = 420;
/** 旧名，等同于 FLOW_MS。 */
export const SWAP_OUT_MS = FLOW_MS;
export const FADE_OUT_MS = 180;
/** 依次浮现时相邻两项的间隔与最多排几项，多出的与最后一项同时出现。 */
const STAGGER = { step: 38, max: 10 };

/** 第 i 项依次浮现的延迟。列表与网格第一次出现时用它，节奏一致。 */
export function stagger(i: number, timing: { step: number; max: number } = STAGGER): CSSProperties {
  return { animationDelay: `${Math.min(i, timing.max) * timing.step}ms` };
}

/** 读一条曲线令牌的实际值，给 Web Animations 用；取不到时退回 ease-out。 */
export function curve(token: string): string {
  if (typeof document === "undefined") return "ease-out";
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || "ease-out";
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Dir = -1 | 0 | 1;

/** Product motion preferences also apply to JavaScript animations and removal timers. */
export type MotionOptions = { durationMs?: number; easing?: string; reduced?: boolean };

/** 记住一个数值上一次是变大还是变小：翻页时据此决定新内容从哪一侧推进来。 */
export function useDir(value: number): Dir {
  const last = useRef(value);
  const dir = useRef<Dir>(1);
  if (value !== last.current) {
    dir.current = value > last.current ? 1 : -1;
    last.current = value;
  }
  return dir.current;
}

/**
 * 伸缩：里面的内容变高变矮时，这一层的高度跟着平滑过渡，不跳。
 * 只有在过渡期间裁掉溢出，平时不裁，阴影和描边照常画在外面。
 */
export function Morph({ children, className = "", disabled = false }: { children: ReactNode; className?: string; disabled?: boolean }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i || typeof ResizeObserver === "undefined") return;
    let last = i.offsetHeight;
    const done = (e?: TransitionEvent) => {
      if (e && (e.target !== o || e.propertyName !== "height")) return;
      o.style.height = "";
      o.style.overflow = "";
      o.removeAttribute("data-morphing");
    };
    if (disabled) { done(); return; }
    const ro = new ResizeObserver(() => {
      const h = i.offsetHeight;
      if (h === last) return;
      const from = o.style.height ? o.getBoundingClientRect().height : last;
      last = h;
      if (reduced()) { done(); return; }
      o.style.height = `${from}px`;
      o.style.overflow = "clip";
      o.setAttribute("data-morphing", "");
      void o.offsetHeight;
      o.style.height = `${h}px`;
    });
    ro.observe(i);
    o.addEventListener("transitionend", done);
    o.addEventListener("transitioncancel", done);
    return () => {
      ro.disconnect();
      o.removeEventListener("transitionend", done);
      o.removeEventListener("transitioncancel", done);
      done();
    };
  }, [disabled]);
  return (
    <div ref={outer} className={`morph ${className}`}>
      <div ref={inner} className="flow-root">
        {children}
      </div>
    </div>
  );
}

/** 一次推移：从哪个到哪个、朝哪边、旧的那一层要往下挪多少才停在原来看到的位置。 */
type Turn = { value: string; from: string | null; dir: Dir; seq: number; offset: number };

const PanesCtx = createContext<Turn | null>(null);
/** 所在的视图此刻是否露着。嵌套的视图要外层也露着才算。 */
const PaneOnCtx = createContext(true);
export const usePaneOn = () => useContext(PaneOnCtx);

/** 页面自己的滚动容器：PageHost 里当前页的那一层，或任何标了 data-page-scroll 的容器。 */
function scroller(el: Element | null): HTMLElement | null {
  return el?.closest<HTMLElement>("[data-page-scroll]") ?? null;
}

/** 入场的类名在两个同样的动画之间轮换：同一个元素再次入场时，换个名字动画才会从头放。 */
const enterClass = (seq: number) => (seq % 2 ? "push-in" : "push-in-b");

const pushStyle = (dir: Dir) => ({ "--push": String(dir || 1) }) as CSSProperties;

/**
 * 一组互斥的视图。value 是当前那一个；order 决定方向：往后翻从右边推进来，往前翻从左边。
 * keepScroll：各视图记住自己的滚动位置，换过去时回到那里（列表与详情用它）。
 */
export function Panes({ value, order, keepScroll = false, className = "", children }: { value: string; order?: readonly string[]; keepScroll?: boolean; className?: string; children: ReactNode }) {
  const [turn, setTurn] = useState<Turn>({ value, from: null, dir: 0, seq: 0, offset: 0 });
  const box = useRef<HTMLDivElement>(null);
  const scrolls = useRef(new Map<string, number>());

  if (turn.value !== value) {
    const a = order ? order.indexOf(turn.value) : -1;
    const b = order ? order.indexOf(value) : -1;
    const dir: Dir = a < 0 || b < 0 ? 1 : b > a ? 1 : -1;
    setTurn({ value, from: turn.value, dir, seq: turn.seq + 1, offset: 0 });
  }

  // 列表与详情：离开时记下位置，进来时回到记下的位置，没来过就从头看。
  // 旧的那一层随之挪回原来看到的地方，退出时不会跟着跳一下。
  useLayoutEffect(() => {
    if (!keepScroll || !turn.from || turn.offset) return;
    const el = scroller(box.current);
    if (!el) return;
    const before = el.scrollTop;
    scrolls.current.set(turn.from, before);
    el.scrollTop = scrolls.current.get(turn.value) ?? 0;
    const moved = el.scrollTop - before;
    if (moved) setTurn((t) => (t.seq === turn.seq ? { ...t, offset: moved } : t));
  }, [keepScroll, turn]);

  useEffect(() => {
    if (!turn.from) return;
    const id = window.setTimeout(() => setTurn((t) => (t.seq === turn.seq ? { ...t, from: null, offset: 0 } : t)), FLOW_MS);
    return () => window.clearTimeout(id);
  }, [turn.from, turn.seq]);

  return (
    <Morph className={className}>
      <div ref={box} className={`relative ${turn.from ? "push-stage" : ""}`}>
        <PanesCtx.Provider value={turn}>{children}</PanesCtx.Provider>
      </div>
    </Morph>
  );
}

/** 看不见的时候原样留着上一次的内容，不跟着外面重绘。 */
const Frozen = memo(function Frozen({ node }: { node: ReactNode }) {
  return <>{node}</>;
});

/**
 * Panes 里的一个视图。常驻不卸载，切走时只是藏起来，筛选、页码、输入都留着；
 * 藏起来的时候显示的是最后一次露面时的内容，所以离开时照样有东西可以推出去。
 */
export function Pane({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  const turn = useContext(PanesCtx);
  const outer = useContext(PaneOnCtx);
  const on = turn ? turn.value === id : true;
  const [kept, setKept] = useState(children);
  if (on && kept !== children) setKept(children);
  const leaving = Boolean(turn && turn.from === id);
  const entering = Boolean(turn && on && turn.seq > 0);
  const state = on ? (entering ? `${enterClass(turn?.seq ?? 0)} flow-quiet` : "") : leaving ? "push-out absolute inset-x-0 pointer-events-none" : "hidden";
  return (
    <div
      aria-hidden={on ? undefined : true}
      inert={!on}
      className={`${className} ${state}`}
      style={{ ...pushStyle(turn?.dir ?? 1), top: leaving ? turn?.offset : undefined }}
    >
      <PaneOnCtx.Provider value={outer && on}>
        <Frozen node={on ? children : kept} />
      </PaneOnCtx.Provider>
    </div>
  );
}

/**
 * 同一处内容换了一批：换筛选、换排序、翻页、换步骤。k 变了，旧的推出去、新的推进来，
 * 外层底板只伸缩高度。dir 给出方向（翻到下一页为 1，上一页为 -1），不给时从右边进。
 * 新内容里的 .rise 不再重放：一项项重新浮现会让整块像是重新加载了一遍。
 */
export function Swap({ k, dir = 1, children, className = "", variant = "push" }: { k: string; dir?: Dir; children: ReactNode; className?: string; variant?: "push" | "fade" }) {
  const [cur, setCur] = useState({ k, node: children, seq: 0, dir });
  const [old, setOld] = useState<{ node: ReactNode; seq: number } | null>(null);
  if (cur.k !== k) {
    setOld({ node: cur.node, seq: cur.seq });
    setCur({ k, node: children, seq: cur.seq + 1, dir });
  } else if (cur.node !== children) {
    setCur({ ...cur, node: children });
  }
  useEffect(() => {
    if (!old) return;
    const id = window.setTimeout(() => setOld(null), variant === "fade" ? FADE_OUT_MS : FLOW_MS);
    return () => window.clearTimeout(id);
  }, [old, variant]);
  if (variant === "fade") {
    const vars = { "--swap-dx": `${dir * 18}px`, "--swap-ox": `${dir * -10}px` } as CSSProperties;
    return (
      <div className={`relative ${className}`} style={vars}>
        <div key={cur.seq} className={cur.seq ? "swap-in" : ""}>{cur.node}</div>
        {old ? <div key={`out-${old.seq}`} inert aria-hidden className="swap-out absolute inset-x-0 top-0 pointer-events-none">
          <Frozen node={old.node} />
        </div> : null}
      </div>
    );
  }
  return (
    <Morph className={className}>
      <div className={`relative ${old ? "push-stage" : ""}`} style={pushStyle(cur.dir)}>
        {old ? (
          <div key={`out-${old.seq}`} inert aria-hidden className="push-out absolute inset-x-0 top-0 pointer-events-none">
            {/* 退出中的旧内容不再算露着：里面的页标题随之让位 */}
            <PaneOnCtx.Provider value={false}>
              <Frozen node={old.node} />
            </PaneOnCtx.Provider>
          </div>
        ) : null}
        <div key={cur.seq} className={cur.seq ? `${enterClass(cur.seq)} flow-quiet` : ""}>
          {cur.node}
        </div>
      </div>
    </Morph>
  );
}

type FlowEntry<T> = { key: string; item: T; phase: "enter" | "stay" | "leave" };

/**
 * 流动列表：同一份列表换了筛选、排序或展开了更多时，整块不重载。
 * 留下的项从旧位置滑到新位置，离开的项原地收拢，新来的项撑开。
 * 列表的间距写在每一项里面（例如 py-3），不要用 gap：收拢的项仍占着一份 gap。
 */
export function FlowList<T>({ items, keyOf, render, className = "", itemClassName = "", motion, layout = "list" }: { items: readonly T[]; keyOf: (item: T) => string; render: (item: T, i: number) => ReactNode; className?: string; itemClassName?: string; motion?: MotionOptions; layout?: "list" | "grid" }) {
  const duration = motion?.reduced || reduced() ? 0 : Math.max(0, motion?.durationMs ?? FLOW_MS);
  const [list, setList] = useState<FlowEntry<T>[]>(() => items.map((item) => ({ key: keyOf(item), item, phase: "stay" })));
  // 按 key 的顺序判断列表变没变。父组件每次重绘都会传来新数组（filter、slice），
  // 只看数组是不是同一个，就会把每次重绘都当成换了列表，用旧位置再滑一遍
  const sig = items.map(keyOf).join("\n");
  const [src, setSrc] = useState(sig);
  const box = useRef<HTMLDivElement>(null);
  const positions = useRef(new Map<string, { top: number; left: number; width: number; height: number }>());
  // 上一次量位置时对应的那份列表。收尾那次重绘（卸下离开的项、新来的项转常驻）列表没变，只记位置不放动画
  const measured = useRef(sig);

  if (src !== sig) {
    setSrc(sig);
    const next = new Set(items.map(keyOf));
    const prev = list.filter((e) => e.phase !== "leave" || !next.has(e.key));
    const had = new Map(prev.filter((e) => e.phase !== "leave").map((e) => [e.key, e]));
    const merged: FlowEntry<T>[] = [];
    // 离开的项留在它原来的前一项后面，原地收拢
    let pi = 0;
    for (const item of items) {
      const key = keyOf(item);
      while (pi < prev.length && !next.has(prev[pi].key)) {
        merged.push({ ...prev[pi], phase: "leave" });
        pi++;
      }
      if (pi < prev.length && prev[pi].key === key) pi++;
      merged.push({ key, item, phase: had.get(key)?.phase ?? "enter" });
    }
    for (; pi < prev.length; pi++) if (!next.has(prev[pi].key)) merged.push({ ...prev[pi], phase: "leave" });
    setList(merged);
  }

  // 留下的项：量出新旧位置的差，先倒推回旧位置再放开（FLIP）
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const quiet = duration === 0 || measured.current === src;
    measured.current = src;
    // 位置量的是相对列表本身（列表是定位容器），外层整体移动不算这几项换了位置
    const easing = motion?.easing ?? curve("--ease-nav");
    const now = new Map<string, { top: number; left: number; width: number; height: number }>();
    el.querySelectorAll<HTMLElement>(":scope > [data-flow]").forEach((node) => {
      const key = node.dataset.flow ?? "";
      const was = positions.current.get(key);
      // Grid removals leave the layout immediately, so neighbours move once rather than jumping after exit.
      if (layout === "grid" && node.dataset.phase === "leave" && was) {
        Object.assign(node.style, { position: "absolute", top: `${was.top}px`, left: `${was.left}px`, width: `${was.width}px`, height: `${was.height}px` });
        now.set(key, was);
        return;
      }
      Object.assign(node.style, { position: "", top: "", left: "", width: "", height: "" });
    });
    el.querySelectorAll<HTMLElement>(":scope > [data-flow]").forEach((node) => {
      const key = node.dataset.flow ?? "";
      if (layout === "grid" && node.dataset.phase === "leave") return;
      const position = { top: node.offsetTop, left: node.offsetLeft, width: node.offsetWidth, height: node.offsetHeight };
      now.set(key, position);
      const was = positions.current.get(key);
      if (!duration) node.getAnimations?.().forEach(animation => animation.cancel());
      if (quiet || !was || (was.top === position.top && was.left === position.left) || node.dataset.phase !== "stay") return;
      node.getAnimations?.().forEach(animation => animation.cancel());
      node.animate([{ transform: `translate3d(${was.left - position.left}px, ${was.top - position.top}px, 0)` }, { transform: "none" }], { duration, easing });
    });
    positions.current = now;
  });

  // 撑开、收拢放完之后：新来的项转为常驻，离开的项卸下。多等两帧，确保动画已经停在终点
  const moving = list.some((e) => e.phase !== "stay");
  useEffect(() => {
    if (!moving) return;
    const id = window.setTimeout(() => setList((l) => l.filter((e) => e.phase !== "leave").map((e) => (e.phase === "enter" ? { ...e, phase: "stay" } : e))), duration ? duration + 40 : 0);
    return () => window.clearTimeout(id);
  }, [moving, list, duration]);

  // 条目内容（点赞数之类）随时可能更新：在场的项一律按 key 取最新的那份来画，离开的项照原样画完
  const current = new Map(items.map((it) => [keyOf(it), it]));
  let shown = 0;
  return (
    <div ref={box} className={`relative ${className}`} data-flow-layout={layout} style={{ "--flow-ms": `${duration}ms`, ...(motion?.easing ? { "--ease-nav": motion.easing } : {}) } as CSSProperties}>
      {list.map((e) => (
        <div key={e.key} data-flow={e.key} data-phase={e.phase} inert={e.phase === "leave"} className={`flow-item ${e.phase === "leave" ? "flow-leave" : e.phase === "enter" ? "flow-enter" : ""}`}>
          {/* 间距放在里层：外层收拢到零时内边距跟着一起收，不会最后一下才跳没 */}
          <div className="flow-body">
            <div className={itemClassName}>{render(e.phase === "leave" ? e.item : (current.get(e.key) ?? e.item), e.phase === "leave" ? -1 : shown++)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 滚字：同一处的文字换了，旧字向下滑出，新字从上方滑入，宽度随之过渡。
 * 用在标题、计数、当前项名称这类「同一个位置换了内容」的地方。
 */
export function Roll({ value, className = "" }: { value: string; className?: string }) {
  const [cur, setCur] = useState({ value, seq: 0 });
  const [old, setOld] = useState<{ value: string; seq: number } | null>(null);
  if (cur.value !== value) {
    setOld({ value: cur.value, seq: cur.seq });
    setCur({ value, seq: cur.seq + 1 });
  }
  useEffect(() => {
    if (!old) return;
    const id = window.setTimeout(() => setOld(null), FLOW_MS);
    return () => window.clearTimeout(id);
  }, [old]);
  return (
    <span className={`roll ${className}`}>
      {old ? (
        <span key={`o${old.seq}`} aria-hidden className="roll-out">
          {old.value}
        </span>
      ) : null}
      <span key={cur.seq} className={cur.seq ? "roll-in" : ""}>
        {cur.value}
      </span>
    </span>
  );
}

/**
 * 折叠：open 变化时高度平滑过渡。收起放完才卸下内容，收起过程中显示的是最后一次展开时的样子。
 */
export function Collapse({ open, children, className = "", ms = FLOW_MS }: { open: boolean; children: ReactNode; className?: string; ms?: number }) {
  const [mounted, setMounted] = useState(open);
  const last = useRef<ReactNode>(null);
  if (open) last.current = children;
  if (open && !mounted) setMounted(true);
  useEffect(() => {
    if (open) return;
    const id = window.setTimeout(() => setMounted(false), ms);
    return () => window.clearTimeout(id);
  }, [open, ms]);
  return (
    <div className={`collapse-area ${className}`} data-open={open || undefined} inert={!open}>
      <div className="min-h-0 overflow-hidden">{mounted ? (open ? children : last.current) : null}</div>
    </div>
  );
}

/**
 * 一排选项里「选中的那一个」的底或下划线，换项时滑过去，不是这边灭、那边亮。
 * 选中项用 aria-selected / aria-pressed / aria-checked / aria-current 标出。只动 transform，
 * 主线程忙的时候照样顺。第一次量完之前不开过渡，免得从最左边滑进来。
 */
export function useSlider<T extends HTMLElement>() {
  const box = useRef<T>(null);
  const [pos, setPos] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [armed, setArmed] = useState(false);
  const measure = () => {
    const el = box.current?.querySelector<HTMLElement>(':scope > [aria-selected="true"], :scope > [aria-pressed="true"], :scope > [aria-checked="true"], :scope > [aria-current="page"]');
    const next = el ? { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight } : null;
    setPos((p) => (p && next && p.x === next.x && p.y === next.y && p.w === next.w && p.h === next.h ? p : next));
  };
  // 每次重绘后量一次：选中项变了、项数变了、字数变了都算
  useLayoutEffect(measure);
  useEffect(() => {
    if (!pos || armed) return;
    const id = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(id);
  }, [pos, armed]);
  // 字体晚到、窗口改宽时重新量
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  /** 选中项的立即位置：点下去的那一刻就挪，不等外面重绘完。 */
  const jump = (el: HTMLElement) => setPos({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  return { box, pos, armed, jump };
}

/**
 * 滑块的样式。bar 是一条细线：固定宽度按比例拉伸，全程只动 transform；
 * box 是一块底色：位置走 transform，宽高随选中项变。
 */
export function sliderStyle(pos: { x: number; y: number; w: number; h: number }, kind: "bar" | "box"): CSSProperties {
  if (kind === "bar") return { width: 100, transformOrigin: "left", transform: `translate3d(${pos.x}px, 0, 0) scaleX(${pos.w / 100})` };
  return { width: pos.w, height: pos.h, transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` };
}

/** Reveal or retract a selected detail panel while retaining its last content. */
export function Curtain({ children, fallback, className = "" }: { children: ReactNode; fallback: ReactNode; className?: string }) {
  const present = children !== null && children !== undefined && children !== false;
  const { mounted } = usePresence(present, FLOW_MS);
  const last = useRef<ReactNode>(null);
  if (present) last.current = children;
  // 每出现一次换一个 key：重新出现时再拉开一次，出现期间内容更新不重放
  const [round, setRound] = useState({ present, n: 0 });
  if (round.present !== present) setRound({ present, n: present ? round.n + 1 : round.n });
  if (present) return <div key={`c${round.n}`} className={`curtain-in ${className}`}>{children}</div>;
  if (mounted) return (
    <div key={`o${round.n}`} inert aria-hidden className={`curtain-out ${className}`}>
      <Frozen node={last.current} />
    </div>
  );
  return <div key="empty" className={`rise ${className}`}>{fallback}</div>;
}
