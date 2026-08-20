import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// ── Mock API calls ────────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  getDashboardStats: vi.fn().mockResolvedValue({
    data: { totalMedicines: 120, lowStockCount: 8, expiringCount: 5, expiredCount: 2 },
  }),
  getAnalytics: vi.fn().mockResolvedValue({
    data: {
      totalMedicines: 120,
      lowStockCount: 8,
      expiringCount: 5,
      expiredCount: 2,
      totalInventoryValue: 150000,
      totalStockIn: 500,
      totalStockOut: 200,
      totalPurchaseOrders: 30,
      pendingOrders: 5,
      receivedOrders: 25,
      totalPurchaseSpend: 200000,
      categoryBreakdown: [{ name: 'Painkillers', count: 40 }],
      supplierBreakdown: [{ name: 'PharmaCo', count: 60 }],
      topLowStockItems: [{ id: 1, name: 'Aspirin', quantity: 3, categoryName: 'Pain Relief' }],
      dailyMovements: [
        { date: '2026-08-06', stockIn: 10, stockOut: 5 },
        { date: '2026-08-07', stockIn: 20, stockOut: 8 },
      ],
    },
  }),
  getUnreadCount: vi.fn().mockResolvedValue({ data: { count: 0 } }),
}));

// ── Mock AuthContext ───────────────────────────────────────────────────────────
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { username: 'admin', role: 'ADMIN', email: 'admin@test.com' },
      loading: false,
      logout: vi.fn(),
    }),
  };
});

// ── Mock ThemeContext ─────────────────────────────────────────────────────────
vi.mock('../context/ThemeContext', async () => {
  const actual = await vi.importActual('../context/ThemeContext');
  return {
    ...actual,
    useTheme: () => ({ theme: 'dark', changeTheme: vi.fn() }),
  };
});

// ── Mock framer-motion ────────────────────────────────────────────────────────
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    aside: ({ children, ...props }) => <aside {...props}>{children}</aside>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import Dashboard from '../pages/Dashboard';

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('Dashboard Page', () => {
  const renderDashboard = () =>
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

  it('renders the Dashboard heading', async () => {
    renderDashboard();
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('shows total medicines stat card value', async () => {
    renderDashboard();
    // The stat card showing 120 should appear
    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument();
    });
  });

  it('shows low stock count stat card', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });
});
