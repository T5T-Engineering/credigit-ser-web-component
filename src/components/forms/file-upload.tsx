"use client";

import { useId, useRef, useState, type ComponentProps, type DragEvent, type ReactNode } from "react";
import { CircleAlert, FileText, Upload, X } from "lucide-react";

import { cx } from "../../utils/cx";
import { joinIds, useFieldControl } from "./field-context";

/** A file rejected by `FileUpload` validation. */
export type FileRejection = { file: File; reason: "type" | "size" | "count"; message: string };

/** Props for `FileUpload`. */
export type FileUploadProps = Omit<ComponentProps<"input">, "type" | "size" | "value" | "defaultValue" | "onChange"> & {
  /** Accepted types, same syntax as the native attribute: ".pdf,.csv,image/*,application/vnd.ms-excel". */
  accept?: string;
  multiple?: boolean;
  /** Maximum size per file in megabytes. */
  maxSizeMb?: number;
  /** Maximum number of files kept (only with `multiple`). */
  maxFiles?: number;
  /** Selected files (controlled). */
  files?: File[];
  /** Called with the full list of accepted files after every change. */
  onFilesChange?: (files: File[]) => void;
  /** Called with files that failed validation. */
  onReject?: (rejections: FileRejection[]) => void;
  /** Main prompt inside the drop zone. */
  title?: ReactNode;
  /** Hint under the prompt; defaults to a summary of accepted types and max size. */
  hint?: ReactNode;
  invalid?: boolean;
};

/** Human-readable file size (e.g. "1.2 MB"). */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Whether a file matches an `accept` string (extensions, exact MIME types, or `type/*`). */
export function fileMatchesAccept(file: File, accept?: string): boolean {
  if (!accept || accept.trim() === "") return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .some((token) => {
      if (token.startsWith(".")) return name.endsWith(token);
      if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
      return type === token;
    });
}

/** Drag-and-drop / browse file picker with type and size validation and a removable file list. */
export function FileUpload({
  accept,
  multiple = false,
  maxSizeMb,
  maxFiles,
  files: filesProp,
  onFilesChange,
  onReject,
  title,
  hint,
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  id: idProp,
  className,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  ...props
}: FileUploadProps) {
  const ctl = useFieldControl({
    id: idProp,
    invalid: invalidProp,
    disabled: disabledProp,
    required: requiredProp,
    "aria-describedby": describedByProp,
    "aria-invalid": ariaInvalidProp,
  });
  const autoId = useId();
  const id = ctl.id ?? `cg-file-${autoId}`;
  const hintId = `${id}-hint`;
  const statusId = `${id}-status`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internal, setInternal] = useState<File[]>([]);
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  const [dragging, setDragging] = useState(false);
  const files = filesProp ?? internal;
  const invalid = ctl.invalid || rejections.length > 0;

  const defaultHint = [
    accept ? `Accepted: ${accept.split(",").map((t) => t.trim()).join(", ")}` : null,
    maxSizeMb !== undefined ? `Max ${maxSizeMb} MB${multiple ? " per file" : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  function commit(next: File[]) {
    if (filesProp === undefined) setInternal(next);
    onFilesChange?.(next);
  }

  function addFiles(list: FileList | File[] | null) {
    if (!list || ctl.disabled) return;
    const incoming = Array.from(list);
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];
    for (const file of incoming) {
      if (!fileMatchesAccept(file, accept)) {
        rejected.push({ file, reason: "type", message: `${file.name}: file type not allowed.` });
      } else if (maxSizeMb !== undefined && file.size > maxSizeMb * 1024 * 1024) {
        rejected.push({
          file,
          reason: "size",
          message: `${file.name}: ${formatFileSize(file.size)} exceeds the ${maxSizeMb} MB limit.`,
        });
      } else {
        accepted.push(file);
      }
    }
    let next = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
    if (!multiple && accepted.length > 1) {
      for (const file of accepted.slice(1)) {
        rejected.push({ file, reason: "count", message: `${file.name}: only one file can be uploaded.` });
      }
    }
    if (!multiple && accepted.length === 0) next = files;
    if (multiple && maxFiles !== undefined && next.length > maxFiles) {
      for (const file of next.slice(maxFiles)) {
        rejected.push({ file, reason: "count", message: `${file.name}: no more than ${maxFiles} files allowed.` });
      }
      next = next.slice(0, maxFiles);
    }
    setRejections(rejected);
    if (rejected.length > 0) onReject?.(rejected);
    if (accepted.length > 0) commit(next);
  }

  function removeFile(index: number) {
    commit(files.filter((_, i) => i !== index));
    setRejections([]);
    inputRef.current?.focus();
  }

  function onDrag(event: DragEvent<HTMLLabelElement>, over: boolean) {
    event.preventDefault();
    event.stopPropagation();
    if (!ctl.disabled) setDragging(over);
  }

  return (
    <div className={cx("flex flex-col gap-3", className)}>
      <label
        htmlFor={id}
        onDragEnter={(e) => onDrag(e, true)}
        onDragOver={(e) => onDrag(e, true)}
        onDragLeave={(e) => onDrag(e, false)}
        onDrop={(e) => {
          onDrag(e, false);
          addFiles(e.dataTransfer?.files ?? null);
        }}
        data-dragging={dragging || undefined}
        data-testid="file-upload-dropzone"
        className={cx(
          // Bolt: large squircle panel with a soft grey fill and a soft dashed hairline.
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl squircle border-2 border-dashed px-6 py-10 text-center transition-colors duration-150 ease-bolt",
          "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus",
          dragging
            ? "border-action bg-accent-tint"
            : invalid
              ? "border-danger bg-danger-soft/40"
              : "border-line-strong bg-fg/5 hover:bg-fg/10",
          ctl.disabled && "cursor-not-allowed opacity-50 hover:bg-fg/5",
        )}
      >
        <span aria-hidden="true" className="mb-1 grid size-12 place-items-center rounded-full bg-surface text-fg shadow-sm">
          <Upload size={20} />
        </span>
        <span className="text-base font-semibold text-fg">
          {title ?? (
            <>
              <span className="text-link underline underline-offset-4">Browse {multiple ? "files" : "a file"}</span> or drag
              and drop
            </>
          )}
        </span>
        {hint ?? defaultHint ? (
          <span id={hintId} className="text-sm text-fg-muted">
            {hint ?? defaultHint}
          </span>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          id={id}
          accept={accept}
          multiple={multiple}
          disabled={ctl.disabled}
          required={ctl.required && files.length === 0}
          aria-invalid={invalid || ctl.ariaInvalid ? true : undefined}
          aria-describedby={joinIds(hint ?? defaultHint ? hintId : undefined, rejections.length ? statusId : undefined, ctl.describedBy)}
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
          {...props}
        />
      </label>

      <div id={statusId} aria-live="polite" className="contents">
        {rejections.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {rejections.map((rejection, index) => (
              <li key={`${rejection.file.name}-${index}`} className="flex items-start gap-1.5 text-sm leading-5 text-danger-strong">
                <CircleAlert aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
                {rejection.message}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {files.length > 0 ? (
        <ul aria-label="Selected files" className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl squircle bg-fg/5">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${index}`} className="flex items-center gap-3 px-4 py-3">
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-fg-muted shadow-sm">
                <FileText size={16} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{file.name}</span>
              <span className="shrink-0 font-mono text-xs text-fg-muted">{formatFileSize(file.size)}</span>
              {!ctl.disabled ? (
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeFile(index)}
                  className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-fg-muted transition-colors duration-150 ease-bolt hover:bg-fg/10 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  <X aria-hidden="true" size={16} />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
