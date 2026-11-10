import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";
import { chartToneColor, clamp, defaultFormatter, round, trackColor, type ChartTone } from "./chart-utils";

/** A coloured range on the gauge, ending at `to`. Bands are read in ascending `to` order. */
export type GaugeBand = { to: number; tone: ChartTone };

/** Props for {@link Gauge}. */
export type GaugeProps = Omit<ComponentProps<"figure">, "children"> & {
  value: number;
  min?: number;
  max?: number;
  bands?: GaugeBand[];
  label?: string;
  valueFormatter?: (value: number) => string;
};

const CX = 100;
const CY = 100;
const R = 78;

/** Point on the semicircle for t ∈ [0, 1] (left → right). */
function polar(t: number, r = R) {
  const theta = Math.PI * (1 - t);
  return { x: round(CX + r * Math.cos(theta)), y: round(CY - r * Math.sin(theta)) };
}

function arc(from: number, to: number, r = R): string {
  const a = polar(from, r);
  const b = polar(to, r);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y}`;
}

/** Fraction (0–1) of `value` within [min, max], clamped. Exported for tests. */
export function gaugeRatio(value: number, min = 0, max = 100): number {
  if (max <= min) return 0;
  return (clamp(value, min, max) - min) / (max - min);
}

/** Semicircular gauge (e.g. risk score, capital adequacy) with rounded caps on a soft track and optional tone bands. Values are clamped to [min, max]. */
export function Gauge({
  value,
  min = 0,
  max = 100,
  bands,
  label,
  valueFormatter = defaultFormatter,
  className,
  ...props
}: GaugeProps) {
  const clamped = clamp(value, min, Math.max(min, max));
  const t = gaugeRatio(value, min, max);
  const sorted = [...(bands ?? [])].sort((a, b) => a.to - b.to);
  const active = sorted.find((b) => clamped <= b.to) ?? sorted[sorted.length - 1];
  const color = active ? chartToneColor[active.tone] : "var(--cg-accent-500)";
  const formatted = valueFormatter(clamped);
  const name = `${label ?? "Gauge"}: ${formatted} (range ${valueFormatter(min)} to ${valueFormatter(max)})`;
  const marker = polar(t, R);

  let prev = min;
  const bandArcs = sorted.map((b) => {
    const from = gaugeRatio(prev, min, max);
    const to = gaugeRatio(b.to, min, max);
    prev = b.to;
    return { from, to, color: chartToneColor[b.tone] };
  });

  return (
    <figure className={cx("m-0 w-full max-w-72", className)} data-value={clamped} {...props}>
      <svg viewBox="0 0 200 124" width="100%" role="img" aria-label={name} className="block h-auto">
        <title>{name}</title>
        <path d={arc(0, 1)} fill="none" style={{ stroke: trackColor }} strokeWidth={16} strokeLinecap="round" />
        {bandArcs.map((b, i) =>
          b.to > b.from ? (
            <path
              key={i}
              d={arc(b.from, b.to, R + 15)}
              fill="none"
              style={{ stroke: b.color, strokeOpacity: 0.5 }}
              strokeWidth={4}
              strokeLinecap="round"
            />
          ) : null,
        )}
        {t > 0 && <path d={arc(0, t)} fill="none" style={{ stroke: color }} strokeWidth={16} strokeLinecap="round" />}
        <circle cx={marker.x} cy={marker.y} r={10} style={{ fill: color, stroke: "var(--cg-surface)" }} strokeWidth={4} />
        <text
          x={CX}
          y={CY - 14}
          textAnchor="middle"
          fontSize={32}
          fontWeight={600}
          className="font-mono"
          style={{ fill: "var(--cg-fg)" }}
          aria-hidden="true"
        >
          {formatted}
        </text>
        <text x={CX - R} y={CY + 22} textAnchor="middle" fontSize={12} className="font-mono" style={{ fill: "var(--cg-fg-muted)" }} aria-hidden="true">
          {valueFormatter(min)}
        </text>
        <text x={CX + R} y={CY + 22} textAnchor="middle" fontSize={12} className="font-mono" style={{ fill: "var(--cg-fg-muted)" }} aria-hidden="true">
          {valueFormatter(max)}
        </text>
      </svg>
      {label && (
        <figcaption className="mt-1 text-center text-sm font-medium text-fg-muted" aria-hidden="true">
          {label}
        </figcaption>
      )}
    </figure>
  );
}
