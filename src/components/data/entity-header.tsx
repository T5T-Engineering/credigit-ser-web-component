import { isValidElement, type ComponentProps, type ElementType, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { cx } from "../../utils/cx";
import { StatusBadge, type StatusBadgeProps } from "../basic/status-badge";
import { CopyToClipboard } from "../utilities/copy-to-clipboard";

/** A key fact shown under the title. */
export type EntityFact = { label: ReactNode; value: ReactNode; mono?: boolean };

/** Props for {@link EntityHeader}. */
export type EntityHeaderProps = Omit<ComponentProps<"header">, "title"> & {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Small label above the title (record type, e.g. "Credit application"). */
  eyebrow?: ReactNode;
  /** Record identifier, shown mono with a copy button. */
  identifier?: string;
  /** Accessible label for the identifier. Default "ID". */
  identifierLabel?: string;
  /** A ReactNode, or StatusBadge props (`{ status, tones }`). */
  status?: ReactNode | Pick<StatusBadgeProps, "status" | "tones" | "label">;
  /** Avatar, logo or icon tile before the title. */
  media?: ReactNode;
  facts?: EntityFact[];
  /** Right-aligned actions (buttons, menu). */
  actions?: ReactNode;
  /** Back link above the header. */
  back?: { href: string; label: string };
  linkComponent?: ElementType;
  /** Tabs (or segmented control) under the header. */
  tabs?: ReactNode;
  /** Heading level. Default `h1`. */
  titleAs?: "h1" | "h2" | "h3";
};

function isStatusProps(value: unknown): value is Pick<StatusBadgeProps, "status" | "tones" | "label"> {
  return typeof value === "object" && value !== null && !isValidElement(value) && "status" in value;
}

/** Header for a record page (obligor, facility, application): back link, title, ID, status, key facts, actions and tabs. */
export function EntityHeader({
  title,
  subtitle,
  eyebrow,
  identifier,
  identifierLabel = "ID",
  status,
  media,
  facts,
  actions,
  back,
  linkComponent,
  tabs,
  titleAs: Title = "h1",
  className,
  ...props
}: EntityHeaderProps) {
  const Link = linkComponent ?? "a";
  return (
    <header className={cx("flex flex-col gap-5", className)} {...props}>
      {back ? (
        <Link
          href={back.href}
          className="squircle -ms-2 inline-flex h-control-sm w-fit items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-fg-muted no-underline transition-colors duration-150 ease-bolt hover:bg-fg/5 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {media ? <div className="shrink-0">{media}</div> : null}
          <div className="flex min-w-0 flex-col gap-1.5">
            {eyebrow ? <p className="m-0 font-mono text-xs font-medium uppercase tracking-[0.08em] text-accent-text">{eyebrow}</p> : null}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Title className="m-0 font-display text-[1.75rem] leading-tight font-bold tracking-tight text-balance text-fg sm:text-title">{title}</Title>
              {isStatusProps(status) ? <StatusBadge {...status} /> : status}
            </div>
            {subtitle || identifier ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-fg-muted">
                {subtitle ? <span>{subtitle}</span> : null}
                {identifier ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="sr-only">{identifierLabel}: </span>
                    <span className="squircle rounded-full bg-fg/5 px-2.5 py-0.5 font-mono text-sm font-medium text-fg tabular-nums">{identifier}</span>
                    <CopyToClipboard value={identifier} iconOnly label={`Copy ${identifierLabel}`} />
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {facts && facts.length > 0 ? (
        <dl className="squircle m-0 flex flex-wrap gap-x-8 gap-y-3 rounded-3xl bg-surface-sunken px-5 py-4">
          {facts.map((fact, i) => (
            <div key={i} className="flex min-w-0 flex-col gap-0.5">
              <dt className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">{fact.label}</dt>
              <dd className={cx("m-0 text-base font-semibold text-fg", fact.mono && "font-mono tabular-nums")}>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {tabs ? <div>{tabs}</div> : null}
    </header>
  );
}
