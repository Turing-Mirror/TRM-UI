import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { FLOW_MS, FlowList, PushLayer } from "./motion";
import { StaticMotionContext } from "./motionScope";
import { followScrollEnd } from "./followScrollEnd";

type Block = { key: string; node: ReactNode };
type Body = { scope: string; blocks: Block[]; end?: string | number; pending?: boolean; seq: number; dir: -1 | 1 };
/** Fade for content that arrives after loading. */
const SETTLE_MS = 280;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function BodyContent({ body, leaving, moving }: { body: Body; leaving: boolean; moving: boolean }) {
  const scroll = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  // The render in which loading ends: arrived blocks appear settled, not unfolded one by one.
  const wasPending = useRef(body.pending);
  const settling = wasPending.current === true && !body.pending;
  useLayoutEffect(() => {
    wasPending.current = body.pending;
    if (!settling || moving || reduced()) return;
    scroll.current?.firstElementChild?.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: SETTLE_MS, easing: "ease-out" });
  });
  useLayoutEffect(() => {
    if (!moving) return;
    // Cancel descendant CSS entrances and transitions before paint. Unlike toggling
    // animation:none on the stage, cancellation does not restart them when the push ends.
    scroll.current?.getAnimations?.({ subtree: true }).forEach(animation => animation.cancel());
  });
  useLayoutEffect(() => {
    const el = scroll.current;
    if (!el || leaving || body.end === undefined) return;
    const instant = first.current || moving || settling || reduced();
    first.current = false;
    return followScrollEnd(el, instant ? 0 : FLOW_MS);
  }, [body.end, leaving, moving]);
  return <StaticMotionContext.Provider value={moving || settling}>
    <div ref={scroll} className="trm-workbench-body" data-follow-end={body.end !== undefined || undefined}>
      <div className="trm-workbench-read">
        <FlowList items={body.blocks} keyOf={block => block.key} className="flow-quiet"
          itemClassName="trm-workbench-block" render={block => block.node} />
      </div>
    </div>
  </StaticMotionContext.Provider>;
}

/** Every detail uses one adjacent body pair; only conversations opt into following the scroll end. */
export function WorkbenchBody({ scope, order, blocks, end, pending }: {
  scope: string; order: readonly string[]; blocks: Block[]; end?: string | number; pending?: boolean;
}) {
  const [current, setCurrent] = useState<Body>({ scope, blocks, end, pending, seq: 0, dir: 1 });
  const [old, setOld] = useState<Body | null>(null);
  // A third selection replaces the incoming content without restarting its painted
  // journey. Reversing swaps the same two layers and continues from their positions.
  if (current.scope !== scope) {
    const before = order.indexOf(current.scope);
    const after = order.indexOf(scope);
    const dir = before >= 0 && after >= 0 && after < before ? -1 : 1;
    if (old && !reduced() && scope !== old.scope && dir === current.dir) {
      setCurrent({ ...current, scope, blocks, end, pending });
    } else {
      setOld(reduced() ? null : current);
      setCurrent({ scope, blocks, end, pending, seq: old?.seq ?? current.seq + 1, dir });
    }
  } else if (current.scope === scope && (current.blocks !== blocks || current.end !== end || current.pending !== pending)) {
    setCurrent({ ...current, blocks, end, pending });
  }
  useEffect(() => {
    if (!old) return;
    const timer = window.setTimeout(() => setOld(null), FLOW_MS);
    return () => window.clearTimeout(timer);
  }, [old]);
  return <div className="trm-workbench-body-stage" data-scope={current.scope}
    data-switching={Boolean(old) || undefined} data-direction={current.dir}>
    {old ? <PushLayer key={old.seq} phase="leave" seq={current.seq} dir={current.dir} transition="body"
      className="trm-workbench-body-layer trm-workbench-body-out">
      <BodyContent key={old.scope} body={old} leaving moving />
    </PushLayer> : null}
    <PushLayer key={current.seq} phase={old ? "enter" : "shown"} seq={current.seq} dir={current.dir}
      transition="body" className="trm-workbench-body-layer trm-workbench-body-current">
      <BodyContent key={current.scope} body={current} leaving={false} moving={Boolean(old)} />
    </PushLayer>
  </div>;
}
