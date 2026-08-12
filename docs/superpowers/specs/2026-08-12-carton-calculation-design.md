# Carton Calculation Feature - Design Specification

## Overview

Extend the Carton Price Calculator with live C-Flute calculations. A user will select a packaging supplier and factory, choose a preset carton size or enter custom dimensions, enter quantity, and see supplier cost, Primark selling price, and margin.

Primark is the user's company and always appears as the comparison side of every calculation at a fixed rate of $0.77 per SQM. Supplier selection maps Epyllion to the Union/Epyllion formula, M&U to its formula, and Uniglory to its formula.

## Scope

### Included

- C-Flute calculations only
- Supplier-specific SQM formula selection based on the selected supplier
- Primark SQM calculation for every calculation
- Eleven carton-dimension presets plus custom L/W/H dimensions
- Quantity input and per-carton and order-total results
- Supplier cost, Primark price, and margin calculation
- Updated on-screen quotation preview and PDF export

### Excluded

- Other flute types
- Editable formulas or rates
- Multiple carton line items in one quotation

## Formula Definitions

All dimensions are entered in millimeters. Every formula returns square meters.

### Primark Formula

Used for every calculation.

```text
primarkSqm = ((2 * L + 2 * W + 50) * (W + H) / 1,000,000) * 1.08
```

### Supplier Formula Mapping

```text
Epyllion (Union/Epyllion) = ((L + W + 60) * (W + H + 40) * 2) / 1,000,000

M&U = ((L + 2 * W + 100) * (W + 2 * H + 100)) / 1,000,000

Uniglory = ((L + 2 * W + 100) * (W + 2 * H + 50)) / 1,000,000
```

## Inputs And Workflow

The existing workflow remains: select supplier, then select factory. The rate-details card then contains a live calculation card.

### Carton Dimensions

A carton-size dropdown provides these presets, labeled as `L x W x H mm`:

1. 495 x 285 x 375
2. 480 x 360 x 150
3. 380 x 340 x 150
4. 480 x 320 x 280
5. 550 x 340 x 260
6. 600 x 400 x 150
7. 770 x 430 x 240
8. 630 x 320 x 350
9. 540 x 300 x 260
10. 500 x 380 x 290
11. 800 x 600 x 500
12. Custom

Selecting a preset supplies its dimensions automatically. Selecting Custom shows required Length, Width, and Height fields, in millimeters.

### Quantity

Quantity is a required positive whole number of cartons. It is used to calculate order totals.

### Live Calculation

The results update when the selected dimensions, custom dimension fields, quantity, supplier, or factory changes. Before all required valid values are available, the card shows an instruction instead of totals and PDF export remains unavailable.

## Results

For valid inputs, show:

- Selected formula name and dimensions
- Quantity
- Supplier SQM per carton
- Selected factory rate per SQM
- Supplier cost per carton: `supplierSqm * supplierRate`
- Supplier total cost: `supplierCostPerCarton * quantity`
- Primark SQM per carton
- Primark rate per SQM: `$0.77`
- Primark price per carton: `primarkSqm * 0.77`
- Primark total price: `primarkPricePerCarton * quantity`
- Margin: `primarkTotalPrice - supplierTotalCost`

SQM values display to four decimal places. Currency values display in USD to two decimal places. A positive margin is styled as favorable and a negative margin is styled as unfavorable.

## Quotation And PDF

Generating a quotation is enabled only after a valid calculation. The existing preview and PDF must include:

- Date and generated timestamp
- Supplier and selected factory
- C-Flute designation and supplier formula name
- L, W, H dimensions in millimeters and carton quantity
- Supplier SQM, rate, per-carton cost, and total cost
- Primark SQM, `$0.77` rate, per-carton price, and total price
- Margin amount

The old future-cost-breakdown placeholder is removed because the calculation is now available.

## Architecture

`js/calculator.js` becomes the single source of truth for calculation behavior. It exposes separate pure functions for supplier SQM, Primark SQM, and final cost totals. `js/app.js` manages the inputs, live rendering, and quotation-template population. `js/pdf.js` continues to convert the populated PDF template to a downloadable PDF.

Carton-size presets live in `js/data.js` alongside supplier data. The supplier objects gain a formula identifier so the calculation mapping is explicit and extendable.

## Validation And Error Handling

- No calculation runs without a selected supplier and factory.
- Custom Length, Width, Height, and quantity must be finite positive numbers.
- Quantity must be a whole number.
- Invalid or incomplete inputs display concise inline guidance and prevent quotation/PDF generation.
- Formulas use unrounded values; rounding is only for display.

## Testing

Use focused automated unit tests for pure calculation functions, covering each supplier formula, the Primark formula, unit costs, totals, margin, and invalid inputs. Perform a browser-based end-to-end check for a preset, custom dimensions, supplier switching, live updates, quotation generation, and PDF download.
