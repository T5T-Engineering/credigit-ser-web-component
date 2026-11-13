import { useMemo, type ComponentProps } from "react";
import qrcode from "qrcode-generator";

import { cx } from "../../utils/cx";

/** QR error-correction level: L ≈ 7 %, M ≈ 15 %, Q ≈ 25 %, H ≈ 30 % of the code can be damaged and still read. */
export type QrErrorCorrection = "L" | "M" | "Q" | "H";

/** Props for {@link QrCode}. */
export type QrCodeProps = Omit<ComponentProps<"svg">, "children"> & {
  /** Text to encode (e.g. an `otpauth://` URI). */
  value: string;
  /** Accessible name — say what scanning it does, never the encoded secret. */
  label: string;
  /** Rendered size in px. Default 192. */
  size?: number;
  /** Error correction. Default "M". */
  errorCorrection?: QrErrorCorrection;
  /** Quiet zone in modules (the spec asks for 4). Default 4. */
  margin?: number;
};

/** The QR module matrix for `value` (true = dark), smallest version that fits. */
export function qrMatrix(value: string, errorCorrection: QrErrorCorrection = "M"): boolean[][] {
  const code = qrcode(0, errorCorrection);
  code.addData(value, "Byte");
  code.make();
  const n = code.getModuleCount();
  return Array.from({ length: n }, (_, row) => Array.from({ length: n }, (_, col) => code.isDark(row, col)));
}

/**
 * A scannable QR code (e.g. authenticator-app set-up). Always dark modules on a light quiet zone, whatever the theme, because
 * scanners don't reliably read inverted codes; colours come from the theme-independent neutral tokens.
 */
export function QrCode({ value, label, size = 192, errorCorrection = "M", margin = 4, className, ...props }: QrCodeProps) {
  const { n, path } = useMemo(() => {
    const matrix = qrMatrix(value, errorCorrection);
    const d = matrix.flatMap((cells, y) => cells.flatMap((dark, x) => (dark ? [`M${x + margin} ${y + margin}h1v1h-1z`] : []))).join("");
    return { n: matrix.length, path: d };
  }, [value, errorCorrection, margin]);
  const extent = n + margin * 2;

  return (
    <svg
      viewBox={`0 0 ${extent} ${extent}`}
      width={size}
      height={size}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={cx("block rounded-md bg-neutral-50 text-neutral-900", className)}
      {...props}
    >
      <title>{label}</title>
      <path d={path} fill="currentColor" />
    </svg>
  );
}
