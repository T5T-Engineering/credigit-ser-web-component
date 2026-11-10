#!/usr/bin/env bash
# Usage: scripts/screenshot.sh <url> <output.png> [width] [height]
# Headless Edge screenshot for visual checks (Windows). Each call uses its own profile so parallel runs don't collide.
# Headless Edge can't make its window narrower than ~500px, so widths below 500 go through scripts/screenshot-cdp.mjs,
# which emulates the viewport with the DevTools protocol (Emulation.setDeviceMetricsOverride) and loads the page as a
# normal top-level document. (The old file:// iframe harness made the page third-party, so its storage was blocked and
# apps never got past their loading state.)
URL="$1"; OUT="$2"; W="${3:-1440}"; H="${4:-2400}"
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
DIR="$(cd "$(dirname "$0")" && pwd)"
if [ "$W" -lt 500 ]; then
  node "$DIR/screenshot-cdp.mjs" "$URL" "$(cygpath -m "$OUT")" "$W" "$H" --browser "$(cygpath -m "$EDGE")" >/dev/null || exit 1
  ls -la "$OUT"
  exit 0
fi
PROFILE="$(mktemp -d)"
"$EDGE" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$(cygpath -w "$PROFILE/p")" \
  --virtual-time-budget=5000 --screenshot="$(cygpath -w "$OUT")" --window-size="$W,$H" "$URL" >/dev/null 2>&1
rm -rf "$PROFILE"
ls -la "$OUT"
