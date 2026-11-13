import { render, screen } from "@testing-library/react";

import { QrCode, qrMatrix } from "./qr-code";

describe("QrCode", () => {
  it("builds a square matrix with the three finder patterns", () => {
    const m = qrMatrix("otpauth://totp/Credigit:ada%40bank.example?secret=GEZDGNBVGY3TQOJQ&issuer=Credigit");
    const n = m.length;
    expect(n).toBeGreaterThanOrEqual(21);
    expect((n - 17) % 4).toBe(0); // QR versions are 21, 25, 29 … modules wide
    for (const [r, c] of [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ] as const) {
      expect(m[r]![c]).toBe(true); // finder corner
      expect(m[r + 3]![c + 3]).toBe(true); // finder centre
      expect(m[r + 1]![c + 1]).toBe(false); // finder ring
    }
  });

  it("grows with the data and the error-correction level", () => {
    expect(qrMatrix("x".repeat(200)).length).toBeGreaterThan(qrMatrix("x").length);
    expect(qrMatrix("x".repeat(60), "H").length).toBeGreaterThan(qrMatrix("x".repeat(60), "L").length);
  });

  it("renders an accessible image sized with a quiet zone and never exposes the value as text", () => {
    const secret = "otpauth://totp/A:b?secret=SECRETVALUE";
    const { container } = render(<QrCode value={secret} label="Scan with your authenticator app" size={160} />);
    const img = screen.getByRole("img", { name: "Scan with your authenticator app" });
    expect(img).toHaveAttribute("width", "160");
    const extent = qrMatrix(secret).length + 8;
    expect(img).toHaveAttribute("viewBox", `0 0 ${extent} ${extent}`);
    expect(container.textContent).not.toContain("SECRETVALUE");
  });
});
