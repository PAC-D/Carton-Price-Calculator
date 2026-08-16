# Pricing Data Check Subpage — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the standalone "Primark Pricing Data Check" app into the `Carton-Price-Calculator` repo as a PACD-themed GitHub Pages subpage at `primark-pricing-data-check/`.

**Architecture:** Self-contained subfolder `primark-pricing-data-check/` in the existing repo, containing `index.html`, `styles.css`, `app.js`, `data.csv`, `test/app.test.mjs`. Subpage links use relative paths (`../pacd.png`, `../index.html`). Data stays independent in `data.csv` (not shared with `js/data.js`). PDF export keeps jsPDF + autoTable, restyled navy.

**Tech Stack:** Vanilla HTML/CSS/JS (existing app logic), PACD theme tokens copied from `css/style.css`, jsPDF 2.5.2 (jsdelivr) + jspdf-autotable 3.8.4 (cdnjs), Node built-in test runner.

## Global Constraints

- Repo root: `C:\Users\Shoaib\OneDrive - PacD\Projects\Primark\Primark Carton SQM Analysis\Carton-Price-Calculator` (branch `main`, remote `origin` = github.com/PAC-D/Carton-Price-Calculator.git).
- Source of the existing app: `C:\Users\Shoaib\OneDrive - PacD\Projects\Primark\Primark Pricing Data Check` — read-only during tasks 1–4; deleted in Task 5 only after verification.
- `data.csv` content: copied byte-for-byte (128 rows, header `Packaging Supplier,Factory,Price SQM (US $)`).
- `app.js` logic: pure functions (`parseCSV`, `getSuppliers`, `getFactories`, `applyFilters`, `formatPrice`) and the `init` DOM block unchanged except: PDF colors (navy header `[0,32,91]`, navy title, PACD footer line) and the navbar link handled in HTML.
- PACD theme: copy tokens from `css/style.css` (--primary #00205b, --secondary #e31837, Outfit/Inter fonts, glass navbar, card radius 1.5rem, pill buttons, `.factory-table` pattern, `.custom-select`, `.search-input`).
- No code comments unless the parent's own files already use them (css/style.css uses a few section comments — matching that is fine).
- Push to `origin/main` happens in Task 5 after all verification.

---

### Task 1: Scaffold subpage folder with PACD-themed structure and styles

**Files:**
- Create: `primark-pricing-data-check/index.html`
- Create: `primark-pricing-data-check/styles.css`

**Interfaces:**
- Consumes: PACD tokens and component patterns from `css/style.css` and `index.html` (already in repo, read them first); app behavior contracts from the old project's `index.html` (element IDs `supplier-filter`, `factory-select`, `factory-search`, `row-count`, `price-tbody`, `export-pdf`, `error-box`, `page-title`).
- Produces: the subpage shell Task 2's `app.js` wires into.

- [ ] **Step 1: Read `css/style.css` and `index.html`** (repo root) to extract exact tokens (palette, fonts, navbar, card, section-label, custom-select, search-input, table, primary-btn, footer).

- [ ] **Step 2: Create `primark-pricing-data-check/index.html`**

Structure (PACD-themed, mirroring the parent's markup patterns):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Primark Pricing Data Check</title>
  <link rel="icon" type="image/png" href="../favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="bg-decoration"></div>

  <nav class="navbar">
    <div class="logo-section">
      <a href="../index.html" class="back-link">&#8592; Carton Price Calculator</a>
      <span class="nav-divider"></span>
      <img src="../pacd.png" alt="PACD Logo" class="logo-img">
    </div>
    <h1 id="page-title">Primark Pricing Data Check</h1>
  </nav>

  <div class="main-container">
    <div class="calculator-card">

      <div id="error-box" class="error-box" style="display: none;"></div>

      <div class="card-section">
        <label class="section-label">Filters</label>
        <div class="filter-grid">
          <div class="form-group">
            <label class="select-label">Packaging Supplier</label>
            <select id="supplier-filter" class="custom-select"></select>
          </div>
          <div class="form-group">
            <label class="select-label">Factory</label>
            <select id="factory-select" class="custom-select"></select>
          </div>
          <div class="form-group">
            <label class="select-label">Factory Search</label>
            <input type="text" id="factory-search" class="search-input no-margin" placeholder="Type to filter factories...">
          </div>
        </div>
      </div>

      <p id="row-count" class="row-count"></p>

      <div class="table-container">
        <table id="price-table" class="factory-table">
          <thead>
            <tr>
              <th>SL</th>
              <th>Packaging Supplier</th>
              <th>Factory</th>
              <th class="price-col">Price SQM (US $)</th>
            </tr>
          </thead>
          <tbody id="price-tbody"></tbody>
        </table>
      </div>

      <div class="export-area">
        <button id="export-pdf" class="primary-btn" disabled>Export PDF</button>
      </div>

    </div>
  </div>

  <footer class="app-footer">
    <p>&copy; 2026 PACD. All rights reserved. <span class="divider">|</span> Developed by <a href="https://ev1shoaib.netlify.app" target="_blank" class="developer-link">EV1</a></p>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.4/jspdf.plugin.autotable.min.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

Note: `&amp;` is not needed here; no `M&amp;U` literal. Keep all element IDs exactly as listed in the Interfaces block. The `.back-link` and `.nav-divider` and `.error-box`, `.filter-grid`, `.no-margin`, `.row-count`, `.export-area`, `.price-col` are new classes defined in styles.css.

- [ ] **Step 3: Create `primark-pricing-data-check/styles.css`**

Write a complete stylesheet using the PACD tokens and patterns from the parent (verify by reading `css/style.css`):

```css
/* Pricing Data Check - PACD Theme */
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

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: 'Outfit', sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.bg-decoration {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: radial-gradient(circle at 10% 10%, rgba(227, 24, 55, 0.03) 0%, transparent 40%),
    radial-gradient(circle at 90% 90%, rgba(0, 32, 91, 0.03) 0%, transparent 40%);
  z-index: -1;
  pointer-events: none;
}

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

.back-link {
  color: var(--primary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.back-link:hover { opacity: 0.75; text-decoration: underline; }

.nav-divider {
  width: 1px;
  height: 24px;
  background: var(--border);
}

.logo-img { height: 40px; width: auto; object-fit: contain; }

.navbar h1 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--primary);
}

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

.error-box {
  background: #fdecea;
  border: 1px solid #f5c6cb;
  color: #8b1e1e;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.card-section { margin-bottom: 1.5rem; }

.section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--secondary);
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.form-group { margin-bottom: 0; position: relative; }

.select-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-main);
  font-weight: 500;
}

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
  outline: none;
  transition: all 0.2s;
}

.search-input.no-margin { margin-bottom: 0; }

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 32, 91, 0.1);
}

.row-count {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.table-container {
  max-height: 420px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.factory-table { width: 100%; border-collapse: collapse; }

.factory-table thead { position: sticky; top: 0; z-index: 1; }

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

.factory-table tbody tr { transition: background-color 0.15s; }
.factory-table tbody tr:hover { background-color: #eff6ff; }

.factory-table .price-col { text-align: right; white-space: nowrap; }
.factory-table td.price-col { font-weight: 600; color: var(--primary); }

.export-area { margin-top: 1.5rem; display: flex; justify-content: flex-end; }

.primary-btn {
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

.app-footer {
  text-align: right;
  padding: 1rem 2rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-family: inherit;
}

.app-footer .divider { opacity: 0.5; margin: 0 0.5rem; }

.app-footer .developer-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.app-footer .developer-link:hover { opacity: 0.8; text-decoration: underline; }

@media (max-width: 640px) {
  .navbar { padding: 0 1rem; }
  .navbar h1 { font-size: 1rem; }
  .logo-img { display: none; }
  .main-container { padding: 20px 1rem 80px; }
  .calculator-card { padding: 1.5rem; }
  .filter-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Serve and verify the shell**

Run `python -m http.server 8000` from the repo root (Start-Process, background). `Invoke-WebRequest http://localhost:8000/primark-pricing-data-check/` → 200, contains `supplier-filter`, `factory-select`, `factory-search`, `export-pdf`, `../pacd.png`, the two CDN script URLs. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add primark-pricing-data-check/index.html primark-pricing-data-check/styles.css
git commit -m "feat: add pacd-themed pricing data check subpage shell"
```

---

### Task 2: Copy app logic, data, and tests into the subpage

**Files:**
- Create: `primark-pricing-data-check/app.js`
- Create: `primark-pricing-data-check/data.csv`
- Create: `primark-pricing-data-check/test/app.test.mjs`

**Interfaces:**
- Consumes: `app.js`, `data.csv`, `test/app.test.mjs` from `C:\Users\Shoaib\OneDrive - PacD\Projects\Primark\Primark Pricing Data Check` (read-only).
- Produces: functional subpage. Task 3 restyles the PDF within `app.js`.

- [ ] **Step 1: Copy the three files byte-for-byte** (`app.js`, `data.csv`, `test/app.test.mjs` — use `Copy-Item`; do not rewrite content).

- [ ] **Step 2: Verify data integrity**

```powershell
(Get-Content primark-pricing-data-check\data.csv | Where-Object { $_.Trim() -ne '' }).Count
```
Expected: 129 (header + 128 rows). Also compare byte-identical with the source: `(Get-FileHash <source>\data.csv).Hash` vs `(Get-FileHash .\primark-pricing-data-check\data.csv).Hash` — must be equal.

- [ ] **Step 3: Run the tests from the subpage folder**

Run: `node --test test/app.test.mjs` (workdir = `primark-pricing-data-check`) → 9 PASS.

- [ ] **Step 4: Verify the page loads and works end-to-end**

Serve repo root (`python -m http.server 8000`), then:
- `Invoke-WebRequest http://localhost:8000/primark-pricing-data-check/data.csv` → 200
- `Invoke-WebRequest http://localhost:8000/primark-pricing-data-check/app.js` → 200
- Node smoke check (script in `%TEMP%`): require `app.js`, parse real `data.csv` → 128 rows; `applyFilters` supplier 'M&U' → 43; factoryText 'app' → > 0.

- [ ] **Step 5: Commit**

```bash
git add primark-pricing-data-check/app.js primark-pricing-data-check/data.csv primark-pricing-data-check/test/app.test.mjs
git commit -m "feat: add pricing data check app logic, data and tests"
```

---

### Task 3: Restyle PDF export to PACD theme

**Files:**
- Modify: `primark-pricing-data-check/app.js` (inside `exportPDF` only)

**Interfaces:**
- Consumes: existing `exportPDF` in `app.js` (read the file first).
- Produces: PACD-styled PDF (navy header row, navy title, PACD footer line).

- [ ] **Step 1: Edit `exportPDF` in `primark-pricing-data-check/app.js`**

Change exactly these parts (keep all other behavior identical):

- Title text color + size: after `doc.setFontSize(16);` add `doc.setTextColor(0, 32, 91);` before `doc.text('Primark Pricing Data Check', 14, 16);` then reset with `doc.setTextColor(0, 0, 0);` for the subsequent lines.
- autoTable `headStyles`: change `fillColor: [31, 96, 196]` to `fillColor: [0, 32, 91]`.
- Footer: inside `didDrawPage`, before the page-number line add a PACD credit line on the left:
  ```js
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PACD © 2026', 14, 290);
  doc.setTextColor(0, 0, 0);
  ```
  (keep the existing page number at right).

No other changes to `app.js`.

- [ ] **Step 2: Run tests**

Run: `node --test test/app.test.mjs` (workdir = `primark-pricing-data-check`) → 9 PASS.

- [ ] **Step 3: Verify the three edits**

`Select-String` in `primark-pricing-data-check/app.js` for `fillColor: [0, 32, 91]`, `setTextColor(0, 32, 91)`, `PACD © 2026` → all present. Confirm `didDrawPage` still contains `Page ` + page number line.

- [ ] **Step 4: Commit**

```bash
git add primark-pricing-data-check/app.js
git commit -m "feat: restyle pdf export to pacd theme"
```

---

### Task 4: Parent navbar link + README + VERSION_HISTORY

**Files:**
- Modify: `index.html` (repo root — add navbar link)
- Modify: `README.md`
- Modify: `VERSION_HISTORY.md`

**Interfaces:**
- Consumes: existing parent files (read first).
- Produces: cross-navigation + repo docs.

- [ ] **Step 1: Add subpage link to parent navbar**

In repo-root `index.html`, in the `.navbar` after the `<h1>Carton Price Calculator</h1>` line (line 21), insert:

```html
    <a href="primark-pricing-data-check/" class="nav-sub-link">Pricing Data Check</a>
```

- [ ] **Step 2: Add the `nav-sub-link` style to `css/style.css`**

Append before the responsive media query:

```css
.nav-sub-link {
  color: var(--secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: opacity 0.2s;
}

.nav-sub-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}
```

- [ ] **Step 3: Update README.md**

After the "## 🛠️ Usage" section, insert:

```markdown
## 🔗 Sub-pages

*   **Pricing Data Check** (`primark-pricing-data-check/`): Standalone look-up of packaging rates (US $ per SQM) by factory and supplier, with filter and PDF export. Rate data is maintained separately in `primark-pricing-data-check/data.csv`.
```

- [ ] **Step 4: Update VERSION_HISTORY.md**

Add at the top (after `# Version History`), following the existing bullet format:

```markdown
## v2.1.0 (Pricing Data Check Subpage)
*   **Pricing Data Check Subpage**: Added a PACD-themed subpage for packaging rate look-up by factory and packaging supplier, with supplier/factory filters and branded PDF export. Data maintained independently in `primark-pricing-data-check/data.csv`.
```

- [ ] **Step 5: Verify**

Serve repo root, fetch `/` → 200 and contains `nav-sub-link` + `primark-pricing-data-check/`; fetch `/primark-pricing-data-check/` → 200. `node --test` still 9 PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css README.md VERSION_HISTORY.md
git commit -m "feat: link pricing data check subpage from navbar and update docs"
```

---

### Task 5: Verify, push, delete old folder

**Files:**
- Delete: `C:\Users\Shoaib\OneDrive - PacD\Projects\Primark\Primark Pricing Data Check` (entire folder — OneDrive keeps it recoverable)
- No new repo files.

**Interfaces:**
- Consumes: everything from Tasks 1–4; approval already given to delete the old folder after verification.

- [ ] **Step 1: Full verification**

- `node --test test/app.test.mjs` (workdir = subpage) → 9 PASS
- Serve repo root; fetch `/`, `/primark-pricing-data-check/`, `/primark-pricing-data-check/data.csv`, `/primark-pricing-data-check/app.js`, `/primark-pricing-data-check/styles.css` → all 200
- `git status` → clean

- [ ] **Step 2: Push**

```bash
git push -u origin main
```
Expected: pushed to github.com/PAC-D/Carton-Price-Calculator.git. (Auth handled by Git Credential Manager; if it fails, report the error to the controller/user rather than retrying blindly.)

- [ ] **Step 3: Delete the old standalone folder**

```powershell
Remove-Item -Recurse -Force "C:\Users\Shoaib\OneDrive - PacD\Projects\Primark\Primark Pricing Data Check"
```
Confirm gone. Report the live subpage URL: `https://PAC-D.github.io/Carton-Price-Calculator/primark-pricing-data-check/` (live once Pages serves the repo, typically within a minute of push).

- [ ] **Step 4: Report**

Summarize: subpage path + URL, what was changed, tests, push result, old-folder deletion, and the manual browser checklist (filters, table, PDF download) the user should run at the live URL.
