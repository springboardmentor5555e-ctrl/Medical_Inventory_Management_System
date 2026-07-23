import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { FileSpreadsheet, Download, FileText, Printer, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';

const Reports = () => {
  // 1. Fetch Medicines for Inventory Export
  const { data: medicines = [] } = useQuery({
    queryKey: ['reportMedicines'],
    queryFn: () => axiosInstance.get('/api/medicines?size=1000').then(res => res.data?.content || res.data)
  });

  // 2. Fetch Sales for Sales Export
  const { data: sales = [] } = useQuery({
    queryKey: ['reportSales'],
    queryFn: () => axiosInstance.get('/api/sales').then(res => res.data)
  });

  // 3. Fetch Suppliers for Supplier Export
  const { data: suppliers = [] } = useQuery({
    queryKey: ['reportSuppliers'],
    queryFn: () => axiosInstance.get('/api/suppliers').then(res => res.data)
  });

  // Helper: Trigger CSV Download in Browser
  const triggerCSVDownload = (headers, rows, filename) => {
    try {
      const csvRows = [headers.join(',')];
      for (const row of rows) {
        csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
      }
      
      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${filename} report exported successfully.`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to export CSV report.');
    }
  };

  // Export Inventory CSV
  const exportInventoryReport = () => {
    const headers = ['ID', 'Medicine Name', 'Barcode', 'Quantity', 'Price', 'Batch Number', 'Expiry Date', 'Category', 'Supplier'];
    const rows = medicines.map(m => [
      m.id,
      m.name,
      m.barcode || 'N/A',
      m.quantity,
      m.price,
      m.batchNumber || 'N/A',
      m.expiryDate || 'N/A',
      m.category?.name || 'Uncategorized',
      m.supplier?.name || 'N/A'
    ]);
    triggerCSVDownload(headers, rows, 'inventory_report');
  };

  // Export Sales CSV
  const exportSalesReport = () => {
    const headers = ['ID', 'Invoice Number', 'Cashier Name', 'Sale Date', 'Total Amount', 'Items Count'];
    const rows = sales.map(s => [
      s.id,
      s.invoiceNumber,
      s.cashierName,
      new Date(s.saleDate).toLocaleString(),
      s.totalAmount.toFixed(2),
      s.items?.length || 0
    ]);
    triggerCSVDownload(headers, rows, 'sales_report');
  };

  // Export Supplier CSV
  const exportSupplierReport = () => {
    const headers = ['ID', 'Supplier Name', 'Phone', 'Email', 'Address'];
    const rows = suppliers.map(s => [
      s.id,
      s.name,
      s.phone || 'N/A',
      s.email || 'N/A',
      s.address || 'N/A'
    ]);
    triggerCSVDownload(headers, rows, 'supplier_report');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          Executive Reports & Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Export system datasets, check billing logs, and compile logistics spreadsheets.
        </p>
      </div>

      {/* Grid: Print Options and Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Inventory Report Card */}
        <div className="glass-card p-6 flex flex-col justify-between h-56">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
              <FileSpreadsheet size={20} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Inventory Audit</h3>
            <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
              Contains complete stock status details, current quantity, prices, categories, and expiries.
            </p>
          </div>

          <button
            onClick={exportInventoryReport}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Download size={14} />
            <span>Download CSV Spreadsheet</span>
          </button>
        </div>

        {/* Sales Report Card */}
        <div className="glass-card p-6 flex flex-col justify-between h-56">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <BarChart2 size={20} />
            </div>
            <h3 className="font-bold text-slate-850 dark:text-slate-200 text-base">Sales & Revenue</h3>
            <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
              Review checkout logs, invoices totals, transaction timestamp, and cashier identifiers.
            </p>
          </div>

          <button
            onClick={exportSalesReport}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Download size={14} />
            <span>Download CSV Spreadsheet</span>
          </button>
        </div>

        {/* Supplier Partners Card */}
        <div className="glass-card p-6 flex flex-col justify-between h-56">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <FileText size={20} />
            </div>
            <h3 className="font-bold text-slate-850 dark:text-slate-200 text-base">Supplier Partner List</h3>
            <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
              Consolidated directory of verified pharmaceutical manufacturers, contact numbers, and office addresses.
            </p>
          </div>

          <button
            onClick={exportSupplierReport}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Download size={14} />
            <span>Download CSV Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* Printing/PDF Export Card */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Printer size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Print Window View</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Need to save a copy as a PDF? You can export the current page directly using the system print dialog.
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-750 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
        >
          <Printer size={14} />
          <span>Launch Print Window</span>
        </button>
      </div>
    </div>
  );
};

export default Reports;
