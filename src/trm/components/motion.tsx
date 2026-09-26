/**
 * 页内切换的动效，全站共用一套：分栏、列表与详情、筛选结果。
 *
 * 旧内容与新内容交叠着换：旧的很快淡出、朝来处让一小步，新的从去向那一侧浮上来。
 * 看不见的分栏照常挂着、状态都在，但不再跟着页面重绘：切一次分栏只画新露出来的那一栏，
 * 点下去的那一刻指示条与内容就开始动，不会先卡一下。
 * 时长与 index.css 里 .swap-in、.swap-out 一致。
 */
import { createContext, memo, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** 旧内容留多久：等淡出放完。与 index.css 的 .swap-out 一致。 */
export const SWAP_OUT_MS = 180;
/** 依次浮现时相邻两项的间隔与最多排几项，多出的与最后一项同时出现。 */
const STAGGER = { step: 24, max: 12 };

/** 第 i 项依次浮现的延迟。列表与网格里每一项都用它，节奏一致。 */
export function stagger(i: number): CSSProperties {
  return { animationDelay: `${Math.min(i, STAGGER.max) * STAGGER.step}ms` };
}

type Dir = -1 | 0 | 1;
/** 一次切换：从哪个到哪个、朝哪边、旧的那一层要往下挪多少才停在原来看到的位置。 */
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
const enterClass = (seq: number) => (seq % 2 ? "swap-in" : "swap-in-b");

/**
 * 一组互斥的视图。value 是当前那一个；order 决定方向：往后翻从右边进，往前翻从左边进。
 * keepScroll：各视图记住自己的滚动位置，换过去时回到那里（列表与详情用它）。
 */
export function Panes({ value, order, keepScroll = false, className = "", children }: { value: string; order?: readonly string[]; keepScroll?: boolean; className?: string; children: ReactNode }) {
  const [turn, setTurn] = useState<Turn>({ value, from: null, dir: 0, seq: 0, offset: 0 });
  const box = useRef<HTMLDivElement>(null);
  const scrolls = useRef(new Map<string, number>());

  if (turn.value !== value) {
    const a = order ? order.indexOf(turn.value) : -1;
    const b = order ? order.indexOf(value) : -1;
    const dir: Dir = a < 0 || b < 0 ? 0 : b > a ? 1 : -1;
    setTurn({ value, from: turn.value, dir, seq: turn.seq + 1, offset: 0 });
  }

  // 列表与详情：离开时记下位置，进来时回到记下的位置，没来过就从头看。
  // 旧的那一层随之挪回原来看到的地方，淡出时不会跟着跳一下。
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
    const id = window.setTimeout(() => setTurn((t) => (t.seq === turn.seq ? { ...t, from: null, offset: 0 } : t)), SWAP_OUT_MS);
    return () => window.clearTimeout(id);
  }, [turn.from, turn.seq]);

  return (
    <div ref={box} className={`relative ${className}`}>
      <PanesCtx.Provider value={turn}>{children}</PanesCtx.Provider>
    </div>
  );
}

/** 看不见的时候原样留着上一次的内容，不跟着外面重绘。 */
const Frozen = memo(function Frozen({ node }: { node: ReactNode }) {
  return <>{node}</>;
});

/**
 * Panes 里的一个视图。常驻不卸载，切走时只是藏起来，筛选、页码、输入都留着；
 * 藏起来的时候显示的是最后一次露面时的内容，所以详情收起时照样有东西可以淡出。
 */
export function Pane({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  const turn = useContext(PanesCtx);
  const outer = useContext(PaneOnCtx);
  const on = turn ? turn.value === id : true;
  const [kept, setKept] = useState(children);
  if (on && kept !== children) setKept(children);
  const leaving = Boolean(turn && turn.from === id);
  const entering = Boolean(turn && on && turn.seq > 0);
  const dir = turn?.dir ?? 0;
  const state = on ? (entering ? enterClass(turn?.seq ?? 0) : "") : leaving ? "swap-out absolute inset-x-0 pointer-events-none" : "hidden";
  return (
    <div
      aria-hidden={on ? undefined : true}
      inert={!on}
      className={`${className} ${state}`}
      style={{ "--swap-dx": `${dir * 18}px`, "--swap-ox": `${dir * -10}px`, top: leaving ? turn?.offset : undefined } as CSSProperties}
    >
      <PaneOnCtx.Provider value={outer && on}>
        <Frozen node={on ? children : kept} />
      </PaneOnCtx.Provider>
    </div>
  );
}

/**
 * 同一处内容换了一批：换筛选、换排序、翻页。k 变了，旧的淡出、新的一项项浮上来；
 * 哪怕新旧是同一项、或只剩一项，也照样有这一下，不会一动不动。
 */
export function Swap({ k, children, className = "" }: { k: string; children: ReactNode; className?: string }) {
  const [cur, setCur] = useState({ k, node: children, seq: 0 });
  const [old, setOld] = useState<{ node: ReactNode; seq: number } | null>(null);
  if (cur.k !== k) {
    setOld({ node: cur.node, seq: cur.seq });
    setCur({ k, node: children, seq: cur.seq + 1 });
  } else if (cur.node !== children) {
    setCur({ ...cur, node: children });
  }
  useEffect(() => {
    if (!old) return;
    const id = window.setTimeout(() => setOld(null), SWAP_OUT_MS);
    return () => window.clearTimeout(id);
  }, [old]);
  return (
    <div className={`relative ${className}`}>
      {old ? (
        <div key={`out-${old.seq}`} inert aria-hidden className="swap-out absolute inset-x-0 top-0 pointer-events-none">
          {/* 淡出中的旧内容不再算露着：里面的页标题随之让位 */}
          <PaneOnCtx.Provider value={false}>
            <Frozen node={old.node} />
          </PaneOnCtx.Provider>
        </div>
      ) : null}
      <div key={cur.seq} className={cur.seq ? "swap-in" : ""}>
        {cur.node}
      </div>
    </div>
  );
}

/**
 * 一排选项里「选中的那一个」的底或下划线，换项时滑过去，不是这边灭、那边亮。
 * 选中项用 aria-selected / aria-pressed / aria-checked 标出。只动 transform，
 * 主线程忙的时候照样顺。第一次量完之前不开过渡，免得从最左边滑进来。
 */
export function useSlider<T extends HTMLElement>() {
  const box = useRef<T>(null);
  const [pos, setPos] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [armed, setArmed] = useState(false);
  const measure = () => {
    const el = box.current?.querySelector<HTMLElement>(':scope > [aria-selected="true"], :scope > [aria-pressed="true"], :scope > [aria-checked="true"]');
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
