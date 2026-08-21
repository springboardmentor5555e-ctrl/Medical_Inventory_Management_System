import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import {
  BarChart3,
  Truck,
  TrendingUp,
  Activity,
  Layers,
  AlertTriangle,
} from 'lucide-react'
import EmptyState from '../common/EmptyState'
import { SkeletonCards, SkeletonChart } from '../common/SkeletonLoader'

const COLORS = ['#059669', '#0284c7', '#f59e0b', '#8b5cf6', '#e11d48', '#0d9488', '#475569']

export default function AnalyticsView({ analytics, loading }) {
  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    )
  }

  // Top Medicines by Stock Available
  const topMedicinesData = Object.entries(analytics?.topMedicines || {}).map(
    ([name, qty]) => ({
      name,
      units: Number(qty),
    })
  )

  // Supplier Coverage
  const supplierData = Object.entries(analytics?.supplierPerformance || {}).map(
    ([name, count]) => ({
      name,
      medicines: Number(count),
    })
  )

  // Stock Movement Usage
  const stockUsageData = Object.entries(analytics?.stockUsage || {}).map(
    ([type, count]) => ({
      type: type.replaceAll('_', ' '),
      movements: Number(count),
    })
  )

  // Expiry Statistics
  const expiryData = Object.entries(analytics?.expiryStatistics || {}).map(
    ([status, count]) => ({
      name: status.replaceAll('_', ' '),
      value: Number(count),
    })
  )

  const topMedicine = topMedicinesData[0]
  const topSupplier = supplierData.sort((a, b) => b.medicines - a.medicines)[0]
  const totalStockMovements = stockUsageData.reduce((acc, d) => acc + d.movements, 0)

  return (
    <div className="space-y-6 pb-12">
      {/* Overview Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Top Stocked SKU
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-lg font-bold text-slate-900 mt-2 truncate">
            {topMedicine ? topMedicine.name : 'N/A'}
          </h4>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {topMedicine ? `${topMedicine.units} available units` : 'No data yet'}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Leading Distributor
            </span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-lg font-bold text-slate-900 mt-2 truncate">
            {topSupplier ? topSupplier.name : 'N/A'}
          </h4>
          <p className="text-xs text-sky-600 font-semibold mt-1">
            {topSupplier ? `${topSupplier.medicines} SKUs supplied` : 'No data yet'}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stock Movements
            </span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-2xl font-bold text-slate-900 mt-2">
            {totalStockMovements}
          </h4>
          <p className="text-xs text-purple-600 font-semibold mt-1">
            Total units mutated
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Supplier Network
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-2xl font-bold text-slate-900 mt-2">
            {supplierData.length}
          </h4>
          <p className="text-xs text-amber-600 font-semibold mt-1">Active vendor channels</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 10 Medicines by Quantity (Bar Chart) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Highest Volume Stocked Medicines</h3>
              <p className="text-xs text-slate-500">Top 10 SKUs currently in stock</p>
            </div>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>

          {topMedicinesData.length === 0 ? (
            <EmptyState title="No Medicine Stock" text="Stock distribution will populate as inventory is created." compact />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topMedicinesData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    width={80}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="units" fill="#059669" radius={[0, 6, 6, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Supplier Coverage (Bar Chart) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supplier Catalog Coverage</h3>
              <p className="text-xs text-slate-500">Number of distinct medicine SKUs supplied</p>
            </div>
            <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Truck className="w-4 h-4" />
            </span>
          </div>

          {supplierData.length === 0 ? (
            <EmptyState title="No Supplier Analytics" text="Add suppliers and link medicines to view distribution." compact />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={supplierData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="medicines" fill="#0284c7" radius={[0, 6, 6, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Stock Usage Types & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Movement types */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stock Mutation Operations</h3>
              <p className="text-xs text-slate-500">Movement volumes by action type</p>
            </div>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </span>
          </div>

          {stockUsageData.length === 0 ? (
            <EmptyState title="No Movement History" text="Movement activity will appear as stock operations are performed." compact />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockUsageData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="movements" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Expiry Risk Distribution */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Catalog Health Status</h3>
              <p className="text-xs text-slate-500">Overall risk classification</p>
            </div>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>

          {expiryData.length === 0 ? (
            <EmptyState title="No Status Data" text="Health status will display once inventory items exist." compact />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expiryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {expiryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
