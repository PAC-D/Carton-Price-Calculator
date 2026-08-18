function calcPrimarkSQM(l, w, h) {
  return ((2 * l + 2 * w + 50) * (w + h) / 1000000) * 1.08;
}

function calcSupplierSQM(formulaId, l, w, h) {
  switch(formulaId) {
    case 'union':
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
  const primarkPricePerCarton = primarkSqm * PRIMARK_SQM_RATE;
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

function calculatePaperConsumption(supplierKey, l, w, h) {
  if (!Number.isFinite(l) || !Number.isFinite(w) || !Number.isFinite(h) || l <= 0 || w <= 0 || h <= 0) {
    return null;
  }

  const supplierRules = {
    epyllion: { divide: 1, rollIncrement: 50 },
    ps_union: { divide: 1, rollIncrement: 50 },
    mu: { divide: 2, rollIncrement: 100 },
    uniglory: { divide: 1, rollIncrement: 50 }
  };
  const rule = supplierRules[supplierKey];
  if (!rule) return null;

  const stitching = 100;
  const flutingSpace = 10;
  const cuttingSpace = 40;
  const boardLength = (l + w) * 2;
  const actualLength = boardLength + stitching;
  const width = w + h + flutingSpace;
  const boardWidth = (width * rule.divide) + cuttingSpace;
  const paperRollWidth = Math.ceil(boardWidth / rule.rollIncrement) * rule.rollIncrement;
  const paperConsumptionSqm = (actualLength * paperRollWidth) / 1000000 / rule.divide;

  return {
    boardLength,
    stitching,
    actualLength,
    flutingSpace,
    width,
    divide: rule.divide,
    cuttingSpace,
    boardWidth,
    rollIncrement: rule.rollIncrement,
    paperRollWidth,
    paperConsumptionSqm
  };
}
