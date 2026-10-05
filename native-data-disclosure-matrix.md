# Zakeem Solutions — Native App Privacy & Data Disclosure Matrix
**Document Version:** 1.0.0  
**Application Name:** Zakeem Solutions  
**Identifier:** `com.zakeemsolutions.app`  
**Target Stores:** Google Play Console Data Safety, Apple App Store Nutrition Labels, Microsoft Store  
**Audited Against:** Codebase Implementation (`src/`, `supabase/`, `public/`)  

---

## 1. Data Classification Architecture

To provide full transparency and legal certainty for app store compliance, this matrix classifies every data element collected, stored, or processed by Zakeem Solutions into five distinct operational boundaries:

| Category Code | Storage Boundary | Definition & Handling |
| :--- | :--- | :--- |
| **`SERVER-STORED`** | Production Database (Supabase) | Encrypted at rest (AES-256) and in transit (TLS 1.3). Bound by Row Level Security (RLS). |
| **`LOCAL-ONLY`** | Client Device (`localStorage`, IndexedDB) | Retained solely on the end-user's device for offline recovery, UI preferences, or draft protection. Never transmitted without deliberate user submission. |
| **`SESSION-ONLY`** | Client Memory (`sessionStorage`, RAM) | Ephemeral data purged immediately upon tab closure, window dismissal, or user logout. |
| **`ANALYTICS`** | Client-side telemetry | First-party, pseudonymized interaction tracking (page routes, navigation paths). Zero third-party tracker SDKs. Subject to cookie consent and Do-Not-Track (DNT). |
| **`TRANSACTIONAL`** | Secure API / Edge Functions | Transient data processed solely to dispatch confirmation emails, password reset notifications, or status verifications. |

---

## 2. Complete Data Category Inventory

| Application Flow | Data Fields Collected | Purpose & Usage | Storage Classification | Retention Period | Third-Party Sharing |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **User Authentication** | Email address, password hash, user ID | Account creation, login, portal authorization | `SERVER-STORED` | Duration of active account | None |
| **Auth Session Tokens** | JWT access token, refresh token | Maintaining authenticated session | `LOCAL-ONLY` | Managed by Supabase Auth (revocable) | None |
| **Contact Inquiries** | Name, email, phone number, company name, message | Enterprise inquiries and customer support | `SERVER-STORED` & `TRANSACTIONAL` | Business relationship lifecycle | None |
| **Demo Requests** | Name, email, organization, job title, product choice, preferred date/time | Scheduling product walk-throughs & consultations | `SERVER-STORED` & `TRANSACTIONAL` | CRM sales cycle | None |
| **IT Training Applications**| Full name, email, phone, state, education level, track selection | Admissions review, course enrollment | `SERVER-STORED` & `TRANSACTIONAL` | Academic cohort duration | None |
| **Training Status Checks** | Application reference code | Checking admissions status | `TRANSACTIONAL` | Read-only lookup query | None |
| **Client Portal Data** | Project scopes, invoices, support tickets, file deliverables | Client project collaboration | `SERVER-STORED` | Contractual term + statutory requirement | None |
| **CRM & Scheduling** | Lead status, meeting notes, appointment timestamps | Enterprise operations & scheduling | `SERVER-STORED` | CRM operational lifecycle | None |
| **Form Draft Recovery** | In-progress form inputs (contact, demo, training) | Preventing accidental data loss when offline | `LOCAL-ONLY` | Local storage until submission or manual dismissal | None |
| **UI Theme Preference** | Theme string (`light` or `dark`) | Preserving user interface appearance | `LOCAL-ONLY` | Persistent until cleared by user | None |
| **Cookie Consent** | Consent state (`accepted`, `declined`, preferences) | Compliance with privacy regulations | `LOCAL-ONLY` | 1 year / until cleared | None |
| **ZakkyAI Conversation**| User prompt queries, AI responses | Interactive product navigation assistance | `SESSION-ONLY` | Cleared on page refresh or session reset | None |
| **Page Navigation Analytics** | Anonymized page URL, referrer, timestamp, device type | First-party platform performance optimization | `ANALYTICS` | 90 days aggregated logs | None |
| **Service Worker Cache** | Application HTML shell, CSS, JavaScript chunks, brand assets | Offline app shell availability | `LOCAL-ONLY` | Updated during service worker lifecycle | None |

---

## 3. Google Play Data Safety Declaration

Based on Google Play Console requirements, declare the following responses:

### A. Data Collection and Security
- **Does your app collect or share any user data?** Yes.
- **Is all of the user data collected by your app encrypted in transit?** Yes (Enforced via HTTPS/TLS 1.3).
- **Do you provide a way for users to request that their data be deleted?** Yes (via privacy contact: `privacy@zakeemsolutions.com` or `support@zakeemsolutions.com`).

### B. Data Types Collected & Declared:

1. **Name**
   - *Collected:* Yes
   - *Shared:* No
   - *Ephemerally processed:* No
   - *Required or Optional:* Required for contact inquiries, demo requests, and training applications
   - *Purposes:* App functionality, Account management, Customer communication

2. **Email Address**
   - *Collected:* Yes
   - *Shared:* No
   - *Ephemerally processed:* No
   - *Required or Optional:* Required
   - *Purposes:* App functionality, Account management, Customer communication

3. **Phone Number**
   - *Collected:* Yes
   - *Shared:* No
   - *Ephemerally processed:* No
   - *Required or Optional:* Optional for general contact; Required for training admissions
   - *Purposes:* App functionality, Account management, Customer communication

4. **User IDs**
   - *Collected:* Yes (Authenticated portal users)
   - *Shared:* No
   - *Purposes:* Account management

5. **Financial Information**
   - *Credit Card / Payment info:* **NOT COLLECTED DIRECTLY IN NATIVE APP** (Any enterprise billing is handled via institutional invoicing or direct enterprise banking).

6. **Device or other IDs**
   - *Collected:* No persistent hardware identifiers (IMEI, MAC, Android ID) are collected.

---

## 4. Apple App Store Privacy Nutrition Labels

Based on App Store Connect App Privacy declarations:

### Data Used to Track You
**None.** Zakeem Solutions does not track users across apps and websites owned by other companies.

### Data Linked to You (Authenticated Users)
The following data may be collected and linked to the user's identity:
- **Contact Info:** Name, Email Address, Phone Number
- **User Content:** Customer Support communications, Portal project records
- **Identifiers:** User ID (for authenticated Client Portal users)

### Data Not Linked to You
- **Usage Data:** Product Interaction (anonymized page views, session counts for performance optimization)
- **Diagnostics:** Crash diagnostics and performance telemetry (anonymized)

---

## 5. Non-Collection & Zero-Exfiltration Guarantees

In strict conformance with enterprise security baselines:
- **Zero Location Tracking:** No GPS, fine, or coarse geolocation APIs are invoked.
- **Zero Sensor Access:** No microphone, camera, accelerometer, or biometric hardware access is requested or permitted.
- **Zero Advertising SDKs:** The application contains zero ad network SDKs (Google AdMob, Meta Audience Network, etc.).
- **Zero Third-Party Data Brokers:** Telemetry and client records are never sold, rented, or monetized.
- **Zero Project A Contamination:** No data from Project A (`zakeem-realty-erp`) is collected, accessed, or leaked.
