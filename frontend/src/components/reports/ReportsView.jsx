import { useState } from 'react'
import {
  FileText,
  FileSpreadsheet,
  Download,
  FileCode,
} from 'lucide-react'

export default function ReportsView({ onDownloadReport }) {
  const [downloading, setDownloading] = useState(null)

  const reports = [
    {
      id: 'pdf-inventory',
      title: 'Clinical Inventory Valuation Report (PDF)',
      desc: 'Complete printable overview of stock valuation, batch records, quantities, and current health statuses.',
      format: 'PDF Document',
      filename: 'inventory-report.pdf',
      path: '/api/reports/inventory.pdf',
      mimeType: 'application/pdf',
      icon: FileText,
      tone: 'emerald',
    },
    {
      id: 'excel-inventory',
      title: 'Detailed Inventory Audit Sheet (Excel)',
      desc: 'Multi-column spreadsheet including purchase cost, selling price, reserved stock, damaged quantities, and expiry dates.',
      format: 'Excel Spreadsheet (.xlsx)',
      filename: 'inventory-audit.xlsx',
      path: '/api/reports/inventory.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      icon: FileSpreadsheet,
      tone: 'sky',
    },
    {
      id: 'csv-suppliers',
      title: 'Supplier & Vendor Directory (CSV)',
      desc: 'Master directory of medical distributors, company registration numbers, contact numbers, and total active SKUs supplied.',
      format: 'CSV File',
      filename: 'supplier-directory.csv',
      path: '/api/reports/suppliers.csv',
      mimeType: 'text/csv',
      icon: FileCode,
      tone: 'purple',
    },
  ]

  const handleDownload = async (report) => {
    setDownloading(report.id)
    try {
      await onDownloadReport(report.path, report.filename, report.mimeType)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Overview Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Compliance & Audit Reports</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Download verified database exports for regulatory compliance, procurement, and offline audits.
          </p>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hidden sm:block">
          <Download className="w-5 h-5" />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reports.map((r) => {
          const Icon = r.icon
          const isCurrent = downloading === r.id

          return (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 w-fit mb-4">
                  <Icon className="w-6 h-6" />
                </div>

                <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-100 text-slate-700 uppercase">
                  {r.format}
                </span>

                <h4 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">
                  {r.title}
                </h4>

                <p className="text-xs text-slate-500 leading-relaxed mt-2">{r.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={Boolean(downloading)}
                  onClick={() => handleDownload(r)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isCurrent ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download File</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
