import { chartToneColor, type ChartReferenceLine } from "./chart-utils";

/** Internal: horizontal reference lines drawn in HTML over a plot (`topPct(value)` = distance from the top in %). */
export function ReferenceLineOverlay({
  lines,
  topPct,
  height,
}: {
  lines: ChartReferenceLine[];
  topPct: (value: number) => number;
  height: number;
}) {
  if (lines.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height }} aria-hidden="true">
      {lines.map((r, i) => {
        const top = topPct(r.value);
        if (!Number.isFinite(top) || top < -1 || top > 101) return null;
        return (
          <div key={`ref-${i}`} data-reference-line={r.value} className="absolute inset-x-0" style={{ top: `${top}%` }}>
            <span className="block h-0.5 -translate-y-1/2 rounded-full" style={{ backgroundColor: chartToneColor[r.tone ?? "neutral"] }} />
            {r.label && (
              <span className="absolute right-1 bottom-1 rounded-full bg-surface/85 px-1.5 font-mono text-xs font-medium whitespace-nowrap text-fg-muted">
                {r.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
