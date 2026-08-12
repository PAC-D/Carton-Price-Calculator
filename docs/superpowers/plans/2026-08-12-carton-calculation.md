# Carton Calculation Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add live C-Flute carton calculations that compare selected supplier cost with Primark selling price and margin, including quotation/PDF detail.

**Architecture:** Keep calculation rules in pure, browser-global functions in `js/calculator.js`; it becomes independently testable with Node's built-in test runner. Add formula identifiers and size presets to `js/data.js`. `js/app.js` owns input state, live rendering, and quotation data; `index.html` and `css/style.css` provide the calculation form, result cards, and print layout.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Node.js built-in test runner, html2pdf.js

## Global Constraints

- C-Flute calculations only.
- Dimensions are millimeters; formulas return square meters.
- Epyllion uses the Union/Epyllion formula, M&U uses the M&U formula, and Uniglory uses the Uniglory formula.
- Every valid calculation also uses the Primark formula at a fixed `$0.77` per SQM.
- Supplier and Primark SQM values are calculated independently; margin is `primarkTotalPrice - supplierTotalCost`.
- Presets must include the eleven specified sizes plus Custom.
- Custom dimensions and quantity must be finite positive numbers; quantity must be a whole number.
- Use unrounded formula values for calculations; round only for display.
- PDF generation stays client-side and continues to use local `lib/html2pdf.bundle.min.js`.
- The app must remain a static GitHub Pages-compatible site with no build tooling or server logic.

---

## File Structure

- `js/data.js`: supplier records plus `formulaKey` and `CARTON_PRESETS`.
- `js/calculator.js`: pure dimension validation, SQM formulas, and total-cost calculation functions; exports to `globalThis` for browsers and `module.exports` for Node tests.
- `tests/calculator.test.js`: exact regression tests for formulas and totals.
- `index.html`: live calculation inputs, result elements, and complete PDF template fields.
- `js/app.js`: form events, valid-calculation state, live result rendering, and quotation rendering.
- `css/style.css`: calculation-form, result-card, margin, and PDF styles.

### Task 1: Calculation Engine And Regression Tests

**Files:**
- Modify: `js/data.js`
- Modify: `js/calculator.js`
- Create: `tests/calculator.test.js`

**Interfaces:**
- Consumes: dimensions object `{ length: number, width: number, height: number }`, `supplierKey: 'epyllion' | 'mu' | 'uniglory'`, `rate: number`, and `quantity: number`.
- Produces: `CARTON_PRESETS`, `FORMULA_KEYS`, `isValidDimensions(dimensions)`, `isValidQuantity(quantity)`, `calculateSupplierSqm(supplierKey, dimensions)`, `calculatePrimarkSqm(dimensions)`, and `calculateCartonCosts({ supplierKey, rate, quantity, dimensions })`.

- [ ] **Step 1: Add failing calculation tests**

Create `tests/calculator.test.js`:

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateSupplierSqm,
  calculatePrimarkSqm,
  calculateCartonCosts,
  isValidDimensions,
  isValidQuantity
} = require('../js/calculator.js');

const dimensions = { length: 495, width: 285, height: 375 };
const EPSILON = 1e-10;

function assertClose(actual, expected) {
  assert.ok(Math.abs(actual - expected) < EPSILON, `Expected ${expected}, received ${actual}`);
}

test('calculates supplier C-Flute SQM with each supplier formula', () => {
  assertClose(calculateSupplierSqm('epyllion', dimensions), 1.176);
  assertClose(calculateSupplierSqm('mu', dimensions), 1.322275);
  assertClose(calculateSupplierSqm('uniglory', dimensions), 1.264025);
});

test('calculates Primark C-Flute SQM', () => {
  assertClose(calculatePrimarkSqm(dimensions), 1.147608);
});

test('calculates per-carton costs, totals, and margin without rounding inputs', () => {
  const result = calculateCartonCosts({
    supplierKey: 'epyllion',
    rate: 0.70,
    quantity: 100,
    dimensions
  });

  assertClose(result.supplierSqm, 1.176);
  assertClose(result.supplierCostPerCarton, 0.8232);
  assertClose(result.supplierTotalCost, 82.32);
  assertClose(result.primarkSqm, 1.147608);
  assertClose(result.primarkCostPerCarton, 0.88365816);
  assertClose(result.primarkTotalPrice, 88.365816);
  assertClose(result.margin, 6.045816);
});

test('rejects invalid dimensions, quantities, and supplier keys', () => {
  assert.equal(isValidDimensions({ length: 0, width: 285, height: 375 }), false);
  assert.equal(isValidDimensions({ length: 495, width: Number.NaN, height: 375 }), false);
  assert.equal(isValidQuantity(0), false);
  assert.equal(isValidQuantity(1.5), false);
  assert.equal(isValidQuantity(25), true);
  assert.equal(calculateSupplierSqm('unknown', dimensions), null);
  assert.equal(calculateCartonCosts({ supplierKey: 'mu', rate: 0.75, quantity: 1.5, dimensions }), null);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/calculator.test.js`

Expected: failure because `js/calculator.js` does not export the requested functions.

- [ ] **Step 3: Extend supplier data and add carton presets**

In `js/data.js`, add `formulaKey` to each supplier object:

```javascript
epyllion: {
  name: "Epyllion",
  formulaKey: "unionEpyllion",
  factories: [
```

```javascript
mu: {
  name: "M&U",
  formulaKey: "mu",
  factories: [
```

```javascript
uniglory: {
  name: "Uniglory",
  formulaKey: "uniglory",
  factories: [
```

After the `SUPPLIERS` declaration, add this exact preset data:

```javascript
const CARTON_PRESETS = [
  { label: "495 x 285 x 375 mm", length: 495, width: 285, height: 375 },
  { label: "480 x 360 x 150 mm", length: 480, width: 360, height: 150 },
  { label: "380 x 340 x 150 mm", length: 380, width: 340, height: 150 },
  { label: "480 x 320 x 280 mm", length: 480, width: 320, height: 280 },
  { label: "550 x 340 x 260 mm", length: 550, width: 340, height: 260 },
  { label: "600 x 400 x 150 mm", length: 600, width: 400, height: 150 },
  { label: "770 x 430 x 240 mm", length: 770, width: 430, height: 240 },
  { label: "630 x 320 x 350 mm", length: 630, width: 320, height: 350 },
  { label: "540 x 300 x 260 mm", length: 540, width: 300, height: 260 },
  { label: "500 x 380 x 290 mm", length: 500, width: 380, height: 290 },
  { label: "800 x 600 x 500 mm", length: 800, width: 600, height: 500 }
];
```

- [ ] **Step 4: Replace `js/calculator.js` with the pure calculation engine**

```javascript
const FORMULA_KEYS = {
  epyllion: 'unionEpyllion',
  mu: 'mu',
  uniglory: 'uniglory'
};

const PRIMARK_RATE = 0.77;

function isFinitePositiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

function isValidDimensions(dimensions) {
  return Boolean(dimensions) &&
    isFinitePositiveNumber(dimensions.length) &&
    isFinitePositiveNumber(dimensions.width) &&
    isFinitePositiveNumber(dimensions.height);
}

function isValidQuantity(quantity) {
  return Number.isInteger(quantity) && quantity > 0;
}

function calculateSupplierSqm(supplierKey, dimensions) {
  if (!isValidDimensions(dimensions)) return null;

  const formulaKey = FORMULA_KEYS[supplierKey];
  if (!formulaKey) return null;

  const { length, width, height } = dimensions;

  if (formulaKey === 'unionEpyllion') {
    return ((length + width + 60) * (width + height + 40) * 2) / 1000000;
  }

  if (formulaKey === 'mu') {
    return (length + width * 2 + 100) * (width + height * 2 + 100) / 1000000;
  }

  return (length + width * 2 + 100) * (width + height * 2 + 50) / 1000000;
}

function calculatePrimarkSqm(dimensions) {
  if (!isValidDimensions(dimensions)) return null;

  const { length, width, height } = dimensions;
  return ((length * 2 + width * 2 + 50) * (width + height) / 1000000) * 1.08;
}

function calculateCartonCosts({ supplierKey, rate, quantity, dimensions }) {
  if (!isFinitePositiveNumber(rate) || !isValidQuantity(quantity)) return null;

  const supplierSqm = calculateSupplierSqm(supplierKey, dimensions);
  const primarkSqm = calculatePrimarkSqm(dimensions);
  if (supplierSqm === null || primarkSqm === null) return null;

  const supplierCostPerCarton = supplierSqm * rate;
  const supplierTotalCost = supplierCostPerCarton * quantity;
  const primarkCostPerCarton = primarkSqm * PRIMARK_RATE;
  const primarkTotalPrice = primarkCostPerCarton * quantity;

  return {
    supplierSqm,
    supplierCostPerCarton,
    supplierTotalCost,
    primarkSqm,
    primarkCostPerCarton,
    primarkTotalPrice,
    margin: primarkTotalPrice - supplierTotalCost
  };
}

const calculatorApi = {
  FORMULA_KEYS,
  PRIMARK_RATE,
  isValidDimensions,
  isValidQuantity,
  calculateSupplierSqm,
  calculatePrimarkSqm,
  calculateCartonCosts
};

if (typeof globalThis !== 'undefined') {
  Object.assign(globalThis, calculatorApi);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = calculatorApi;
}
```

- [ ] **Step 5: Run the focused test file to verify it passes**

Run: `node --test tests/calculator.test.js`

Expected: 4 passing tests and no failures.

- [ ] **Step 6: Commit the engine and tests**

```powershell
git add js/data.js js/calculator.js tests/calculator.test.js
git commit -m "feat: add supplier and Primark calculation engine"
```

### Task 2: Calculation Form And Live Results UI

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

**Interfaces:**
- Consumes: `CARTON_PRESETS` (rendered by `js/app.js`), input element IDs `#carton-preset`, `#carton-quantity`, `#carton-length`, `#carton-width`, `#carton-height`.
- Produces: result element IDs `#calculation-status`, `#supplier-sqm`, `#supplier-cost-per-carton`, `#supplier-total-cost`, `#primark-sqm`, `#primark-cost-per-carton`, `#primark-total-price`, and `#margin-value`.

- [ ] **Step 1: Replace the calculator placeholder in `index.html`**

Replace the existing `<div class="calculator-placeholder">...</div>` inside `#rate-section` with:

```html
<div class="calculation-card">
  <div class="calculation-heading">
    <div>
      <h3>C-Flute Calculation</h3>
      <p id="formula-name" class="formula-name"></p>
    </div>
    <span class="flute-badge">C-Flute</span>
  </div>

  <div class="calculation-inputs">
    <label class="field-label" for="carton-preset">Carton Size</label>
    <select id="carton-preset" class="form-control">
      <option value="">Select carton size</option>
      <option value="custom">Custom dimensions</option>
    </select>

    <div id="custom-dimensions" class="custom-dimensions" hidden>
      <label class="field-label" for="carton-length">Length (mm)</label>
      <input id="carton-length" class="form-control" type="number" min="0.01" step="0.01" inputmode="decimal">
      <label class="field-label" for="carton-width">Width (mm)</label>
      <input id="carton-width" class="form-control" type="number" min="0.01" step="0.01" inputmode="decimal">
      <label class="field-label" for="carton-height">Height (mm)</label>
      <input id="carton-height" class="form-control" type="number" min="0.01" step="0.01" inputmode="decimal">
    </div>

    <label class="field-label" for="carton-quantity">Carton Quantity</label>
    <input id="carton-quantity" class="form-control" type="number" min="1" step="1" inputmode="numeric" placeholder="Enter quantity">
  </div>

  <p id="calculation-status" class="calculation-status">Choose a carton size and enter a quantity to calculate.</p>

  <div id="calculation-results" class="calculation-results" hidden>
    <div class="result-column supplier-result">
      <div class="result-heading">Supplier Cost</div>
      <div class="result-row"><span>SQM / carton</span><strong id="supplier-sqm"></strong></div>
      <div class="result-row"><span>Rate / SQM</span><strong id="supplier-rate"></strong></div>
      <div class="result-row"><span>Cost / carton</span><strong id="supplier-cost-per-carton"></strong></div>
      <div class="result-total"><span>Total cost</span><strong id="supplier-total-cost"></strong></div>
    </div>
    <div class="result-column primark-result">
      <div class="result-heading">Primark Price</div>
      <div class="result-row"><span>SQM / carton</span><strong id="primark-sqm"></strong></div>
      <div class="result-row"><span>Rate / SQM</span><strong>$0.77</strong></div>
      <div class="result-row"><span>Price / carton</span><strong id="primark-cost-per-carton"></strong></div>
      <div class="result-total"><span>Total price</span><strong id="primark-total-price"></strong></div>
    </div>
  </div>

  <div id="margin-card" class="margin-card" hidden>
    <span>Margin</span>
    <strong id="margin-value"></strong>
  </div>
</div>
```

- [ ] **Step 2: Add focused form and results CSS**

Append the following rules to `css/style.css`:

```css
.calculation-card {
  border: 1px solid #dbe4ef;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0 16px;
}

.calculation-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.calculation-heading h3,
.result-heading {
  color: #1e3a5f;
  font-size: 16px;
}

.formula-name,
.calculation-status {
  color: #64748b;
  font-size: 13px;
}

.flute-badge {
  background: #e0efff;
  border-radius: 999px;
  color: #1e3a5f;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
}

.calculation-inputs,
.custom-dimensions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
}

.custom-dimensions {
  grid-column: 1 / -1;
  margin: 4px 0;
}

.field-label {
  align-self: center;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
}

.form-control {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font: inherit;
  padding: 9px 12px;
}

.form-control:focus {
  border-color: #2c5282;
  outline: 2px solid #bfdbfe;
}

.calculation-status {
  margin-top: 16px;
}

.calculation-results {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.result-column {
  border-radius: 6px;
  padding: 16px;
}

.supplier-result {
  background: #f8fafc;
}

.primark-result {
  background: #ecfdf5;
}

.result-heading {
  font-weight: 700;
  margin-bottom: 10px;
}

.result-row,
.result-total,
.margin-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.result-row {
  color: #475569;
  font-size: 13px;
  margin-top: 7px;
}

.result-total {
  border-top: 1px solid #cbd5e1;
  color: #1e3a5f;
  font-weight: 700;
  margin-top: 12px;
  padding-top: 12px;
}

.margin-card {
  background: #eff6ff;
  border-radius: 6px;
  color: #1e3a5f;
  font-size: 18px;
  font-weight: 700;
  margin-top: 16px;
  padding: 14px 16px;
}

.margin-card.negative {
  background: #fef2f2;
  color: #b91c1c;
}

@media (max-width: 640px) {
  .calculation-inputs,
  .custom-dimensions,
  .calculation-results {
    grid-template-columns: 1fr;
  }

  .calculation-heading {
    align-items: flex-start;
  }
}
```

- [ ] **Step 3: Verify the layout manually**

Open `index.html` in a browser and select a supplier and factory. Verify the calculation card appears below Rate Details; its form controls are visible; results are initially hidden; and at a viewport width of 400px each input and result column stacks vertically.

- [ ] **Step 4: Commit the interface work**

```powershell
git add index.html css/style.css
git commit -m "feat: add carton calculation form and results layout"
```

### Task 3: Live Calculation State And Quotation Data

**Files:**
- Modify: `js/app.js`

**Interfaces:**
- Consumes: `SUPPLIERS`, `CARTON_PRESETS`, `PRIMARK_RATE`, `calculateCartonCosts`, `isValidDimensions`, and `isValidQuantity`.
- Produces: current valid calculation state for quotation rendering; populated live results; a disabled quote button until all inputs are valid.

- [ ] **Step 1: Extend the DOM references after existing `downloadPdfBtn` declaration**

```javascript
  const cartonPreset = document.getElementById('carton-preset');
  const cartonQuantity = document.getElementById('carton-quantity');
  const customDimensions = document.getElementById('custom-dimensions');
  const cartonLength = document.getElementById('carton-length');
  const cartonWidth = document.getElementById('carton-width');
  const cartonHeight = document.getElementById('carton-height');
  const formulaName = document.getElementById('formula-name');
  const calculationStatus = document.getElementById('calculation-status');
  const calculationResults = document.getElementById('calculation-results');
  const marginCard = document.getElementById('margin-card');
  const supplierSqm = document.getElementById('supplier-sqm');
  const supplierRate = document.getElementById('supplier-rate');
  const supplierCostPerCarton = document.getElementById('supplier-cost-per-carton');
  const supplierTotalCost = document.getElementById('supplier-total-cost');
  const primarkSqm = document.getElementById('primark-sqm');
  const primarkCostPerCarton = document.getElementById('primark-cost-per-carton');
  const primarkTotalPrice = document.getElementById('primark-total-price');
  const marginValue = document.getElementById('margin-value');
  let currentCalculation = null;
```

- [ ] **Step 2: Add these helper functions before the supplier tab click listener**

```javascript
  const FORMULA_NAMES = {
    epyllion: 'Union/Epyllion Formula',
    mu: 'M&U Formula',
    uniglory: 'Uniglory Formula'
  };

  function formatCurrency(value) {
    return '$' + value.toFixed(2);
  }

  function formatSqm(value) {
    return value.toFixed(4) + ' SQM';
  }

  function populateCartonPresets() {
    CARTON_PRESETS.forEach(function(preset, index) {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = preset.label;
      cartonPreset.insertBefore(option, cartonPreset.querySelector('[value="custom"]'));
    });
  }

  function getDimensions() {
    if (cartonPreset.value === 'custom') {
      return {
        length: Number(cartonLength.value),
        width: Number(cartonWidth.value),
        height: Number(cartonHeight.value)
      };
    }

    const preset = CARTON_PRESETS[Number(cartonPreset.value)];
    if (!preset) return null;
    return { length: preset.length, width: preset.width, height: preset.height };
  }

  function resetCalculation(message) {
    currentCalculation = null;
    calculationStatus.textContent = message;
    calculationResults.hidden = true;
    marginCard.hidden = true;
    generateQuoteBtn.disabled = true;
  }

  function updateCalculation() {
    if (!currentSupplier || !currentFactory) {
      resetCalculation('Select a supplier and factory to calculate.');
      return;
    }

    const dimensions = getDimensions();
    const quantity = Number(cartonQuantity.value);
    const supplier = SUPPLIERS[currentSupplier];
    const factory = supplier.factories.find(function(factoryItem) {
      return factoryItem.name === currentFactory;
    });

    if (!isValidDimensions(dimensions)) {
      resetCalculation('Choose a carton size or enter positive custom dimensions.');
      return;
    }

    if (!isValidQuantity(quantity)) {
      resetCalculation('Enter a whole carton quantity greater than zero.');
      return;
    }

    const costs = calculateCartonCosts({
      supplierKey: currentSupplier,
      rate: factory.rate,
      quantity,
      dimensions
    });

    if (!costs) {
      resetCalculation('The calculation could not be completed. Check the entered values.');
      return;
    }

    currentCalculation = { dimensions, quantity, factory, supplier, costs };
    calculationStatus.textContent = dimensions.length + ' x ' + dimensions.width + ' x ' + dimensions.height + ' mm, ' + quantity + ' carton' + (quantity === 1 ? '' : 's');
    supplierSqm.textContent = formatSqm(costs.supplierSqm);
    supplierRate.textContent = formatCurrency(factory.rate);
    supplierCostPerCarton.textContent = formatCurrency(costs.supplierCostPerCarton);
    supplierTotalCost.textContent = formatCurrency(costs.supplierTotalCost);
    primarkSqm.textContent = formatSqm(costs.primarkSqm);
    primarkCostPerCarton.textContent = formatCurrency(costs.primarkCostPerCarton);
    primarkTotalPrice.textContent = formatCurrency(costs.primarkTotalPrice);
    marginValue.textContent = formatCurrency(costs.margin);
    marginCard.classList.toggle('negative', costs.margin < 0);
    calculationResults.hidden = false;
    marginCard.hidden = false;
    generateQuoteBtn.disabled = false;
  }

  populateCartonPresets();

  cartonPreset.addEventListener('change', function() {
    const isCustom = cartonPreset.value === 'custom';
    customDimensions.hidden = !isCustom;
    updateCalculation();
  });

  [cartonQuantity, cartonLength, cartonWidth, cartonHeight].forEach(function(input) {
    input.addEventListener('input', updateCalculation);
  });
```

- [ ] **Step 3: Integrate calculation state into selection changes**

In `selectSupplier`, replace `generateQuoteBtn.disabled = true;` with:

```javascript
    resetCalculation('Choose a carton size and enter a quantity to calculate.');
```

At the end of `selectFactory`, replace `generateQuoteBtn.disabled = false;` with:

```javascript
    formulaName.textContent = FORMULA_NAMES[currentSupplier];
    updateCalculation();
```

- [ ] **Step 4: Replace the quotation button listener with data from `currentCalculation`**

Replace the body of the existing `generateQuoteBtn` click handler with:

```javascript
    if (!currentCalculation) return;

    var now = new Date();
    var dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    var timestampStr = now.toLocaleString('en-US');
    var details = currentCalculation;

    populateQuotationTemplate(details, dateStr, timestampStr);
    renderQuotationPreview(details, dateStr, timestampStr);
    quotationSection.style.display = 'block';
    quotationSection.scrollIntoView({ behavior: 'smooth' });
```

Add these two functions before the download-PDF listener:

```javascript
  function populateQuotationTemplate(details, dateStr, timestampStr) {
    const { supplier, factory, dimensions, quantity, costs } = details;
    document.getElementById('pdf-date').textContent = dateStr;
    document.getElementById('pdf-supplier').textContent = supplier.name;
    document.getElementById('pdf-factory').textContent = factory.name;
    document.getElementById('pdf-rate').textContent = formatCurrency(factory.rate) + ' per SQM';
    document.getElementById('pdf-formula').textContent = FORMULA_NAMES[currentSupplier] + ' (C-Flute)';
    document.getElementById('pdf-dimensions').textContent = dimensions.length + ' x ' + dimensions.width + ' x ' + dimensions.height + ' mm';
    document.getElementById('pdf-quantity').textContent = String(quantity);
    document.getElementById('pdf-supplier-sqm').textContent = formatSqm(costs.supplierSqm);
    document.getElementById('pdf-supplier-unit-cost').textContent = formatCurrency(costs.supplierCostPerCarton);
    document.getElementById('pdf-supplier-total').textContent = formatCurrency(costs.supplierTotalCost);
    document.getElementById('pdf-primark-sqm').textContent = formatSqm(costs.primarkSqm);
    document.getElementById('pdf-primark-unit-price').textContent = formatCurrency(costs.primarkCostPerCarton);
    document.getElementById('pdf-primark-total').textContent = formatCurrency(costs.primarkTotalPrice);
    document.getElementById('pdf-margin').textContent = formatCurrency(costs.margin);
    document.getElementById('pdf-timestamp').textContent = timestampStr;
  }

  function renderQuotationPreview(details, dateStr, timestampStr) {
    const { supplier, factory, dimensions, quantity, costs } = details;
    quotationPreview.innerHTML =
      '<div class="quotation-title"><h3>Packaging Price Quotation</h3><p>' + dateStr + '</p></div>' +
      '<dl class="quotation-details">' +
        '<div><dt>Packaging Supplier</dt><dd>' + escapeHtml(supplier.name) + '</dd></div>' +
        '<div><dt>Factory</dt><dd>' + escapeHtml(factory.name) + '</dd></div>' +
        '<div><dt>Formula</dt><dd>' + FORMULA_NAMES[currentSupplier] + ' (C-Flute)</dd></div>' +
        '<div><dt>Dimensions</dt><dd>' + dimensions.length + ' x ' + dimensions.width + ' x ' + dimensions.height + ' mm</dd></div>' +
        '<div><dt>Quantity</dt><dd>' + quantity + '</dd></div>' +
      '</dl>' +
      '<div class="quotation-columns">' +
        '<section><h4>Supplier Cost</h4><p>SQM/carton: <strong>' + formatSqm(costs.supplierSqm) + '</strong></p><p>Rate: <strong>' + formatCurrency(factory.rate) + '</strong></p><p>Cost/carton: <strong>' + formatCurrency(costs.supplierCostPerCarton) + '</strong></p><p>Total cost: <strong>' + formatCurrency(costs.supplierTotalCost) + '</strong></p></section>' +
        '<section><h4>Primark Price</h4><p>SQM/carton: <strong>' + formatSqm(costs.primarkSqm) + '</strong></p><p>Rate: <strong>$0.77</strong></p><p>Price/carton: <strong>' + formatCurrency(costs.primarkCostPerCarton) + '</strong></p><p>Total price: <strong>' + formatCurrency(costs.primarkTotalPrice) + '</strong></p></section>' +
      '</div>' +
      '<p class="quotation-margin">Margin: <strong>' + formatCurrency(costs.margin) + '</strong></p>' +
      '<p class="quotation-generated">Generated: ' + timestampStr + '</p>';
  }
```

- [ ] **Step 5: Run the calculation tests and verify the browser flow**

Run: `node --test tests/calculator.test.js`

Then in a browser verify:
1. Select Epyllion, Fakir Knitwears Ltd., `495 x 285 x 375 mm`, and quantity `100`.
2. Confirm supplier SQM is `1.1760 SQM`, supplier total is `$82.32`, Primark SQM is `1.1476 SQM`, Primark total is `$88.37`, and margin is `$6.05`.
3. Switch to M&U and confirm the formula label and supplier figures change while Primark figures remain based on its own formula.
4. Select Custom and confirm incomplete or zero dimensions keep results hidden and quotation disabled.
5. Enter `495`, `285`, `375`, and `100` custom values to restore the same Epyllion figures.

- [ ] **Step 6: Commit the live calculation behavior**

```powershell
git add js/app.js
git commit -m "feat: calculate live supplier and Primark costs"
```

### Task 4: Quotation And PDF Calculation Details

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

**Interfaces:**
- Consumes: IDs filled by `populateQuotationTemplate` from Task 3.
- Produces: an accurate on-screen quotation and PDF with dimension, quantity, cost, price, and margin details.

- [ ] **Step 1: Replace the PDF table and placeholder in `#pdf-content`**

In `index.html`, replace the existing `<table class="pdf-table">...</table>` and following `.pdf-placeholder` div with:

```html
<table class="pdf-table">
  <tr><td class="pdf-label">Packaging Supplier:</td><td class="pdf-value" id="pdf-supplier"></td></tr>
  <tr><td class="pdf-label">Factory:</td><td class="pdf-value" id="pdf-factory"></td></tr>
  <tr><td class="pdf-label">Formula:</td><td class="pdf-value" id="pdf-formula"></td></tr>
  <tr><td class="pdf-label">Dimensions:</td><td class="pdf-value" id="pdf-dimensions"></td></tr>
  <tr><td class="pdf-label">Quantity:</td><td class="pdf-value" id="pdf-quantity"></td></tr>
</table>

<div class="pdf-cost-section">
  <h2>Supplier Cost</h2>
  <table class="pdf-table">
    <tr><td class="pdf-label">SQM per carton:</td><td class="pdf-value" id="pdf-supplier-sqm"></td></tr>
    <tr><td class="pdf-label">Rate per SQM:</td><td class="pdf-value" id="pdf-rate"></td></tr>
    <tr><td class="pdf-label">Cost per carton:</td><td class="pdf-value" id="pdf-supplier-unit-cost"></td></tr>
    <tr><td class="pdf-label">Total cost:</td><td class="pdf-value" id="pdf-supplier-total"></td></tr>
  </table>
</div>

<div class="pdf-cost-section">
  <h2>Primark Price</h2>
  <table class="pdf-table">
    <tr><td class="pdf-label">SQM per carton:</td><td class="pdf-value" id="pdf-primark-sqm"></td></tr>
    <tr><td class="pdf-label">Rate per SQM:</td><td class="pdf-value">$0.77</td></tr>
    <tr><td class="pdf-label">Price per carton:</td><td class="pdf-value" id="pdf-primark-unit-price"></td></tr>
    <tr><td class="pdf-label">Total price:</td><td class="pdf-value" id="pdf-primark-total"></td></tr>
  </table>
</div>

<div class="pdf-margin">
  <span>Margin</span>
  <strong id="pdf-margin"></strong>
</div>
```

- [ ] **Step 2: Add quotation-preview and PDF-detail styles**

Append to `css/style.css`:

```css
.quotation-title {
  border-bottom: 2px solid #2c5282;
  margin-bottom: 16px;
  padding-bottom: 12px;
  text-align: center;
}

.quotation-title h3 {
  color: #1e3a5f;
  font-size: 20px;
}

.quotation-title p,
.quotation-generated {
  color: #64748b;
  font-size: 13px;
}

.quotation-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 20px;
  margin-bottom: 16px;
}

.quotation-details div {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 6px;
}

.quotation-details dt {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.quotation-details dd {
  color: #1e3a5f;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.quotation-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.quotation-columns section {
  background: #f8fafc;
  border-radius: 6px;
  padding: 14px;
}

.quotation-columns section:last-child {
  background: #ecfdf5;
}

.quotation-columns h4 {
  color: #1e3a5f;
  margin-bottom: 8px;
}

.quotation-columns p {
  color: #475569;
  display: flex;
  font-size: 13px;
  justify-content: space-between;
  margin: 5px 0;
}

.quotation-margin,
.pdf-margin {
  background: #eff6ff;
  border-radius: 6px;
  color: #1e3a5f;
  display: flex;
  font-size: 16px;
  font-weight: 700;
  justify-content: space-between;
  margin: 16px 0;
  padding: 12px 14px;
}

.quotation-generated {
  border-top: 1px solid #e2e8f0;
  margin-top: 16px;
  padding-top: 10px;
  text-align: center;
}

.pdf-cost-section {
  margin-top: 20px;
}

.pdf-cost-section h2 {
  color: #1e3a5f;
  font-size: 16px;
  margin-bottom: 6px;
}

@media (max-width: 640px) {
  .quotation-details,
  .quotation-columns {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Run verification**

Run: `node --test tests/calculator.test.js`

In the browser, generate an Epyllion/Fakir quotation using the first preset and quantity `100`. Confirm preview includes formula, dimensions, quantity, all supplier and Primark values, and margin. Download the PDF and confirm it has the same detail and no future-breakdown placeholder.

- [ ] **Step 4: Commit quotation and PDF details**

```powershell
git add index.html css/style.css
git commit -m "feat: add calculation detail to quotations and PDFs"
```

### Task 5: End-To-End Regression Check

**Files:**
- Modify: none unless a defect is found during verification.

**Interfaces:**
- Consumes: final static app and calculation unit tests.
- Produces: verification evidence for every supplier formula, preset/custom input, quantity totals, quotation preview, and PDF download.

- [ ] **Step 1: Run all automated calculation tests**

Run: `node --test tests/calculator.test.js`

Expected: 4 passing tests, 0 failures.

- [ ] **Step 2: Verify all supplier mappings in the browser**

For `495 x 285 x 375 mm` and quantity `100`, select a factory under each supplier and confirm the formula label and supplier SQM:

```text
Epyllion: Union/Epyllion Formula, 1.1760 SQM
M&U: M&U Formula, 1.3223 SQM
Uniglory: Uniglory Formula, 1.2640 SQM
```

Confirm Primark remains `1.1476 SQM` at `$0.77` per SQM for all three selections.

- [ ] **Step 3: Verify input validation and responsive layout**

In the browser, select Custom dimensions. Confirm blank, `0`, and decimal quantity values hide results and disable quotation generation. Enter `495`, `285`, `375`, and `100` to restore valid results. At a 400px viewport width, confirm controls, result cards, and quotation columns stack without horizontal clipping.

- [ ] **Step 4: Verify quotation and PDF**

Generate a valid quotation. Confirm the preview and downloaded PDF include formula, dimensions, quantity, supplier cost values, Primark price values, and margin; confirm neither has the former future-breakdown placeholder.

- [ ] **Step 5: Commit only if verification exposes and fixes a defect**

If a defect was fixed during this task:

```powershell
git add index.html css/style.css js/app.js js/calculator.js js/data.js tests/calculator.test.js
git commit -m "fix: resolve calculation regression"
```

If no defect was found, do not create an empty commit.
