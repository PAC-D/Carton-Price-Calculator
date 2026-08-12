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
    generateQuoteBtn.disabled = false;

    // Hide quotation section on new selection
    quotationSection.style.display = 'none';
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

    // Show preview (mirror of PDF content)
    quotationPreview.innerHTML =
      '<div style="text-align:center;margin-bottom:16px;">' +
        '<h2 style="color:#1e3a5f;">Packaging Price Quotation</h2>' +
        '<p style="color:#64748b;">' + dateStr + '</p>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">' +
        '<tr><td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;">Packaging Supplier:</td>' +
          '<td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e3a5f;">' + escapeHtml(supplier.name) + '</td></tr>' +
        '<tr><td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;">Factory:</td>' +
          '<td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e3a5f;">' + escapeHtml(factory.name) + '</td></tr>' +
        '<tr><td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;">Rate per SQM:</td>' +
          '<td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#059669;font-size:18px;">$' + factory.rate.toFixed(2) + '</td></tr>' +
      '</table>' +
      '<div style="background:#f8fafc;border-radius:6px;padding:12px;text-align:center;color:#94a3b8;font-size:13px;">' +
        'Detailed cost breakdown will be available in a future update.' +
      '</div>' +
      '<div style="text-align:center;margin-top:16px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px;">' +
        'Generated: ' + timestampStr +
      '</div>';

    quotationSection.style.display = 'block';

    // Scroll to quotation
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
