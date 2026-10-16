# জমি বংশ · Jomi Bongsho

> জমি কেনার আগে, জমির বংশ জানুন — Know your land's family tree before you buy it.

> ⚠️ **ডেমো ডেটা – বাস্তব রেকর্ড নয় / Demo Data Only:** Every name, plot, deed, and record in this application is entirely synthetic and generated deterministically. No real land records, citizen data, or government portals are queried or scraped.

[![Live App](https://img.shields.io/badge/Live-jomibongsho.vercel.app-16a34a?style=flat-square)](https://jomibongsho.vercel.app)
[![Hackathon](https://img.shields.io/badge/LandTech%202026-DIU%20Round%201-2563eb?style=flat-square)](https://landtech.diu.edu.bd)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber?style=flat-square)](LICENSE)

**Live Prototype:** [https://jomibongsho.vercel.app](https://jomibongsho.vercel.app)  
**Demo Video:** _[YouTube Unlisted Link — ≤ 3:00]_  
**Competition Track:** LandTech 2026 (DIU) — _Track: Digital Land Records — P5 Citizen Pre-Purchase Verification_

---

## What it does

Jomi Bongsho (জমি বংশ) is an offline-capable, mobile-first Progressive Web App (PWA) designed to protect citizens in Bangladesh from fraudulent land conveyancing, over-selling, and predatory transactions:

1. **Instant Title & Deed Verdict:** Tap any cadastral parcel (দাগ) on the digitized mouza map to see an instant legal verdict stamp (**ঝুঁকিহীন** / Clean Title, **সতর্কতা** / Caution, or **উচ্চ ঝুঁকি** / High Risk) with prioritized findings, statutory citations, and step-by-step next actions ("কী করবেন").
2. **Transparent Valuation & Total Cost Calculator:** Displays an independent comparable-sales market estimate (দর/শতাংশ) alongside an honest, all-inclusive buyer's ledger. It calculates government stamp duties (1.5%), registration fees (1.0%), local government tax (2–3%), source tax (3–6%), fixed sub-registry fees, e-mutation costs, and overdue land taxes (বকেয়া খাজনা) — while actively flagging artificial deed under-declarations.
3. **On-Site GPS Parcel Verification & "দাগ বদল" Warning:** Uses real-time mobile GPS coordinates cross-referenced against authentic digitized cadastral polygons to detect whether the plot under the buyer's feet matches the deed schedule being inspected, preventing deceptive roadside plot substitutions.

---

## How it works

The core of Jomi Bongsho is a pure, rational-arithmetic **Share Ledger** (`src/engine/ledger.ts`).

In Bangladesh land governance, every parcel has a fixed area whose legal ownership shares must sum to exactly 100% (`1.0`). Starting from historical cadastral surveys (CS 1932, SA 1962, RS 1987, BS 2011), the engine replays the chronological custody chain:

- **Exact Rational Fractions:** All fractional shares are computed using rational fraction arithmetic (`fraction.js`) rather than JavaScript floating-point numbers (`1/8 + 7/20 + 7/20 + 7/40 = 1.0` exactly), preventing rounding drift from corrupting title integrity.
- **Double Sale & Over-Sale Detection:** When a deed attempts to convey a share exceeding the seller's valid balance, the engine freezes the transfer, flags a `DOUBLE_SALE` or `OVER_SALE` alert, and categorizes the invalid transaction as a "বিরোধপূর্ণ দাবি" (disputed claim).
- **Automated Faraiz Inheritance Breakdown:** Under Hanafi Islamic inheritance law, Quranic fixed shares (Zawil Furud) are allotted first (e.g., 1/8 to the surviving wife), and the remaining residue (7/8) passes to children in a 2:1 son-to-daughter ratio. In our demo scenario (Dag 103), when heir Faruk attempts to sell 15.0 decimal (1/2 share) from his father's 30.0 decimal estate, the engine computes his true faraiz entitlement as 7/20 (10.5 decimal), immediately flagging an unauthorized `HEIR_OVER_SALE`.

---

## Run it locally

```bash
# 1. Clone the repository
git clone https://github.com/ibra-cium/jomiBongsho.git
cd jomiBongsho

# 2. Install dependencies
npm install

# 3. Regenerate synthetic demo data (deterministic seed: jomi-bongsho-2026)
npm run data

# 4. Start local development server
npm run dev

# 5. Run test suite (Vitest)
npm run test

# 6. Typecheck and build production bundle
npm run build
```

---

## Tech stack

- **Core & Runtime:** React 18, TypeScript (strict mode), Vite 7
- **Styling & Design System:** Tailwind CSS v4 (`@tailwindcss/vite`), custom paper-toned "Khatian & Ink" design tokens (`--parchment`, `--terracotta`, `--moss`, `--sepia`)
- **Mapping & Geospatial:** MapLibre GL JS, OpenFreeMap ("positron" vector tiles), Turf.js (`@turf/centroid`, `@turf/boolean-point-in-polygon`, `@turf/bbox`, `@turf/distance`, `@turf/area`)
- **Offscreen Cadastral Renderer:** HTML5 2D Canvas rendering authentic aged mouza sheets with Mercator projection, fibrous noise, North cartouche, and 50m scale bar
- **Arithmetic & State:** `fraction.js` (exact rational fraction arithmetic), Zustand (lightweight reactive state stores)
- **Animation & Typography:** Motion (`motion/react`), `@fontsource/hind-siliguri`, `@fontsource/noto-serif-bengali`, `@fontsource-variable/inter`, `@fontsource-variable/fraunces`
- **PWA & Offline:** `vite-plugin-pwa`, Workbox service worker caching
- **Testing & Quality:** Vitest (unit & property testing), ESLint, Prettier

---

## Data sources

- **Synthetic Cadastral Mouza:** Seeded deterministic procedural generator (`scripts/generate-data.ts`, seed `jomi-bongsho-2026`) modeling the fictional mouza "নতুন চর" (Notun Char, J.L. No. 000) in Manikganj Sadar across 48 plots, 150 citizens, 338 events, and 12 historical fraud scenarios.
- **Base Vector Map:** OpenFreeMap vector tiles (free, keyless open-source tile hosting) © OpenMapTiles, map data © OpenStreetMap contributors.
- **Registration Fee Rules:** Public Bangladesh Finance Act and Sub-Registry fee schedules (FY2025-26 budget reports cited in `public/data/feeRules.json`).
- **No Scraping:** No government portal (`land.gov.bd`, `eporcha.gov.bd`, `minland.gov.bd`) is queried, accessed, or scraped.

---

## AI tools used (disclosure)

In compliance with LandTech 2026 academic integrity guidelines:

- **Google Antigravity IDE with Gemini models:** Utilized for automated implementation, code refactoring, and test suite execution against our structured ticket specifications; every code change was reviewed, verified, and validated by the team.

- **Domain Logic & Invariants:** All Bangladesh land legal rules (Transfer of Property Act 1882, Registration Act 1908, State Acquisition and Tenancy Act 1950), Hanafi Faraiz fractional logic, statutory fee formulas, and unit conversion algorithms were researched, authored, and unit-tested by the team.

---

## Open-source credits

We are grateful to the authors and maintainers of the following open-source libraries:

| Library                             | Version              | License      | Purpose                                       |
| ----------------------------------- | -------------------- | ------------ | --------------------------------------------- |
| `react` / `react-dom`               | `^18.3.1`            | MIT          | Component UI architecture                     |
| `react-router-dom`                  | `^7.18.4`            | MIT          | Client-side routing and deep-linking          |
| `zustand`                           | `^5.0.15`            | MIT          | Global application state management           |
| `maplibre-gl`                       | `^6.14.0`            | BSD-3-Clause | Interactive vector and raster mapping         |
| `fraction.js`                       | `^5.3.4`             | MIT          | Exact rational arithmetic for land shares     |
| `@turf/*`                           | `^7.4.0`             | MIT          | Geospatial centroid and point-in-polygon math |
| `motion`                            | `^14.2.0`            | MIT          | Smooth micro-interactions and stamp physics   |
| `lucide-react`                      | `^1.57.0`            | ISC          | Semantic UI iconography                       |
| `@fontsource/hind-siliguri`         | `^5.3.0`             | OFL-1.1      | Bengali UI typography                         |
| `@fontsource/noto-serif-bengali`    | `^5.3.0`             | OFL-1.1      | Traditional cadastral Bengali numerals        |
| `@fontsource-variable/inter`        | `^5.3.0`             | OFL-1.1      | Clean sans-serif UI typography                |
| `@fontsource-variable/fraunces`     | `^5.3.0`             | OFL-1.1      | Display serif numerals and headings           |
| `vite` / `@vitejs/plugin-react`     | `^7.3.7` / `^4.3.4`  | MIT          | Build tooling and development environment     |
| `vite-plugin-pwa`                   | `^2.0.0`             | MIT          | Service worker and offline PWA capabilities   |
| `@tailwindcss/vite` / `tailwindcss` | `^4.0.0`             | MIT          | Utility-first CSS engine                      |
| `typescript`                        | `^5.7.3`             | Apache-2.0   | Static type safety and strict checking        |
| `vitest`                            | `^3.0.4`             | MIT          | Unit and property-based test framework        |
| `eslint` / `prettier`               | `^9.19.0` / `^3.4.2` | MIT          | Code linting and formatting standards         |

---

## Team

- **Student Lead / Developer:** Siyam Ibrahim (Daffodil International University)
- **Co-developer / Teammate:** Sunbeam Sikdar (Daffodil International University)
- **Faculty Mentor :** Mahimul Islam Nadim (Daffodil International University)
- **Industry Support Mentor:** Hanjala Habib Sadik

---

## Changes since Round 1

_(Reserved for Round 2 enhancements and feature updates)_

---

## License

This project is licensed under the [MIT License](LICENSE).
