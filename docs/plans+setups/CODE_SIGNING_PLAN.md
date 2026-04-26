# Code Signing Plan (Windows-First)

## Scope
- First release target: Windows installers (`.msi`, `.exe`) and optional portable zip.
- Goal: reduce SmartScreen warnings and improve trust for distribution.

## Certificate Strategy
- Preferred: OV code signing certificate (faster procurement, lower cost).
- Future upgrade: EV certificate (best SmartScreen reputation path).

## Artifacts To Sign
- `src-tauri/target/release/app.exe`
- `src-tauri/target/release/bundle/msi/TerrainPrototype_0.1.0_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/TerrainPrototype_0.1.0_x64-setup.exe`

## Signing Tooling
- Use `signtool.exe` from Windows SDK.
- Timestamp with RFC3161 endpoint (provider choice from certificate vendor).

## Signing Steps (Windows)
1. Install cert in Current User certificate store or use hardware token flow.
2. Sign EXE and installer artifacts with SHA-256 digest.
3. Add trusted timestamp.
4. Verify signatures:
   - `signtool verify /pa <artifact>`
5. Re-check SmartScreen behavior on a clean machine.

## CI/CD Direction (Later)
- Keep private key outside repo.
- Use secure secret/hardware-backed signing in CI.
- Gate release publishing on successful signature verification.

## macOS (Future)
- If macOS target is enabled later:
  - Apple Developer ID cert
  - notarization
  - stapling notarization ticket to distributables

