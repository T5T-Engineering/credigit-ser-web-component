import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { riskStatusTones } from "../basic/status-badge";
import { ActivityFeed, AuditTrail, type ActivityItem } from "./activity-feed";
import { DescriptionList, KeyValueGrid } from "./description-list";
import { EntityHeader } from "./entity-header";
import { deltaDirection, MetricDelta, TrendValue } from "./metric-delta";

describe("MetricDelta", () => {
  it("infers direction and intent, honouring invert", () => {
    const { rerender } = render(<MetricDelta delta={2.5} />);
    let el = screen.getByText("+2.5").closest("[data-intent]")!;
    expect(el).toHaveAttribute("data-intent", "positive");
    expect(el).toHaveTextContent("Up +2.5");
    rerender(<MetricDelta delta={0.4} invert />);
    el = screen.getByText("+0.4").closest("[data-intent]")!;
    expect(el).toHaveAttribute("data-intent", "negative");
    rerender(<MetricDelta delta="-1.2pp" />);
    expect(screen.getByText("-1.2pp").closest("[data-intent]")).toHaveAttribute("data-direction", "down");
    expect(deltaDirection(0)).toBe("flat");
    expect(deltaDirection("0.0%")).toBe("flat");
  });

  it("TrendValue shows value, delta and hint", () => {
    render(<TrendValue label="NPL ratio" value="4.7%" delta={-0.3} deltaProps={{ invert: true }} hint="vs Q2" />);
    expect(screen.getByText("4.7%")).toBeInTheDocument();
    expect(screen.getByText("−0.3").closest("[data-intent]")).toHaveAttribute("data-intent", "positive");
  });
});

describe("DescriptionList / KeyValueGrid", () => {
  it("renders terms, values, status and copy buttons", () => {
    render(
      <DescriptionList
        items={[
          { label: "Obligor", value: "Adamu Farms" },
          { label: "Account", value: "0123456789", mono: true, copyValue: "0123456789" },
          { label: "Classification", status: "WATCHLIST", statusTones: riskStatusTones },
          { label: "Sector", value: "" },
        ]}
      />,
    );
    expect(screen.getAllByRole("term").map((t) => t.textContent)).toEqual(["Obligor", "Account", "Classification", "Sector"]);
    expect(screen.getByRole("button", { name: "Copy Account" })).toBeInTheDocument();
    expect(screen.getByText("WATCHLIST")).toBeInTheDocument();
    expect(screen.getAllByRole("definition")[3]).toHaveTextContent("—");
  });

  it("KeyValueGrid renders tiles", () => {
    render(<KeyValueGrid items={[{ label: "PD", value: "2.1%", mono: true }]} />);
    expect(screen.getByRole("term")).toHaveTextContent("PD");
    expect(screen.getByRole("definition")).toHaveTextContent("2.1%");
  });
});

describe("EntityHeader", () => {
  it("renders title, status, identifier, facts, actions and back link", () => {
    render(
      <EntityHeader
        eyebrow="Obligor"
        title="Adamu Farms Ltd"
        subtitle="Agriculture · Kano"
        identifier="OBL-000123"
        status={{ status: "PERFORMING", tones: riskStatusTones }}
        facts={[{ label: "Exposure", value: "₦250m", mono: true }]}
        actions={<button type="button">Edit</button>}
        back={{ href: "/obligors", label: "Obligors" }}
        tabs={<div role="tablist" aria-label="Sections" />}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Adamu Farms Ltd" })).toBeInTheDocument();
    expect(screen.getByText("PERFORMING")).toBeInTheDocument();
    expect(screen.getByText("OBL-000123")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy ID" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Obligors" })).toHaveAttribute("href", "/obligors");
    expect(screen.getByRole("term")).toHaveTextContent("Exposure");
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });
});

const activity: ActivityItem[] = [
  {
    id: "1",
    actor: { name: "Ngozi Eze", role: "Credit officer" },
    action: "changed the limit of",
    target: "FAC-0091",
    type: "update",
    timestamp: "2026-11-10T09:30:00Z",
    changes: [{ field: "Limit", before: "₦200m", after: "₦250m" }],
    ip: "10.0.0.4",
    device: "Edge on Windows",
  },
  { id: "2", actor: "Tunde Bello", action: "approved", target: "APP-17", type: "approval", timestamp: "2026-11-09T15:00:00Z" },
];

describe("ActivityFeed / AuditTrail", () => {
  it("lists entries grouped by day with changes", () => {
    render(<ActivityFeed items={activity} />);
    expect(screen.getByRole("region", { name: "Activity" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    const changes = screen.getByRole("list", { name: "Changes" });
    expect(within(changes).getByText("₦200m")).toBeInTheDocument();
    expect(within(changes).getByText("₦250m")).toBeInTheDocument();
    expect(screen.queryByText("10.0.0.4")).not.toBeInTheDocument();
    expect(document.querySelector("time")).toHaveAttribute("dateTime", "2026-11-10T09:30:00.000Z");
  });

  it("filters by type", async () => {
    const user = userEvent.setup();
    render(<ActivityFeed items={activity} types={[{ value: "update", label: "Updates" }, { value: "approval", label: "Approvals" }]} />);
    await user.click(screen.getByRole("button", { name: "Approvals" }));
    expect(screen.getByRole("button", { name: "Approvals" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("Ngozi Eze")).not.toBeInTheDocument();
    expect(screen.getByText("Tunde Bello")).toBeInTheDocument();
  });

  it("AuditTrail shows IP, device and the immutability notice", () => {
    render(<AuditTrail items={activity} />);
    expect(screen.getByRole("region", { name: "Audit trail" })).toBeInTheDocument();
    expect(screen.getByText("10.0.0.4")).toBeInTheDocument();
    expect(screen.getByText("Edge on Windows")).toBeInTheDocument();
    expect(screen.getByText(/append-only/)).toBeInTheDocument();
  });
});
