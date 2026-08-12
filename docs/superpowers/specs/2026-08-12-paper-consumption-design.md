# Paper Consumption Feature - Design Specification

## Overview

Add a separate live Paper Consumption card to the carton calculator. It calculates board dimensions, selected paper-roll width, and paper consumption per carton from the current L/W/H inputs and selected supplier.

This is an operational planning calculation. It does not replace or alter the existing supplier SQM, supplier cost, Primark price, margin, or their formulas.

## Scope

### Included

- Live paper-consumption calculation after a supplier, factory, and valid carton dimensions are selected
- Supplier-specific divide and roll-rounding rules
- Intermediate board and roll-width details
- Paper consumption per carton in SQM
- Paper-consumption table in the on-screen quotation and exported PDF

### Excluded

- Paper-consumption total for the entered quantity
- Paper price/cost calculations
- Changes to the existing supplier-cost or Primark-price calculations

## Formula Definitions

All measurements are in millimeters. Paper consumption is returned in square meters.

```text
boardLength = (L + W) * 2
stitching = 100
actualLength = boardLength + stitching

flutingSpace = 10
width = W + H + flutingSpace

divide = 2 for M&U; 1 for Epyllion and Uniglory

cuttingSpace = 40
boardWidth = (width * divide) + cuttingSpace

rollIncrement = 100 when divide is 2; 50 when divide is 1
paperRollWidth = ceil(boardWidth / rollIncrement) * rollIncrement

paperConsumptionSqm = (actualLength * paperRollWidth) / 1,000,000 / divide
```

`ceil` keeps exact roll-width multiples unchanged. Examples:

- M&U board width 2260 -> paper roll width 2300
- M&U board width 1380 -> paper roll width 1400
- Epyllion/Uniglory board width 540 -> paper roll width 550
- Epyllion/Uniglory board width 605 -> paper roll width 650
- Epyllion/Uniglory board width 600 -> paper roll width 600

## Supplier Rules

| Supplier | Divide | Paper Roll Increment |
| --- | ---: | ---: |
| Epyllion | 1 | 50 mm |
| M&U | 2 | 100 mm |
| Uniglory | 1 | 50 mm |

## User Interface

The existing calculator flow and cost-comparison cards remain unchanged. Directly below them, render an initially hidden `Paper Consumption` card whenever all standard calculation inputs are valid.

The card displays:

- Board Length
- Stitching (100 mm)
- Actual Length
- Fluting Space (10 mm)
- Width
- Divide
- Cutting Space (40 mm)
- Board Width
- Paper Roll Width
- Paper Consumption per carton in SQM

All dimensional values display as whole millimeters. Paper Consumption displays to four decimal places followed by `SQM`.

When supplier, factory, carton dimensions, or carton-size preset changes, recalculate the card immediately. Quantity changes do not alter the card because paper consumption is per carton only.

## Quotation And PDF

When a quotation is generated, insert a separate Paper Consumption table after the existing Supplier/Primark calculation table and before the margin. The table includes all on-screen values and uses the same units.

The quotation/PDF continues to show existing pricing and margin information unchanged.

## Architecture

`js/calculator.js` owns the pure `calculatePaperConsumption(supplierKey, l, w, h)` function. It contains the supplier rule mapping and all fixed constants. The function returns a structured result with each displayed intermediate value.

`js/app.js` invokes it from `runCalculation()` after the existing price calculation succeeds, renders the Paper Consumption card, and transfers its values into the PDF template. It stores the current paper result in local app state for quotation generation.

`index.html` contains the paper-consumption card and PDF table. `css/style.css` styles them consistently with the existing result cards and PDF tables.

## Validation And Error Handling

- No paper-consumption result is shown until a supplier, factory, L, W, and H are valid positive values.
- An unsupported supplier key returns no result and keeps the paper card hidden.
- Quantity is intentionally ignored by this feature.
- Calculations use unrounded values; values are rounded only for display.

## Testing

Add QUnit tests for:

- Epyllion/Uniglory divide 1 and 50 mm rounding
- M&U divide 2 and 100 mm rounding
- Exact-multiple behavior (e.g. 600 remains 600 with a 50 mm increment)
- All intermediate calculation outputs and final paper consumption
- Invalid supplier and invalid dimensions

Perform an end-to-end browser test for an Epyllion preset, an M&U preset, custom dimensions, live recalculation after supplier change, quotation preview, and PDF download.
