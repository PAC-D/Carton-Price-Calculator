# Version History

## v2.5.0 (Dynamic Primark SQM Price Calculation)
*   **Dynamic Primark SQM Price**: The Primark SQM Price column in the Pricing Data Check subpage is now calculated dynamically per factory using the 0.95 factory-to-Primark rate factor (Primark = Factory Price / 0.95), instead of a hardcoded $0.77 benchmark. This reflects the actual Primark-equivalent price based on each factory's specific supplier rate.
*   **Removed Hardcoded Constant**: Eliminated `PRIMARK_SQM_PRICE = 0.77` from `primark-pricing-data-check/app.js`; calculation now derives from CSV factory prices and the shared 0.95 factor defined in `js/data.js`.

## v2.4.2 (Supplier Full Names & Data-Check Polish)
*   **Full Supplier Names**: Packaging suppliers now show their official full names on both pages — Epyllion Limited, M&U Packaging Ltd, Uniglory Paper & Packaging (UNION LABEL & ACCESSORIES LTD. unchanged).
*   **Data-Check Polish**: The pricing data check page now shows a Primark SQM Price column (US$ 0.77), sorts factories alphabetically within packaging supplier groups, and exports PDFs with a dark blue title and generation date.

## v2.4.1 (Official Factory Name Updates)
*   **Official Factory Names**: Updated 129 factory names (133 entries) across the carton price calculator and pricing data check to their official directory names with factory IDs. 10 factories keep their previous names (no exact match in the directory or no mapping row).
*   **Pending Confirmation**: Comfit Composite Knit Ltd PKA Comfit Lingerie Limited (ID not yet confirmed) is a best-guess rename from a truncated source list.

## v2.4.0 (UNION LABEL & ACCESSORIES Supplier)
*   **New Packaging Supplier**: Added UNION LABEL & ACCESSORIES LTD. with 19 garment factories to the carton price calculator, priced at the standard factory rate (Primark SQM minus 5%) and mapped to the Union/Epyllion SQM formula.
*   **Pricing Data Check**: Added the same 19 factories to the pricing data check with their listed per-SQM rates, including a quoted-field CSV fix so factory names containing commas (e.g. `L,ESQUIRE LTD.`) parse correctly.

## v2.3.0 (Uniform Factory Pricing & Label Clarity)
*   **Uniform Factory Pricing**: All garment-factory rates now equal the Primark SQM rate minus 5% (`$0.77` x 0.95 = `$0.7315`), defined once as `PRIMARK_SQM_RATE` / `FACTORY_SQM_RATE` constants in `js/data.js`. Every factory of a supplier prices identically, keeping the supplier side 5% below the Primark benchmark per SQM.
*   **Clearer Result Labels**: Renamed "Supplier Cost" to "Packaging Supplier Price" and "Primark Price" to "Primark Carton Price" across the calculator and the PDF quotation.
*   **Paper Consumption Placement**: Moved the Paper Consumption card above the price panels on the calculator and above the Cost Breakdown section in the PDF quotation.

## v2.2.0 (UI Polish & Welcome Collapse)
*   **Smart Welcome Collapse**: The welcome hero now smoothly collapses to a compact title-only header once a Packaging Supplier is selected, keeping the "Carton Price Calculator" heading visible while hiding the icon, tagline, steps, and CTA with a fluid CSS animation. The panel expands back seamlessly when the supplier is cleared.
*   **Calculator Refinements**: Removed the per-factory rate column from the factory table (rates remain the active pricing source); placed the Carton Quantity input beside the Carton Size on desktop and as a full-width row on mobile; stacked the Supplier Cost / Primark Price dashboard panels vertically on small screens.
*   **Pricing Data Check PDF Export**: Branded export now renders both the PACD and Primark logos in a header bar on every page, with a "Carton Price for Factory" heading on the first page.
*   **Pricing Data Check UI**: Navbar now shows the Primark logo alongside the page title; footer links back to the main Carton Price Calculator; the results card is vertically centered on fullscreen layouts; cache-busting query strings added to local assets.

## v2.1.0 (Pricing Data Check Subpage)
*   **Pricing Data Check Subpage**: Added a PACD-themed subpage for packaging rate look-up by factory and packaging supplier, with supplier/factory filters and branded PDF export. Data maintained independently in `primark-pricing-data-check/data.csv`.

## v2.0.0 (PACD Brand Restyle)
*   **PACD Visual Redesign**: Complete UI/UX redesign utilizing the official Navy/Red PACD aesthetic, Inter/Outfit typography, and floating form groups.
*   **Supplier Configuration Upgrade**: Switched the old supplier-tab UI sequence into a polished `custom-select` dropdown matching the GitHub reference repository workflow.
*   **Branded PDF Pipeline**: Replaced the in-page hidden `#pdf-content` template logic with a robust, offscreen clone-rendered `pdf_export.html` standalone page architecture to handle A4 document scaling efficiently.
*   **Dashboard Improvements**: Explicitly split Dashboard modules to visualize "Supplier Cost" side-by-side with "Primark Price" directly on the live interface.

## v1.2.0 (Paper Consumption Feature)
*   **Consumption Algorithms**: Added deeply detailed board consumption logic parsing Actual Length, Roll Width, and Roll Increments.
*   **Supplier Specifics Rules**: M&U dividing logic correctly assigned to `2` with `100` roll increments; Epyllion and Uniglory utilizing standard `1` divide logic with `50` incremental bounding.
*   **Data Vis**: Added dedicated on-screen and PDF-generated data tables for paper calculations.

## v1.1.0 
*   **Formula Engines**: Initial inclusion of complex FEFCO 0201 mathematical SQM formulas for distinct packaging vendors.
*   **Factory Maps**: Bound factories visually to their selected supplier configurations.
*   **Event Hooks**: Connected the data entry inputs (`L/W/H/Qty`) to the live dashboard refresh via JavaScript.

## v1.0.0
*   **Project Scaffold**: Initial setup containing DOM structuring, JavaScript baseline scaffolding, and raw CSS configuration.