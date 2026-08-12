# PACD Brand Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Carton Price Calculator to the PACD navy/red theme from `matalanpricecalculator_mgt`, add branding (`pacd.png`/`favicon.png`), and replace the PDF pipeline with a separate branded `pdf_export.html` page.

**Architecture:** Two-page static site. `index.html` keeps all supplier/factory/calculation logic but is restyled (glass navbar, centered card, floating labels, pill button, reference footer). A new standalone `pdf_export.html` receives `printData` via localStorage (`cartonPrintData`) plus URL-param base64 fallback, renders a branded A4 quotation, and auto-generates the PDF with the reference's clone strategy. `js/app.js` is rewritten for the new export flow; `js/pdf.js` is deleted.

**Tech Stack:** Vanilla HTML/CSS/JS, Google Fonts (Outfit/Inter) + Lucide via CDN, bundled `lib/html2pdf.bundle.min.js`, GitHub Pages hosting.

## Global Constraints

- Static site only — no build tools, no frameworks, no package.json.
- Do NOT modify `js/calculator.js` or `js/data.js` — formulas, presets, and test suite must stay byte-identical.
- All IDs currently used by `js/app.js` must remain present in `index.html` (list in Task 1).
- localStorage key is exactly `cartonPrintData` in both `js/app.js` and `pdf_export.html`.
- Theme tokens (exact): `--primary: #00205b`, `--primary-hover: #001540`, `--secondary: #e31837`, `--bg-dark: #f8fafc`, `--border: #e2e8f0`, text `#0f172a`/`#64748b`.
- Footer HTML is verbatim from the reference repo (shown in Task 1).
- Bundled `lib/html2pdf.bundle.min.js` stays local — `pdf_export.html` must reference `lib/html2pdf.bundle.min.js`, NOT a CDN.
- Work from `D:\Carton Price Calculator v2` (Windows PowerShell 5.1 — no `&&`; use `;` and `if ($?)`).
- Commit style matches repo: `feat: <lowercase summary>`.

---

### Task 1: Brand Assets and Page Shell Restructure

**Files:**
- Create: `pacd.png`, `favicon.png` (copied from reference repo on GitHub)
- Rewrite: `index.html` (full replacement below)
- Verify: `index.html` contains every ID the new app logic needs

**Interfaces:**
- Consumes: nothing (fresh start)
- Produces: DOM IDs consumed by Task 4 — `supplier-tabs`, `factory-section`, `factory-search`, `factory-tbody`, `rate-section`, `selected-supplier`, `selected-factory`, `selected-rate`, `export-pdf-btn`, `carton-preset`, `custom-dims`, `custom-l`, `custom-w`, `custom-h`, `carton-qty`, `calc-instruction`, `calc-results`, `paper-consumption-card`, `paper-board-length`, `paper-stitching`, `paper-actual-length`, `paper-fluting-space`, `paper-width`, `paper-divide`, `paper-cutting-space`, `paper-board-width`, `paper-roll-width`, `paper-consumption-sqm`, `res-supp-sqm`, `res-supp-cost`, `res-supp-total`, `res-prim-sqm`, `res-prim-cost`, `res-prim-total`, `res-margin`. CSS classes consumed by Task 2: `.navbar`, `.logo-img`, `.main-container`, `.calculator-card`, `.card-section`, `.section-label`, `.supplier-tabs`, `.tab-btn`, `.search-input`, `.table-container`, `.factory-table`, `.rate-display`, `.rate-row`, `.rate-label`, `.rate-value`, `.rate-highlight`, `.rate-amount`, `.form-group`, `.select-label`, `.custom-select`, `.floating-group`, `.custom-dims`, `.calculation-module`, `.calc-instruction`, `.results`, `.result-item`, `.result-label`, `.result-value`, `.full-width`, `.highlight-result`, `.text-positive`, `.text-negative`, `.primary-btn`, `.paper-consumption-card`, `.paper-subtitle`, `.paper-details-grid`, `.paper-detail`, `.paper-consumption-total`, `.paper-pdf-table`, `.app-footer`, `.divider`, `.developer-link`, `.bg-decoration`, `.input-grid`.

- [ ] **Step 1: Download brand assets**

Run (downloads the two PNGs verbatim from the reference repo):

```powershell
curl.exe -L -o pacd.png https://raw.githubusercontent.com/PAC-D/matalanpricecalculator_mgt/main/pacd.png
curl.exe -L -o favicon.png https://raw.githubusercontent.com/PAC-D/matalanpricecalculator_mgt/main/favicon.png
```

Then verify sizes (must be ~24997 and ~17378 bytes respectively):

```powershell
Get-Item pacd.png, favicon.png | Select-Object Name, Length
```

- [ ] **Step 2: Replace `index.html` entirely**

Write the complete file below to `index.html` (overwrite). Note: the app footer is verbatim from the reference repo; `#custom-dims` intentionally has NO `input-grid` class (its CSS grid is defined separately in Task 2).

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carton Price Calculator</title>
  <link rel="icon" type="image/png" href="favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="bg-decoration"></div>

  <nav class="navbar">
    <div class="logo-section">
      <img src="pacd.png" alt="PACD Logo" class="logo-img">
    </div>
    <h1>Carton Price Calculator</h1>
  </nav>

  <div class="main-container">
    <div class="calculator-card">

      <!-- Step 1: Supplier Selection -->
      <div class="card-section">
        <label class="section-label">1. Select Packaging Supplier</label>
        <div id="supplier-tabs" class="supplier-tabs">
          <button class="tab-btn" data-supplier="epyllion">Epyllion</button>
          <button class="tab-btn" data-supplier="mu">M&amp;U</button>
          <button class="tab-btn" data-supplier="uniglory">Uniglory</button>
        </div>
      </div>

      <!-- Step 2: Factory Selection -->
      <div class="card-section" id="factory-section" style="display: none;">
        <label class="section-label">2. Select Factory</label>
        <input type="text" id="factory-search" class="search-input" placeholder="Search factories...">
        <div class="table-container">
          <table id="factory-table" class="factory-table">
            <thead>
              <tr>
                <th>Factory Name</th>
                <th>Rate/SQM (USD)</th>
              </tr>
            </thead>
            <tbody id="factory-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Step 3: Rate + Calculation -->
      <div id="rate-section" style="display: none;">
        <div class="card-section">
          <label class="section-label">3. Rate Details</label>
          <div id="rate-display" class="rate-display">
            <div class="rate-row">
              <span class="rate-label">Supplier:</span>
              <span id="selected-supplier" class="rate-value"></span>
            </div>
            <div class="rate-row">
              <span class="rate-label">Factory:</span>
              <span id="selected-factory" class="rate-value"></span>
            </div>
            <div class="rate-row rate-highlight">
              <span class="rate-label">Rate per SQM:</span>
              <span id="selected-rate" class="rate-value rate-amount"></span>
            </div>
          </div>
        </div>

        <div class="card-section">
          <label class="section-label">Carton Calculation</label>
          <div id="calculation-module" class="calculation-module">
            <div class="form-group">
              <label class="select-label" for="carton-preset">Carton Size</label>
              <select id="carton-preset" class="custom-select">
                <option value="">-- Select Preset --</option>
                <!-- Options populated by JS -->
                <option value="custom">Custom Dimensions</option>
              </select>
            </div>

            <div id="custom-dims" class="custom-dims" style="display: none;">
              <div class="form-group floating-group">
                <input type="number" id="custom-l" placeholder=" " min="1">
                <label for="custom-l">Length (mm)</label>
              </div>
              <div class="form-group floating-group">
                <input type="number" id="custom-w" placeholder=" " min="1">
                <label for="custom-w">Width (mm)</label>
              </div>
              <div class="form-group floating-group">
                <input type="number" id="custom-h" placeholder=" " min="1">
                <label for="custom-h">Height (mm)</label>
              </div>
            </div>

            <div class="form-group floating-group" style="max-width: 280px;">
              <input type="number" id="carton-qty" placeholder=" " min="1" step="1" value="1">
              <label for="carton-qty">Quantity</label>
            </div>
          </div>

          <div id="calc-instruction" class="calc-instruction">Select a supplier and factory, then enter dimensions and quantity to see the calculation.</div>

          <div id="calc-results" class="results" style="display: none;">
            <div class="result-item">
              <span class="result-label">Supplier SQM / Carton</span>
              <span class="result-value" id="res-supp-sqm"></span>
            </div>
            <div class="result-item">
              <span class="result-label">Primark SQM / Carton</span>
              <span class="result-value" id="res-prim-sqm"></span>
            </div>
            <div class="result-item">
              <span class="result-label">Supplier Cost / Carton</span>
              <span class="result-value" id="res-supp-cost"></span>
            </div>
            <div class="result-item">
              <span class="result-label">Primark Price / Carton</span>
              <span class="result-value" id="res-prim-cost"></span>
            </div>
            <div class="result-item">
              <span class="result-label">Supplier Total</span>
              <span class="result-value" id="res-supp-total"></span>
            </div>
            <div class="result-item">
              <span class="result-label">Primark Total</span>
              <span class="result-value" id="res-prim-total"></span>
            </div>
            <div class="result-item highlight-result full-width">
              <span class="result-label">Margin (Primark - Supplier)</span>
              <span class="result-value" id="res-margin"></span>
            </div>
          </div>
        </div>

        <!-- Paper Consumption -->
        <section id="paper-consumption-card" class="paper-consumption-card" style="display: none;">
          <h3>Paper Consumption</h3>
          <p class="paper-subtitle">Per carton</p>
          <div class="paper-details-grid">
            <div class="paper-detail"><span>Board Length</span><strong id="paper-board-length"></strong></div>
            <div class="paper-detail"><span>Stitching</span><strong id="paper-stitching"></strong></div>
            <div class="paper-detail"><span>Actual Length</span><strong id="paper-actual-length"></strong></div>
            <div class="paper-detail"><span>Fluting Space</span><strong id="paper-fluting-space"></strong></div>
            <div class="paper-detail"><span>Width</span><strong id="paper-width"></strong></div>
            <div class="paper-detail"><span>Divide</span><strong id="paper-divide"></strong></div>
            <div class="paper-detail"><span>Cutting Space</span><strong id="paper-cutting-space"></strong></div>
            <div class="paper-detail"><span>Board Width</span><strong id="paper-board-width"></strong></div>
            <div class="paper-detail"><span>Paper Roll Width</span><strong id="paper-roll-width"></strong></div>
          </div>
          <div class="paper-consumption-total">
            <span>Paper Consumption</span>
            <strong id="paper-consumption-sqm"></strong>
          </div>
        </section>

        <button id="export-pdf-btn" class="primary-btn" disabled>
          <i data-lucide="download"></i> Export PDF
        </button>
      </div>
    </div>
  </div>

  <footer class="app-footer">
    <p>&copy; 2026 PACD. All rights reserved. <span class="divider">|</span> Developed by <a href="https://ev1shoaib.netlify.app" target="_blank" class="developer-link">EV1</a></p>
  </footer>

  <script src="lib/html2pdf.bundle.min.js"></script>
  <script src="js/data.js"></script>
  <script src="js/calculator.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verify every required ID exists**

Run:

```powershell
node -e "const fs=require('fs');const q=String.fromCharCode(34);const html=fs.readFileSync('index.html','utf8');const required='supplier-tabs factory-section factory-search factory-tbody rate-section selected-supplier selected-factory selected-rate export-pdf-btn carton-preset custom-dims custom-l custom-w custom-h carton-qty calc-instruction calc-results paper-consumption-card paper-board-length paper-stitching paper-actual-length paper-fluting-space paper-width paper-divide paper-cutting-space paper-board-width paper-roll-width paper-consumption-sqm res-supp-sqm res-supp-cost res-supp-total res-prim-sqm res-prim-cost res-prim-total res-margin'.split(' ');const missing=required.filter(id=>!html.includes('id='+q+id+q));if(missing.length){console.log('MISSING: '+missing.join(', '));process.exit(1)}console.log('all required ids present');"
```

Expected: `all required ids present`

- [ ] **Step 4: Commit**

```powershell
git add pacd.png favicon.png index.html
git commit -m "feat: add pacd brand assets and restyle page shell"
```

---

### Task 2: PACD Theme Stylesheet

**Files:**
- Rewrite: `css/style.css` (full replacement below)
- Verify: every class used in `index.html` has a rule in the stylesheet

**Interfaces:**
- Consumes: class names from Task 1 markup
- Produces: nothing for later tasks (visual layer only) — but `.results.show` class toggle is required by Task 4

- [ ] **Step 1: Replace `css/style.css` entirely**

Write the complete file below (overwrite). It is the reference theme + our existing component rules (factory table, rate strip, paper card, responsive rules).

```css
/* Carton Price Calculator - PACD Theme (reference: matalanpricecalculator_mgt) */
:root {
  --primary: #00205b;
  --primary-hover: #001540;
  --secondary: #e31837;
  --bg-dark: #f8fafc;
  --bg-card: #ffffff;
  --bg-glass: rgba(255, 255, 255, 0.9);
  --border: #e2e8f0;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --shadow-glow: 0 4px 20px rgba(0, 32, 91, 0.15);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Outfit', sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Background Decoration */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 10% 10%, rgba(227, 24, 55, 0.03) 0%, transparent 40%),
    radial-gradient(circle at 90% 90%, rgba(0, 32, 91, 0.03) 0%, transparent 40%);
  z-index: -1;
  pointer-events: none;
}

/* Navbar */
.navbar {
  height: 70px;
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 50;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-img {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.navbar h1 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--primary);
}

/* Main Container */
.main-container {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 40px 20px 80px;
}

.calculator-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.5rem;
  padding: 2.5rem;
  max-width: 820px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Form sections */
.card-section {
  margin-bottom: 1.5rem;
}

.section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--secondary);
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.form-group {
  margin-bottom: 1rem;
  position: relative;
}

.select-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-main);
  font-weight: 500;
}

/* Floating labels */
.floating-group {
  position: relative;
}

.floating-group input {
  width: 100%;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem 0.75rem 0.5rem;
  color: var(--text-main);
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.floating-group label {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 400;
  pointer-events: none;
  transition: all 0.2s ease;
}

.floating-group input:focus,
.floating-group input:not(:placeholder-shown),
.floating-group input:disabled {
  border-color: var(--primary);
  padding-top: 1.25rem;
  padding-bottom: 0.25rem;
}

.floating-group input:focus {
  box-shadow: 0 0 0 2px rgba(0, 32, 91, 0.1);
}

.floating-group input:focus + label,
.floating-group input:not(:placeholder-shown) + label,
.floating-group input:disabled + label {
  top: 0.5rem;
  font-size: 0.7rem;
  color: var(--primary);
  font-weight: 600;
  transform: none;
}

/* Custom selects */
.custom-select {
  width: 100%;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem;
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.custom-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 32, 91, 0.1);
}

/* Generic input grid */
.input-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* Custom dimensions */
.custom-dims {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* Supplier tabs */
.supplier-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 12px 28px;
  border: 2px solid var(--border);
  background: white;
  border-radius: 99px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-muted);
}

.tab-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: #eff6ff;
}

.tab-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Search input */
.search-input {
  width: 100%;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem;
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.95rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
  margin-bottom: 12px;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 32, 91, 0.1);
}

/* Factory table */
.table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.factory-table {
  width: 100%;
  border-collapse: collapse;
}

.factory-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.factory-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid var(--border);
}

.factory-table td {
  padding: 10px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.factory-table tbody tr {
  cursor: pointer;
  transition: background-color 0.15s;
}

.factory-table tbody tr:hover {
  background-color: #eff6ff;
}

.factory-table tbody tr.selected {
  background-color: #dbeafe;
  font-weight: 500;
}

.factory-table .rate-cell {
  font-weight: 600;
  color: var(--primary);
}

/* Rate display strip */
.rate-display {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px 20px;
}

.rate-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.rate-row:last-of-type {
  border-bottom: none;
}

.rate-label {
  font-weight: 500;
  color: var(--text-muted);
}

.rate-value {
  font-weight: 600;
}

.rate-highlight {
  padding: 12px 0;
}

.rate-amount {
  font-size: 22px;
  color: var(--primary);
}

/* Calculation module */
.calculation-module {
  padding-top: 16px;
  border-top: 1px solid var(--border);
  margin-bottom: 8px;
}

.calc-instruction {
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  padding: 12px;
}

/* Results grid (reference .results pattern) */
.results {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f1f5f9;
  border-radius: 1rem;
  border: 1px solid var(--border);
  display: none;
}

.results.show {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-item {
  background: white;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border: 1px solid transparent;
}

.result-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.result-value {
  font-size: 1.1rem;
  color: var(--text-main);
  font-weight: 700;
}

.full-width {
  grid-column: span 2;
}

.highlight-result {
  background: linear-gradient(to right, #eff6ff, #dbeafe);
  border-color: #bfdbfe;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.highlight-result .result-value {
  font-size: 1.5rem;
  color: var(--primary);
}

.text-positive {
  color: #059669;
}

.text-negative {
  color: #dc2626;
}

/* Buttons */
.primary-btn {
  width: 100%;
  background: var(--primary);
  color: white;
  border: none;
  padding: 0 1.5rem;
  height: 50px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 32, 91, 0.2);
  margin-top: 1rem;
  font-family: inherit;
}

.primary-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 32, 91, 0.25);
}

.primary-btn:disabled {
  background: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

/* Paper consumption */
.paper-consumption-card {
  margin: 20px 0 24px;
  padding: 20px;
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  background: #eff6ff;
}

.paper-consumption-card h3 {
  color: var(--primary);
  font-size: 18px;
}

.paper-subtitle {
  margin-bottom: 14px;
  color: var(--text-muted);
  font-size: 13px;
}

.paper-details-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.paper-detail {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  background: #ffffff;
  font-size: 13px;
}

.paper-detail span {
  color: #475569;
}

.paper-detail strong {
  color: #0f172a;
  white-space: nowrap;
}

.paper-consumption-total {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding: 14px;
  border-radius: 8px;
  background: #dbeafe;
  color: var(--primary);
  font-size: 16px;
}

.paper-consumption-total strong {
  font-size: 20px;
}

/* App footer (verbatim from reference repo) */
.app-footer {
  text-align: right;
  padding: 1rem 2rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-family: inherit;
}

.app-footer .divider {
  opacity: 0.5;
  margin: 0 0.5rem;
}

.app-footer .developer-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.app-footer .developer-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 640px) {
  .navbar {
    padding: 0 1rem;
  }

  .main-container {
    padding: 20px 1rem 80px;
  }

  .calculator-card {
    padding: 1.5rem;
  }

  .supplier-tabs {
    flex-direction: column;
  }

  .tab-btn {
    width: 100%;
    text-align: center;
  }

  .input-grid,
  .custom-dims {
    grid-template-columns: 1fr;
  }

  .results.show {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: span 1;
  }

  .paper-details-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Verify every class in `index.html` has a CSS rule**

Run:

```powershell
node -e "const fs=require('fs');const q=String.fromCharCode(34);const html=fs.readFileSync('index.html','utf8');const css=fs.readFileSync('css/style.css','utf8');const re=new RegExp('class='+q+'([^'+q+']+)'+q,'g');const classes=[...new Set([...html.matchAll(re)].flatMap(m=>m[1].split(/\s+/)))].filter(c=>c&&!c.includes('{'));const missing=classes.filter(c=>!css.includes('.'+c));if(missing.length){console.log('MISSING: '+missing.join(', '));process.exit(1)}console.log('all classes styled');"
```

Expected: `all classes styled`.

- [ ] **Step 3: Commit**

```powershell
git add css/style.css
git commit -m "feat: restyle app with PACD navy/red theme"
```

---

### Task 3: Branded PDF Export Page

**Files:**
- Create: `pdf_export.html` (full content below)

**Interfaces:**
- Consumes: `printData` object (shape defined below) from Task 4's `js/app.js`
- Produces: nothing for later tasks — this task ends with a standalone renderable page

**printData shape (must match Task 4 exactly):**

```js
{
  supplier: { supplierKey, supplierName, factoryName, ratePerSqm },   // ratePerSqm formatted "$0.75"
  calc: { presetLabel, l, w, h, qty },                                // dims/qty as strings from inputs
  results: { supplierSqm, supplierCostPerCarton, supplierTotalCost,
             primarkSqm, primarkCostPerCarton, primarkTotalPrice, margin },  // ALL formatted display strings ("$1.23", "0.1234 SQM")
  paper: { boardLength, stitching, actualLength, flutingSpace, width,
           divide, cuttingSpace, boardWidth, paperRollWidth,
           paperConsumptionSqm } | null                                // strings ("2300 mm", "2"); null when no calc
}
```

- [ ] **Step 1: Create `pdf_export.html`**

Write the complete file below:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1200">
  <title>PDF Export - Carton Price Calculator</title>
  <script src="lib/html2pdf.bundle.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #525659;
      display: flex;
      justify-content: center;
      font-family: 'Inter', sans-serif;
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }

    #page {
      width: 210mm;
      min-height: 297mm;
      background: white;
      padding: 15mm;
      box-sizing: border-box;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      margin: 20px;
      position: relative;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 2px solid #00205b;
      padding-bottom: 0.75rem;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .logo {
      height: 40px;
      width: auto;
      object-fit: contain;
    }

    .content {
      margin-top: 1rem;
    }

    h2 {
      font-size: 1.1rem;
      color: #e31837;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5rem;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }

    .grid-row {
      display: flex;
      gap: 2rem;
      margin-bottom: 0.5rem;
    }

    .grid-item {
      flex: 1;
    }

    .dims-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      background: #f8fafc;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .dim-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }

    .label {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }

    .value {
      font-size: 1rem;
      color: #0f172a;
      font-weight: 700;
    }

    .cost-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .cost-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      border-bottom: 1px dotted #ccc;
    }

    .cost-row.highlight {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      font-weight: bold;
      color: #00205b;
    }

    .paper-table {
      width: 100%;
      border-collapse: collapse;
    }

    .paper-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.9rem;
    }

    .paper-table td:first-child {
      color: #64748b;
      width: 55%;
    }

    .paper-table td:last-child {
      font-weight: 600;
      color: #0f172a;
    }

    .paper-table tr.paper-total td {
      background: #eff6ff;
      color: #00205b;
      font-weight: 700;
    }

    .footer {
      position: absolute;
      bottom: 20mm;
      left: 20mm;
      right: 20mm;
      text-align: center;
      font-size: 0.75rem;
      color: #94a3b8;
      border-top: 1px solid #eee;
      padding-top: 1rem;
    }

    @media print {
      #status-bar,
      #download-btn {
        display: none !important;
      }

      @page {
        size: A4 portrait;
        margin: 0;
      }

      body {
        background: white;
        margin: 0;
        padding: 0;
        display: block;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      #page {
        width: 100%;
        min-height: auto;
        margin: 0;
        padding: 15mm;
        box-shadow: none;
        border: none;
      }

      .footer {
        position: fixed;
        bottom: 10mm;
      }
    }
  </style>
</head>
<body>

  <div id="status-bar" style="position: fixed; top: 0; left: 0; width: 100%; background: #00205b; color: white; padding: 10px; text-align: center; font-size: 14px; z-index: 1000;">
    Generating PDF... Please wait.
  </div>

  <div id="page">
    <div class="header">
      <img src="pacd.png" alt="PACD" class="logo">
    </div>

    <h1 style="text-align: center; color: #00205b; font-size: 1.5rem; margin-top: -10px; margin-bottom: 5px;">Carton Price Calculator &mdash; Quotation</h1>
    <div style="text-align: right; margin-bottom: 20px; font-size: 0.85rem; color: #64748b;">
      Date: <span id="date-header"></span>
    </div>

    <div class="content">
      <h2>Supplier &amp; Factory Information</h2>
      <div id="supplier-container"></div>

      <h2>Specifications</h2>
      <div class="grid-row">
        <div class="grid-item">
          <div class="label">Carton Size</div>
          <div class="value" id="spec-carton"></div>
        </div>
        <div class="grid-item">
          <div class="label">Quantity</div>
          <div class="value" id="spec-qty"></div>
        </div>
      </div>

      <h2>Outside Dimension (mm) - FEFCO 0201</h2>
      <div class="dims-row" id="dims-container"></div>

      <h2>Cost Breakdown</h2>
      <div class="cost-list" id="costs-container"></div>

      <div id="paper-section" style="display: none;">
        <h2>Paper Consumption (Per Carton)</h2>
        <table class="paper-table" id="paper-table">
          <tbody id="paper-tbody"></tbody>
        </table>
      </div>
    </div>

    <div class="footer">Generated by Carton Price Calculator &mdash; PACD &copy; 2026</div>
  </div>

  <!-- Manual Download Button (Hidden initially) -->
  <button id="download-btn" onclick="generatePDF()"
    style="display: none; position: fixed; bottom: 20px; right: 20px; padding: 10px 20px; background: #e31837; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
    Download PDF Again
  </button>

  <script>
    // Helper to retrieve data from URL param or LocalStorage
    function getExportData() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');
        if (encodedData) {
          const jsonString = decodeURIComponent(atob(encodedData));
          return JSON.parse(jsonString);
        }
        return JSON.parse(window.localStorage.getItem('cartonPrintData'));
      } catch (e) {
        console.error('Error retrieving data:', e);
        return null;
      }
    }

    function generatePDF() {
      const element = document.getElementById('page');
      const status = document.getElementById('status-bar');
      status.textContent = 'Generating PDF...';

      // Determine Filename
      let filename = 'Carton-Price-Quotation.pdf';
      try {
        const data = getExportData();
        if (data && data.calc) {
          const L = String(data.calc.l || '').replace(/[^0-9]/g, '');
          const W = String(data.calc.w || '').replace(/[^0-9]/g, '');
          const H = String(data.calc.h || '').replace(/[^0-9]/g, '');
          const Q = String(data.calc.qty || '').replace(/[^0-9]/g, '');
          filename = 'Quotation-' + L + 'x' + W + 'x' + H + '-' + Q + '.pdf';
        }
      } catch (e) {
        console.error('Error generating filename', e);
      }

      // CLONE STRATEGY + FORCE EXACT DIMENSIONS
      const A4_WIDTH_PX = 794;
      const A4_HEIGHT_PX = 1123;

      const clone = element.cloneNode(true);
      clone.style.transform = 'none';
      clone.style.margin = '0';
      clone.style.padding = '56px';
      clone.style.boxShadow = 'none';
      clone.style.border = 'none';
      clone.style.width = A4_WIDTH_PX + 'px';
      clone.style.minHeight = A4_HEIGHT_PX + 'px';
      clone.style.maxHeight = A4_HEIGHT_PX + 'px';
      clone.style.height = 'auto';
      clone.style.overflow = 'hidden';
      clone.style.position = 'absolute';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.background = '#ffffff';
      clone.style.boxSizing = 'border-box';
      clone.style.fontSize = '16px';

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = A4_WIDTH_PX + 'px';
      container.style.height = A4_HEIGHT_PX + 'px';
      container.style.overflow = 'hidden';
      container.style.background = '#ffffff';
      container.style.zIndex = '9999';
      container.style.margin = '0';
      container.style.padding = '0';
      container.style.visibility = 'hidden';

      container.appendChild(clone);
      document.body.appendChild(container);
      clone.offsetHeight;

      const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        enableLinks: true,
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          scrollX: 0,
          x: 0,
          y: 0,
          width: A4_WIDTH_PX,
          height: A4_HEIGHT_PX,
          windowWidth: A4_WIDTH_PX,
          windowHeight: A4_HEIGHT_PX,
          deviceScaleFactor: 1,
          letterRendering: 1,
          allowTaint: true,
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(clone).toPdf().get('pdf').then(function (pdf) {
        const totalPages = pdf.internal.getNumberOfPages();
        if (totalPages > 1) {
          for (let i = totalPages; i > 1; i--) {
            pdf.deletePage(i);
          }
        }
      }).save().then(() => {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        status.textContent = 'PDF Downloaded! You can now close this tab.';
        status.style.background = '#10b981';
        document.getElementById('download-btn').style.display = 'block';
      }).catch(err => {
        console.error('PDF Generation Error:', err);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        status.textContent = 'Error generating PDF. Please try manual download.';
        status.style.background = '#e31837';
        document.getElementById('download-btn').style.display = 'block';
      });
    }

    window.onload = function () {
      const data = getExportData();

      if (!data) {
        document.body.innerHTML = '<h1 style="color: white; margin-top: 50px; text-align: center;">No data found. Please calculate price first.</h1>';
        return;
      }

      document.getElementById('date-header').textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

      // Supplier & Factory Information
      const supplierDiv = document.getElementById('supplier-container');
      let supplierHtml = '';
      supplierHtml += `
        <div style="display: flex; gap: 1rem; margin-bottom: 0.75rem;">
          <div style="flex: 1;">
            <div class="label">Supplier Name</div>
            <div class="value" style="white-space: normal; word-wrap: break-word;">${data.supplier.supplierName || '-'}</div>
          </div>
        </div>
      `;
      supplierHtml += `
        <div style="display: flex; gap: 1rem; margin-bottom: 0.75rem;">
          <div style="flex: 1;">
            <div class="label">Factory Name</div>
            <div class="value" style="white-space: normal; word-wrap: break-word;">${data.supplier.factoryName || '-'}</div>
          </div>
        </div>
      `;
      supplierHtml += `
        <div style="display: flex; gap: 1rem; margin-bottom: 0.75rem;">
          <div style="flex: 1;">
            <div class="label">Rate per SQM</div>
            <div class="value">${data.supplier.ratePerSqm || '-'}</div>
          </div>
        </div>
      `;
      supplierDiv.innerHTML = supplierHtml;

      // Specifications
      document.getElementById('spec-carton').textContent = data.calc.presetLabel || '-';
      document.getElementById('spec-qty').textContent = data.calc.qty || '-';

      // Dimensions
      document.getElementById('dims-container').innerHTML = `
        <div class="dim-box"><div class="label">Length</div><div class="value">${data.calc.l || '-'} mm</div></div>
        <div class="dim-box"><div class="label">Width</div><div class="value">${data.calc.w || '-'} mm</div></div>
        <div class="dim-box"><div class="label">Height</div><div class="value">${data.calc.h || '-'} mm</div></div>
      `;

      // Cost Breakdown
      const costs = [];
      costs.push({ label: 'Supplier SQM / Carton', value: data.results.supplierSqm });
      costs.push({ label: 'Supplier Cost / Carton', value: data.results.supplierCostPerCarton });
      costs.push({ label: 'Supplier Total', value: data.results.supplierTotalCost });
      costs.push({ label: 'Primark SQM / Carton', value: data.results.primarkSqm });
      costs.push({ label: 'Primark Cost / Carton', value: data.results.primarkCostPerCarton });
      costs.push({ label: 'Primark Total', value: data.results.primarkTotalPrice });
      costs.push({ label: 'Margin (Primark - Supplier)', value: data.results.margin, highlight: true });

      let costsHtml = '';
      costs.forEach(item => {
        const cls = item.highlight ? 'cost-row highlight' : 'cost-row';
        costsHtml += `<div class="${cls}"><span>${item.label}</span><span>${item.value}</span></div>`;
      });
      document.getElementById('costs-container').innerHTML = costsHtml;

      // Paper Consumption (optional)
      if (data.paper) {
        const rows = [
          ['Board Length', data.paper.boardLength],
          ['Stitching', data.paper.stitching],
          ['Actual Length', data.paper.actualLength],
          ['Fluting Space', data.paper.flutingSpace],
          ['Width', data.paper.width],
          ['Divide', data.paper.divide],
          ['Cutting Space', data.paper.cuttingSpace],
          ['Board Width', data.paper.boardWidth],
          ['Paper Roll Width', data.paper.paperRollWidth],
          ['Paper Consumption', data.paper.paperConsumptionSqm]
        ];
        let paperHtml = rows.map((r, i) =>
          `<tr${i === rows.length - 1 ? ' class="paper-total"' : ''}><td>${r[0]}</td><td>${r[1]}</td></tr>`
        ).join('');
        document.getElementById('paper-tbody').innerHTML = paperHtml;
        document.getElementById('paper-section').style.display = 'block';
      }

      // Trigger generation with a slight delay
      setTimeout(generatePDF, 800);
    };
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify static wiring**

Run:

```powershell
node -e "const fs=require('fs');const p=fs.readFileSync('pdf_export.html','utf8');const checks=[p.includes('lib/html2pdf.bundle.min.js'),p.includes('cartonPrintData'),p.includes('pacd.png'),p.includes('data.calc.presetLabel'),p.includes('data.results.margin'),p.includes('data.paper.paperConsumptionSqm')];if(checks.every(Boolean))console.log('pdf_export.html wiring OK');else console.log('FAILED', checks);"
```

Expected: `pdf_export.html wiring OK`

- [ ] **Step 3: Commit**

```powershell
git add pdf_export.html
git commit -m "feat: add branded pdf export page"
```

---

### Task 4: Wire Export Flow and Remove Old PDF Pipeline

**Files:**
- Rewrite: `js/app.js` (full replacement below)
- Delete: `js/pdf.js`
- Verify: `node --check` syntax, structural test run, no stale references

**Interfaces:**
- Consumes: DOM IDs and classes from Task 1/2; `printData` shape from Task 3
- Produces: working end-to-end flow (calculate → Export PDF → branded PDF)

- [ ] **Step 1: Replace `js/app.js` entirely**

Write the complete file below (overwrite). Changes vs. the old version: `generateQuoteBtn` → `exportPdfBtn`, results toggle via `.show` class, `customDims` shown with `display: grid`, quote preview removed, `lucide.createIcons()` called, export handler writes `printData` to localStorage and opens `pdf_export.html`.

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // State
  let currentSupplier = null;
  let currentFactory = null;
  let currentPaperConsumption = null;

  // DOM references
  const supplierTabs = document.getElementById('supplier-tabs');
  const factorySection = document.getElementById('factory-section');
  const factorySearch = document.getElementById('factory-search');
  const factoryTbody = document.getElementById('factory-tbody');
  const rateSection = document.getElementById('rate-section');
  const selectedSupplierEl = document.getElementById('selected-supplier');
  const selectedFactoryEl = document.getElementById('selected-factory');
  const selectedRateEl = document.getElementById('selected-rate');
  const exportPdfBtn = document.getElementById('export-pdf-btn');

  const presetSelect = document.getElementById('carton-preset');
  const customDims = document.getElementById('custom-dims');
  const inL = document.getElementById('custom-l');
  const inW = document.getElementById('custom-w');
  const inH = document.getElementById('custom-h');
  const inQty = document.getElementById('carton-qty');

  const calcInstruction = document.getElementById('calc-instruction');
  const calcResults = document.getElementById('calc-results');
  const paperConsumptionCard = document.getElementById('paper-consumption-card');
  const paperBoardLength = document.getElementById('paper-board-length');
  const paperStitching = document.getElementById('paper-stitching');
  const paperActualLength = document.getElementById('paper-actual-length');
  const paperFlutingSpace = document.getElementById('paper-fluting-space');
  const paperWidth = document.getElementById('paper-width');
  const paperDivide = document.getElementById('paper-divide');
  const paperCuttingSpace = document.getElementById('paper-cutting-space');
  const paperBoardWidth = document.getElementById('paper-board-width');
  const paperRollWidth = document.getElementById('paper-roll-width');
  const paperConsumptionSqm = document.getElementById('paper-consumption-sqm');

  // Populate preset options BEFORE adding listeners
  CARTON_PRESETS.forEach(preset => {
    let opt = document.createElement('option');
    opt.value = preset.id;
    opt.textContent = preset.label;
    presetSelect.insertBefore(opt, presetSelect.lastElementChild);
  });

  presetSelect.addEventListener('change', function() {
    if (this.value === 'custom') {
      customDims.style.display = 'grid';
      inL.value = ''; inW.value = ''; inH.value = '';
    } else {
      customDims.style.display = 'none';
      if (this.value) {
        const p = CARTON_PRESETS.find(x => x.id === this.value);
        inL.value = p.l; inW.value = p.w; inH.value = p.h;
      } else {
        inL.value = ''; inW.value = ''; inH.value = '';
      }
    }
    runCalculation();
  });

  ['input', 'change'].forEach(evt => {
    inL.addEventListener(evt, runCalculation);
    inW.addEventListener(evt, runCalculation);
    inH.addEventListener(evt, runCalculation);
    inQty.addEventListener(evt, runCalculation);
  });

  // Supplier tab click
  supplierTabs.addEventListener('click', function(e) {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    selectSupplier(btn.dataset.supplier);
  });

  function selectSupplier(supplierKey) {
    currentSupplier = supplierKey;
    currentFactory = null;

    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.supplier === supplierKey);
    });

    factorySection.style.display = 'block';
    rateSection.style.display = 'none';
    exportPdfBtn.disabled = true;

    factorySearch.value = '';
    renderFactories(supplierKey, '');
    runCalculation();
  }

  // Factory search
  factorySearch.addEventListener('input', function() {
    if (currentSupplier) {
      renderFactories(currentSupplier, factorySearch.value);
    }
  });

  function renderFactories(supplierKey, filterText) {
    const supplier = SUPPLIERS[supplierKey];
    if (!supplier) return;

    const filter = filterText.toLowerCase().trim();
    const filtered = supplier.factories.filter(function(f) {
      return f.name.toLowerCase().includes(filter);
    });

    factoryTbody.innerHTML = '';

    if (filtered.length === 0) {
      var row = document.createElement('tr');
      row.innerHTML = '<td colspan="2" style="text-align:center;color:#94a3b8;padding:20px;">No matching factories found.</td>';
      factoryTbody.appendChild(row);
      return;
    }

    filtered.forEach(function(factory) {
      var row = document.createElement('tr');
      if (currentFactory && factory.name === currentFactory) {
        row.classList.add('selected');
      }
      row.innerHTML =
        '<td>' + escapeHtml(factory.name) + '</td>' +
        '<td class="rate-cell">$' + factory.rate.toFixed(2) + '</td>';
      row.addEventListener('click', function() {
        selectFactory(factory.name);
      });
      factoryTbody.appendChild(row);
    });
  }

  function selectFactory(factoryName) {
    currentFactory = factoryName;
    var supplier = SUPPLIERS[currentSupplier];
    var factory = supplier.factories.find(function(f) { return f.name === factoryName; });

    renderFactories(currentSupplier, factorySearch.value);

    rateSection.style.display = 'block';
    selectedSupplierEl.textContent = supplier.name;
    selectedFactoryEl.textContent = factory.name;
    selectedRateEl.textContent = '$' + factory.rate.toFixed(2);

    runCalculation();
  }

  function runCalculation() {
    exportPdfBtn.disabled = true;
    calcResults.classList.remove('show');
    calcInstruction.style.display = 'block';
    currentPaperConsumption = null;
    paperConsumptionCard.style.display = 'none';

    if (!currentSupplier || !currentFactory) return;

    let l = parseFloat(inL.value);
    let w = parseFloat(inW.value);
    let h = parseFloat(inH.value);
    let qty = parseInt(inQty.value, 10);

    if (!l || !w || !h || !qty || l <= 0 || w <= 0 || h <= 0 || qty <= 0) return;

    let supplier = SUPPLIERS[currentSupplier];
    let factory = supplier.factories.find(f => f.name === currentFactory);

    // Perform calculation
    let results = calculatePrice(supplier.formulaId, l, w, h, qty, factory.rate);
    if (!results) return;

    currentPaperConsumption = calculatePaperConsumption(currentSupplier, l, w, h);
    if (currentPaperConsumption) {
      paperBoardLength.textContent = currentPaperConsumption.boardLength + ' mm';
      paperStitching.textContent = currentPaperConsumption.stitching + ' mm';
      paperActualLength.textContent = currentPaperConsumption.actualLength + ' mm';
      paperFlutingSpace.textContent = currentPaperConsumption.flutingSpace + ' mm';
      paperWidth.textContent = currentPaperConsumption.width + ' mm';
      paperDivide.textContent = currentPaperConsumption.divide;
      paperCuttingSpace.textContent = currentPaperConsumption.cuttingSpace + ' mm';
      paperBoardWidth.textContent = currentPaperConsumption.boardWidth + ' mm';
      paperRollWidth.textContent = currentPaperConsumption.paperRollWidth + ' mm';
      paperConsumptionSqm.textContent = currentPaperConsumption.paperConsumptionSqm.toFixed(4) + ' SQM';
      paperConsumptionCard.style.display = 'block';
    }

    // Display updates
    document.getElementById('res-supp-sqm').textContent = results.supplierSqm.toFixed(4) + ' SQM';
    document.getElementById('res-supp-cost').textContent = '$' + results.supplierCostPerCarton.toFixed(2);
    document.getElementById('res-supp-total').textContent = '$' + results.supplierTotalCost.toFixed(2);

    document.getElementById('res-prim-sqm').textContent = results.primarkSqm.toFixed(4) + ' SQM';
    document.getElementById('res-prim-cost').textContent = '$' + results.primarkPricePerCarton.toFixed(2);
    document.getElementById('res-prim-total').textContent = '$' + results.primarkTotalPrice.toFixed(2);

    let elMargin = document.getElementById('res-margin');
    elMargin.textContent = '$' + results.margin.toFixed(2);
    elMargin.className = 'result-value ' + (results.margin >= 0 ? 'text-positive' : 'text-negative');

    // UI toggle
    calcInstruction.style.display = 'none';
    calcResults.classList.add('show');
    exportPdfBtn.disabled = false;
  }

  // Export PDF
  exportPdfBtn.addEventListener('click', function() {
    if (!currentSupplier || !currentFactory) return;

    var supplier = SUPPLIERS[currentSupplier];
    var factory = supplier.factories.find(function(f) { return f.name === currentFactory; });

    var presetLabel = presetSelect.value === 'custom'
      ? 'Custom Dimensions'
      : (presetSelect.selectedOptions[0] ? presetSelect.selectedOptions[0].textContent : '');

    var printData = {
      supplier: {
        supplierKey: currentSupplier,
        supplierName: supplier.name,
        factoryName: factory.name,
        ratePerSqm: '$' + factory.rate.toFixed(2)
      },
      calc: {
        presetLabel: presetLabel,
        l: inL.value,
        w: inW.value,
        h: inH.value,
        qty: inQty.value
      },
      results: {
        supplierSqm: document.getElementById('res-supp-sqm').textContent,
        supplierCostPerCarton: document.getElementById('res-supp-cost').textContent,
        supplierTotalCost: document.getElementById('res-supp-total').textContent,
        primarkSqm: document.getElementById('res-prim-sqm').textContent,
        primarkCostPerCarton: document.getElementById('res-prim-cost').textContent,
        primarkTotalPrice: document.getElementById('res-prim-total').textContent,
        margin: document.getElementById('res-margin').textContent
      },
      paper: null
    };

    if (currentPaperConsumption) {
      printData.paper = {
        boardLength: currentPaperConsumption.boardLength + ' mm',
        stitching: currentPaperConsumption.stitching + ' mm',
        actualLength: currentPaperConsumption.actualLength + ' mm',
        flutingSpace: currentPaperConsumption.flutingSpace + ' mm',
        width: currentPaperConsumption.width + ' mm',
        divide: currentPaperConsumption.divide,
        cuttingSpace: currentPaperConsumption.cuttingSpace + ' mm',
        boardWidth: currentPaperConsumption.boardWidth + ' mm',
        paperRollWidth: currentPaperConsumption.paperRollWidth + ' mm',
        paperConsumptionSqm: currentPaperConsumption.paperConsumptionSqm.toFixed(4) + ' SQM'
      };
    }

    window.localStorage.setItem('cartonPrintData', JSON.stringify(printData));
    window.open('pdf_export.html', '_blank');
  });

  // Utility: escape HTML to prevent XSS
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // Render Lucide icons (loads after DOMContentLoaded on slow networks)
  if (window.lucide && lucide.createIcons) {
    lucide.createIcons();
  }
});
```

- [ ] **Step 2: Delete the old PDF module**

```powershell
Remove-Item -LiteralPath "js\pdf.js"
```

- [ ] **Step 3: Syntax-check both JS files**

```powershell
node --check js/app.js
node --check js/calculator.js
```

Expected: both exit with no output (exit code 0).

- [ ] **Step 4: Structural test run (formulas untouched)**

Run the existing QUnit suite logic in node (same pattern as prior tasks):

```powershell
node -e "eval(require('fs').readFileSync('js/data.js','utf8')+'\n'+require('fs').readFileSync('js/calculator.js','utf8'));const p=calculatePaperConsumption('mu',500,600,500);if(p.paperConsumptionSqm!==2.645)throw new Error('paper consumption formula broken');const s=calcSupplierSQM('mu',500,600,500);if(Math.abs(s-3.06)>0.0001)throw new Error('supplier sqm formula broken');const r=calculatePrice('mu',500,600,500,10,0.75);if(!r||r.supplierTotalCost<=0)throw new Error('price broken');console.log('ALL FORMULA TESTS PASS')"
```

Expected: `ALL FORMULA TESTS PASS` (2.645 = M&U paper consumption for 500×600×500; 3.06 = M&U SQM formula).

- [ ] **Step 5: Verify no stale references remain**

```powershell
node -e "const fs=require('fs');const js=fs.readFileSync('js/app.js','utf8')+fs.readFileSync('index.html','utf8');const stale=['pdf-content','pdf-calc-section','quotation-section','quotation-preview','generate-quote-btn','download-pdf-btn','js/pdf.js','generatePDF'];const found=stale.filter(s=>js.includes(s));console.log(found.length?'STALE: '+found.join(', '):'no stale references');"
```

Expected: `no stale references`

- [ ] **Step 6: Commit**

```powershell
git add js/app.js
git rm js/pdf.js
git commit -m "feat: wire export flow to branded pdf page"
```

---

## Self-Review Notes

- Spec coverage: brand assets (Task 1), theme CSS (Task 2), pdf_export.html with clone strategy + status bar + fallback button + filename (Task 3), app.js export flow + localStorage key + removal of old pipeline (Task 4), footer verbatim (Task 1 markup), fonts/icons CDN + bundled html2pdf local (Task 1 markup + Task 3 Step 1), no formula/data/test changes (Task 4 Step 4 structural check).
- Placeholder scan: every step has exact code or exact commands with expected output; no TODOs.
- Type consistency: `printData` shape in Task 3 "Interfaces" matches Task 4 export handler and Task 3 render code (`data.supplier.supplierName`, `data.calc.presetLabel`, `data.results.*`, `data.paper.*`, `divide` passed as number coerced to string for display). DOM IDs listed in Task 1 all referenced in Task 4. Class toggle `.results.show` defined in Task 2 Step 1 and used in Task 4 Step 1.