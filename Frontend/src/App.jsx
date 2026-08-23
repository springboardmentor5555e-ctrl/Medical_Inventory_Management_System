import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Medicines from './pages/Medicines'
import Suppliers from './pages/Suppliers'
import ExpiryTracking from './pages/ExpiryTracking'
import Reports from './pages/Reports'

import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <Routes>

      {/* Authentication */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Medicines */}
      <Route
        path="/medicines"
        element={
          <ProtectedRoute>
            <Layout>
              <Medicines />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Suppliers */}
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <Layout>
              <Suppliers />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Expiry Tracking */}
      <Route
        path="/expiry-tracking"
        element={
          <ProtectedRoute>
            <Layout>
              <ExpiryTracking />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />

    </Routes>
  )
}