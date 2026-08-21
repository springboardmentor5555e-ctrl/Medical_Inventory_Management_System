import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "../css/Dashboard.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);
function Dashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const [analytics, setAnalytics] = useState({
    totalMedicines: 0,
    suppliers: 0,
    notifications: 0,
    reports: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [expired, setExpired] = useState(0);
  const [nearExpiry, setNearExpiry] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    loadDashboard();
  }, [navigate]);
  const loadDashboard = async () => {
    try {
      // Medicines
      const medicinesResponse = await API.get("/medicines");
      // Suppliers
      const suppliersResponse = await API.get("/suppliers");
      setAnalytics({
        totalMedicines: medicinesResponse.data.length,
        suppliers: suppliersResponse.data.length,
        notifications: 0,
        reports: 0,
      });
      // Notifications
      try {
        const notificationResponse = await API.get("/notifications");
        setNotifications(notificationResponse.data);
      } catch (error) {
        setNotifications([]);
      }
      // Expired medicines
      try {
        const expiredResponse = await API.get("/medicines/expired");
        setExpired(expiredResponse.data);
      } catch (error) {
        setExpired(0);
      }
      // Near expiry
      try {
        const nearExpiryResponse = await API.get("/medicines/nearexpiry");
        setNearExpiry(nearExpiryResponse.data);
      } catch (error) {
        setNearExpiry(0);
      }
      // Low stock
      try {
        const lowStockResponse = await API.get("/medicines/lowstock");
        setLowStock(lowStockResponse.data);
      } catch (error) {
        setLowStock(0);
      }
    } catch (error) {
      console.log("Dashboard error:", error);
    }
  };
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };
  // Greeting
  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
  }
  // Total alerts
  const totalAlerts = lowStock + expired + nearExpiry;
  // =========================================================
// INVENTORY CHART
// =========================================================

const chartData = {
  labels: [
    "Medicines",
    "Suppliers",
    "Low Stock",
    "Expired",
    "Near Expiry",
  ],

  datasets: [
    {
      label: "Count",

      data: [
        analytics.totalMedicines,
        analytics.suppliers,
        lowStock,
        expired,
        nearExpiry,
      ],

      backgroundColor: [
        "#2563eb",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
      ],

      borderRadius: 8,
borderSkipped: false,
barPercentage: 0.65,
categoryPercentage: 0.7,
     
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      display: false,
    },

    tooltip: {
      backgroundColor: "#1e293b",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
    },
  },

  scales: {
    y: {
      beginAtZero: true,

      ticks: {
        precision: 0,
        color: "#94a3b8",
        font: {
          size: 11,
        },
      },

      grid: {
        color: "#eef2f7",
        drawBorder: false,
      },
    },

    x: {
      ticks: {
        color: "#64748b",
        font: {
          size: 11,
          weight: "600",
        },
      },

      grid: {
        display: false,
      },
    },
  },
};
  return (
    <>
      <Sidebar role={role} logout={logout} />
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-container">
          {/* ================= HERO ================= */}
          <div className="hero-section">
            <div className="hero-left">
              <div className="hero-small-title">
                MediStock Dashboard
              </div>
              <h1 className="hero-title">
                {greeting}, {name} 👋
              </h1>
              <p className="hero-subtitle">
                Manage medicines, inventory and suppliers from one place.
              </p>
              <span className="badge role-badge">
                {role}
              </span>
            </div>
            <div className="hero-date">
              <div className="hero-calendar">
                📅
              </div>
              <div>
                <h3>
                  {new Date().toLocaleDateString()}
                </h3>
                <p>
                  Today's Overview
                </p>
              </div>
            </div>
          </div>
          {/* ================= SUMMARY CARDS ================= */}
          <div className="analytics-grid">
            {/* Medicines */}
            <div className="analytics-card blue">
              <div className="analytics-info">
                <p>Total Medicines</p>
                <h2>
                  {analytics.totalMedicines}
                </h2>
                <span>
                  Available Medicines
                </span>
              </div>
              <div className="card-icon">
                💊
              </div>
            </div>
            {/* Suppliers */}
            <div className="analytics-card green">
              <div className="analytics-info">
                <p>Suppliers</p>
                <h2>
                  {analytics.suppliers}
                </h2>
                <span>
                  Registered Suppliers
                </span>
              </div>
              <div className="card-icon">
                🏢
              </div>
            </div>
            {/* Notifications */}
            <div className="analytics-card orange">
              <div className="analytics-info">
                <p>Notifications</p>
                <h2>
                  {totalAlerts}
                </h2>
                <span>
                  Active Alerts
                </span>
              </div>
              <div className="card-icon">
                🔔
              </div>
            </div>
            {/* Expired */}
            <div className="analytics-card red">
              <div className="analytics-info">
                <p>Expired</p>
                <h2>
                  {expired}
                </h2>
                <span>
                  Expired Medicines
                </span>
              </div>
              <div className="card-icon">
                ❌
              </div>
            </div>
            {/* Low Stock */}
            <div className="analytics-card yellow">
              <div className="analytics-info">
                <p>Low Stock</p>
                <h2>
                  {lowStock}
                </h2>
                <span>
                  Need Restocking
                </span>
              </div>
              <div className="card-icon">
                📦
              </div>
            </div>
            {/* Near Expiry */}
            <div className="analytics-card purple">
              <div className="analytics-info">
                <p>Near Expiry</p>
                <h2>
                  {nearExpiry}
                </h2>
                <span>
                  Expiring Soon
                </span>
              </div>
              <div className="card-icon">
                ⏰
              </div>
            </div>
          </div>
          {/* ================= MAIN DASHBOARD AREA ================= */}
          <div className="dashboard-main-grid">
            {/* INVENTORY CHART */}
            <div className="dashboard-panel chart-panel">
              <div className="panel-header">
                <div>
                  <h3>
                    📊 Inventory Overview
                  </h3>
                  <p>
                    Current medicine and inventory status
                  </p>
                </div>
              </div>
              <div className="chart-container">
                <Bar
                  data={chartData}
                  options={chartOptions}
                />
              </div>
            </div>
            {/* ALERT SUMMARY */}
            <div className="dashboard-panel alerts-panel">
              <div className="panel-header">
                <div>
                  <h3>
                    🚨 Important Alerts
                  </h3>
                  <p>
                    Items that need attention
                  </p>
                </div>
              </div>
              {/* Low Stock */}
              <div className="alert-box warning-alert">
                <div className="alert-icon">
                  📦
                </div>
                <div>
                  <strong>
                    Low Stock
                  </strong>
                  <p>
                    {lowStock} medicines need restocking.
                  </p>
                </div>
              </div>
              {/* Near Expiry */}
              <div className="alert-box expiry-alert">
                <div className="alert-icon">
                  ⏰
                </div>
                <div>
                  <strong>
                    Near Expiry
                  </strong>
                  <p>
                    {nearExpiry} medicines are expiring soon.
                  </p>
                </div>
              </div>
              {/* Expired */}
              <div className="alert-box danger-alert">
                <div className="alert-icon">
                  ❌
                </div>
                <div>
                  <strong>
                    Expired Medicines
                  </strong>
                  <p>
                    {expired} medicines have expired.
                  </p>
                </div>
              </div>
              {totalAlerts === 0 && (
                <div className="no-alerts">
                  <span>
                    ✅
                  </span>
                  <p>
                    Everything looks good!
                  </p>
                </div>
              )}
              <Link
                to="/notifications"
                className="view-alerts-btn"
              >
                View All Notifications →
              </Link>
            </div>
          </div>
          {/* ================= RECENT NOTIFICATIONS ================= */}
          <div className="dashboard-panel notifications-panel">
            <div className="panel-header notification-header">
              <div>
                <h3>
                  🔔 Recent Notifications
                </h3>
                <p>
                  Latest system alerts and updates
                </p>
              </div>
              <Link
                to="/notifications"
                className="view-all-link"
              >
                View All →
              </Link>
            </div>
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <div>
                  🔕
                </div>
                <p>
                  No recent notifications
                </p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications
                  .slice(0, 5)
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className="notification-item"
                    >
                      <div className="notification-icon">
                        🔔
                      </div>
                      <div className="notification-content">
                        <h5>
                          {notification.title}
                        </h5>
                        <p>
                          {notification.message}
                        </p>
                        <small>
                          {notification.date}
                        </small>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          {/* ================= QUICK MODULES ================= */}
          <div className="module-shortcuts">
            <Link
              to="/medicines"
              className="module-shortcut"
            >
              <span>💊</span>
              <div>
                <strong>Medicines</strong>
                <small>Manage medicines</small>
              </div>
            </Link>
            <Link
              to="/inventory"
              className="module-shortcut"
            >
              <span>📦</span>
              <div>
                <strong>Inventory</strong>
                <small>Track stock</small>
              </div>
            </Link>
            <Link
              to="/purchaseorders"
              className="module-shortcut"
            >
              <span>📋</span>
              <div>
                <strong>Purchase Orders</strong>
                <small>Manage orders</small>
              </div>
            </Link>
            <Link
              to="/reports"
              className="module-shortcut"
            >
              <span>📊</span>
              <div>
                <strong>Reports</strong>
                <small>Generate reports</small>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
export default Dashboard;