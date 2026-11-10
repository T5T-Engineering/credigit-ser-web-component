"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { Avatar } from "../basic/avatar";
import { Badge } from "../basic/badge";
import type { Tone } from "../basic/tone";
import { Menu } from "../navigation/menu";
import { cx } from "../../utils/cx";
import { focusRing } from "./app-utils";

/** A tenant (institution) the user can work in. */
export type Tenant = {
  id: string;
  name: string;
  /** Logo image URL; initials are shown otherwise. */
  logoSrc?: string;
  /** Environment label, e.g. "Production", "UAT", "Sandbox". */
  environment?: string;
  /** Secondary line (licence type, region …). */
  description?: string;
};

/** Default environment → tone map (keys lower-case). */
export const defaultEnvironmentTones: Record<string, Tone> = {
  production: "success",
  prod: "success",
  live: "success",
  uat: "warning",
  staging: "warning",
  test: "warning",
  sandbox: "info",
  demo: "info",
  training: "info",
};

/** Tone for an environment label using `defaultEnvironmentTones` plus overrides. */
export function environmentTone(environment: string, overrides?: Record<string, Tone>): Tone {
  const key = environment.toLowerCase();
  return overrides?.[key] ?? overrides?.[environment] ?? defaultEnvironmentTones[key] ?? "neutral";
}

/** Props for `TenantSwitcher`. */
export type TenantSwitcherProps = {
  tenants: Tenant[];
  /** Current tenant id. */
  value: string;
  onValueChange?: (tenant: Tenant) => void;
  /** Environment → tone overrides. */
  environmentTones?: Record<string, Tone>;
  /** Accessible label prefix. Default "Switch tenant". */
  label?: string;
  /** Hide the tenant name below `md`. Default true. */
  compact?: boolean;
  className?: string;
};

function TenantMark({ tenant }: { tenant: Tenant }) {
  return <Avatar name={tenant.name} src={tenant.logoSrc} size="small" aria-hidden="true" className="rounded-xl bg-primary-100 text-primary-700" />;
}

/** Dropdown to choose the current tenant (institution), with logo/initials and environment badge. */
export function TenantSwitcher({
  tenants,
  value,
  onValueChange,
  environmentTones,
  label = "Switch tenant",
  compact = true,
  className,
}: TenantSwitcherProps) {
  const current = tenants.find((t) => t.id === value) ?? tenants[0];
  if (!current) return null;
  return (
    <Menu
      className={className}
      triggerLabel={`${label}. Current: ${current.name}${current.environment ? ` (${current.environment})` : ""}`}
      triggerClassName={cx(
        "squircle inline-flex h-11 max-w-72 cursor-pointer items-center gap-2.5 rounded-full bg-fg/5 py-1 pr-3 pl-1 text-left text-fg transition-colors duration-150 ease-bolt hover:bg-fg/10",
        focusRing,
      )}
      menuClassName="w-72"
      trigger={
        <>
          <TenantMark tenant={current} />
          <span className={cx("min-w-0 flex-col leading-tight", compact ? "hidden md:flex" : "flex")}>
            <span className="truncate text-sm font-semibold">{current.name}</span>
            {current.environment ? <span className="truncate text-xs text-fg-muted">{current.environment}</span> : null}
          </span>
          <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
        </>
      }
      items={tenants.map((tenant) => {
        const active = tenant.id === current.id;
        return {
          label: (
            <span className="flex items-center gap-3 py-1.5">
              <TenantMark tenant={tenant} />
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate font-semibold">{tenant.name}</span>
                {tenant.description ? <span className="truncate text-xs font-normal text-fg-muted">{tenant.description}</span> : null}
              </span>
              {tenant.environment ? (
                <Badge size="small" tone={environmentTone(tenant.environment, environmentTones)}>
                  {tenant.environment}
                </Badge>
              ) : null}
              {active ? (
                <>
                  <Check aria-hidden="true" className="size-4 shrink-0 text-accent-text" />
                  <span className="sr-only">(current)</span>
                </>
              ) : (
                <span aria-hidden="true" className="size-4 shrink-0" />
              )}
            </span>
          ),
          onSelect: active ? undefined : () => onValueChange?.(tenant),
        };
      })}
    />
  );
}
