"use client";

import type { ComponentProps, ReactNode } from "react";
import { Monitor, Plus, Smartphone } from "lucide-react";

import { IconButton } from "../basic/icon-button";
import { SegmentedControl } from "../basic/segmented-control";
import { useControllableState } from "../forms/field-context";
import { CopyToClipboard } from "../utilities/copy-to-clipboard";
import { cx } from "../../utils/cx";
import { labelText } from "./ops-utils";

/** Preview width preset. */
export type TemplatePreviewDevice = "desktop" | "mobile";

/**
 * Content-Security-Policy injected into the preview document (defence in depth on top of `sandbox=""`):
 * no scripts, plugins, frames, forms or network fetches; inline styles and https / data images and fonts allowed.
 */
export const templatePreviewCsp =
  "default-src 'none'; script-src 'none'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'; connect-src 'none'; style-src 'unsafe-inline' https:; img-src https: data: cid:; font-src https: data:";

/** Prepend the preview CSP `<meta>` to an HTML document or fragment. */
export function withPreviewCsp(html: string, csp: string = templatePreviewCsp): string {
  const meta = `<meta http-equiv="Content-Security-Policy" content="${csp.replace(/"/g, "&quot;")}">`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => `${m}${meta}`);
  return `<!doctype html><html><head><meta charset="utf-8">${meta}</head><body>${html}</body></html>`;
}

/** Props for `HtmlTemplatePreview`. */
export type HtmlTemplatePreviewProps = Omit<ComponentProps<"div">, "children"> & {
  /** Rendered HTML of the email / notification (variables already substituted). */
  html: string;
  /** Subject line shown above the frame. */
  subject?: ReactNode;
  /** Optional sender / recipient lines shown with the subject. */
  from?: ReactNode;
  to?: ReactNode;
  /** Preheader / preview text. */
  preheader?: ReactNode;
  device?: TemplatePreviewDevice;
  defaultDevice?: TemplatePreviewDevice;
  onDeviceChange?: (device: TemplatePreviewDevice) => void;
  /** Show the desktop / mobile toggle (default true). */
  showDeviceToggle?: boolean;
  /** Frame width per device in px (default desktop 720, mobile 375). The frame never exceeds its container. */
  widths?: Partial<Record<TemplatePreviewDevice, number>>;
  /** Frame height per device in px (fixed, no script access needed; default desktop 640, mobile 667). */
  heights?: Partial<Record<TemplatePreviewDevice, number>>;
  /** Accessible title of the iframe. Default "Template preview". */
  frameTitle?: string;
  /** Inject `templatePreviewCsp` into the document (default true). */
  injectCsp?: boolean;
  labels?: Partial<{ subject: string; from: string; to: string; preheader: string; desktop: string; mobile: string; device: string }>;
};

const defaultWidths: Record<TemplatePreviewDevice, number> = { desktop: 720, mobile: 375 };
const defaultHeights: Record<TemplatePreviewDevice, number> = { desktop: 640, mobile: 667 };

/**
 * Safe preview of an HTML email / notification: rendered in a fully sandboxed iframe (`sandbox=""`,
 * `srcDoc`, no scripts, no same-origin, injected CSP), with a desktop / mobile width toggle, fixed
 * heights (the frame scrolls) and the subject line above a light frame.
 */
export function HtmlTemplatePreview({
  html,
  subject,
  from,
  to,
  preheader,
  device: deviceProp,
  defaultDevice = "desktop",
  onDeviceChange,
  showDeviceToggle = true,
  widths,
  heights,
  frameTitle = "Template preview",
  injectCsp = true,
  labels,
  className,
  ...props
}: HtmlTemplatePreviewProps) {
  const l = { subject: "Subject", from: "From", to: "To", preheader: "Preview text", desktop: "Desktop", mobile: "Mobile", device: "Preview width", ...labels };
  const [device, setDevice] = useControllableState(deviceProp, defaultDevice, onDeviceChange);
  const width = { ...defaultWidths, ...widths }[device];
  const height = { ...defaultHeights, ...heights }[device];
  const doc = injectCsp ? withPreviewCsp(html) : html;

  return (
    <div className={cx("flex min-w-0 flex-col gap-3", className)} {...props}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <dl className="flex min-w-0 flex-1 flex-col gap-1">
          {subject !== undefined ? (
            <div className="flex min-w-0 items-baseline gap-2">
              <dt className={cx(labelText, "shrink-0 text-fg-muted")}>{l.subject}</dt>
              <dd className="min-w-0 font-display text-base leading-snug font-bold break-words text-fg" data-testid="template-subject">
                {subject}
              </dd>
            </div>
          ) : null}
          {from ? (
            <div className="flex items-baseline gap-2 text-sm">
              <dt className={cx(labelText, "shrink-0 text-fg-muted")}>{l.from}</dt>
              <dd className="min-w-0 text-fg-muted">{from}</dd>
            </div>
          ) : null}
          {to ? (
            <div className="flex items-baseline gap-2 text-sm">
              <dt className={cx(labelText, "shrink-0 text-fg-muted")}>{l.to}</dt>
              <dd className="min-w-0 text-fg-muted">{to}</dd>
            </div>
          ) : null}
          {preheader ? (
            <div className="text-sm">
              <dt className="sr-only">{l.preheader}</dt>
              <dd className="text-fg-subtle">{preheader}</dd>
            </div>
          ) : null}
        </dl>
        {showDeviceToggle ? (
          <SegmentedControl
            size="small"
            label={l.device}
            value={device}
            onChange={setDevice}
            options={[
              { value: "desktop", label: l.desktop, icon: <Monitor aria-hidden="true" className="size-3.5" /> },
              { value: "mobile", label: l.mobile, icon: <Smartphone aria-hidden="true" className="size-3.5" /> },
            ]}
          />
        ) : null}
      </div>
      {/* Light frame: the email always renders on a light canvas, whatever the app theme. */}
      <div data-cg-theme="light" className="squircle flex justify-center overflow-x-auto rounded-3xl bg-surface-sunken p-3 sm:p-5">
        <iframe
          title={frameTitle}
          sandbox=""
          srcDoc={doc}
          referrerPolicy="no-referrer"
          loading="lazy"
          data-device={device}
          style={{ width, height, maxWidth: "100%" }}
          className="squircle block shrink-0 rounded-2xl border-0 bg-surface shadow-sm transition-[width] duration-200 ease-bolt"
        />
      </div>
    </div>
  );
}

/** A template variable. */
export type TemplateVariable = { name: string; description?: ReactNode; example?: ReactNode; required?: boolean };

/** Props for `TemplateVariableList`. */
export type TemplateVariableListProps = Omit<ComponentProps<"ul">, "children"> & {
  variables: TemplateVariable[];
  /** Token syntax (default `{{name}}`). */
  formatToken?: (name: string) => string;
  /** Adds an "Insert" button per variable (e.g. insert at the editor caret). */
  onInsert?: (token: string, variable: TemplateVariable) => void;
  labels?: Partial<{ copy: (token: string) => string; insert: (token: string) => string; example: string; required: string }>;
};

/** List of template variables (mono `{{name}}` token, description, example) with copy-to-clipboard and optional insert. */
export function TemplateVariableList({ variables, formatToken = (n) => `{{${n}}}`, onInsert, labels, className, ...props }: TemplateVariableListProps) {
  const l = {
    copy: (t: string) => `Copy ${t}`,
    insert: (t: string) => `Insert ${t}`,
    example: "e.g.",
    required: "Required",
    ...labels,
  };
  return (
    <ul className={cx("flex flex-col divide-y divide-line", className)} {...props}>
      {variables.map((v) => {
        const token = formatToken(v.name);
        return (
          <li key={v.name} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex flex-wrap items-center gap-2">
                <code className="squircle rounded-lg bg-fg/5 px-2 py-0.5 font-code text-xs break-all text-fg">{token}</code>
                {v.required ? <span className={cx(labelText, "text-[10px] text-fg-muted")}>{l.required}</span> : null}
              </span>
              {v.description ? <p className="text-sm leading-5 text-fg-muted">{v.description}</p> : null}
              {v.example !== undefined ? (
                <p className="text-xs text-fg-subtle">
                  {l.example} <span className="font-mono text-fg-muted">{v.example}</span>
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {onInsert ? <IconButton size="small" variant="text" label={l.insert(token)} icon={<Plus className="size-4" />} onClick={() => onInsert(token, v)} /> : null}
              <CopyToClipboard value={token} label={l.copy(token)} iconOnly />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
