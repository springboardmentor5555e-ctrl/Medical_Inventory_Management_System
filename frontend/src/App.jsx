import { useState, useEffect, useMemo, useCallback } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { apiRequest, downloadReportFile, friendlyError } from './services/api'
import AuthShell from './components/auth/AuthShell'
import Sidebar from './components/common/Sidebar'
import Navbar from './components/common/Navbar'
import Toast from './components/common/Toast'
import ConfirmModal from './components/common/ConfirmModal'
import DashboardView from './components/dashboard/DashboardView'
import MedicinesView from './components/medicines/MedicinesView'
import MedicineDrawer from './components/medicines/MedicineDrawer'
import MedicineDetailsModal from './components/medicines/MedicineDetailsModal'
import StockMovementModal from './components/medicines/StockMovementModal'
import SuppliersView from './components/suppliers/SuppliersView'
import SupplierDrawer from './components/suppliers/SupplierDrawer'
import SupplierDetailsModal from './components/suppliers/SupplierDetailsModal'
import StockHistoryView from './components/stock/StockHistoryView'
import ExpiryView from './components/expiry/ExpiryView'
import AnalyticsView from './components/analytics/AnalyticsView'
import NotificationsView from './components/notifications/NotificationsView'
import ReportsView from './components/reports/ReportsView'
import SettingsView from './components/settings/SettingsView'
import UsersView from './components/users/UsersView'
import UserDrawer from './components/users/UserDrawer'

function MainApp() {
  const {
    auth,
    token,
    canViewSuppliers,
    canViewAnalytics,
    canViewReports,
    canManageUsers,
  } = useAuth()

  const [activeView, setActiveView] = useState('Dashboard')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  // Data states
  const [dashboard, setDashboard] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [stockLogs, setStockLogs] = useState([])
  const [notifications, setNotifications] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])

  // Modal / Drawer states
  const [medicineDrawerOpen, setMedicineDrawerOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [selectedMedicineDetails, setSelectedMedicineDetails] = useState(null)
  const [stockMovementMedicine, setStockMovementMedicine] = useState(null)

  const [supplierDrawerOpen, setSupplierDrawerOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [selectedSupplierDetails, setSelectedSupplierDetails] = useState(null)

  const [userDrawerOpen, setUserDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const [confirmDialog, setConfirmDialog] = useState(null)

  // Filters state for medicines
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    supplierId: '',
    status: '',
    sortBy: 'medicineName',
    direction: 'ASC',
  })

  const showToast = useCallback((t) => {
    setToast(t)
  }, [])

  const medicineQuery = useMemo(() => {
    const params = new URLSearchParams({
      page: '0',
      size: '100',
      sortBy: filters.sortBy || 'medicineName',
      direction: filters.direction || 'ASC',
    })
    if (filters.search) params.set('search', filters.search)
    if (filters.category) params.set('category', filters.category)
    if (filters.supplierId) params.set('supplierId', filters.supplierId)
    if (filters.status) params.set('status', filters.status)
    return params.toString()
  }, [filters])

  const loadData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [dashData, medsData, suppData, logsData, notifsData, analData, usersData] =
        await Promise.all([
          apiRequest('/api/dashboard', { token }),
          apiRequest(`/api/medicines?${medicineQuery}`, { token }),
          canViewSuppliers
            ? apiRequest('/api/suppliers?page=0&size=100&sortBy=supplierName&direction=ASC', { token })
            : Promise.resolve({ content: [] }),
          apiRequest('/api/medicines/stock-logs?page=0&size=50', { token }),
          apiRequest('/api/notifications?unreadOnly=false&page=0&size=40', { token }),
          canViewAnalytics ? apiRequest('/api/analytics', { token }) : Promise.resolve(null),
          canManageUsers ? apiRequest('/api/users', { token }) : Promise.resolve([]),
        ])

      setDashboard(dashData)
      setMedicines(medsData.content || [])
      setSuppliers(suppData.content || [])
      setStockLogs(logsData.content || [])
      setNotifications(notifsData.content || [])
      setAnalytics(analData)
      setUsers(usersData || [])
    } catch (err) {
      if (err.status === 0 || err.status >= 500) {
        showToast({ type: 'error', message: friendlyError(err) })
      }
    } finally {
      setLoading(false)
    }
  }, [token, medicineQuery, canViewSuppliers, canViewAnalytics, canManageUsers, showToast])

  useEffect(() => {
    let ignore = false
    if (token) {
      const init = async () => {
        if (!ignore) {
          await loadData()
        }
      }
      init()
    }
    return () => {
      ignore = true
    }
  }, [token, loadData])

  // Generic mutation runner
  const runMutation = async (action, successMsg) => {
    setLoading(true)
    try {
      await action()
      showToast({ type: 'success', message: successMsg })
      await loadData()
      return true
    } catch (err) {
      showToast({ type: 'error', message: friendlyError(err) })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Medicine operations
  const handleSaveMedicine = async (formData) => {
    const isEdit = Boolean(editingMedicine?.id)
    const method = isEdit ? 'PUT' : 'POST'
    const path = isEdit ? `/api/medicines/${editingMedicine.id}` : '/api/medicines'
    const success = await runMutation(
      () => apiRequest(path, { token, method, body: formData }),
      isEdit ? 'Medicine details updated' : 'New medicine catalogued'
    )
    if (success) {
      setMedicineDrawerOpen(false)
      setEditingMedicine(null)
    }
  }

  const handleDeleteMedicine = (id) => {
    setConfirmDialog({
      title: 'Delete Medicine SKU?',
      message: 'This will permanently remove this medicine and its batch stock records from active inventory.',
      confirmLabel: 'Delete Medicine',
      action: () => runMutation(() => apiRequest(`/api/medicines/${id}`, { token, method: 'DELETE' }), 'Medicine deleted'),
    })
  }

  // Stock operations
  const handleMutateStock = async (medicineId, payload) => {
    const success = await runMutation(
      () => apiRequest(`/api/medicines/${medicineId}/stock`, { token, method: 'POST', body: payload }),
      'Stock movement registered'
    )
    if (success) {
      setStockMovementMedicine(null)
    }
  }

  // Supplier operations
  const handleSaveSupplier = async (formData) => {
    const isEdit = Boolean(editingSupplier?.id)
    const method = isEdit ? 'PUT' : 'POST'
    const path = isEdit ? `/api/suppliers/${editingSupplier.id}` : '/api/suppliers'
    const generatedEmail = `${formData.supplierName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}.${Date.now()}@medistock.local`
    const payload = {
      ...formData,
      email: formData.email || generatedEmail,
      address: formData.address || 'Not specified',
      city: formData.city || 'Hyderabad',
      state: formData.state || 'Telangana',
      country: formData.country || 'India',
    }
    const success = await runMutation(
      () => apiRequest(path, { token, method, body: payload }),
      isEdit ? 'Supplier updated' : 'Supplier registered'
    )
    if (success) {
      setSupplierDrawerOpen(false)
      setEditingSupplier(null)
    }
  }

  const handleDeleteSupplier = (id) => {
    setConfirmDialog({
      title: 'Delete Supplier?',
      message: 'Suppliers linked to active medicine inventory cannot be deleted. Are you sure you want to proceed?',
      confirmLabel: 'Delete Supplier',
      action: () => runMutation(() => apiRequest(`/api/suppliers/${id}`, { token, method: 'DELETE' }), 'Supplier removed'),
    })
  }

  // User operations
  const handleSaveUser = async (formData) => {
    const isEdit = Boolean(editingUser?.id)
    const method = isEdit ? 'PUT' : 'POST'
    const path = isEdit ? `/api/users/${editingUser.id}` : '/api/users'
    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      ...(formData.password ? { password: formData.password } : {}),
    }
    const success = await runMutation(
      () => apiRequest(path, { token, method, body: payload }),
      isEdit ? 'Team member updated' : 'Team member provisioned'
    )
    if (success) {
      setUserDrawerOpen(false)
      setEditingUser(null)
    }
  }

  const handleDeleteUser = (id) => {
    setConfirmDialog({
      title: 'Revoke User Access?',
      message: 'This user account will be permanently deactivated and forbidden from signing in.',
      confirmLabel: 'Deactivate Account',
      action: () => runMutation(() => apiRequest(`/api/users/${id}`, { token, method: 'DELETE' }), 'User account removed'),
    })
  }

  // CSV Import / Export
  const handleImportCsv = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const body = new FormData()
    body.append('file', file)
    await runMutation(
      () => apiRequest('/api/medicines/import', { token, method: 'POST', body }),
      'CSV batch imported successfully'
    )
    event.target.value = ''
  }

  const handleExportCsv = async () => {
    try {
      const csv = await apiRequest('/api/medicines/export', { token })
      const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'medicines-inventory.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showToast({ type: 'success', message: 'CSV export downloaded' })
    } catch (err) {
      showToast({ type: 'error', message: friendlyError(err) })
    }
  }

  // Report downloads
  const handleDownloadReport = async (path, filename, mimeType) => {
    try {
      await downloadReportFile(path, filename, mimeType, token)
      showToast({ type: 'success', message: `${filename} downloaded successfully` })
    } catch (err) {
      showToast({ type: 'error', message: friendlyError(err) })
    }
  }

  // Notification actions
  const handleMarkNotificationRead = async (id) => {
    await runMutation(
      () => apiRequest(`/api/notifications/${id}/read`, { token, method: 'PATCH' }),
      'Alert marked as read'
    )
  }

  const handleMarkAllNotificationsRead = async () => {
    await runMutation(
      () => apiRequest('/api/notifications/read-all', { token, method: 'PATCH' }),
      'All notifications marked read'
    )
  }

  const handleClearNotifications = async () => {
    await runMutation(
      () => apiRequest('/api/notifications', { token, method: 'DELETE' }),
      'Notification history cleared'
    )
  }

  const handleScanExpiry = async () => {
    await runMutation(
      () => apiRequest('/api/notifications/scan-expiry', { token, method: 'POST' }),
      'Expiry scan completed and alerts updated'
    )
  }

  if (!auth) {
    return (
      <>
        <AuthShell showToast={showToast} />
        <Toast toast={toast} close={() => setToast(null)} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={mobileSidebarOpen}
        closeMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main workspace container (shifted on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          activeView={activeView}
          setActiveView={setActiveView}
          toggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          notifications={notifications}
          markNotificationRead={handleMarkNotificationRead}
          markAllNotificationsRead={handleMarkAllNotificationsRead}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'Dashboard' && (
            <DashboardView
              dashboard={dashboard}
              loading={loading}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'Medicines' && (
            <MedicinesView
              medicines={medicines}
              suppliers={suppliers}
              filters={filters}
              setFilters={setFilters}
              openDrawer={(med) => {
                setEditingMedicine(med)
                setMedicineDrawerOpen(true)
              }}
              openDetails={(med) => setSelectedMedicineDetails(med)}
              openStockModal={(med) => setStockMovementMedicine(med)}
              onDelete={handleDeleteMedicine}
              onExportCsv={canViewReports ? handleExportCsv : null}
              onImportCsv={handleImportCsv}
              loading={loading}
            />
          )}

          {activeView === 'Suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              openDrawer={(sup) => {
                setEditingSupplier(sup)
                setSupplierDrawerOpen(true)
              }}
              openDetails={(sup) => setSelectedSupplierDetails(sup)}
              onDelete={handleDeleteSupplier}
              loading={loading}
            />
          )}

          {activeView === 'Stock History' && (
            <StockHistoryView
              medicines={medicines}
              stockLogs={stockLogs}
              onMutateStock={handleMutateStock}
              loading={loading}
            />
          )}

          {activeView === 'Expiry Monitoring' && (
            <ExpiryView
              medicines={medicines}
              onScanExpiry={handleScanExpiry}
              openDetails={(med) => setSelectedMedicineDetails(med)}
              loading={loading}
            />
          )}

          {activeView === 'Analytics' && (
            <AnalyticsView
              analytics={analytics}
              medicines={medicines}
              loading={loading}
            />
          )}

          {activeView === 'Notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onClearAll={handleClearNotifications}
              onScanExpiry={handleScanExpiry}
              loading={loading}
            />
          )}

          {activeView === 'Reports' && (
            <ReportsView onDownloadReport={handleDownloadReport} />
          )}

          {activeView === 'User Management' && (
            <UsersView
              users={users}
              openDrawer={(u) => {
                setEditingUser(u)
                setUserDrawerOpen(true)
              }}
              onDelete={handleDeleteUser}
              loading={loading}
            />
          )}

          {(activeView === 'Settings' || activeView === 'Profile') && (
            <SettingsView showToast={showToast} />
          )}
        </main>
      </div>

      {/* Global Drawers & Modals */}
      <MedicineDrawer
        isOpen={medicineDrawerOpen}
        close={() => {
          setMedicineDrawerOpen(false)
          setEditingMedicine(null)
        }}
        medicine={editingMedicine}
        suppliers={suppliers}
        onSave={handleSaveMedicine}
      />

      <MedicineDetailsModal
        medicine={selectedMedicineDetails}
        close={() => setSelectedMedicineDetails(null)}
      />

      <StockMovementModal
        medicine={stockMovementMedicine}
        close={() => setStockMovementMedicine(null)}
        onSave={handleMutateStock}
      />

      <SupplierDrawer
        isOpen={supplierDrawerOpen}
        close={() => {
          setSupplierDrawerOpen(false)
          setEditingSupplier(null)
        }}
        supplier={editingSupplier}
        onSave={handleSaveSupplier}
      />

      <SupplierDetailsModal
        supplier={selectedSupplierDetails}
        close={() => setSelectedSupplierDetails(null)}
      />

      <UserDrawer
        isOpen={userDrawerOpen}
        close={() => {
          setUserDrawerOpen(false)
          setEditingUser(null)
        }}
        user={editingUser}
        onSave={handleSaveUser}
      />

      <ConfirmModal
        dialog={confirmDialog}
        close={() => setConfirmDialog(null)}
      />

      <Toast toast={toast} close={() => setToast(null)} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}
