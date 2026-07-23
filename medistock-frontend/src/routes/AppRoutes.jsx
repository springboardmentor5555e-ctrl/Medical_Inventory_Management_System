import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

// Import Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminDashboard from '../pages/AdminDashboard';
import PharmacistDashboard from '../pages/PharmacistDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import SupplierDashboard from '../pages/SupplierDashboard';
import CustomerDashboard from '../pages/CustomerDashboard';
import Medicines from '../pages/Medicines';
import AddEditMedicine from '../pages/AddEditMedicine';
import Suppliers from '../pages/Suppliers';
import Billing from '../pages/Billing';
import ReorderRequests from '../pages/ReorderRequests';
import Notifications from '../pages/Notifications';
import Reports from '../pages/Reports';
import Chat from '../pages/Chat';

// Role Guard Component
const RoleGuard = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-t-sky-500 border-sky-100 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }

  return children;
};

// OAuth2 Redirect Helper Route
const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  if (token) {
    localStorage.setItem('token', token);
    window.location.href = '/';
    return null;
  }

  return <Navigate to="/login?error=oauth" replace />;
};

// Root Redirect Controller
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

      {/* ADMIN Panel */}
      <Route 
        path="/admin" 
        element={
          <RoleGuard allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </RoleGuard>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="medicines/add" element={<AddEditMedicine />} />
        <Route path="medicines/edit/:id" element={<AddEditMedicine />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="billing" element={<Billing />} />
        <Route path="reorders" element={<ReorderRequests />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      {/* PHARMACIST Panel */}
      <Route 
        path="/pharmacist" 
        element={
          <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
            <DashboardLayout />
          </RoleGuard>
        }
      >
        <Route path="dashboard" element={<PharmacistDashboard />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="medicines/add" element={<AddEditMedicine />} />
        <Route path="medicines/edit/:id" element={<AddEditMedicine />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="billing" element={<Billing />} />
        <Route path="reorders" element={<ReorderRequests />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      {/* STAFF Panel */}
      <Route 
        path="/staff" 
        element={
          <RoleGuard allowedRoles={['STAFF', 'PHARMACIST', 'ADMIN']}>
            <DashboardLayout />
          </RoleGuard>
        }
      >
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="billing" element={<Billing />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      {/* SUPPLIER Panel */}
      <Route 
        path="/supplier" 
        element={
          <RoleGuard allowedRoles={['SUPPLIER', 'ADMIN']}>
            <DashboardLayout />
          </RoleGuard>
        }
      >
        <Route path="dashboard" element={<SupplierDashboard />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="partnerships" element={<Suppliers />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      {/* CUSTOMER Panel */}
      <Route 
        path="/customer" 
        element={
          <RoleGuard allowedRoles={['CUSTOMER', 'ADMIN']}>
            <DashboardLayout />
          </RoleGuard>
        }
      >
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      {/* Catch-all index routing */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
