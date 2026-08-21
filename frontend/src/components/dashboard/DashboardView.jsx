import {
  Pill,
  Truck,
  AlertTriangle,
  PackageX,
  Clock,
  ShieldAlert,
  Bell,
  Coins,
  ArrowUpRight,
  TrendingUp,
  Activity,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts'
import MetricCard from '../common/MetricCard'
import StatusBadge from '../common/StatusBadge'
import EmptyState from '../common/EmptyState'
import { SkeletonCards, SkeletonChart } from '../common/SkeletonLoader'

const CHART_COLORS = ['#059669', '#0b1f33', '#10b981', '#f59e0b', '#0284c7', '#e11d48', '#8b5cf6', '#0d9488']

export default function DashboardView({
  dashboard,
  loading,
  setActiveView,
}) {
  if (loading && !dashboard) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={8} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    )
  }

  const kpis = [
    {
      title: 'Total Medicines',
      value: dashboard?.totalMedicines ?? 0,
      subtitle: 'Catalogued SKUs',
      icon: Pill,
      tone: 'emerald',
      onClick: () => setActiveView('Medicines'),
    },
    {
      title: 'Total Suppliers',
      value: dashboard?.totalSuppliers ?? 0,
      subtitle: 'Verified Distributors',
      icon: Truck,
      tone: 'navy',
      onClick: () => setActiveView('Suppliers'),
    },
    {
      title: 'Inventory Value',
      value: `Rs ${(dashboard?.inventoryValue ?? 0).toLocaleString('en-IN')}`,
      subtitle: 'Total Stock Valuation',
      icon: Coins,
      tone: 'emerald',
    },
    {
      title: 'Low Stock Alert',
      value: dashboard?.lowStock ?? 0,
      subtitle: 'At or below threshold',
      icon: AlertTriangle,
      tone: 'amber',
      onClick: () => setActiveView('Medicines'),
    },
    {
      title: 'Out of Stock',
      value: dashboard?.outOfStock ?? 0,
      subtitle: 'Depleted SKUs',
      icon: PackageX,
      tone: 'red',
      onClick: () => setActiveView('Medicines'),
    },
    {
      title: 'Expiring in 30 Days',
      value: dashboard?.nearExpiry ?? 0,
      subtitle: 'Immediate action needed',
      icon: Clock,
      tone: 'amber',
      onClick: () => setActiveView('Expiry Monitoring'),
    },
    {
      title: 'Expired Stock',
      value: dashboard?.expired ?? 0,
      subtitle: 'Quarantine required',
      icon: ShieldAlert,
      tone: 'red',
      onClick: () => setActiveView('Expiry Monitoring'),
    },
    {
      title: 'Unread Alerts',
      value: dashboard?.notifications ?? 0,
      subtitle: 'System Notifications',
      icon: Bell,
      tone: 'blue',
      onClick: () => setActiveView('Notifications'),
    },
  ]

  // Prepare Category Distribution Data
  const categoryData = Object.entries(dashboard?.categoryDistribution || {})
    .map(([name, value]) => ({ name, value: Number(value) }))
    .filter((d) => d.value > 0)

  // Prepare Stock Status Data
  const stockStatusData = Object.entries(dashboard?.stockStatus || {})
    .map(([name, value]) => ({ name, value: Number(value) }))
    .filter((d) => d.value > 0)

  // Prepare Monthly Additions Data
  const monthlyAdditions = Object.entries(dashboard?.medicinesAddedByMonth || {}).map(
    ([month, count]) => ({
      month: formatMonthLabel(month),
      added: Number(count),
    })
  )



  // Prepare Valuation Trend Data
  const valuationTrend = Object.entries(dashboard?.monthlyInventoryValue || {}).map(
    ([month, value]) => ({
      month: formatMonthLabel(month),
      value: Number(value),
    })
  )

  return (
    <div className="space-y-6 pb-12">
      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <MetricCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
            tone={kpi.tone}
            onClick={kpi.onClick}
          />
        ))}
      </section>

      {/* Analytics Visualizations Row 1 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (Pie / Donut) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Medicine Category Distribution</h3>
              <p className="text-xs text-slate-500">Catalog distribution by therapeutic class</p>
            </div>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Pill className="w-4 h-4" />
            </span>
          </div>

          {categoryData.length === 0 ? (
            <EmptyState
              title="No Category Data"
              text="Category analytics will populate once medicines are registered."
              compact
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-slate-600">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Stock Health Status */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stock Availability Breakdown</h3>
              <p className="text-xs text-slate-500">Available vs low stock vs depleted</p>
            </div>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Activity className="w-4 h-4" />
            </span>
          </div>

          {stockStatusData.length === 0 ? (
            <EmptyState
              title="No Stock Data"
              text="Stock status breakdown will display once inventory items exist."
              compact
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stockStatusData.map((entry) => {
                      const color =
                        entry.name === 'Available'
                          ? '#059669'
                          : entry.name === 'Low Stock'
                          ? '#f59e0b'
                          : '#e11d48'
                      return <Cell key={entry.name} fill={color} />
                    })}
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
      </section>

      {/* Analytics Visualizations Row 2 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Additions (Bar Chart) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Additions</h3>
              <p className="text-xs text-slate-500">New SKUs registered in the past 6 months</p>
            </div>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAdditions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="added" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Valuation Growth (Area Chart) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inventory Valuation Over Time</h3>
              <p className="text-xs text-slate-500">Cumulative value (INR) of stocked medicines</p>
            </div>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Coins className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={valuationTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValuation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `Rs ${val > 999 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val) => [`Rs ${Number(val).toLocaleString('en-IN')}`, 'Stock Value']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorValuation)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Row 3: Recently Added Medicines & Live Activity Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recently Added */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recently Added Medicines</h3>
              <p className="text-xs text-slate-500">Latest additions to catalog</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('Medicines')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {dashboard?.recentlyAddedMedicines?.length === 0 ? (
            <EmptyState title="No Recent Medicines" text="Added medicines will appear here." compact />
          ) : (
            <div className="divide-y divide-slate-100">
              {dashboard?.recentlyAddedMedicines?.map((med) => (
                <div key={med.id} className="py-2.5 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-xs font-bold text-slate-800 truncate">{med.medicineName}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {med.genericName} • {med.category?.name || 'General'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={med.status} size="xs" />
                    <p className="text-[11px] font-semibold text-slate-700 mt-1">
                      Qty: {med.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Activity Audit Feed */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Inventory Activity</h3>
              <p className="text-xs text-slate-500">Audit trail of modifications and stock changes</p>
            </div>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Activity className="w-4 h-4" />
            </span>
          </div>

          {dashboard?.recentActivity?.length === 0 ? (
            <EmptyState title="No Recent Activity" text="Audit events will appear as actions occur." compact />
          ) : (
            <div className="divide-y divide-slate-100 max-h-[290px] overflow-y-auto custom-scrollbar">
              {dashboard?.recentActivity?.map((act) => (
                <div key={act.id} className="py-2.5 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {act.action.replaceAll('_', ' ')} • {act.entityType}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{act.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function formatMonthLabel(val) {
  if (!val || !val.includes('-')) return String(val)
  const [year, month] = val.split('-').map(Number)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'short' })
}
