# Factory Name Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every garment factory name in `js/data.js` and `primark-pricing-data-check/data.csv` with its official directory name (with factory ID) per the 98-row mapping, keeping 10 factories unchanged, verified by dry-run and both test suites.

**Architecture:** A one-off Node script (outside the repo, in the temp dir) embeds the mapping and KEEP list, runs a dry-run coverage check (every current name must be mapped or kept), then applies the rename: `data.js` via exact `name: "OLD"` string replacement, `data.csv` via parse → map column 2 → serialize (quote only when needed). Post-apply the script re-parses both files and asserts every name is a target or kept. The script is never committed.

**Tech Stack:** Node.js (v26, `node:test` for the data-check suite), vanilla JS, QUnit via headless Edge. No dependencies.

## Global Constraints

- Only these files change: `js/data.js`, `primark-pricing-data-check/data.csv`, `VERSION_HISTORY.md`. NEVER touch `js/app.js`, `pdf_export.html`, `index.html`, data-check HTML/PDF logic, `primark-pricing-data-check/data.backup-2026-08-19.csv` (committed pre-rename backup), formulas, or prices.
- Mapping applied verbatim including parenthetical factory IDs (e.g. `AB Apparels Ltd (24718)`).
- 14 name strings are KEPT unchanged (8 no-exact-match rows = 12 name strings + `Entrust Fashions Ltd.` + `HELICON LIMITED`).
- Matching is EXACT full-string only (no substring matching).
- Two best-guess renames were flagged for user confirmation: Comfit -> `Comfit Composite Knit Ltd PKA Comfit Lingerie Limited` (no ID, still pending) and Far East -> `Far East Knitting & Dyeing Industries Ltd PJT (115)` (ID since confirmed by user).
- Expected counts after rename: 147 factory entries in each file; 133 renamed entries, 14 kept entries per file.
- QUnit (`tests/runner.html`): 14 tests, 181/184 assertions, ONLY the 2 pre-existing failures (CARTON_PRESETS window access; Primark SQM float `0.09720000000000001`).
- Data-check tests: `node --test primark-pricing-data-check/test/app.test.mjs` — 10/10 pass.
- Supplier row counts in `data.csv` unchanged: Epyllion 30, M&U 43, Uniglory 55, UNION LABEL & ACCESSORIES LTD. 19.
- Work directly on branch `main` (user-approved). Commit messages lowercase conventional.
- Spec of record: `docs/superpowers/specs/2026-08-19-factory-name-updates-design.md`.

---

### Task 1: Rename script + dry-run report

**Files:**
- Create (temp, NOT committed): `C:\Users\Shoaib\AppData\Local\Temp\opencode\rename-factories.js`
- Create (workspace): `.superpowers\sdd\2026-08-19-factory-name-updates\task-1-report.md`

**Interfaces:**
- Consumes: nothing from earlier tasks; reads `js/data.js`, `primark-pricing-data-check/data.csv` read-only in this task.
- Produces: the script at the path above, with `const DRY_RUN = true;` at the top. Task 2 flips it to `false` and re-runs the same script. Task 2 also re-uses this task's verification commands.

- [ ] **Step 1: Create the rename script**

Write `C:\Users\Shoaib\AppData\Local\Temp\opencode\rename-factories.js` with EXACTLY this content (the MAPPING and KEEP arrays are verbatim from the reviewed spec; do not edit them):

```js
const fs = require('fs');
const DRY_RUN = true; // Task 2 flips this to false

const ROOT = 'C:/Users/Shoaib/OneDrive - PacD/Projects/Primark/Primark Carton SQM Analysis/Carton-Price-Calculator';
const JS_PATH = ROOT + '/js/data.js';
const CSV_PATH = ROOT + '/primark-pricing-data-check/data.csv';

const MAPPING = [
  { aliases: ['AB APPARELS LTD'], target: 'AB Apparels Ltd (24718)' },
  { aliases: ['AFIYA KNITWEAR LTD.'], target: 'Afiya Knitwear Ltd PJT (20517)' },
  { aliases: ['Akh Eco Apparels Ltd'], target: 'AKH Eco Apparels Ltd PJT (20979)' },
  { aliases: ['ALIM KNIT (BD) LTD.'], target: 'Alim Knit Ltd (20331)' },
  { aliases: ['Ananta Casual Wear Ltd'], target: 'Ananta Casual Wear Ltd (27725)' },
  { aliases: ['Ananta Huaxiang Ltd', 'Ananta Huxing'], target: 'Ananta Huaxiang Ltd (20421)' },
  { aliases: ['APS APPARELS LTD.'], target: 'APS Apparels Limited (26018)' },
  { aliases: ['Aspire Garments Ltd'], target: 'Aspire Garments Ltd PJT (24040)' },
  { aliases: ['AST Knit', 'AST Knitwear Ltd.'], target: 'AST Knitwear Ltd PJT (14482)' },
  { aliases: ['ATS Apparels'], target: 'ATS Apparels Ltd (11121)' },
  { aliases: ['AXIS KNIT WAER LTD.'], target: 'Axis Knitwears Limited (26006)' },
  { aliases: ['Azmat Apparels Ltd', 'Azmat Apparels Ltd.'], target: 'Azmat Apparels Ltd (24634)' },
  { aliases: ['BANDO Eco Apparels Ltd'], target: 'Bando Eco Apparels Ltd (24450)' },
  { aliases: ['BRAVO APPAREL MANUFACTURER LTD'], target: 'Bravo Apparel Manufacturer Ltd (26055)' },
  { aliases: ['Brothers Fashion Ltd'], target: 'Brothers Fashion LTD (26005)' },
  { aliases: ['CA Knit', 'CA KNITWEAR LIMITED'], target: 'CA Knitwear Ltd (25383)' },
  { aliases: ['Chorka Textile Ltd', 'CHORKA TEXTILE LTD.'], target: 'Chorka Textile Limited PJT (18757)' },
  { aliases: ['Colors & Stitchs'], target: 'Colors & Stitches Limited (24447)' },
  { aliases: ['COLOUR AND CO LTD', 'Colour & Co. Ltd.'], target: 'Colour And Co (27649)' },
  { aliases: ['Comfit Composite Knit Limited', 'Comfit Composite Knit Ltd'], target: 'Comfit Composite Knit Ltd PKA Comfit Lingerie Limited' },
  { aliases: ['Crown Exclusive Wears', 'CROWN EXCLUSIVE LTD.'], target: 'Crown Exclusive Wears Ltd (24272)' },
  { aliases: ['Designtex Knitwear Ltd'], target: 'Designtex Knitwear Ltd (24601)' },
  { aliases: ['ECHOKNITS Ltd', 'ECHOKNITS LTD.'], target: 'Echoknits Ltd (26559)' },
  { aliases: ['Echotex Limited', 'Echotex Ltd'], target: 'Echotex Ltd PJT (11583)' },
  { aliases: ['Faiza Ind'], target: 'Faiza Industries Ltd (24407)' },
  { aliases: ['Fakir Apparels'], target: 'Fakir Apparels Ltd PJT (11266)' },
  { aliases: ['Fakir Knitwears Ltd.'], target: 'Fakir Knitwears Ltd PJT (14100)' },
  { aliases: ['Fame Apparels Limited'], target: 'Fame Apparels Ltd (25042)' },
  { aliases: ['Far East Knitting'], target: 'Far East Knitting & Dyeing Industries Ltd PJT (115)' },
  { aliases: ['Fortis Garments Limited', 'Fortis Garments Ltd'], target: 'Fortis Garments Limited (25218)' },
  { aliases: ['Glory Fashion Wear Ltd.'], target: 'Glory Fashion Wear Ltd (21750)' },
  { aliases: ['GM Apparels Limited'], target: 'GM Apparels Ltd (25787)' },
  { aliases: ['Golden Refit Garments', 'GOLDEN REFIT LTD.'], target: 'Golden Refit Garments Ltd (23489)' },
  { aliases: ['Good Earth Apparels ltd.'], target: 'GoodEarth Apparels Ltd (24650)' },
  { aliases: ['Habitus Fashion Limited', 'Habitus Fashions Limited'], target: 'Habitus Fashion Ltd (20147)' },
  { aliases: ['Hasan Tanvir Fashion Wears Limited', 'HASAN TANVIR FASHION WEAR LTD.'], target: 'Hasan Tanvir Fashion Wears Ltd PJT (19151)' },
  { aliases: ['Hoplun Apparels Ltd'], target: 'Hop Lun Apparel Limited PJT (18001)' },
  { aliases: ['Ibrahim Knit Garments (Pvt) Ltd.', 'Ibrahim Knit Garments (PVT) Ltd.'], target: 'Ibrahim Knit Garments Pvt Ltd PJT (12048)' },
  { aliases: ['International Classic Composite Limited'], target: 'International Classic Composite Ltd (19424)' },
  { aliases: ['Intimate Attire Limited', 'Intimate Attire Ltd'], target: 'Intimate Attire Ltd PJT (23817)' },
  { aliases: ['Kaixi Fashion'], target: 'Kaixi Fashion Bangladesh Co Ltd (26163)' },
  { aliases: ['Kaixi Lingerie Bangladesh Co. Limited'], target: 'Kaixi Lingerie Bangladesh Co Ltd (27618)' },
  { aliases: ['L\'ESQUIRE LIMITED', 'L`ESQUIRE LIMITED', 'L,ESQUIRE LTD.'], target: 'Lesquire Limited (26569)' },
  { aliases: ['Libas Textiles Limited'], target: 'Libas Textiles Ltd (13809)' },
  { aliases: ['LIDA TEXTILE AND DYEING LTD', 'Lida Textiles'], target: 'Lida Textile & Dyeing Limited (22400)' },
  { aliases: ['Magic Works Ltd', 'Magic Works Ltd.'], target: 'Magic Works (26306)' },
  { aliases: ['Mahdeen Sweaters Ltd', 'Mahdeen Sweaters Ltd.'], target: 'Mahdeen Sweater Ltd (15379)' },
  { aliases: ['Masco Cottons Ltd.'], target: 'Masco Cotton Ltd (17443)' },
  { aliases: ['MB Knit Fashion Limited'], target: 'MB Knit Fashion PJT (19683)' },
  { aliases: ['Mehnaz Styles and Craft Ltd.'], target: 'Mehnaz Styles & Craft Ltd (23609)' },
  { aliases: ['MG NICHE FLAIR LTD.'], target: 'MG Niche Stitch Limited PJT (21531)' },
  { aliases: ['Model De Capital', 'MODEL DE CAPITAL.', 'Modele De Capital Ind Ltd', 'Modele de Capital Ind Ltd.'], target: 'Modele De Capital Ind Ltd PJT (11277)' },
  { aliases: ['MOUCHAK KNIT COMPOSITE LTD', 'MOUCHAK KNIT COMPOSITE LTD.'], target: 'Mouchak Knit Composite Ltd PJT (20227)' },
  { aliases: ['Needle Drop Limited.'], target: 'Needle Drop Ltd (20159)' },
  { aliases: ['Neo Fashion Limited.'], target: 'Neo Fashion Ltd (18983)' },
  { aliases: ['New Asia Fashions'], target: 'New Asia Fashions Limited (26015)' },
  { aliases: ['Newage App', 'Newage Apparels Limited'], target: 'Newage Apparels Ltd (14512)' },
  { aliases: ['NORP KNIT IND.', 'NORP KNIT INDUSTRIES LTD', 'Norp Knit Industries Ltd.'], target: 'Norp Knit Industries Limited Unit 1 PJT (18750)' },
  { aliases: ['Novel Hurricane Knit Garments Ltd.', 'Novel Hurricane Knit Ltd.'], target: 'Novel Hurricane Knit Garments Ltd PJT (18469)' },
  { aliases: ['Onus Design'], target: 'Onus Design Ltd PKA Onus Garments Ltd (25438)' },
  { aliases: ['Oxford Shirts Limited'], target: 'Oxford Shirts Ltd (26764)' },
  { aliases: ['Panasia Clothing Ltd'], target: 'Panasia Clothing Ltd PJT (22257)' },
  { aliases: ['PN Composite Ltd'], target: 'PN Composite (14279)' },
  { aliases: ['Progress Apparel (Bangladesh) Ltd', 'Progress Apparels (Bangladesh) Limited'], target: 'Progress Apparels Bangladesh Ltd (25399)' },
  { aliases: ['PRUDENT FASHION LTD.'], target: 'Prudent Fashions Ltd (25696)' },
  { aliases: ['Reaz Export Apparels'], target: 'Reaz Export Apparels Ltd PJT (15173)' },
  { aliases: ['REMI HOLDINGS LTD'], target: 'Remi Holdings Limited PJT (21282)' },
  { aliases: ['RIZVI FASHION LTD.'], target: 'Rizvi Fashions Limited PJT (21111)' },
  { aliases: ['Rose Intimate'], target: 'Rose Intimates Ltd PJT (23445)' },
  { aliases: ['SB Style', 'SB STYLE COMPOSITE LTD.'], target: 'SB Style Composite Ltd PJT (17149)' },
  { aliases: ['Scarlet Knitwears Limited', 'Scarlet Knitwears Ltd', 'SCARLET KNITWEARS LTD'], target: 'Scarlet Knitwears Ltd PJT (17803)' },
  { aliases: ['Shanta Denims Ltd'], target: 'Shanta Denims Limited (22933)' },
  { aliases: ['Soorty Textiles (BD) Limited'], target: 'Soorty Textiles BD Limited PJT (20079)' },
  { aliases: ['Southeast Sweater Ltd'], target: 'Southeast Sweaters Limited PJT (23926)' },
  { aliases: ['Southern Clothing'], target: 'Southern Clothings Ltd PJT (16534)' },
  { aliases: ['SOUTHERN KNIT WEAR LTD.', 'SOUTHERN KNITWEAR'], target: 'Southern Knitwear Limited (27035)' },
  { aliases: ['STYRAX FASHIONS LIMITED'], target: 'Styrax Fashions Ltd Plot 180 (27586)' },
  { aliases: ['Surma Garments LTD', 'Surma Garments Ltd'], target: 'Surma Garments Ltd PJT (18926)' },
  { aliases: ['Tarasima Appareals Ltd'], target: 'Tarasima Apparels Ltd (17830)' },
  { aliases: ['Target Denim & Casual Wear Ltd', 'TARGET DENIM & CASUAL WEAR LTD.'], target: 'Target Denim & Casual Wear Ltd PJT (23925)' },
  { aliases: ['T-Design Knitwear Ltd'], target: 'T Design Knitwear Limited (24250)' },
  { aliases: ['Triple Apparels Limited'], target: 'Triple Apparels Limited (25968)' },
  { aliases: ['Tropical Knit'], target: 'Tropical Knitex Ltd (24442)' },
  { aliases: ['Unifa Handbag & Belt (BD) Co Ltd'], target: 'Unifa Handbag And Belt (BD) Co Ltd (27672)' },
  { aliases: ['Universal Menswear Ltd'], target: 'Universal Menswear Ltd (19336)' },
  { aliases: ['VICTORIA INTIMATE LTD', 'Victoria Intimate Ltd'], target: 'Victoria Intimate Ltd (26293)' },
  { aliases: ['Well Lord Knitwear Limited'], target: 'Well Lord Knit Wears Ltd (25086)' },
  { aliases: ['Windy Apparels Ltd'], target: 'Windy Apparels Ltd (20096)' },
  { aliases: ['Winter Dress', 'Winter Dress Ltd', 'WINTER DRESS LTD.'], target: 'Winter Dress (26695)' },
  { aliases: ['Yunusco (BD) Ltd', 'Yunusco (BD) Ltd.'], target: 'Yunusco BD Limited (23378)' },
];

const KEEP = [
  'Goumati Knit Wears', 'Goumati Knit Wears Ltd',
  'JIN HONG GARMENTS LTD.', 'MG Knit Flair Ltd', 'NKM FASHION LTD.', 'Shanta Industries Ltd',
  'Target Fine Wear', 'Target Fine Wear Industries Ltd',
  'Urmi Garments', 'Urmi Garments Limited',
  'Welldone Apparels Ltd.', 'WELLDONE APPARELS LTD.',
  'Entrust Fashions Ltd.', 'HELICON LIMITED',
];

const SUPPLIER_NAMES = ['Epyllion', 'M&U', 'Uniglory', 'UNION LABEL & ACCESSORIES LTD.'];

function splitCSVLine(line) {
  const parts = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) { if (c === '"') { if (line[i+1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += c; }
    else if (c === '"') inQ = true;
    else if (c === ',') { parts.push(cur); cur = ''; }
    else cur += c;
  }
  parts.push(cur);
  return parts;
}

function toCSVField(v) {
  return /[",]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}

function getJsFactoryNames(text) {
  return [...text.matchAll(/name: "([^"]+)"/g)].map(m => m[1]).filter(n => !SUPPLIER_NAMES.includes(n));
}

function aliasToTarget(aliases) {
  const map = new Map();
  for (const row of MAPPING) for (const a of row.aliases) map.set(a, row.target);
  return map;
}

function coverageCheck(label, names) {
  const map = aliasToTarget();
  const unmatched = [...new Set(names.filter(n => !map.has(n) && !KEEP.includes(n)))];
  const kept = names.filter(n => KEEP.includes(n)).length;
  const renamed = names.filter(n => map.has(n)).length;
  console.log(`[${label}] entries=${names.length} renamed=${renamed} kept=${kept} unmatched=${unmatched.length}`);
  for (const n of unmatched) console.log('  UNMATCHED:', n);
  return unmatched.length === 0;
}

function dryRun(label, names) {
  const map = aliasToTarget();
  const grouped = new Map();
  for (const n of names) {
    if (!map.has(n)) continue;
    const t = map.get(n);
    grouped.set(t, (grouped.get(t) || []).concat(n));
  }
  console.log(`[${label}] rename table (${grouped.size} unique targets):`);
  for (const [t, olds] of grouped) {
    console.log(`  ${JSON.stringify(olds)} -> ${t}`);
  }
}

const jsText = fs.readFileSync(JS_PATH, 'utf8');
const jsNames = getJsFactoryNames(jsText);

const csvLines = fs.readFileSync(CSV_PATH, 'utf8').split('\n');
const csvHeader = csvLines[0];
const csvRows = csvLines.slice(1).filter(l => l.trim() !== '').map(l => splitCSVLine(l));
const csvNames = csvRows.map(r => r[1]);

if (!coverageCheck('js/data.js', jsNames)) process.exit(1);
if (!coverageCheck('data.csv', csvNames)) process.exit(1);

if (DRY_RUN) {
  dryRun('js/data.js', jsNames);
  dryRun('data.csv', csvNames);
  console.log('DRY RUN OK - no files modified');
  process.exit(0);
}

const map = aliasToTarget();

let newJsText = jsText;
for (const row of MAPPING) {
  for (const a of row.aliases) {
    const pattern = 'name: "' + a + '"';
    if (!newJsText.includes(pattern)) { console.error('MISSING IN JS:', a); process.exit(1); }
    newJsText = newJsText.split(pattern).join('name: "' + row.target + '"');
  }
}
fs.writeFileSync(JS_PATH, newJsText, 'utf8');

const newCsvRows = csvRows.map(r => {
  const name = map.get(r[1]) || r[1];
  return [r[0], name, r[2]].map(toCSVField).join(',');
});
fs.writeFileSync(CSV_PATH, csvHeader + '\n' + newCsvRows.join('\n') + '\n', 'utf8');

const postJs = getJsFactoryNames(fs.readFileSync(JS_PATH, 'utf8'));
const postCsv = fs.readFileSync(CSV_PATH, 'utf8').split('\n').slice(1).filter(l => l.trim() !== '').map(l => splitCSVLine(l)[1]);
const targetSet = new Set([...map.values(), ...KEEP]);
const badJs = postJs.filter(n => !targetSet.has(n));
const badCsv = postCsv.filter(n => !targetSet.has(n));
if (badJs.length || badCsv.length) { console.error('POST-VERIFY FAIL:', badJs, badCsv); process.exit(1); }
console.log('POST-VERIFY OK: js entries=' + postJs.length + ' csv rows=' + postCsv.length);
```

- [ ] **Step 2: Run the dry-run**

Run: `node C:\Users\Shoaib\AppData\Local\Temp\opencode\rename-factories.js`
Expected output:
- Coverage lines: `[js/data.js] entries=147 renamed=133 kept=14 unmatched=0` and `[data.csv] entries=147 renamed=133 kept=14 unmatched=0`
- `UNMATCHED:` lines: none
- The full rename table for both files (~133 rows), ending with `DRY RUN OK - no files modified`
- Confirm via `git status --short` that NO repo files changed (clean except nothing).

- [ ] **Step 3: Verify the table and write the report**

Visually spot-check the dry-run table against the spec (`docs/superpowers/specs/2026-08-19-factory-name-updates-design.md`):
- `L'ESQUIRE LIMITED` and `L,ESQUIRE LTD.` both -> `Lesquire Limited (26569)`
- All three Winter Dress variants -> `Winter Dress (26695)`
- Both MOUCHAK variants -> `Mouchak Knit Composite Ltd PJT (20227)`
- No kept name appears in the rename table (Goumati, JIN HONG, MG Knit Flair, NKM, Shanta Industries, Target Fine Wear, Urmi, Welldone, Entrust, HELICON).

Write your full report to `.superpowers\sdd\2026-08-19-factory-name-updates\task-1-report.md` (create the directory if needed): include the coverage output, confirmation the repo is untouched, the spot-checks, and any concerns.

Then reply with ONLY (under 10 lines):
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- One-line dry-run summary (counts + unmatched)
- Your concerns, if any
- The report file path

---

### Task 2: Apply the rename + full verification + commit

**Files:**
- Modify: `js/data.js` (147 factory `name` values)
- Modify: `primark-pricing-data-check/data.csv` (147 rows, column 2)
- Verify only: `primark-pricing-data-check/data.backup-2026-08-19.csv` (must remain byte-identical)

**Interfaces:**
- Consumes: `C:\Users\Shoaib\AppData\Local\Temp\opencode\rename-factories.js` from Task 1 (flip `DRY_RUN` to `false`).
- Produces: renamed files + verification evidence; commit `feat: rename factory names to official directory names`.

- [ ] **Step 1: Flip DRY_RUN and apply**

In `C:\Users\Shoaib\AppData\Local\Temp\opencode\rename-factories.js` change line 3 to `const DRY_RUN = false; // Task 2 applies`
Run: `node C:\Users\Shoaib\AppData\Local\Temp\opencode\rename-factories.js`
Expected output: `POST-VERIFY OK: js entries=147 csv rows=147`

- [ ] **Step 2: Check the diff is rename-only**

Run: `git diff --stat` — expected: `js/data.js` and `primark-pricing-data-check/data.csv` only, with roughly 133 lines changed in each (pure renames).
Run: `git diff primark-pricing-data-check/data.csv` — verify: header unchanged; each changed line differs ONLY in the factory field; the `L,ESQUIRE LTD.` row became `UNION LABEL & ACCESSORIES LTD.,Lesquire Limited (26569),0.68` (unquoted).
Verify the backup is untouched: `git status --short` must NOT list `primark-pricing-data-check/data.backup-2026-08-19.csv`.

- [ ] **Step 3: Run the QUnit suite (headless Edge)**

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$url = "file:///C:/Users/Shoaib/OneDrive - PacD/Projects/Primark/Primark Carton SQM Analysis/Carton-Price-Calculator/tests/runner.html"
$quoted = '"' + $url + '"'
Start-Process -FilePath $edge -ArgumentList "--headless","--disable-gpu","--dump-dom",$quoted -RedirectStandardOutput "$env:TEMP\qunit-rename.html" -RedirectStandardError "$env:TEMP\qunit-rename-err.txt" -PassThru -Wait | Out-Null
Select-String -Path "$env:TEMP\qunit-rename.html" -Pattern "tests completed|assertions of" | ForEach-Object { $_.Line.Trim() }
```

Expected: `14 tests completed ... with 2 failed` and `181 assertions of 184 passed, 3 failed` — the ONLY failing tests are the 2 known pre-existing ones (`CARTON_PRESETS defines 11 exact dimensions`, `Primark SQM formula`). The uniform-rate test must pass for all 147 factories (its messages list every factory name — renamed ones included).

- [ ] **Step 4: Run the data-check suite**

Run: `node --test primark-pricing-data-check/test/app.test.mjs`
Expected: `# tests 10`, `# pass 10`, `# fail 0`.

- [ ] **Step 5: Run the parse/spot-check**

Run this Node one-liner (write it to `C:\Users\Shoaib\AppData\Local\Temp\opencode\spotcheck.js` if quoting fights you):

```js
const fs = require('fs');
function splitCSVLine(line) {
  const parts = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) { if (c === '"') { if (line[i+1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += c; }
    else if (c === '"') inQ = true;
    else if (c === ',') { parts.push(cur); cur = ''; }
    else cur += c;
  }
  parts.push(cur);
  return parts;
}
const rows = fs.readFileSync('primark-pricing-data-check/data.csv', 'utf8').split('\n').slice(1).filter(l => l.trim()).map(l => splitCSVLine(l));
const bySupplier = {};
for (const r of rows) bySupplier[r[0]] = (bySupplier[r[0]] || 0) + 1;
console.log('rows:', rows.length, JSON.stringify(bySupplier));
for (const want of ['Lesquire Limited (26569)', 'Mouchak Knit Composite Ltd PJT (20227)', 'AB Apparels Ltd (24718)', 'Winter Dress (26695)', 'JIN HONG GARMENTS LTD.']) {
  const hit = rows.find(r => r[1] === want);
  console.log(want, '->', hit ? hit[0] + ' @ ' + hit[2] : 'MISSING');
}
```

Expected: `rows: 147 {"Epyllion":30,"M&U":43,"Uniglory":55,"UNION LABEL & ACCESSORIES LTD.":19}`, all 5 spot-check names found, `JIN HONG GARMENTS LTD.` kept.

- [ ] **Step 6: Verify no old names remain**

Run: `Select-String -Path "js/data.js","primark-pricing-data-check/data.csv" -Pattern "AXIS KNIT WAER|L'ESQUIRE LIMITED|L,ESQUIRE LTD.|Fakir Knitwears Ltd\.|Colors & Stitchs" | Measure-Object | Select-Object -ExpandProperty Count`
Expected: `0`. (The rename script's POST-VERIFY already asserts every name is target-or-kept; this is belt-and-braces.)

- [ ] **Step 7: Commit**

```powershell
git add js/data.js primark-pricing-data-check/data.csv
git commit -m "feat: rename factory names to official directory names"
```

Confirm `git status --short` shows only the two files staged, and the commit contains ~133 renamed entries per file, no other changes.

Write your full report to `.superpowers\sdd\2026-08-19-factory-name-updates\task-2-report.md` (RED/GREEN evidence for every step above, diff notes, concerns).

Then reply with ONLY (under 12 lines):
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Commit (short SHA + subject)
- One-line test summary
- Your concerns, if any
- The report file path

---

### Task 3: Changelog entry v2.4.1

**Files:**
- Modify: `VERSION_HISTORY.md` (root; tracked — normal `git add`)

**Interfaces:**
- Consumes: nothing (independent of Tasks 1-2's artifacts, but must run after them so the changelog describes shipped state).
- Produces: `## v2.4.1` block above `## v2.4.0`; commit `docs: add v2.4.1 changelog`.

- [ ] **Step 1: Read the current top of VERSION_HISTORY.md**

Read the first 10 lines of `VERSION_HISTORY.md` to confirm the current top entry is `## v2.4.0 (UNION LABEL & ACCESSORIES Supplier)`.

- [ ] **Step 2: Insert the v2.4.1 block**

Insert ABOVE the `## v2.4.0` line, matching the existing style exactly (blank line before and after the block):

```markdown
## v2.4.1 (Official Factory Name Updates)
*   **Official Factory Names**: Updated 129 factory names (133 entries) across the carton price calculator and pricing data check to their official directory names with factory IDs. 10 factories keep their previous names (no exact match in the directory or no mapping row).
*   **Pending Confirmation**: Comfit Composite Knit Ltd PKA Comfit Lingerie Limited (ID not yet confirmed) is a best-guess rename from a truncated source list.
```

- [ ] **Step 3: Verify**

Re-read the top 12 lines of the file: v2.4.1 above v2.4.0, style matches the v2.4.0 block (heading level, `*   **Bold Lead**:` bullets, blank-line separation).

- [ ] **Step 4: Commit**

```powershell
git add VERSION_HISTORY.md
git commit -m "docs: add v2.4.1 changelog"
```

Write your full report to `.superpowers\sdd\2026-08-19-factory-name-updates\task-3-report.md` (old/new text, verification, concerns).

Then reply with ONLY (under 10 lines):
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Commit (short SHA + subject)
- One-line verification summary
- Your concerns, if any
- The report file path