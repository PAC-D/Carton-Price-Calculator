# Carton Price Calculator - PACD Brand Restyle Design

- Date: 2026-08-12
- Status: Approved
- Reference: https://github.com/PAC-D/matalanpricecalculator_mgt

## Overview

Restyle the existing Carton Price Calculator v2 web app to match the look, feel, and PDF export system of the PACD Matalan Price Calculator reference repository. Keep all existing calculation logic (supplier rates, Primark comparison, margin, paper consumption) untouched; replace the app's visual design, page structure, and PDF pipeline.

## Non-Goals

- No changes to pricing/margin/paper-consumption formulas or test suites.
- No changes to supplier/factory data in `js/data.js`.
- No role-based views, pack types, or Matalan-specific business logic from the reference app.

## Current State (what changes)

- `index.html`: single page with in-page hidden PDF template (`#pdf-content`) and on-screen quotation preview section.
- `css/style.css`: gray/blue "v2" design.
- `js/pdf.js`: generates PDF from the hidden in-page template via bundled `lib/html2pdf.bundle.min.js`.
- `js/app.js`: DOM wiring + export flow that fills the hidden template and shows the preview.

## Target Architecture

Static GitHub Pages site with two pages:

1. `index.html` — the calculator UI, restyled.
2. `pdf_export.html` — standalone branded A4 PDF generator page, opened in a new tab.

Plus local assets: `pacd.png` (brand logo), `favicon.png` (page/favicon), `css/style.css`, `js/*` (existing + updated), `lib/html2pdf.bundle.min.js` (kept bundled locally).

## Visual Design (index.html)

Inherited from reference repo, adapted to our workflow:

### Theme

```
--primary: #00205b
--primary-hover: #001540
--secondary: #e31837
--bg-dark: #f8fafc
--bg-card: #ffffff
--bg-glass: rgba(255, 255, 255, 0.9)
--border: #e2e8f0
--text-main: #0f172a
--text-muted: #64748b
```

Fonts: Google Fonts — `Outfit` (300-800) for body/headings, `Inter` for accents. Icons: Lucide via unpkg CDN (`<script src="https://unpkg.com/lucide@latest"></script>` + `lucide.createIcons()`).

### Layout

- `body`: flex column, `--bg-dark` background, Outfit font.
- `bg-decoration`: fixed radial-gradient decoration (red tint top-left, navy tint bottom-right).
- `navbar`: sticky glass bar (`backdrop-filter: blur(12px)`), 70px tall, brand logo `pacd.png` (~40px tall) in a logo-section; right side shows app title "Carton Price Calculator" in navy.
- `main-container`: centered column, `calculator-card` (max-width ~820px, border-radius 1.5rem, shadow, slideUp animation on load).
- Sections inside the card (existing app sections, newly styled):
  1. Supplier selection — custom pill tab buttons (Epyllion / M&U / Uniglory), active = navy filled.
  2. Factory search — styled search input (custom-select-like) + scrollable factory table (sticky header, hover highlight, selected row navy-tinted).
  3. Rate details — navy/red summary row strip.
  4. Calculation module — carton preset `custom-select`, custom dims inputs (styled like floating-ish group with inline labels), quantity input, live results:
     - Two result panels (Supplier / Primark) using `results` grid classes: `result-item`, `result-label` (uppercase muted), `result-value`.
     - `highlight-result` gradient row for Margin.
  5. Paper consumption card — restyled with navy accents.
- Footer: fixed at viewport bottom, right-aligned, matches reference exactly:

```
<footer class="app-footer">
  <p>&copy; 2026 PACD. All rights reserved. <span class="divider">|</span> Developed by <a href="https://ev1shoaib.netlify.app" target="_blank" class="developer-link">EV1</a></p>
</footer>
```

### Interactive behavior (unchanged logic, new visuals)

- Live recalculation on input (`runCalculation`), live paper consumption card.
- "Generate Quotation" button replaced by a single pill "Export PDF" button (`primary-btn` with download icon), enabled once calculations are valid.
- On-screen quotation preview section and hidden `#pdf-content` template are removed; `js/pdf.js` is deleted.

## PDF Export System (pdf_export.html)

Mirrors reference `pdf_export.html` mechanics, driven by our data.

### Data ship

- `js/app.js` Builds `printData` object and stores under localStorage key `cartonPrintData`, then `window.open('pdf_export.html', '_blank')`.
- `pdf_export.html` retrieves via `getExportData()`: URL `data` param (base64-encoded JSON) first, localStorage fallback. Shows "No data found..." message if absent.

### printData shape

```js
{
  supplier: {
    supplierKey, supplierName, factoryName, ratePerSqm   // ratePerSqm: number
  },
  calc: {
    presetLabel,       // e.g. "495 x 285 x 375" or "Custom Dimensions"
    l, w, h, qty       // strings from inputs
  },
  results: {
    supplierSqm, supplierCostPerCarton, supplierTotalCost,
    primarkSqm, primarkCostPerCarton, primarkTotalPrice,
    margin              // all formatted display strings (e.g. "$1.23", "0.1234 SQM")
  },
  paper: {             // present only when calculated
    boardLength, stitching, actualLength, flutingSpace, width,
    divide, cuttingSpace, boardWidth, paperRollWidth, paperConsumptionSqm  // all strings ("2300 mm", "2")
  }
}
```

### Page behavior

1. On load: render supplier/factory header block, dimensions row (L/W/H mm), cost breakdown list, paper consumption table (if present), set date (en-GB "dd-Mmm-yyyy").
2. After ~800ms, auto-call `generatePDF()`.
3. `generatePDF()`: html2pdf clone strategy with forced exact A4 pixel dimensions (794×1123, padding 56px), offscreen container, `scale: 2`, `useCORS`, `allowTaint`, letterRendering, fixed windowWidth/Height; filename `Quotation-<LxWxH>-<qty>.pdf` cleaned; delete extra blank pages; cleanup container; status bar updates (generating → downloaded/error); hidden "Download PDF Again" fallback button with `@media print` hiding of chrome.
4. Status bar top: navy "Generating PDF... Please wait." → green success / red error.

### PDF layout (A4)

- `.header`: PACD logo left, border-bottom 2px navy.
- Title centered navy "Carton Price Calculator — Quotation".
- Date right-aligned.
- Section headings: `h2` red `#e31837`, bottom border.
- Supplier & Factory block: label/value grid rows (Supplier Name, Factory, Rate per SQM).
- Dimensions: dims-row boxes (L/W/H + quantity).
- Cost Breakdown: cost-list rows with dotted separators; Margin row `.highlight` (navy bg `#eff6ff`, border `#bfdbfe`, bold navy text).
- Paper Consumption: simple two-column table of the 10 values; consumption total bold.
- `.footer` at page bottom: centered muted small text "Generated by Carton Price Calculator — PACD © 2026".

## File Changes

| File | Action |
|------|--------|
| `index.html` | Restyle with reference theme; remove preview + hidden PDF template; add navbar/footer/favicon; new Export PDF button |
| `css/style.css` | Full rewrite to theme (keep responsive rules for the paper grid) |
| `js/app.js` | Keep logic; replace export flow with printData → localStorage → window.open; remove preview rendering |
| `js/pdf.js` | Delete |
| `pdf_export.html` | New file (adapted from reference) |
| `pacd.png` | New asset (copied from reference repo, kept at root) |
| `favicon.png` | New asset (copied from reference repo) |
| `lib/html2pdf.bundle.min.js` | Unchanged (still local) |
| `tests/*`, `js/calculator.js`, `js/data.js` | Unchanged |

## Assets & CDN Decision

- Bundled `lib/html2pdf.bundle.min.js` stays local (robust, already present).
- Google Fonts (Outfit/Inter) + Lucide icons loaded from CDN (site is always online via GitHub Pages; keeps bundle small).
- `pacd.png` and `favicon.png` copied verbatim from `matalanpricecalculator_mgt` repo root.

## Verification

- All QUnit tests still pass (node runner pattern already used).
- Manual: open `index.html` locally, select supplier → factory, type dims, live results + paper card render, Export PDF opens `pdf_export.html` and downloads a clean 1-page A4 PDF with logo, sections, footer.
- `git status` clean after final commit.

## Out of Scope

- Hosting/GitHub Pages config, README updates, favicon customization beyond copying, any Matalan business logic (pack types, marking, roles, fees).