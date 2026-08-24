import Navbar from "../components/Navbar";
import "../styles/dashboard.css";
import { useEffect, useState } from "react";
import api from "../services/api";
import { FaBell } from "react-icons/fa";

function AdminDashboard() {

    // =====================================================
    // DASHBOARD DATA
    // =====================================================

    const [dashboardData, setDashboardData] = useState({
        totalMedicines: 0,
        lowStockMedicines: 0,
        goingToExpire: 0,
        expiredMedicines: 0
    });


    // =====================================================
    // REGISTRATION REQUESTS
    // =====================================================

    const [registrationRequests, setRegistrationRequests] =
        useState([]);

    const [showRegistrationNotifications,
        setShowRegistrationNotifications] =
        useState(false);


    // =====================================================
    // LOAD DASHBOARD DATA
    // =====================================================

    const loadDashboard = async () => {

        try {

            const response = await api.get(
                "/medicines/dashboard-summary"
            );

            setDashboardData(response.data);

        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );

        }

    };


    // =====================================================
    // LOAD STAFF / PHARMACIST REGISTRATION REQUESTS
    // =====================================================

    const loadRegistrationRequests = async () => {

        try {

            const response = await api.get(
                "/admin/registration-requests"
            );

            console.log(
                "Registration requests:",
                response.data
            );

            setRegistrationRequests(
                response.data || []
            );

        } catch (error) {

            console.error(
                "Registration request error:",
                error
            );

        }

    };


    // =====================================================
    // APPROVE STAFF / PHARMACIST
    // =====================================================

    const approveRegistration = async (userId) => {

        try {

            await api.put(
                `/admin/registration-requests/${userId}/approve`
            );

            alert(
                "User approved successfully ✅"
            );

            // Reload pending requests
            await loadRegistrationRequests();

        } catch (error) {

            console.error(
                "Approval error:",
                error
            );

            alert(
                error.response?.data ||
                "Unable to approve user."
            );

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadDashboard();

        loadRegistrationRequests();


        // Check new registration requests
        // every 10 seconds

        const interval = setInterval(() => {

            loadRegistrationRequests();

        }, 10000);


        return () => {

            clearInterval(interval);

        };

    }, []);


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="admin-dashboard">

            {/* =================================================
                NAVBAR
            ================================================= */}

            <div className="admin-navbar-wrapper">

                <Navbar />


                {/* =============================================
                    REGISTRATION NOTIFICATION BELL
                ============================================= */}

                <div className="registration-notification-wrapper">

                    <FaBell
                        className="registration-bell"
                        onClick={() =>
                            setShowRegistrationNotifications(
                                !showRegistrationNotifications
                            )
                        }
                    />


                    {/* Notification count */}

                    {registrationRequests.length > 0 && (

                        <span className="registration-notification-count">

                            {registrationRequests.length}

                        </span>

                    )}


                    {/* =========================================
                        NOTIFICATION PANEL
                    ========================================= */}

                    {showRegistrationNotifications && (

                        <div className="registration-notification-panel">

                            <h3>
                                🔔 Registration Requests
                            </h3>


                            {registrationRequests.length === 0 ? (

                                <p className="no-registration-request">

                                    No new registration requests.

                                </p>

                            ) : (

                                registrationRequests.map((user) => (

                                    <div
                                        className="registration-request"
                                        key={user.id}
                                    >

                                        <div className="registration-user-info">

                                            <strong>
                                                {user.fullName}
                                            </strong>


                                            <span>
                                                {user.role}
                                            </span>


                                            <small>
                                                {user.email}
                                            </small>

                                        </div>


                                        <button
                                            className="accept-registration-btn"
                                            onClick={() =>
                                                approveRegistration(
                                                    user.id
                                                )
                                            }
                                        >

                                            ✓ Accept

                                        </button>

                                    </div>

                                ))

                            )}

                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
                DASHBOARD CONTENT
            ================================================= */}

            <div className="dashboard-container">

                <h1>
                    Medical Inventory Management Platform
                </h1>


                <h2>
                    Dashboard
                </h2>


                {/* =================================================
                    DASHBOARD CARDS
                ================================================= */}

                <div className="cards">


                    {/* TOTAL MEDICINES */}

                    <div className="card blue">

                        <h3>
                            💊 Total Medicines
                        </h3>

                        <p>
                            {dashboardData.totalMedicines}
                        </p>

                    </div>


                    {/* LOW STOCK */}

                    <div className="card red">

                        <h3>
                            ⚠ Low Stock Medicines
                        </h3>

                        <p>
                            {dashboardData.lowStockMedicines}
                        </p>

                    </div>


                    {/* GOING TO EXPIRE */}

                    <div className="card yellow">

                        <h3>
                            ⏳ Going To Expire
                        </h3>

                        <p>
                            {dashboardData.goingToExpire}
                        </p>

                    </div>


                    {/* EXPIRED */}

                    <div className="card orange">

                        <h3>
                            🚫 Expired Medicines
                        </h3>

                        <p>
                            {dashboardData.expiredMedicines}
                        </p>

                    </div>


                </div>


                {/* =================================================
                    WELCOME BOX
                ================================================= */}

                <div className="welcome-box">

                    <h2>
                        Welcome to MediStock
                    </h2>

                    <p>
                        Manage medicines, monitor stock levels
                        and track expiry dates easily.
                    </p>

                </div>


            </div>

        </div>

    );

}

export default AdminDashboard;