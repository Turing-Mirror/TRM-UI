import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { FLOW_MS, FlowList, PushLayer } from "./motion";
import { StaticMotionContext } from "./motionScope";

type Block = { key: string; node: ReactNode };
type Body = { scope: string; blocks: Block[]; end?: string | number; seq: number; dir: -1 | 1 };
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function BodyContent({ body, leaving, moving }: { body: Body; leaving: boolean; moving: boolean }) {
  const scroll = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    if (!moving) return;
    // Cancel descendant CSS entrances and transitions before paint. Unlike toggling
    // animation:none on the stage, cancellation does not restart them when the push ends.
    scroll.current?.getAnimations?.({ subtree: true }).forEach(animation => animation.cancel());
  });
  useLayoutEffect(() => {
    const el = scroll.current;
    if (!el || leaving || body.end === undefined) return;
    const instant = first.current || moving || reduced();
    first.current = false;
    const from = el.scrollTop;
    const start = performance.now();
    let frame = 0;
    const follow = () => {
      const progress = instant ? 1 : Math.min(1, (performance.now() - start) / FLOW_MS);
      const end = Math.max(0, el.scrollHeight - el.clientHeight);
      el.scrollTop = from + (end - from) * (1 - (1 - progress) ** 3);
      if (progress < 1) frame = requestAnimationFrame(follow);
    };
    // A fresh layer reaches its end before paint, not after its push has landed.
    follow();
    const cancel = () => cancelAnimationFrame(frame);
    el.addEventListener("wheel", cancel, { passive: true });
    el.addEventListener("touchstart", cancel, { passive: true });
    return () => {
      cancel();
      el.removeEventListener("wheel", cancel);
      el.removeEventListener("touchstart", cancel);
    };
  }, [body.end, leaving, moving]);
  return <StaticMotionContext.Provider value={moving}>
    <div ref={scroll} className="trm-workbench-body" data-follow-end={body.end !== undefined || undefined}>
      <div className="trm-workbench-read">
        <FlowList items={body.blocks} keyOf={block => block.key} className="flow-quiet"
          itemClassName="trm-workbench-block" render={block => block.node} />
      </div>
    </div>
  </StaticMotionContext.Provider>;
}

/** Every detail uses one adjacent body pair; only conversations opt into following the scroll end. */
export function WorkbenchBody({ scope, order, blocks, end }: {
  scope: string; order: readonly string[]; blocks: Block[]; end?: string | number;
}) {
  const [current, setCurrent] = useState<Body>({ scope, blocks, end, seq: 0, dir: 1 });
  const [old, setOld] = useState<Body | null>(null);
  // A third selection replaces the incoming content without restarting its painted
  // journey. Reversing swaps the same two layers and continues from their positions.
  if (current.scope !== scope) {
    const before = order.indexOf(current.scope);
    const after = order.indexOf(scope);
    const dir = before >= 0 && after >= 0 && after < before ? -1 : 1;
    if (old && !reduced() && scope !== old.scope && dir === current.dir) {
      setCurrent({ ...current, scope, blocks, end });
    } else {
      setOld(reduced() ? null : current);
      setCurrent({ scope, blocks, end, seq: old?.seq ?? current.seq + 1, dir });
    }
  } else if (current.scope === scope && (current.blocks !== blocks || current.end !== end)) {
    setCurrent({ ...current, blocks, end });
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
