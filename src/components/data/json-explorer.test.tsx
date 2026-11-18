import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { JsonExplorer, jsonChildPath, jsonPaths, parseJson } from "./json-explorer";

const doc = { data: { ref: "CRC-7", accounts: [{ amount: 1200, npl: false }, { amount: 50, npl: null }] } };

describe("JsonExplorer helpers", () => {
  it("builds dot / index paths and lists every value", () => {
    expect(jsonChildPath("", "data")).toBe("data");
    expect(jsonChildPath("data.accounts", 1)).toBe("data.accounts[1]");
    expect(jsonPaths(doc).map((p) => p.path)).toEqual([
      "data",
      "data.ref",
      "data.accounts",
      "data.accounts[0]",
      "data.accounts[0].amount",
      "data.accounts[0].npl",
      "data.accounts[1]",
      "data.accounts[1].amount",
      "data.accounts[1].npl",
    ]);
    expect(parseJson("{").ok).toBe(false);
  });
});

describe("JsonExplorer", () => {
  it("picks leaf paths, shows marks and expands collapsed levels", async () => {
    const onPick = vi.fn();
    render(<JsonExplorer label="Response" value={doc} onPick={onPick} marks={{ "data.ref": "Reference" }} defaultExpandDepth={2} />);
    expect(screen.getByRole("group", { name: "Response" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Pick data.ref" }));
    expect(onPick).toHaveBeenCalledWith("data.ref", "CRC-7", "string");
    expect(screen.getByText("Reference")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pick data.accounts" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Pick data.accounts[0].amount" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Expand data.accounts" }));
    await userEvent.click(screen.getByRole("button", { name: "Expand data.accounts[0]" }));
    await userEvent.click(screen.getByRole("button", { name: "Pick data.accounts[0].amount" }));
    expect(onPick).toHaveBeenLastCalledWith("data.accounts[0].amount", 1200, "number");
  });

  it("lets lists be picked with pickable all, and shows text that is not JSON", async () => {
    const onPick = vi.fn();
    const { rerender } = render(<JsonExplorer label="Response" value={JSON.stringify(doc)} onPick={onPick} pickable="all" />);
    await userEvent.click(screen.getByRole("button", { name: "Pick data.accounts" }));
    expect(onPick).toHaveBeenCalledWith("data.accounts", doc.data.accounts, "array");
    rerender(<JsonExplorer label="Response" value="<html>oops</html>" />);
    expect(screen.getByText("Not JSON — shown as text.")).toBeInTheDocument();
    expect(screen.getByLabelText("Response")).toHaveTextContent("<html>oops</html>");
  });
});
