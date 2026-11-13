# PostCare: A Postnatal Follow-Up & Warning-Sign Companion

> **"Scan. Check in. Stay safe after discharge."**  
> *A B.Tech Computer Science Minor Project — Zero-friction, offline-capable maternal healthcare companion.*

---

## 1. Project Overview & Clinical Context

In India, the weeks immediately following childbirth represent the highest-risk period for maternal morbidity and mortality — primarily from **postpartum hemorrhage (PPH)**, **puerperal infections / sepsis**, **postpartum pre-eclampsia / hypertension**, and **postpartum depression (PPD)**. 

While institutional delivery and early postnatal contact within 48 hours have significantly improved (rising from **37% in NFHS-3 to 78% in NFHS-5**), follow-up beyond the first 48 hours is severely neglected:
- **Severe Follow-Up Drop-Off:** In an indicative district study in Faridabad, Haryana, **67.3% of mothers received no postnatal care** and only **11.2% completed all four WHO-recommended visits**.
- **Postpartum Depression:** A meta-analysis of 38 Indian studies (20,043 women) estimated a **22% prevalence of postpartum depression**, strongly linked to lack of family support and marital strain.
- **Thin Discharge Teaching:** Studies indicate that over 85% of hospital discharge counseling lasts under 15 minutes, leaving mothers and family members unprepared to recognize critical warning signs.

**PostCare** bridges this post-discharge gap. At hospital discharge, the nurse enrols the mother and prints or hands over a **personal QR code pass**. The mother or family member simply scans the QR code with any smartphone camera:
- **Zero Friction:** No app installation from app stores, no password, and no account creation.
- **Privacy by Design:** Accessed via a secure random cryptographic token in the URL hash (`#/mother/<token>`). Patient names are never exposed in URLs.
- **Offline-First PWA:** Works seamlessly even in areas with spotty internet connectivity. Check-ins are saved locally and synced automatically when connected.

---

## 2. Key Features

### A) Mother & Family Companion Portal
1. **WHO Postnatal Visit Timeline:** Dynamically tracks the four WHO-recommended visits from delivery date:
   - *Visit 1:* Within 24 hours
   - *Visit 2:* 48–72 hours (Day 3)
   - *Visit 3:* Day 7 (Week 1)
   - *Visit 4:* Week 6 (Day 42)
   - Status indicators: `Done`, `Due Today`, `Missed`, or `Upcoming`.
2. **Adaptive Weekly Check-In:**
   - 5 core Yes/No danger sign questions (Bleeding, Fever, Severe Headache / Vision changes, Breathing / Chest pain, Wound pain / Leg swelling).
   - Dynamic branching: Follow-up questions appear **only** when a mother indicates "Yes".
   - Baby feeding check & emotional mood screening.
   - **A healthy mother finishes in under 1 minute!**
3. **Trend-Aware, Explainable Triage (Green / Amber / Red):**
   - Immediate evaluation with an actionable plain-language recommendation.
   - **Clinical "Why-Line":** Names the exact medical rule that triggered the status (e.g. `Amber [R6]: Fever 38.2°C reported` or `Amber [R10]: Wound pain worse than last check-in`).
   - Compares symptoms against previous check-ins to detect negative recovery trajectories.
4. **Edinburgh Postnatal Depression Scale (EPDS):**
   - Full 10-question validated depression screen (Cox, Holden & Sagovsky, 1987).
   - Administered at ~2 weeks and ~6 weeks postpartum.
   - **Immediate Self-Harm Protocol:** If **Item 10 > 0**, an immediate prominent emergency alert is displayed with direct access to India's national **Tele-MANAS helpline (14416 / 1800-891-4416)** and an urgent nurse alert is raised.
5. **Contextual Education with Audio Narration:**
   - After each check-in, shows one targeted evidence-based recovery tip.
   - **Multilingual Support:** English, Hindi (हिन्दी), and Bengali (বাংলা).
   - **Text-to-Speech:** Built-in audio playback using the browser's Web Speech API (`SpeechSynthesis`).
6. **Family Companion Link (`#/family/<token>`):**
   - Dedicated portal view for husbands, mothers-in-law, and family companions.
   - Displays the 5 critical red danger signs and the next clinic visit date, while keeping personal check-in notes private.
7. **Emergency Support:**
   - One-tap emergency call to `tel:108` / `112`.
   - "Request a Call Back" button alerting the hospital nurse team.

### B) Nurse & Hospital Staff Dashboard
1. **Urgent Flag Dashboard:**
   - Open flags sorted strictly by urgency (**RED** alerts first with immediate call prompts, followed by **AMBER** warnings).
   - Displays mother contact, token, timestamp, and clinical why-line reason.
2. **Clinical Action & Case Resolution:**
   - Modal to log contact type (*Phone Call, ASHA Home Visit, Maternity OPD, Emergency Admission*), record clinical notes, and close the flag.
3. **Missed-Visit Surveillance:**
   - Real-time list of mothers overdue for their scheduled WHO visits. One-click button to record completed visits.
4. **Unscreened Mothers List:**
   - Identifies mothers past Day 14 who have not completed their EPDS depression screen.
5. **Discharge Registration & QR Generation:**
   - Registers mother's name, phone, delivery date, delivery type (*Vaginal / C-Section*), and preferred language.
   - Generates a personal QR discharge pass ready to print or view.
6. **Analytics & Impact Metrics:**
   - Tracks total registered mothers, check-in completion rate, triage breakdown, and average resolution time in hours.

---

## 3. Clinical Triage Logic (Highest Severity Wins)

Triage logic is maintained in a pure, standalone module (`js/triageRules.js`).

| Level | Rule ID | Clinical Condition | Plain-Language Action |
| :--- | :--- | :--- | :--- |
| **RED** | **R1** | Chest pain, trouble breathing, seizure, or fainting | Go to emergency immediately (Call 108) |
| **RED** | **R2** | Soaking 1+ pad per hour or passing large blood clots | Go to emergency now (Suspected PPH) |
| **RED** | **R3** | Severe headache with vision changes (flashes, spots, blur) | Go to maternity emergency (Pre-eclampsia) |
| **RED** | **R4** | EPDS Item 10 above 0 (Thoughts of self-harm) | Call Tele-MANAS (14416); urgent nurse alert |
| **RED** | **R5** | EPDS total score 13 or higher | Nurse call within 24h & clinical referral |
| **AMBER** | **R6** | Fever 38.0°C (100.4°F) or above | Contact hospital / nurse today (Infection) |
| **AMBER** | **R7** | Heavier bleeding than normal period or foul-smelling discharge | Contact hospital today (Lochia change) |
| **AMBER** | **R8** | Persistent headache, one-sided leg swelling or pain | Contact hospital today (DVT / BP check) |
| **AMBER** | **R9** | Wound redness, pus/discharge, or gaping incision edges | Have wound inspected today at OPD |
| **AMBER** | **R10** | **Trend Rule:** A mild symptom reported at last check-in is worse now | Contact care team today |
| **AMBER** | **R11** | EPDS total score between 10 and 12 | Nurse counselling follow-up within 48h |
| **GREEN** | **R12** | None of the above reported | Continue care, rest, hydrate; next visit shown |

> **Clinical Disclaimer (Shown on all triage screens):**  
> *"This tool supports care and does not diagnose. Thresholds are a prototype design pending review by a doctor."*

---

## 4. Demo Credentials & Pre-Seeded Profiles

To explore the dashboard without registering new records, PostCare includes realistic pre-seeded dummy data:

### Nurse Demo Login
- **URL:** `index.html#/login`
- **Email:** `nurse@postcare.in`
- **Password:** `care123`
*(Or click the "1-Click Auto Fill Demo Login" button on the login screen)*

### Pre-Seeded Demo Mothers (Stored in Browser `localStorage`):
1. **Sunita Sharma** (Token: `tok_sunita_01`)
   - *Status:* **GREEN** — Normal healing, Visit 1 completed, Visit 2 due today.
2. **Priyanka Das** (Token: `tok_priyanka_02`)
   - *Status:* **AMBER** — Fever 38.2°C reported with foul lochia discharge; missed Day 7 clinic visit.
3. **Anjali Verma** (Token: `tok_anjali_03`)
   - *Status:* **RED** — EPDS depression score 15/30 with Item 10 = 2 (self-harm thoughts reported).
4. **Meena Devi** (Token: `tok_meena_04`)
   - *Status:* **GREEN** — Delivered 39 days ago; due for Week 6 postnatal visit, unscreened for EPDS.

> **Note on Data Persistence:** All demo data is stored locally in your browser's `localStorage` via a clean Data Access Layer (`js/db.js`). You can reset the demo data at any time by clicking "Reset Demo Database" on the home screen.

---

## 5. Technology Stack & Architecture

- **Architecture:** 100% Static Progressive Web App (PWA), zero build step, no npm build required.
- **Languages:** Plain HTML5, Modern CSS3, Vanilla ES6+ JavaScript.
- **Routing:** Hash-based routing (`#/mother/:token`, `#/nurse`, `#/checkin/:token`, etc.) for instant client-side transitions without server-side rewrite rules.
- **QR Code Engine:** Pure JavaScript QR code library bundled locally (`js/vendor/qrcode.min.js`) — **zero external CDN dependencies**.
- **Offline Support:** Service Worker (`sw.js`) with cache-first asset caching and background queue synchronization.
- **Styling & Theme:**
  - *Deep Teal:* `#12474B`
  - *Teal:* `#2A9D8F`
  - *Rose Accent:* `#E76F6F`
  - *Tint Background:* `#E8F3F2`
  - *Green / Amber / Red:* Reserved strictly for triage status indicators.
  - Large touch targets (min 48px), responsive layout designed down to 360px mobile viewport width.

---

## 6. How to Run Locally

You can run PostCare on your local computer using any static file server:

### Option A: VS Code Live Server (Recommended)
1. Open the `postcare` folder in VS Code.
2. If you have the "Live Server" extension, right-click `index.html` and select **"Open with Live Server"**.
3. Your browser will open `http://127.0.0.1:5500/index.html`.

### Option B: Python Simple HTTP Server
Open your terminal inside the `postcare` folder and run:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000/` in your browser.

### Option C: Direct Double-Click
You can double-click `index.html` directly in File Explorer. (Note: For full Service Worker and PWA offline capabilities, a local HTTP server or GitHub Pages HTTPS URL is recommended by web standards).

---

## 7. Automated Triage Unit Tests

PostCare includes a comprehensive automated test suite verifying all 12 triage rules, boundary conditions, and trend algorithms.

### How to Run Tests:

#### 1. Via Command Line (Node.js):
```bash
node tests/run-tests.js
```
*Output: 25 test cases verifying boundary temperature (37.9°C vs 38.0°C), EPDS cutoffs (9, 10, 12, 13), self-harm Item 10 triggers, symptom trend escalation, and clinical disclaimers.*

#### 2. Via Web Browser:
Open `tests/index.html` in Google Chrome or Microsoft Edge to see the visual test runner dashboard with live pass/fail badges.

---

## 8. Alignment with UN Sustainable Development Goals (SDGs)

- **SDG 3: Good Health & Well-Being (Targets 3.1, 3.4, 3.8)**
  - Reduces maternal mortality through early warning-sign detection of hemorrhage, sepsis, and pre-eclampsia.
  - Promotes mental health and well-being via validated postpartum depression screening (EPDS) and direct access to Tele-MANAS.
  - Improves universal health coverage by tracking all 4 WHO-recommended postnatal care visits.
- **SDG 5: Gender Equality (Target 5.6)**
  - Enhances maternal health agency by giving new mothers direct, confidential access to warning sign information on their own phones, overcoming low mobility or lack of an escort.
- **SDG 9: Industry, Innovation & Infrastructure (Target 9.c)**
  - Lightweight, cost-effective digital public health tool designed for basic smartphones with zero app-store data costs.
- **SDG 10: Reduced Inequalities (Target 10.2)**
  - Multilingual guidance (English, Hindi, Bengali), voice audio playback, and offline mode ensure accessibility for rural and low-literacy women.

---

## 9. Limitations & Future Scope

### Limitations of Prototype:
1. **Rule-Based Design:** Clinical triage thresholds are derived from standard obstetrical literature and WHO guidelines, but require formal validation in clinical hospital trials.
2. **Local Storage Demo:** In this prototype, data is stored in the local browser. In production, this would be backed by a HIPAA/DISHA-compliant encrypted MySQL/PostgreSQL hospital database.
3. **Simulated Reminders:** SMS/WhatsApp push notifications are simulated in the web app UI.

### Future Scope:
1. **ASHA / ANM Tablet Integration:** Syncing flagged mothers directly to village health worker tablets for door-to-door check-ins.
2. **Automated WhatsApp / IVR Voice Calls:** Automated interactive voice response calls for illiterate mothers.
3. **Newborn Danger Signs Module:** Extending check-ins to cover neonatal hypothermia, jaundice, and feeding lethargy.
