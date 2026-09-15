#!/usr/bin/env bash
set -e

# Configuration: set GITHUB_REPO to your repository (e.g. owner/repo)
GITHUB_REPO="tanguykonan/box"

BINARY_NAME="box"
INSTALL_DIR="/usr/local/bin"
FALLBACK_DIR="$HOME/.local/bin"

# 1. Detect OS and architecture
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$ARCH" in
    x86_64|amd64)
        CLI_ARCH="x86_64"
        ;;
    aarch64|arm64)
        CLI_ARCH="aarch64"
        ;;
    *)
        echo "Error: unsupported architecture: $ARCH"
        exit 1
        ;;
esac

case "$OS" in
    linux*)
        PLATFORM="linux"
        ;;
    darwin*)
        PLATFORM="darwin"
        ;;
    mingw*|msys*|cygwin*)
        PLATFORM="windows"
        BINARY_NAME="box.exe"
        ;;
    *)
        echo "Error: unsupported OS: $OS"
        exit 1
        ;;
esac

# 2. Resolve target directory
TARGET_DIR="$INSTALL_DIR"
if [ ! -w "$TARGET_DIR" ]; then
    mkdir -p "$FALLBACK_DIR"
    TARGET_DIR="$FALLBACK_DIR"
fi

# 3. Download binary from GitHub Release
DOWNLOAD_URL="https://github.com/${GITHUB_REPO}/releases/latest/download/${BINARY_NAME}-${PLATFORM}-${CLI_ARCH}"

TEMP_FILE="$(mktemp)"

if curl -fsSL "$DOWNLOAD_URL" -o "$TEMP_FILE" 2>/dev/null; then
    chmod +x "$TEMP_FILE"
    mv "$TEMP_FILE" "$TARGET_DIR/$BINARY_NAME"
    echo "Box CLI installed successfully to $TARGET_DIR/$BINARY_NAME"
else
    echo "Error: failed to download from $DOWNLOAD_URL"
    echo "Please check https://github.com/${GITHUB_REPO}/releases"
    exit 1
fi

# 4. Check PATH
if [[ ":$PATH:" != *":$TARGET_DIR:"* ]]; then
    echo "Note: add $TARGET_DIR to your PATH:"
    echo "  export PATH="$PATH:$TARGET_DIR""
fi
