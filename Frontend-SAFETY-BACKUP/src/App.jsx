import { BrowserRouter, Routes, Route } from "react-router-dom";

import PharmacistAddMedicine from "./pages/PharmacistAddMedicine";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import AddMedicine from "./pages/AddMedicine";
import Medicines from "./pages/Medicines";
import AddSupplier from "./pages/AddSupplier";
import Suppliers from "./pages/Suppliers";
import EditSupplier from "./pages/EditSupplier";
import AddUser from "./pages/AddUser";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import StockReport from "./pages/StockReport";
import ExpiryReport from "./pages/ExpiryReport";
import SupplierReport from "./pages/SupplierReport";
import Notifications from "./pages/Notifications";
import StaffDashboard from "./pages/StaffDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Admin */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/add-medicine" element={<AddMedicine />} />
        <Route path="/medicines" element={<Medicines />} />

        {/* Suppliers */}
        <Route path="/add-supplier" element={<AddSupplier />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/edit-supplier/:id" element={<EditSupplier />} />

        {/* Users */}
        <Route path="/users" element={<Users />} />
        <Route path="/add-user" element={<AddUser />} />

        {/* Reports */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/stock-report" element={<StockReport />} />
        <Route path="/expiry-report" element={<ExpiryReport />} />
        <Route path="/supplier-report" element={<SupplierReport />} />

        {/* Analytics */}

        {/* Notifications */}
        <Route path="/notifications" element={<Notifications />} />

        {/* Pharmacist */}
        <Route
          path="/pharmacist-dashboard"
          element={<PharmacistDashboard />}
        />

        <Route
          path="/pharmacist-add-medicine"
          element={<PharmacistAddMedicine />}
        />

        {/* Staff */}
        <Route
          path="/staff-dashboard"
          element={<StaffDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;