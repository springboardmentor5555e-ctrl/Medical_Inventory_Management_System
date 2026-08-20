/**
 * Professional CSV Data Export & Alignment Engine for MediStock
 * Fully compliant with RFC 4180 and formatted for Microsoft Excel, Google Sheets, & Numbers
 */

/**
 * Escapes a cell value cleanly according to RFC 4180
 */
function escapeCell(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Builds and triggers download for a formatted CSV document
 * @param {string} filename Base filename
 * @param {string} reportTitle Human-readable header title
 * @param {Array<string>} headers Column header names
 * @param {Array<Array<any>>} dataRows Array of row arrays
 * @param {Array<string>} [summaryRow] Optional bottom totals row
 * @param {Array<{label: string, value: string}>} [metadata] Optional header metadata
 */
export function downloadFormattedCSV({
  filename,
  reportTitle,
  headers,
  dataRows,
  summaryRow = null,
  metadata = [],
}) {
  if (!headers || !headers.length) return;

  const lines = [];

  // 1. Corporate Header Banner
  lines.push([escapeCell('══════════════════════════════════════════════════════════════════════════════════════')]);
  lines.push([escapeCell(`MEDISTOCK — ${reportTitle.toUpperCase()}`)]);
  lines.push([escapeCell('Medical Inventory Management & Audit Intelligence System')]);
  lines.push([escapeCell(`Generated On: ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`)]);

  // 2. Metadata Info
  if (metadata.length > 0) {
    metadata.forEach((m) => {
      lines.push([escapeCell(`${m.label}: ${m.value}`)]);
    });
  }
  lines.push([escapeCell('══════════════════════════════════════════════════════════════════════════════════════')]);
  lines.push([]); // Blank spacing line

  // 3. Table Column Headers
  lines.push(headers.map(escapeCell).join(','));

  // 4. Data Rows
  (dataRows || []).forEach((row) => {
    lines.push(row.map(escapeCell).join(','));
  });

  // 5. Summary / Totals Row
  if (summaryRow && summaryRow.length > 0) {
    lines.push([]); // Blank separator
    lines.push(summaryRow.map(escapeCell).join(','));
  }

  // 6. Footer Disclaimer
  lines.push([]);
  lines.push([escapeCell('*** END OF CONFIDENTIAL REPORT — PRODUCED BY MEDISTOCK ***')]);

  const csvContent = lines.join('\r\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format and export medicines list
 */
export function exportMedicinesCSV(medicines = []) {
  const totalQty = medicines.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);
  const totalVal = medicines.reduce((sum, m) => sum + ((Number(m.quantity) || 0) * (Number(m.price) || 0)), 0);
  const lowStockCount = medicines.filter((m) => (m.quantity || 0) <= 10).length;

  const now = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

  const headers = [
    'Sl. No',
    'Medicine ID',
    'Medicine Name',
    'Batch Number',
    'Category',
    'Supplier Name',
    'Stock Qty (Units)',
    'Unit Price (INR)',
    'Total Valuation (INR)',
    'Expiry Date',
    'Days Until Expiry',
    'Inventory Status',
  ];

  const dataRows = medicines.map((m, idx) => {
    const qty = Number(m.quantity) || 0;
    const price = Number(m.price) || 0;
    const val = qty * price;

    let daysLeft = '—';
    let isExpired = false;
    let isExpiringSoon = false;

    if (m.expiryDate) {
      const expDate = new Date(m.expiryDate);
      const diffMs = expDate - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      daysLeft = diffDays >= 0 ? `${diffDays} days` : `Expired (${Math.abs(diffDays)}d ago)`;
      isExpired = diffDays < 0;
      isExpiringSoon = diffDays >= 0 && diffDays <= 90;
    }

    let status = 'IN STOCK';
    if (isExpired) {
      status = 'EXPIRED';
    } else if (qty === 0) {
      status = 'OUT OF STOCK';
    } else if (qty <= 10) {
      status = isExpiringSoon ? 'LOW STOCK & EXPIRING' : 'LOW STOCK';
    } else if (isExpiringSoon) {
      status = 'EXPIRING SOON (≤90 Days)';
    }

    return [
      idx + 1,
      `MED-${m.id}`,
      m.name || 'Unnamed',
      m.batchNumber || '—',
      m.categoryName || 'General',
      m.supplierName || 'Unassigned',
      qty,
      price.toFixed(2),
      val.toFixed(2),
      m.expiryDate || '—',
      daysLeft,
      status,
    ];
  });

  const summaryRow = [
    'TOTALS',
    '—',
    `Total Products: ${medicines.length}`,
    '—',
    '—',
    '—',
    `Total Qty: ${totalQty}`,
    '—',
    `Valuation: Rs. ${totalVal.toFixed(2)}`,
    '—',
    '—',
    `Low Stock Items: ${lowStockCount}`,
  ];

  downloadFormattedCSV({
    filename: 'MediStock_Inventory_Valuation_Report',
    reportTitle: 'Complete Medicine Inventory & Valuation Audit',
    headers,
    dataRows,
    summaryRow,
    metadata: [
      { label: 'Total Catalogued Medicines', value: String(medicines.length) },
      { label: 'Total Stock Units Available', value: `${totalQty} units` },
      { label: 'Grand Total Inventory Valuation', value: `INR ${totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: 'Proactive Expiry Horizon', value: '90 Days (3 Months)' },
    ],
  });
}

/**
 * Format and export Stock Audit Movement Logs
 */
export function exportStockLogsCSV(logs = []) {
  const stockInTotal = logs.filter((l) => l.movementType === 'IN').reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
  const stockOutTotal = logs.filter((l) => l.movementType === 'OUT').reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);

  const headers = [
    'Sl. No',
    'Log ID',
    'Date & Time',
    'Medicine Name',
    'Batch Number',
    'Movement Type',
    'Quantity',
    'Reason / Notes',
    'Logged By User',
  ];

  const dataRows = logs.map((l, idx) => [
    idx + 1,
    `LOG-${l.id}`,
    l.timestamp ? new Date(l.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—',
    l.medicineName || '—',
    l.batchNumber || '—',
    l.movementType || '—',
    (l.movementType === 'IN' ? `+${l.quantity}` : `-${l.quantity}`),
    l.reason || 'General Adjustment',
    l.username || 'System',
  ]);

  const summaryRow = [
    'SUMMARY',
    '—',
    `Total Logs: ${logs.length}`,
    '—',
    '—',
    `Net Movement: ${stockInTotal - stockOutTotal > 0 ? '+' : ''}${stockInTotal - stockOutTotal}`,
    `IN: +${stockInTotal} | OUT: -${stockOutTotal}`,
    '—',
    '—',
  ];

  downloadFormattedCSV({
    filename: 'MediStock_Stock_Movement_Audit_Logs',
    reportTitle: 'Stock In / Out Movement & Audit Logs',
    headers,
    dataRows,
    summaryRow,
    metadata: [
      { label: 'Total Audit Entries Recorded', value: String(logs.length) },
      { label: 'Total Units Received (IN)', value: `+${stockInTotal} units` },
      { label: 'Total Units Dispensed (OUT)', value: `-${stockOutTotal} units` },
      { label: 'Net Stock Variation', value: `${stockInTotal - stockOutTotal} units` },
    ],
  });
}

/**
 * Format and export Purchase Orders
 */
export function exportPurchaseOrdersCSV(orders = []) {
  const totalAmount = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
  const completedOrders = orders.filter((o) => o.status === 'RECEIVED').length;

  const headers = [
    'Sl. No',
    'PO Number',
    'Supplier Name',
    'Order Date',
    'Status',
    'Total Items Count',
    'Total Amount (INR)',
    'Itemized Products Breakdown',
  ];

  const dataRows = orders.map((o, idx) => {
    const itemsList = (o.items || [])
      .map((i) => `${i.medicineName || 'Medicine'} (x${i.quantity} @ Rs.${(i.unitPrice || 0).toFixed(2)})`)
      .join('; ');

    return [
      idx + 1,
      `PO-${o.id}`,
      o.supplierName || '—',
      o.orderDate || '—',
      o.status || 'PENDING',
      (o.items || []).length,
      (Number(o.totalAmount) || 0).toFixed(2),
      itemsList || '—',
    ];
  });

  const summaryRow = [
    'TOTALS',
    '—',
    `Total POs: ${orders.length}`,
    '—',
    `Pending: ${pendingOrders} | Received: ${completedOrders}`,
    '—',
    `Grand Total: Rs. ${totalAmount.toFixed(2)}`,
    '—',
  ];

  downloadFormattedCSV({
    filename: 'MediStock_Purchase_Orders_Registry',
    reportTitle: 'Purchase Orders & Supplier Procurement Registry',
    headers,
    dataRows,
    summaryRow,
    metadata: [
      { label: 'Total Purchase Orders', value: String(orders.length) },
      { label: 'Pending Fulfillment', value: `${pendingOrders} orders` },
      { label: 'Completed Deliveries', value: `${completedOrders} orders` },
      { label: 'Cumulative Procurement Spend', value: `INR ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    ],
  });
}
