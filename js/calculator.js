// Calculator logic per supplier - placeholder for future implementation
// Each supplier will have its own calculation function here.

function calculatePrice(supplierKey, factoryName, inputs) {
  // inputs will be defined per supplier in future phases
  // For now, just return the rate
  const supplier = SUPPLIERS[supplierKey];
  if (!supplier) return null;
  const factory = supplier.factories.find(f => f.name === factoryName);
  if (!factory) return null;
  return { rate: factory.rate };
}
