import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { escapeCsvField, exportCsv, toCsv } from "./csv";
import { DataTable, processRows, type DataTableColumn } from "./data-table";

type Loan = { id: string; obligor: string; sector: string; exposure: number; stage: number };

const loans: Loan[] = [
  { id: "L1", obligor: "Adamu Farms", sector: "Agriculture", exposure: 300, stage: 1 },
  { id: "L2", obligor: "Bisi Textiles", sector: "Manufacturing", exposure: 100, stage: 2 },
  { id: "L3", obligor: "Chika Oil", sector: "Oil & Gas", exposure: 500, stage: 3 },
  { id: "L4", obligor: "Dayo Foods", sector: "Agriculture", exposure: 200, stage: 1 },
];

const columns: DataTableColumn<Loan>[] = [
  { id: "obligor", header: "Obligor", accessor: "obligor", sortable: true },
  { id: "sector", header: "Sector", accessor: "sector" },
  { id: "exposure", header: "Exposure", accessor: "exposure", sortable: true, numeric: true },
  { id: "stage", header: "Stage", accessor: (r) => `Stage ${r.stage}`, searchable: false },
];

const bodyRows = () => within(screen.getByRole("table")).getAllByRole("row").slice(1);
const firstCells = () => bodyRows().map((r) => within(r).getAllByRole("cell")[0]?.textContent);

describe("DataTable", () => {
  it("renders headers and rows", () => {
    render(<DataTable label="Loans" columns={columns} data={loans} getRowId={(r) => r.id} />);
    expect(screen.getByRole("table", { name: "Loans" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Obligor", "Sector", "Exposure", "Stage"]);
    expect(bodyRows()).toHaveLength(4);
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("sorts ascending, descending, then unsorted with aria-sort", async () => {
    const user = userEvent.setup();
    render(<DataTable label="Loans" columns={columns} data={loans} getRowId={(r) => r.id} />);
    const header = screen.getByRole("columnheader", { name: /Exposure/ });
    expect(header).toHaveAttribute("aria-sort", "none");
    expect(screen.getByRole("columnheader", { name: "Sector" })).not.toHaveAttribute("aria-sort");

    await user.click(within(header).getByRole("button"));
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(firstCells()).toEqual(["Bisi Textiles", "Dayo Foods", "Adamu Farms", "Chika Oil"]);

    await user.click(within(header).getByRole("button"));
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(firstCells()).toEqual(["Chika Oil", "Adamu Farms", "Dayo Foods", "Bisi Textiles"]);

    await user.click(within(header).getByRole("button"));
    expect(header).toHaveAttribute("aria-sort", "none");
    expect(firstCells()).toEqual(["Adamu Farms", "Bisi Textiles", "Chika Oil", "Dayo Foods"]);
  });

  it("filters with the global search", async () => {
    const user = userEvent.setup();
    render(<DataTable label="Loans" searchable columns={columns} data={loans} getRowId={(r) => r.id} />);
    await user.type(screen.getByRole("searchbox", { name: "Search Loans" }), "agri");
    expect(firstCells()).toEqual(["Adamu Farms", "Dayo Foods"]);
    expect(screen.getByRole("status")).toHaveTextContent("2 results");
    // Non-searchable column is ignored.
    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "Stage 3");
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("filters with faceted select filters and clears all", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DataTable label="Loans" columns={columns} data={loans} getRowId={(r) => r.id} filters={[{ id: "sector", label: "Sector", onChange }]} />);
    const select = screen.getByRole("combobox", { name: "Sector" });
    expect(within(select).getAllByRole("option").map((o) => o.textContent)).toEqual([
      "All",
      "Agriculture (2)",
      "Manufacturing (1)",
      "Oil & Gas (1)",
    ]);
    await user.selectOptions(select, "Manufacturing");
    expect(onChange).toHaveBeenCalledWith("Manufacturing");
    expect(firstCells()).toEqual(["Bisi Textiles"]);
    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(bodyRows()).toHaveLength(4);
  });

  it("supports custom filter functions with explicit options", () => {
    const rows = processRows(loans, columns, {
      filters: [{ filter: { id: "big", label: "Size", filterFn: (r, v) => (v === "big" ? r.exposure >= 300 : true) }, value: "big" }],
    });
    expect(rows.map((r) => r.id)).toEqual(["L1", "L3"]);
  });

  it("paginates and changes page size", async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 23 }, (_, i) => ({ ...loans[0]!, id: `R${i + 1}`, obligor: `Obligor ${i + 1}` }));
    render(<DataTable label="Loans" columns={columns} data={many} getRowId={(r) => r.id} defaultPageSize={10} />);
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText("1–10 of 23")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Page 3" }));
    expect(bodyRows()).toHaveLength(3);
    expect(firstCells()[0]).toBe("Obligor 21");
    await user.selectOptions(screen.getByRole("combobox", { name: "Rows per page" }), "25");
    expect(bodyRows()).toHaveLength(23);
    expect(screen.queryByRole("navigation", { name: "Loans pages" })).not.toBeInTheDocument();
  });

  it("selects rows, selects the page, and exposes bulk actions", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        label="Loans"
        selectable
        columns={columns}
        data={loans}
        getRowId={(r) => r.id}
        onSelectionChange={onSelectionChange}
        bulkActions={(rows) => <button type="button">Approve {rows.length}</button>}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Select row L2" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["L2"]);
    expect(screen.getByRole("region", { name: "Bulk actions" })).toHaveTextContent("1 selected");
    expect(screen.getByRole("button", { name: "Approve 1" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Select row L2" }).closest("tr")).toHaveAttribute("aria-selected", "true");

    const all = screen.getByRole("checkbox", { name: "Select all rows on this page" }) as HTMLInputElement;
    expect(all.indeterminate).toBe(true);
    await user.click(all);
    expect(onSelectionChange).toHaveBeenLastCalledWith(["L2", "L1", "L3", "L4"]);
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole("region", { name: "Bulk actions" })).not.toBeInTheDocument();
  });

  it("activates rows by click and keyboard, ignoring clicks on controls", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<DataTable label="Loans" selectable columns={columns} data={loans} getRowId={(r) => r.id} onRowClick={onRowClick} />);
    await user.click(screen.getByText("Chika Oil"));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0]?.[0]).toMatchObject({ id: "L3" });

    await user.click(screen.getByRole("checkbox", { name: "Select row L1" }));
    expect(onRowClick).toHaveBeenCalledTimes(1);

    const row = screen.getByText("Dayo Foods").closest("tr")!;
    expect(row).toHaveAttribute("tabindex", "0");
    row.focus();
    await user.keyboard("{Enter}");
    expect(onRowClick).toHaveBeenCalledTimes(2);
    await user.keyboard(" ");
    expect(onRowClick).toHaveBeenCalledTimes(3);
    expect(onRowClick.mock.calls[2]?.[0]).toMatchObject({ id: "L4" });
  });

  it("renders row links in the first cell", () => {
    render(<DataTable label="Loans" columns={columns} data={loans} getRowId={(r) => r.id} getRowHref={(r) => `/loans/${r.id}`} />);
    expect(screen.getByRole("link", { name: "Bisi Textiles" })).toHaveAttribute("href", "/loans/L2");
  });

  it("shows loading skeletons and a custom empty state", () => {
    const { rerender } = render(<DataTable label="Loans" loading columns={columns} data={[]} getRowId={(r) => r.id} />);
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(bodyRows()).toHaveLength(5);
    rerender(<DataTable label="Loans" columns={columns} data={[]} getRowId={(r) => r.id} emptyState={<p>No facilities yet</p>} />);
    expect(screen.getByText("No facilities yet")).toBeInTheDocument();
  });

  it("hides hidden columns and renders the toolbar slot", () => {
    render(
      <DataTable
        label="Loans"
        columns={columns.map((c) => (c.id === "sector" ? { ...c, hidden: true } : c))}
        data={loans}
        getRowId={(r) => r.id}
        toolbar={<button type="button">New facility</button>}
      />,
    );
    expect(screen.queryByRole("columnheader", { name: "Sector" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New facility" })).toBeInTheDocument();
  });
});

describe("CSV helpers", () => {
  it("builds CSV with headers, escaping and accessors", () => {
    const csv = toCsv(columns, [loans[2]!, { ...loans[1]!, obligor: 'Bisi "B" Textiles, Ltd' }]);
    expect(csv.split("\r\n")).toEqual([
      "Obligor,Sector,Exposure,Stage",
      "Chika Oil,Oil & Gas,500,Stage 3",
      '"Bisi ""B"" Textiles, Ltd",Manufacturing,100,Stage 2',
    ]);
  });

  it("skips hidden / non-exportable columns and uses csv overrides", () => {
    const cols: DataTableColumn<Loan>[] = [
      { id: "id", header: <b>ID</b>, accessor: "id", csvHeader: "Facility ID" },
      { id: "exposure", header: "Exposure", accessor: "exposure", csv: (r) => r.exposure * 1000 },
      { id: "sector", header: "Sector", accessor: "sector", hidden: true },
      { id: "actions", header: "Actions", exportable: false },
    ];
    expect(toCsv(cols, [loans[0]!])).toBe("Facility ID,Exposure\r\nL1,300000");
  });

  it("neutralises formula injection but keeps negative numbers", () => {
    expect(escapeCsvField("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(escapeCsvField("-12.5")).toBe("-12.5");
    expect(escapeCsvField(-3)).toBe("-3");
    expect(escapeCsvField(null)).toBe("");
  });

  it("exportCsv downloads a file and returns the text", () => {
    const create = vi.fn(() => "blob:x");
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const csv = exportCsv(columns, loans.slice(0, 1), "loans");
    expect(csv).toContain("Adamu Farms");
    expect(create).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it("DataTable export button exports filtered rows", async () => {
    const user = userEvent.setup();
    const create = vi.fn((_blob: Blob) => "blob:x");
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<DataTable label="Loans" searchable exportFilename="loans" columns={columns} data={loans} getRowId={(r) => r.id} />);
    await user.type(screen.getByRole("searchbox"), "Chika");
    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    const blob = create.mock.calls[0]![0];
    const text = await blob.text();
    expect(text).toContain("Chika Oil");
    expect(text).not.toContain("Adamu");
    click.mockRestore();
  });

  it("onExport receives the exported rows and can cancel the download", async () => {
    const user = userEvent.setup();
    const create = vi.fn((_blob: Blob) => "blob:x");
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const onExport = vi.fn<(rows: Loan[], filename: string) => Promise<boolean>>().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(<DataTable label="Loans" exportFilename="loans" onExport={onExport} columns={columns} data={loans} getRowId={(r) => r.id} />);
    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(onExport).toHaveBeenCalledWith(loans, "loans");
    expect(create).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    await vi.waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    click.mockRestore();
  });
});
