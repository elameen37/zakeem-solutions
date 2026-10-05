# Zakeem Solutions — App Store & Distribution Asset Checklist
**Document Version:** 1.0.0  
**Target Release:** Production Release 1.0.0  
**Application Identifier:** `com.zakeemsolutions.app`  

This document serves as the operational gate for marketing, design, and release engineering teams before initiating public distribution across mobile app stores and desktop software catalogs.

---

## 1. Status Legend

- **`READY`**: Asset, metadata, or URL is generated, verified, and present in the project.
- **`NEEDS ASSET`**: Visual design or creative asset requires rendering/export by the design team.
- **`NEEDS EXTERNAL ACCOUNT`**: Requires organization enrollment, developer subscription, or token generation.
- **`NEEDS HUMAN REVIEW`**: Requires executive, legal, or product owner sign-off prior to submission.

---

## 2. Google Play Store Asset Checklist

| Asset Item | Dimension / Specification | Format | Current Status | Notes & Location |
| :--- | :--- | :---: | :---: | :--- |
| **App Icon** | 512 x 512 px (32-bit PNG, max 1MB) | PNG | `READY` | Source: `public/icon-512x512.png` |
| **Adaptive Icons** | Foreground + Background (108dp) | XML/PNG | `READY` | Located in `src-tauri/gen/android/app/src/main/res/mipmap-*` |
| **Feature Graphic** | 1024 x 500 px (no transparency) | PNG/JPEG | `NEEDS ASSET` | Required for Play Store hero banner |
| **Phone Screenshots** | Min 2, Max 8 (16:9 or 9:16, e.g. 1080x1920) | PNG/JPEG | `NEEDS ASSET` | Capture Home, Services, ZakkyAI, Training, Portal |
| **7-inch Tablet Screenshots** | Min 1, Max 8 (1200x1920 or equivalent) | PNG/JPEG | `NEEDS ASSET` | Required for tablet tier discovery |
| **10-inch Tablet Screenshots**| Min 1, Max 8 (1600x2560 or equivalent) | PNG/JPEG | `NEEDS ASSET` | Required for enterprise tablet certification |
| **App Title** | Up to 30 characters: "Zakeem Solutions" | Plaintext | `READY` | Defined in `native-store-metadata.md` |
| **Short Description** | Up to 80 characters | Plaintext | `READY` | Defined in `native-store-metadata.md` |
| **Full Description** | Up to 4000 characters | Plaintext | `READY` | Defined in `native-store-metadata.md` |
| **Privacy Policy URL** | Active HTTPS URL | URL | `READY` | `https://www.zakeemsolutions.com/privacy` |
| **App Category** | Business / Productivity | Enum | `READY` | Primary: Business |
| **Content Rating Form** | IARC Questionnaire in Play Console | Form | `NEEDS HUMAN REVIEW` | Questionnaire completion in console |
| **Data Safety Section** | Play Console Data Safety Declaration | Matrix | `READY` | Mapped in `native-data-disclosure-matrix.md` |
| **Developer Account** | Google Play Console Organization | Account | `NEEDS EXTERNAL ACCOUNT` | One-time $25 registration fee |
| **Play Signing Keystore** | Upload key (`.jks` / `.keystore`) | Cryptographic | `NEEDS EXTERNAL ACCOUNT` | Store in repository GitHub Secrets |

---

## 3. Apple App Store (iOS & macOS) Checklist

| Asset Item | Dimension / Specification | Format | Current Status | Notes & Location |
| :--- | :--- | :---: | :---: | :--- |
| **App Store Icon** | 1024 x 1024 px (no transparency) | PNG | `READY` | Generated from canonical brand assets |
| **iPhone 6.7" Display Screenshots** | 1290 x 2796 px (Portrait) | PNG | `NEEDS ASSET` | iPhone 15/16 Pro Max resolution |
| **iPhone 6.5" Display Screenshots** | 1242 x 2688 px (Portrait) | PNG | `NEEDS ASSET` | iPhone 11 Pro Max / XS Max resolution |
| **iPad 12.9" Display Screenshots** | 2048 x 2732 px (Portrait/Landscape) | PNG | `NEEDS ASSET` | iPad Pro 6th generation |
| **macOS Desktop Screenshots** | 16:10 or 16:9 (e.g. 2880 x 1800) | PNG | `NEEDS ASSET` | For Mac App Store (if pursued) |
| **App Name** | Up to 30 characters: "Zakeem Solutions" | Plaintext | `READY` | Defined in `native-store-metadata.md` |
| **Subtitle** | Up to 30 characters | Plaintext | `READY` | "Enterprise Digital Solutions" |
| **Keywords** | Up to 100 characters (comma-separated) | Plaintext | `READY` | Defined in `native-store-metadata.md` |
| **Promotional Text** | Up to 170 characters | Plaintext | `READY` | Defined in `native-store-metadata.md` |
| **Description** | Up to 4000 characters | Plaintext | `READY` | Defined in `native-store-metadata.md` |
| **Support URL** | Active HTTPS URL | URL | `READY` | `https://www.zakeemsolutions.com/support` |
| **Marketing URL** | Active HTTPS URL | URL | `READY` | `https://www.zakeemsolutions.com` |
| **Privacy Policy URL** | Active HTTPS URL | URL | `READY` | `https://www.zakeemsolutions.com/privacy` |
| **Age Rating** | 4+ (No unrestricted web, no mature content) | Questionnaire | `READY` | Meets Apple 4+ guidelines |
| **App Privacy Details** | App Privacy Nutrition Labels | Form | `READY` | Mapped in `native-data-disclosure-matrix.md` |
| **Apple Developer Account**| Apple Developer Enterprise / Company | Account | `NEEDS EXTERNAL ACCOUNT` | Annual $99 Apple Developer subscription |
| **App Store Connect API Key** | `p8` key + Key ID + Issuer ID | Secret | `NEEDS EXTERNAL ACCOUNT` | For automated notarization & TestFlight |

---

## 4. Microsoft Store & Windows Direct Distribution Checklist

| Asset Item | Dimension / Specification | Format | Current Status | Notes & Location |
| :--- | :--- | :---: | :---: | :--- |
| **Windows App Icon** | Multi-size ICO (16x16 to 256x256) | ICO | `READY` | Located at `src-tauri/icons/icon.ico` |
| **NSIS Installer Icon** | Embedded icon | ICO | `READY` | Configured in `src-tauri/tauri.conf.json` |
| **Store Tile Assets** | 300x300, 150x150, 71x71, 44x44 px | PNG | `READY` | Standard Tauri asset suite |
| **Desktop Screenshots** | 1920 x 1080 px (16:9) | PNG | `NEEDS ASSET` | 4-6 desktop captures |
| **Authenticode EV Certificate** | Hardware Token / Azure Trusted Signing | Digital Cert | `NEEDS EXTERNAL ACCOUNT` | Eliminates SmartScreen warnings |
| **RFC 3161 Timestamping** | DigiCert Timestamp Authority | URL | `READY` | `http://timestamp.digicert.com` |
| **Partner Center Account**| Microsoft Partner Center (if MS Store) | Account | `NEEDS EXTERNAL ACCOUNT` | If publishing to Microsoft Store |

---

## 5. Direct macOS Distribution Checklist (Outside Mac App Store)

| Asset Item | Specification | Format | Current Status | Notes & Location |
| :--- | :--- | :---: | :---: | :--- |
| **macOS ICNS Icon** | Multi-resolution 512x512@2x | ICNS | `READY` | Located at `src-tauri/icons/icon.icns` |
| **DMG Background Graphic** | 660 x 400 px window layout | PNG/TIFF | `READY` | Tauri DMG configuration in place |
| **Apple Developer ID Cert** | "Developer ID Application: ..." | `.p12` | `NEEDS EXTERNAL ACCOUNT` | Cryptographic signature for Gatekeeper |
| **Apple Notary Ticket** | Albatross / notarytool ticket | Ticket | `NEEDS EXTERNAL ACCOUNT` | Required to prevent "Cannot be opened" alert |
| **SHA-256 Manifest** | Cryptographic digest file | TXT | `READY` | Emitted by `generate-provenance.mjs` |

---

## 6. Linux Direct Distribution Checklist

| Asset Item | Specification | Format | Current Status | Notes & Location |
| :--- | :--- | :---: | :---: | :--- |
| **Desktop Icon** | 512x512 PNG + SVG | PNG/SVG | `READY` | Located at `src-tauri/icons/128x128@2x.png` |
| **Desktop Entry File** | `.desktop` standard XDG specification | Text | `READY` | Handled automatically by Tauri bundle |
| **Debian Control File** | Architecture, dependencies, maintainer | Text | `READY` | Handled by Tauri Debian target |
| **GPG Detached Signature** | Optional GPG signature (`.asc`) | Signature | `READY` | Toolchain supports external signature |
| **SHA-256 Manifest** | Cryptographic digest file | TXT | `READY` | Emitted by `generate-provenance.mjs` |

---

## 7. Action Plan Summary for Media & Creative Teams

To transition all items marked `NEEDS ASSET` to `READY`:
1. **Produce 6 High-Fidelity App Screenshots:**
   - Screen 1: Executive Homepage & Enterprise Solutions overview.
   - Screen 2: Zakeem Realty ERP Showcase & architectural capabilities.
   - Screen 3: ZakkyAI conversational assistant in action.
   - Screen 4: IT Training & Academy curriculum view.
   - Screen 5: Client Portal authentication and project tracking.
   - Screen 6: Light / Dark theme ergonomics and responsive UI.
2. **Produce Google Play Feature Graphic (1024 x 500 px):**
   - Brand Navy background (`#030e21` / `#020817`), orange accent lighting (`#e57804`), Zakeem Solutions logo, and headline: "Enterprise Solutions & Digital Infrastructure".
