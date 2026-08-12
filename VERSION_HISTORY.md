# Version History

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