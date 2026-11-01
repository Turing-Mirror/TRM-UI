import { useEffect, useState } from "react";

/** Keep the previous face alive for its exit motion, without owning its contents. */
export function useLeavingValue<T>(value: T, durationMs: number, enabled = true): T | null {
  const [state, setState] = useState<{ value: T; leaving: T | null; seq: number }>({ value, leaving: null, seq: 0 });
  if (!Object.is(state.value, value)) {
    setState({ value, leaving: enabled ? state.value : null, seq: state.seq + 1 });
  }
  useEffect(() => {
    if (state.leaving === null) return;
    const timer = window.setTimeout(() => setState(current => current.seq === state.seq ? { ...current, leaving: null } : current), durationMs);
    return () => window.clearTimeout(timer);
  }, [state.seq, state.leaving, durationMs]);
  return enabled ? state.leaving : null;
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
