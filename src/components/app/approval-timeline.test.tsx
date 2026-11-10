import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApprovalTimeline, deriveTierDecision, type ApprovalTier } from "./approval-timeline";

const tiers: ApprovalTier[] = [
  {
    id: "t1",
    title: "Tier 1 · Relationship Manager",
    limit: "≤ ₦50,000,000",
    participants: [{ name: "Ada Obi", role: "RM", decision: "recommended", decidedAt: "02 Nov, 10:14", comment: "Strong cash flows." }],
  },
  {
    id: "t2",
    title: "Tier 2 · Co-signers",
    limit: "≤ ₦500,000,000",
    participants: [
      { name: "Bayo Ade", role: "Head, Credit Risk", decision: "approved" },
      { name: "Chioma Eze", role: "Head, Business", decision: "dissent", comment: "Collateral cover is thin." },
    ],
    adjudicator: { name: "Dr. Musa Bello", role: "CRO", decision: "pending" },
  },
  { id: "t3", title: "Tier 3 · Board Credit Committee", participants: [{ name: "Board", decision: "pending" }] },
];

describe("ApprovalTimeline", () => {
  it("renders co-signers and an adjudicator branch on dissent", () => {
    const { container } = render(<ApprovalTimeline tiers={tiers} />);
    const items = container.querySelectorAll("ol > li");
    expect(items).toHaveLength(3);
    const tier2 = items[1] as HTMLElement;
    expect(within(tier2).getByText("Co-signers")).toBeInTheDocument();
    expect(within(tier2).getByText("Bayo Ade")).toBeInTheDocument();
    expect(within(tier2).getByText("Chioma Eze")).toBeInTheDocument();
    const branch = tier2.querySelector('[data-branch="adjudicator"]') as HTMLElement | null;
    expect(branch).not.toBeNull();
    expect(within(branch!).getByText("Dr. Musa Bello")).toBeInTheDocument();
    expect(within(branch!).getByText(/Adjudicator/)).toBeInTheDocument();
    // The dissenting tier is the current step.
    expect(tier2).toHaveAttribute("aria-current", "step");
    expect(within(tier2).getAllByText("Dissent").length).toBeGreaterThan(0);
    const tier1 = items[0] as HTMLElement;
    expect(within(tier1).getByText("≤ ₦50,000,000")).toBeInTheDocument();
    expect(within(tier1).getByText("Strong cash flows.")).toBeInTheDocument();
    expect(within(tier1).getByText("02 Nov, 10:14")).toBeInTheDocument();
  });

  it("derives adjudicated once the adjudicator decides, and shows a placeholder when unassigned", () => {
    const decided: ApprovalTier = { ...tiers[1]!, adjudicator: { name: "Dr. Musa Bello", decision: "approved" } };
    expect(deriveTierDecision(decided)).toBe("adjudicated");
    const unassigned: ApprovalTier = { ...tiers[1]!, adjudicator: undefined };
    render(<ApprovalTimeline tiers={[unassigned]} />);
    expect(screen.getByText("Awaiting adjudicator assignment")).toBeInTheDocument();
  });

  it("treats approve vs decline between co-signers as dissent", () => {
    const split: ApprovalTier = {
      id: "x",
      title: "Split",
      participants: [
        { name: "A", decision: "approved" },
        { name: "B", decision: "declined" },
      ],
    };
    expect(deriveTierDecision(split)).toBe("dissent");
  });

  it("does not render a branch without dissent", () => {
    const { container } = render(<ApprovalTimeline tiers={[tiers[0]!]} />);
    expect(container.querySelector('[data-branch="adjudicator"]')).toBeNull();
    expect(deriveTierDecision(tiers[2]!)).toBe("pending");
  });
});
