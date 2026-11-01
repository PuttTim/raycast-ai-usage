#!/usr/bin/env bash
# Pulls the latest changes, lets `ray develop` import them into Raycast, builds,
# then stops the dev server. Run with `npm run update`.
set -euo pipefail

# `npm run` adds the local bin directory to PATH; do the same so the script
# also works when run directly.
cd "$(dirname "$0")/.."
PATH="$PWD/node_modules/.bin:$PATH"

READY="built extension successfully"
TIMEOUT_SECONDS=120
log="$(mktemp -t raycast-ai-usage-dev)"
dev_pid=""

cleanup() {
  if [[ -n "$dev_pid" ]] && kill -0 "$dev_pid" 2>/dev/null; then
    # `ray develop` spawns a watcher; stop its children as well as itself.
    pkill -TERM -P "$dev_pid" 2>/dev/null || true
    kill -TERM "$dev_pid" 2>/dev/null || true
    wait "$dev_pid" 2>/dev/null || true
  fi
  rm -f "$log"
}
trap cleanup EXIT INT TERM

git pull --ff-only

echo "Starting ray develop…"
ray develop >"$log" 2>&1 &
dev_pid=$!

for ((elapsed = 0; elapsed < TIMEOUT_SECONDS; elapsed++)); do
  if grep -q "$READY" "$log"; then
    break
  fi

  if ! kill -0 "$dev_pid" 2>/dev/null; then
    cat "$log"
    echo "ray develop exited before it finished building." >&2
    exit 1
  fi

  sleep 1
done

if ! grep -q "$READY" "$log"; then
  cat "$log"
  echo "ray develop did not finish building within ${TIMEOUT_SECONDS}s." >&2
  exit 1
fi

echo "Dev build imported into Raycast. Running ray build…"
ray build
