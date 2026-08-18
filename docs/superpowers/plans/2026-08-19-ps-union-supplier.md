# PS- UNION Supplier Addition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "PS- UNION LABEL & ACCESSORIES LTD." (19 factories) as a fourth packaging supplier in both the carton price calculator and the pricing data check subpage.

**Architecture:** `js/data.js` gains a `ps_union` supplier whose 19 factories all use the shared `FACTORY_SQM_RATE` constant; `js/calculator.js` maps the new `union` formulaId to the existing Union/Epyllion formula via switch fall-through (one formula implementation). The data-check page stays CSV-driven: 19 rows appended to `data.csv` (with the one comma-containing factory name quoted) and `parseCSV` upgraded to a quote-aware splitter.

**Tech Stack:** Vanilla HTML/CSS/JS, QUnit (browser tests via `tests/runner.html`), Node `node:test` (data-check tests via `node --test`).

## Global Constraints

- Factory names must be VERBATIM as listed in the spec (including `AXIS KNIT WAER LTD.`, `L,ESQUIRE LTD.`, `MODEL DE CAPITAL.`).
- Supplier name everywhere: `PS- UNION LABEL & ACCESSORIES LTD.` (note the space after `PS-`).
- Calculator rates: every new factory uses `rate: FACTORY_SQM_RATE` (0.7315) — same as all existing factories. The data-check prices are the listed per-SQM values (0.68-0.76) — the two datasets intentionally differ.
- `formulaId` for `ps_union` is exactly `"union"`, aliased in `calcSupplierSQM` via `case 'union': case 'epyllion':` fall-through — do NOT duplicate the formula math.
- `parseCSV` must produce identical output for all existing unquoted rows (behavior-preserving upgrade).
- The `L,ESQUIRE LTD.` row in `data.csv` is written with the factory field quoted: `PS- UNION LABEL & ACCESSORIES LTD.,"L,ESQUIRE LTD.",0.68`.
- No changes to `js/app.js`, `pdf_export.html`, or the data-check page's rendering/PDF logic.
- `docs/` is gitignored — `git add -f` for files under `docs/`.
- QUnit tests run by opening `tests/runner.html` in a browser (headless Edge `--dump-dom` works: `& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu --dump-dom "<file:///.../tests/runner.html>" > $env:TEMP\qunit.html`, then search the dump for "tests completed"). Known pre-existing failures (2 tests, 3 assertions) must remain unchanged.
- Data-check tests: `node --test primark-pricing-data-check/test/app.test.mjs` from the repo root.
- Work directly on branch `main` (user-approved).

---

### Task 1: Calculator supplier data and formula alias

**Files:**
- Modify: `js/data.js` (add `ps_union` entry after the `uniglory` block, inside `SUPPLIERS`)
- Modify: `js/calculator.js` (`calcSupplierSQM` switch, lines 6-11)
- Test: `tests/data.test.js`, `tests/calculator.test.js`

**Interfaces:**
- Produces: `SUPPLIERS.ps_union` = `{ name: "PS- UNION LABEL & ACCESSORIES LTD.", formulaId: "union", factories: [19 entries, rate: FACTORY_SQM_RATE] }`; `calcSupplierSQM('union', l, w, h)` returns `((l + w + 60) * (w + h + 40) * 2) / 1000000`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/data.test.js`:

```js
QUnit.test('PS-UNION supplier is mapped to the union formula', function(assert) {
  assert.equal(SUPPLIERS.ps_union.name, 'PS- UNION LABEL & ACCESSORIES LTD.');
  assert.equal(SUPPLIERS.ps_union.formulaId, 'union');
  assert.equal(SUPPLIERS.ps_union.factories.length, 19);
});
```

Append to `tests/calculator.test.js` (inside the `QUnit.module('Calculations')` block):

```js
QUnit.test('union formulaId uses the Epyllion/Union SQM formula', function(assert) {
  // ((10+10+60)*(10+10+40)*2)/1M = (80*60*2)/1M = 0.0096
  assert.equal(calcSupplierSQM('union', 10, 10, 10), 0.0096);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Headless Edge dump of `tests/runner.html`. Expected: new data test dies with `SUPPLIERS.ps_union is undefined`; new calculator test fails (`calcSupplierSQM('union', ...)` returns 0 via the default case). The existing `All factories use FACTORY_SQM_RATE` test keeps passing.

- [ ] **Step 3: Implement**

In `js/data.js`, add after the `uniglory` block (before the closing `};` of `SUPPLIERS`):

```js
  ps_union: {
    name: "PS- UNION LABEL & ACCESSORIES LTD.",
    formulaId: "union",
    factories: [
      { name: "WINTER DRESS LTD.", rate: FACTORY_SQM_RATE },
      { name: "HASAN TANVIR FASHION WEAR LTD.", rate: FACTORY_SQM_RATE },
      { name: "NORP KNIT IND.", rate: FACTORY_SQM_RATE },
      { name: "SB STYLE COMPOSITE LTD.", rate: FACTORY_SQM_RATE },
      { name: "MOUCHAK KNIT COMPOSITE LTD.", rate: FACTORY_SQM_RATE },
      { name: "JIN HONG GARMENTS LTD.", rate: FACTORY_SQM_RATE },
      { name: "SOUTHERN KNIT WEAR LTD.", rate: FACTORY_SQM_RATE },
      { name: "GOLDEN REFIT LTD.", rate: FACTORY_SQM_RATE },
      { name: "AXIS KNIT WAER LTD.", rate: FACTORY_SQM_RATE },
      { name: "ECHOKNITS LTD.", rate: FACTORY_SQM_RATE },
      { name: "TARGET DENIM & CASUAL WEAR LTD.", rate: FACTORY_SQM_RATE },
      { name: "MODEL DE CAPITAL.", rate: FACTORY_SQM_RATE },
      { name: "L,ESQUIRE LTD.", rate: FACTORY_SQM_RATE },
      { name: "CHORKA TEXTILE LTD.", rate: FACTORY_SQM_RATE },
      { name: "RIZVI FASHION LTD.", rate: FACTORY_SQM_RATE },
      { name: "WELLDONE APPARELS LTD.", rate: FACTORY_SQM_RATE },
      { name: "CROWN EXCLUSIVE LTD.", rate: FACTORY_SQM_RATE },
      { name: "MG NICHE FLAIR LTD.", rate: FACTORY_SQM_RATE },
      { name: "APS APPARELS LTD.", rate: FACTORY_SQM_RATE }
    ]
  }
```

In `js/calculator.js`, change the switch (lines 6-11) so the `epyllion` case gains a fall-through alias:

```js
function calcSupplierSQM(formulaId, l, w, h) {
  switch(formulaId) {
    case 'union':
    case 'epyllion': return ((l + w + 60) * (w + h + 40) * 2) / 1000000;
    case 'mu': return ((l + 2 * w + 100) * (w + 2 * h + 100)) / 1000000;
    case 'uniglory': return ((l + 2 * w + 100) * (w + 2 * h + 50)) / 1000000;
    default: return 0;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Headless Edge dump of `tests/runner.html`. Expected: the two new tests pass; the uniform-rate test now covers 147 factories (128 + 19) and still passes; failure count unchanged at the 2 pre-existing tests / 3 assertions.

- [ ] **Step 5: Commit**

```bash
git add js/data.js js/calculator.js tests/data.test.js tests/calculator.test.js
git commit -m "feat: add ps-union supplier with union formula alias"
```

---

### Task 2: Calculator dropdown and welcome text

**Files:**
- Modify: `index.html` (supplier dropdown lines 67-72; welcome step text line 36)

**Interfaces:**
- Consumes: `SUPPLIERS.ps_union` from Task 1 (the dropdown value `ps_union` is what `js/app.js` looks up in `SUPPLIERS`).
- Produces: PS- UNION selectable in the calculator; selecting it shows its 19 factories at `$0.73`.

- [ ] **Step 1: Add the dropdown option**

In `index.html`, inside the `#packaging-supplier` select, add after the Uniglory option (line 71):

```html
<option value="ps_union">PS- UNION LABEL &amp; ACCESSORIES LTD.</option>
```

- [ ] **Step 2: Update the welcome step text**

In `index.html` line 36, change:

```html
<span>Epyllion, M&amp;U, or Uniglory</span>
```

to:

```html
<span>Epyllion, M&amp;U, Uniglory, or PS- UNION</span>
```

- [ ] **Step 3: Verify**

Run (PowerShell):

```powershell
Select-String -Path index.html -Pattern 'ps_union' | ForEach-Object { $_.LineNumber.ToString() + ': ' + $_.Line.Trim() }
```

Expected: exactly one match — the dropdown option line.
Then headless Edge load `index.html` and confirm no JS errors (dump contains the rendered page; no console crash). Select PS- UNION manually in a browser if available: factory list shows all 19 factories.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add ps-union to supplier dropdown and welcome text"
```

---

### Task 3: Data-check CSV rows and quote-aware parser

**Files:**
- Modify: `primark-pricing-data-check/data.csv` (append 19 rows)
- Modify: `primark-pricing-data-check/app.js` (`parseCSV`, lines 1-13)
- Test: `primark-pricing-data-check/test/app.test.mjs`

**Interfaces:**
- Consumes: nothing new — `parseCSV(text)` keeps its signature and return shape `{ supplier, factory, price }`.
- Produces: `parseCSV` parses quoted fields containing commas; `data.csv` contains 19 new PS- UNION rows (147 data rows total: 128 existing + 19 new).

- [ ] **Step 1: Write the failing test**

Append to `primark-pricing-data-check/test/app.test.mjs`:

```js
test('parseCSV parses a quoted factory field containing a comma', () => {
  const rows = parseCSV([
    'Packaging Supplier,Factory,Price SQM (US $)',
    'PS- UNION LABEL & ACCESSORIES LTD.,"L,ESQUIRE LTD.",0.68'
  ].join('\n'));
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], { supplier: 'PS- UNION LABEL & ACCESSORIES LTD.', factory: 'L,ESQUIRE LTD.', price: 0.68 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test primark-pricing-data-check/test/app.test.mjs`
Expected: the new test fails — the naive `split(',')` yields `factory: 'L'` and `price: NaN`.

- [ ] **Step 3: Implement the quote-aware parser**

In `primark-pricing-data-check/app.js`, replace line 5 (`const parts = lines[i].split(',');`) with a quote-aware split. Minimal implementation (keep the rest of `parseCSV` unchanged):

```js
function splitCSVLine(line) {
  const parts = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') inQuotes = false;
      else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts;
}
```

and change the loop body to `const parts = splitCSVLine(lines[i]);`. Add `splitCSVLine` to the `module.exports` list only if the test needs it (it does not — keep exports unchanged).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test primark-pricing-data-check/test/app.test.mjs`
Expected: all tests pass, including the new quoted-field test and all 7 existing tests (unchanged behavior for unquoted rows).

- [ ] **Step 5: Append the CSV rows**

Append exactly these 19 lines to `primark-pricing-data-check/data.csv` (no blank line between the last existing row and the first new row; the quoted row uses double quotes as shown):

```text
PS- UNION LABEL & ACCESSORIES LTD.,WINTER DRESS LTD.,0.68
PS- UNION LABEL & ACCESSORIES LTD.,HASAN TANVIR FASHION WEAR LTD.,0.68
PS- UNION LABEL & ACCESSORIES LTD.,NORP KNIT IND.,0.74
PS- UNION LABEL & ACCESSORIES LTD.,SB STYLE COMPOSITE LTD.,0.75
PS- UNION LABEL & ACCESSORIES LTD.,MOUCHAK KNIT COMPOSITE LTD.,0.68
PS- UNION LABEL & ACCESSORIES LTD.,JIN HONG GARMENTS LTD.,0.76
PS- UNION LABEL & ACCESSORIES LTD.,SOUTHERN KNIT WEAR LTD.,0.68
PS- UNION LABEL & ACCESSORIES LTD.,GOLDEN REFIT LTD.,0.68
PS- UNION LABEL & ACCESSORIES LTD.,AXIS KNIT WAER LTD.,0.74
PS- UNION LABEL & ACCESSORIES LTD.,ECHOKNITS LTD.,0.70
PS- UNION LABEL & ACCESSORIES LTD.,TARGET DENIM & CASUAL WEAR LTD.,0.70
PS- UNION LABEL & ACCESSORIES LTD.,MODEL DE CAPITAL.,0.68
PS- UNION LABEL & ACCESSORIES LTD.,"L,ESQUIRE LTD.",0.68
PS- UNION LABEL & ACCESSORIES LTD.,CHORKA TEXTILE LTD.,0.76
PS- UNION LABEL & ACCESSORIES LTD.,RIZVI FASHION LTD.,0.68
PS- UNION LABEL & ACCESSORIES LTD.,WELLDONE APPARELS LTD.,0.75
PS- UNION LABEL & ACCESSORIES LTD.,CROWN EXCLUSIVE LTD.,0.68
PS- UNION LABEL & ACCESSORIES LTD.,MG NICHE FLAIR LTD.,0.68
PS- UNION LABEL & ACCESSORIES LTD.,APS APPARELS LTD.,0.68
```

- [ ] **Step 6: Verify the full pipeline**

Run: `node --test primark-pricing-data-check/test/app.test.mjs` — all pass.
Run: `Select-String -Path primark-pricing-data-check/data.csv -Pattern 'PS- UNION'` — expected 19 matches (one per row), with the `L,ESQUIRE LTD.` row quoted.
Sanity check parse of the real file with Node: `node -e "const {parseCSV,getSuppliers}=require('./primark-pricing-data-check/app.js');const fs=require('fs');const rows=parseCSV(fs.readFileSync('./primark-pricing-data-check/data.csv','utf8'));const ps=rows.filter(r=>r.supplier==='PS- UNION LABEL & ACCESSORIES LTD.');console.log(ps.length, ps.find(r=>r.factory==='L,ESQUIRE LTD.').price)"` — expected output: `19 0.68`.

- [ ] **Step 7: Commit**

```bash
git add primark-pricing-data-check/app.js primark-pricing-data-check/data.csv primark-pricing-data-check/test/app.test.mjs
git commit -m "feat: add ps-union rates to pricing data check with quote-aware csv parser"
```

---

### Task 4: Changelog and README update

**Files:**
- Modify: `VERSION_HISTORY.md`, `README.md`

**Interfaces:**
- Consumes: feature content from Tasks 1-3.
- Produces: v2.4.0 changelog entry; README lists the fourth supplier.

- [ ] **Step 1: Add v2.4.0 changelog entry**

In `VERSION_HISTORY.md`, insert above `## v2.3.0`:

```markdown
## v2.4.0 (PS- UNION Supplier)
*   **New Packaging Supplier**: Added PS- UNION LABEL & ACCESSORIES LTD. with 19 garment factories to the carton price calculator, priced at the standard factory rate (Primark SQM minus 5%) and mapped to the Union/Epyllion SQM formula.
*   **Pricing Data Check**: Added the same 19 factories to the pricing data check with their listed per-SQM rates, including a quoted-field CSV fix so factory names containing commas (e.g. `L,ESQUIRE LTD.`) parse correctly.
```

- [ ] **Step 2: Update README**

In `README.md` line 7, change:

```markdown
*   **Supplier Directory & Rate Execution**: Instantly look up Garment Factories matched to their respective Packaging Suppliers (Epyllion, M&U, Uniglory).
```

to:

```markdown
*   **Supplier Directory & Rate Execution**: Instantly look up Garment Factories matched to their respective Packaging Suppliers (Epyllion, M&U, Uniglory, PS- UNION LABEL & ACCESSORIES LTD.).
```

- [ ] **Step 3: Verify**

Re-read both files to confirm formatting matches the existing bullet style (v2.4.0 block structurally identical to v2.3.0; README line length consistent with other bullets).

- [ ] **Step 4: Commit**

```bash
git add VERSION_HISTORY.md README.md
git commit -m "docs: add v2.4.0 changelog and update readme"
```

---

### Final verification (after all tasks)

- [ ] `node --test primark-pricing-data-check/test/app.test.mjs` — all pass.
- [ ] Headless Edge QUnit (`tests/runner.html`) — only the 2 pre-existing failures remain (assertion count grows by 20: 19 factory-rate + 1 union formula... the 19 rate assertions come from the auto-iterating uniform-rate test; the exact count should be 147 factory assertions + 2 constant assertions for that test).
- [ ] `Select-String -Path primark-pricing-data-check/data.csv -Pattern 'PS- UNION'` — 19 matches; `L,ESQUIRE LTD.` row quoted.
- [ ] Browser check on `index.html`: PS- UNION selectable, 19 factories listed, rate shows `$0.73`; data-check page: PS- UNION filter lists 19 factories with the listed prices.
- [ ] `git status` clean; working tree has no uncommitted changes.