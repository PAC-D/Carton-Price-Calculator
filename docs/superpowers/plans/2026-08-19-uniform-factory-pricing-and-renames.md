# Uniform Factory Pricing + Label Renames Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set every factory's rate to the Primark SQM rate minus 5%, rename the result-card labels, and move Paper Consumption above the price cards in both the calculator and the PDF export.

**Architecture:** Single source of truth for rates in `js/data.js` via two constants (`PRIMARK_SQM_RATE = 0.77`, `FACTORY_SQM_RATE = PRIMARK_SQM_RATE * 0.95 = 0.7315`); `js/calculator.js` references the constant instead of a literal. `index.html` and `pdf_export.html` get static label and section-order changes only. `primark-pricing-data-check/` is untouched.

**Tech Stack:** Vanilla HTML/CSS/JS, QUnit (browser tests via `tests/runner.html`).

## Global Constraints

- Rates apply to the calculator only — `primark-pricing-data-check/data.csv` must NOT change.
- `PRIMARK_SQM_RATE = 0.77` and `FACTORY_SQM_RATE = PRIMARK_SQM_RATE * 0.95` (0.7315) are the only accepted values.
- Rename map (must match exactly):
  - "Supplier Cost" -> "Packaging Supplier Price"
  - "Primark Price" -> "Primark Carton Price"
  - PDF: "Supplier SQM / Carton" -> "Packaging Supplier SQM / Carton"; "Supplier Cost / Carton" -> "Packaging Supplier Price / Carton"; "Supplier Total" -> "Packaging Supplier Total"; "Primark SQM / Carton" -> "Primark Carton SQM / Carton"; "Primark Cost / Carton" -> "Primark Carton Price / Carton"; "Primark Total" -> "Primark Carton Total". "Margin (Primark - Supplier)" stays unchanged.
- Paper Consumption must render ABOVE the price cards (calculator) and ABOVE "Cost Breakdown" (PDF).
- No changes to `js/app.js` logic.
- `docs/` is gitignored in this repo — all `git add` commands for files under `docs/` must use `git add -f`.
- Tests run by opening `tests/runner.html` in a browser (QUnit); pass = all green.

---

### Task 1: Rate constants and uniform factory pricing

**Files:**
- Modify: `js/data.js` (add constants at top, replace every `rate: <number>` literal)
- Test: `tests/data.test.js`

**Interfaces:**
- Produces: `const PRIMARK_SQM_RATE = 0.77;` and `const FACTORY_SQM_RATE = PRIMARK_SQM_RATE * 0.95;` at top level of `js/data.js` (script-tag global, available to `calculator.js` and tests). Every `SUPPLIERS.<key>.factories[].rate` equals `FACTORY_SQM_RATE`.

- [ ] **Step 1: Write the failing test**

Append to `tests/data.test.js`:

```js
QUnit.test('All factories use FACTORY_SQM_RATE (primark minus 5%)', function(assert) {
  assert.equal(PRIMARK_SQM_RATE, 0.77, 'Primark rate is 0.77');
  assert.equal(FACTORY_SQM_RATE, 0.7315, 'Factory rate is primark minus 5%');
  Object.keys(SUPPLIERS).forEach(function(key) {
    SUPPLIERS[key].factories.forEach(function(f) {
      assert.equal(f.rate, FACTORY_SQM_RATE, key + ' / ' + f.name + ' uses FACTORY_SQM_RATE');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Open `tests/runner.html` in a browser. Expected: `PRIMARK_SQM_RATE is undefined` / ReferenceError for the new test; the two new assertions fail.

- [ ] **Step 3: Implement constants and uniform rates**

In `js/data.js`, add at the very top (above `const SUPPLIERS`):

```js
const PRIMARK_SQM_RATE = 0.77;
const FACTORY_SQM_RATE = PRIMARK_SQM_RATE * 0.95;
```

Then replace every `rate: [0-9.]+` occurrence in the `SUPPLIERS` object (129 occurrences) with `rate: FACTORY_SQM_RATE`. Use a regex find-and-replace over the whole file: pattern `rate: [0-9.]+` -> `rate: FACTORY_SQM_RATE`. After the replace, verify with a search for `rate: [0-9]` that no numeric rate literals remain.

- [ ] **Step 4: Run test to verify it passes**

Reload `tests/runner.html`. Expected: all tests green, including the new "All factories use FACTORY_SQM_RATE" test.

- [ ] **Step 5: Commit**

```bash
git add js/data.js tests/data.test.js
git commit -m "feat: set all factory rates to primark sqm rate minus 5%"
```

---

### Task 2: Calculator uses PRIMARK_SQM_RATE constant

**Files:**
- Modify: `js/calculator.js:23`
- Test: `tests/calculator.test.js`

**Interfaces:**
- Consumes: `PRIMARK_SQM_RATE`, `FACTORY_SQM_RATE` globals from `js/data.js` (Task 1).
- Produces: `calculatePrice(formulaId, l, w, h, qty, factoryRate)` with `primarkPricePerCarton = primarkSqm * PRIMARK_SQM_RATE` (no hardcoded 0.77 anywhere in `calculator.js`).

- [ ] **Step 1: Write the failing test**

Append to `tests/calculator.test.js` and update the existing `calculatePrice full payload` test to pass `FACTORY_SQM_RATE` instead of `0.70`:

```js
QUnit.test('calculatePrice uses PRIMARK_SQM_RATE and FACTORY_SQM_RATE', function(assert) {
  const res = calculatePrice('epyllion', 10, 10, 10, 2, FACTORY_SQM_RATE);
  assert.equal(res.primarkPricePerCarton, res.primarkSqm * PRIMARK_SQM_RATE);
  assert.equal(res.supplierCostPerCarton, res.supplierSqm * FACTORY_SQM_RATE);
  assert.equal(res.supplierTotalCost, res.supplierCostPerCarton * 2);
  assert.equal(res.primarkTotalPrice, res.primarkPricePerCarton * 2);
  assert.equal(res.margin, res.primarkTotalPrice - res.supplierTotalCost);
});
```

- [ ] **Step 2: Run test to verify it fails**

Open `tests/runner.html` in a browser. The new test currently passes because `0.77` happens to equal `PRIMARK_SQM_RATE` — so first make the test meaningful: temporarily change line 23 of `js/calculator.js` to `primarkSqm * 0.99` and confirm the new test FAILS, then revert to `0.77`. (If the test fails with the revert, something else is wrong — stop and investigate.)

- [ ] **Step 3: Implement the change**

In `js/calculator.js`, change line 23 from:

```js
const primarkPricePerCarton = primarkSqm * 0.77;
```

to:

```js
const primarkPricePerCarton = primarkSqm * PRIMARK_SQM_RATE;
```

- [ ] **Step 4: Run test to verify it passes**

Reload `tests/runner.html`. Expected: all tests green, including the new `calculatePrice uses PRIMARK_SQM_RATE and FACTORY_SQM_RATE` test.

- [ ] **Step 5: Commit**

```bash
git add js/calculator.js tests/calculator.test.js
git commit -m "refactor: use PRIMARK_SQM_RATE constant in calculatePrice"
```

---

### Task 3: Calculator page renames and paper consumption placement

**Files:**
- Modify: `index.html` (result-card headings, `#paper-consumption-card` position)

**Interfaces:**
- Consumes: DOM element IDs `#calc-results`, `#paper-consumption-card` (unchanged IDs — `js/app.js` visibility logic keeps working untouched).
- Produces: Result card headings "Packaging Supplier Price" and "Primark Carton Price"; `#paper-consumption-card` directly above `#calc-results`.

- [ ] **Step 1: Rename result card headings**

In `index.html`:
- Line 152: `<h4 ...>Supplier Cost</h4>` -> `<h4 ...>Packaging Supplier Price</h4>` (keep all inline styles identical).
- Line 168: `<h4 ...>Primark Price</h4>` -> `<h4 ...>Primark Carton Price</h4>` (keep all inline styles identical).

- [ ] **Step 2: Move paper consumption above the price cards**

Cut the entire `#paper-consumption-card` section (the `<section id="paper-consumption-card" ...>` block, currently between `#calc-results` and the export button) and paste it directly above `<div id="calc-results" class="results">`. Resulting DOM order inside the "Carton Calculation" card-section:

1. `#calc-instruction`
2. `#paper-consumption-card`
3. `#calc-results`
4. `#export-pdf-btn`

Do not change any content, IDs, or inline styles inside the moved section.

- [ ] **Step 3: Verify**

Run: `Select-String -Path index.html -Pattern "Supplier Cost|Primark Price"` — expected: no matches (only the new names exist).
Run: `Select-String -Path index.html -Pattern "paper-consumption-card|calc-results"` — expected: `paper-consumption-card` appears in source before `calc-results`.
Then open `index.html` in a browser, select Epyllion -> any factory, enter 495 x 285 x 375 x 1: Paper Consumption card renders above the Packaging Supplier Price / Primark Carton Price cards, rate shows `$0.73`, margin is positive.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: rename price card labels and move paper consumption above prices"
```

---

### Task 4: PDF export renames and paper section placement

**Files:**
- Modify: `pdf_export.html` (cost labels, `#paper-section` position)

**Interfaces:**
- Consumes: the `costs` array and `#paper-section` block as they exist today; `data.results` keys unchanged.
- Produces: renamed PDF cost labels; `#paper-section` above the "Cost Breakdown" heading.

- [ ] **Step 1: Rename cost labels**

In `pdf_export.html`, in the `costs` array (lines 432-438), change labels exactly:

```js
costs.push({ label: 'Packaging Supplier SQM / Carton', value: data.results.supplierSqm });
costs.push({ label: 'Packaging Supplier Price / Carton', value: data.results.supplierCostPerCarton });
costs.push({ label: 'Packaging Supplier Total', value: data.results.supplierTotalCost });
costs.push({ label: 'Primark Carton SQM / Carton', value: data.results.primarkSqm });
costs.push({ label: 'Primark Carton Price / Carton', value: data.results.primarkCostPerCarton });
costs.push({ label: 'Primark Carton Total', value: data.results.primarkTotalPrice });
costs.push({ label: 'Margin (Primark - Supplier)', value: data.results.margin, highlight: true });
```

- [ ] **Step 2: Move paper section above Cost Breakdown**

Cut the `#paper-section` block (the `<div id="paper-section" style="display: none;">...</div>` containing the `Paper Consumption (Per Carton)` heading and `#paper-table`) and paste it directly above the `<h2>Cost Breakdown</h2>` line. Resulting section order in the PDF content div:

1. Supplier & Factory Information
2. Specifications
3. Outside Dimension (mm) - FEFCO 0201
4. Paper Consumption (Per Carton)
5. Cost Breakdown

Do not change any content, IDs, or styles inside the moved block; the `generatePDF`/`window.onload` logic is untouched.

- [ ] **Step 3: Verify**

Run: `Select-String -Path pdf_export.html -Pattern "Supplier Cost|Primark Cost|Supplier SQM|Primark SQM|Supplier Total|Primark Total"` — expected: only `Packaging Supplier ...` / `Primark Carton ...` matches remain (no bare "Supplier Cost", "Primark Cost", "Primark Total", or "Supplier Total" labels).
Run: `Select-String -Path pdf_export.html -Pattern "paper-section|Cost Breakdown"` — expected: `paper-section` appears in source before `Cost Breakdown`.
Then open `index.html`, calculate (Epyllion, any factory, preset 495 x 285 x 375, qty 1), click Export PDF: the generated quote shows Paper Consumption above Cost Breakdown and the six renamed labels.

- [ ] **Step 4: Commit**

```bash
git add pdf_export.html
git commit -m "feat: rename PDF cost labels and move paper section above cost breakdown"
```

---

### Task 5: Changelog and README update

**Files:**
- Modify: `VERSION_HISTORY.md`, `README.md`

**Interfaces:**
- Consumes: the rename map and behavior from Tasks 1-4.
- Produces: v2.3.0 changelog entry; README wording consistent with new labels.

- [ ] **Step 1: Add v2.3.0 changelog entry**

In `VERSION_HISTORY.md`, insert above `## v2.2.0`:

```markdown
## v2.3.0 (Uniform Factory Pricing & Label Clarity)
*   **Uniform Factory Pricing**: All garment-factory rates now equal the Primark SQM rate minus 5% (`$0.77` x 0.95 = `$0.7315`), defined once as `PRIMARK_SQM_RATE` / `FACTORY_SQM_RATE` constants in `js/data.js`. Every factory of a supplier prices identically, keeping the supplier side 5% below the Primark benchmark.
*   **Clearer Result Labels**: Renamed "Supplier Cost" to "Packaging Supplier Price" and "Primark Price" to "Primark Carton Price" across the calculator and the PDF quotation.
*   **Paper Consumption Placement**: Moved the Paper Consumption card above the price panels on the calculator and above the Cost Breakdown section in the PDF quotation.
```

- [ ] **Step 2: Update README wording**

In `README.md`:
- Line 8 bullet: change "calculates both Supplier Cost and standard Primark Price" to "calculates both the Packaging Supplier Price and the standard Primark Carton Price".
- Line 18: change "Review the generated dashboard panels measuring Supplier Costs, Primark Price constraints" to "Review the generated dashboard panels measuring the Packaging Supplier Price, Primark Carton Price constraints".
- Line 19: change "**Paper Consumption View**: Analyze ..." to note it appears above the price panels: "**Paper Consumption View**: Review paper resource metrics (shown above the price panels) covering stitching lengths, divided sheet boards, and overall SQM carton footprints."

- [ ] **Step 3: Verify**

Run: `Select-String -Path README.md,VERSION_HISTORY.md -Pattern "Supplier Cost|Primark Price"` — expected: no matches. Re-read both files to confirm formatting matches the existing bullet style.

- [ ] **Step 4: Commit**

```bash
git add -f VERSION_HISTORY.md README.md
git commit -m "docs: add v2.3.0 changelog and update readme"
```

---

### Final verification (after all tasks)

- [ ] Open `tests/runner.html` — all QUnit tests green.
- [ ] Open `index.html` — select each of Epyllion / M&U / Uniglory and any factory: rate per SQM shows `$0.73`; Paper Consumption renders above the Packaging Supplier Price and Primark Carton Price cards; margin positive.
- [ ] Export a PDF for one calculation — labels renamed, Paper Consumption above Cost Breakdown.
- [ ] Confirm `primark-pricing-data-check/data.csv` is unchanged: `git status` shows no modification to it.