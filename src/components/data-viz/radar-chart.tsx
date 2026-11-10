import { useId, type ComponentProps } from "react";

import { cx } from "../../utils/cx";
import { clamp, defaultFormatter, gridColor, legendChipClass, legendDotClass, round, svgId } from "./chart-utils";

/** One spoke of the radar, e.g. a 360 RAR cardinal point. */
export type RadarAxis = { key: string; label: string };

/** Colour of a radar series. */
export type RadarTone = "accent" | "primary" | "neutral";

/** A scored entity plotted on the radar (obligor, sector, benchmark …). */
export type RadarSeries = { name: string; values: Record<string, number>; tone?: RadarTone };

/** Props for {@link RadarChart}. */
export type RadarChartProps = Omit<ComponentProps<"figure">, "children"> & {
  axes: RadarAxis[];
  series: RadarSeries[];
  /** Value at the outer ring. Default 100. */
  max?: number;
  /** Number of concentric grid rings. Default 5. */
  levels?: number;
  /** Diameter of the radar in viewBox units (the chart scales to its container). Default 320. */
  size?: number;
  showLegend?: boolean;
  /** Print each vertex value next to its point. */
  showValues?: boolean;
  /** Show the ring values along the first axis. Default true. */
  showLevelLabels?: boolean;
  /** Accessible name. Defaults to a summary of series and axes. */
  label?: string;
  valueFormatter?: (value: number) => string;
};

const toneColor: Record<RadarTone, string> = {
  accent: "var(--cg-accent-500)",
  primary: "var(--cg-emphasis)",
  neutral: "var(--cg-fg-subtle)",
};
const defaultTones: RadarTone[] = ["accent", "primary", "neutral"];

/** Angle (radians) of axis `index` of `count`, starting at 12 o'clock and going clockwise. */
export function radarAngle(index: number, count: number): number {
  return -Math.PI / 2 + (2 * Math.PI * index) / count;
}

/**
 * Position of a value on a radar axis. Values are clamped to [0, max].
 * Exported for tests and for consumers who overlay annotations.
 */
export function radarPoint(
  index: number,
  count: number,
  value: number,
  max: number,
  radius: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const ratio = max > 0 ? clamp(value / max, 0, 1) : 0;
  const angle = radarAngle(index, count);
  return { x: round(cx + radius * ratio * Math.cos(angle)), y: round(cy + radius * ratio * Math.sin(angle)) };
}

/** Split a label into at most two lines of roughly `width` characters. */
function wrapLabel(text: string, width = 16): string[] {
  if (text.length <= width) return [text];
  // Break on spaces and after hyphens ("Macro-Economic" → "Macro-" / "Economic").
  const words = text.split(/\s+/).flatMap((w) => (w.length > width ? w.split(/(?<=-)/) : [w]));
  const lines: string[] = [""];
  for (const word of words) {
    const current = lines[lines.length - 1] ?? "";
    if (current && (current + " " + word).length > width && lines.length < 3) lines.push(word);
    else lines[lines.length - 1] = current ? (current.endsWith("-") ? current + word : `${current} ${word}`) : word;
  }
  return lines;
}

/**
 * Radar (spider) chart — the visual of the 360° Risk Assessment Radar (360 RAR).
 * Pure SVG; every colour is a CSS variable so it follows runtime brand changes.
 */
export function RadarChart({
  axes,
  series,
  max = 100,
  levels = 5,
  size = 320,
  showLegend = true,
  showValues = false,
  showLevelLabels = true,
  label,
  valueFormatter = defaultFormatter,
  className,
  ...props
}: RadarChartProps) {
  const uid = svgId(useId());
  const count = axes.length;
  const radius = size / 2;
  const padX = size * 0.36;
  const padY = size * 0.15;
  const width = size + padX * 2;
  const height = size + padY * 2;
  const centerX = padX + radius;
  const centerY = padY + radius;
  const fontSize = round(size * 0.042);
  const smallSize = round(size * 0.032);

  const name =
    label ??
    `Radar chart of ${series.map((s) => s.name).join(", ") || "no data"} across ${count} axes: ${axes
      .map((a) => a.label)
      .join(", ")}`;

  const ring = (ratio: number) =>
    axes
      .map((_, i) => {
        const p = radarPoint(i, count, ratio * max, max, radius, centerX, centerY);
        return `${p.x},${p.y}`;
      })
      .join(" ");

  const colored = series.map((s, i) => ({ ...s, color: toneColor[s.tone ?? defaultTones[i % defaultTones.length] ?? "accent"] }));

  return (
    <figure className={cx("m-0 flex w-full flex-col items-center gap-4", className)} {...props}>
      <svg
        viewBox={`0 0 ${round(width)} ${round(height)}`}
        width="100%"
        role="img"
        aria-label={name}
        className="block h-auto max-w-full overflow-visible"
      >
        <title>{name}</title>
        <desc>
          {series
            .map((s) => `${s.name}: ${axes.map((a) => `${a.label} ${valueFormatter(s.values[a.key] ?? 0)}`).join(", ")}`)
            .join(". ")}
          {`. Scale 0 to ${valueFormatter(max)}.`}
        </desc>

        <defs>
          {colored.map((s, i) => (
            <radialGradient key={i} id={`${uid}-fill-${i}`} cx={centerX} cy={centerY} r={radius} gradientUnits="userSpaceOnUse">
              <stop offset="0%" style={{ stopColor: s.color, stopOpacity: 0.08 }} />
              <stop offset="100%" style={{ stopColor: s.color, stopOpacity: 0.26 }} />
            </radialGradient>
          ))}
        </defs>

        {count >= 3 && (
          <g aria-hidden="true">
            {/* Outer 360° ring */}
            <circle
              cx={centerX}
              cy={centerY}
              r={round(radius + size * 0.035)}
              fill="none"
              style={{ stroke: gridColor }}
              strokeDasharray="0.1 6"
              strokeLinecap="round"
              strokeWidth={2.5}
            />

            {/* Grid rings, outermost first so inner bands paint on top */}
            {Array.from({ length: levels }, (_, i) => levels - i).map((level) => (
              <polygon
                key={level}
                points={ring(level / levels)}
                style={{
                  stroke: gridColor,
                  fill: "var(--cg-fg)",
                  fillOpacity: level % 2 === 0 ? 0.04 : 0.015,
                }}
                strokeWidth={level === levels ? 1.5 : 1}
                strokeLinejoin="round"
              />
            ))}

            {/* Spokes */}
            {axes.map((axis, i) => {
              const end = radarPoint(i, count, max, max, radius, centerX, centerY);
              return <line key={axis.key} x1={centerX} y1={centerY} x2={end.x} y2={end.y} style={{ stroke: gridColor }} strokeWidth={1} strokeLinecap="round" />;
            })}

            {/* Ring values along the first axis */}
            {showLevelLabels &&
              Array.from({ length: levels }, (_, i) => i + 1).map((level) => {
                const p = radarPoint(0, count, (level / levels) * max, max, radius, centerX, centerY);
                return (
                  <text
                    key={level}
                    x={p.x + 5}
                    y={p.y + smallSize * 0.35}
                    fontSize={smallSize}
                    className="font-mono"
                    style={{ fill: "var(--cg-fg-subtle)" }}
                  >
                    {valueFormatter((level / levels) * max)}
                  </text>
                );
              })}

            {/* Axis labels */}
            {axes.map((axis, i) => {
              const angle = radarAngle(i, count);
              const cos = Math.cos(angle);
              const sin = Math.sin(angle);
              // Top labels sit closer to the ring so two-line labels stay inside the viewBox.
              const offset = sin < -0.5 ? size * 0.05 : size * 0.075;
              const x = round(centerX + (radius + offset) * cos);
              const y = round(centerY + (radius + offset) * sin);
              const anchor = cos > 0.25 ? "start" : cos < -0.25 ? "end" : "middle";
              const lines = wrapLabel(axis.label, anchor === "middle" ? 16 : 11);
              const lineHeight = fontSize * 1.15;
              // Vertically centre the block, or push it away from the chart at the top/bottom.
              const blockHeight = lineHeight * lines.length;
              const top =
                sin < -0.5 ? y - blockHeight + fontSize * 0.8 : sin > 0.5 ? y + fontSize * 0.8 : y - blockHeight / 2 + fontSize * 0.8;
              return (
                <text
                  key={axis.key}
                  textAnchor={anchor}
                  fontSize={fontSize}
                  fontWeight={600}
                  className="font-display"
                  style={{ fill: "var(--cg-fg)" }}
                >
                  {lines.map((line, li) => (
                    <tspan key={li} x={x} y={round(top + li * lineHeight)}>
                      {line}
                    </tspan>
                  ))}
                </text>
              );
            })}
          </g>
        )}

        {/* Series */}
        {count >= 3 &&
          colored.map((s, si) => {
            const points = axes.map((a, i) => radarPoint(i, count, s.values[a.key] ?? 0, max, radius, centerX, centerY));
            return (
              <g key={s.name} data-series={s.name} aria-hidden="true">
                <polygon
                  points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill={`url(#${uid}-fill-${si})`}
                  style={{ stroke: s.color }}
                  strokeWidth={2.75}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {points.map((p, i) => {
                  const axis = axes[i];
                  if (!axis) return null;
                  const value = s.values[axis.key] ?? 0;
                  const angle = radarAngle(i, count);
                  const lx = round(p.x + Math.cos(angle) * size * 0.04);
                  const ly = round(p.y + Math.sin(angle) * size * 0.04 + smallSize * 0.35);
                  return (
                    <g key={axis.key}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={round(size * 0.016)}
                        data-axis={axis.key}
                        data-value={value}
                        style={{ fill: s.color, stroke: "var(--cg-surface)" }}
                        strokeWidth={round(size * 0.008)}
                      />
                      {showValues && (
                        <text
                          x={lx}
                          y={ly}
                          textAnchor="middle"
                          fontSize={smallSize}
                          fontWeight={600}
                          className="font-mono"
                          style={{ fill: s.color }}
                        >
                          {valueFormatter(value)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

        {count >= 3 && <circle cx={centerX} cy={centerY} r={round(size * 0.008)} style={{ fill: "var(--cg-fg-subtle)" }} aria-hidden="true" />}
      </svg>

      {showLegend && series.length > 0 && (
        <figcaption aria-hidden="true" className="flex flex-wrap items-center justify-center gap-2">
          {colored.map((s) => (
            <span key={s.name} className={legendChipClass}>
              <span className={legendDotClass} style={{ backgroundColor: s.color }} />
              {s.name}
            </span>
          ))}
        </figcaption>
      )}

      <table className="sr-only">
        <caption>{name}</caption>
        <thead>
          <tr>
            <th scope="col">Series</th>
            {axes.map((a) => (
              <th key={a.key} scope="col">
                {a.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {series.map((s) => (
            <tr key={s.name}>
              <th scope="row">{s.name}</th>
              {axes.map((a) => (
                <td key={a.key}>{valueFormatter(s.values[a.key] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
