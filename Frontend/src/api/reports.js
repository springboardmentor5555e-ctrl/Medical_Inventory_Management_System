import client from './client'

/**
 * Download a report from the backend.
 * The existing axios client automatically adds the JWT token.
 */
async function downloadReport(url, filename) {
  const response = await client.get(url, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data], {
    type: response.headers['content-type'],
  })

  const downloadUrl = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(downloadUrl)
}

// Inventory PDF
export function downloadInventoryPdf() {
  return downloadReport(
    '/reports/inventory/pdf',
    'medistock-inventory-report.pdf'
  )
}

// Inventory Excel
export function downloadInventoryExcel() {
  return downloadReport(
    '/reports/inventory/excel',
    'medistock-inventory-report.xlsx'
  )
}

// Low Stock PDF
export function downloadLowStockPdf() {
  return downloadReport(
    '/reports/low-stock/pdf',
    'medistock-low-stock-report.pdf'
  )
}

// Expiring Soon PDF
export function downloadExpiringSoonPdf() {
  return downloadReport(
    '/reports/expiring-soon/pdf',
    'medistock-expiring-soon-report.pdf'
  )
}

// Expired Medicines PDF
export function downloadExpiredPdf() {
  return downloadReport(
    '/reports/expired/pdf',
    'medistock-expired-report.pdf'
  )
}