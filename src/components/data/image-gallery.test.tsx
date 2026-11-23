import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ImageGallery } from "./image-gallery";

const images = [
  { id: "a", src: "blob:a", alt: "Front of the building", caption: "Front", meta: "Ada · 1 Nov" },
  { id: "b", src: null, alt: "Rear yard", loading: true },
  { id: "c", alt: "Gate" },
];

describe("ImageGallery", () => {
  it("renders thumbnails with captions, a spinner while loading and a placeholder when unavailable", () => {
    render(<ImageGallery label="Collateral photos" images={images} />);
    expect(screen.getByRole("group", { name: "Collateral photos" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Front of the building" })).toHaveAttribute("src", "blob:a");
    expect(screen.getByText("Front")).toBeInTheDocument();
    expect(screen.getByText("Loading Rear yard")).toBeInTheDocument();
    expect(screen.getByText("Image not available")).toBeInTheDocument();
  });

  it("opens the lightbox, steps with Next / Previous and shows actions", async () => {
    const user = userEvent.setup();
    render(<ImageGallery label="Photos" images={images} renderActions={(i) => <button type="button">Download {i.id}</button>} />);
    await user.click(screen.getByRole("button", { name: "Front of the building" }));
    expect(screen.getByRole("dialog", { name: "Front of the building" })).toBeInTheDocument();
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download a" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Rear yard" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Previous" }));
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByRole("dialog", { name: "Gate" })).toBeInTheDocument();
  });

  it("shows the empty content when there are no images", () => {
    render(<ImageGallery label="Photos" images={[]} empty="No photos yet." />);
    expect(screen.getByText("No photos yet.")).toBeInTheDocument();
  });
});
