"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

import { focusRing } from "../app/app-utils";
import { Modal } from "../blocks/modal";
import { Spinner } from "../utilities/spinner";
import { cx } from "../../utils/cx";

/** One picture of an {@link ImageGallery}. */
export type GalleryImage = {
  id: string;
  /** Image URL (object URL, signed URL…); null / undefined while it loads or when it can't be shown. */
  src?: string | null;
  /** Alternative text (also the lightbox title). */
  alt: string;
  /** Short caption under the thumbnail. */
  caption?: ReactNode;
  /** Secondary line (e.g. who uploaded it and when), pre-formatted. */
  meta?: ReactNode;
  /** Shows a spinner instead of the placeholder while `src` is missing. */
  loading?: boolean;
};

/** Props for {@link ImageGallery}. */
export type ImageGalleryProps = Omit<ComponentProps<"div">, "children"> & {
  images: GalleryImage[];
  /** Accessible name of the gallery, e.g. "Collateral photos". */
  label: string;
  /** Shown when there are no images. */
  empty?: ReactNode;
  /** Extra actions in the lightbox footer for the shown image (e.g. Download). */
  renderActions?: (image: GalleryImage) => ReactNode;
  /** Labels of the lightbox navigation. */
  labels?: { previous?: string; next?: string; unavailable?: string; position?: (index: number, total: number) => string };
};

/**
 * Thumbnail grid of pictures (e.g. photos of a pledged asset) with a lightbox: click a thumbnail to open it large; Previous / Next
 * (also ←/→) step through the set. Images whose `src` is missing show a placeholder (or a spinner while `loading`).
 */
export function ImageGallery({ images, label, empty, renderActions, labels, className, ...props }: ImageGalleryProps) {
  const [open, setOpen] = useState<number | null>(null);
  const l = {
    previous: labels?.previous ?? "Previous",
    next: labels?.next ?? "Next",
    unavailable: labels?.unavailable ?? "Image not available",
    position: labels?.position ?? ((i: number, n: number) => `${i + 1} of ${n}`),
  };
  if (!images.length) return empty ? <div className={cx("text-sm text-fg-muted", className)}>{empty}</div> : null;
  const shown = open == null ? null : images[open];
  const step = (delta: number) => setOpen((i) => (i == null ? i : (i + delta + images.length) % images.length));

  return (
    <div role="group" aria-label={label} className={cx("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", className)} {...props}>
      {images.map((image, i) => (
        <figure key={image.id} className="flex min-w-0 flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setOpen(i)}
            aria-label={image.alt}
            className={cx("squircle grid aspect-[4/3] w-full cursor-pointer place-items-center overflow-hidden rounded-2xl bg-surface-sunken", focusRing)}
          >
            <Picture image={image} unavailable={l.unavailable} className="size-full object-cover" />
          </button>
          {image.caption || image.meta ? (
            <figcaption className="flex min-w-0 flex-col">
              {image.caption ? <span className="truncate text-sm font-semibold text-fg">{image.caption}</span> : null}
              {image.meta ? <span className="truncate text-xs text-fg-muted">{image.meta}</span> : null}
            </figcaption>
          ) : null}
        </figure>
      ))}
      {shown ? (
        <Modal
          open
          size="large"
          onOpenChange={(o) => !o && setOpen(null)}
          title={shown.alt}
          description={images.length > 1 ? l.position(open!, images.length) : undefined}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") step(-1);
            if (e.key === "ArrowRight") step(1);
          }}
          footer={
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">{renderActions?.(shown)}</div>
              {images.length > 1 ? (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => step(-1)} aria-label={l.previous} className={cx("squircle grid size-10 cursor-pointer place-items-center rounded-full text-fg hover:bg-fg/5", focusRing)}>
                    <ChevronLeft aria-hidden="true" className="size-5" />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label={l.next} className={cx("squircle grid size-10 cursor-pointer place-items-center rounded-full text-fg hover:bg-fg/5", focusRing)}>
                    <ChevronRight aria-hidden="true" className="size-5" />
                  </button>
                </div>
              ) : null}
            </div>
          }
        >
          <div className="squircle grid min-h-48 place-items-center overflow-hidden rounded-2xl bg-surface-sunken">
            <Picture image={shown} unavailable={l.unavailable} className="max-h-[65vh] w-auto max-w-full object-contain" />
          </div>
          {shown.meta ? <p className="mt-2 text-xs text-fg-muted">{shown.meta}</p> : null}
        </Modal>
      ) : null}
    </div>
  );
}

function Picture({ image, unavailable, className }: { image: GalleryImage; unavailable: string; className: string }) {
  if (image.src) return <img src={image.src} alt={image.alt} className={className} />;
  if (image.loading) return <Spinner size="small" label={`Loading ${image.alt}`} />;
  return (
    <span className="flex flex-col items-center gap-1 text-xs text-fg-muted">
      <ImageOff aria-hidden="true" className="size-5" />
      {unavailable}
    </span>
  );
}
