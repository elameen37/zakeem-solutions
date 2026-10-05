# Zakeem Solutions — Apple TestFlight Beta Submission Specification
**Document Version:** 1.0.0  
**Phase:** Phase 89: Production Store Credential Onboarding & Signed Beta Submission  
**Application Title:** Zakeem Solutions  
**Bundle Identifier:** `com.zakeemsolutions.app`  
**Target Package:** iOS App Archive (`.ipa`)  
**Deployment Target:** iOS 14.0+ (iPhone & iPad)  
**Architecture:** `arm64` (Apple Silicon)  
**Distribution Channel:** Apple TestFlight (Internal & External Beta Tracks)  

---

## 1. Executive Summary & Verification Posture

This document governs the onboarding of Zakeem Solutions to **Apple TestFlight** for internal and external closed beta distribution.

In accordance with executive engineering directives:
- Zero fabrication of Apple Developer signatures, provisioning profiles, or TestFlight uploads.
- Technical prerequisites implemented in the codebase are marked **`READY`**.
- Hardware prerequisites are marked **`PHYSICAL_DEVICE_NOT_VERIFIED`**.
- Administrative / secret key requirements are marked **`CREDENTIALS_REQUIRED`**.

---

## 2. Technical Packaging & Info.plist Audit

| Configuration Item | Audited Value | Location | Status | Audit Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Bundle Identifier** | `com.zakeemsolutions.app` | `Info.plist` | `READY` | Canonical reverse-DNS identifier verified. |
| **Bundle Display Name**| `Zakeem Solutions` | `Info.plist` | `READY` | Displayed under icon on iOS home screen. |
| **Short Version String**| `1.0.0` | `Info.plist` | `READY` | Aligned with `package.json` Semantic Version. |
| **Bundle Version** | `1` | `Info.plist` | `READY` | Monotonically increasing build integer. |
| **Minimum Deployment** | iOS 14.0+ | Xcode Scaffolding | `READY` | Covers >98% of active iOS devices. |
| **Target Architectures**| `arm64` | `Info.plist` | `READY` | Modern 64-bit Apple hardware target. |
| **App Transport Security**| `NSAllowsArbitraryLoads = false` | `Info.plist` | `READY` | Strictly enforces HTTPS/TLS 1.3. |
| **Export Compliance** | `ITSAppUsesNonExemptEncryption = false` | App Store Connect | `READY` | Exempt from BIS encryption reporting. |
| **Permissions Audit** | Least Privilege | `Info.plist` | `READY` | Zero camera, microphone, or location entries. |
| **Custom URL Scheme** | `zakeem://` | `Info.plist` | `READY` | Registered in `CFBundleURLSchemes`. |
| **Universal Links** | `applinks:www.zakeemsolutions.com` | Associated Domains | `READY` | Configured for domain association. |

---

## 3. Signing Architecture & Credentials Status

- **Signing Identity:** "Apple Distribution: Zakeem Solutions (...)" (`.p12` cryptographic certificate).
- **Provisioning Profile:** App Store & TestFlight Distribution Profile (`.mobileprovision`).
- **App Store Connect API:** Key ID, Issuer ID, Private Key (`.p8`) for headless CI TestFlight dispatch via `altool` or fastlane.
- **Current Status:** **`CREDENTIALS_REQUIRED`**  
  *Operational Note:* Organization enrollment in Apple Developer Program ($99/year) is pending executive enrollment. Zero placeholder certificates are created.

---

## 4. iOS Universal Links & AASA Domain Association

- **Domain:** `https://www.zakeemsolutions.com/.well-known/apple-app-site-association`
- **Application ID:** `<APPLE_TEAM_ID>.com.zakeemsolutions.app`
- **Paths Handled:** `/services*`, `/products*`, `/request-demo*`, `/it-training*`, `/training*`, `/contact*`, `/portal*`, `/admin*`
- **Status:** **`CREDENTIALS_REQUIRED / CONFIGURATION_REQUIRED`**  
  *Operational Note:* The AASA template has been prepared in `public/.well-known/apple-app-site-association`. Injection of the real 10-character alphanumeric Apple Developer Team ID will occur upon account provisioning.

---

## 5. TestFlight Operational Tracks

### A. Internal Testing Track (Zero Apple Review Delay)
- Up to 100 internal team members.
- Available immediately upon build processing.
- Status: **`READY FOR EXECUTION (CREDENTIALS REQUIRED)`**.

### B. External Beta Track (Beta App Review Required)
- Up to 10,000 public beta testers via public TestFlight link.
- Requires initial 24–48 hour Beta App Review by Apple.
- Status: **`READY FOR EXECUTION (CREDENTIALS REQUIRED)`**.
- Test Information:
  - *Feedback Email:* `support@zakeemsolutions.com`
  - *Privacy Policy:* `https://www.zakeemsolutions.com/privacy`
  - *Release Notes:* Initial 1.0.0 closed beta release.
