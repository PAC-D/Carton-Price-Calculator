import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseCSV, getSuppliers, getFactories, applyFilters, formatPrice, sortRows } = require('../app.js');

const SAMPLE = [
  'Packaging Supplier,Factory,Price SQM (US $)',
  'Epyllion Limited,Fakir Knitwears Ltd.,0.7',
  'M&U Packaging Ltd,Akh Eco Apparels Ltd,0.96',
  'Uniglory Paper & Packaging,AB APPARELS LTD,0.78'
].join('\n');

test('parseCSV parses header and rows', () => {
  const rows = parseCSV(SAMPLE);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0], { supplier: 'Epyllion Limited', factory: 'Fakir Knitwears Ltd.', price: 0.7 });
  assert.deepEqual(rows[2], { supplier: 'Uniglory Paper & Packaging', factory: 'AB APPARELS LTD', price: 0.78 });
});

test('parseCSV skips the header line and blank lines', () => {
  const rows = parseCSV(SAMPLE + '\n\n\n');
  assert.equal(rows.length, 3);
});

test('getSuppliers returns All plus distinct suppliers in order', () => {
  assert.deepEqual(getSuppliers(parseCSV(SAMPLE)), ['All', 'Epyllion Limited', 'M&U Packaging Ltd', 'Uniglory Paper & Packaging']);
});

test('getFactories returns distinct factories sorted', () => {
  assert.deepEqual(getFactories(parseCSV(SAMPLE)), ['AB APPARELS LTD', 'Akh Eco Apparels Ltd', 'Fakir Knitwears Ltd.']);
});

test('applyFilters filters by supplier', () => {
  const out = applyFilters(parseCSV(SAMPLE), { supplier: 'M&U Packaging Ltd', factoryText: '' });
  assert.equal(out.length, 1);
  assert.equal(out[0].factory, 'Akh Eco Apparels Ltd');
});

test('applyFilters filters by factory text case-insensitively', () => {
  const out = applyFilters(parseCSV(SAMPLE), { supplier: 'All', factoryText: 'app' });
  assert.deepEqual(out.map(r => r.factory), ['Akh Eco Apparels Ltd', 'AB APPARELS LTD']);
});

test('applyFilters combines supplier and factory text', () => {
  const out = applyFilters(parseCSV(SAMPLE), { supplier: 'Uniglory Paper & Packaging', factoryText: 'app' });
  assert.equal(out.length, 1);
  assert.equal(out[0].factory, 'AB APPARELS LTD');
});

test('applyFilters returns empty when nothing matches', () => {
  assert.equal(applyFilters(parseCSV(SAMPLE), { supplier: 'All', factoryText: 'zzz' }).length, 0);
});

test('formatPrice formats to two decimals', () => {
  assert.equal(formatPrice(0.7), '0.70');
  assert.equal(formatPrice(0.96), '0.96');
});

test('parseCSV parses a quoted factory field containing a comma', () => {
  const rows = parseCSV([
    'Packaging Supplier,Factory,Price SQM (US $)',
    'UNION LABEL & ACCESSORIES LTD.,"L,ESQUIRE LTD.",0.68'
  ].join('\n'));
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], { supplier: 'UNION LABEL & ACCESSORIES LTD.', factory: 'L,ESQUIRE LTD.', price: 0.68 });
});

test('sortRows sorts by supplier then factory', () => {
  const rows = [
    { supplier: 'Uniglory Paper & Packaging', factory: 'Zebra Ltd', price: 1 },
    { supplier: 'M&U Packaging Ltd', factory: 'Alpha Ltd', price: 1 },
    { supplier: 'Epyllion Limited', factory: 'Beta Ltd', price: 1 },
    { supplier: 'Epyllion Limited', factory: 'Alpha Ltd', price: 1 }
  ];
  assert.deepEqual(sortRows(rows).map(r => r.supplier + '|' + r.factory), [
    'Epyllion Limited|Alpha Ltd',
    'Epyllion Limited|Beta Ltd',
    'M&U Packaging Ltd|Alpha Ltd',
    'Uniglory Paper & Packaging|Zebra Ltd'
  ]);
});
