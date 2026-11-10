"use client";

import { Menu as MenuIcon, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ComponentProps, type ElementType, type ReactNode } from "react";

import { Logo } from "../../brand";
import type { SurfaceTheme } from "../../theme/tokens";
import { cx } from "../../utils/cx";
import { Container, type ContainerSize } from "../layouts";

/** A primary navigation link. */
export type NavbarLink = { label: ReactNode; href: string; active?: boolean };

/** Props for {@link Navbar}. */
export type NavbarProps = Omit<ComponentProps<"header">, "children"> & {
  /** Brand slot. Defaults to `<Logo />` linking to `logoHref`. */
  logo?: ReactNode;
  logoHref?: string;
  links: NavbarLink[];
  /** Right-hand actions, e.g. buttons. Also shown at the bottom of the mobile menu. */
  actions?: ReactNode;
  theme?: SurfaceTheme;
  /** Stick to the top of the viewport. Default true. */
  sticky?: boolean;
  /**
   * Transparent until the page is scrolled, then gains a surface. The bar overlays the content
   * below it (fixed/absolute), so the first section should leave room for it (≈ 4–5rem).
   */
  transparent?: boolean;
  /** Router link component (e.g. Next.js `Link`). */
  linkComponent?: ElementType;
  containerSize?: ContainerSize;
  /** Accessible name of the `<nav>` landmark. Default "Main". */
  navLabel?: string;
  /** Scroll distance (px) after which a transparent bar gains its surface. Default 8. */
  scrollThreshold?: number;
};

const linkFocus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/**
 * Site header with logo, primary links and actions. Below `md` the links collapse into an
 * accessible disclosure menu (Escape closes, focus moves into the menu and back to the toggle).
 */
export function Navbar({
  logo,
  logoHref = "/",
  links,
  actions,
  theme,
  sticky = true,
  transparent = false,
  linkComponent,
  containerSize = "xlarge",
  navLabel = "Main",
  scrollThreshold = 8,
  className,
  ...props
}: NavbarProps) {
  const Link = linkComponent ?? "a";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Track scroll position for the transparent variant.
  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > scrollThreshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent, scrollThreshold]);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Mobile menu: focus first link, Escape / outside click close, close when resizing to desktop.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a[href], button:not([disabled])")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) close(false);
    };
    const mq = typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 768px)") : null;
    const onMq = () => mq?.matches && close(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    mq?.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      mq?.removeEventListener("change", onMq);
    };
  }, [open, close]);

  const solid = !transparent || scrolled || open;

  const brand = logo ?? (
    <Link href={logoHref} className={cx("inline-flex shrink-0 items-center rounded-lg", linkFocus)}>
      <Logo size="small" />
    </Link>
  );

  return (
    <header
      ref={headerRef}
      data-cg-theme={theme}
      data-scrolled={scrolled || undefined}
      className={cx(
        "z-40 w-full transition-[background-color,box-shadow,border-color] duration-200 ease-bolt",
        transparent ? (sticky ? "fixed inset-x-0 top-0" : "absolute inset-x-0 top-0") : sticky ? "sticky top-0" : "relative",
        // Utilities beat the [data-cg-theme] base background, so bg-transparent wins until scrolled.
        solid ? "border-b border-line/60 bg-surface/95 backdrop-blur-md" : "border-b border-transparent bg-transparent",
        className,
      )}
      {...props}
    >
      <Container size={containerSize} className="flex h-16 items-center gap-4 lg:h-20 lg:gap-8">
        {brand}

        <nav aria-label={navLabel} className="hidden flex-1 md:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={link.active ? "page" : undefined}
                  className={cx(
                    "squircle inline-flex h-10 items-center rounded-full px-4 text-base font-medium text-fg transition-colors duration-150 ease-bolt",
                    link.active ? "bg-fg/5" : "hover:bg-fg/5 active:bg-fg/10",
                    linkFocus,
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {actions ? <div className="hidden items-center gap-3 md:flex">{actions}</div> : null}
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className={cx("grid size-10 place-items-center rounded-full bg-fg/5 text-fg transition-colors hover:bg-fg/10 md:hidden", linkFocus)}
          >
            {open ? <X aria-hidden="true" className="size-5" /> : <MenuIcon aria-hidden="true" className="size-5" />}
          </button>
        </div>
      </Container>

      <div
        id={panelId}
        ref={panelRef}
        hidden={!open}
        className="max-h-[calc(100dvh-4rem)] overflow-y-auto bg-surface pb-4 md:hidden"
      >
        <Container size={containerSize} className="pt-2">
          <nav aria-label={navLabel} className="squircle overflow-hidden rounded-3xl bg-surface-sunken p-2">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={link.active ? "page" : undefined}
                    onClick={() => close(false)}
                    className={cx(
                      "squircle flex min-h-14 items-center rounded-2xl px-4 text-lg font-semibold text-fg transition-colors duration-150 ease-bolt",
                      link.active ? "bg-surface shadow-sm" : "hover:bg-fg/5 active:bg-fg/10",
                      linkFocus,
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {actions ? <div className="mt-4 flex flex-col gap-3 [&>*]:w-full">{actions}</div> : null}
        </Container>
      </div>
    </header>
  );
}
