param(
  [ValidateSet("dev", "build")]
  [string]$Mode = "build"
)

$ErrorActionPreference = "Stop"

if (-not $PSScriptRoot) {
  throw "Unable to determine script root. Run this script from a saved .ps1 file."
}
Set-Location -Path $PSScriptRoot

Write-Host "Syncing frontend into .tauri-dist..."
if (Test-Path .tauri-dist) {
  Remove-Item .tauri-dist -Recurse -Force
}
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
