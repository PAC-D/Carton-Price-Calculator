# Supplier Full Names + Data-Check Polish Implementation Plan

> **POST-EXECUTION CORRECTION (2026-08-19):** After Tasks 1-6 were completed, reviewed, and shipped, the user clarified that the Primark SQM Price benchmark should be a **COLUMN**, not a row. Follow-up commit `fix: show primark sqm price as column instead of row` converted it: Tasks 4 and 5 as written below (tfoot row + bold last PDF row) were executed as planned and then replaced — `index.html` no longer has a tfoot, `app.js` has no `body.push`/`rowStyles`, and both table and PDF now carry a 5th column `Primark SQM Price (US $)` with `0.77` on every row. The spec reflects the corrected design.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show full packaging supplier names (Epyllion Limited, M&U Packaging Ltd, Uniglory Paper & Packaging) on both pages, and polish the pricing data check page: Primark SQM Price column, supplier-first alphabetical sorting, dark blue PDF title with generation date.

**Architecture:** The calculator page's display names live in `js/data.js` `name:` fields plus hardcoded `index.html` labels — update those. The data-check page derives everything (table, filter, PDF) from `data.csv` column 1 — update the CSV (Approach A) and its test fixtures. Then add a pure `sortRows()` helper to the data-check `app.js` (unit-tested via node), wire it into render + PDF, add a Primark SQM Price column to the on-screen table and the PDF table, and restyle the PDF title/date. Changelog v2.4.2 last.

**Tech Stack:** Vanilla JS + HTML + CSS, jsPDF 2.5.2 + autotable 3.8.4 (CDN), node:test for unit tests, QUnit in headless Edge for regression.

## Global Constraints

- Windows PowerShell only; repo root = `C:\Users\Shoaib\OneDrive - PacD\Projects\Primark\Primark Carton SQM Analysis\Carton-Price-Calculator`; work directly on branch `main` (user-approved).
- `docs/` is gitignored -> use `git add -f` for anything under `docs/`.
- SDD workspace for this feature: `.superpowers/sdd/2026-08-19-supplier-full-names-data-check/` (create it). Each task's report goes to `<workspace>\task-N-report.md`; each implementer replies with Status / Commit / Verification / Concerns / Report path.
- `primark-pricing-data-check/data.backup-2026-08-19.csv` MUST NEVER be modified.
- `PRIMARK_SQM_RATE = 0.77` in `js/data.js` — the new `PRIMARK_SQM_PRICE` constant in data-check `app.js` must equal `0.77` (comment notes the sync).
- Supplier keys `epyllion` / `mu` / `uniglory` / `ps_union` NEVER change. `UNION LABEL & ACCESSORIES LTD.` name NEVER changes.
- `data.csv`: header, row order, factory names, and prices NEVER change — only column 1 supplier values.
- HTML on the calculator page: `&` must be `&amp;` (e.g. `M&amp;U Packaging Ltd`).
- QUnit baseline: 14 tests, 181 assertions passed, EXACTLY the 2 pre-existing failures (CARTON_PRESETS window access; Primark SQM float). data-check `node --test`: 10/10 baseline, 11/11 after `sortRows` is added.
- QUnit headless run command (Edge path, URL MUST be double-quoted — spaces in repo path):
```powershell
$msedge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"; if (-not (Test-Path $msedge)) { $msedge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }; $url = "file:///" + ((Get-Location).Path -replace '\\','/') + "/tests/runner.html"; $args = "--headless --disable-gpu --dump-dom `"$url`""; $p = Start-Process -FilePath $msedge -ArgumentList $args -RedirectStandardOutput "$env:TEMP\opencode\qunit-suppliers.txt" -PassThru -Wait; $c = Get-Content "$env:TEMP\opencode\qunit-suppliers.txt" -Raw; [regex]::Match($c, 'qunit-testresult-display[^>]*>([^<]+)').Groups[1].Value
```
Expected output: `14 tests completed in 11 milliseconds, with 2 failed, 0 skipped, and 0 todo.` (timing may vary).
- Counts command (first-field split is safe — supplier column never contains commas or quotes):
```powershell
node -e "const fs=require('fs');const lines=fs.readFileSync('primark-pricing-data-check/data.csv','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('Packaging'));const c={};lines.forEach(l=>{const s=l.slice(0,l.indexOf(','));c[s]=(c[s]||0)+1});console.log(JSON.stringify(c));console.log('total',lines.length)"
```
Expected after Task 2: `{"Epyllion Limited":30,"M&U Packaging Ltd":43,"Uniglory Paper & Packaging":55,"UNION LABEL & ACCESSORIES LTD.":19}` `total 147`.

---

### Task 1: Calculator page full supplier names

**Files:**
- Modify: `js/data.js:6,42,91` (`name:` fields)
- Modify: `index.html:36,69-72` (welcome text + dropdown options)
- Verify: `tests/runner.html` via the Global Constraints QUnit command

**Interfaces:**
- Consumes: `SUPPLIERS` object keys `epyllion`/`mu`/`uniglory`/`ps_union` (unchanged)
- Produces: `SUPPLIERS[name]` display values used by `js/app.js` (rate display, PDF export `supplierName`) and the dropdown/welcome labels

- [ ] **Step 1: Update the `name:` fields in `js/data.js`**

Read `js/data.js` first (line numbers may shift). Change exactly three `name:` values; keys, factories, rates, formulaIds untouched:

- Line 6: `name: "Epyllion",` -> `name: "Epyllion Limited",`
- Line 42: `name: "M&U",` -> `name: "M&U Packaging Ltd",`
- Line 91: `name: "Uniglory",` -> `name: "Uniglory Paper & Packaging",`
- `ps_union` (`name: "UNION LABEL & ACCESSORIES LTD."`, ~line 152): unchanged.

- [ ] **Step 2: Update the dropdown options in `index.html`**

Lines 69-71 (values/keys unchanged, display text only):

```html
<option value="epyllion">Epyllion Limited</option>
<option value="mu">M&amp;U Packaging Ltd</option>
<option value="uniglory">Uniglory Paper &amp; Packaging</option>
```

Line 72 (`ps_union`) unchanged.

- [ ] **Step 3: Update the welcome text in `index.html`**

Line 36:

```html
<span>Epyllion Limited, M&amp;U Packaging Ltd, Uniglory Paper &amp; Packaging, or UNION LABEL &amp; ACCESSORIES LTD.</span>
```

- [ ] **Step 4: Verify**

1. Grep for leftovers: `Select-String -Path "js/data.js","index.html" -Pattern '"Epyllion",|"M&U",|"Uniglory",|>Epyllion<|>M&amp;U<|>Uniglory<'` -> expect NO matches.
2. Grep the new names: `Select-String -Path "js/data.js","index.html" -Pattern "Epyllion Limited|M&amp;U Packaging Ltd|Uniglory Paper"` -> expect 2 matches in data.js (each name once) and 2 in index.html (each once) plus the welcome line.
3. Run the QUnit headless command from Global Constraints. Expected: `14 tests completed ... with 2 failed` (assertions 181 passed) — totals UNCHANGED.
4. `git status --short` shows exactly `index.html` and `js/data.js` modified.

- [ ] **Step 5: Commit**

```powershell
git add index.html js/data.js; git commit -m "feat: show full packaging supplier names on calculator"
```

---

### Task 2: Data-check page full supplier names (data.csv + tests)

**Files:**
- Modify: `primark-pricing-data-check/data.csv` (column 1 values, 128 rows)
- Modify: `primark-pricing-data-check/test/app.test.mjs` (fixtures + assertions)

**Interfaces:**
- Consumes: existing `parseCSV`/`getSuppliers`/`applyFilters` from `app.js` (unchanged)
- Produces: `data.csv` with full supplier names — consumed by every later task's verification (counts) and by the live page (table, filter, PDF)

- [ ] **Step 1: Update the test fixtures FIRST (TDD — they must fail against the old CSV)**

In `primark-pricing-data-check/test/app.test.mjs`:

1. `SAMPLE` (lines 8-13): replace the three data lines with:
```
'Epyllion Limited,Fakir Knitwears Ltd.,0.7',
'M&U Packaging Ltd,Akh Eco Apparels Ltd,0.96',
'Uniglory Paper & Packaging,AB APPARELS LTD,0.78'
```
2. Line 18: `supplier: 'Epyllion'` -> `supplier: 'Epyllion Limited'`
3. Line 19: `supplier: 'Uniglory'` -> `supplier: 'Uniglory Paper & Packaging'`
4. Line 28: `['All', 'Epyllion', 'M&U', 'Uniglory']` -> `['All', 'Epyllion Limited', 'M&U Packaging Ltd', 'Uniglory Paper & Packaging']`
5. Lines 36, 37: `{ supplier: 'M&U', ... }` -> `{ supplier: 'M&U Packaging Ltd', ... }`
6. Line 47: `{ supplier: 'Uniglory', ... }` -> `{ supplier: 'Uniglory Paper & Packaging', ... }`
7. The UNION quoted-field test (lines 61-68): unchanged.

- [ ] **Step 2: Run the tests to confirm they FAIL**

Run: `node --test primark-pricing-data-check/test/app.test.mjs`
Expected: FAIL — 4 tests fail on supplier name mismatches (parseCSV, getSuppliers, applyFilters x2). The UNION test and formatPrice still pass.

- [ ] **Step 3: Update `data.csv` column 1 (preserves all other bytes)**

Run this PowerShell (regex anchored to line start with `(?m)`; `&` in `M&U,` is a literal regex char; replacement inserts text only, so CRLF/LF endings and all other content are untouched):

```powershell
$p = (Resolve-Path "primark-pricing-data-check/data.csv").Path; $t = [IO.File]::ReadAllText($p); $t = $t -replace '(?m)^Epyllion,', 'Epyllion Limited,'; $t = $t -replace '(?m)^M&U,', 'M&U Packaging Ltd,'; $t = $t -replace '(?m)^Uniglory,', 'Uniglory Paper & Packaging,'; [IO.File]::WriteAllText($p, $t)
```

Then confirm: `Select-String -Path "primark-pricing-data-check/data.csv" -Pattern "^Epyllion,|^M&U,|^Uniglory,"` -> NO matches.

- [ ] **Step 4: Verify**

1. `node --test primark-pricing-data-check/test/app.test.mjs` -> 10/10 PASS.
2. Run the counts command from Global Constraints -> `{"Epyllion Limited":30,"M&U Packaging Ltd":43,"Uniglory Paper & Packaging":55,"UNION LABEL & ACCESSORIES LTD.":19}` `total 147`.
3. Backup untouched: `git status --short` must show ONLY `primark-pricing-data-check/data.csv` and `primark-pricing-data-check/test/app.test.mjs`. Also `git diff -- primark-pricing-data-check/data.csv | Select-String "^-" | Select-String -NotMatch "Epyllion|M&U|Uniglory"` -> no removed lines other than the three old supplier prefixes.
4. Header + UNION rows unchanged: `Get-Content primark-pricing-data-check/data.csv | Select-Object -First 1` shows `Packaging Supplier,Factory,Price SQM (US $)`; `Select-String "UNION LABEL" primark-pricing-data-check/data.csv` -> 19 matches.

- [ ] **Step 5: Commit**

```powershell
git add primark-pricing-data-check/data.csv primark-pricing-data-check/test/app.test.mjs; git commit -m "feat: use full packaging supplier names in pricing data check"
```

---

### Task 3: `sortRows()` helper + wire into render and PDF

**Files:**
- Modify: `primark-pricing-data-check/app.js` (new function + `module.exports` + `render()` + `exportPDF()`)
- Modify: `primark-pricing-data-check/test/app.test.mjs` (new test + import)

**Interfaces:**
- Produces: `sortRows(rows) -> rows[]` (new, exported) — returns a NEW array, never mutates input; sorts by `supplier.localeCompare` then `factory.localeCompare`.

- [ ] **Step 1: Write the failing test**

In `test/app.test.mjs`, add `sortRows` to the import (line 6) and append this test:

```js
test('sortRows sorts by supplier then factory', () => {
  const rows = [
    { supplier: 'Uniglory Paper & Packaging', factory: 'Zebra Ltd', price: 1 },
    { supplier: 'M&U Packaging Ltd', factory: 'Alpha Ltd', price: 1 },
    { supplier: 'Epyllion Limited', factory: 'Beta Ltd', price: 1 },
    { supplier: 'Epyllion Limited', factory: 'Alpha Ltd', price: 1 }
  ];
  assert.deepEqual(sortRows(rows).map(r => r.supplier + '|' + r.factory), [
    'Epyllion Limited|Alpha Ltd',
    'Epyllion Limited|Beta Ltd',
    'M&U Packaging Ltd|Alpha Ltd',
    'Uniglory Paper & Packaging|Zebra Ltd'
  ]);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test primark-pricing-data-check/test/app.test.mjs`
Expected: FAIL — `sortRows is not a function`.

- [ ] **Step 3: Implement `sortRows`**

In `primark-pricing-data-check/app.js`, add after `formatPrice` (line 56):

```js
function sortRows(rows) {
  return [...rows].sort((a, b) =>
    a.supplier.localeCompare(b.supplier) || a.factory.localeCompare(b.factory));
}
```

Update `module.exports` (line 59):

```js
module.exports = { parseCSV, getSuppliers, getFactories, applyFilters, formatPrice, sortRows };
```

- [ ] **Step 4: Wire `sortRows` into the page**

1. In `render()` (line 105), sort the filtered rows before display:

```js
const filtered = sortRows(applyFilters(state.rows, {
  supplier: els.supplierFilter.value,
  factoryText: els.factorySearch.value
}));
```

2. In `exportPDF()` (line 143), replace the inline sort:

```js
const sorted = sortRows(filtered);
```

(The old inline `[...filtered].sort(...)` line is removed — same semantics, single source of truth.)

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test primark-pricing-data-check/test/app.test.mjs`
Expected: 11/11 PASS.

- [ ] **Step 6: Verify + commit**

1. `git status --short` -> exactly `app.js` and the test file modified.
2. Commit:

```powershell
git add primark-pricing-data-check/app.js primark-pricing-data-check/test/app.test.mjs; git commit -m "feat: sort data check rows by supplier then factory"
```

---

### Task 4: On-screen Primark SQM Price row (tfoot)

**Files:**
- Modify: `primark-pricing-data-check/index.html` (tfoot after `#price-tbody`)
- Modify: `primark-pricing-data-check/app.js` (constant + fill the cell)
- Modify: `primark-pricing-data-check/styles.css` (`.benchmark-row` rule)

**Interfaces:**
- Produces: `PRIMARK_SQM_PRICE` const (= 0.77) in `app.js`; `<tfoot id="price-tfoot">` with `<td id="benchmark-price">`; CSS class `.benchmark-row`
- Consumes: `formatPrice` (existing) for the price cell text

- [ ] **Step 1: Add the tfoot to `primark-pricing-data-check/index.html`**

After the closing `</tbody>` (line 59), before `</table>` (line 61):

```html
<tfoot class="benchmark-row">
  <tr>
    <td></td>
    <td>Primark SQM Price</td>
    <td></td>
    <td class="price-col" id="benchmark-price"></td>
  </tr>
</tfoot>
```

- [ ] **Step 2: Add the constant to `app.js`**

At the top of `app.js`, before `splitCSVLine` (line 1):

```js
const PRIMARK_SQM_PRICE = 0.77; // keep in sync with PRIMARK_SQM_RATE in js/data.js
```

- [ ] **Step 3: Fill the price cell in `init()`**

In `init()` (inside the `.then(...)` after `render()`, around line 88):

```js
document.getElementById('benchmark-price').textContent = formatPrice(PRIMARK_SQM_PRICE);
```

- [ ] **Step 4: Add the CSS rule to `styles.css`**

After the `.factory-table td.price-col` rule (line 215):

```css
.factory-table .benchmark-row td {
  font-weight: 600;
  color: var(--text-muted);
  background: #f8fafc;
  border-top: 2px solid var(--border);
}
.factory-table .benchmark-row td.price-col { color: var(--primary); }
```

- [ ] **Step 5: Verify**

1. `node --test primark-pricing-data-check/test/app.test.mjs` -> 11/11 (regression only; the constant is not exported).
2. Read `index.html` — tfoot sits between `</tbody>` and `</table>`; the empty-state branch of `render()` (line 110-113, colspan 4 row) is unaffected because the tfoot renders below the tbody regardless.
3. `git status --short` -> exactly `index.html`, `app.js`, `styles.css` modified.
4. Manual (user): serve the repo (`python -m http.server 8000` from the data-check folder's parent or any static server) and confirm the row shows `Primark SQM Price` with `0.77` right-aligned, bold, with a top border — visible even when a filter matches 0 rows.

- [ ] **Step 6: Commit**

```powershell
git add primark-pricing-data-check/index.html primark-pricing-data-check/app.js primark-pricing-data-check/styles.css; git commit -m "feat: show primark sqm price row in data check table"
```

---

### Task 5: PDF polish — benchmark row, title color, generation date

**Files:**
- Modify: `primark-pricing-data-check/app.js` (`exportPDF()` only)

**Interfaces:**
- Consumes: `PRIMARK_SQM_PRICE` (Task 4), `formatPrice` (existing), `sortRows` (Task 3)

- [ ] **Step 1: Add the benchmark row to the PDF table body**

In `exportPDF()` (around line 145), after the `body` mapping:

```js
body.push(['', 'Primark SQM Price', '', formatPrice(PRIMARK_SQM_PRICE)]);
```

- [ ] **Step 2: Make that row bold**

In the `autoTable` options (after `columnStyles`, around line 185):

```js
rowStyles: function (row) {
  if (row.index === body.length - 1) {
    return { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [0, 32, 91] };
  }
  return {};
}
```

- [ ] **Step 3: Title color dark blue + generation date**

Around lines 169-176, replace:

```js
doc.setFontSize(13);
doc.setFont('helvetica', 'bold');
doc.setTextColor(227, 24, 55);
doc.text('Carton Price for Factory', 14, 31);
doc.setFont('helvetica', 'normal');

doc.autoTable({
  startY: 36,
```

with:

```js
doc.setFontSize(13);
doc.setFont('helvetica', 'bold');
doc.setTextColor(0, 32, 91);
doc.text('Carton Price for Factory', 14, 31);
doc.setFontSize(9);
doc.setFont('helvetica', 'normal');
doc.setTextColor(100, 116, 139);
doc.text('Generated on ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), 14, 36);

doc.autoTable({
  startY: 40,
```

- [ ] **Step 4: Verify**

1. `node --test primark-pricing-data-check/test/app.test.mjs` -> 11/11 (regression).
2. Read the changed region — title dark blue (0,32,91), date line at y=36 gray (100,116,139), table now starts at y=40 so the date never overlaps.
3. `git status --short` -> exactly `app.js` modified.
4. Manual (user): export a PDF, confirm: title is dark blue (NOT red), `Generated on <e.g. 19 August 2026>` sits under it, and the last table row is a bold `Primark SQM Price` / `0.77`.

- [ ] **Step 5: Commit**

```powershell
git add primark-pricing-data-check/app.js; git commit -m "feat: polish data check pdf export (title color, date, primark sqm row)"
```

---

### Task 6: Changelog v2.4.2

**Files:**
- Modify: `VERSION_HISTORY.md` (root — tracked, normal `git add`)

**Interfaces:**
- Consumes: nothing; produces the changelog entry reflecting Tasks 1-5

- [ ] **Step 1: Read the current top of `VERSION_HISTORY.md`**

The latest entry is `## v2.4.1 (Official Factory Name Updates)`. Match its style: `## vX.Y.Z (Title)` + `*   **Bold Lead**: text` bullets.

- [ ] **Step 2: Insert the v2.4.2 block ABOVE `## v2.4.1`**

```markdown
## v2.4.2 (Supplier Full Names & Data-Check Polish)
*   **Full Supplier Names**: Packaging suppliers now show their official full names on both pages — Epyllion Limited, M&U Packaging Ltd, Uniglory Paper & Packaging (UNION LABEL & ACCESSORIES LTD. unchanged).
*   **Data-Check Polish**: The pricing data check page now shows a Primark SQM Price row (US$ 0.77), sorts factories alphabetically within packaging supplier groups, and exports PDFs with a dark blue title and generation date.
```

(Blank line above and below the block, matching the v2.4.1 block's spacing.)

- [ ] **Step 3: Verify**

1. `Get-Content VERSION_HISTORY.md | Select-Object -First 8` -> v2.4.2 block at top, followed by blank line and `## v2.4.1`.
2. `git status --short` -> exactly `VERSION_HISTORY.md` modified.

- [ ] **Step 4: Commit**

```powershell
git add VERSION_HISTORY.md; git commit -m "docs: add v2.4.2 changelog"
```