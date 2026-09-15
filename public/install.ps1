$ErrorActionPreference = "Stop"

# Configuration: set GITHUB_REPO to your repository (e.g. owner/repo)
$GITHUB_REPO = "tanguykonan/box"

$BINARY_NAME = "box.exe"
$INSTALL_DIR = "$env:LOCALAPPDATA\Programs\box"

# 1. Ensure target directory exists
if (-not (Test-Path $INSTALL_DIR)) {
    New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
}

# 2. Download from GitHub Release
$DOWNLOAD_URL = "https://github.com/$GITHUB_REPO/releases/latest/download/box-windows-x86_64.exe"
$TARGET_PATH = Join-Path $INSTALL_DIR $BINARY_NAME

try {
    Invoke-WebRequest -Uri $DOWNLOAD_URL -OutFile $TARGET_PATH -UseBasicParsing
    Write-Host "Box CLI installed successfully to $TARGET_PATH"
} catch {
    Write-Host "Error: failed to download from $DOWNLOAD_URL"
    Write-Host "Please check https://github.com/$GITHUB_REPO/releases"
    exit 1
}

# 3. Add to user PATH if missing
$USER_PATH = [Environment]::GetEnvironmentVariable("Path", "User")
if ($USER_PATH -notlike "*$INSTALL_DIR*") {
    [Environment]::SetEnvironmentVariable("Path", "$USER_PATH;$INSTALL_DIR", "User")
    Write-Host "Note: $INSTALL_DIR has been added to your user PATH."
}
