import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Nav } from "../lib/nav";

/**
 * 离场层挂多久。**必须和 index.css 里 `.page-leave-*` 的动画时长一致。**
 *
 * 短了就是动画放到一半节点被拔掉，旧页「啪」一下消失；长了则是一个已经看不见
 * 的图层继续占着，白白多一层。这里曾经写死 300ms 而动画是 420ms，
 * 旧页在淡出到七成的时候被砍掉。
 */
const LEAVE_MS = 420;

type Props<T extends string> = {
  nav: Nav<T>;
  page: T;
  children: (id: T) => ReactNode;
  /** 换页方向的轴。顶部页签用 "x"（默认），侧栏用 "y"：导航竖着排，页面就上下推。 */
  axis?: "x" | "y";
};

/**
 * 按导航顺序做方向性换页：往右翻，新页从右边推进来。
 *
 * 同时挂两层（离场页 + 入场页），所以 `children` 是个函数而不是节点 ——
 * 它会被调用两次，各画各的那一页。
 */
export function PageHost<T extends string>({ nav, page, children, axis = "x" }: Props<T>) {
  const [phase, setPhase] = useState<{
    /** 叫 `page` 不叫 `current`：`x.current` 读起来像个 ref。 */
    page: T;
    leaving: T | null;
    dir: 1 | -1 | 0;
  }>({ page, leaving: null, dir: 0 });
  const reduce = usePrefersReducedMotion();
  const leaveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) {
      if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
      setPhase((p) => p.page === page && p.leaving === null && p.dir === 0
        ? p : { page, leaving: null, dir: 0 });
      return;
    }
    if (page === phase.page) return;
    if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = null;
    const dir = nav.direction(phase.page, page);
    if (dir === 0) {
      setPhase({ page, leaving: null, dir: 0 });
      return;
    }
    setPhase({ page, leaving: phase.page, dir });
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => {
      setPhase((p) => ({ ...p, leaving: null }));
    }, LEAVE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在页面 id 变化时跑
  }, [page, reduce]);

  useEffect(
    () => () => {
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    },
    [],
  );

  // 换**页**时回到顶部 —— 不是每次渲染都回。
  //
  // 这里一度写成内联的 `ref={(el) => { if (el) el.scrollTop = 0 }}`。
  // 内联回调每次渲染都是一个新函数，于是 React 每渲染一次就摘一次挂一次，
  // 每一趟都把滚动位置重置掉。只要页面上有任何东西在定时重渲染（进度轮询
  // 之类），用户就会发现这一页**根本滚不动**。
  const paneRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (paneRef.current) paneRef.current.scrollTop = 0;
  }, [phase.page]);

  const [fwd, back] = axis === "y" ? ["u", "d"] : ["l", "r"];
  const enterCls =
    phase.dir === 1 ? `page-enter-${fwd}` : phase.dir === -1 ? `page-enter-${back}` : "";
  const leaveCls =
    phase.dir === 1 ? `page-leave-${fwd}` : phase.dir === -1 ? `page-leave-${back}` : "";

  return (
    <div className="relative flex-1 overflow-hidden">
      {(phase.leaving && phase.leaving !== phase.page
        ? [phase.leaving, phase.page]
        : [phase.page]).map((id) => {
        const leaving = id === phase.leaving;
        return (
          <div
            key={id}
            ref={leaving ? undefined : paneRef}
            inert={leaving}
            aria-hidden={leaving || undefined}
            className={leaving
              ? `absolute inset-0 overflow-hidden pointer-events-none z-[1] ${leaveCls}`
              : `absolute inset-0 overflow-y-auto z-[2] ${enterCls}`}
          >
            {children(id)}
          </div>
        );
      })}
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [v, setV] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setV(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return v;
}
