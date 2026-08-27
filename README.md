# Carton Price Calculator

A specialized web application designed for calculating corrugated carton prices, tracking paper consumption, and comparing supplier rates against standard Primark benchmarks for PACD. 

## 🚀 Key Features

*   **Supplier Directory & Rate Execution**: Instantly look up Garment Factories matched to their respective Packaging Suppliers (Epyllion Limited, M&U Packaging Ltd, Uniglory Paper & Packaging, UNION LABEL & ACCESSORIES LTD.).
*   **Dual-View Dashboard**: Automatically calculates both the Packaging Supplier Price and the standard Primark Carton Price based on input dimensions and generates a comparative Margin breakdown.
*   **Detailed Paper Consumption**: Generates high-accuracy paper resource metrics (Board Length, Stitching, Fluting Space, Roll Increment/Width) based on supplier-specific dividing logic per carton.
*   **Branded PDF Quotation System**: Exports a professionally styled A4 pricing quota document matching the PACD aesthetic via an advanced offscreen rendering method.
*   **Smart Welcome Collapse**: The welcome hero smoothly collapses to a compact title-only header once a Packaging Supplier is selected, keeping the app heading visible at all times.
*   **Real-time Interaction**: All user inputs (dimensions, preset FEFCO 0201 options, carton quantity) update dashboard numbers dynamically without needing manual submission.

## 🛠️ Usage

1.  **Configure Packaging Details**: Select the Packaging Supplier Name from the dropdown, then select a dedicated Garment Factory.
2.  **Input Dimensions**: Use the `Carton Size` preset dropdown, or select `Custom Dimensions` and type your direct Length, Width, and Height configurations in millimeters. 
3.  **Review Dashboard Data**: Review the generated dashboard panels measuring the Packaging Supplier Price, Primark Carton Price constraints, and the computed Margin difference.
4.  **Paper Consumption View**: Review paper resource metrics (shown above the price panels) covering stitching lengths, divided sheet boards, and overall SQM carton footprints.
5.  *(Hidden Module / Optional)* **Generate PDF**: Upon unlocking configuration bounds, a `pdf_export.html` bridge exports data directly to a physical quote formatting page.

## 🔗 Sub-pages

*   **Pricing Data Check** (`primark-pricing-data-check/`): Standalone look-up of packaging rates (US $ per SQM) by factory and supplier, with alphabetical sorting, **carton dimension inputs** (L/W/H, default 500 × 300 × 300), and a **Primark SQM column derived via the P/E model** — `Primark $/sqm = Supplier $/sqm × (Primark area ÷ Supplier area)` — using the real paper-consumption SQM formulas (M&U roll 2300, Uniglory roll 1600, Primark, Epyllion). Primark is consistently cheaper since its SQM measures a smaller area. The table and branded PDF (both PACD + Primark logos) show 8 columns: Supplier SQM, Supplier Carton, Primark SQM, and Primark Carton. Pre-computed reports: `primark-sqm-500x300x300.csv` and `carton-prices-500x300x300.csv`. Rate data is maintained separately in `primark-pricing-data-check/data.csv`.

## 🏗️ Technical Architecture

This application is built as a static frontend bundle utilizing:
*   HTML5 / CSS3 structured via a PACD brand restyle (Navy & Red elements, custom glass nav).
*   Vanilla JavaScript (`data.js`, `calculator.js`, `app.js`).
*   `html2pdf.js` for standalone offscreen PDF clone-rendering (`pdf_export.html`).

*Developed for PACD Operations.*