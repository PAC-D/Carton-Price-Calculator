function calcPrimarkSQM(l, w, h) {
  return ((2 * l + 2 * w + 50) * (w + h) / 1000000) * 1.08;
}

function calcEpyllionSQM(l, w, h) {
  return ((l + w + 60) * (w + h + 40) * 2) / 1000000;
}

function calcMuSQM(l, w, h) {
  const AL = (l + w) * 2 + 100;
  const BW = w + h + 10;
  const D = Math.floor((2300 - 40) / BW);
  const val = BW * D + 40;
  const rounded = Math.ceil(val / 100) * 100;
  return (AL * rounded) / 1000000 / D;
}

function calcUniglorySQM(l, w, h) {
  const AL = (l + w) * 2 + 100;
  const BW = w + h + 10;
  const D = Math.floor((1600 - 40) / BW);
  const RW = BW * D + 40;
  let rounded;
  if (RW <= 1000) rounded = Math.ceil(RW / 100) * 100;
  else rounded = Math.ceil(RW / 50) * 50;
  return (AL * rounded) / 1000000 / D;
}

function calcSupplierSQM(supplier, l, w, h) {
  if (supplier === 'M&U Packaging Ltd') return calcMuSQM(l, w, h);
  if (supplier === 'Uniglory Paper & Packaging') return calcUniglorySQM(l, w, h);
  return calcEpyllionSQM(l, w, h);
}

function splitCSVLine(line) {
  const parts = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') inQuotes = false;
      else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = splitCSVLine(lines[i]);
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

function formatArea(area) {
  return area.toFixed(4);
}

function sortRows(rows) {
  return [...rows].sort((a, b) =>
    a.supplier.localeCompare(b.supplier) || a.factory.localeCompare(b.factory));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCSV, getSuppliers, getFactories, applyFilters, formatPrice, sortRows,
    calcPrimarkSQM, calcSupplierSQM, calcMuSQM, calcUniglorySQM, calcEpyllionSQM
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    const state = { rows: [], dims: { l: 500, w: 300, h: 300 } };
    const els = {
      title: document.getElementById('page-title'),
      errorBox: document.getElementById('error-box'),
      supplierFilter: document.getElementById('supplier-filter'),
      factorySelect: document.getElementById('factory-select'),
      factorySearch: document.getElementById('factory-search'),
      dimL: document.getElementById('dim-l'),
      dimW: document.getElementById('dim-w'),
      dimH: document.getElementById('dim-h'),
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
        .map(s => '<option value="' + s + '">' + s + '</option>').join('');
      els.factorySelect.innerHTML = '<option value="">All Factories</option>' +
        getFactories(state.rows)
          .map(f => '<option value="' + f + '">' + f + '</option>').join('');
    }

    function readDims() {
      const l = parseFloat(els.dimL.value);
      const w = parseFloat(els.dimW.value);
      const h = parseFloat(els.dimH.value);
      if (l > 0 && w > 0 && h > 0) state.dims = { l, w, h };
      return state.dims;
    }

    function render() {
      const { l, w, h } = readDims();
      const primarkArea = calcPrimarkSQM(l, w, h);
      const filtered = sortRows(applyFilters(state.rows, {
        supplier: els.supplierFilter.value,
        factoryText: els.factorySearch.value
      }));
      els.rowCount.textContent = 'Showing ' + filtered.length + ' of ' + state.rows.length + ' rows';
      if (filtered.length === 0) {
        els.tbody.innerHTML = '<tr><td colspan="5">No rows match the current filters.</td></tr>';
        return;
      }
      els.tbody.innerHTML = filtered.map(function(row, i) {
        const supplierArea = calcSupplierSQM(row.supplier, l, w, h);
        const primarkSqm = row.price * (primarkArea / supplierArea);
        return '<tr>' +
          '<td class="col-sl">' + (i + 1) + '</td>' +
          '<td>' + row.supplier + '</td>' +
          '<td>' + row.factory + '</td>' +
          '<td class="price-col">' + formatPrice(row.price) + '</td>' +
          '<td class="price-col">' + formatPrice(primarkSqm) + '</td>' +
          '</tr>';
      }).join('');
    }

    els.supplierFilter.addEventListener('change', render);
    els.factorySelect.addEventListener('change', function() {
      els.factorySearch.value = els.factorySelect.value;
      render();
    });
    els.factorySearch.addEventListener('input', function() {
      els.factorySelect.value = '';
      render();
    });
    [els.dimL, els.dimW, els.dimH].forEach(function(el) { el.addEventListener('input', render); });
    els.exportBtn.addEventListener('click', exportPDF);

    async function exportPDF() {
      if (!window.jspdf) {
        alert('PDF library failed to load. Check your internet connection.');
        return;
      }
      const { l, w, h } = readDims();
      const filtered = applyFilters(state.rows, {
        supplier: els.supplierFilter.value,
        factoryText: els.factorySearch.value
      });
      if (filtered.length === 0) {
        alert('Nothing to export — the current filters match no rows.');
        return;
      }
      const sorted = sortRows(filtered);
      const primarkArea = calcPrimarkSQM(l, w, h);
      const body = sorted.map(function(row, i) {
        const supplierArea = calcSupplierSQM(row.supplier, l, w, h);
        const primarkSqm = row.price * (primarkArea / supplierArea);
        return [i + 1, row.supplier, row.factory, formatPrice(row.price),
          formatPrice(primarkSqm)];
      });

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
      doc.setTextColor(0, 32, 91);
      doc.text('Primark Pricing Data Check', 14, 31);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Carton ' + l + ' x ' + w + ' x ' + h + '  |  Generated on ' +
        new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), 14, 36);

      doc.autoTable({
        startY: 40,
        margin: { top: 26 },
        head: [['SL', 'Packaging Supplier', 'Factory', 'Price SQM (US $)',
          'Primark SQM (US $)']],
        body: body,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 32, 91] },
        columnStyles: {
          0: { cellWidth: 10 },
          3: { halign: 'right', cellWidth: 24 },
          4: { halign: 'right', cellWidth: 24 }
        },
        willDrawPage: function (data) {
          if (data.pageNumber > 1) drawNavbar();
        },
        didDrawPage: function (data) {
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text('PACD 2026', 14, 290);
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
