"use client";

import { useState, type ComponentProps, type DragEvent, type ElementType, type ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUp, GripVertical, MoreHorizontal } from "lucide-react";

import { cx } from "../../utils/cx";
import { Avatar } from "../basic/avatar";
import { Badge } from "../basic/badge";
import { toneStyles, type Tone } from "../basic/tone";
import { Menu, type MenuItem } from "../navigation/menu";

/** A board column (stage). */
export type KanbanColumn = {
  id: string;
  title: string;
  /** Dot colour next to the title. */
  tone?: Tone;
  /** WIP limit; the count turns to a warning when exceeded. */
  limit?: number;
};

/** A card on the board. */
export type KanbanCard = {
  id: string;
  columnId: string;
  title: ReactNode;
  /** Plain-text title for accessible names / announcements (defaults to `title` when it is a string). */
  textTitle?: string;
  /** Secondary line, e.g. "₦250m · Term loan". */
  meta?: ReactNode;
  badges?: { label: string; tone?: Tone }[];
  assignee?: { name: string; avatarSrc?: string };
  href?: string;
  /** Extra content at the bottom of the card. */
  footer?: ReactNode;
};

/** Props for {@link KanbanBoard}. */
export type KanbanBoardProps = Omit<ComponentProps<"div">, "children" | "onDrop"> & {
  columns: KanbanColumn[];
  /** Cards in display order (order within a column = order in this array). */
  cards: KanbanCard[];
  /** Called when a card is moved by drag & drop or the move menu. `toIndex` is the position within the target column. */
  onMove?: (cardId: string, toColumnId: string, toIndex: number) => void;
  /** Enable drag & drop (needs `onMove`). Default true. */
  draggable?: boolean;
  onCardClick?: (card: KanbanCard) => void;
  /** Replace the card body. */
  renderCard?: (card: KanbanCard) => ReactNode;
  linkComponent?: ElementType;
  /** Accessible name. Default "Board". */
  label?: string;
  emptyColumnMessage?: ReactNode;
};

const cardName = (card: KanbanCard) => card.textTitle ?? (typeof card.title === "string" ? card.title : card.id);

/** Kanban board: stage columns with counts and cards; move cards by drag & drop or the keyboard-accessible "Move" menu. */
export function KanbanBoard({
  columns,
  cards,
  onMove,
  draggable = true,
  onCardClick,
  renderCard,
  linkComponent,
  label = "Board",
  emptyColumnMessage = "No items",
  className,
  ...props
}: KanbanBoardProps) {
  const Link = linkComponent ?? "a";
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ column: string; index: number } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const canDrag = draggable && Boolean(onMove);

  const byColumn = (columnId: string) => cards.filter((c) => c.columnId === columnId);

  const move = (card: KanbanCard, toColumn: string, toIndex: number) => {
    if (!onMove) return;
    onMove(card.id, toColumn, toIndex);
    const col = columns.find((c) => c.id === toColumn);
    setAnnouncement(`Moved ${cardName(card)} to ${col?.title ?? toColumn}, position ${toIndex + 1}.`);
  };

  const dropIndex = (event: DragEvent<HTMLElement>, columnId: string) => {
    const list = event.currentTarget.querySelectorAll<HTMLElement>("[data-card-id]");
    let index = 0;
    for (const el of list) {
      if (el.dataset.cardId === dragId) continue;
      const rect = el.getBoundingClientRect();
      if (event.clientY > rect.top + rect.height / 2) index += 1;
    }
    return Math.min(index, byColumn(columnId).filter((c) => c.id !== dragId).length);
  };

  return (
    <div className={cx("flex flex-col", className)} {...props}>
      <div role="list" aria-label={label} className="flex snap-x gap-4 overflow-x-auto pb-2">
        {columns.map((column) => {
          const items = byColumn(column.id);
          const over = column.limit !== undefined && items.length > column.limit;
          const isTarget = dropTarget?.column === column.id;
          return (
            <section
              key={column.id}
              role="listitem"
              aria-labelledby={`kanban-col-${column.id}`}
              data-column-id={column.id}
              className={cx(
                "squircle flex w-72 shrink-0 snap-start flex-col gap-3 rounded-3xl bg-surface-sunken p-3 transition-shadow duration-150 ease-bolt",
                isTarget && "ring-2 ring-focus",
              )}
              onDragOver={
                canDrag
                  ? (event) => {
                      if (!dragId) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      const index = dropIndex(event, column.id);
                      if (dropTarget?.column !== column.id || dropTarget.index !== index) setDropTarget({ column: column.id, index });
                    }
                  : undefined
              }
              onDragLeave={
                canDrag
                  ? (event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(null);
                    }
                  : undefined
              }
              onDrop={
                canDrag
                  ? (event) => {
                      event.preventDefault();
                      const id = dragId ?? event.dataTransfer.getData("text/plain");
                      const card = cards.find((c) => c.id === id);
                      if (card) move(card, column.id, dropIndex(event, column.id));
                      setDragId(null);
                      setDropTarget(null);
                    }
                  : undefined
              }
            >
              <header className="flex items-center justify-between gap-2 px-2 pt-1">
                <h3 id={`kanban-col-${column.id}`} className="m-0 flex min-w-0 items-center gap-2 text-base font-bold text-fg">
                  {column.tone ? <span aria-hidden="true" className={cx("size-2.5 shrink-0 rounded-full", toneStyles[column.tone].dot)} /> : null}
                  <span className="truncate">{column.title}</span>
                </h3>
                <span
                  className={cx(
                    "squircle inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 font-mono text-xs font-semibold tabular-nums",
                    over ? toneStyles.warning.soft : "bg-fg/[0.06] text-fg",
                  )}
                  aria-label={`${items.length} ${items.length === 1 ? "item" : "items"}${column.limit !== undefined ? ` of limit ${column.limit}` : ""}`}
                >
                  {items.length}
                  {column.limit !== undefined ? `/${column.limit}` : ""}
                </span>
              </header>
              <ul className="m-0 flex min-h-16 list-none flex-col gap-2 p-0">
                {items.length === 0 ? <li className="px-2 py-4 text-center text-sm text-fg-subtle">{emptyColumnMessage}</li> : null}
                {items.map((card, index) => {
                  const others = columns.filter((c) => c.id !== column.id);
                  const menuItems: MenuItem[] = [
                    ...(index > 0 ? [{ label: "Move up", icon: <ArrowUp />, onSelect: () => move(card, column.id, index - 1) }] : []),
                    ...(index < items.length - 1 ? [{ label: "Move down", icon: <ArrowDown />, onSelect: () => move(card, column.id, index + 1) }] : []),
                    ...others.map((c, i) => ({
                      label: `Move to ${c.title}`,
                      icon: <ArrowRight />,
                      divider: i === 0 && index > -1 && items.length > 1,
                      onSelect: () => move(card, c.id, byColumn(c.id).length),
                    })),
                  ];
                  const showIndicator = isTarget && dropTarget.index === index && dragId !== card.id;
                  return (
                    <li
                      key={card.id}
                      data-card-id={card.id}
                      draggable={canDrag || undefined}
                      onDragStart={
                        canDrag
                          ? (event) => {
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", card.id);
                              setDragId(card.id);
                            }
                          : undefined
                      }
                      onDragEnd={canDrag ? () => (setDragId(null), setDropTarget(null)) : undefined}
                      className={cx(
                        "squircle group relative flex flex-col gap-2 rounded-2xl bg-surface p-3.5 shadow-sm transition-[box-shadow,transform,opacity] duration-150 ease-bolt hover:shadow-md",
                        canDrag && "cursor-grab active:cursor-grabbing",
                        dragId === card.id && "opacity-50",
                        showIndicator && "before:absolute before:inset-x-2 before:-top-1.5 before:h-0.5 before:rounded-full before:bg-focus",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {canDrag ? <GripVertical aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fg-subtle" /> : null}
                        <div className="min-w-0 flex-1">
                          {renderCard ? (
                            renderCard(card)
                          ) : card.href ? (
                            <Link href={card.href} className="text-base font-semibold text-fg no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                              {card.title}
                            </Link>
                          ) : onCardClick ? (
                            <button
                              type="button"
                              onClick={() => onCardClick(card)}
                              className="cursor-pointer text-start text-base font-semibold text-fg hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                            >
                              {card.title}
                            </button>
                          ) : (
                            <p className="m-0 text-base font-semibold text-fg">{card.title}</p>
                          )}
                          {!renderCard && card.meta ? <p className="m-0 mt-0.5 text-sm text-fg-muted">{card.meta}</p> : null}
                        </div>
                        {onMove && menuItems.length > 0 ? (
                          <Menu
                            align="end"
                            trigger={<MoreHorizontal aria-hidden="true" className="size-4" />}
                            triggerLabel={`Move ${cardName(card)}`}
                            triggerClassName="squircle -me-1 -mt-1 inline-flex size-7 items-center justify-center rounded-full text-fg-muted hover:bg-fg/5 hover:text-fg"
                            items={menuItems}
                          />
                        ) : null}
                      </div>
                      {!renderCard && (card.badges?.length || card.assignee || card.footer) ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-wrap gap-1">
                            {card.badges?.map((b) => (
                              <Badge key={b.label} size="small" tone={b.tone}>
                                {b.label}
                              </Badge>
                            ))}
                            {card.footer}
                          </div>
                          {card.assignee ? <Avatar name={card.assignee.name} src={card.assignee.avatarSrc} size="xsmall" /> : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
                {isTarget && dropTarget.index >= items.filter((c) => c.id !== dragId).length && items.length > 0 ? (
                  <li aria-hidden="true" className="mx-2 h-0.5 rounded-full bg-focus" />
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
