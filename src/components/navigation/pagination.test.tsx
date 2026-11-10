import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { Pagination, paginationRange } from "./pagination";

describe("paginationRange", () => {
  it("lists every page when they fit", () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("condenses with ellipses around the current page", () => {
    expect(paginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    expect(paginationRange(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
    expect(paginationRange(10, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
    expect(paginationRange(10, 20, 2)).toEqual([1, "ellipsis", 8, 9, 10, 11, 12, "ellipsis", 20]);
  });

  it("handles empty input", () => {
    expect(paginationRange(1, 0)).toEqual([]);
  });
});

describe("Pagination", () => {
  it("marks the current page and changes page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={5} pageCount={10} onPageChange={onPageChange} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 5" })).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByRole("button", { name: "Page 6" }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);
    await user.click(screen.getByRole("button", { name: "Page 5" }));
    expect(onPageChange).toHaveBeenCalledTimes(3);
  });

  it("disables previous on the first page and next on the last", () => {
    const { rerender } = render(<Pagination page={1} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    rerender(<Pagination page={3} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} pageCount={1} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
