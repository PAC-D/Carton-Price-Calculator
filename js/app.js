document.addEventListener('DOMContentLoaded', function() {
  // State
  let currentSupplier = null;
  let currentFactory = null;
  let currentPaperConsumption = null;

  // DOM references
  const supplierSelect = document.getElementById('packaging-supplier');
  const factorySection = document.getElementById('factory-section');
  const factorySearch = document.getElementById('factory-search');
  const factoryTbody = document.getElementById('factory-tbody');
  const rateSection = document.getElementById('rate-section');
  const selectedSupplierEl = document.getElementById('selected-supplier');
  const selectedFactoryEl = document.getElementById('selected-factory');
  const selectedRateEl = document.getElementById('selected-rate');
  const exportPdfBtn = document.getElementById('export-pdf-btn');

  const presetSelect = document.getElementById('carton-preset');
  const customDims = document.getElementById('custom-dims');
  const inL = document.getElementById('custom-l');
  const inW = document.getElementById('custom-w');
  const inH = document.getElementById('custom-h');
  const inQty = document.getElementById('carton-qty');

  const calcInstruction = document.getElementById('calc-instruction');
  const calcResults = document.getElementById('calc-results');
  const paperConsumptionCard = document.getElementById('paper-consumption-card');
  const paperBoardLength = document.getElementById('paper-board-length');
  const paperStitching = document.getElementById('paper-stitching');
  const paperActualLength = document.getElementById('paper-actual-length');
  const paperFlutingSpace = document.getElementById('paper-fluting-space');
  const paperWidth = document.getElementById('paper-width');
  const paperDivide = document.getElementById('paper-divide');
  const paperCuttingSpace = document.getElementById('paper-cutting-space');
  const paperBoardWidth = document.getElementById('paper-board-width');
  const paperRollWidth = document.getElementById('paper-roll-width');
  const paperConsumptionSqm = document.getElementById('paper-consumption-sqm');

  // Populate preset options BEFORE adding listeners
  CARTON_PRESETS.forEach(preset => {
    let opt = document.createElement('option');
    opt.value = preset.id;
    opt.textContent = preset.label;
    presetSelect.insertBefore(opt, presetSelect.lastElementChild);
  });

  presetSelect.addEventListener('change', function() {
    if (this.value === 'custom') {
      customDims.style.display = 'grid';
      inL.value = ''; inW.value = ''; inH.value = '';
    } else {
      customDims.style.display = 'none';
      if (this.value) {
        const p = CARTON_PRESETS.find(x => x.id === this.value);
        inL.value = p.l; inW.value = p.w; inH.value = p.h;
      } else {
        inL.value = ''; inW.value = ''; inH.value = '';
      }
    }
    runCalculation();
  });

  ['input', 'change'].forEach(evt => {
    inL.addEventListener(evt, runCalculation);
    inW.addEventListener(evt, runCalculation);
    inH.addEventListener(evt, runCalculation);
    inQty.addEventListener(evt, runCalculation);
  });

  // Supplier dropdown change
  supplierSelect.addEventListener('change', function() {
    const supplierKey = this.value;
    if (supplierKey) {
      selectSupplier(supplierKey);
    } else {
      // Reset when "Select Supplier" chosen
      currentSupplier = null;
      currentFactory = null;
      factorySection.style.display = 'none';
      rateSection.style.display = 'none';
      exportPdfBtn.disabled = true;
      runCalculation();
    }
  });

  function selectSupplier(supplierKey) {
    currentSupplier = supplierKey;
    currentFactory = null;

    factorySection.style.display = 'block';
    rateSection.style.display = 'none';
    exportPdfBtn.disabled = true;

    factorySearch.value = '';
    renderFactories(supplierKey, '');
    runCalculation();
  }

  // Factory search
  factorySearch.addEventListener('input', function() {
    if (currentSupplier) {
      renderFactories(currentSupplier, factorySearch.value);
    }
  });

  function renderFactories(supplierKey, filterText) {
    const supplier = SUPPLIERS[supplierKey];
    if (!supplier) return;

    const filter = filterText.toLowerCase().trim();
    const filtered = supplier.factories.filter(function(f) {
      return f.name.toLowerCase().includes(filter);
    });

    factoryTbody.innerHTML = '';

    if (filtered.length === 0) {
      var row = document.createElement('tr');
      row.innerHTML = '<td colspan="2" style="text-align:center;color:#94a3b8;padding:20px;">No matching factories found.</td>';
      factoryTbody.appendChild(row);
      return;
    }

    filtered.forEach(function(factory) {
      var row = document.createElement('tr');
      if (currentFactory && factory.name === currentFactory) {
        row.classList.add('selected');
      }
      row.innerHTML =
        '<td>' + escapeHtml(factory.name) + '</td>' +
        '<td class="rate-cell">$' + factory.rate.toFixed(2) + '</td>';
      row.addEventListener('click', function() {
        selectFactory(factory.name);
      });
      factoryTbody.appendChild(row);
    });
  }

  function selectFactory(factoryName) {
    currentFactory = factoryName;
    var supplier = SUPPLIERS[currentSupplier];
    var factory = supplier.factories.find(function(f) { return f.name === factoryName; });

    renderFactories(currentSupplier, factorySearch.value);

    rateSection.style.display = 'block';
    selectedSupplierEl.textContent = supplier.name;
    selectedFactoryEl.textContent = factory.name;
    selectedRateEl.textContent = '$' + factory.rate.toFixed(2);

    runCalculation();
  }

  function runCalculation() {
    exportPdfBtn.disabled = true;
    calcResults.classList.remove('show');
    calcInstruction.style.display = 'block';
    currentPaperConsumption = null;
    paperConsumptionCard.style.display = 'none';

    if (!currentSupplier || !currentFactory) return;

    let l = parseFloat(inL.value);
    let w = parseFloat(inW.value);
    let h = parseFloat(inH.value);
    let qty = parseInt(inQty.value, 10);

    if (!l || !w || !h || !qty || l <= 0 || w <= 0 || h <= 0 || qty <= 0) return;

    let supplier = SUPPLIERS[currentSupplier];
    let factory = supplier.factories.find(f => f.name === currentFactory);

    // Perform calculation
    let results = calculatePrice(supplier.formulaId, l, w, h, qty, factory.rate);
    if (!results) return;

    currentPaperConsumption = calculatePaperConsumption(currentSupplier, l, w, h);
    if (currentPaperConsumption) {
      paperBoardLength.textContent = currentPaperConsumption.boardLength + ' mm';
      paperStitching.textContent = currentPaperConsumption.stitching + ' mm';
      paperActualLength.textContent = currentPaperConsumption.actualLength + ' mm';
      paperFlutingSpace.textContent = currentPaperConsumption.flutingSpace + ' mm';
      paperWidth.textContent = currentPaperConsumption.width + ' mm';
      paperDivide.textContent = currentPaperConsumption.divide;
      paperCuttingSpace.textContent = currentPaperConsumption.cuttingSpace + ' mm';
      paperBoardWidth.textContent = currentPaperConsumption.boardWidth + ' mm';
      paperRollWidth.textContent = currentPaperConsumption.paperRollWidth + ' mm';
      paperConsumptionSqm.textContent = currentPaperConsumption.paperConsumptionSqm.toFixed(4) + ' SQM';
      paperConsumptionCard.style.display = 'block';
    }

    // Display updates
    document.getElementById('res-supp-sqm').textContent = results.supplierSqm.toFixed(4) + ' SQM';
    document.getElementById('res-supp-cost').textContent = '$' + results.supplierCostPerCarton.toFixed(2);
    document.getElementById('res-supp-total').textContent = '$' + results.supplierTotalCost.toFixed(2);

    document.getElementById('res-prim-sqm').textContent = results.primarkSqm.toFixed(4) + ' SQM';
    document.getElementById('res-prim-cost').textContent = '$' + results.primarkPricePerCarton.toFixed(2);
    document.getElementById('res-prim-total').textContent = '$' + results.primarkTotalPrice.toFixed(2);

    let elMargin = document.getElementById('res-margin');
    elMargin.textContent = '$' + results.margin.toFixed(2);
    elMargin.className = 'result-value ' + (results.margin >= 0 ? 'text-positive' : 'text-negative');

    // UI toggle
    calcInstruction.style.display = 'none';
    calcResults.classList.add('show');
    exportPdfBtn.disabled = false;
  }

  // Export PDF
  exportPdfBtn.addEventListener('click', function() {
    if (!currentSupplier || !currentFactory) return;

    var supplier = SUPPLIERS[currentSupplier];
    var factory = supplier.factories.find(function(f) { return f.name === currentFactory; });

    var presetLabel = presetSelect.value === 'custom'
      ? 'Custom Dimensions'
      : (presetSelect.selectedOptions[0] ? presetSelect.selectedOptions[0].textContent : '');

    var printData = {
      supplier: {
        supplierKey: currentSupplier,
        supplierName: supplier.name,
        factoryName: factory.name,
        ratePerSqm: '$' + factory.rate.toFixed(2)
      },
      calc: {
        presetLabel: presetLabel,
        l: inL.value,
        w: inW.value,
        h: inH.value,
        qty: inQty.value
      },
      results: {
        supplierSqm: document.getElementById('res-supp-sqm').textContent,
        supplierCostPerCarton: document.getElementById('res-supp-cost').textContent,
        supplierTotalCost: document.getElementById('res-supp-total').textContent,
        primarkSqm: document.getElementById('res-prim-sqm').textContent,
        primarkCostPerCarton: document.getElementById('res-prim-cost').textContent,
        primarkTotalPrice: document.getElementById('res-prim-total').textContent,
        margin: document.getElementById('res-margin').textContent
      },
      paper: null
    };

    if (currentPaperConsumption) {
      printData.paper = {
        boardLength: currentPaperConsumption.boardLength + ' mm',
        stitching: currentPaperConsumption.stitching + ' mm',
        actualLength: currentPaperConsumption.actualLength + ' mm',
        flutingSpace: currentPaperConsumption.flutingSpace + ' mm',
        width: currentPaperConsumption.width + ' mm',
        divide: currentPaperConsumption.divide,
        cuttingSpace: currentPaperConsumption.cuttingSpace + ' mm',
        boardWidth: currentPaperConsumption.boardWidth + ' mm',
        paperRollWidth: currentPaperConsumption.paperRollWidth + ' mm',
        paperConsumptionSqm: currentPaperConsumption.paperConsumptionSqm.toFixed(4) + ' SQM'
      };
    }

    window.localStorage.setItem('cartonPrintData', JSON.stringify(printData));
    window.open('pdf_export.html', '_blank');
  });

  // Utility: escape HTML to prevent XSS
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // Render Lucide icons (loads after DOMContentLoaded on slow networks)
  if (window.lucide && lucide.createIcons) {
    lucide.createIcons();
  }
});
