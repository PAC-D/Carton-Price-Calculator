document.addEventListener('DOMContentLoaded', function() {
  // State
  let currentSupplier = null;
  let currentFactory = null;

  // DOM references
  const supplierTabs = document.getElementById('supplier-tabs');
  const factorySection = document.getElementById('factory-section');
  const factorySearch = document.getElementById('factory-search');
  const factoryTbody = document.getElementById('factory-tbody');
  const rateSection = document.getElementById('rate-section');
  const selectedSupplierEl = document.getElementById('selected-supplier');
  const selectedFactoryEl = document.getElementById('selected-factory');
  const selectedRateEl = document.getElementById('selected-rate');
  const generateQuoteBtn = document.getElementById('generate-quote-btn');
  const quotationSection = document.getElementById('quotation-section');
  const quotationPreview = document.getElementById('quotation-preview');
  const downloadPdfBtn = document.getElementById('download-pdf-btn');

  const presetSelect = document.getElementById('carton-preset');
  const customDims = document.getElementById('custom-dims');
  const inL = document.getElementById('custom-l');
  const inW = document.getElementById('custom-w');
  const inH = document.getElementById('custom-h');
  const inQty = document.getElementById('carton-qty');
  
  const calcInstruction = document.getElementById('calc-instruction');
  const calcResults = document.getElementById('calc-results');
  
  // Populate preset options BEFORE adding listeners
  CARTON_PRESETS.forEach(preset => {
    let opt = document.createElement('option');
    opt.value = preset.id;
    opt.textContent = preset.label;
    presetSelect.insertBefore(opt, presetSelect.lastElementChild);
  });

  presetSelect.addEventListener('change', function() {
    if (this.value === 'custom') {
      customDims.style.display = 'flex';
      inL.value = ''; inW.value = ''; inH.value = ''; // clear previous
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

  // Supplier tab click
  supplierTabs.addEventListener('click', function(e) {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const supplierKey = btn.dataset.supplier;
    selectSupplier(supplierKey);
  });

  function selectSupplier(supplierKey) {
    currentSupplier = supplierKey;
    currentFactory = null;

    // Update tab active state
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.supplier === supplierKey);
    });

    // Show factory section, hide later sections
    factorySection.style.display = 'block';
    rateSection.style.display = 'none';
    quotationSection.style.display = 'none';
    generateQuoteBtn.disabled = true;

    // Clear search and render factories
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

    // Update selected row highlight
    renderFactories(currentSupplier, factorySearch.value);

    // Show rate section
    rateSection.style.display = 'block';
    selectedSupplierEl.textContent = supplier.name;
    selectedFactoryEl.textContent = factory.name;
    selectedRateEl.textContent = '$' + factory.rate.toFixed(2);

    // Enable generate button
    runCalculation();

    // Hide quotation section on new selection
    quotationSection.style.display = 'none';
  }

  function runCalculation() {
    // defaults
    generateQuoteBtn.disabled = true;
    calcResults.style.display = 'none';
    calcInstruction.style.display = 'block';

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

    // Display updates
    document.getElementById('res-supp-sqm').textContent = results.supplierSqm.toFixed(4) + ' SQM';
    document.getElementById('res-supp-cost').textContent = '$' + results.supplierCostPerCarton.toFixed(2);
    document.getElementById('res-supp-total').textContent = '$' + results.supplierTotalCost.toFixed(2);

    document.getElementById('res-prim-sqm').textContent = results.primarkSqm.toFixed(4) + ' SQM';
    document.getElementById('res-prim-cost').textContent = '$' + results.primarkPricePerCarton.toFixed(2);
    document.getElementById('res-prim-total').textContent = '$' + results.primarkTotalPrice.toFixed(2);

    let elMargin = document.getElementById('res-margin');
    elMargin.textContent = '$' + results.margin.toFixed(2);
    elMargin.className = 'margin-value ' + (results.margin >= 0 ? 'text-positive' : 'text-negative');

    // UI toggle
    calcInstruction.style.display = 'none';
    calcResults.style.display = 'block';
    generateQuoteBtn.disabled = false;
  }

  // Generate quotation
  generateQuoteBtn.addEventListener('click', function() {
    if (!currentSupplier || !currentFactory) return;

    var supplier = SUPPLIERS[currentSupplier];
    var factory = supplier.factories.find(function(f) { return f.name === currentFactory; });

    var now = new Date();
    var dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    var timestampStr = now.toLocaleString('en-US');

    // Update PDF hidden template
    document.getElementById('pdf-date').textContent = dateStr;
    document.getElementById('pdf-supplier').textContent = supplier.name;
    document.getElementById('pdf-factory').textContent = factory.name;
    document.getElementById('pdf-rate').textContent = '$' + factory.rate.toFixed(2) + ' per SQM';
    document.getElementById('pdf-timestamp').textContent = timestampStr;

    // Calc payload read directly from UI
    let L = inL.value, W = inW.value, H = inH.value, QTY = inQty.value;
    document.getElementById('pdf-dims').textContent = L + ' x ' + W + ' x ' + H;
    document.getElementById('pdf-qty').textContent = QTY;
    
    document.getElementById('pdf-supp-sqm').textContent = document.getElementById('res-supp-sqm').textContent;
    document.getElementById('pdf-supp-rate-display').textContent = '$' + factory.rate.toFixed(2);
    document.getElementById('pdf-supp-cost').textContent = document.getElementById('res-supp-cost').textContent;
    document.getElementById('pdf-supp-tot').textContent = document.getElementById('res-supp-total').textContent;

    document.getElementById('pdf-prim-sqm').textContent = document.getElementById('res-prim-sqm').textContent;
    document.getElementById('pdf-prim-cost').textContent = document.getElementById('res-prim-cost').textContent;
    document.getElementById('pdf-prim-tot').textContent = document.getElementById('res-prim-total').textContent;
    
    document.getElementById('pdf-margin').textContent = document.getElementById('res-margin').textContent;
    
    // Toggle block
    document.getElementById('pdf-calc-section').style.display = 'block';
    
    // Show preview (No exact mirrored HTML copy needed since pdfContent is styled for view)
    quotationPreview.innerHTML = document.getElementById('pdf-content').innerHTML;
    // Fix IDs in the clone for safely stripping duplication (just clear them)
    quotationPreview.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

    quotationSection.style.display = 'block';
    quotationSection.scrollIntoView({ behavior: 'smooth' });
  });

  // Download PDF
  downloadPdfBtn.addEventListener('click', function() {
    generatePDF();
  });

  // Utility: escape HTML to prevent XSS
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }
});
