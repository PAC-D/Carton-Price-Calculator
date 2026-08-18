# Factory Name Updates - Design Specification

**Date:** 2026-08-19

## Background

The garment factory names currently stored in the carton price calculator (`js/data.js`, `SUPPLIERS[*].factories[*].name`) and the pricing data check (`primark-pricing-data-check/data.csv`, column 2) use informal abbreviations, all-caps variants, and inconsistent spellings (e.g. `AB APPARELS LTD`, `Fakir Knitwears Ltd.`, `AXIS KNIT WAER LTD.`). The user obtained the official factory names — including BGMEA-style factory ID numbers — from an external directory export and provided a 98-row mapping from the system names to the official names.

This spec defines the rename of every factory name in both files according to that mapping, with a small set of explicitly agreed exceptions.

## Goal

Every factory name in `js/data.js` and `data.csv` is replaced by its official name from the mapping, verbatim including the parenthetical ID (user-confirmed: keep IDs). No other data, logic, or UI changes.

## Mapping (98 rows)

Aliases are the names as they appear in the system today (multiple aliases = the same factory listed under different variants across suppliers/sources). Updated name is applied verbatim.

| Aliases in system | Updated name |
|---|---|
| AB APPARELS LTD | AB Apparels Ltd (24718) |
| AFIYA KNITWEAR LTD. | Afiya Knitwear Ltd PJT (20517) |
| Akh Eco Apparels Ltd | AKH Eco Apparels Ltd PJT (20979) |
| ALIM KNIT (BD) LTD. | Alim Knit Ltd (20331) |
| Ananta Casual Wear Ltd | Ananta Casual Wear Ltd (27725) |
| Ananta Huaxiang Ltd / Ananta Huxing | Ananta Huaxiang Ltd (20421) |
| APS APPARELS LTD. | APS Apparels Limited (26018) |
| Aspire Garments Ltd | Aspire Garments Ltd PJT (24040) |
| AST Knit / AST Knitwear Ltd. | AST Knitwear Ltd PJT (14482) |
| ATS Apparels | ATS Apparels Ltd (11121) |
| AXIS KNIT WAER LTD. | Axis Knitwears Limited (26006) |
| Azmat Apparels Ltd / Azmat Apparels Ltd. | Azmat Apparels Ltd (24634) |
| BANDO Eco Apparels Ltd | Bando Eco Apparels Ltd (24450) |
| BRAVO APPAREL MANUFACTURER LTD | Bravo Apparel Manufacturer Ltd (26055) |
| Brothers Fashion Ltd | Brothers Fashion LTD (26005) |
| CA Knit / CA KNITWEAR LIMITED | CA Knitwear Ltd (25383) |
| Chorka Textile Ltd / CHORKA TEXTILE LTD. | Chorka Textile Limited PJT (18757) |
| Colors & Stitchs | Colors & Stitches Limited (24447) |
| COLOUR AND CO LTD / Colour & Co. Ltd. | Colour And Co (27649) |
| Comfit Composite Knit Limited / Comfit Composite Knit Ltd | Comfit Composite Knit Ltd PKA Comfit Lingerie Limited [FLAG: paste truncated; no ID — confirm] |
| Crown Exclusive Wears / CROWN EXCLUSIVE LTD. | Crown Exclusive Wears Ltd (24272) |
| Designtex Knitwear Ltd | Designtex Knitwear Ltd (24601) |
| ECHOKNITS Ltd / ECHOKNITS LTD. | Echoknits Ltd (26559) |
| Echotex Limited / Echotex Ltd | Echotex Ltd PJT (11583) |
| Faiza Ind | Faiza Industries Ltd (24407) |
| Fakir Apparels | Fakir Apparels Ltd PJT (11266) |
| Fakir Knitwears Ltd. | Fakir Knitwears Ltd PJT (14100) |
| Fame Apparels Limited | Fame Apparels Ltd (25042) |
| Far East Knitting | Far East Knitting & Dyeing Industries Ltd PJT (11583) [FLAG: ID guessed — confirm] |
| Fortis Garments Limited / Fortis Garments Ltd | Fortis Garments Limited (25218) |
| Glory Fashion Wear Ltd. | Glory Fashion Wear Ltd (21750) |
| GM Apparels Limited | GM Apparels Ltd (25787) |
| Golden Refit Garments / GOLDEN REFIT LTD. | Golden Refit Garments Ltd (23489) |
| Good Earth Apparels ltd. | GoodEarth Apparels Ltd (24650) |
| Goumati Knit Wears / Goumati Knit Wears Ltd | KEEP OLD (No Exact Match) |
| Habitus Fashion Limited / Habitus Fashions Limited | Habitus Fashion Ltd (20147) |
| Hasan Tanvir Fashion Wears Limited / HASAN TANVIR FASHION WEAR LTD. | Hasan Tanvir Fashion Wears Ltd PJT (19151) |
| Hoplun Apparels Ltd | Hop Lun Apparel Limited PJT (18001) |
| Ibrahim Knit Garments (Pvt) Ltd. / Ibrahim Knit Garments (PVT) Ltd. | Ibrahim Knit Garments Pvt Ltd PJT (12048) |
| International Classic Composite Limited | International Classic Composite Ltd (19424) |
| Intimate Attire Limited / Intimate Attire Ltd | Intimate Attire Ltd PJT (23817) |
| JIN HONG GARMENTS LTD. | KEEP OLD (No Exact Match) |
| Kaixi Fashion | Kaixi Fashion Bangladesh Co Ltd (26163) |
| Kaixi Lingerie Bangladesh Co. Limited | Kaixi Lingerie Bangladesh Co Ltd (27618) |
| L'ESQUIRE LIMITED / L,ESQUIRE LTD. | Lesquire Limited (26569) |
| Libas Textiles Limited | Libas Textiles Ltd (13809) |
| LIDA TEXTILE AND DYEING LTD / Lida Textiles | Lida Textile & Dyeing Limited (22400) |
| Magic Works Ltd / Magic Works Ltd. | Magic Works (26306) |
| Mahdeen Sweaters Ltd / Mahdeen Sweaters Ltd. | Mahdeen Sweater Ltd (15379) |
| Masco Cottons Ltd. | Masco Cotton Ltd (17443) |
| MB Knit Fashion Limited | MB Knit Fashion PJT (19683) |
| Mehnaz Styles and Craft Ltd. | Mehnaz Styles & Craft Ltd (23609) |
| MG Knit Flair Ltd | KEEP OLD (No Exact Match) |
| MG NICHE FLAIR LTD. | MG Niche Stitch Limited PJT (21531) |
| Model De Capital / MODEL DE CAPITAL. / Modele De Capital Ind Ltd / Modele de Capital Ind Ltd. | Modele De Capital Ind Ltd PJT (11277) |
| MOUCHAK KNIT COMPOSITE LTD / MOUCHAK KNIT COMPOSITE LTD. | Mouchak Knit Composite Ltd PJT (20227) |
| Needle Drop Limited. | Needle Drop Ltd (20159) |
| Neo Fashion Limited. | Neo Fashion Ltd (18983) |
| New Asia Fashions | New Asia Fashions Limited (26015) |
| Newage App / Newage Apparels Limited | Newage Apparels Ltd (14512) |
| NKM FASHION LTD. | KEEP OLD (No Exact Match) |
| NORP KNIT IND. / NORP KNIT INDUSTRIES LTD / Norp Knit Industries Ltd. | Norp Knit Industries Limited Unit 1 PJT (18750) |
| Novel Hurricane Knit Garments Ltd. / Novel Hurricane Knit Ltd. | Novel Hurricane Knit Garments Ltd PJT (18469) |
| Onus Design | Onus Design Ltd PKA Onus Garments Ltd (25438) |
| Oxford Shirts Limited | Oxford Shirts Ltd (26764) |
| Panasia Clothing Ltd | Panasia Clothing Ltd PJT (22257) |
| PN Composite Ltd | PN Composite (14279) |
| Progress Apparel (Bangladesh) Ltd / Progress Apparels (Bangladesh) Limited | Progress Apparels Bangladesh Ltd (25399) |
| PRUDENT FASHION LTD. | Prudent Fashions Ltd (25696) |
| Reaz Export Apparels | Reaz Export Apparels Ltd PJT (15173) |
| REMI HOLDINGS LTD | Remi Holdings Limited PJT (21282) |
| RIZVI FASHION LTD. | Rizvi Fashions Limited PJT (21111) |
| Rose Intimate | Rose Intimates Ltd PJT (23445) |
| SB Style / SB STYLE COMPOSITE LTD. | SB Style Composite Ltd PJT (17149) |
| Scarlet Knitwears Limited / Scarlet Knitwears Ltd / SCARLET KNITWEARS LTD | Scarlet Knitwears Ltd PJT (17803) |
| Shanta Denims Ltd | Shanta Denims Limited (22933) |
| Shanta Industries Ltd | KEEP OLD (No Exact Match) |
| Soorty Textiles (BD) Limited | Soorty Textiles BD Limited PJT (20079) |
| Southeast Sweater Ltd | Southeast Sweaters Limited PJT (23926) |
| Southern Clothing | Southern Clothings Ltd PJT (16534) |
| SOUTHERN KNIT WEAR LTD. / SOUTHERN KNITWEAR | Southern Knitwear Limited (27035) |
| STYRAX FASHIONS LIMITED | Styrax Fashions Ltd Plot 180 (27586) |
| Surma Garments LTD / Surma Garments Ltd | Surma Garments Ltd PJT (18926) |
| Tarasima Appareals Ltd | Tarasima Apparels Ltd (17830) |
| Target Denim & Casual Wear Ltd / TARGET DENIM & CASUAL WEAR LTD. | Target Denim & Casual Wear Ltd PJT (23925) |
| Target Fine Wear / Target Fine Wear Industries Ltd | KEEP OLD (No Exact Match) |
| T-Design Knitwear Ltd | T Design Knitwear Limited (24250) |
| Triple Apparels Limited | Triple Apparels Limited (25968) |
| Tropical Knit | Tropical Knitex Ltd (24442) |
| Unifa Handbag & Belt (BD) Co Ltd | Unifa Handbag And Belt (BD) Co Ltd (27672) |
| Universal Menswear Ltd | Universal Menswear Ltd (19336) |
| Urmi Garments / Urmi Garments Limited | KEEP OLD (No Exact Match) |
| VICTORIA INTIMATE LTD / Victoria Intimate Ltd | Victoria Intimate Ltd (26293) |
| Well Lord Knitwear Limited | Well Lord Knit Wears Ltd (25086) |
| Welldone Apparels Ltd. / WELLDONE APPARELS LTD. | KEEP OLD (No Exact Match) |
| Windy Apparels Ltd | Windy Apparels Ltd (20096) |
| Winter Dress / Winter Dress Ltd / WINTER DRESS LTD. | Winter Dress (26695) |
| Yunusco (BD) Ltd / Yunusco (BD) Ltd. | Yunusco BD Limited (23378) |

## Matching Rules

1. **Exact string match** between each current factory name and the alias list (after the fixes below). A name matching no alias in any row is either kept (per rules 4-5) or reported to the user before commit.
2. **Paste-artifact fixes** (applied to the mapping, not to the data files):
   - Alias `L\`ESQUIRE LIMITED` (backtick) is matched as `L'ESQUIRE LIMITED` (apostrophe) — the actual name in `js/data.js`.
   - Alias `"L,ESQUIRE LTD."` (surrounding double quotes are CSV escaping) is matched as `L,ESQUIRE LTD.`.
   - MOUCHAK row covers both `MOUCHAK KNIT COMPOSITE LTD` and `MOUCHAK KNIT COMPOSITE LTD.` (trailing period).
   - The Lesquire row additionally covers the literal-backtick variant `L\`ESQUIRE LIMITED` exactly as it is stored in `data.csv` (line 8: `Epyllion,L`ESQUIRE LIMITED,0.68`) — the backtick is a data quirk of the CSV name, not an apostrophe; both the backtick and apostrophe variants rename to `Lesquire Limited (26569)`.
3. **Comfit / Far East best guesses** are applied as flagged above; user confirmed "use best guess", to be confirmed later:
   - Comfit -> `Comfit Composite Knit Ltd PKA Comfit Lingerie Limited` (no ID — paste was truncated before the ID)
   - Far East -> `Far East Knitting & Dyeing Industries Ltd PJT (11583)` (ID guessed, same pattern as other PJT rows)
4. **No-Exact-Match rows (8)** keep their current names: Goumati Knit Wears (+ variant), JIN HONG GARMENTS LTD., MG Knit Flair Ltd, NKM FASHION LTD., Shanta Industries Ltd, Target Fine Wear (+ variant), Urmi Garments (+ variant), Welldone Apparels (+ variant).
5. **Factories with no mapping row at all** keep their current names: `Entrust Fashions Ltd.`, `HELICON LIMITED` (both uniglory).

## Effects

- **`js/data.js`:** all 147 factory `name` fields (143 unique names; 4 name pairs are shared across suppliers: `MB Knit Fashion Limited`, `Fortis Garments Ltd`, `Golden Refit Garments`, `Echotex Ltd` — of these, only `Golden Refit Garments` and `Echotex Ltd` are true within-supplier duplicates, both in uniglory) renamed per mapping; suppliers, keys, `rate` values, and `formulaId`s untouched.
- **`data.csv`:** all 147 factory-name cells (column 2) renamed per mapping; supplier column, prices, row order, and header untouched. Supplier distribution: Epyllion 30, M&U 43, Uniglory 55, UNION LABEL & ACCESSORIES LTD. 19. The `L,ESQUIRE LTD.` row loses its quotes after rename (new name contains no comma).
- **Pre-existing duplicates:** uniglory lists `Echotex Ltd` x2, `Golden Refit Garments` x2, `Winter Dress` + `Winter Dress Ltd` — after rename these become identical name pairs within uniglory (e.g. `Winter Dress (26695)` twice). This matches the mapping's grouping and is no worse than today; the factory dropdown will show the name twice. No dedup in this change.
- No changes to `js/app.js`, `pdf_export.html`, `index.html`, data-check HTML/PDF logic, formulas, or prices.

## Verification

0. **Backup:** before any rename, `primark-pricing-data-check/data.csv` is copied verbatim to `primark-pricing-data-check/data.backup-2026-08-19.csv` and committed (already done; the file is never touched by the rename).
1. **Dry-run gate:** a script (temporary, outside the repo) loads the mapping, lists every old -> new change per file, and verifies every current name is accounted for (renamed or explicitly kept). The full table is reviewed before applying.
2. **Post-apply check:** no current name remains in either file except the 10 kept names; each of the 10 kept names appears in the expected places.
3. **QUnit (headless Edge, `tests/runner.html`):** 14 tests complete; the only failures are the 2 known pre-existing ones (CARTON_PRESETS window access; Primark SQM float precision); 181/184 assertions.
4. **Data-check tests:** `node --test primark-pricing-data-check/test/app.test.mjs` — 10/10 pass (parser behavior unchanged; quoted-field test still passes since renaming doesn't alter CSV structure rules).
5. **Data check parse:** `data.csv` parses to 147 rows; each supplier's row count unchanged (Epyllion 30, M&U 43, Uniglory 55, UNION LABEL & ACCESSORIES 19); spot-check several renamed names in the parse output.
6. **Changelog:** new `## v2.4.1 (Official Factory Name Updates)` entry above `## v2.4.0` in `VERSION_HISTORY.md`, styled like prior entries. README unchanged (it lists suppliers, not factories).

## Out of Scope

- Deduplicating factories within a supplier
- Updating the 10 kept names (user may provide updated names later)
- Adding factory IDs to kept names
- Any UI, formula, price, or logic change
- The two flagged best-guess names (pending user confirmation; easily corrected later)