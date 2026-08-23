import React, { useState } from 'react'
import client from '../api/client'

export default function Reports() {
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState('')

  const downloadReport = async (endpoint, filename, type) => {
    try {
      setDownloading(type)
      setError('')

      const response = await client.get(endpoint, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      })

      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = filename

      document.body.appendChild(link)
      link.click()

      link.remove()
      window.URL.revokeObjectURL(url)

    } catch (err) {
      console.error('Report download error:', err)

      setError(
        'Unable to download the report. Please make sure the backend is running and you are logged in.'
      )
    } finally {
      setDownloading(null)
    }
  }

  const isDownloading = (type) => downloading === type

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Reports
        </h1>

        <p className="mt-2 text-slate-500">
          Generate and download MediStock inventory reports.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* =====================================================
            INVENTORY REPORT
        ====================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">

          <div className="text-3xl mb-4">
            📦
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            Inventory Report
          </h2>

          <p className="text-sm text-slate-500 mt-2 min-h-[60px]">
            Complete medicine inventory including medicine name,
            batch number, category, supplier, quantity, price
            and expiry date.
          </p>

          <div className="mt-5 space-y-2">

            <button
              onClick={() =>
                downloadReport(
                  '/reports/inventory/pdf',
                  'medistock-inventory-report.pdf',
                  'inventory-pdf'
                )
              }
              disabled={downloading !== null}
              className="w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading('inventory-pdf')
                ? 'Generating PDF...'
                : 'Download PDF'}
            </button>

            <button
              onClick={() =>
                downloadReport(
                  '/reports/inventory/excel',
                  'medistock-inventory-report.xlsx',
                  'inventory-excel'
                )
              }
              disabled={downloading !== null}
              className="w-full border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading('inventory-excel')
                ? 'Generating Excel...'
                : 'Download Excel'}
            </button>

          </div>
        </div>


        {/* =====================================================
            LOW STOCK REPORT
        ====================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">

          <div className="text-3xl mb-4">
            ⚠️
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            Low Stock Report
          </h2>

          <p className="text-sm text-slate-500 mt-2 min-h-[60px]">
            View medicines that have reached or fallen below
            the configured low-stock threshold.
          </p>

          <div className="mt-5">

            <button
              onClick={() =>
                downloadReport(
                  '/reports/low-stock/pdf',
                  'medistock-low-stock-report.pdf',
                  'low-stock-pdf'
                )
              }
              disabled={downloading !== null}
              className="w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading('low-stock-pdf')
                ? 'Generating PDF...'
                : 'Download PDF'}
            </button>

          </div>
        </div>


        {/* =====================================================
            EXPIRING SOON REPORT
        ====================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">

          <div className="text-3xl mb-4">
            📅
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            Expiring Soon Report
          </h2>

          <p className="text-sm text-slate-500 mt-2 min-h-[60px]">
            View medicines that will expire within the next
            30 days.
          </p>

          <div className="mt-5">

            <button
              onClick={() =>
                downloadReport(
                  '/reports/expiring-soon/pdf',
                  'medistock-expiring-soon-report.pdf',
                  'expiring-soon-pdf'
                )
              }
              disabled={downloading !== null}
              className="w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading('expiring-soon-pdf')
                ? 'Generating PDF...'
                : 'Download PDF'}
            </button>

          </div>
        </div>


        {/* =====================================================
            EXPIRED MEDICINES REPORT
        ====================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">

          <div className="text-3xl mb-4">
            🚨
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            Expired Medicines Report
          </h2>

          <p className="text-sm text-slate-500 mt-2 min-h-[60px]">
            View all medicines whose expiry date has already
            passed.
          </p>

          <div className="mt-5">

            <button
              onClick={() =>
                downloadReport(
                  '/reports/expired/pdf',
                  'medistock-expired-report.pdf',
                  'expired-pdf'
                )
              }
              disabled={downloading !== null}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading('expired-pdf')
                ? 'Generating PDF...'
                : 'Download PDF'}
            </button>

          </div>
        </div>

      </div>


      {/* =====================================================
          REPORT INFORMATION
      ====================================================== */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">

        <h2 className="text-lg font-semibold text-slate-800">
          Available Reports
        </h2>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700">
              Inventory
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PDF + Excel
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700">
              Low Stock
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PDF
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700">
              Expiring Soon
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PDF
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700">
              Expired Medicines
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PDF
            </p>
          </div>

        </div>

        <p className="mt-5 text-sm text-slate-500">
          All prices in MediStock reports are displayed in
          Indian Rupees (₹).
        </p>

      </div>

    </div>
  )
}