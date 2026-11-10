import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PermissionGate } from "./permission-gate";

describe("PermissionGate", () => {
  it("renders children when allowed", () => {
    render(<PermissionGate allowed>Secret panel</PermissionGate>);
    expect(screen.getByText("Secret panel")).toBeInTheDocument();
  });

  it("renders the default lock fallback when not allowed", () => {
    render(<PermissionGate allowed={false}>Secret panel</PermissionGate>);
    expect(screen.queryByText("Secret panel")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "You don't have access to this" })).toBeInTheDocument();
  });

  it("renders a custom fallback, or nothing with null", () => {
    const { rerender, container } = render(
      <PermissionGate allowed={false} fallback={<p>Ask your admin</p>}>
        Secret
      </PermissionGate>,
    );
    expect(screen.getByText("Ask your admin")).toBeInTheDocument();
    rerender(
      <PermissionGate allowed={false} fallback={null}>
        Secret
      </PermissionGate>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
