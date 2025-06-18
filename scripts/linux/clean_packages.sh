#!/bin/bash

# * chmod +x scripts/linux/clean-packages.sh
# * ./scripts/linux/clean-packages.sh

echo "Cleaning node_modules, lock files, and build caches..."

ROOT_DIR=$(pwd)
CLIENT_DIR="$ROOT_DIR/client"
SERVER_DIR="$ROOT_DIR/server"

clean_workspace() {
  TARGET="$1"
  echo "Cleaning: $TARGET"

  rm -rf "$TARGET/node_modules"
  rm -rf "$TARGET/.next" "$TARGET/.turbo" "$TARGET/.cache" "$TARGET/dist"
  rm -f "$TARGET/pnpm-lock.yaml" "$TARGET/yarn.lock" "$TARGET/package-lock.json"

  echo "Done: $TARGET"
  echo
}

clean_workspace "$ROOT_DIR"
clean_workspace "$CLIENT_DIR"
clean_workspace "$SERVER_DIR"

echo "All clean completed."
