import { useEffect, useState } from "react";

/** Short requests should finish without flashing a progress glyph. */
export const BUSY_DELAY_MS = 300;

export function useDelayedBusy(busy: boolean) {
  const [visible, setVisible] = useState(false);
  const [previous, setPrevious] = useState(busy);
  if (previous !== busy) {
    setPrevious(busy);
    setVisible(false);
  }
  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => setVisible(true), BUSY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [busy]);
  return busy && visible;
}
