import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DocumentList, FileCard, documentStatusMeta, type DocumentItem } from "./document-list";

const docs: DocumentItem[] = [
  { id: "a", name: "audited-2025.pdf", size: 2048, version: "v2", uploadedBy: "Ada", uploadedAt: "10 Nov 2026", status: "verified", category: "Audited financials" },
  { id: "b", name: "statement.png", status: "quarantined", note: "Malware found", tags: [{ label: "Legal hold", tone: "warning" }] },
  { id: "c", name: "kyc.pdf", status: "pending", tags: [{ label: "Deletion pending" }] },
];

describe("DocumentList", () => {
  it("renders statuses, tags, notes and file facts", () => {
    render(<DocumentList documents={docs} />);
    expect(screen.getByText("audited-2025.pdf")).toBeInTheDocument();
    expect(screen.getByText("2.0 KB")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("Quarantined")).toBeInTheDocument();
    expect(screen.getByText("Awaiting review")).toBeInTheDocument();
    expect(screen.getByText("Legal hold")).toBeInTheDocument();
    expect(screen.getByText("Deletion pending")).toBeInTheDocument();
    expect(screen.getByText("Malware found")).toHaveClass("text-danger-strong");
    expect(documentStatusMeta.pending.tone).toBe("warning");
  });

  it("shows the empty state", () => {
    render(<DocumentList documents={[]} empty="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders one icon button per handler and extra actions per document", async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();
    const review = vi.fn();
    render(
      <DocumentList
        documents={docs}
        onDownload={onDownload}
        renderActions={(d) => (d.status === "pending" ? <button type="button" onClick={() => review(d.id)}>Review</button> : null)}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Download audited-2025.pdf" }));
    expect(onDownload).toHaveBeenCalledWith(docs[0]);
    expect(screen.queryByRole("button", { name: /Delete/ })).toBeNull();
    expect(screen.getAllByRole("button", { name: "Review" })).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Review" }));
    expect(review).toHaveBeenCalledWith("c");
  });

  it("FileCard works on its own", () => {
    render(<FileCard document={docs[0]!} />);
    expect(screen.getByText("Audited financials")).toBeInTheDocument();
  });
});
