import { useEffect, useRef, useState } from "react";

/** Keep the previous face alive for its exit motion, without owning its contents. */
export function useLeavingValue<T>(value: T, durationMs: number, enabled = true): T | null {
  const previous = useRef(value);
  const [leaving, setLeaving] = useState<T | null>(null);
  useEffect(() => {
    if (Object.is(previous.current, value)) { setLeaving(null); return; }
    const old = previous.current;
    previous.current = value;
    setLeaving(enabled ? old : null);
    if (!enabled) return;
    const timer = window.setTimeout(() => setLeaving(null), durationMs);
    return () => window.clearTimeout(timer);
  }, [value, durationMs, enabled]);
  return leaving;
}

/** Let the destination finish layout before changing a persistent container's shape. */
export function useMorphState<T>(wanted: T, { exitMs = 200, deferFrames = 2 }: { exitMs?: number; deferFrames?: number } = {}) {
  const [value, setValue] = useState(wanted);
  const leaving = useLeavingValue(value, exitMs);
  useEffect(() => {
    if (Object.is(wanted, value)) return;
    let frame = 0;
    let remaining = Math.max(0, Math.floor(deferFrames));
    const advance = () => {
      if (remaining-- > 0) frame = requestAnimationFrame(advance);
      else setValue(wanted);
    };
    advance();
    return () => cancelAnimationFrame(frame);
  }, [wanted, value, deferFrames]);
  return { value, leaving };
}
