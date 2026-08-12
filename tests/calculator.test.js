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

QUnit.test('calculatePrice full payload', function(assert) {
  // Mock partial response structure for integration points
  const res = calculatePrice('epyllion', 10, 10, 10, 1, 0.70);
  assert.ok(res.primarkSqm);
  assert.ok(res.supplierSqm);
  assert.ok(res.margin);
});
