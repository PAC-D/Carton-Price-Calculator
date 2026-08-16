function parseCSV(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    rows.push({
      supplier: parts[0].trim(),
      factory: parts[1].trim(),
      price: parseFloat(parts[2])
    });
  }
  return rows;
}

function getSuppliers(rows) {
  return ['All', ...new Set(rows.map(row => row.supplier))];
}

function getFactories(rows) {
  return [...new Set(rows.map(row => row.factory))].sort((a, b) => a.localeCompare(b));
}

function applyFilters(rows, { supplier, factoryText }) {
  const text = (factoryText || '').trim().toLowerCase();
  return rows.filter(row => {
    const okSupplier = supplier === 'All' || row.supplier === supplier;
    const okFactory = text === '' || row.factory.toLowerCase().includes(text);
    return okSupplier && okFactory;
  });
}

function formatPrice(price) {
  return price.toFixed(2);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseCSV, getSuppliers, getFactories, applyFilters, formatPrice };
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    const state = { rows: [] };
    const els = {
      title: document.getElementById('page-title'),
      errorBox: document.getElementById('error-box'),
      supplierFilter: document.getElementById('supplier-filter'),
      factorySelect: document.getElementById('factory-select'),
      factorySearch: document.getElementById('factory-search'),
      rowCount: document.getElementById('row-count'),
      tbody: document.getElementById('price-tbody'),
      exportBtn: document.getElementById('export-pdf')
    };

    fetch('data.csv')
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(text => {
        state.rows = parseCSV(text);
        els.title.textContent = 'Primark Pricing Data Check';
        populateFilters();
        render();
        els.exportBtn.disabled = false;
      })
      .catch(err => {
        els.errorBox.style.display = 'block';
        els.errorBox.textContent = 'Could not load data.csv: ' + err.message +
          ' The app needs a local web server or GitHub Pages (fetch does not work on file://).';
      });

    function populateFilters() {
      els.supplierFilter.innerHTML = getSuppliers(state.rows)
        .map(s => `<option value="${s}">${s}</option>`).join('');
      els.factorySelect.innerHTML = '<option value="">All Factories</option>' +
        getFactories(state.rows)
          .map(f => `<option value="${f}">${f}</option>`).join('');
    }

    function render() {
      const filtered = applyFilters(state.rows, {
        supplier: els.supplierFilter.value,
        factoryText: els.factorySearch.value
      });
      els.rowCount.textContent = `Showing ${filtered.length} of ${state.rows.length} rows`;
      if (filtered.length === 0) {
        els.tbody.innerHTML = '<tr><td colspan="4">No rows match the current filters.</td></tr>';
        return;
      }
      els.tbody.innerHTML = filtered.map((row, i) =>
        `<tr><td class="col-sl">${i + 1}</td><td>${row.supplier}</td><td>${row.factory}</td><td class="col-price">${formatPrice(row.price)}</td></tr>`
      ).join('');
    }

    els.supplierFilter.addEventListener('change', render);
    els.factorySelect.addEventListener('change', render);
    els.factorySearch.addEventListener('input', render);
    els.exportBtn.addEventListener('click', exportPDF);

    async function exportPDF() {
      if (!window.jspdf) {
        alert('PDF library failed to load. Check your internet connection.');
        return;
      }
      const filtered = applyFilters(state.rows, {
        supplier: els.supplierFilter.value,
        factoryText: els.factorySearch.value
      });
      if (filtered.length === 0) {
        alert('Nothing to export — the current filters match no rows.');
        return;
      }
      const sorted = [...filtered].sort((a, b) =>
        a.supplier.localeCompare(b.supplier) || a.factory.localeCompare(b.factory));
      const body = sorted.map((row, i) =>
        [i + 1, row.supplier, row.factory, formatPrice(row.price)]);

      const doc = new window.jspdf.jsPDF();
      const logos = await loadLogos();

      function drawNavbar() {
        if (logos) {
          doc.addImage(logos[0], 'PNG', 14, 8, 36, 12.1);
          doc.addImage(logos[1], 'PNG', 140, 11, 56, 7.6);
        } else {
          doc.setFontSize(12);
          doc.setTextColor(0, 32, 91);
          doc.text('PACD', 14, 16);
          doc.setFontSize(10);
          doc.setTextColor(227, 24, 55);
          doc.text('Primark', 196, 16, { align: 'right' });
        }
        doc.setDrawColor(0, 32, 91);
        doc.setLineWidth(0.8);
        doc.line(14, 22, 196, 22);
      }

      drawNavbar();
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(227, 24, 55);
      doc.text('Carton Price for Factory', 14, 31);
      doc.setFont('helvetica', 'normal');

      doc.autoTable({
        startY: 36,
        margin: { top: 26 },
        head: [['SL', 'Packaging Supplier', 'Factory', 'Price SQM (US $)']],
        body: body,
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [0, 32, 91] },
        columnStyles: {
          0: { cellWidth: 12 },
          3: { halign: 'right', cellWidth: 30 }
        },
        willDrawPage: function (data) {
          if (data.pageNumber > 1) drawNavbar();
        },
        didDrawPage: function (data) {
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text('PACD © 2026', 14, 290);
          doc.setTextColor(0, 0, 0);
          doc.text('Page ' + data.pageNumber, 198, 290, { align: 'right' });
        }
      });
      doc.save('primark-pricing-' + new Date().toISOString().slice(0, 10) + '.pdf');
    }

    function loadImageAsDataURL(src) {
      return new Promise(function (resolve, reject) {
        const img = new Image();
        img.onload = function () {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = reject;
        img.src = src;
      });
    }

    async function loadLogos() {
      try {
        return await Promise.all([
          loadImageAsDataURL('../pacd.png'),
          loadImageAsDataURL('../assets/primark-logo.png')
        ]);
      } catch (e) {
        return null;
      }
    }
  }
}
