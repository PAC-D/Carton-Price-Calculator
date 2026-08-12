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