import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import NotificationPanel from "../../components/admin/NotificationPanel";


function NotificationPage() {

    // =========================================================
    // STATES
    // =========================================================

    const [notifications, setNotifications] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =========================================================
    // FETCH NOTIFICATIONS
    // =========================================================

    const fetchNotifications = useCallback(async () => {

        try {

            setLoading(true);

            setError("");

            const token =
                localStorage.getItem("token");


            // -------------------------------------------------
            // TOKEN CHECK
            // -------------------------------------------------

            if (!token) {

                setError(
                    "Login session expired. Please login again."
                );

                setNotifications([]);

                return;

            }


            // -------------------------------------------------
            // API REQUEST
            // -------------------------------------------------

            const response = await axios.get(

                "http://localhost:8080/api/notifications",

                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );


            // -------------------------------------------------
            // RESPONSE CHECK
            // -------------------------------------------------

            if (Array.isArray(response.data)) {

                setNotifications(response.data);

            }
            else {

                setNotifications([]);

                setError(
                    "Invalid notification data received from server."
                );

            }

        }

        catch (error) {

            console.error(
                "Notification Fetch Error:",
                error.response?.data ||
                error.message
            );


            if (error.response?.status === 401) {

                setError(
                    "Unauthorized. Please login again."
                );

            }

            else if (error.response?.status === 403) {

                setError(
                    "You do not have permission to view notifications."
                );

            }

            else if (!error.response) {

                setError(
                    "Backend server is not running."
                );

            }

            else {

                setError(
                    "Unable to load notifications."
                );

            }


            setNotifications([]);

        }

        finally {

            setLoading(false);

        }

    }, []);


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        fetchNotifications();

    }, [fetchNotifications]);


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div
            style={{
                minHeight: "100vh",
                padding: "30px",
                background:
                    "linear-gradient(135deg, #eff6ff 0%, #ecfeff 50%, #f8fafc 100%)",
                boxSizing: "border-box"
            }}
        >

            <div
                style={{
                    width: "100%",
                    maxWidth: "1400px",
                    margin: "0 auto"
                }}
            >

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        style={{
                            marginBottom: "20px",
                            padding: "15px 18px",
                            borderRadius: "12px",
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            color: "#b91c1c",
                            fontSize: "14px",
                            fontWeight: "600"
                        }}
                    >

                        {error}

                    </div>

                )}


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading ? (

                    <div
                        style={{
                            background: "white",
                            borderRadius: "20px",
                            padding: "60px 20px",
                            textAlign: "center",
                            boxShadow:
                                "0 10px 30px rgba(15,23,42,0.08)"
                        }}
                    >

                        <div
                            style={{
                                width: "42px",
                                height: "42px",
                                margin: "0 auto 15px",
                                border: "4px solid #dbeafe",
                                borderTop:
                                    "4px solid #2563eb",
                                borderRadius: "50%",
                                animation:
                                    "notification-spin 1s linear infinite"
                            }}
                        />

                        <h3
                            style={{
                                margin: 0,
                                color: "#1e293b"
                            }}
                        >
                            Loading Notifications
                        </h3>

                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "14px"
                            }}
                        >
                            Please wait...
                        </p>

                    </div>

                ) : (

                    /* =================================================
                       NOTIFICATION PANEL
                    ================================================= */

                    <NotificationPanel

                        notifications={notifications}

                        refreshNotifications={
                            fetchNotifications
                        }

                    />

                )}

            </div>


            {/* =====================================================
                ANIMATION
            ===================================================== */}

            <style>

                {`

                    @keyframes notification-spin {

                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }

                    }

                `}

            </style>

        </div>

    );

}


export default NotificationPage;
