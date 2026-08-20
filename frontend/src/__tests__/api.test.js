import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit tests for the frontend API service (api.js).
 * Verifies that each exported function builds the correct Axios request
 * — without making real HTTP calls (axios is mocked).
 */

vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { headers: { common: {} } },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

// Import after mock is set up
import axios from 'axios';
import * as api from '../services/api';

// Grab the mocked instance returned by axios.create()
const mockInstance = axios.create();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Medicine endpoints ────────────────────────────────────────────────────────

  it('getMedicines calls GET /medicines', async () => {
    await api.getMedicines();
    expect(mockInstance.get).toHaveBeenCalledWith('/medicines', expect.any(Object));
  });

  it('getMedicineById calls GET /medicines/:id', async () => {
    await api.getMedicineById(1);
    expect(mockInstance.get).toHaveBeenCalledWith('/medicines/1');
  });

  it('createMedicine calls POST /medicines', async () => {
    const data = { name: 'Aspirin' };
    await api.createMedicine(data);
    expect(mockInstance.post).toHaveBeenCalledWith('/medicines', data);
  });

  it('updateMedicine calls PUT /medicines/:id', async () => {
    const data = { name: 'Aspirin Updated' };
    await api.updateMedicine(1, data);
    expect(mockInstance.put).toHaveBeenCalledWith('/medicines/1', data);
  });

  it('deleteMedicine calls DELETE /medicines/:id', async () => {
    await api.deleteMedicine(1);
    expect(mockInstance.delete).toHaveBeenCalledWith('/medicines/1');
  });

  it('getLowStockMedicines calls GET /medicines/low-stock', async () => {
    await api.getLowStockMedicines();
    expect(mockInstance.get).toHaveBeenCalledWith('/medicines/low-stock', expect.any(Object));
  });

  it('getExpiringMedicines calls GET /medicines/expiring', async () => {
    await api.getExpiringMedicines();
    expect(mockInstance.get).toHaveBeenCalledWith('/medicines/expiring', expect.any(Object));
  });

  // ── Category endpoints ────────────────────────────────────────────────────────

  it('getCategories calls GET /categories', async () => {
    await api.getCategories();
    expect(mockInstance.get).toHaveBeenCalledWith('/categories');
  });

  it('createCategory calls POST /categories', async () => {
    await api.createCategory({ name: 'Antibiotics' });
    expect(mockInstance.post).toHaveBeenCalledWith('/categories', { name: 'Antibiotics' });
  });

  it('deleteCategory calls DELETE /categories/:id', async () => {
    await api.deleteCategory(2);
    expect(mockInstance.delete).toHaveBeenCalledWith('/categories/2');
  });

  // ── Supplier endpoints ────────────────────────────────────────────────────────

  it('getSuppliers calls GET /suppliers', async () => {
    await api.getSuppliers();
    expect(mockInstance.get).toHaveBeenCalledWith('/suppliers');
  });

  it('createSupplier calls POST /suppliers', async () => {
    const data = { name: 'PharmaCo' };
    await api.createSupplier(data);
    expect(mockInstance.post).toHaveBeenCalledWith('/suppliers', data);
  });

  // ── Notification endpoints ────────────────────────────────────────────────────

  it('getNotifications calls GET /notifications', async () => {
    await api.getNotifications();
    expect(mockInstance.get).toHaveBeenCalledWith('/notifications');
  });

  it('markNotificationRead calls PUT /notifications/:id/read', async () => {
    await api.markNotificationRead(5);
    expect(mockInstance.put).toHaveBeenCalledWith('/notifications/5/read');
  });

  it('dismissNotification calls DELETE /notifications/:id', async () => {
    await api.dismissNotification(5);
    expect(mockInstance.delete).toHaveBeenCalledWith('/notifications/5');
  });

  // ── Analytics endpoint ────────────────────────────────────────────────────────

  it('getAnalytics calls GET /analytics', async () => {
    await api.getAnalytics();
    expect(mockInstance.get).toHaveBeenCalledWith('/analytics');
  });

  // ── Purchase Orders ───────────────────────────────────────────────────────────

  it('getPurchaseOrders calls GET /purchase-orders', async () => {
    await api.getPurchaseOrders();
    expect(mockInstance.get).toHaveBeenCalledWith('/purchase-orders', expect.any(Object));
  });

  it('updatePurchaseOrderStatus calls PUT /purchase-orders/:id/status', async () => {
    await api.updatePurchaseOrderStatus(1, 'RECEIVED');
    expect(mockInstance.put).toHaveBeenCalledWith(
      '/purchase-orders/1/status', null, expect.any(Object)
    );
  });

  // ── Activity Logs ─────────────────────────────────────────────────────────────

  it('getActivityLogs calls GET /activity-logs', async () => {
    await api.getActivityLogs();
    expect(mockInstance.get).toHaveBeenCalledWith('/activity-logs', expect.any(Object));
  });

  it('getRecentActivityLogs calls GET /activity-logs/recent', async () => {
    await api.getRecentActivityLogs();
    expect(mockInstance.get).toHaveBeenCalledWith('/activity-logs/recent');
  });

  it('getUserActivitySummary calls GET /activity-logs/summary', async () => {
    await api.getUserActivitySummary(7);
    expect(mockInstance.get).toHaveBeenCalledWith('/activity-logs/summary', expect.any(Object));
  });

  // ── Supplier Analytics ────────────────────────────────────────────────────────

  it('getAllSupplierPerformance calls GET /supplier-analytics', async () => {
    await api.getAllSupplierPerformance();
    expect(mockInstance.get).toHaveBeenCalledWith('/supplier-analytics');
  });

  it('getSupplierPerformance calls GET /supplier-analytics/:id', async () => {
    await api.getSupplierPerformance(3);
    expect(mockInstance.get).toHaveBeenCalledWith('/supplier-analytics/3');
  });

  // ── User endpoints ────────────────────────────────────────────────────────────

  it('getUsers calls GET /users', async () => {
    await api.getUsers();
    expect(mockInstance.get).toHaveBeenCalledWith('/users');
  });

  it('getMe calls GET /users/me', async () => {
    await api.getMe();
    expect(mockInstance.get).toHaveBeenCalledWith('/users/me');
  });

  it('changePassword calls PUT /users/me/change-password', async () => {
    const data = { currentPassword: 'old', newPassword: 'new' };
    await api.changePassword(data);
    expect(mockInstance.put).toHaveBeenCalledWith('/users/me/change-password', data);
  });
});
