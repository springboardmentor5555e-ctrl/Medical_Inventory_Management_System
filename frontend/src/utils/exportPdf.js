import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─────────────────────────────────────────────────────────────────────────────
   Brand Colour Palette (Clean Light Theme - RGB)
───────────────────────────────────────────────────────────────────────────── */
const C = {
  primary:      [2,   132, 199], // sky-600
  primaryDark:  [3,   105, 161], // sky-700
  primaryDeep:  [12,  74,  110], // sky-900
  primaryLight: [240, 249, 255], // sky-50
  emerald:      [16,  185, 129], // emerald-500
  emeraldDark:  [5,   150, 105], // emerald-600
  emeraldLight: [236, 253, 245], // emerald-50
  amber:        [217, 119, 6],   // amber-600
  amberLight:   [254, 243, 199], // amber-50
  rose:         [225, 29,  72],  // rose-600
  roseLight:    [255, 241, 242], // rose-50
  red:          [220, 38,  38],  // red-600
  bgPage:       [255, 255, 255], // pure white
  bgCard:       [248, 250, 252], // slate-50
  bgCardLight:  [241, 245, 249], // slate-100
  border:       [226, 232, 240], // slate-200
  borderDark:   [203, 213, 225], // slate-300
  white:        [255, 255, 255],
  textPrimary:  [15,  23,  42],  // slate-900
  textSecondary:[51,  65,  85],  // slate-700
  textMuted:    [100, 116, 139], // slate-500
};

/* ── helpers ─────────────────────────────────────────────────────────────── */
const setFill   = (doc, c) => doc.setFillColor(...c);
const setStroke = (doc, c) => doc.setDrawColor(...c);
const setFont   = (doc, c) => doc.setTextColor(...c);

function fmtCurrency(val) {
  if (!val && val !== 0) return '—';
  if (val >= 1_000_000) return `Rs.${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000)     return `Rs.${(val / 1_000).toFixed(2)}K`;
  return `Rs.${Number(val).toFixed(2)}`;
}

function daysUntil(dateStr) {
  if (!dateStr) return 0;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function shortDate(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtTimestamp(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT = PAGE_W - MARGIN * 2;

function addPage(doc) {
  doc.addPage();
  setFill(doc, C.bgPage);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  return MARGIN + 4;
}

function ensureSpace(doc, currentY, requiredHeight) {
  if (currentY + requiredHeight > PAGE_H - MARGIN - 12) {
    return addPage(doc);
  }
  return currentY;
}

function sectionTitle(doc, y, title, num) {
  y = ensureSpace(doc, y, 16);
  setFill(doc, C.primary);
  doc.roundedRect(MARGIN, y, 3, 7, 1, 1, 'F');
  setFont(doc, C.textPrimary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${num}  ${title}`, MARGIN + 6, y + 5.5);
  setStroke(doc, C.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 9, PAGE_W - MARGIN, y + 9);
  return y + 13;
}

function statBox(doc, x, y, w, h, label, value, color) {
  setFill(doc, C.bgCard);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');
  setStroke(doc, C.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 3, 3, 'D');

  setFill(doc, color);
  doc.roundedRect(x, y, w, 2.5, 1, 1, 'F');
  setFont(doc, C.textPrimary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(String(value), x + w / 2, y + h / 2 + 1, { align: 'center' });
  setFont(doc, C.textMuted);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x + w / 2, y + h - 3, { align: 'center' });
}

function progressBar(doc, x, y, w, h, pct, fillColor, bgColor = C.bgCardLight) {
  setFill(doc, bgColor);
  doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
  if (pct > 0) {
    setFill(doc, fillColor);
    doc.roundedRect(x, y, Math.max(w * (pct / 100), h), h, h / 2, h / 2, 'F');
  }
}

function addFooter(doc, pageNum, total, generatedAt) {
  const y = PAGE_H - 8;
  setStroke(doc, C.border);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y - 3, PAGE_W - MARGIN, y - 3);
  setFont(doc, C.textMuted);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('MediStock — Confidential Medical Inventory Intelligence', MARGIN, y);
  doc.text(`Generated: ${generatedAt}`, PAGE_W / 2, y, { align: 'center' });
  doc.text(`Page ${pageNum} of ${total}`, PAGE_W - MARGIN, y, { align: 'right' });
}

/* ── COVER PAGE ──────────────────────────────────────────────────────────── */
function drawCoverPage(doc, generatedAt) {
  setFill(doc, C.bgPage);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // Top Banner (92mm height)
  setFill(doc, C.primaryDeep);
  doc.rect(0, 0, PAGE_W, 70, 'F');
  setFill(doc, C.primary);
  doc.rect(0, 68, PAGE_W, 20, 'F');

  // Logo Circle
  setFill(doc, C.white);
  doc.circle(PAGE_W / 2, 28, 14, 'F');
  setFont(doc, C.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('M', PAGE_W / 2, 34, { align: 'center' });

  // Main Title inside Banner
  setFont(doc, C.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MediStock', PAGE_W / 2, 54, { align: 'center' });

  // Subtitle inside Banner
  setFont(doc, [224, 242, 254]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Medical Inventory Management System', PAGE_W / 2, 62, { align: 'center' });

  // Tagline on sky band
  setFont(doc, C.white);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPREHENSIVE AUDIT & INVENTORY INTELLIGENCE REPORT', PAGE_W / 2, 80, { align: 'center' });

  // Report Timestamp Box
  let y = 100;
  setFill(doc, C.bgCard);
  doc.roundedRect(MARGIN, y, CONTENT, 16, 3, 3, 'F');
  setStroke(doc, C.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, y, CONTENT, 16, 3, 3, 'D');

  setFont(doc, C.textMuted);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL RECORD EXTRACT', PAGE_W / 2, y + 6, { align: 'center' });
  setFont(doc, C.textPrimary);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Generated On: ${generatedAt}`, PAGE_W / 2, y + 12, { align: 'center' });

  // Metadata Grid (2x2)
  const meta = [
    { label: 'CLASSIFICATION', value: 'CONFIDENTIAL / MEDICAL AUDIT' },
    { label: 'DATA SCOPE',     value: 'FULL INVENTORY & AUDIT LOGS' },
    { label: 'SYSTEM VERSION', value: 'MEDISTOCK ENTERPRISE v2.0' },
    { label: 'HORIZON',        value: '90 DAYS (3 MONTHS) EXPIRY' },
  ];
  y = 124;
  meta.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const mx = MARGIN + col * (CONTENT / 2 + 2);
    const my = y + row * 16;
    const mw = CONTENT / 2 - 2;

    setFill(doc, C.bgCard);
    doc.roundedRect(mx, my, mw, 13, 2, 2, 'F');
    setStroke(doc, C.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(mx, my, mw, 13, 2, 2, 'D');

    setFont(doc, C.textMuted);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(m.label, mx + 4, my + 4.5);
    setFont(doc, C.textPrimary);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(m.value, mx + 4, my + 10);
  });

  // Table of Contents Box
  y = 164;
  setFont(doc, C.textPrimary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TABLE OF CONTENTS', MARGIN, y);
  setStroke(doc, C.border);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y + 3, PAGE_W - MARGIN, y + 3);

  const sections = [
    '01  Executive Summary — Inventory KPIs',
    '02  Category Breakdown',
    '03  Supplier Distribution',
    '04  Stock Movement Analytics',
    '05  7-Day Daily Movement Trend',
    '06  Critical Low-Stock Alert',
    '07  Expiry Timeline (Next 90 Days)',
    '08  Stock Adjustment Audit Log',
  ];
  sections.forEach((s, i) => {
    const ty = y + 8 + i * 8.5;
    setFill(doc, i % 2 === 0 ? C.bgCard : C.bgPage);
    doc.rect(MARGIN, ty - 3.5, CONTENT, 7.5, 'F');
    setFont(doc, C.textSecondary);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(s, MARGIN + 4, ty + 1);
  });

  setFont(doc, C.textMuted);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'This report contains real-time data exported directly from the MediStock verified database.',
    PAGE_W / 2, PAGE_H - 14, { align: 'center' },
  );
}

/* ── SECTION 1: Executive Summary ────────────────────────────────────────── */
function drawSummary(doc, analytics, startY) {
  let y = sectionTitle(doc, startY, 'Executive Summary — Inventory KPIs', '01');

  const stats = [
    { label: 'Total Medicines',   value: analytics?.totalMedicines  ?? 0, color: C.primary },
    { label: 'Low Stock (<=10)',  value: analytics?.lowStockCount   ?? 0, color: C.amber   },
    { label: 'Expiring <=90 Days',value: analytics?.expiringCount   ?? 0, color: C.rose    },
    { label: 'Expired',           value: analytics?.expiredCount    ?? 0, color: C.red     },
    { label: 'Inventory Value',   value: fmtCurrency(analytics?.totalInventoryValue ?? 0), color: C.emerald },
  ];
  const bw = (CONTENT - 4 * 3) / 5;
  stats.forEach((s, i) => statBox(doc, MARGIN + i * (bw + 3), y, bw, 24, s.label, s.value, s.color));
  y += 28;

  // Insight tiles
  const net = (analytics?.totalStockIn ?? 0) - (analytics?.totalStockOut ?? 0);
  const insights = [
    { label: 'Total Stock IN',      value: (analytics?.totalStockIn  ?? 0).toLocaleString(), color: C.emerald },
    { label: 'Total Stock OUT',     value: (analytics?.totalStockOut ?? 0).toLocaleString(), color: C.rose    },
    { label: 'Net Stock Change',    value: (net >= 0 ? '+' : '') + net,                      color: net >= 0 ? C.emerald : C.rose },
    { label: 'Total Movements',     value: ((analytics?.totalStockIn ?? 0) + (analytics?.totalStockOut ?? 0)).toLocaleString(), color: C.primary },
  ];
  const iw = (CONTENT - 3 * 4) / 4;
  insights.forEach((ins, i) => {
    const ix = MARGIN + i * (iw + 4);
    setFill(doc, C.bgCard);
    doc.roundedRect(ix, y, iw, 16, 2, 2, 'F');
    setStroke(doc, C.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(ix, y, iw, 16, 2, 2, 'D');

    setFill(doc, ins.color);
    doc.roundedRect(ix, y + 13.5, iw, 2.5, 1, 1, 'F');
    setFont(doc, C.textMuted);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(ins.label, ix + iw / 2, y + 5.5, { align: 'center' });
    setFont(doc, C.textPrimary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(ins.value, ix + iw / 2, y + 11, { align: 'center' });
  });

  return y + 22;
}

/* ── SECTION 2: Category Breakdown ──────────────────────────────────────── */
function drawCategories(doc, analytics, startY) {
  let y = sectionTitle(doc, startY, 'Category Breakdown', '02');
  const cats = analytics?.categoryBreakdown || [];
  if (!cats.length) {
    setFont(doc, C.textMuted); doc.setFontSize(8);
    doc.text('No category data available.', MARGIN, y + 4);
    return y + 12;
  }
  const COLS = [
    [2,132,199],[79,70,229],[16,185,129],[217,119,6],[225,29,72],
    [147,51,234],[8,145,178],[202,138,4],[5,150,105],[220,38,38],
  ];
  const max = Math.max(...cats.map(c => c.count), 1);
  const rowH = 7.5;
  const barAreaW = 80;
  const labelW   = 55;

  cats.forEach((cat, i) => {
    y = ensureSpace(doc, y, rowH + 2);
    const pct   = (cat.count / max) * 100;
    const color = COLS[i % COLS.length];

    if (i % 2 === 0) {
      setFill(doc, C.bgCard);
      doc.roundedRect(MARGIN, y - 1, CONTENT, rowH, 1.5, 1.5, 'F');
    }
    setFill(doc, color);
    doc.circle(MARGIN + 3, y + 2.5, 2, 'F');
    setFont(doc, C.textPrimary);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(cat.categoryName, MARGIN + 8, y + 3.8);
    progressBar(doc, MARGIN + labelW, y + 1.2, barAreaW, 3.5, pct, color);
    setFont(doc, C.textPrimary);
    doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text(String(cat.count), MARGIN + labelW + barAreaW + 5, y + 3.8);
    setFont(doc, C.textMuted);
    doc.setFontSize(6); doc.setFont('helvetica', 'normal');
    doc.text(`${pct.toFixed(0)}%`, MARGIN + labelW + barAreaW + 16, y + 3.8);
    y += rowH + 1;
  });

  return y + 6;
}

/* ── SECTION 3: Supplier Distribution ───────────────────────────────────── */
function drawSuppliers(doc, analytics, startY) {
  let y = sectionTitle(doc, startY, 'Supplier Distribution', '03');
  const sups = analytics?.supplierBreakdown || [];
  if (!sups.length) {
    setFont(doc, C.textMuted); doc.setFontSize(8);
    doc.text('No supplier data available.', MARGIN, y + 4);
    return y + 12;
  }
  const COLS = [[2,132,199],[79,70,229],[16,185,129],[217,119,6],[225,29,72],[8,145,178]];
  const total  = sups.reduce((s, r) => s + r.count, 0) || 1;
  const maxCnt = Math.max(...sups.map(s => s.count), 1);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['#', 'Supplier Name', 'Medicines Count', 'Catalogue Share', 'Proportion Bar']],
    body: sups.map((s, i) => [i+1, s.supplierName, s.count, `${((s.count/total)*100).toFixed(1)}%`, '']),
    theme: 'plain',
    headStyles: { fillColor: C.bgCardLight, textColor: C.textPrimary, fontStyle: 'bold', fontSize: 7, cellPadding: {top:3,bottom:3,left:4,right:4} },
    bodyStyles: { fillColor: C.white, textColor: C.textPrimary, fontSize: 7, cellPadding: {top:3,bottom:3,left:4,right:4} },
    alternateRowStyles: { fillColor: C.bgCard },
    columnStyles: { 0:{cellWidth:8,halign:'center'}, 1:{cellWidth:58}, 2:{cellWidth:25,halign:'center'}, 3:{cellWidth:25,halign:'center'}, 4:{cellWidth:'auto'} },
    didDrawCell(data) {
      if (data.section === 'body' && data.column.index === 4) {
        progressBar(doc, data.cell.x+2, data.cell.y+(data.cell.height-3)/2, data.cell.width-4, 3,
          (sups[data.row.index].count/maxCnt)*100, COLS[data.row.index % COLS.length]);
      }
    },
  });

  return doc.lastAutoTable.finalY + 8;
}

/* ── SECTION 4: Stock Movement Analytics ────────────────────────────────── */
function drawStockMovement(doc, analytics, startY) {
  let y = sectionTitle(doc, startY, 'Stock Movement Analytics', '04');
  const stockIn  = analytics?.totalStockIn  ?? 0;
  const stockOut = analytics?.totalStockOut ?? 0;
  const total    = stockIn + stockOut;
  const inPct    = total > 0 ? Math.round((stockIn / total) * 100) : 0;

  const tw = (CONTENT - 3*4) / 4;
  const tiles = [
    { label: 'Units Received (IN)',   value: stockIn.toLocaleString(),                          color: C.emerald },
    { label: 'Units Dispensed (OUT)', value: stockOut.toLocaleString(),                         color: C.rose    },
    { label: 'Net Stock Change',      value: (stockIn - stockOut >= 0 ? '+' : '') + (stockIn - stockOut).toLocaleString(), color: stockIn - stockOut >= 0 ? C.emerald : C.rose },
    { label: 'Total Movements',       value: total.toLocaleString(),                            color: C.primary },
  ];
  tiles.forEach((t, i) => statBox(doc, MARGIN + i*(tw+4), y, tw, 20, t.label, t.value, t.color));

  let barY = y + 25;
  if (total === 0) {
    setFont(doc, C.textMuted); doc.setFontSize(7.5); doc.setFont('helvetica', 'italic');
    doc.text('No stock movements recorded yet.', MARGIN, barY + 4);
    return barY + 12;
  }

  setFont(doc, C.textMuted); doc.setFontSize(6); doc.setFont('helvetica', 'normal');
  doc.text('STOCK IN vs OUT PROPORTION', MARGIN, barY);
  barY += 3.5;

  const barH = 6;
  setFill(doc, C.bgCardLight);
  doc.roundedRect(MARGIN, barY, CONTENT, barH, 3, 3, 'F');
  const inW = CONTENT * (inPct / 100);
  if (inW > 0) { setFill(doc, C.emerald); doc.roundedRect(MARGIN, barY, inW, barH, 3, 3, 'F'); }
  const outW = CONTENT * ((100-inPct) / 100);
  if (outW > 0) { setFill(doc, C.rose); doc.roundedRect(MARGIN+inW, barY, outW, barH, 3, 3, 'F'); }

  setFont(doc, C.emeraldDark); doc.setFontSize(6.5); doc.setFont('helvetica', 'bold');
  doc.text(`IN: ${inPct}%`, MARGIN, barY + barH + 4.5);
  setFont(doc, C.rose);
  doc.text(`OUT: ${100-inPct}%`, PAGE_W-MARGIN, barY + barH + 4.5, { align: 'right' });

  return barY + barH + 10;
}

/* ── SECTION 5: 7-Day Trend ──────────────────────────────────────────────── */
function drawDailyTrend(doc, analytics, startY) {
  let y = sectionTitle(doc, startY, '7-Day Daily Movement Trend', '05');
  const days = analytics?.dailyMovements || [];
  if (!days.length) {
    setFont(doc, C.textMuted); doc.setFontSize(8);
    doc.text('No movement trend recorded in past 7 days.', MARGIN, y + 4);
    return y + 12;
  }
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Date', 'Day', 'Stock IN', 'Stock OUT', 'Net Change', 'Status']],
    body: days.map(d => {
      const net = d.stockIn - d.stockOut;
      const noAct = d.stockIn === 0 && d.stockOut === 0;
      return [
        shortDate(d.date),
        new Date(d.date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short'}),
        d.stockIn, d.stockOut,
        (net>=0?'+':'') + net,
        noAct ? 'No activity' : net>=0 ? '↑ Positive' : '↓ Negative',
      ];
    }),
    theme: 'plain',
    headStyles: { fillColor: C.bgCardLight, textColor: C.textPrimary, fontStyle:'bold', fontSize:7, cellPadding:{top:2.5,bottom:2.5,left:4,right:4} },
    bodyStyles: { fillColor: C.white, textColor: C.textPrimary, fontSize:7, cellPadding:{top:2.5,bottom:2.5,left:4,right:4} },
    alternateRowStyles: { fillColor: C.bgCard },
    columnStyles: { 0:{cellWidth:32}, 1:{cellWidth:20,halign:'center'}, 2:{cellWidth:25,halign:'center'}, 3:{cellWidth:25,halign:'center'}, 4:{cellWidth:28,halign:'center'}, 5:{cellWidth:'auto'} },
    didParseCell(data) {
      if (data.section !== 'body') return;
      const d   = days[data.row.index];
      const net = d.stockIn - d.stockOut;
      const noAct = d.stockIn === 0 && d.stockOut === 0;
      if (data.column.index === 2) data.cell.styles.textColor = C.emerald;
      if (data.column.index === 3) data.cell.styles.textColor = C.rose;
      if (data.column.index === 4) data.cell.styles.textColor = net >= 0 ? C.emerald : C.rose;
      if (data.column.index === 5) data.cell.styles.textColor = noAct ? C.textMuted : net >= 0 ? C.emerald : C.rose;
    },
  });

  return doc.lastAutoTable.finalY + 8;
}

/* ── SECTION 6: Low-Stock ────────────────────────────────────────────────── */
function drawLowStock(doc, analytics, startY) {
  let y = sectionTitle(doc, startY, 'Critical Low-Stock Alert', '06');
  const items = analytics?.topLowStockItems || [];
  if (!items.length) {
    setFont(doc, C.emeraldDark); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text('✓  All inventory stock levels are healthy — no medicines below threshold.', MARGIN, y + 4);
    return y + 12;
  }
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['#', 'Medicine Name', 'Category', 'Qty Left', 'Urgency Status', 'Stock Gauge']],
    body: items.map((item, i) => {
      const urgency = item.quantity === 0 ? 'OUT OF STOCK' : item.quantity <= 3 ? 'CRITICAL' : 'LOW';
      return [i+1, item.name, item.categoryName || 'General', item.quantity, urgency, ''];
    }),
    theme: 'plain',
    headStyles: { fillColor: [254, 226, 226], textColor: [185, 28, 28], fontStyle:'bold', fontSize:7, cellPadding:{top:2.5,bottom:2.5,left:4,right:4} },
    bodyStyles: { fillColor: C.white, textColor: C.textPrimary, fontSize:7, cellPadding:{top:2.5,bottom:2.5,left:4,right:4} },
    alternateRowStyles: { fillColor: C.bgCard },
    columnStyles: { 0:{cellWidth:8,halign:'center'}, 1:{cellWidth:52}, 2:{cellWidth:38}, 3:{cellWidth:22,halign:'center'}, 4:{cellWidth:26,halign:'center'}, 5:{cellWidth:'auto'} },
    didParseCell(data) {
      if (data.section !== 'body') return;
      const qty = items[data.row.index].quantity;
      const color = qty === 0 ? C.red : qty <= 3 ? C.rose : C.amber;
      if (data.column.index === 3 || data.column.index === 4) {
        data.cell.styles.textColor = color;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    didDrawCell(data) {
      if (data.section === 'body' && data.column.index === 5) {
        const qty   = items[data.row.index].quantity;
        const pct   = Math.min((qty / 10) * 100, 100);
        const color = qty === 0 ? C.red : qty <= 3 ? C.rose : C.amber;
        progressBar(doc, data.cell.x+2, data.cell.y+(data.cell.height-3)/2, data.cell.width-4, 3, pct, color);
      }
    },
  });

  return doc.lastAutoTable.finalY + 8;
}

/* ── SECTION 7: Expiry Timeline ──────────────────────────────────────────── */
function drawExpiry(doc, expiringMeds, startY) {
  let y = sectionTitle(doc, startY, 'Expiry Timeline (Next 90 Days)', '07');
  if (!expiringMeds?.length) {
    setFont(doc, C.emeraldDark); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text('✓  No medicines expiring within the next 90 days.', MARGIN, y + 4);
    return y + 12;
  }
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Medicine', 'Batch', 'Category', 'Supplier', 'Expiry Date', 'Days', 'Qty', 'Urgency']],
    body: expiringMeds.map(med => {
      const days    = daysUntil(med.expiryDate);
      const urgency = days <= 15 ? 'CRITICAL' : days <= 45 ? 'HIGH' : 'MEDIUM';
      return [med.name, med.batchNumber||'—', med.categoryName||'—', med.supplierName||'—', shortDate(med.expiryDate), days, med.quantity, urgency];
    }),
    theme: 'plain',
    headStyles: { fillColor: [254, 226, 226], textColor: [185, 28, 28], fontStyle:'bold', fontSize:6.5, cellPadding:{top:2.5,bottom:2.5,left:3,right:3} },
    bodyStyles: { fillColor: C.white, textColor: C.textPrimary, fontSize:7, cellPadding:{top:2.5,bottom:2.5,left:3,right:3} },
    alternateRowStyles: { fillColor: C.bgCard },
    columnStyles: { 0:{cellWidth:38}, 1:{cellWidth:22}, 2:{cellWidth:25}, 3:{cellWidth:28}, 4:{cellWidth:24}, 5:{cellWidth:13,halign:'center'}, 6:{cellWidth:10,halign:'center'}, 7:{cellWidth:17,halign:'center'} },
    didParseCell(data) {
      if (data.section !== 'body') return;
      const days  = daysUntil(expiringMeds[data.row.index].expiryDate);
      const color = days <= 15 ? C.red : days <= 45 ? C.rose : C.amber;
      if (data.column.index === 5 || data.column.index === 7) {
        data.cell.styles.textColor = color;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  return doc.lastAutoTable.finalY + 8;
}

/* ── SECTION 8: Audit Log ────────────────────────────────────────────────── */
function drawAuditLog(doc, logs, startY) {
  let y = sectionTitle(doc, startY, 'Stock Adjustment Audit Log', '08');
  if (!logs?.length) {
    setFont(doc, C.textMuted); doc.setFontSize(8);
    doc.text('No stock adjustments recorded yet.', MARGIN, y + 4);
    return y + 12;
  }
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['#', 'Medicine', 'Batch', 'Type', 'Qty', 'Reason', 'Adjusted By', 'Date & Time']],
    body: logs.map((log, i) => [
      i+1, log.medicineName, log.batchNumber||'—', log.movementType,
      (log.movementType==='IN'?'+':'-') + log.quantity,
      log.reason||'—', log.username || 'System', fmtTimestamp(log.timestamp),
    ]),
    theme: 'plain',
    headStyles: { fillColor: C.bgCardLight, textColor: C.textPrimary, fontStyle:'bold', fontSize:6.5, cellPadding:{top:2.5,bottom:2.5,left:3,right:3} },
    bodyStyles: { fillColor: C.white, textColor: C.textPrimary, fontSize:7, cellPadding:{top:2.5,bottom:2.5,left:3,right:3} },
    alternateRowStyles: { fillColor: C.bgCard },
    columnStyles: { 0:{cellWidth:7,halign:'center'}, 1:{cellWidth:35}, 2:{cellWidth:20}, 3:{cellWidth:13,halign:'center'}, 4:{cellWidth:14,halign:'center'}, 5:{cellWidth:38}, 6:{cellWidth:22}, 7:{cellWidth:'auto'} },
    didParseCell(data) {
      if (data.section !== 'body') return;
      const log = logs[data.row.index];
      if (data.column.index === 3 || data.column.index === 4) {
        data.cell.styles.textColor = log.movementType === 'IN' ? C.emeraldDark : C.rose;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  return doc.lastAutoTable.finalY + 8;
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT COORDINATOR
───────────────────────────────────────────────────────────────────────────── */
/**
 * Generates and downloads the full MediStock analytics PDF in clean Light Theme without overlapping.
 * @param {object}  analytics    – Full AnalyticsDTO from /api/analytics
 * @param {Array}   expiringMeds – Expiring medicine list
 * @param {Array}   allLogs      – All stock log entries (fetched at full size)
 */
export async function exportReportAsPDF({ analytics, expiringMeds, allLogs }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const generatedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  // PAGE 1: Cover Page
  drawCoverPage(doc, generatedAt);

  // PAGE 2: Section 01, 02, 03
  let currentY = addPage(doc);
  currentY = drawSummary(doc, analytics, currentY);
  currentY = drawCategories(doc, analytics, currentY);
  currentY = drawSuppliers(doc, analytics, currentY);

  // PAGE 3: Section 04, 05, 06
  currentY = addPage(doc);
  currentY = drawStockMovement(doc, analytics, currentY);
  currentY = drawDailyTrend(doc, analytics, currentY);
  currentY = drawLowStock(doc, analytics, currentY);

  // PAGE 4: Section 07, 08
  currentY = addPage(doc);
  currentY = drawExpiry(doc, expiringMeds, currentY);
  currentY = drawAuditLog(doc, allLogs, currentY);

  // Stamp footers on all pages
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    addFooter(doc, i, total, generatedAt);
  }

  doc.save(`MediStock_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
