import client from './client'

export const getDashboardSummary = () => client.get('/dashboard/summary').then((res) => res.data)

export const getCategoryAnalytics = () => client.get('/dashboard/analytics/by-category').then((res) => res.data)

export const getStockStatusBreakdown = () => client.get('/dashboard/analytics/stock-status').then((res) => res.data)
