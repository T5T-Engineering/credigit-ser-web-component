#!/usr/bin/env bash
# Usage: scripts/screenshot.sh <url> <output.png> [width] [height]
# Headless Edge screenshot for visual checks (Windows). Each call uses its own profile so parallel runs don't collide.
# Headless Edge can't go narrower than ~500px, so widths below 500 render the page inside an iframe of that width.
URL="$1"; OUT="$2"; W="${3:-1440}"; H="${4:-2400}"
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
PROFILE="$(mktemp -d)"
TARGET="$URL"; WIN_W="$W"
if [ "$W" -lt 500 ]; then
  HARNESS="$PROFILE/frame.html"
  printf '<html><body style="margin:0;background:#888"><iframe src="%s" style="border:0;width:%spx;height:%spx;display:block"></iframe></body></html>' "$URL" "$W" "$H" > "$HARNESS"
  TARGET="file:///$(cygpath -m "$HARNESS")"; WIN_W=500
fi
"$EDGE" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$(cygpath -w "$PROFILE/p")" \
  --virtual-time-budget=5000 --screenshot="$(cygpath -w "$OUT")" --window-size="$WIN_W,$H" "$TARGET" >/dev/null 2>&1
rm -rf "$PROFILE"
ls -la "$OUT"
