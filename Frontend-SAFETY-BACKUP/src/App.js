import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import "./App.css";


/* =========================================================
   AUTH
========================================================= */

import Login from "./pages/Login";
import Register from "./pages/Register";


/* =========================================================
   ADMIN
========================================================= */

import AdminLayout from "./layouts/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";

import AddSupplier from "./pages/admin/AddSupplier";
import ViewSuppliers from "./pages/admin/ViewSuppliers";

import AddMedicine from "./pages/admin/medicines/AddMedicine";
import ViewMedicines from "./pages/admin/medicines/ViewMedicines";
import EditMedicine from "./pages/admin/medicines/EditMedicine";
import UpdateStock from "./pages/admin/medicines/UpdateStock";

import ManageUsers from "./pages/admin/ManageUsers";

import Reports from "./pages/admin/Reports";

import Settings from "./pages/admin/Settings";

import NotificationPage from "./pages/admin/NotificationPage";


/* =========================================================
   STAFF
========================================================= */

import StaffLayout from "./layouts/StaffLayout";

import StaffDashboard from "./pages/StaffDashboard";


/*
    Staff should ONLY VIEW stock.

    We reuse the existing ViewStock component.
*/
import ViewStock from "./pages/pharmacist/ViewStock";


/* =========================================================
   PHARMACIST
========================================================= */

import PharmacistLayout from "./layouts/PharmacistLayout";

import PharmacistDashboard
    from "./pages/PharmacistDashboard";

import SellMedicine
    from "./pages/pharmacist/SellMedicine";

import ExpiryCheck
    from "./pages/pharmacist/ExpiryCheck";

import SalesHistory
    from "./pages/pharmacist/SalesHistory";


/* =========================================================
   PROTECTED ROUTE
========================================================= */

function ProtectedRoute({
    children,
    allowedRoles
}) {

    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");


    /* =====================================================
       NO TOKEN
    ===================================================== */

    if (!token) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    /* =====================================================
       WRONG ROLE
    ===================================================== */

    if (!allowedRoles.includes(role)) {

        return (
            <Navigate
                to="/unauthorized"
                replace
            />
        );

    }


    return children;

}


/* =========================================================
   UNAUTHORIZED PAGE
========================================================= */

function Unauthorized() {

    return (

        <div className="
            min-h-screen
            flex
            items-center
            justify-center
            bg-gradient-to-br
            from-red-100
            via-white
            to-red-50
            p-6
        ">

            <div className="
                bg-white
                rounded-3xl
                shadow-2xl
                p-10
                text-center
                max-w-md
                w-full
                border
                border-red-100
            ">

                <div className="
                    text-6xl
                    mb-5
                ">
                    🚫
                </div>


                <h1 className="
                    text-3xl
                    font-bold
                    text-red-600
                    mb-3
                ">
                    Access Denied
                </h1>


                <p className="
                    text-gray-600
                    mb-6
                ">
                    You don't have permission
                    to access this page.
                </p>


                <button

                    onClick={() =>
                        window.history.back()
                    }

                    className="
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        px-6
                        py-3
                        rounded-xl
                        font-semibold
                        transition
                    "
                >
                    Go Back
                </button>

            </div>

        </div>

    );

}


/* =========================================================
   404 PAGE
========================================================= */

function NotFound() {

    return (

        <div className="
            min-h-screen
            flex
            items-center
            justify-center
            bg-gradient-to-br
            from-blue-100
            via-cyan-50
            to-white
            p-6
        ">

            <div className="
                text-center
                bg-white
                rounded-3xl
                shadow-xl
                p-10
            ">

                <h1 className="
                    text-7xl
                    font-bold
                    text-blue-700
                ">
                    404
                </h1>


                <p className="
                    text-xl
                    text-gray-600
                    mt-3
                ">
                    Page Not Found
                </p>

            </div>

        </div>

    );

}


/* =========================================================
   APP
========================================================= */

function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* =================================================
                    AUTH
                ================================================= */}

                <Route
                    path="/"
                    element={<Login />}
                />


                <Route
                    path="/register"
                    element={<Register />}
                />



                {/* =================================================
                    ADMIN
                ================================================= */}

                <Route

                    path="/admin"

                    element={

                        <ProtectedRoute
                            allowedRoles={["ADMIN"]}
                        >

                            <AdminLayout />

                        </ProtectedRoute>

                    }

                >

                    {/* ================= DASHBOARD ================= */}

                    <Route
                        path="dashboard"
                        element={
                            <AdminDashboard />
                        }
                    />


                    {/* ================= MEDICINES ================= */}

                    <Route
                        path="add-medicine"
                        element={
                            <AddMedicine />
                        }
                    />


                    <Route
                        path="view-medicines"
                        element={
                            <ViewMedicines />
                        }
                    />


                    <Route
                        path="edit-medicine/:id"
                        element={
                            <EditMedicine />
                        }
                    />


                    {/* ================= UPDATE STOCK ================= */}

                    <Route
                        path="update-stock"
                        element={
                            <UpdateStock />
                        }
                    />


                    {/* ================= SUPPLIERS ================= */}

                    <Route
                        path="add-supplier"
                        element={
                            <AddSupplier />
                        }
                    />


                    <Route
                        path="view-suppliers"
                        element={
                            <ViewSuppliers />
                        }
                    />


                    {/* ================= USERS ================= */}

                    <Route
                        path="users"
                        element={
                            <ManageUsers />
                        }
                    />


                    {/* ================= REPORTS ================= */}

                    <Route
                        path="reports"
                        element={
                            <Reports />
                        }
                    />


                    {/* ================= SETTINGS ================= */}

                    <Route
                        path="settings"
                        element={
                            <Settings />
                        }
                    />


                    {/* ================= NOTIFICATIONS ================= */}

                    <Route
                        path="notifications"
                        element={
                            <NotificationPage />
                        }
                    />

                </Route>



                {/* =================================================
                    STAFF
                ================================================= */}

                <Route

                    path="/staff"

                    element={

                        <ProtectedRoute
                            allowedRoles={["STAFF"]}
                        >

                            <StaffLayout />

                        </ProtectedRoute>

                    }

                >

                    {/* ================= STAFF DASHBOARD ================= */}

                    <Route
                        path="dashboard"
                        element={
                            <StaffDashboard />
                        }
                    />


                    {/* ================= STAFF VIEW STOCK ================= */}

                    <Route
                        path="stock"
                        element={
                            <ViewStock />
                        }
                    />


                    {/* ================= STAFF NOTIFICATIONS ================= */}

                    <Route
                        path="notifications"
                        element={
                            <NotificationPage />
                        }
                    />

                </Route>



                {/* =================================================
                    PHARMACIST
                ================================================= */}

                <Route

                    path="/pharmacist"

                    element={

                        <ProtectedRoute
                            allowedRoles={["PHARMACIST"]}
                        >

                            <PharmacistLayout />

                        </ProtectedRoute>

                    }

                >

                    {/* ================= DASHBOARD ================= */}

                    <Route
                        path="dashboard"
                        element={
                            <PharmacistDashboard />
                        }
                    />


                    {/* ================= SELL MEDICINE ================= */}

                    <Route
                        path="sell"
                        element={
                            <SellMedicine />
                        }
                    />


                    {/* ================= VIEW STOCK ================= */}

                    <Route
                        path="stock"
                        element={
                            <ViewStock />
                        }
                    />


                    {/* ================= EXPIRY ================= */}

                    <Route
                        path="expiry"
                        element={
                            <ExpiryCheck />
                        }
                    />


                    {/* ================= SALES HISTORY ================= */}

                    <Route
                        path="sales"
                        element={
                            <SalesHistory />
                        }
                    />


                    {/* ================= NOTIFICATIONS ================= */}

                    <Route
                        path="notifications"
                        element={
                            <NotificationPage />
                        }
                    />

                </Route>



                {/* =================================================
                    UNAUTHORIZED
                ================================================= */}

                <Route
                    path="/unauthorized"
                    element={
                        <Unauthorized />
                    }
                />



                {/* =================================================
                    404
                ================================================= */}

                <Route
                    path="*"
                    element={
                        <NotFound />
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}


export default App;