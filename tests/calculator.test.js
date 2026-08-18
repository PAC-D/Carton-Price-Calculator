QUnit.module('Calculations');

QUnit.test('Primark SQM formula', function(assert) {
  // ((2*100 + 2*100 + 50)*(100+100) / 1000000) * 1.08 = ((450)*(200)/1000000) * 1.08 = 0.09 * 1.08 = 0.0972
  assert.equal(calcPrimarkSQM(100, 100, 100), 0.0972);
});

QUnit.test('Supplier SQM logic', function(assert) {
  // Epyllion: ((10+10+60)*(10+10+40)*2)/1M = (80*60*2)/1M = 9600/1M = 0.0096
  assert.equal(calcSupplierSQM('epyllion', 10, 10, 10), 0.0096);
  // M&U: ((10+2*10+100)*(10+2*10+100))/1M = (130)*(130)/1M = 0.0169
  assert.equal(calcSupplierSQM('mu', 10, 10, 10), 0.0169);
  // Uniglory: ((10+2*10+100)*(10+2*10+50))/1M = (130)*(80)/1M = 0.0104
  assert.equal(calcSupplierSQM('uniglory', 10, 10, 10), 0.0104);
  assert.equal(calcSupplierSQM('unknown', 10, 10, 10), 0);
});

QUnit.test('union formulaId uses the Epyllion/Union SQM formula', function(assert) {
  // ((10+10+60)*(10+10+40)*2)/1M = (80*60*2)/1M = 0.0096
  assert.equal(calcSupplierSQM('union', 10, 10, 10), 0.0096);
});

QUnit.test('calculatePrice full payload', function(assert) {
  // Mock partial response structure for integration points
  const res = calculatePrice('epyllion', 10, 10, 10, 1, FACTORY_SQM_RATE);
  assert.ok(res.primarkSqm);
  assert.ok(res.supplierSqm);
  assert.ok(res.margin);
});

QUnit.test('calculatePrice uses PRIMARK_SQM_RATE and FACTORY_SQM_RATE', function(assert) {
  const res = calculatePrice('epyllion', 10, 10, 10, 2, FACTORY_SQM_RATE);
  assert.equal(res.primarkPricePerCarton, res.primarkSqm * PRIMARK_SQM_RATE);
  assert.equal(res.supplierCostPerCarton, res.supplierSqm * FACTORY_SQM_RATE);
  assert.equal(res.supplierTotalCost, res.supplierCostPerCarton * 2);
  assert.equal(res.primarkTotalPrice, res.primarkPricePerCarton * 2);
  assert.equal(res.margin, res.primarkTotalPrice - res.supplierTotalCost);
});

QUnit.module('Paper Consumption');

QUnit.test('Epyllion calculates board values and rounds roll width to 50 mm', function(assert) {
  const result = calculatePaperConsumption('epyllion', 100, 100, 100);

  assert.deepEqual(result, {
    boardLength: 400,
    stitching: 100,
    actualLength: 500,
    flutingSpace: 10,
    width: 210,
    divide: 1,
    cuttingSpace: 40,
    boardWidth: 250,
    rollIncrement: 50,
    paperRollWidth: 250,
    paperConsumptionSqm: 0.125
  });
});

QUnit.test('M&U uses divide 2 and rounds roll width to 100 mm', function(assert) {
  const result = calculatePaperConsumption('mu', 500, 600, 500);

  assert.equal(result.divide, 2);
  assert.equal(result.boardWidth, 2260);
  assert.equal(result.rollIncrement, 100);
  assert.equal(result.paperRollWidth, 2300);
  assert.equal(result.paperConsumptionSqm, 2.645);
});

QUnit.test('Uniglory keeps exact 50 mm roll width multiple', function(assert) {
  const result = calculatePaperConsumption('uniglory', 100, 200, 250);

  assert.equal(result.boardWidth, 500);
  assert.equal(result.paperRollWidth, 500);
});

QUnit.test('invalid paper-consumption input returns null', function(assert) {
  assert.strictEqual(calculatePaperConsumption('unknown', 100, 100, 100), null);
  assert.strictEqual(calculatePaperConsumption('epyllion', 0, 100, 100), null);
  assert.strictEqual(calculatePaperConsumption('mu', 100, -1, 100), null);
  assert.strictEqual(calculatePaperConsumption('uniglory', 100, 100, Number.NaN), null);
});
