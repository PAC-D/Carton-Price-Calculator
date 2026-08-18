# UNION LABEL & ACCESSORIES Supplier Addition - Design Specification

## Overview

Add a fourth packaging supplier, "UNION LABEL & ACCESSORIES LTD.", with 19 garment factories, to both the carton price calculator (`js/data.js` + `index.html`) and the pricing data check subpage (`primark-pricing-data-check/data.csv`). In the carton calculator the new factories price identically to all others (`FACTORY_SQM_RATE`); the data check shows each factory's actual listed per-SQM price.

## Scope

### Included

- `js/data.js`: new `ps_union` supplier entry with 19 factories at `rate: FACTORY_SQM_RATE`, `formulaId: "union"`
- `js/calculator.js`: `case 'union'` aliased to the Union/Epyllion formula via switch fall-through with `case 'epyllion'`
- `index.html`: packaging-supplier dropdown option for UNION LABEL & ACCESSORIES; welcome step-1 text updated
- `primark-pricing-data-check/data.csv`: 19 appended rows with the listed prices; the factory name `L,ESQUIRE LTD.` is written as a quoted CSV field
- `primark-pricing-data-check/app.js`: `parseCSV` upgraded to a quote-aware field splitter so quoted fields containing commas parse correctly (existing simple rows parse identically)
- Tests: `tests/data.test.js`, `tests/calculator.test.js`, `primark-pricing-data-check/test/app.test.mjs`
- Docs: `README.md` supplier list, `VERSION_HISTORY.md` v2.4.0 entry

### Excluded

- No changes to PDF exports (both are fully dynamic)
- No changes to the uniform rate constants or the rename work
- No changes to existing supplier data

## Supplier Data

### Calculator (`js/data.js`)

New entry in `SUPPLIERS` (after `uniglory`):

```text
key:       ps_union
name:      "UNION LABEL & ACCESSORIES LTD."
formulaId: "union"
factories: 19 entries, each { name: <verbatim name>, rate: FACTORY_SQM_RATE }
```

Factory names verbatim (including `AXIS KNIT WAER LTD.`, `L,ESQUIRE LTD.`, `MODEL DE CAPITAL.`):

1. WINTER DRESS LTD.
2. HASAN TANVIR FASHION WEAR LTD.
3. NORP KNIT IND.
4. SB STYLE COMPOSITE LTD.
5. MOUCHAK KNIT COMPOSITE LTD.
6. JIN HONG GARMENTS LTD.
7. SOUTHERN KNIT WEAR LTD.
8. GOLDEN REFIT LTD.
9. AXIS KNIT WAER LTD.
10. ECHOKNITS LTD.
11. TARGET DENIM & CASUAL WEAR LTD.
12. MODEL DE CAPITAL.
13. L,ESQUIRE LTD.
14. CHORKA TEXTILE LTD.
15. RIZVI FASHION LTD.
16. WELLDONE APPARELS LTD.
17. CROWN EXCLUSIVE LTD.
18. MG NICHE FLAIR LTD.
19. APS APPARELS LTD.

### Data check (`primark-pricing-data-check/data.csv`)

19 appended rows, supplier field `UNION LABEL & ACCESSORIES LTD.`, with the listed per-SQM prices:

| Factory | Price |
|---|---|
| WINTER DRESS LTD. | 0.68 |
| HASAN TANVIR FASHION WEAR LTD. | 0.68 |
| NORP KNIT IND. | 0.74 |
| SB STYLE COMPOSITE LTD. | 0.75 |
| MOUCHAK KNIT COMPOSITE LTD. | 0.68 |
| JIN HONG GARMENTS LTD. | 0.76 |
| SOUTHERN KNIT WEAR LTD. | 0.68 |
| GOLDEN REFIT LTD. | 0.68 |
| AXIS KNIT WAER LTD. | 0.74 |
| ECHOKNITS LTD. | 0.70 |
| TARGET DENIM & CASUAL WEAR LTD. | 0.70 |
| MODEL DE CAPITAL. | 0.68 |
| L,ESQUIRE LTD. | 0.68 |
| CHORKA TEXTILE LTD. | 0.76 |
| RIZVI FASHION LTD. | 0.68 |
| WELLDONE APPARELS LTD. | 0.75 |
| CROWN EXCLUSIVE LTD. | 0.68 |
| MG NICHE FLAIR LTD. | 0.68 |
| APS APPARELS LTD. | 0.68 |

The row for `L,ESQUIRE LTD.` is written with the factory field quoted:
`UNION LABEL & ACCESSORIES LTD.,"L,ESQUIRE LTD.",0.68`

## Formula Mapping

`js/calculator.js` `calcSupplierSQM` switch gains a fall-through alias:

```js
case 'union':
case 'epyllion': return ((l + w + 60) * (w + h + 40) * 2) / 1000000;
```

One formula implementation, two formulaIds. This is the "Union/Epyllion formula" already documented in the carton-calculation spec.

## CSV Parser Upgrade

`primark-pricing-data-check/app.js` `parseCSV` currently uses `lines[i].split(',')`, which breaks on quoted fields containing commas. Replace the field split with a minimal quote-aware splitter:

- Splits a line on commas, honoring double-quoted segments (`"..."`); a comma inside quotes does not split
- Removes surrounding quotes from the parsed field
- Existing unquoted rows parse identically (byte-for-byte same output for all current rows)

## UI Changes (`index.html`)

- `#packaging-supplier` dropdown gains: `<option value="ps_union">UNION LABEL &amp; ACCESSORIES LTD.</option>` (after Uniglory)
- Welcome step 1 text: "Epyllion, M&amp;U, or Uniglory" -> "Epyllion, M&amp;U, Uniglory, or UNION LABEL &amp; ACCESSORIES LTD."

## Architecture

- `js/data.js` remains the single source of truth for suppliers/rates in the calculator
- `js/calculator.js` maps `union` -> the shared Union/Epyllion formula implementation
- `data.csv` remains the single source of truth for the data-check page; its parser is upgraded to handle quoted fields
- No changes to `js/app.js`, `pdf_export.html`, or the data-check page's rendering/PDF logic

## Testing

- `tests/data.test.js`: assert `SUPPLIERS.ps_union.formulaId === 'union'` and `SUPPLIERS.ps_union.name === 'UNION LABEL & ACCESSORIES LTD.'`; the existing uniform-rate test iterates all suppliers automatically and covers the 19 new factories
- `tests/calculator.test.js`: `calcSupplierSQM('union', 10, 10, 10) === 0.0096` (same as epyllion)
- `primark-pricing-data-check/test/app.test.mjs`: `parseCSV` parses a quoted field containing a comma into the correct three columns; existing tests unchanged and passing
- Browser check: UNION LABEL & ACCESSORIES selectable in the calculator, factory list filters, rate displays `$0.73`; data-check page lists UNION LABEL & ACCESSORIES rows with the listed prices, including the `L,ESQUIRE LTD.` row