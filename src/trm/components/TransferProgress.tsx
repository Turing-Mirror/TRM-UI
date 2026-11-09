import { Bar } from "./display";

type TransferProgressProps = {
  message: string;
  percent?: number;
  speed?: string;
  detail?: string;
  elapsed?: string;
};

export function TransferProgress({ message, percent, speed, detail, elapsed }: TransferProgressProps) {
  const pct = percent === undefined ? undefined : Math.min(100, Math.max(0, percent));
  const label = pct === undefined ? "…" : pct > 0 && pct < 0.1 ? "<0.1%" : pct < 10 ? `${pct.toFixed(1)}%` : `${Math.round(pct)}%`;
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--meta)]">
        <span className="min-w-0 break-words">{message}</span>
        <span className="ml-auto flex shrink-0 items-center gap-2 tabular-nums">
          {speed ? <span className="text-[var(--accent)]">{speed}</span> : null}
          <span>{label}</span>
        </span>
      </div>
      <div role="progressbar" aria-label={message} aria-valuenow={pct}>
        {pct === undefined ? (
          <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]">
            <div className="h-full w-1/3 rounded-full bg-[var(--accent)] motion-safe:animate-pulse" />
          </div>
        ) : <Bar value={pct > 0 ? Math.max(pct, 0.5) / 100 : 0} />}
      </div>
      {detail ? <div className="mt-1.5 text-[11.5px] tabular-nums text-[var(--meta)]">{detail}</div> : null}
      {elapsed ? <div className="mt-1.5 text-[11.5px] tabular-nums text-[var(--meta)]">{elapsed}</div> : null}
    </div>
  );
}
