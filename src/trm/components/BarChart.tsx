import { useId, useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { DataTable } from "./DataTable";
import { SegmentControl } from "./SegmentControl";
import { useLatest, usePresence } from "./overlay";

export type BarChartItem = { label: string; value: number };
export type BarChartProps = {
  title: string;
  data: BarChartItem[];
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
  describe?: (item: BarChartItem) => string;
  showTableToggle?: boolean;
};

const MAX_BAR = 40;

export function niceTick(max: number): number {
  const rough = Math.max(1, max / 3);
  const power = 10 ** Math.floor(Math.log10(rough));
  return ([1, 2, 5, 10].find((n) => n * power >= rough) ?? 10) * power;
}

export function BarChart({
  title, data, formatValue = String, formatLabel = (label) => label, describe, showTableToggle = false,
}: BarChartProps) {
  const { t } = useI18n();
  const [view, setView] = useState<"chart" | "table">("chart");
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const id = useId();
  const svg = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(320);
  useLayoutEffect(() => {
    if (!svg.current) return;
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width;
      if (measured) setWidth(measured);
    });
    observer.observe(svg.current);
    return () => observer.disconnect();
  }, []);

  const step = niceTick(data.reduce((max, item) => Math.max(max, item.value), 0));
  const top = step * 3;
  const ticks = [0, 1, 2, 3].map((n) => formatValue(n * step));
  const left = Math.max(36, ...ticks.map((tick) => tick.length * 7 + 12));
  // Dense series scroll rather than drawing negative-width bars or losing the 2px gap.
  const minWidth = Math.max(180, left + 8 + data.length * 3);
  const canvasWidth = Math.max(width, minWidth);
  const baseline = 168;
  const plot = canvasWidth - left - 8;
  const cell = plot / Math.max(1, data.length);
  // Thin marks: a sparse series keeps a fixed bar width centred in its cell instead of filling the row.
  const barWidth = Math.min(cell - 2, MAX_BAR);
  const labelWidth = Math.max(52, ...data.map((item) => formatLabel(item.label).length * 7 + 12));
  const stride = Math.max(1, Math.ceil(labelWidth / cell));
  const table = showTableToggle && view === "table";
  const active = table ? null : hover ?? focus;
  const item = active === null ? undefined : data[active];
  const describeItem = (entry: BarChartItem) => describe?.(entry) ?? `${entry.label}: ${formatValue(entry.value)}`;
  const tooltip = usePresence(Boolean(item));
  const shown = useLatest(item && active !== null ? {
    text: describeItem(item),
    x: left + active * cell + cell / 2,
    y: baseline - Math.max(0, item.value / top * 144),
  } : null);

  return (
    <figure className="trm-chart">
      <figcaption className="trm-chart-heading">
        <span>{title}</span>
        {showTableToggle ? (
          <SegmentControl
            compact
            value={view}
            onChange={(next) => { setView(next); setHover(null); setFocus(null); }}
            options={[
              { id: "chart", label: t("ui.chart.chart") },
              { id: "table", label: t("ui.chart.table") },
            ]}
          />
        ) : null}
      </figcaption>
      <div className="trm-chart-scroll" hidden={table}>
        <div className="trm-chart-plot" style={{ minWidth }}>
          <svg ref={svg} viewBox={`0 0 ${canvasWidth} 200`} height={200} aria-label={title} role="group">
            {ticks.map((tick, n) => (
              <g key={n} className="trm-chart-grid" aria-hidden="true">
                <line x1={left} x2={canvasWidth - 8} y1={baseline - n * 48} y2={baseline - n * 48} />
                <text x={left - 6} y={baseline - n * 48 + 4} textAnchor="end">{tick}</text>
              </g>
            ))}
            {data.map((entry, index) => {
              const h = Math.max(0, entry.value / top * 144);
              const x = left + index * cell + (cell - barWidth) / 2;
              const y = baseline - h;
              const r = Math.min(4, h, barWidth / 2);
              return (
                <g
                  key={index}
                  tabIndex={0}
                  role="img"
                  aria-label={describeItem(entry)}
                  aria-describedby={active === index ? id : undefined}
                  onMouseEnter={() => setHover(index)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setFocus(index)}
                  onBlur={() => setFocus(null)}
                  className="trm-chart-bar"
                >
                  <rect x={left + index * cell} y={24} width={cell} height={144} fillOpacity={0} />
                  <path d={[
                    `M${x},${baseline} V${y + r} Q${x},${y} ${x + r},${y}`,
                    `H${x + barWidth - r} Q${x + barWidth},${y} ${x + barWidth},${y + r} V${baseline} Z`,
                  ].join(" ")} />
                  {index % stride === 0 ? (
                    <text x={x + barWidth / 2} y={190} textAnchor="middle" aria-hidden="true">
                      {formatLabel(entry.label)}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
          {tooltip.mounted && shown ? (
            <div
              className={`trm-chart-tooltip ${tooltip.leaving ? "tooltip-out" : "tooltip-in"}`}
              role="tooltip"
              id={id}
              style={{
                left: `${shown.x / canvasWidth * 100}%`,
                // Matching the anchor fraction keeps edge tooltips inside the scroll viewport.
                translate: `${-shown.x / canvasWidth * 100}% 0`,
                top: Math.max(0, shown.y - 34),
              }}
            >
              {shown.text}
            </div>
          ) : null}
        </div>
      </div>
      {table ? (
        <DataTable
          rows={data.map((entry, index) => ({ ...entry, index }))}
          keyOf={(entry) => entry.index}
          label={title}
          columns={[
            { key: "label", label: t("ui.chart.label"), render: (entry) => entry.label },
            { key: "value", label: t("ui.chart.value"), render: (entry) => formatValue(entry.value), align: "end" },
          ]}
        />
      ) : null}
    </figure>
  );
}
