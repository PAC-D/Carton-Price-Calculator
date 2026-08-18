# Design: Supplier Full Names + Data-Check Page Polish

Date: 2026-08-19
Status: Approved by user (design presented and approved; Approach A chosen)

## Objective

1. Show full packaging-supplier names on BOTH pages: Epyllion -> "Epyllion Limited", M&U -> "M&U Packaging Ltd", Uniglory -> "Uniglory Paper & Packaging". UNION LABEL & ACCESSORIES LTD. is already the full name and does not change.
2. On the pricing data-check page ONLY: add a "Primark SQM Price: 0.77" row (on-screen table AND exported PDF), sort factories alphabetically with packaging-supplier grouping prioritized (table AND PDF), change the exported PDF title from red to dark blue, and add a generation date under the PDF title.

## Decisions (from user Q&A)

- **Approach A** for the data-check page: supplier full names go into `data.csv` column 1 (single source of truth). No display-mapping code.
- The Primark SQM Price row appears BOTH on-screen and in the exported PDF.
- Supplier-first alphabetical sorting applies to BOTH the on-screen table and the PDF export (the factory dropdown is already alphabetical; the PDF previously sorted inline with an equivalent rule).
- PDF title color: dark blue `(0, 32, 91)` (PACD brand, matches the navbar line). Generation date sits under the title.
- Calculator PDF (`pdf_export.html`) is OUT OF SCOPE: no title color or date changes there.

## Changes

### 1. Supplier full names — calculator page

- `index.html` (calculator):
  - Dropdown option labels (lines 69-71): `Epyllion` -> `Epyllion Limited`, `M&U` -> `M&U Packaging Ltd` (HTML-escaped `M&amp;U`), `Uniglory` -> `Uniglory Paper &amp; Packaging`. Option VALUES (keys) `epyllion`/`mu`/`uniglory` unchanged; `ps_union` option unchanged.
  - Welcome text (line 36): `Epyllion, M&amp;U, Uniglory, or UNION LABEL &amp; ACCESSORIES LTD.` -> `Epyllion Limited, M&amp;U Packaging Ltd, Uniglory Paper &amp; Packaging, or UNION LABEL &amp; ACCESSORIES LTD.`
- `js/data.js`: `name:` fields (lines 6, 42, 91) -> `"Epyllion Limited"`, `"M&U Packaging Ltd"`, `"Uniglory Paper & Packaging"`. Keys, factories, rates, formulaIds unchanged. This automatically updates the rate-display "Supplier:" value and the calculator PDF export (`supplierName`).
- `UNION LABEL & ACCESSORIES LTD.` (key `ps_union`) unchanged everywhere.

### 2. Supplier full names — data-check page

- `primark-pricing-data-check/data.csv`: column 1 values change per supplier group:
  - `Epyllion` -> `Epyllion Limited` (30 rows)
  - `M&U` -> `M&U Packaging Ltd` (43 rows)
  - `Uniglory` -> `Uniglory Paper & Packaging` (55 rows)
  - `UNION LABEL & ACCESSORIES LTD.` rows unchanged (19 rows)
  - Header row, row order, factory names, and prices unchanged.
- `primark-pricing-data-check/test/app.test.mjs`: update `SAMPLE` fixture and assertions to the full names (e.g. `getSuppliers` -> `['All', 'Epyllion Limited', 'M&U Packaging Ltd', 'Uniglory Paper & Packaging']`; `applyFilters` supplier filter uses `'M&U Packaging Ltd'`).
- `primark-pricing-data-check/data.backup-2026-08-19.csv`: NOT modified (point-in-time rollback snapshot).

### 3. Primark SQM Price row (data-check page)

- New constant in `primark-pricing-data-check/app.js`: `const PRIMARK_SQM_PRICE = 0.77;` — must stay in sync with `PRIMARK_SQM_RATE` in `js/data.js` (comment notes this).
- On-screen: table gains a footer row (tfoot) always visible even when filters match 0 rows: supplier column shows `Primark SQM Price`, price column shows `0.77` (via `formatPrice`), SL and Factory columns blank. Styled bold (CSS class in `styles.css`).
- PDF export: the autoTable body gains a final bold row (same content: blank SL, `Primark SQM Price`, blank factory, `0.77`). Always present regardless of filters.

### 4. Sorting (data-check page)

- New exported pure function in `primark-pricing-data-check/app.js`:
  `function sortRows(rows)` -> copy sorted by `supplier.localeCompare` then `factory.localeCompare`.
- On-screen `render()`: sort the filtered rows before building table rows; SL numbers follow the sorted order.
- PDF `exportPDF()`: replace the current inline sort with `sortRows`.
- Alphabetical supplier order with full names = Epyllion Limited, M&U Packaging Ltd, Uniglory Paper & Packaging, UNION LABEL & ACCESSORIES LTD. — identical to the CSV group order, so packaging-supplier priority is preserved naturally.

### 5. PDF title color + generation date (data-check page)

- Title `Carton Price for Factory`: `setTextColor(227, 24, 55)` -> `setTextColor(0, 32, 91)`.
- Under the title, add a gray line: `Generated on <date>` where date = `new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })` (e.g. `Generated on 19 August 2026`), font size ~9, color ~`(100, 116, 139)` (existing footer gray).
- AutoTable `startY` adjusted to make room for the date line.

## Edge Cases

- Filters match 0 rows on-screen: benchmark row still visible (tfoot).
- PDF export with 0 matching rows already alerts and aborts — benchmark row irrelevant there.
- `M&U Packaging Ltd` contains `&`: plain text in CSV/JS is fine. HTML display locations on the calculator page (dropdown, welcome text) must use `&amp;`. On the data-check page the supplier value flows through `innerHTML` template strings; a raw `&` not followed by a valid entity pattern renders literally, so the controlled `M&U Packaging Ltd` value displays correctly without escaping.

## Out of Scope

- Calculator PDF (`pdf_export.html`): no title color/date changes.
- All pricing rates, formulas, factory names, row order, headers.
- UNION's name (already full).
- The committed backup file.

## Testing / Verification

- `node --test primark-pricing-data-check/test/app.test.mjs` -> 10/10 with updated fixtures.
- QUnit (`tests/runner.html`): 14 tests, 181 assertions passed, ONLY the 2 pre-existing failures (CARTON_PRESETS window access; Primark SQM float 0.09720000000000001). No test asserts supplier names, so totals must be unchanged.
- CSV parse check: 147 rows, Epyllion Limited 30 / M&U Packaging Ltd 43 / Uniglory Paper & Packaging 55 / UNION LABEL & ACCESSORIES LTD. 19.
- Manual: open calculator, dropdown shows full names; open data-check page, table shows full names + sorted rows + benchmark row; export PDF and eyeball title color, date, benchmark row.