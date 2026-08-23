import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import {
  getDashboardSummary,
  getCategoryAnalytics,
  getStockStatusBreakdown
} from '../api/dashboard'
import {
  getLowStock,
  getExpiringSoon,
  getRecentStockActivity
} from '../api/medicines'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import { Link } from 'react-router-dom'

const STATUS_COLORS = {
  'In Stock': '#10b981',
  'Low Stock': '#f59e0b',
  'Out of Stock': '#ef4444',
  'Expired': '#94a3b8',
}

function actionTone(action) {
  if (action === 'STOCK_IN' || action === 'INITIAL') return 'success'
  if (action === 'STOCK_OUT') return 'danger'
  return 'default'
}

function actionLabel(action) {
  return {
    STOCK_IN: 'Stock in',
    STOCK_OUT: 'Stock out',
    ADJUSTMENT: 'Adjustment',
    INITIAL: 'Initial stock'
  }[action] || action
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [expiring, setExpiring] = useState([])
  const [activity, setActivity] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [statusData, setStatusData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    Promise.all([
      getDashboardSummary(),
      getLowStock(20),
      getExpiringSoon(30),
      getRecentStockActivity(8),
      getCategoryAnalytics(),
      getStockStatusBreakdown(),
    ])
      .then(([s, low, exp, recent, byCategory, statusBreakdown]) => {
        if (!mounted) return

        setSummary(s)
        setLowStock(low.slice(0, 5))
        setExpiring(exp.slice(0, 5))
        setActivity(recent)

        setCategoryData(
          byCategory.map((c) => ({
            name: c.categoryName,
            value: c.totalValue
          }))
        )

        setStatusData([
          {
            name: 'In Stock',
            value: statusBreakdown.inStock
          },
          {
            name: 'Low Stock',
            value: statusBreakdown.lowStock
          },
          {
            name: 'Out of Stock',
            value: statusBreakdown.outOfStock
          },
          {
            name: 'Expired',
            value: statusBreakdown.expired
          },
        ].filter((d) => d.value > 0))
      })
      .catch(() => setError('Could not load dashboard data'))
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Loading dashboard…
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-slate-500 text-sm mt-1">
          Real-time overview of your medicine inventory
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

        <StatCard
          label="Total Medicines"
          value={summary.totalMedicines}
        />

        <StatCard
          label="Suppliers"
          value={summary.totalSuppliers}
        />

        <StatCard
          label="Low Stock"
          value={summary.lowStockCount}
          tone="warning"
        />

        <StatCard
          label="Out of Stock"
          value={summary.outOfStockCount}
          tone="danger"
        />

        <StatCard
          label="Expiring Soon"
          value={summary.expiringSoonCount}
          tone="warning"
        />

        <StatCard
          label="Expired"
          value={summary.expiredCount}
          tone="danger"
        />

      </div>

      {/* Total Inventory Value */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">

        <p className="text-sm text-slate-500">
          Total Inventory Value
        </p>

        <p className="text-3xl font-bold text-brand-700 mt-1">
          ₹
          {summary.totalInventoryValue.toLocaleString('en-IN', {
            maximumFractionDigits: 2
          })}
        </p>

      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Category Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">

          <h2 className="font-semibold text-slate-800 mb-4">
            Inventory Value by Category
          </h2>

          {categoryData.length === 0 ? (
            <p className="text-sm text-slate-400">
              No category data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={categoryData}
                margin={{ left: -20 }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />

                <YAxis
                  tick={{ fontSize: 11 }}
                />

                <Tooltip
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString('en-IN')}`,
                    'Value'
                  ]}
                />

                <Bar
                  dataKey="value"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>
          )}

        </div>

        {/* Stock Status Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">

          <h2 className="font-semibold text-slate-800 mb-4">
            Stock Status Distribution
          </h2>

          {statusData.length === 0 ? (
            <p className="text-sm text-slate-400">
              No stock data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>

              <PieChart>

                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >

                  {statusData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        STATUS_COLORS[entry.name] ||
                        '#94a3b8'
                      }
                    />
                  ))}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>
          )}

        </div>

      </div>

      {/* Low Stock + Expiring Soon */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">

          <div className="flex justify-between items-center mb-3">

            <h2 className="font-semibold text-slate-800">
              Low Stock Items
            </h2>

            <Link
              to="/medicines?stockStatus=LOW_STOCK"
              className="text-sm text-brand-600 font-medium"
            >
              View all
            </Link>

          </div>

          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400">
              No low-stock items right now.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">

              {lowStock.map((m) => (
                <li
                  key={m.id}
                  className="py-2 flex justify-between items-center text-sm"
                >

                  <span>
                    {m.name}
                  </span>

                  <Badge tone="warning">
                    {m.quantity} left
                  </Badge>

                </li>
              ))}

            </ul>
          )}

        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">

          <div className="flex justify-between items-center mb-3">

            <h2 className="font-semibold text-slate-800">
              Expiring Soon
            </h2>

            <Link
              to="/expiry-tracking"
              className="text-sm text-brand-600 font-medium"
            >
              View all
            </Link>

          </div>

          {expiring.length === 0 ? (
            <p className="text-sm text-slate-400">
              Nothing expiring in the next 30 days.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">

              {expiring.map((m) => (
                <li
                  key={m.id}
                  className="py-2 flex justify-between items-center text-sm"
                >

                  <span>
                    {m.name}
                  </span>

                  <Badge tone="warning">
                    {m.expiryDate}
                  </Badge>

                </li>
              ))}

            </ul>
          )}

        </div>

      </div>

      {/* Recent Stock Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">

        <h2 className="font-semibold text-slate-800 mb-3">
          Recent Stock Activity
        </h2>

        {activity.length === 0 ? (

          <p className="text-sm text-slate-400">
            No stock movements recorded yet.
          </p>

        ) : (

          <ul className="divide-y divide-slate-100">

            {activity.map((log) => (

              <li
                key={log.id}
                className="py-2.5 flex justify-between items-center text-sm"
              >

                {/* ONLY MEDICINE NAME */}
                <div>
                  <span className="font-medium text-slate-700">
                    {log.medicine?.name || 'Unknown medicine'}
                  </span>
                </div>

                <div className="flex items-center gap-3">

                  <span className="text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>

                  <Badge tone={actionTone(log.action)}>
                    {log.quantityChanged > 0 ? '+' : ''}
                    {log.quantityChanged}
                  </Badge>

                </div>

              </li>

            ))}

          </ul>

        )}

      </div>

    </div>
  )
}