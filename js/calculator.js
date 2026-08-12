function calcPrimarkSQM(l, w, h) {
  return ((2 * l + 2 * w + 50) * (w + h) / 1000000) * 1.08;
}

function calcSupplierSQM(formulaId, l, w, h) {
  switch(formulaId) {
    case 'epyllion': return ((l + w + 60) * (w + h + 40) * 2) / 1000000;
    case 'mu': return ((l + 2 * w + 100) * (w + 2 * h + 100)) / 1000000;
    case 'uniglory': return ((l + 2 * w + 100) * (w + 2 * h + 50)) / 1000000;
    default: return 0;
  }
}

function calcMargin(primarkTotal, supplierTotal) {
  return primarkTotal - supplierTotal;
}

function calculatePrice(formulaId, l, w, h, qty, factoryRate) {
  // L/W/H/Qty must be numeric and valid
  if (!l || !w || !h || !qty || l <= 0 || w <= 0 || h <= 0 || qty <= 0) return null;

  const primarkSqm = calcPrimarkSQM(l, w, h);
  const primarkPricePerCarton = primarkSqm * 0.77;
  const primarkTotalPrice = primarkPricePerCarton * qty;

  const supplierSqm = calcSupplierSQM(formulaId, l, w, h);
  const supplierCostPerCarton = supplierSqm * factoryRate;
  const supplierTotalCost = supplierCostPerCarton * qty;

  const margin = calcMargin(primarkTotalPrice, supplierTotalCost);

  return {
    primarkSqm, primarkPricePerCarton, primarkTotalPrice,
    supplierSqm, supplierCostPerCarton, supplierTotalCost,
    margin
  };
}
