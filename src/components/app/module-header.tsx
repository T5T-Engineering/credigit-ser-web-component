"use client";

import type { ComponentProps, ElementType, ReactNode } from "react";

import { Badge, type BadgeProps } from "../basic/badge";
import type { Tone } from "../basic/tone";
import { cx } from "../../utils/cx";
import { focusRing, labelText } from "./app-utils";

/** Props for `PhaseBadge`. */
export type PhaseBadgeProps = Omit<BadgeProps, "tone" | "children"> & {
  /** Delivery phase (1, 2, 3 …). */
  phase: number | string;
  /** Override the visible label. Default "Phase {phase}". */
  label?: ReactNode;
  /** Override the tone. Default: 1 → accent, 2 → info, 3+ → neutral. */
  tone?: Tone;
};

const phaseTone = (phase: number | string): Tone => {
  const n = Number(phase);
  if (n === 1) return "accent";
  if (n === 2) return "info";
  return "neutral";
};

/** Pill showing the delivery phase of a module or feature ("Phase 1"). */
export function PhaseBadge({ phase, label, tone, title, ...props }: PhaseBadgeProps) {
  return (
    <Badge tone={tone ?? phaseTone(phase)} title={title ?? `Delivery phase ${phase}`} {...props}>
      {label ?? `Phase ${phase}`}
    </Badge>
  );
}

/** A page-level tab of a module (usually a route). */
export type ModuleTab = {
  id: string;
  label: ReactNode;
  /** Route; renders a link. Without it a button calls `onTabChange`. */
  href?: string;
  icon?: ReactNode;
  /** Count or short label. */
  badge?: ReactNode;
  disabled?: boolean;
};

/** Props for `ModuleHeader`. */
export type ModuleHeaderProps = Omit<ComponentProps<"header">, "title"> & {
  /** Module icon (lucide element). */
  icon?: ReactNode;
  /** Small label above the title (e.g. parent module). */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Delivery phase; renders a `PhaseBadge`. */
  phase?: number | string;
  /** Extra badges next to the title (status, environment …). */
  badges?: ReactNode;
  /** Page actions (buttons). */
  actions?: ReactNode;
  /** Breadcrumb node shown above the title. */
  breadcrumb?: ReactNode;
  /** Module sub-navigation. */
  tabs?: ModuleTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  /** Accessible name of the tab navigation. Default "Module sections". */
  tabsLabel?: string;
  /** Router link component for tab links. */
  linkComponent?: ElementType;
  /** Heading level. Default `h1`. */
  titleAs?: "h1" | "h2";
};

/** Application page header for a risk module: icon tile, title, description, phase, actions and section tabs. */
export function ModuleHeader({
  icon,
  eyebrow,
  title,
  description,
  phase,
  badges,
  actions,
  breadcrumb,
  tabs,
  activeTab,
  onTabChange,
  tabsLabel = "Module sections",
  linkComponent,
  titleAs: Title = "h1",
  className,
  ...props
}: ModuleHeaderProps) {
  const Link = linkComponent ?? "a";
  return (
    <header className={cx("flex flex-col gap-5", className)} {...props}>
      {breadcrumb ? <div>{breadcrumb}</div> : null}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {icon ? (
            <span
              aria-hidden="true"
              className="squircle grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-tint text-accent-text [&>svg]:size-6"
            >
              {icon}
            </span>
          ) : null}
          <div className="flex min-w-0 flex-col gap-1.5">
            {eyebrow ? <p className={cx(labelText, "text-accent-text")}>{eyebrow}</p> : null}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <Title className="font-display text-[1.75rem] leading-[1.15] font-bold tracking-[-0.015em] text-balance text-fg sm:text-title">
                {title}
              </Title>
              {phase !== undefined ? <PhaseBadge phase={phase} /> : null}
              {badges}
            </div>
            {description ? <div className="max-w-3xl text-base leading-6 text-pretty text-fg-muted">{description}</div> : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">{actions}</div> : null}
      </div>
      {tabs && tabs.length > 0 ? (
        <nav aria-label={tabsLabel} className="-mx-1 overflow-x-auto px-1 pb-1">
          <ul className="squircle inline-flex gap-1 rounded-full bg-fg/5 p-1">
            {tabs.map((tab) => {
              const active = tab.id === activeTab;
              const cls = cx(
                "squircle inline-flex h-control-md shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold no-underline transition-colors duration-150 ease-bolt",
                focusRing,
                tab.disabled && "pointer-events-none opacity-40",
                active ? "bg-emphasis text-on-emphasis" : "text-fg-muted hover:bg-fg/5 hover:text-fg",
              );
              const inner = (
                <>
                  {tab.icon ? (
                    <span aria-hidden="true" className="inline-flex [&>svg]:size-4">
                      {tab.icon}
                    </span>
                  ) : null}
                  {tab.label}
                  {tab.badge !== undefined ? (
                    <span
                      className={cx(
                        "rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                        active ? "bg-on-emphasis/15 text-on-emphasis" : "bg-fg/10 text-fg-muted",
                      )}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </>
              );
              return (
                <li key={tab.id}>
                  {tab.href && !tab.disabled ? (
                    <Link href={tab.href} aria-current={active ? "page" : undefined} className={cls} onClick={() => onTabChange?.(tab.id)}>
                      {inner}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      aria-current={active ? "page" : undefined}
                      disabled={tab.disabled}
                      onClick={() => onTabChange?.(tab.id)}
                      className={cx(cls, "cursor-pointer")}
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
