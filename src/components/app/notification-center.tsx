"use client";

import { useCallback, useEffect, useId, useRef, useState, type ElementType, type ReactNode } from "react";
import { Bell, BellOff, CheckCheck, CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

import { Drawer } from "../blocks/drawer";
import { cx } from "../../utils/cx";
import { chromeButton, focusRing, toneTile } from "./app-utils";

/** Severity of an in-app notification. */
export type AppNotificationTone = "neutral" | "info" | "success" | "warning" | "danger";

/** One in-app notification. */
export type AppNotification = {
  id: string;
  title: ReactNode;
  body?: ReactNode;
  /** Pre-formatted time, e.g. "5 min ago" or a `<time>` element. */
  time?: ReactNode;
  tone?: AppNotificationTone;
  read?: boolean;
  /** Target route; the item renders as a link. */
  href?: string;
  /** Category id used by filter tabs (e.g. "approvals", "alerts"). */
  category?: string;
};

/** A filter tab. `id: "all"` and `id: "unread"` are built in; other ids match `category`. */
export type NotificationFilter = { id: string; label: string };

const toneIcon: Record<AppNotificationTone, typeof Bell> = {
  neutral: Bell,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

/** Props for `NotificationList` (the panel content, also usable on a full page). */
export type NotificationListProps = {
  notifications: AppNotification[];
  /** Mark one notification read (called when it is opened). */
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  /** Called when a notification is activated. */
  onNotificationClick?: (notification: AppNotification) => void;
  /** Filter tabs. Default All + Unread. */
  filters?: NotificationFilter[];
  /** Panel heading. Default "Notifications". */
  title?: ReactNode;
  /** Text when the filtered list is empty. */
  emptyMessage?: ReactNode;
  /** Footer (e.g. "View all" link). */
  footer?: ReactNode;
  linkComponent?: ElementType;
  /** Hide the internal heading (when the container has one). */
  hideTitle?: boolean;
  className?: string;
};

const defaultFilters: NotificationFilter[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
];

/** Notification list with filter tabs and "Mark all read". */
export function NotificationList({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNotificationClick,
  filters = defaultFilters,
  title = "Notifications",
  emptyMessage = "You're all caught up.",
  footer,
  linkComponent,
  hideTitle = false,
  className,
}: NotificationListProps) {
  const Link = linkComponent ?? "a";
  const [filter, setFilter] = useState(filters[0]?.id ?? "all");
  const headingId = useId();
  const unread = notifications.filter((n) => !n.read).length;
  const visible = notifications.filter((n) =>
    filter === "all" ? true : filter === "unread" ? !n.read : n.category === filter,
  );

  const activate = (n: AppNotification) => {
    if (!n.read) onMarkRead?.(n.id);
    onNotificationClick?.(n);
  };

  return (
    <section aria-labelledby={hideTitle ? undefined : headingId} aria-label={hideTitle ? "Notifications" : undefined} className={cx("flex min-h-0 flex-col", className)}>
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        {hideTitle ? <span /> : (
          <h2 id={headingId} className="font-display text-lg font-bold tracking-tight text-fg">
            {title}
            {unread > 0 ? <span className="ml-2 font-mono text-sm font-medium text-fg-muted">{unread} unread</span> : null}
          </h2>
        )}
        {onMarkAllRead ? (
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unread === 0}
            className={cx(
              "squircle inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-fg transition-colors hover:bg-fg/5 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent",
              focusRing,
            )}
          >
            <CheckCheck aria-hidden="true" className="size-4" />
            Mark all read
          </button>
        ) : null}
      </div>
      {filters.length > 1 ? (
        <div role="group" aria-label="Filter notifications" className="flex gap-1 overflow-x-auto px-4 pb-3">
          {filters.map((f) => {
            const active = f.id === filter;
            const count = f.id === "unread" ? unread : f.id === "all" ? undefined : notifications.filter((n) => n.category === f.id && !n.read).length || undefined;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.id)}
                className={cx(
                  "squircle inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors",
                  focusRing,
                  active ? "bg-emphasis text-on-emphasis" : "bg-fg/5 text-fg-muted hover:bg-fg/10 hover:text-fg",
                )}
              >
                {f.label}
                {count ? <span className="font-mono text-xs">{count}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-fg-muted">
          <BellOff aria-hidden="true" className="size-6 text-fg-subtle" />
          {emptyMessage}
        </div>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {visible.map((n) => {
            const tone = n.tone ?? "neutral";
            const Icon = toneIcon[tone];
            const inner = (
              <>
                <span aria-hidden="true" className={cx("squircle mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl", toneTile[tone])}>
                  <Icon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className={cx("text-sm leading-5 text-fg", n.read ? "font-medium" : "font-bold")}>
                    {!n.read ? <span className="sr-only">Unread: </span> : null}
                    {n.title}
                  </span>
                  {n.body ? <span className="line-clamp-2 text-sm leading-5 text-fg-muted">{n.body}</span> : null}
                  {n.time ? <span className="font-mono text-xs text-fg-subtle">{n.time}</span> : null}
                </span>
                {!n.read ? <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-accent-500" /> : null}
              </>
            );
            const cls = cx(
              "squircle flex w-full cursor-pointer items-start gap-3 rounded-2xl p-2.5 text-left no-underline transition-colors hover:bg-fg/5",
              focusRing,
              !n.read && "bg-accent-tint/50",
            );
            return (
              <li key={n.id}>
                {n.href ? (
                  <Link href={n.href} className={cls} onClick={() => activate(n)}>
                    {inner}
                  </Link>
                ) : (
                  <button type="button" className={cls} onClick={() => activate(n)}>
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {footer ? <div className="border-t border-line px-4 py-3 text-sm">{footer}</div> : null}
    </section>
  );
}

/** Props for `NotificationCenter`. */
export type NotificationCenterProps = NotificationListProps & {
  /** `popover` (default) anchors under the bell; `drawer` opens a side panel. */
  variant?: "popover" | "drawer";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible label of the bell. Default "Notifications". */
  label?: string;
};

/** Bell button with unread count that opens the notification list in a popover or drawer. */
export function NotificationCenter({
  variant = "popover",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  label = "Notifications",
  className,
  ...listProps
}: NotificationCenterProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const unread = listProps.notifications.filter((n) => !n.read).length;

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInner(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  useEffect(() => {
    if (!open || variant !== "popover") return;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, variant, setOpen]);

  const bellLabel = unread > 0 ? `${label}, ${unread} unread` : label;

  return (
    <div ref={rootRef} className={cx("relative inline-block", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={bellLabel}
        aria-expanded={open}
        aria-controls={open && variant === "popover" ? panelId : undefined}
        aria-haspopup="dialog"
        onClick={() => setOpen(!open)}
        className={chromeButton}
      >
        <Bell aria-hidden="true" className="size-5" />
        {unread > 0 ? (
          <span
            aria-hidden="true"
            className="absolute top-0.5 right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-action px-1 font-mono text-[10px] leading-none font-bold text-on-action ring-2 ring-surface"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      {variant === "popover" ? (
        open ? (
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={label}
            tabIndex={-1}
            className="squircle fixed inset-x-2 top-16 z-50 flex max-h-[min(36rem,calc(100dvh-5rem))] flex-col overflow-hidden rounded-3xl bg-surface text-fg shadow-lg focus:outline-none sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[24rem]"
          >
            <NotificationList {...listProps} />
          </div>
        ) : null
      ) : (
        <Drawer open={open} onOpenChange={setOpen} title={listProps.title ?? "Notifications"} size="small">
          <div className="-mx-6 sm:-mx-8">
            <NotificationList {...listProps} hideTitle />
          </div>
        </Drawer>
      )}
    </div>
  );
}
