import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { filterEvents, EventLogList, matchEventPattern, type DomainEventEntry } from "./event-log-list";
import { HtmlTemplatePreview, TemplateVariableList, withPreviewCsp } from "./html-template-preview";
import { fromKeyValuePairs, KeyValueEditor, toKeyValuePairs, validateKeyValuePairs, type KeyValuePair } from "./key-value-editor";
import { SubscriptionList, type HookSubscription } from "./subscription-list";

describe("HtmlTemplatePreview", () => {
  const html = "<html><head><title>x</title></head><body><h1>Hello {{name}}</h1><script>alert(1)</script></body></html>";

  it("renders in a fully sandboxed iframe without allow-scripts", () => {
    render(<HtmlTemplatePreview html={html} subject="Your facility was approved" />);
    const frame = screen.getByTitle("Template preview");
    expect(frame.tagName).toBe("IFRAME");
    expect(frame).toHaveAttribute("sandbox", "");
    expect(frame.getAttribute("sandbox")).not.toMatch(/allow-scripts/);
    expect(frame.getAttribute("sandbox")).not.toMatch(/allow-same-origin/);
    expect(frame).not.toHaveAttribute("src");
    const doc = frame.getAttribute("srcdoc") ?? "";
    expect(doc).toContain("Content-Security-Policy");
    expect(doc).toContain("script-src 'none'");
    expect(doc).toContain("<h1>Hello {{name}}</h1>");
    expect(screen.getByTestId("template-subject")).toHaveTextContent("Your facility was approved");
  });

  it("wraps fragments in a document with the CSP", () => {
    expect(withPreviewCsp("<p>x</p>")).toMatch(/^<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy"/);
  });

  it("toggles desktop / mobile widths", async () => {
    const user = userEvent.setup();
    const onDeviceChange = vi.fn();
    render(<HtmlTemplatePreview html="<p>x</p>" onDeviceChange={onDeviceChange} widths={{ desktop: 700 }} />);
    const frame = screen.getByTitle("Template preview");
    expect(frame).toHaveStyle({ width: "700px" });
    await user.click(screen.getByRole("radio", { name: "Mobile" }));
    expect(onDeviceChange).toHaveBeenCalledWith("mobile");
    expect(frame).toHaveStyle({ width: "375px", height: "667px" });
    expect(frame).toHaveAttribute("data-device", "mobile");
  });
});

describe("TemplateVariableList", () => {
  it("lists tokens with copy and insert", async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(
      <TemplateVariableList
        onInsert={onInsert}
        variables={[
          { name: "borrower.name", description: "Legal name of the borrower", example: "Dangote Cement Plc", required: true },
          { name: "facility.amount", example: "₦250,000,000" },
        ]}
      />,
    );
    expect(screen.getByText("{{borrower.name}}")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy {{facility.amount}}" }));
    expect(writeText).toHaveBeenCalledWith("{{facility.amount}}");
    await user.click(screen.getByRole("button", { name: "Insert {{borrower.name}}" }));
    expect(onInsert).toHaveBeenCalledWith("{{borrower.name}}", expect.objectContaining({ name: "borrower.name" }));
  });
});

const events: DomainEventEntry[] = [
  { id: "1", name: "credit.facility.approved", module: "Credit", time: "12:01", subject: { label: "FAC-0042", href: "#f42" }, actor: "Amina Bello", deliveredTo: 3, status: "delivered", payload: { facilityId: "FAC-0042", amount: 250000000 } },
  { id: "2", name: "credit.facility.submitted", module: "Credit", time: "11:40", deliveredTo: 1 },
  { id: "3", name: "rules.rule.changed", module: "Operations", time: "10:05", payload: "raw text" },
  { id: "4", name: "notification.sent", module: "Notifications", time: "09:00", status: "failed" },
];

describe("EventLogList", () => {
  it("matches patterns and filters", () => {
    expect(matchEventPattern("credit.*", "credit.facility.approved")).toBe(true);
    expect(matchEventPattern("*.approved", "credit.facility.approved")).toBe(true);
    expect(matchEventPattern("credit.*.submitted", "credit.facility.approved")).toBe(false);
    expect(matchEventPattern("FACILITY", "credit.facility.approved")).toBe(true);
    expect(matchEventPattern("", "x")).toBe(true);
    expect(filterEvents(events, { name: "credit.*" }).map((e) => e.id)).toEqual(["1", "2"]);
    expect(filterEvents(events, { module: "Operations" }).map((e) => e.id)).toEqual(["3"]);
    expect(filterEvents(events, { name: "approved", module: "Operations" })).toEqual([]);
  });

  it("filters by name and module through the UI", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    const { container } = render(<EventLogList events={events} onFilterChange={onFilterChange} />);
    expect(screen.getByTestId("event-count")).toHaveTextContent("4 events");
    await user.type(screen.getByRole("searchbox", { name: "Filter by event name" }), "credit.*");
    expect(container.querySelectorAll("[data-event]")).toHaveLength(2);
    expect(screen.getByTestId("event-count")).toHaveTextContent("2 of 4 events");
    await user.selectOptions(screen.getByRole("combobox", { name: "Module" }), "Operations");
    expect(onFilterChange).toHaveBeenLastCalledWith({ name: "credit.*", module: "Operations" });
    expect(screen.getByText("No events match the filter.")).toBeInTheDocument();
  });

  it("renders subject link, subscriber count and collapsible JSON payload", () => {
    const { container } = render(<EventLogList events={events} showFilters={false} />);
    expect(screen.getByRole("link", { name: "FAC-0042" })).toHaveAttribute("href", "#f42");
    expect(screen.getByText("3 subscribers")).toBeInTheDocument();
    const pre = container.querySelector("pre");
    expect(pre).toHaveClass("font-code");
    expect(pre?.textContent).toContain('"amount": 250000000');
    expect(container.querySelector("details")).not.toHaveAttribute("open");
    expect(screen.getByText("raw text")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});

describe("SubscriptionList", () => {
  const subs: HookSubscription[] = [
    { id: "h1", pattern: "credit.facility.approve", kind: "before", handler: "fraud-screen.v2", priority: 10, enabled: true, lastRun: { status: "vetoed", time: "11:58", message: "Watchlist hit" } },
    { id: "h2", pattern: "credit.*", kind: "event", handler: "crm-sync", enabled: false },
  ];

  it("shows kind, pattern, handler, priority and last run; toggles", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SubscriptionList subscriptions={subs} onToggle={onToggle} />);
    expect(screen.getByText("Before hook")).toBeInTheDocument();
    expect(screen.getByText("Event subscriber")).toBeInTheDocument();
    expect(screen.getByText("Priority 10")).toBeInTheDocument();
    expect(screen.getByTestId("last-run")).toHaveTextContent("Vetoed");
    expect(screen.getByText("Never run")).toBeInTheDocument();
    await user.click(screen.getByRole("switch", { name: "Enable crm-sync" }));
    expect(onToggle).toHaveBeenCalledWith("h2", true);
  });

  it("is read-only without onToggle", () => {
    render(<SubscriptionList subscriptions={subs} />);
    expect(screen.getByRole("switch", { name: "Enable fraud-screen.v2" })).toBeDisabled();
  });
});

describe("KeyValueEditor", () => {
  it("helpers convert and validate", () => {
    const pairs = toKeyValuePairs({ amount: 5, sector: "Agri" });
    expect(fromKeyValuePairs(pairs)).toEqual({ amount: "5", sector: "Agri" });
    expect(
      validateKeyValuePairs([
        { id: "a", key: "x", value: "1" },
        { id: "b", key: "x", value: "2" },
        { id: "c", key: "", value: "3" },
        { id: "d", key: "", value: "" },
      ]),
    ).toEqual({ a: "Duplicate key", b: "Duplicate key", c: "Key is required" });
  });

  it("adds, edits and removes rows", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    function Harness() {
      const [rows, setRows] = useState<KeyValuePair[]>([{ id: "r1", key: "amount", value: "100" }]);
      return (
        <KeyValueEditor
          label="Test data"
          value={rows}
          onChange={(next) => {
            setRows(next);
            spy(next);
          }}
        />
      );
    }
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Add row" }));
    expect(screen.getByRole("textbox", { name: "Key 2" })).toHaveFocus();
    await user.keyboard("amount");
    expect(screen.getAllByText("Duplicate key")).toHaveLength(2);
    await user.type(screen.getByRole("textbox", { name: "Value 2" }), "7");
    expect(fromKeyValuePairs(spy.mock.calls.at(-1)?.[0])).toEqual({ amount: "7" });
    await user.click(screen.getAllByRole("button", { name: "Remove amount" })[1]!);
    expect(screen.queryByText("Duplicate key")).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Test data" })).toBeInTheDocument();
  });
});
