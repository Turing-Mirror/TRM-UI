export function followScrollEnd(el: HTMLElement, duration: number) {
  const scrollEnd = () => Math.max(0, el.scrollHeight - el.clientHeight);
  // Fresh layers and reduced motion reach the end before paint.
  if (!duration) {
    el.scrollTop = scrollEnd();
    return;
  }

  const from = el.scrollTop;
  const start = performance.now();
  let frame = 0;
  const cancel = () => {
    cancelAnimationFrame(frame);
    el.removeEventListener("wheel", cancel);
    el.removeEventListener("touchstart", cancel);
  };
  const follow = () => {
    const progress = Math.min(1, (performance.now() - start) / duration);
    // The end can move while rows expand or collapse.
    el.scrollTop = from + (scrollEnd() - from) * (1 - (1 - progress) ** 3);
    if (progress < 1) frame = requestAnimationFrame(follow);
    else cancel();
  };
  el.addEventListener("wheel", cancel, { passive: true });
  el.addEventListener("touchstart", cancel, { passive: true });
  follow();
  return cancel;
}
