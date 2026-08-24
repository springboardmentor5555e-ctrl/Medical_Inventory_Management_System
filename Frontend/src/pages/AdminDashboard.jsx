import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
    FaBell,
    FaMoon,
    FaUserCircle
} from "react-icons/fa";

import api from "../services/api";
import "../styles/dashboard.css";


function AdminDashboard() {

    const navigate = useNavigate();


    // =====================================================
    // DASHBOARD DATA
    // =====================================================

    const [dashboardData, setDashboardData] = useState({
        totalMedicines: 0,
        totalStock: 0,
        lowStockMedicines: 0,
        expiredMedicines: 0,
        totalSuppliers: 0
    });


    const [lowStockList, setLowStockList] = useState([]);
    const [expiryList, setExpiryList] = useState([]);
    const [expiredList, setExpiredList] = useState([]);


    // =====================================================
    // UI STATES
    // =====================================================

    const [darkMode, setDarkMode] = useState(false);

    const [showProfile, setShowProfile] = useState(false);

    const profileRef = useRef(null);


    // =====================================================
    // REGISTRATION REQUEST STATES
    // =====================================================

    const [registrationRequests, setRegistrationRequests] =
        useState([]);

    const [
        showRegistrationNotifications,
        setShowRegistrationNotifications
    ] = useState(false);


    // =====================================================
    // GET ERROR MESSAGE
    // =====================================================

    const getErrorMessage = (error, defaultMessage) => {

        const responseData = error?.response?.data;


        if (!responseData) {
            return defaultMessage;
        }


        if (typeof responseData === "string") {
            return responseData;
        }


        if (responseData.message) {
            return responseData.message;
        }


        if (responseData.error) {
            return responseData.error;
        }


        if (responseData.detail) {
            return responseData.detail;
        }


        try {

            return JSON.stringify(responseData);

        } catch {

            return defaultMessage;

        }

    };


    // =====================================================
    // LOAD REGISTRATION REQUESTS
    // =====================================================

    const loadRegistrationRequests = async () => {

        try {

            const response = await api.get(
                "/admin/registration-requests"
            );


            console.log(
                "Registration Requests:",
                response.data
            );


            if (Array.isArray(response.data)) {

                setRegistrationRequests(
                    response.data
                );

            } else {

                setRegistrationRequests([]);

            }


        } catch (error) {

            console.error(
                "Registration request error:",
                error
            );

            setRegistrationRequests([]);

        }

    };


    // =====================================================
    // APPROVE REGISTRATION
    // =====================================================

    const approveRegistration = async (userId) => {

        if (!userId) {

            alert("Invalid user ID.");

            return;

        }


        try {

            console.log(
                "Approving user ID:",
                userId
            );


            const response = await api.put(
                `/admin/registration-requests/${userId}/approve`
            );


            console.log(
                "Approval response:",
                response.data
            );


            alert(
                "User approved successfully ✅"
            );


            // Remove immediately from notification list

            setRegistrationRequests(
                (previous) =>
                    previous.filter(
                        (user) =>
                            user.id !== userId
                    )
            );


            // Get latest list from backend

            await loadRegistrationRequests();


        } catch (error) {

            console.error(
                "Approval error:",
                error
            );


            console.error(
                "Status:",
                error?.response?.status
            );


            console.error(
                "Backend response:",
                error?.response?.data
            );


            const message =
                getErrorMessage(
                    error,
                    "Unable to approve user."
                );


            alert(message);

        }

    };


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    const loadDashboard = async () => {

        // -----------------------------------------------
        // DASHBOARD SUMMARY
        // -----------------------------------------------

        try {

            const response = await api.get(
                "/medicines/dashboard-summary"
            );


            console.log(
                "Dashboard:",
                response.data
            );


            if (response.data) {

                setDashboardData(
                    (previous) => ({
                        ...previous,
                        ...response.data
                    })
                );

            }


        } catch (error) {

            console.error(
                "Dashboard API error:",
                error
            );

        }


        // -----------------------------------------------
        // LOW STOCK
        // -----------------------------------------------

        try {

            const response = await api.get(
                "/medicines/low-stock"
            );


            setLowStockList(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );


        } catch (error) {

            console.error(
                "Low stock API error:",
                error
            );

            setLowStockList([]);

        }


        // -----------------------------------------------
        // EXPIRY
        // -----------------------------------------------

        try {

            const response = await api.get(
                "/medicines/expired"
            );


            const medicines =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            setExpiryList(medicines);

            setExpiredList(medicines);


        } catch (error) {

            console.error(
                "Expiry API error:",
                error
            );

            setExpiryList([]);

            setExpiredList([]);

        }


        // -----------------------------------------------
        // SUPPLIERS
        // -----------------------------------------------

        try {

            const response = await api.get(
                "/suppliers"
            );


            if (Array.isArray(response.data)) {

                setDashboardData(
                    (previous) => ({
                        ...previous,
                        totalSuppliers:
                            response.data.length
                    })
                );

            }


        } catch (error) {

            console.error(
                "Supplier API error:",
                error
            );

        }

    };


    // =====================================================
    // LOAD EVERYTHING WHEN PAGE OPENS
    // =====================================================

    useEffect(() => {

        loadDashboard();

        loadRegistrationRequests();


        const interval = setInterval(() => {

            loadDashboard();

            loadRegistrationRequests();

        }, 10000);


        return () => {

            clearInterval(interval);

        };

    }, []);


    // =====================================================
    // CLOSE PROFILE WHEN CLICKING OUTSIDE
    // =====================================================

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                profileRef.current &&
                !profileRef.current.contains(
                    event.target
                )
            ) {

                setShowProfile(false);

            }

        };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");

        navigate("/");

    };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div
            className={
                darkMode
                    ? "dashboard dark"
                    : "dashboard"
            }
        >


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <div className="sidebar">


                {/* ADMIN PROFILE */}

                <div className="admin-profile">

                    <div className="profile-icon">
                        👤
                    </div>


                    <h3>
                        PATLOLLA ASHRITHA
                    </h3>


                    <p>
                        Administrator
                    </p>

                </div>


                {/* LOGO */}

                <h2 className="logo">
                    MediStock 🩺
                </h2>


                {/* SIDEBAR BUTTONS */}

                <button
                    onClick={() =>
                        navigate(
                            "/admin-dashboard"
                        )
                    }
                >
                    🏠 Dashboard
                </button>


                <button
                    onClick={() =>
                        navigate(
                            "/add-medicine"
                        )
                    }
                >
                    💊 Add Medicines
                </button>


                <button
                    onClick={() =>
                        navigate(
                            "/medicines"
                        )
                    }
                >
                    📦 Medicines Present
                </button>


                <button
                    onClick={() =>
                        navigate(
                            "/add-supplier"
                        )
                    }
                >
                    🏢 Add Suppliers
                </button>


                <button
                    onClick={() =>
                        navigate(
                            "/suppliers"
                        )
                    }
                >
                    🚚 Suppliers
                </button>


                <button
                    onClick={() =>
                        navigate(
                            "/users"
                        )
                    }
                >
                    👥 Users
                </button>


                <button
                    onClick={() =>
                        navigate(
                            "/analytics"
                        )
                    }
                >
                    📈 Analytics
                </button>


                <button
                    onClick={() =>
                        navigate(
                            "/reports"
                        )
                    }
                >
                    📊 Reports
                </button>


                <button
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>


            </div>


            {/* =================================================
                MAIN
            ================================================= */}

            <div className="main">


                {/* =================================================
                    TOP BAR
                ================================================= */}

                <div className="topbar">


                    <h1>
                        Medicine Supply Inventory System
                    </h1>


                    <div className="icons">


                        {/* =========================================
                            REGISTRATION NOTIFICATION
                        ========================================= */}

                        <div
                            className="
                                registration-notification-wrapper
                            "
                        >


                            <FaBell
                                className="icon-btn"
                                onClick={() =>
                                    setShowRegistrationNotifications(
                                        (previous) =>
                                            !previous
                                    )
                                }
                            />


                            {registrationRequests.length >
                                0 && (

                                <span
                                    className="
                                        registration-notification-count
                                    "
                                >
                                    {
                                        registrationRequests.length
                                    }
                                </span>

                            )}


                            {/* =====================================
                                REGISTRATION PANEL
                            ===================================== */}

                            {showRegistrationNotifications && (

                                <div
                                    className="
                                        registration-notification-panel
                                    "
                                >


                                    <h3>
                                        🔔 Registration Requests
                                    </h3>


                                    {registrationRequests.length ===
                                    0 ? (

                                        <p
                                            className="
                                                no-registration-request
                                            "
                                        >
                                            No new registration requests.
                                        </p>

                                    ) : (

                                        registrationRequests.map(
                                            (user) => (

                                                <div
                                                    className="
                                                        registration-request
                                                    "
                                                    key={
                                                        user.id
                                                    }
                                                >


                                                    <div
                                                        className="
                                                            registration-user-info
                                                        "
                                                    >


                                                        <strong>
                                                            {
                                                                user.fullName
                                                            }
                                                        </strong>


                                                        <span>
                                                            {
                                                                user.role
                                                            }
                                                        </span>


                                                        <small>
                                                            {
                                                                user.email
                                                            }
                                                        </small>


                                                        {user.phone && (

                                                            <small>
                                                                📱{" "}
                                                                {
                                                                    user.phone
                                                                }
                                                            </small>

                                                        )}

                                                    </div>


                                                    <button
                                                        type="button"
                                                        className="
                                                            accept-registration-btn
                                                        "
                                                        onClick={() =>
                                                            approveRegistration(
                                                                user.id
                                                            )
                                                        }
                                                    >
                                                        ✓ Accept
                                                    </button>


                                                </div>

                                            )
                                        )

                                    )}


                                </div>

                            )}

                        </div>


                        {/* =========================================
                            DARK MODE
                        ========================================= */}

                        <FaMoon
                            onClick={() =>
                                setDarkMode(
                                    (previous) =>
                                        !previous
                                )
                            }
                            className="icon-btn"
                        />


                        {/* =========================================
                            PROFILE
                        ========================================= */}

                        <div
                            ref={profileRef}
                            className="profile-wrapper"
                        >


                            <FaUserCircle
                                onClick={(event) => {

                                    event.stopPropagation();

                                    setShowProfile(
                                        (previous) =>
                                            !previous
                                    );

                                }}
                                className="icon-btn"
                            />


                            {showProfile && (

                                <div
                                    className="profile-box"
                                >

                                    <h3>
                                        👤 Admin Profile
                                    </h3>


                                    <p>
                                        <b>Name:</b>{" "}
                                        Patlolla Ashritha
                                    </p>


                                    <p>
                                        <b>Email:</b>{" "}
                                        patlollaashritha111@gmail.com
                                    </p>


                                    <p>
                                        <b>Role:</b>{" "}
                                        Admin
                                    </p>

                                </div>

                            )}

                        </div>


                    </div>

                </div>


                {/* =================================================
                    WELCOME
                ================================================= */}

                <div className="welcome">

                    <h2>
                        Welcome Admin 👋
                    </h2>


                    <p>
                        Manage your medicine inventory efficiently
                    </p>

                </div>


                {/* =================================================
                    DASHBOARD CARDS
                ================================================= */}

                <div className="cards">


                    <div className="card">

                        <h3>
                            💊 Total Medicines
                        </h3>


                        <h1>
                            {
                                dashboardData.totalMedicines
                            }
                        </h1>

                    </div>


                    <div className="card">

                        <h3>
                            ⚠ Low Stock Medicines
                        </h3>


                        <h1>
                            {
                                dashboardData.lowStockMedicines
                            }
                        </h1>

                    </div>


                    <div className="card">

                        <h3>
                            🏢 Total Suppliers
                        </h3>


                        <h1>
                            {
                                dashboardData.totalSuppliers
                            }
                        </h1>

                    </div>


                    <div className="card">

                        <h3>
                            🚫 Expired Medicines
                        </h3>


                        <h1>
                            {
                                dashboardData.expiredMedicines
                            }
                        </h1>

                    </div>


                </div>


                {/* =================================================
                    ALERTS
                ================================================= */}

                <div className="alerts-container">


                    {/* LOW STOCK */}

                    <div className="low-stock-box">


                        <h2>
                            ⚠ Low Stock Medicines
                        </h2>


                        {lowStockList.length === 0 ? (

                            <p className="no-stock">
                                No medicines are low in stock.
                            </p>

                        ) : (

                            lowStockList.map(
                                (medicine) => (

                                    <div
                                        className="
                                            low-stock-item
                                        "
                                        key={
                                            medicine.id
                                        }
                                    >


                                        <div>
                                            💊{" "}
                                            <strong>
                                                {
                                                    medicine.name
                                                }
                                            </strong>
                                        </div>


                                        <span className="qty">
                                            Qty:{" "}
                                            {
                                                medicine.quantity
                                            }
                                        </span>


                                    </div>

                                )
                            )

                        )}

                    </div>


                    {/* EXPIRY */}

                    <div className="low-stock-box">


                        <h2>
                            ⏳ Expiry Alert Medicines
                        </h2>


                        {expiryList.length === 0 ? (

                            <p className="no-stock">
                                No expiry alerts.
                            </p>

                        ) : (

                            expiryList.map(
                                (medicine) => (

                                    <div
                                        className="
                                            low-stock-item
                                        "
                                        key={
                                            medicine.id
                                        }
                                    >


                                        <div>
                                            💊{" "}
                                            <strong>
                                                {
                                                    medicine.name
                                                }
                                            </strong>
                                        </div>


                                        <span className="qty">
                                            Expiry:{" "}
                                            {
                                                medicine.expiryDate
                                            }
                                        </span>


                                    </div>

                                )
                            )

                        )}

                    </div>


                    {/* EXPIRED */}

                    <div className="low-stock-box">


                        <h2>
                            🚫 Expired Medicines
                        </h2>


                        {expiredList.length === 0 ? (

                            <p className="no-stock">
                                No expired medicines.
                            </p>

                        ) : (

                            expiredList.map(
                                (medicine) => (

                                    <div
                                        className="
                                            low-stock-item
                                        "
                                        key={
                                            medicine.id
                                        }
                                    >


                                        <div>
                                            💊{" "}
                                            <strong>
                                                {
                                                    medicine.name
                                                }
                                            </strong>
                                        </div>


                                        <span className="qty">
                                            Expired:{" "}
                                            {
                                                medicine.expiryDate
                                            }
                                        </span>


                                    </div>

                                )
                            )

                        )}

                    </div>


                </div>


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <div className="quick-actions">


                    <h2>
                        ⚡ Quick Actions
                    </h2>


                    <div className="quick-buttons">


                        <button
                            className="primary-btn"
                            onClick={() =>
                                navigate(
                                    "/add-medicine"
                                )
                            }
                        >
                            💊 Add Medicine
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    "/add-supplier"
                                )
                            }
                        >
                            🏢 Add Supplier
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    "/users"
                                )
                            }
                        >
                            👥 Manage Users
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    "/reports"
                                )
                            }
                        >
                            📊 Reports
                        </button>


                    </div>

                </div>


            </div>

        </div>

    );

}


export default AdminDashboard;