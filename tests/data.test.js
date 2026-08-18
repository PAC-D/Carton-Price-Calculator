QUnit.module('Data Model');

QUnit.test('CARTON_PRESETS defines 11 exact dimensions', function(assert) {
  assert.ok(window.CARTON_PRESETS, 'Presets array exists');
  assert.equal(window.CARTON_PRESETS.length, 11, 'Has exactly 11 presets');
  assert.equal(CARTON_PRESETS[0].l, 495);
  assert.equal(CARTON_PRESETS[10].h, 500);
});

QUnit.test('SUPPLIERS have correct formula mappings', function(assert) {
  assert.equal(SUPPLIERS.epyllion.formulaId, 'epyllion');
  assert.equal(SUPPLIERS.mu.formulaId, 'mu');
  assert.equal(SUPPLIERS.uniglory.formulaId, 'uniglory');
});

QUnit.test('All factories use FACTORY_SQM_RATE (primark minus 5%)', function(assert) {
  assert.equal(PRIMARK_SQM_RATE, 0.77, 'Primark rate is 0.77');
  assert.ok(Math.abs(FACTORY_SQM_RATE - 0.7315) < 1e-9, 'Factory rate is primark minus 5%');
  Object.keys(SUPPLIERS).forEach(function(key) {
    SUPPLIERS[key].factories.forEach(function(f) {
      assert.equal(f.rate, FACTORY_SQM_RATE, key + ' / ' + f.name + ' uses FACTORY_SQM_RATE');
    });
  });
});