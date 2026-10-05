# Zakeem Solutions — Google Play Internal Beta Submission Specification
**Document Version:** 1.0.0  
**Phase:** Phase 89: Production Store Credential Onboarding & Signed Beta Submission  
**Application Title:** Zakeem Solutions  
**Package Identifier:** `com.zakeemsolutions.app`  
**Target Bundle:** Android App Bundle (`.aab`)  
**Standardized Filename:** `zakeem-solutions-android-v1.0.0.aab`  
**Distribution Channel:** Google Play Console — Internal Testing Track (Closed Beta)  

---

## 1. Executive Summary & Verification Posture

This document governs the transition of Zakeem Solutions from native packaging certification into the **signed internal beta distribution stage** on Google Play. 

In accordance with executive engineering directives:
- Zero fabrication of release upload signatures or Google Play Console deployment.
- Technical prerequisites implemented in the codebase are marked **`READY`**.
- Hardware prerequisites are marked **`PHYSICAL_DEVICE_NOT_VERIFIED`**.
- Administrative / secret key requirements are marked **`CREDENTIALS_REQUIRED`**.

---

## 2. Technical Packaging & Gradle Audit

| Configuration Item | Audited Value | Location | Status | Audit Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Application ID** | `com.zakeemsolutions.app` | `build.gradle.kts` | `READY` | Matches global bundle identifier. |
| **Version Code** | `1` | `build.gradle.kts` | `READY` | Positive integer for Play Console versioning. |
| **Version Name** | `1.0.0` | `build.gradle.kts` | `READY` | Semantic Versioning aligned with `package.json`. |
| **Minimum SDK** | `minSdk = 24` (Android 7.0) | `build.gradle.kts` | `READY` | Covers ~96% of global Android ecosystem. |
| **Target SDK** | `targetSdk = 34` (Android 14) | `build.gradle.kts` | `READY` | Full compliance with Play Target API policy. |
| **Compile SDK** | `compileSdk = 34` | `build.gradle.kts` | `READY` | Matches target API level. |
| **Minification / R8** | `isMinifyEnabled = true` | `build.gradle.kts` | `READY` | Shrunk & obfuscated with ProGuard. |
| **Cleartext Traffic** | `usesCleartextTraffic = false` | `AndroidManifest.xml` | `READY` | Zero cleartext HTTP; TLS 1.3 enforced. |
| **Network Permissions**| `INTERNET`, `ACCESS_NETWORK_STATE` | `AndroidManifest.xml` | `READY` | Least privilege strictly enforced. |
| **Hardware Sensors** | Zero permissions requested | `AndroidManifest.xml` | `READY` | No camera, audio, location, or contacts. |
| **Custom URI Scheme** | `zakeem://` | `AndroidManifest.xml` | `READY` | Intent filter registered and tested. |
| **App Links Domain** | `https://www.zakeemsolutions.com` | `AndroidManifest.xml` | `READY` | Configured with `android:autoVerify="true"`. |

---

## 3. Signing Architecture & Credentials Status

- **Signing Method:** Google Play App Signing (Play Console manages device delivery keys; application signed with organization Upload Key).
- **Upload Key Keystore:** 4096-bit RSA `.jks` file with SHA-256 digest.
- **CI/CD Integration:** Gated via GitHub Secret `ANDROID_KEYSTORE_BASE64` and environment variables (`ANDROID_KEYSTORE_FILE`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`).
- **Current Status:** **`CREDENTIALS_REQUIRED`**  
  *Operational Note:* The local workstation and repository do not contain the executive release keystore. Keystore generation and enrollment must occur via organization management. Zero placeholder keys are committed to Git.

---

## 4. Android App Links & Digital Asset Links Audit

- **Verification Attribute:** `android:autoVerify="true"` verified in `AndroidManifest.xml`.
- **Domain:** `https://www.zakeemsolutions.com/.well-known/assetlinks.json`
- **Target Package:** `com.zakeemsolutions.app`
- **Certificate Fingerprint Status:** **`CREDENTIALS_REQUIRED`**  
  *Operational Note:* The digital asset links file `public/.well-known/assetlinks.json` has been prepared. The production SHA-256 certificate fingerprint will be injected immediately upon release keystore creation in Google Play Console.

---

## 5. Google Play Console Beta Workflow

1. **Track Creation:** Navigate to *Testing > Internal testing* in Google Play Console.
2. **Release Name:** `1.0.0 (Internal Beta 1)`.
3. **Artifact Upload:** Upload `zakeem-solutions-android-v1.0.0.aab`.
4. **Release Notes (Internal Beta):**
   ```
   Zakeem Solutions 1.0.0 Internal Beta
   - Initial native enterprise platform release
   - Full Zakeem Realty ERP showcase & interactive ROI calculator
   - ZakkyAI interactive intelligence widget
   - Enterprise IT Training syllabus & admissions application
   - Safe offline draft recovery and network status resilience
   ```
5. **Tester Email List:** Invite internal engineering and executive QA email group.
6. **Console Status:** **`CREDENTIALS_REQUIRED`** (Awaiting organization Google Play Console enrollment).
7. **Production Safeguard:** Strictly prohibited from promoting to Production track until signed beta testing passes.
