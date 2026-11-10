import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { NotificationCenter, type AppNotification } from "./notification-center";

const initial: AppNotification[] = [
  { id: "1", title: "Application APP-42 awaits your approval", time: "2 min ago", tone: "info", category: "approvals" },
  { id: "2", title: "Covenant breach: DSCR below 1.2x", time: "1 h ago", tone: "danger", category: "alerts" },
  { id: "3", title: "Report ready", time: "Yesterday", read: true },
];

function Harness() {
  const [items, setItems] = useState(initial);
  return (
    <NotificationCenter
      notifications={items}
      filters={[
        { id: "all", label: "All" },
        { id: "unread", label: "Unread" },
        { id: "alerts", label: "Alerts" },
      ]}
      onMarkRead={(id) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, read: true } : x)))}
      onMarkAllRead={() => setItems((xs) => xs.map((x) => ({ ...x, read: true })))}
    />
  );
}

describe("NotificationCenter", () => {
  it("shows the unread count, marks one read and then all read", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Notifications, 2 unread" }));
    expect(screen.getByRole("dialog", { name: "Notifications" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /APP-42/ }));
    expect(screen.getByRole("button", { name: "Notifications, 1 unread" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mark all read" }));
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark all read" })).toBeDisabled();
  });

  it("filters by unread and category, and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: /Notifications/ }));
    await user.click(screen.getByRole("button", { name: /^Unread\s*\d*$/ }));
    expect(screen.queryByText("Report ready")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Alerts\s*\d*$/ }));
    expect(screen.getByText(/Covenant breach/)).toBeInTheDocument();
    expect(screen.queryByText(/APP-42/)).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
