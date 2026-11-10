"use client";

import { Menu as MenuIcon, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ComponentProps, type MouseEvent, type ReactNode } from "react";

import { cx } from "../../utils/cx";

const DESKTOP_QUERY = "(min-width: 1024px)";

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

/** Props for {@link AppShell}. */
export type AppShellProps = ComponentProps<"div"> & {
  /** Sidebar content, typically `<SideNav />`. */
  sidebar: ReactNode;
  /** Top bar content (search, user menu …). The mobile menu button is added automatically. */
  topbar?: ReactNode;
  /** Narrow sidebar (pair with `<SideNav collapsed />`). */
  sidebarCollapsed?: boolean;
  /** Accessible name of the mobile drawer. Default "Navigation". */
  sidebarLabel?: string;
  /** Label of the mobile menu button. Default "Open navigation". */
  menuButtonLabel?: string;
  /** Id of the main content element. Default "main". */
  mainId?: string;
};

/**
 * Application frame: fixed sidebar on large screens, off-canvas drawer below `lg`,
 * optional sticky top bar and the main content area.
 */
export function AppShell({
  sidebar,
  topbar,
  sidebarCollapsed = false,
  sidebarLabel = "Navigation",
  menuButtonLabel = "Open navigation",
  mainId = "main",
  className,
  children,
  ...props
}: AppShellProps) {
  const desktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const drawerOpen = open && !desktop;

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (desktop) setOpen(false);
  }, [desktop]);

  useEffect(() => {
    if (!drawerOpen) return;
    const drawer = drawerRef.current;
    drawer?.querySelector<HTMLElement>("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [drawerOpen, close]);

  const onDrawerClick = (event: MouseEvent<HTMLDivElement>) => {
    if (drawerOpen && (event.target as HTMLElement).closest("a[href]")) close(false);
  };

  return (
    <div className={cx("min-h-screen bg-bg text-fg print:min-h-0 print:bg-transparent", className)} {...props}>
      <div
        aria-hidden="true"
        onClick={() => close()}
        className={cx(
          "fixed inset-0 z-40 bg-overlay transition-opacity duration-200 ease-bolt lg:hidden print:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        id={drawerId}
        ref={drawerRef}
        role={drawerOpen ? "dialog" : undefined}
        aria-modal={drawerOpen ? true : undefined}
        aria-label={drawerOpen ? sidebarLabel : undefined}
        inert={!desktop && !open ? true : undefined}
        onClick={onDrawerClick}
        className={cx(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-bolt lg:translate-x-0 print:hidden",
          sidebarCollapsed ? "w-64 lg:w-16" : "w-64",
          drawerOpen ? "translate-x-0 shadow-lg" : "-translate-x-full",
        )}
      >
        {drawerOpen ? (
          <button
            type="button"
            onClick={() => close()}
            aria-label="Close navigation"
            className="absolute left-full top-3 ml-2 grid size-10 place-items-center rounded-full bg-surface text-fg shadow-md hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        ) : null}
        <div className="h-full">{sidebar}</div>
      </div>

      <div className={cx("flex min-h-screen flex-col print:block print:min-h-0 print:pl-0!", sidebarCollapsed ? "lg:pl-16" : "lg:pl-64")}>
        <header className="sticky top-0 z-30 print:hidden flex h-16 items-center gap-3 border-b border-line/60 bg-surface/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label={menuButtonLabel}
            aria-expanded={drawerOpen}
            aria-controls={drawerId}
            className="-ml-1 grid size-10 place-items-center rounded-full text-fg transition-colors hover:bg-fg/5 active:bg-fg/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:hidden"
          >
            <MenuIcon aria-hidden="true" className="size-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">{topbar}</div>
        </header>
        <main id={mainId} tabIndex={-1} className="min-w-0 flex-1 focus:outline-none print:m-0 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
