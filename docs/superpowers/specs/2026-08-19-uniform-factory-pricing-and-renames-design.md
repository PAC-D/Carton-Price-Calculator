# Uniform Factory Pricing, Label Renames, Paper Consumption Order - Design Specification

## Overview

Three related changes to the Carton Price Calculator:

1. All factory rates become the Primark SQM rate minus 5% (0.77 x 0.95 = 0.7315 USD/SQM), so every supplier-factory combination prices exactly 5% below the Primark benchmark.
2. Result labels are renamed for clarity: "Supplier Cost" becomes "Packaging Supplier Price" and "Primark Price" becomes "Primark Carton Price".
3. The Paper Consumption section is displayed above the price results, in both the calculator page and the PDF quotation.

## Scope

### Included

- Calculator only: uniform factory pricing in `js/data.js` and `js/calculator.js`
- Label renames in the calculator page (`index.html`) and PDF export (`pdf_export.html`)
- Paper Consumption card moved above the price result cards on the calculator page
- Paper Consumption section moved above the Cost Breakdown section in the PDF
- Test updates for the changed rate behavior

### Excluded

- `primark-pricing-data-check/data.csv` and its subpage remain unchanged
- No changes to supplier SQM formulas or the Primark SQM formula
- No changes to the Primark rate value itself (0.77)

## Uniform Factory Pricing

### Constants

Add to the top of `js/data.js`:

```text
PRIMARK_SQM_RATE = 0.77
FACTORY_SQM_RATE = PRIMARK_SQM_RATE * 0.95   // 0.7315
```

Every factory entry in `SUPPLIERS` gets `rate: FACTORY_SQM_RATE`, replacing the existing per-factory literal rates (0.65 - 0.96).

### Calculator

`js/calculator.js` `calculatePrice()` replaces the hardcoded `0.77` (line 23) with the `PRIMARK_SQM_RATE` constant from `js/data.js`, keeping a single source of truth for the rate. `js/data.js` loads before `js/calculator.js` in `index.html`.

### Behavior

- Displayed rate per SQM shows `$0.73` via `toFixed(2)` (unchanged formatting).
- Margin calculation still uses the unrounded values, so every factory now produces a margin of exactly -5% of the Primark total (supplier total = primark total x 0.95, margin = primark total - supplier total = 5% of primark total).

## Label Renames

### Calculator page (`index.html`)

| Before | After |
|---|---|
| Supplier Cost (result card heading) | Packaging Supplier Price |
| Primark Price (result card heading) | Primark Carton Price |

### PDF export (`pdf_export.html`)

| Before | After |
|---|---|
| Supplier SQM / Carton | Packaging Supplier SQM / Carton |
| Supplier Cost / Carton | Packaging Supplier Price / Carton |
| Supplier Total | Packaging Supplier Total |
| Primark SQM / Carton | Primark Carton SQM / Carton |
| Primark Cost / Carton | Primark Carton Price / Carton |
| Primark Total | Primark Carton Total |

`Margin (Primark - Supplier)` label remains unchanged.

## Paper Consumption Position

### Calculator page (`index.html`)

The `#paper-consumption-card` section moves above `#calc-results` in the DOM so paper consumption appears above the Packaging Supplier Price and Primark Carton Price cards. No visibility logic changes (`runCalculation()` in `js/app.js` still shows/hides it the same way).

### PDF export (`pdf_export.html`)

The `#paper-section` block moves above the "Cost Breakdown" heading and `#costs-container`. No rendering logic changes.

## Architecture

- `js/data.js`: new rate constants plus updated factory rates; remains the single source of truth for rates and presets.
- `js/calculator.js`: references `PRIMARK_SQM_RATE` instead of a literal.
- `index.html` and `pdf_export.html`: static label and section-order changes only.
- No changes to `js/app.js` logic beyond what the DOM moves require (none expected).

## Validation And Error Handling

No new validation. Existing guards (positive dimensions, quantity, selected supplier/factory) are unaffected. The margin styling (positive/negative) continues to apply; with uniform pricing margins are now always positive (5% of Primark total).

## Testing

- Update `tests/calculator.test.js`: factory rate fixtures now use 0.7315; verify `calculatePrice` uses `PRIMARK_SQM_RATE` and that margin equals primark total - supplier total with supplier total = primark total x 0.95.
- Browser check: rate displays `$0.73`, paper consumption appears above price cards, PDF shows renamed labels with Paper Consumption above Cost Breakdown.