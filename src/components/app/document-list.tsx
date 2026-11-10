import type { ComponentProps, ReactNode } from "react";
import { Download, Eye, File, FileArchive, FileImage, FileSpreadsheet, FileText, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";

import { Badge } from "../basic/badge";
import type { Tone } from "../basic/tone";
import { formatFileSize } from "../forms/file-upload";
import { cx } from "../../utils/cx";
import { chromeButton } from "./app-utils";

/** Processing status of an uploaded document. */
export type DocumentStatus = "uploaded" | "processing" | "extracted" | "verified" | "rejected";

/** Tone and label per document status. */
export const documentStatusMeta: Record<DocumentStatus, { tone: Tone; label: string }> = {
  uploaded: { tone: "neutral", label: "Uploaded" },
  processing: { tone: "info", label: "Processing OCR" },
  extracted: { tone: "accent", label: "Extracted" },
  verified: { tone: "success", label: "Verified" },
  rejected: { tone: "danger", label: "Rejected" },
};

/** An uploaded document. */
export type DocumentItem = {
  id: string;
  name: string;
  /** MIME type or extension; derived from `name` when absent. */
  type?: string;
  /** Size in bytes. */
  size?: number;
  /** Version label, e.g. "v2". */
  version?: ReactNode;
  uploadedBy?: ReactNode;
  /** Pre-formatted upload time. */
  uploadedAt?: ReactNode;
  status?: DocumentStatus;
  /** Reason or detail (e.g. rejection reason). */
  note?: ReactNode;
  /** Category, e.g. "KYC", "Financials". */
  category?: ReactNode;
};

/** Document action handlers (buttons render only for handlers provided). */
export type DocumentActions = {
  onPreview?: (doc: DocumentItem) => void;
  onDownload?: (doc: DocumentItem) => void;
  onReplace?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
};

function kindOf(doc: DocumentItem): "pdf" | "sheet" | "image" | "archive" | "doc" | "other" {
  const t = (doc.type ?? doc.name.split(".").pop() ?? "").toLowerCase();
  if (t.includes("pdf")) return "pdf";
  if (/(xls|csv|sheet|excel)/.test(t)) return "sheet";
  if (/(png|jpe?g|gif|webp|tiff?|image|heic)/.test(t)) return "image";
  if (/(zip|rar|7z|tar|gz|archive)/.test(t)) return "archive";
  if (/(docx?|txt|rtf|word|text)/.test(t)) return "doc";
  return "other";
}

const kindIcon = { pdf: FileText, sheet: FileSpreadsheet, image: FileImage, archive: FileArchive, doc: FileText, other: File };
const kindTile = {
  pdf: "bg-danger-soft text-danger-strong",
  sheet: "bg-success-soft text-success-strong",
  image: "bg-info-soft text-info-strong",
  archive: "bg-warning-soft text-warning-strong",
  doc: "bg-primary-100 text-primary-700",
  other: "bg-fg/5 text-fg",
};

/** Props for `FileCard`. */
export type FileCardProps = Omit<ComponentProps<"div">, "children"> & DocumentActions & { document: DocumentItem };

/** One uploaded document: type icon, name, size, version, uploader, status and actions. */
export function FileCard({ document: doc, onPreview, onDownload, onReplace, onDelete, className, ...props }: FileCardProps) {
  const kind = kindOf(doc);
  const Icon = kindIcon[kind];
  const status = doc.status ? documentStatusMeta[doc.status] : undefined;
  const meta = [doc.size !== undefined ? formatFileSize(doc.size) : null, doc.version ?? null].filter(Boolean);
  const actions: Array<{ label: string; icon: ReactNode; fn: (d: DocumentItem) => void; danger?: boolean }> = [];
  if (onPreview) actions.push({ label: "Preview", icon: <Eye className="size-4" />, fn: onPreview });
  if (onDownload) actions.push({ label: "Download", icon: <Download className="size-4" />, fn: onDownload });
  if (onReplace) actions.push({ label: "Replace", icon: <RefreshCw className="size-4" />, fn: onReplace });
  if (onDelete) actions.push({ label: "Delete", icon: <Trash2 className="size-4" />, fn: onDelete, danger: true });

  return (
    <div className={cx("squircle flex flex-wrap items-center gap-x-4 gap-y-3 rounded-3xl bg-surface-sunken p-3.5 sm:flex-nowrap", className)} {...props}>
      <span aria-hidden="true" className={cx("squircle grid size-11 shrink-0 place-items-center rounded-2xl", kindTile[kind])}>
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-fg" title={doc.name}>
            {doc.name}
          </span>
          {doc.category ? <span className="text-xs text-fg-muted">{doc.category}</span> : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-fg-muted">
          {meta.map((m, i) => (
            <span key={i}>
              {i > 0 ? "· " : null}
              {m}
            </span>
          ))}
          {doc.uploadedBy || doc.uploadedAt ? (
            <span>
              {meta.length > 0 ? "· " : null}
              {doc.uploadedBy}
              {doc.uploadedBy && doc.uploadedAt ? ", " : null}
              {doc.uploadedAt}
            </span>
          ) : null}
        </div>
        {doc.note ? <p className={cx("text-xs", doc.status === "rejected" ? "text-danger-strong" : "text-fg-muted")}>{doc.note}</p> : null}
      </div>
      {status ? (
        <Badge tone={status.tone} dot={doc.status !== "processing"} className="shrink-0">
          {doc.status === "processing" ? <LoaderCircle aria-hidden="true" className="size-3 animate-spin" /> : null}
          {status.label}
        </Badge>
      ) : null}
      {actions.length > 0 ? (
        <div className="flex shrink-0 items-center gap-0.5">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              aria-label={`${a.label} ${doc.name}`}
              title={a.label}
              onClick={() => a.fn(doc)}
              className={cx(chromeButton, a.danger && "text-danger-strong hover:bg-danger-soft")}
            >
              <span aria-hidden="true">{a.icon}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Props for `DocumentList`. */
export type DocumentListProps = Omit<ComponentProps<"ul">, "children"> &
  DocumentActions & {
    documents: DocumentItem[];
    /** Shown when there are no documents. */
    empty?: ReactNode;
  };

/** List of uploaded documents rendered as `FileCard`s. */
export function DocumentList({ documents, empty, onPreview, onDownload, onReplace, onDelete, className, ...props }: DocumentListProps) {
  if (documents.length === 0) return <>{empty ?? <p className="text-sm text-fg-muted">No documents uploaded yet.</p>}</>;
  return (
    <ul className={cx("flex flex-col gap-2", className)} {...props}>
      {documents.map((doc) => (
        <li key={doc.id}>
          <FileCard document={doc} onPreview={onPreview} onDownload={onDownload} onReplace={onReplace} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
