/**
 * 分步进度：一段一步，走过的实心，正在走的那一段轻轻起伏，没到的留底色。
 * 用在「要等二三十秒、但能说清楚走到哪一步」的地方，比一直转圈让人放心。
 */
export function StepBar({ index, count, label, width = 132 }: { index: number; count: number; label?: string; width?: number }) {
  return (
    <div className="flex gap-[3px]" style={{ width }} role="progressbar" aria-valuemin={1} aria-valuemax={count} aria-valuenow={index + 1} aria-valuetext={label}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="relative flex-1 h-1 rounded-sm overflow-hidden bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]">
          {i < index ? <span className="absolute inset-0 bg-[var(--accent)]" /> : i === index ? <span className="absolute inset-0 bg-[var(--accent)] step-now" /> : null}
        </span>
      ))}
    </div>
  );
}
