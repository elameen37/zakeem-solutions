# Zakeem Solutions — Native Signed Artifact Certificate & Inventory
**Document Version:** 1.0.0  
**Phase:** Phase 89: Production Store Credential Onboarding & Signed Beta Submission  
**Product Title:** Zakeem Solutions  
**Identifier:** `com.zakeemsolutions.app`  
**Semantic Version:** `1.0.0`  

---

## 1. Executive Master Distribution Inventory

This technical certificate audits every target platform artifact, defining its file format, target architecture, cryptographic signing requirements, and verification status.

| Target Platform | Package Format | Standardized Artifact Name | Target Architecture | Signing Mechanism | Required Identity | Status |
| :--- | :---: | :--- | :---: | :--- | :--- | :---: |
| **Android (Store)** | `.aab` | `zakeem-solutions-android-v1.0.0.aab` | `universal` (arm64, armeabi-v7a, x86_64) | Google Play App Signing / Upload Key | Play Console Organization Keystore | `CREDENTIALS_REQUIRED` |
| **Android (Direct)** | `.apk` | `zakeem-solutions-android-v1.0.0.apk` | `universal` | APK Signature Scheme v2/v3 | Release RSA Keystore (`.jks`) | `CREDENTIALS_REQUIRED` |
| **iOS (TestFlight)** | `.ipa` / `.zip` | `zakeem-solutions-ios-v1.0.0.ipa` | `arm64` | Apple Codesign / `altool` | Apple Distribution Certificate + Provisioning Profile | `CREDENTIALS_REQUIRED` |
| **Windows (NSIS)** | `.exe` | `zakeem-solutions-windows-v1.0.0-setup.exe` | `x64` | Authenticode / SignTool | EV Code Signing Certificate / Azure Trusted Signing | `SIGNING_CREDENTIALS_REQUIRED` |
| **Windows (WiX)** | `.msi` | `zakeem-solutions-windows-v1.0.0.msi` | `x64` | Authenticode / SignTool | EV Code Signing Certificate / Azure Trusted Signing | `SIGNING_CREDENTIALS_REQUIRED` |
| **macOS (DMG)** | `.dmg` | `zakeem-solutions-macos-v1.0.0.dmg` | `universal` (Apple Silicon & Intel) | Apple Codesign & NotaryTool | Developer ID Application + Apple Notarization Ticket | `CREDENTIALS_REQUIRED` |
| **macOS (App Bundle)**| `.app.tar.gz` | `zakeem-solutions-macos-v1.0.0.app.tar.gz`| `universal` | Apple Codesign & NotaryTool | Developer ID Application + Apple Notarization Ticket | `CREDENTIALS_REQUIRED` |
| **Linux (AppImage)** | `.AppImage` | `zakeem-solutions-linux-v1.0.0.AppImage` | `x64` | Optional GPG Signature | Release GPG Key (Deployable without signature) | `READY` |
| **Linux (Debian)** | `.deb` | `zakeem-solutions-linux-v1.0.0.deb` | `x64` | Optional GPG Signature | Release GPG Key (Deployable without signature) | `READY` |

---

## 2. Integrity Verification & Provenance Engine

All release builds are cryptographically bound via:
1. **Deterministic Naming:** Strict semantic versioning and platform normalization (`zakeem-solutions-<platform>-v<version>.<ext>`).
2. **Master SHA-256 Checksums:** Consolidated into `SHA256SUMS.txt` during staging.
3. **Build Provenance:** JSON manifest (`PROVENANCE.json`) recording commit SHA, ref name, UTC build timestamp, and signing attestation flags.
4. **Zero Fabrication Guarantee:** No placeholder signatures or self-signed test certificates are presented as production release binaries.

---

## 3. Platform Signing Specifications

### A. Windows SmartScreen Defense
- **Signing Tool:** Microsoft `signtool.exe` with SHA-256 digest algorithm.
- **Timestamping Server:** `http://timestamp.digicert.com` (RFC 3161 compliant).
- **Prerequisite:** Authenticode EV certificate required to prevent Windows Defender SmartScreen untrusted warning.

### B. macOS Gatekeeper Defense
- **Signing Tool:** `/usr/bin/codesign` with hardened runtime (`--options runtime`).
- **Notarization:** `xcrun notarytool submit` with Apple ID / App Store Connect API credentials.
- **Stapling:** `xcrun stapler staple` to embed offline ticket directly into `.dmg`.

### C. Android App Signing
- **Minification:** ProGuard/R8 configured with `proguard-android-optimize.txt`.
- **Target SDK:** 34 with zero cleartext traffic.
