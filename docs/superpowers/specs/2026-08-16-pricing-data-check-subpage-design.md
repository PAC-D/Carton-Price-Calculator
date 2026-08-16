# Pricing Data Check Subpage — Design Spec

Date: 2026-08-16
Status: Approved

## Purpose

Integrate the "Primark Pricing Data Check" app (previously a standalone project) into the existing `Carton-Price-Calculator` repo as a GitHub Pages subpage, restyled to match the parent project's PACD theme.

## Architecture

New self-contained subfolder `primark-pricing-data-check/` at the repo root of `Carton-Price-Calculator`:

- `index.html` — subpage structure (PACD-themed)
- `styles.css` — PACD theme styling (own stylesheet, same design tokens as `css/style.css`)
- `app.js` — existing logic: fetch data.csv, parse, filter, render, PDF export
- `data.csv` — 128 rows, copied unchanged from the standalone project (kept independent from `js/data.js` per decision: parent structure may change in the future)
- `test/app.test.mjs` — existing 9 Node unit tests (run with `node --test` from the subfolder)

Live URL (after push + Pages enabled): `https://PAC-D.github.io/Carton-Price-Calculator/primark-pricing-data-check/`

Relative paths inside the subpage (`fetch('data.csv')`, `../pacd.png`, `../favicon.png`, `../index.html`) keep it working under the subfolder.

## Styling (PACD theme)

Match the parent's design language (`css/style.css`, verified):

- Fonts: Outfit + Inter via Google Fonts (same `<link>` as parent `index.html`)
- Palette: `--primary: #00205b`, `--primary-hover: #001540`, `--secondary: #e31837`, `--bg-dark: #f8fafc`, white cards, `--border: #e2e8f0`, `--text-muted: #64748b`
- Background decoration: same radial-gradient `.bg-decoration`
- Navbar: glass blur, border-bottom, `pacd.png` logo (from `../pacd.png`) + `h1` "Primark Pricing Data Check" in navy
- Card: `border-radius: 1.5rem`, `box-shadow: var(--shadow-lg)`, `slideUp` animation, `max-width: 820px` — the `.calculator-card` pattern
- Section labels: uppercase, red, letter-spaced (`.section-label` pattern) — "Filters" section header
- Filters: `custom-select` styling (chevron background-image) for the two dropdowns; `search-input` styling for the text search
- Table: `.table-container` scroll area with `.factory-table` pattern — sticky header, uppercase muted header text, `rate-cell`-style price emphasis (navy)
- Row count line: muted small text
- Export button: `.primary-btn` pill (border-radius 99px, navy, hover lift), disabled state gray
- Footer: verbatim parent footer — "© 2026 PACD. All rights reserved. | Developed by EV1"
- Favicon: `../favicon.png`

## Cross-navigation

- Subpage navbar: "← Carton Price Calculator" link to `../index.html` (navy, subtle)
- Parent navbar: small "Pricing Data Check" link added after the `h1`, pointing to `primark-pricing-data-check/` — a one-line addition that does not disturb the calculator's existing layout

## PDF export

Keep jsPDF 2.5.2 (jsdelivr) + jspdf-autotable 3.8.4 (cdnjs). Restyle PDF to PACD theme:

- Header row fill: navy `[0, 32, 91]`
- Title text "Primark Pricing Data Check" navy, larger
- Footer: "PACD © 2026" small gray line alongside the page number

## Docs & housekeeping

- `README.md`: add a "Sub-pages" section listing the Pricing Data Check subpage with its URL and data-maintenance note (edit `primark-pricing-data-check/data.csv`)
- `VERSION_HISTORY.md`: add a new version entry (`v2.1.0`) following the existing bullet format: "Pricing Data Check Subpage" — bullet describing the subpage addition
- The standalone project folder `Primark Pricing Data Check/` is deleted AFTER the subpage is verified working locally (OneDrive keeps deleted files recoverable)

## Verification

- `node --test test/app.test.mjs` from the subfolder → 9 PASS
- Serve repo root with `python -m http.server 8000`, fetch `/primark-pricing-data-check/` → 200, contains PACD theme markers and filters
- `git status` clean after commits; push to `origin/main` (github.com/PAC-D/Carton-Price-Calculator.git)

## Out of scope

- No changes to the calculator's logic or `js/data.js`
- No shared data source between subpage and calculator
