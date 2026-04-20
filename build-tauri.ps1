param(
  [ValidateSet("dev", "build")]
  [string]$Mode = "build"
)

$ErrorActionPreference = "Stop"

Write-Host "Syncing frontend into .tauri-dist..."
New-Item -ItemType Directory -Force .tauri-dist | Out-Null
Copy-Item index.html .tauri-dist\ -Force
Copy-Item styles.css .tauri-dist\ -Force
Copy-Item src .tauri-dist\src -Recurse -Force
Copy-Item assets .tauri-dist\assets -Recurse -Force

if ($Mode -eq "dev") {
  Write-Host "Starting Tauri dev runtime..."
  cargo tauri dev
  exit $LASTEXITCODE
}

Write-Host "Building Tauri release bundles..."
cargo tauri build
exit $LASTEXITCODE

