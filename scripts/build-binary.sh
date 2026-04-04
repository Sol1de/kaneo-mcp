#!/usr/bin/env bash
set -euo pipefail

# Build single-file bundles with esbuild, then create Node SEA binaries.
# Requires: Node.js 22+, esbuild
#
# Usage: ./scripts/build-binary.sh [platform]
#   platform: macos-arm64, macos-x64, linux-x64, win-x64 (default: current platform)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$PROJECT_DIR/build"

mkdir -p "$BUILD_DIR"

echo "==> Bundling with esbuild..."
npx esbuild "$PROJECT_DIR/dist/server.js" \
  --bundle \
  --platform=node \
  --target=node22 \
  --format=cjs \
  --outfile="$BUILD_DIR/kaneo-mcp.cjs" \
  --external:bufferutil \
  --external:utf-8-validate

echo "==> Bundle created: build/kaneo-mcp.cjs"

# Generate SEA config
cat > "$BUILD_DIR/sea-config.json" <<EOF
{
  "main": "$BUILD_DIR/kaneo-mcp.cjs",
  "output": "$BUILD_DIR/sea-prep.blob",
  "disableExperimentalSEAWarning": true
}
EOF

echo "==> Generating SEA blob..."
node --experimental-sea-config "$BUILD_DIR/sea-config.json"

# Determine output name
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
esac

BINARY_NAME="kaneo-mcp-${OS}-${ARCH}"

echo "==> Creating binary: $BINARY_NAME"
cp "$(command -v node)" "$BUILD_DIR/$BINARY_NAME"

# Inject the SEA blob
if [[ "$OS" == "darwin" ]]; then
  codesign --remove-signature "$BUILD_DIR/$BINARY_NAME" 2>/dev/null || true
  npx --yes postject "$BUILD_DIR/$BINARY_NAME" NODE_SEA_BLOB "$BUILD_DIR/sea-prep.blob" \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA
  codesign --sign - "$BUILD_DIR/$BINARY_NAME" 2>/dev/null || true
else
  npx --yes postject "$BUILD_DIR/$BINARY_NAME" NODE_SEA_BLOB "$BUILD_DIR/sea-prep.blob" \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
fi

# Cleanup intermediate files
rm -f "$BUILD_DIR/sea-config.json" "$BUILD_DIR/sea-prep.blob"

echo "==> Done! Binary: build/$BINARY_NAME"
ls -lh "$BUILD_DIR/$BINARY_NAME"
