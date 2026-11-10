"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { toneStyles, type Tone } from "../basic/tone";
import { chartToneColor, defaultFormatter, legendChipClass, legendDotClass } from "../data-viz/chart-utils";

/** A row or column of the matrix. */
export type MatrixAxisItem = { id: string; label: string; description?: string };

/** One cell, addressed by row and column id. */
export type MatrixCell = {
  row: string;
  column: string;
  /** Numeric value (drives value-scale colouring and the default label). */
  value?: number;
  /** Visible content; defaults to the formatted value. */
  label?: ReactNode;
  /** Explicit tone (tone colouring). */
  tone?: Tone;
  /** Extra text for the accessible name / tooltip, e.g. the interpretation of a RAR cell. */
  description?: string;
  disabled?: boolean;
};

/** Value band → tone (like Gauge bands): a value ≤ `to` gets `tone`. */
export type MatrixThreshold = { to: number; tone: Tone; label?: string };

/** Props for {@link Matrix}. */
export type MatrixProps = Omit<ComponentProps<"div">, "children"> & {
  rows: MatrixAxisItem[];
  columns: MatrixAxisItem[];
  cells: MatrixCell[];
  /** Accessible name / caption. */
  label: string;
  /** Show the caption visibly. Default false. */
  showCaption?: boolean;
  /** `tone`: cell.tone / thresholds; `value`: continuous scale. Default: `tone` when any cell has a tone or thresholds are given. */
  colorBy?: "tone" | "value";
  /** Value bands mapping values to tones (heat maps: low/medium/high). */
  thresholds?: MatrixThreshold[];
  /** Continuous scale settings for `colorBy="value"`. Min/max default to the data range. */
  scale?: { min?: number; max?: number; tone?: Tone };
  /** Fill style for tone cells. Default `soft`. */
  cellVariant?: "soft" | "solid";
  valueFormatter?: (value: number) => string;
  /** Print labels/values in cells. Default true. */
  showValues?: boolean;
  /** Corner header text (e.g. "Score band / Pillar"). */
  corner?: ReactNode;
  /** Axis titles shown above the columns / beside the rows. */
  columnAxisLabel?: ReactNode;
  rowAxisLabel?: ReactNode;
  onCellClick?: (cell: MatrixCell) => void;
  /** Highlighted cell. */
  selected?: { row: string; column: string } | null;
  /** Legend: `true` = automatic (thresholds or scale), array = custom, `false` = none. Default true. */
  legend?: boolean | { label: string; tone: Tone }[];
  /** Cell height. Default `medium`. */
  cellSize?: "small" | "medium" | "large";
};

const cellHeights = { small: "h-9 text-xs", medium: "h-12 text-sm", large: "h-16 text-base" } as const;

/** Tone for a value from ordered thresholds (last band catches the rest). */
export function toneForValue(value: number, thresholds: MatrixThreshold[]): Tone | undefined {
  if (thresholds.length === 0) return undefined;
  const sorted = [...thresholds].sort((a, b) => a.to - b.to);
  return (sorted.find((t) => value <= t.to) ?? sorted[sorted.length - 1])?.tone;
}

/** Labelled rows × columns grid (a real table) coloured by tone or a value scale; cells can be clickable. Used for risk heat maps, the 360 RAR interpretive layer and concentration grids. */
export function Matrix({
  rows,
  columns,
  cells,
  label,
  showCaption = false,
  colorBy,
  thresholds = [],
  scale = {},
  cellVariant = "soft",
  valueFormatter = defaultFormatter,
  showValues = true,
  corner,
  columnAxisLabel,
  rowAxisLabel,
  onCellClick,
  selected,
  legend = true,
  cellSize = "medium",
  className,
  ...props
}: MatrixProps) {
  const lookup = new Map(cells.map((c) => [`${c.row}\u0000${c.column}`, c]));
  const mode = colorBy ?? (thresholds.length > 0 || cells.some((c) => c.tone) ? "tone" : "value");
  const values = cells.map((c) => c.value).filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  const min = scale.min ?? (values.length ? Math.min(...values) : 0);
  const max = scale.max ?? (values.length ? Math.max(...values) : 1);
  const scaleColor = chartToneColor[scale.tone ?? "accent"];

  const cellLook = (cell: MatrixCell | undefined): { className: string; style?: CSSProperties } => {
    if (!cell) return { className: "bg-fg/[0.03] text-fg-subtle" };
    if (mode === "tone") {
      const tone = cell.tone ?? (cell.value !== undefined ? toneForValue(cell.value, thresholds) : undefined);
      return { className: tone ? toneStyles[tone][cellVariant] : "bg-fg/5 text-fg" };
    }
    if (cell.value === undefined) return { className: "bg-fg/5 text-fg-muted" };
    const t = max === min ? 1 : Math.min(1, Math.max(0, (cell.value - min) / (max - min)));
    // Capped at 62% so foreground text keeps ≥ 4.5:1 contrast on every step (light and dark surfaces).
    const pct = Math.round(6 + t * 56);
    return {
      className: "text-fg",
      style: { backgroundColor: `color-mix(in oklab, ${scaleColor} ${pct}%, var(--cg-surface))` },
    };
  };

  const legendItems: { label: string; tone?: Tone }[] = Array.isArray(legend)
    ? legend
    : legend && mode === "tone" && thresholds.length > 0
      ? [...thresholds]
          .sort((a, b) => a.to - b.to)
          .map((t, i, arr) => ({
            tone: t.tone,
            label: t.label ?? (i === 0 ? `≤ ${valueFormatter(t.to)}` : `${valueFormatter(arr[i - 1]!.to)} – ${valueFormatter(t.to)}`),
          }))
      : [];
  const showScaleLegend = legend === true && mode === "value" && values.length > 0;

  return (
    <div className={cx("flex w-full flex-col gap-3", className)} {...props}>
      {showCaption ? (
        <div aria-hidden="true" className="font-display text-subtitle font-bold tracking-tight text-fg">
          {label}
        </div>
      ) : null}
      {columnAxisLabel ? (
        <div className="ps-32 text-center font-mono text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">{columnAxisLabel}</div>
      ) : null}
      <div className="flex items-stretch gap-2">
        {rowAxisLabel ? (
          <div className="flex shrink-0 items-center font-mono text-xs font-medium uppercase tracking-[0.08em] text-fg-muted [writing-mode:vertical-rl] rotate-180">
            {rowAxisLabel}
          </div>
        ) : null}
        <div className="squircle min-w-0 flex-1 overflow-x-auto rounded-2xl">
          <table className="w-full border-separate border-spacing-1 text-fg">
            <caption className="sr-only">{label}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-32 px-2 text-start align-bottom font-mono text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">
                  {corner ?? <span className="sr-only">Row</span>}
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    title={col.description}
                    className="min-w-16 px-1 pb-1 text-center align-bottom text-xs font-semibold text-fg"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row" title={row.description} className="px-2 text-start text-sm font-semibold whitespace-nowrap text-fg">
                    {row.label}
                  </th>
                  {columns.map((col) => {
                    const cell = lookup.get(`${row.id}\u0000${col.id}`);
                    const look = cellLook(cell);
                    const text = cell?.label ?? (cell?.value !== undefined ? valueFormatter(cell.value) : "");
                    const isSelected = selected?.row === row.id && selected?.column === col.id;
                    const name = `${row.label}, ${col.label}: ${cell?.value !== undefined ? valueFormatter(cell.value) : typeof cell?.label === "string" ? cell.label : "no value"}${cell?.description ? `. ${cell.description}` : ""}`;
                    const boxClass = cx(
                      "squircle flex w-full items-center justify-center rounded-xl px-2 font-mono font-semibold tabular-nums transition-[box-shadow,transform] duration-150 ease-bolt",
                      cellHeights[cellSize],
                      look.className,
                      isSelected && "ring-2 ring-fg ring-offset-2 ring-offset-surface",
                    );
                    return (
                      <td key={col.id} className="p-0" data-row={row.id} data-column={col.id} data-value={cell?.value}>
                        {onCellClick && cell && !cell.disabled ? (
                          <button
                            type="button"
                            aria-label={name}
                            aria-pressed={selected !== undefined ? isSelected : undefined}
                            title={cell.description}
                            onClick={() => onCellClick(cell)}
                            className={cx(boxClass, "cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus")}
                            style={look.style}
                          >
                            {showValues ? <span aria-hidden="true">{text}</span> : null}
                          </button>
                        ) : (
                          <div className={boxClass} style={look.style} title={cell?.description}>
                            {showValues ? text : null}
                            {cell?.description ? <span className="sr-only">. {cell.description}</span> : null}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {legendItems.length > 0 ? (
        <ul aria-label="Legend" className="m-0 flex list-none flex-wrap gap-2 p-0">
          {legendItems.map((item) => (
            <li key={item.label} className={legendChipClass}>
              <span className={legendDotClass} style={{ backgroundColor: item.tone ? chartToneColor[item.tone] : undefined }} />
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
      {showScaleLegend ? (
        <div className="flex items-center gap-3 text-xs text-fg-muted" aria-label={`Scale from ${valueFormatter(min)} to ${valueFormatter(max)}`} role="img">
          <span className="font-mono tabular-nums">{valueFormatter(min)}</span>
          <span
            className="h-2.5 w-40 rounded-full"
            style={{ backgroundImage: `linear-gradient(to right, color-mix(in oklab, ${scaleColor} 6%, var(--cg-surface)), color-mix(in oklab, ${scaleColor} 62%, var(--cg-surface)))` }}
          />
          <span className="font-mono tabular-nums">{valueFormatter(max)}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Alias of {@link Matrix} for value-scale heat maps (pass `colorBy="value"` or thresholds). */
export const HeatmapGrid = Matrix;
/** Props for {@link HeatmapGrid}. */
export type HeatmapGridProps = MatrixProps;
