import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Field, FileUpload, fileMatchesAccept } from "./index";

function makeFile(name: string, type: string, bytes: number) {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: bytes });
  return file;
}

describe("FileUpload", () => {
  it("rejects files over maxSizeMb and keeps valid ones", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    const onReject = vi.fn();
    render(
      <Field label="Financial statements">
        <FileUpload multiple maxSizeMb={1} onFilesChange={onFilesChange} onReject={onReject} />
      </Field>,
    );
    const input = screen.getByLabelText("Financial statements");
    const small = makeFile("q1.pdf", "application/pdf", 500 * 1024);
    const big = makeFile("audit.pdf", "application/pdf", 3 * 1024 * 1024);
    await user.upload(input, [small, big]);

    expect(onFilesChange).toHaveBeenCalledWith([small]);
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ file: big, reason: "size" })]);
    expect(screen.getByText(/audit\.pdf: 3\.0 MB exceeds the 1 MB limit/)).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Selected files" })).toHaveTextContent("q1.pdf");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("rejects dropped files of the wrong type and removes files", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    render(<FileUpload accept=".csv,application/pdf" multiple onFilesChange={onFilesChange} />);
    const csv = makeFile("loans.csv", "text/csv", 100);
    const exe = makeFile("setup.exe", "application/x-msdownload", 100);
    fireEvent.drop(screen.getByTestId("file-upload-dropzone"), { dataTransfer: { files: [csv, exe] } });

    expect(onFilesChange).toHaveBeenCalledWith([csv]);
    expect(screen.getByText("setup.exe: file type not allowed.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove loans.csv" }));
    expect(onFilesChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole("list", { name: "Selected files" })).not.toBeInTheDocument();
  });

  it("matches accept tokens", () => {
    expect(fileMatchesAccept(makeFile("a.PNG", "image/png", 1), "image/*")).toBe(true);
    expect(fileMatchesAccept(makeFile("a.xlsx", "", 1), ".xlsx")).toBe(true);
    expect(fileMatchesAccept(makeFile("a.txt", "text/plain", 1), ".csv,image/*")).toBe(false);
    expect(fileMatchesAccept(makeFile("a.txt", "text/plain", 1))).toBe(true);
  });
});
