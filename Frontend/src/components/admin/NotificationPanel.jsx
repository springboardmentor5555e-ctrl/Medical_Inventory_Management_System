import {
    FaBell,
    FaCheckCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaCheck,
    FaSyncAlt,
    FaClock,
    FaCircle,
    FaShieldAlt,
    FaArrowRight,
    FaInbox
} from "react-icons/fa";

import axios from "axios";
import { useMemo, useState } from "react";


function NotificationPanel({
    notifications = [],
    refreshNotifications
}) {

    const API =
        "http://localhost:8080/api/notifications";


    // =========================================================
    // STATE
    // =========================================================

    const [filter, setFilter] =
        useState("ALL");

    const [processingId, setProcessingId] =
        useState(null);

    const [markingAll, setMarkingAll] =
        useState(false);

    const [refreshing, setRefreshing] =
        useState(false);


    // =========================================================
    // COUNTS
    // =========================================================

    const totalNotifications =
        notifications.length;


    const unreadNotifications =
        notifications.filter(
            notification =>
                !notification.isRead
        ).length;


    const readNotifications =
        notifications.filter(
            notification =>
                notification.isRead
        ).length;


    // =========================================================
    // FILTERED NOTIFICATIONS
    // =========================================================

    const filteredNotifications =
        useMemo(() => {

            if (filter === "UNREAD") {

                return notifications.filter(
                    notification =>
                        !notification.isRead
                );

            }


            if (filter === "READ") {

                return notifications.filter(
                    notification =>
                        notification.isRead
                );

            }


            return notifications;

        }, [notifications, filter]);


    // =========================================================
    // MARK SINGLE AS READ
    // =========================================================

    const markAsRead = async (id) => {

        try {

            setProcessingId(id);

            await axios.put(

                `${API}/${id}/read`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("token")}`
                    }
                }

            );


            if (refreshNotifications) {

                await refreshNotifications();

            }

        }
        catch (error) {

            console.error(
                "Mark as read error:",
                error.response?.data ||
                error.message
            );

        }
        finally {

            setProcessingId(null);

        }

    };


    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    const markAllAsRead = async () => {

        try {

            setMarkingAll(true);

            await axios.put(

                `${API}/read-all`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("token")}`
                    }
                }

            );


            if (refreshNotifications) {

                await refreshNotifications();

            }

        }
        catch (error) {

            console.error(
                "Mark all as read error:",
                error.response?.data ||
                error.message
            );

        }
        finally {

            setMarkingAll(false);

        }

    };


    // =========================================================
    // REFRESH
    // =========================================================

    const handleRefresh = async () => {

        try {

            setRefreshing(true);

            if (refreshNotifications) {

                await refreshNotifications();

            }

        }
        catch (error) {

            console.error(error);

        }
        finally {

            setRefreshing(false);

        }

    };


    // =========================================================
    // NOTIFICATION TYPE STYLE
    // =========================================================

    const getNotificationStyle = (type) => {

        switch (type) {

            case "STOCK":

                return {

                    icon: <FaExclamationTriangle />,

                    iconColor: "#d97706",

                    iconBackground: "#fffbeb",

                    badge: "Low Stock",

                    badgeColor: "#b45309",

                    badgeBackground: "#fef3c7",

                    borderColor: "#fde68a",

                    accent: "#f59e0b"

                };


            case "EXPIRY":

                return {

                    icon: <FaExclamationTriangle />,

                    iconColor: "#dc2626",

                    iconBackground: "#fef2f2",

                    badge: "Expiry Alert",

                    badgeColor: "#b91c1c",

                    badgeBackground: "#fee2e2",

                    borderColor: "#fecaca",

                    accent: "#ef4444"

                };


            case "SYSTEM":

                return {

                    icon: <FaCheckCircle />,

                    iconColor: "#15803d",

                    iconBackground: "#f0fdf4",

                    badge: "System",

                    badgeColor: "#166534",

                    badgeBackground: "#dcfce7",

                    borderColor: "#bbf7d0",

                    accent: "#22c55e"

                };


            default:

                return {

                    icon: <FaInfoCircle />,

                    iconColor: "#2563eb",

                    iconBackground: "#eff6ff",

                    badge: "Information",

                    badgeColor: "#1d4ed8",

                    badgeBackground: "#dbeafe",

                    borderColor: "#bfdbfe",

                    accent: "#3b82f6"

                };

        }

    };


    // =========================================================
    // DATE FORMAT
    // =========================================================

    const formatDate = (date) => {

        if (!date) {

            return "Unknown date";

        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "Unknown date";

        }


        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // =========================================================
    // STAT CARD
    // =========================================================

    const StatCard = ({
        icon,
        title,
        value,
        description,
        background,
        color
    }) => {

        return (

            <div
                className="notification-stat-card"
                style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "18px",
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    transition:
                        "all .2s ease"
                }}
            >

                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        flexShrink: 0,
                        borderRadius: "14px",
                        background,
                        color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "19px"
                    }}
                >

                    {icon}

                </div>


                <div
                    style={{
                        minWidth: 0
                    }}
                >

                    <p
                        style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "#64748b",
                            fontWeight: "700"
                        }}
                    >

                        {title}

                    </p>


                    <div
                        style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "8px",
                            marginTop: "3px"
                        }}
                    >

                        <strong
                            style={{
                                fontSize: "25px",
                                color: "#0f172a",
                                fontWeight: "800"
                            }}
                        >

                            {value}

                        </strong>

                    </div>


                    <p
                        style={{
                            margin:
                                "2px 0 0",
                            fontSize: "11px",
                            color: "#94a3b8"
                        }}
                    >

                        {description}

                    </p>

                </div>

            </div>

        );

    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <div
            className="notification-page"
            style={{
                minHeight: "100%",
                background:
                    "#f8fafc",
                padding: "30px"
            }}
        >

            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto"
                }}
            >

                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        gap: "20px",
                        marginBottom: "25px",
                        flexWrap: "wrap"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px"
                        }}
                    >

                        <div
                            style={{
                                width: "58px",
                                height: "58px",
                                borderRadius: "16px",
                                background:
                                    "linear-gradient(135deg,#2563eb,#1d4ed8)",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "23px",
                                boxShadow:
                                    "0 8px 20px rgba(37,99,235,.20)"
                            }}
                        >

                            <FaBell />

                        </div>


                        <div>

                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: "28px",
                                    fontWeight: "800",
                                    color: "#0f172a",
                                    letterSpacing:
                                        "-0.5px"
                                }}
                            >

                                Notifications

                            </h1>


                            <p
                                style={{
                                    margin:
                                        "5px 0 0",
                                    color: "#64748b",
                                    fontSize: "13px"
                                }}
                            >

                                Monitor medicine stock,
                                expiry alerts and
                                system activity.

                            </p>

                        </div>

                    </div>


                    {/* REFRESH */}

                    <button

                        onClick={handleRefresh}

                        disabled={refreshing}

                        className="notification-refresh-button"

                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                            border:
                                "1px solid #dbe2ea",
                            background:
                                "#ffffff",
                            color: "#334155",
                            padding:
                                "11px 17px",
                            borderRadius: "11px",
                            cursor:
                                refreshing
                                    ? "not-allowed"
                                    : "pointer",
                            fontWeight: "700",
                            fontSize: "13px",
                            boxShadow:
                                "0 2px 6px rgba(15,23,42,.04)",
                            opacity:
                                refreshing
                                    ? .65
                                    : 1
                        }}
                    >

                        <FaSyncAlt
                            style={{
                                animation:
                                    refreshing
                                        ? "notificationSpin 1s linear infinite"
                                        : "none"
                            }}
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}

                    </button>

                </div>


                {/* =====================================================
                    STATISTICS
                ===================================================== */}

                <div
                    className="notification-stats"
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(3,1fr)",
                        gap: "16px",
                        marginBottom: "25px"
                    }}
                >

                    <StatCard

                        icon={<FaBell />}

                        title="Total Notifications"

                        value={
                            totalNotifications
                        }

                        description="All system notifications"

                        background="#eff6ff"

                        color="#2563eb"

                    />


                    <StatCard

                        icon={
                            <FaExclamationTriangle />
                        }

                        title="Unread Alerts"

                        value={
                            unreadNotifications
                        }

                        description="Require your attention"

                        background="#fff7ed"

                        color="#ea580c"

                    />


                    <StatCard

                        icon={
                            <FaCheckCircle />
                        }

                        title="Read Notifications"

                        value={
                            readNotifications
                        }

                        description="Already reviewed"

                        background="#f0fdf4"

                        color="#16a34a"

                    />

                </div>


                {/* =====================================================
                    MAIN PANEL
                ===================================================== */}

                <div
                    style={{
                        background: "#ffffff",
                        border:
                            "1px solid #e5e7eb",
                        borderRadius: "20px",
                        overflow: "hidden",
                        boxShadow:
                            "0 8px 25px rgba(15,23,42,.05)"
                    }}
                >

                    {/* =================================================
                        TOOLBAR
                    ================================================= */}

                    <div
                        style={{
                            padding:
                                "18px 22px",
                            borderBottom:
                                "1px solid #e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            gap: "15px",
                            flexWrap: "wrap"
                        }}
                    >

                        {/* FILTERS */}

                        <div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: "5px",
                                    background:
                                        "#f8fafc",
                                    padding: "4px",
                                    border:
                                        "1px solid #e2e8f0",
                                    borderRadius:
                                        "11px"
                                }}
                            >

                                {[
                                    [
                                        "ALL",
                                        "All",
                                        totalNotifications
                                    ],
                                    [
                                        "UNREAD",
                                        "Unread",
                                        unreadNotifications
                                    ],
                                    [
                                        "READ",
                                        "Read",
                                        readNotifications
                                    ]
                                ].map(
                                    ([
                                        value,
                                        label,
                                        count
                                    ]) => (

                                        <button

                                            key={value}

                                            onClick={() =>
                                                setFilter(
                                                    value
                                                )
                                            }

                                            style={{
                                                border:
                                                    "none",
                                                borderRadius:
                                                    "8px",
                                                padding:
                                                    "8px 13px",
                                                background:
                                                    filter ===
                                                    value
                                                        ? "#ffffff"
                                                        : "transparent",
                                                color:
                                                    filter ===
                                                    value
                                                        ? "#2563eb"
                                                        : "#64748b",
                                                fontWeight:
                                                    filter ===
                                                    value
                                                        ? "800"
                                                        : "600",
                                                cursor:
                                                    "pointer",
                                                boxShadow:
                                                    filter ===
                                                    value
                                                        ? "0 2px 7px rgba(15,23,42,.08)"
                                                        : "none"
                                            }}
                                        >

                                            {label}

                                            <span
                                                style={{
                                                    marginLeft:
                                                        "7px",
                                                    fontSize:
                                                        "10px",
                                                    padding:
                                                        "2px 6px",
                                                    borderRadius:
                                                        "20px",
                                                    background:
                                                        filter ===
                                                        value
                                                            ? "#eff6ff"
                                                            : "#e2e8f0",
                                                    color:
                                                        filter ===
                                                        value
                                                            ? "#2563eb"
                                                            : "#64748b"
                                                }}
                                            >

                                                {count}

                                            </span>

                                        </button>

                                    )
                                )}

                            </div>

                        </div>


                        {/* MARK ALL */}

                        {unreadNotifications > 0 && (

                            <button

                                onClick={
                                    markAllAsRead
                                }

                                disabled={
                                    markingAll
                                }

                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: "8px",
                                    border:
                                        "1px solid #bbf7d0",
                                    background:
                                        "#f0fdf4",
                                    color:
                                        "#15803d",
                                    padding:
                                        "9px 14px",
                                    borderRadius:
                                        "10px",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        "800",
                                    cursor:
                                        markingAll
                                            ? "not-allowed"
                                            : "pointer",
                                    opacity:
                                        markingAll
                                            ? .65
                                            : 1
                                }}
                            >

                                <FaCheck />

                                {markingAll
                                    ? "Updating..."
                                    : "Mark all as read"}

                            </button>

                        )}

                    </div>


                    {/* =================================================
                        LIST HEADER
                    ================================================= */}

                    <div
                        style={{
                            padding:
                                "17px 22px",
                            background:
                                "#f8fafc",
                            borderBottom:
                                "1px solid #e5e7eb",
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "space-between"
                        }}
                    >

                        <div>

                            <h2
                                style={{
                                    margin: 0,
                                    fontSize:
                                        "15px",
                                    fontWeight:
                                        "800",
                                    color:
                                        "#1e293b"
                                }}
                            >

                                {filter === "ALL"
                                    ? "All Notifications"
                                    : filter ===
                                      "UNREAD"
                                        ? "Unread Notifications"
                                        : "Read Notifications"}

                            </h2>


                            <p
                                style={{
                                    margin:
                                        "3px 0 0",
                                    fontSize:
                                        "11px",
                                    color:
                                        "#94a3b8"
                                }}
                            >

                                {filteredNotifications.length}
                                {" "}
                                notification
                                {filteredNotifications.length !==
                                1
                                    ? "s"
                                    : ""}

                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        NOTIFICATION LIST
                    ================================================= */}

                    <div
                        style={{
                            padding:
                                "20px"
                        }}
                    >

                        {filteredNotifications.length ===
                        0 ? (

                            /* EMPTY STATE */

                            <div
                                style={{
                                    padding:
                                        "70px 20px",
                                    textAlign:
                                        "center"
                                }}
                            >

                                <div
                                    style={{
                                        width:
                                            "78px",
                                        height:
                                            "78px",
                                        borderRadius:
                                            "22px",
                                        background:
                                            "#f8fafc",
                                        border:
                                            "1px solid #e2e8f0",
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        margin:
                                            "0 auto 18px",
                                        color:
                                            "#94a3b8",
                                        fontSize:
                                            "28px"
                                    }}
                                >

                                    <FaInbox />

                                </div>


                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize:
                                            "19px",
                                        fontWeight:
                                            "800",
                                        color:
                                            "#334155"
                                    }}
                                >

                                    {filter ===
                                    "UNREAD"
                                        ? "You're all caught up"
                                        : filter ===
                                          "READ"
                                            ? "No read notifications"
                                            : "No notifications yet"}

                                </h3>


                                <p
                                    style={{
                                        margin:
                                            "8px auto 0",
                                        maxWidth:
                                            "430px",
                                        color:
                                            "#94a3b8",
                                        fontSize:
                                            "13px",
                                        lineHeight:
                                            "1.6"
                                    }}
                                >

                                    {filter ===
                                    "UNREAD"
                                        ? "There are no unread alerts requiring your attention."
                                        : "Stock, expiry and system notifications will appear here."}

                                </p>

                            </div>

                        ) : (

                            <div
                                style={{
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    gap:
                                        "12px"
                                }}
                            >

                                {filteredNotifications.map(
                                    (
                                        notification
                                    ) => {

                                        const style =
                                            getNotificationStyle(
                                                notification.notificationType
                                            );


                                        return (

                                            <div

                                                key={
                                                    notification.id
                                                }

                                                className="notification-item"

                                                style={{
                                                    position:
                                                        "relative",
                                                    display:
                                                        "flex",
                                                    gap:
                                                        "15px",
                                                    padding:
                                                        "17px",
                                                    borderRadius:
                                                        "15px",
                                                    background:
                                                        notification.isRead
                                                            ? "#ffffff"
                                                            : "#fafdff",
                                                    border:
                                                        notification.isRead
                                                            ? "1px solid #e5e7eb"
                                                            : `1px solid ${style.borderColor}`,
                                                    boxShadow:
                                                        notification.isRead
                                                            ? "none"
                                                            : "0 4px 15px rgba(15,23,42,.04)",
                                                    transition:
                                                        "all .2s ease"
                                                }}
                                            >

                                                {/* LEFT ACCENT */}

                                                {!notification.isRead && (

                                                    <div
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            left: 0,
                                                            top:
                                                                "15px",
                                                            bottom:
                                                                "15px",
                                                            width:
                                                                "3px",
                                                            borderRadius:
                                                                "0 4px 4px 0",
                                                            background:
                                                                style.accent
                                                        }}
                                                    />

                                                )}


                                                {/* ICON */}

                                                <div
                                                    style={{
                                                        width:
                                                            "48px",
                                                        height:
                                                            "48px",
                                                        flexShrink:
                                                            0,
                                                        borderRadius:
                                                            "13px",
                                                        background:
                                                            style.iconBackground,
                                                        color:
                                                            style.iconColor,
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize:
                                                            "18px"
                                                    }}
                                                >

                                                    {
                                                        style.icon
                                                    }

                                                </div>


                                                {/* CONTENT */}

                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0
                                                    }}
                                                >

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap:
                                                                "8px",
                                                            flexWrap:
                                                                "wrap"
                                                        }}
                                                    >

                                                        <h3
                                                            style={{
                                                                margin:
                                                                    0,
                                                                color:
                                                                    "#1e293b",
                                                                fontSize:
                                                                    "14px",
                                                                fontWeight:
                                                                    "800"
                                                            }}
                                                        >

                                                            {
                                                                notification.title ||
                                                                "Notification"
                                                            }

                                                        </h3>


                                                        <span
                                                            style={{
                                                                padding:
                                                                    "4px 8px",
                                                                borderRadius:
                                                                    "6px",
                                                                background:
                                                                    style.badgeBackground,
                                                                color:
                                                                    style.badgeColor,
                                                                fontSize:
                                                                    "9px",
                                                                fontWeight:
                                                                    "800",
                                                                textTransform:
                                                                    "uppercase",
                                                                letterSpacing:
                                                                    ".3px"
                                                            }}
                                                        >

                                                            {
                                                                style.badge
                                                            }

                                                        </span>


                                                        {!notification.isRead && (

                                                            <span
                                                                style={{
                                                                    display:
                                                                        "inline-flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap:
                                                                        "5px",
                                                                    color:
                                                                        "#2563eb",
                                                                    fontSize:
                                                                        "9px",
                                                                    fontWeight:
                                                                        "900"
                                                                }}
                                                            >

                                                                <FaCircle
                                                                    size={
                                                                        5
                                                                    }
                                                                />

                                                                NEW

                                                            </span>

                                                        )}

                                                    </div>


                                                    <p
                                                        style={{
                                                            margin:
                                                                "7px 0 0",
                                                            color:
                                                                "#475569",
                                                            fontSize:
                                                                "13px",
                                                            lineHeight:
                                                                "1.6"
                                                        }}
                                                    >

                                                        {
                                                            notification.message ||
                                                            "No message available."
                                                        }

                                                    </p>


                                                    {/* DATE */}

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap:
                                                                "6px",
                                                            marginTop:
                                                                "9px",
                                                            color:
                                                                "#94a3b8",
                                                            fontSize:
                                                                "10px"
                                                        }}
                                                    >

                                                        <FaClock />

                                                        {
                                                            formatDate(
                                                                notification.createdAt
                                                            )
                                                        }

                                                    </div>


                                                    {/* MARK READ */}

                                                    {!notification.isRead && (

                                                        <button

                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification.id
                                                                )
                                                            }

                                                            disabled={
                                                                processingId ===
                                                                notification.id
                                                            }

                                                            className="notification-read-button"

                                                            style={{
                                                                marginTop:
                                                                    "12px",
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap:
                                                                    "7px",
                                                                border:
                                                                    "1px solid #bfdbfe",
                                                                borderRadius:
                                                                    "8px",
                                                                padding:
                                                                    "7px 11px",
                                                                background:
                                                                    "#eff6ff",
                                                                color:
                                                                    "#2563eb",
                                                                fontSize:
                                                                    "11px",
                                                                fontWeight:
                                                                    "800",
                                                                cursor:
                                                                    processingId ===
                                                                    notification.id
                                                                        ? "not-allowed"
                                                                        : "pointer",
                                                                opacity:
                                                                    processingId ===
                                                                    notification.id
                                                                        ? .6
                                                                        : 1
                                                            }}
                                                        >

                                                            <FaCheck />

                                                            {processingId ===
                                                            notification.id
                                                                ? "Updating..."
                                                                : "Mark as read"}

                                                            <FaArrowRight
                                                                size={
                                                                    9
                                                                }
                                                            />

                                                        </button>

                                                    )}

                                                </div>


                                                {/* RIGHT STATUS */}

                                                <div
                                                    className="notification-status"
                                                    style={{
                                                        flexShrink:
                                                            0,
                                                        alignSelf:
                                                            "flex-start"
                                                    }}
                                                >

                                                    {notification.isRead ? (

                                                        <span
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap:
                                                                    "5px",
                                                                padding:
                                                                    "5px 8px",
                                                                borderRadius:
                                                                    "7px",
                                                                background:
                                                                    "#f0fdf4",
                                                                color:
                                                                    "#15803d",
                                                                fontSize:
                                                                    "9px",
                                                                fontWeight:
                                                                    "800"
                                                            }}
                                                        >

                                                            <FaCheckCircle />

                                                            READ

                                                        </span>

                                                    ) : (

                                                        <span
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap:
                                                                    "5px",
                                                                padding:
                                                                    "5px 8px",
                                                                borderRadius:
                                                                    "7px",
                                                                background:
                                                                    "#eff6ff",
                                                                color:
                                                                    "#2563eb",
                                                                fontSize:
                                                                    "9px",
                                                                fontWeight:
                                                                    "800"
                                                            }}
                                                        >

                                                            <FaCircle
                                                                size={
                                                                    5
                                                                }
                                                            />

                                                            UNREAD

                                                        </span>

                                                    )}

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div
                        style={{
                            padding:
                                "13px 20px",
                            borderTop:
                                "1px solid #e5e7eb",
                            background:
                                "#f8fafc",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            gap:
                                "7px",
                            color:
                                "#94a3b8",
                            fontSize:
                                "10px"
                        }}
                    >

                        <FaShieldAlt />

                        MediStock Secure
                        Notification Center

                    </div>

                </div>

            </div>


            {/* =====================================================
                STYLES
            ===================================================== */}

            <style>
                {`

                    @keyframes notificationSpin {

                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }

                    }


                    .notification-stat-card:hover {

                        transform: translateY(-2px);

                        box-shadow:
                            0 8px 20px
                            rgba(15,23,42,.07);

                    }


                    .notification-item:hover {

                        transform: translateY(-1px);

                        box-shadow:
                            0 7px 20px
                            rgba(15,23,42,.06) !important;

                    }


                    .notification-refresh-button:hover {

                        background: #f8fafc !important;

                    }


                    .notification-read-button:hover {

                        background: #dbeafe !important;

                    }


                    @media (max-width: 900px) {

                        .notification-stats {

                            grid-template-columns:
                                1fr !important;

                        }

                    }


                    @media (max-width: 650px) {

                        .notification-page {

                            padding: 15px !important;

                        }


                        .notification-status {

                            display: none !important;

                        }


                        .notification-item {

                            padding: 14px !important;

                        }

                    }

                `}
            </style>

        </div>

    );

}


export default NotificationPanel;