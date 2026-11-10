import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Accordion, AccordionItem, type AccordionProps } from "./accordion";

function setup(props: Partial<AccordionProps> = {}) {
  return render(
    <Accordion {...props}>
      <AccordionItem value="a" title="What is ECL?">
        Expected credit loss.
      </AccordionItem>
      <AccordionItem value="b" title="What is IFRS 9?">
        An accounting standard.
      </AccordionItem>
      <AccordionItem value="c" title="Disabled" disabled>
        Hidden.
      </AccordionItem>
    </Accordion>,
  );
}

describe("Accordion", () => {
  it("wires ARIA and respects defaultValue", () => {
    setup({ defaultValue: "a" });
    const a = screen.getByRole("button", { name: "What is ECL?" });
    const b = screen.getByRole("button", { name: "What is IFRS 9?" });
    expect(a).toHaveAttribute("aria-expanded", "true");
    expect(b).toHaveAttribute("aria-expanded", "false");
    const panel = document.getElementById(a.getAttribute("aria-controls")!)!;
    expect(panel).toHaveAttribute("role", "region");
    expect(panel).toHaveAttribute("aria-labelledby", a.id);
    expect(panel).not.toHaveAttribute("inert");
    const panelB = document.getElementById(b.getAttribute("aria-controls")!)!;
    expect(panelB).toHaveAttribute("inert");
  });

  it("single mode opens one at a time and is collapsible", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    setup({ onValueChange });
    const a = screen.getByRole("button", { name: "What is ECL?" });
    const b = screen.getByRole("button", { name: "What is IFRS 9?" });
    await user.click(a);
    expect(a).toHaveAttribute("aria-expanded", "true");
    await user.click(b);
    expect(a).toHaveAttribute("aria-expanded", "false");
    expect(b).toHaveAttribute("aria-expanded", "true");
    await user.click(b);
    expect(b).toHaveAttribute("aria-expanded", "false");
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("multiple mode keeps several open", async () => {
    const user = userEvent.setup();
    setup({ type: "multiple" });
    const a = screen.getByRole("button", { name: "What is ECL?" });
    const b = screen.getByRole("button", { name: "What is IFRS 9?" });
    await user.click(a);
    await user.click(b);
    expect(a).toHaveAttribute("aria-expanded", "true");
    expect(b).toHaveAttribute("aria-expanded", "true");
  });

  it("supports arrow / Home / End navigation, skipping disabled", async () => {
    const user = userEvent.setup();
    setup();
    const a = screen.getByRole("button", { name: "What is ECL?" });
    const b = screen.getByRole("button", { name: "What is IFRS 9?" });
    a.focus();
    await user.keyboard("{ArrowDown}");
    expect(b).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(a).toHaveFocus();
    await user.keyboard("{End}");
    expect(b).toHaveFocus();
    await user.keyboard("{Home}");
    expect(a).toHaveFocus();
  });
});
