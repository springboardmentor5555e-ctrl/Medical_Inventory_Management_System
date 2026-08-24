import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
    FaArrowLeft,
    FaCalendarTimes,
    FaSearch,
    FaCheckCircle,
    FaExclamationTriangle,
    FaTimesCircle,
    FaSyncAlt,
    FaPills,
    FaBoxOpen,
    FaCalendarAlt,
    FaClock,
    FaShieldAlt,
    FaChevronRight
} from "react-icons/fa";

function ExpiryCheck() {

    const navigate = useNavigate();

    const API = "http://localhost:8080";

    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // LOAD MEDICINES
    // =========================================================

    const loadMedicines = async () => {

        try {

            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {

                setError(
                    "Login session expired. Please login again."
                );

                return;
            }

            const response = await axios.get(
                `${API}/api/medicines`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (Array.isArray(response.data)) {

                setMedicines(response.data);

            } else {

                setMedicines([]);

                setError(
                    "Unexpected response received from server."
                );

            }

        } catch (error) {

            console.error(
                "Expiry Load Error:",
                error
            );

            if (error.response?.status === 401) {

                setError(
                    "Unauthorized. Please login again."
                );

            } else if (error.response?.status === 403) {

                setError(
                    "You do not have permission to view expiry data."
                );

            } else if (!error.response) {

                setError(
                    "Backend server is not running."
                );

            } else {

                setError(
                    "Unable to load expiry data."
                );

            }

        } finally {

            setLoading(false);

        }

    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadMedicines();

    }, []);

    // =========================================================
    // DAYS UNTIL EXPIRY
    // =========================================================

    const getDaysUntilExpiry = (expiryDate) => {

        if (!expiryDate) {
            return null;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiry = new Date(expiryDate);
        expiry.setHours(0, 0, 0, 0);

        const difference =
            expiry.getTime() - today.getTime();

        return Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );
    };

    // =========================================================
    // EXPIRY STATUS
    // =========================================================

    const getExpiryStatus = (expiryDate) => {

        const days =
            getDaysUntilExpiry(expiryDate);

        if (days === null) {
            return "unknown";
        }

        if (days < 0) {
            return "expired";
        }

        if (days <= 90) {
            return "near";
        }

        return "safe";
    };

    // =========================================================
    // STATUS INFORMATION
    // =========================================================

    const getStatusInfo = (status) => {

        switch (status) {

            case "expired":

                return {
                    label: "Expired",
                    icon: FaTimesCircle,
                    color: "#dc2626",
                    background: "#fee2e2",
                    border: "#fecaca"
                };

            case "near":

                return {
                    label: "Near Expiry",
                    icon: FaExclamationTriangle,
                    color: "#d97706",
                    background: "#fef3c7",
                    border: "#fde68a"
                };

            case "safe":

                return {
                    label: "Safe",
                    icon: FaCheckCircle,
                    color: "#16a34a",
                    background: "#dcfce7",
                    border: "#bbf7d0"
                };

            default:

                return {
                    label: "Unknown",
                    icon: FaCalendarAlt,
                    color: "#64748b",
                    background: "#f1f5f9",
                    border: "#e2e8f0"
                };

        }

    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };

    // =========================================================
    // FILTER
    // =========================================================

    const filteredMedicines = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();

        if (!searchValue) {
            return medicines;
        }

        return medicines.filter((medicine) => {

            const name =
                medicine.name
                    ?.toString()
                    .toLowerCase() || "";

            const batch =
                medicine.batchNumber
                    ?.toString()
                    .toLowerCase() || "";

            const category =
                medicine.category
                    ?.toString()
                    .toLowerCase() || "";

            return (
                name.includes(searchValue) ||
                batch.includes(searchValue) ||
                category.includes(searchValue)
            );

        });

    }, [medicines, search]);

    // =========================================================
    // SUMMARY
    // =========================================================

    const summary = useMemo(() => {

        let expired = 0;
        let near = 0;
        let safe = 0;

        medicines.forEach((medicine) => {

            const status =
                getExpiryStatus(
                    medicine.expiryDate
                );

            if (status === "expired") {
                expired++;
            }

            if (status === "near") {
                near++;
            }

            if (status === "safe") {
                safe++;
            }

        });

        return {
            total: medicines.length,
            expired,
            near,
            safe
        };

    }, [medicines]);

    // =========================================================
    // SUMMARY CARD COMPONENT
    // =========================================================

    const SummaryCard = ({
        icon,
        label,
        value,
        color,
        background
    }) => {

        return (

            <div
                style={{
                    ...styles.summaryCard,
                    borderTop: `3px solid ${color}`
                }}
            >

                <div
                    style={{
                        ...styles.summaryIcon,
                        color,
                        background
                    }}
                >
                    {icon}
                </div>

                <div style={styles.summaryContent}>

                    <span style={styles.summaryLabel}>
                        {label}
                    </span>

                    <strong
                        style={{
                            ...styles.summaryValue,
                            color
                        }}
                    >
                        {value}
                    </strong>

                </div>

                <div
                    style={{
                        ...styles.summaryArrow,
                        color
                    }}
                >
                    <FaChevronRight />
                </div>

            </div>

        );

    };

    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div style={styles.container}>

            <div style={styles.page}>

                {/* =================================================
                    TOP HEADER
                ================================================= */}

                <div style={styles.header}>

                    <div style={styles.headerLeft}>

                        <button
                            onClick={() =>
                                navigate(
                                    "/pharmacist/dashboard"
                                )
                            }
                            style={styles.backButton}
                        >

                            <FaArrowLeft />

                            <span>
                                Dashboard
                            </span>

                        </button>

                        <div style={styles.headerDivider}></div>

                        <div style={styles.titleArea}>

                            <div style={styles.titleIcon}>

                                <FaCalendarTimes />

                            </div>

                            <div>

                                <div style={styles.pageTag}>

                                    PHARMACY INVENTORY

                                </div>

                                <h1 style={styles.title}>

                                    Expiry Tracking

                                </h1>

                                <p style={styles.subtitle}>

                                    Monitor medicine expiry dates
                                    and identify stock requiring
                                    immediate attention.

                                </p>

                            </div>

                        </div>

                    </div>

                    <button
                        onClick={loadMedicines}
                        style={{
                            ...styles.refreshButton,
                            opacity: loading ? 0.75 : 1
                        }}
                        disabled={loading}
                    >

                        <FaSyncAlt
                            style={{
                                animation: loading
                                    ? "expirySpin 1s linear infinite"
                                    : "none"
                            }}
                        />

                        <span>
                            {loading
                                ? "Refreshing..."
                                : "Refresh Data"}
                        </span>

                    </button>

                </div>

                {/* =================================================
                    STATUS INFORMATION
                ================================================= */}

                {!loading && !error && (

                    <div style={styles.statusBanner}>

                        <div style={styles.statusBannerIcon}>

                            <FaShieldAlt />

                        </div>

                        <div>

                            <strong style={styles.statusBannerTitle}>

                                Expiry monitoring is active

                            </strong>

                            <p style={styles.statusBannerText}>

                                Medicines expiring within
                                <strong> 90 days </strong>
                                are marked as near expiry.

                            </p>

                        </div>

                    </div>

                )}

                {/* =================================================
                    SUMMARY
                ================================================= */}

                {!loading && !error && (

                    <div style={styles.summaryGrid}>

                        <SummaryCard
                            icon={<FaPills />}
                            label="Total Medicines"
                            value={summary.total}
                            color="#2563eb"
                            background="#eff6ff"
                        />

                        <SummaryCard
                            icon={<FaCheckCircle />}
                            label="Safe Stock"
                            value={summary.safe}
                            color="#16a34a"
                            background="#f0fdf4"
                        />

                        <SummaryCard
                            icon={<FaExclamationTriangle />}
                            label="Near Expiry"
                            value={summary.near}
                            color="#d97706"
                            background="#fffbeb"
                        />

                        <SummaryCard
                            icon={<FaTimesCircle />}
                            label="Expired"
                            value={summary.expired}
                            color="#dc2626"
                            background="#fef2f2"
                        />

                    </div>

                )}

                {/* =================================================
                    SEARCH BAR
                ================================================= */}

                <div style={styles.toolbar}>

                    <div style={styles.searchSection}>

                        <div style={styles.searchWrapper}>

                            <FaSearch
                                style={styles.searchIcon}
                            />

                            <input
                                type="text"
                                placeholder="Search by medicine, batch number or category..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                style={styles.searchInput}
                            />

                            {search && (

                                <button
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    style={styles.clearSearch}
                                >
                                    ×
                                </button>

                            )}

                        </div>

                    </div>

                    <div style={styles.resultCount}>

                        <span>
                            Showing
                        </span>

                        <strong>
                            {filteredMedicines.length}
                        </strong>

                        <span>
                            of {medicines.length}
                        </span>

                    </div>

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div style={styles.errorBox}>

                        <div style={styles.errorIcon}>

                            <FaExclamationTriangle />

                        </div>

                        <div style={styles.errorContent}>

                            <strong>
                                Unable to load expiry data
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                        <button
                            onClick={loadMedicines}
                            style={styles.retryButton}
                        >

                            Try Again

                        </button>

                    </div>

                )}

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div style={styles.loadingBox}>

                        <div style={styles.spinner}></div>

                        <h2 style={styles.loadingTitle}>

                            Loading Expiry Data

                        </h2>

                        <p style={styles.loadingText}>

                            Retrieving medicine expiry
                            information...

                        </p>

                    </div>

                )}

                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    !error &&
                    filteredMedicines.length === 0 && (

                        <div style={styles.emptyBox}>

                            <div style={styles.emptyIcon}>

                                <FaCalendarTimes />

                            </div>

                            <h2 style={styles.emptyTitle}>

                                No Medicines Found

                            </h2>

                            <p style={styles.emptyText}>

                                {search
                                    ? "No medicines match your search criteria."
                                    : "There are currently no medicines available in the inventory."
                                }

                            </p>

                            {search && (

                                <button
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    style={styles.clearButton}
                                >

                                    Clear Search

                                </button>

                            )}

                        </div>

                    )}

                {/* =================================================
                    MEDICINE GRID
                ================================================= */}

                {!loading &&
                    !error &&
                    filteredMedicines.length > 0 && (

                        <div style={styles.grid}>

                            {filteredMedicines.map(
                                (medicine) => {

                                    const status =
                                        getExpiryStatus(
                                            medicine.expiryDate
                                        );

                                    const statusInfo =
                                        getStatusInfo(
                                            status
                                        );

                                    const StatusIcon =
                                        statusInfo.icon;

                                    const days =
                                        getDaysUntilExpiry(
                                            medicine.expiryDate
                                        );

                                    return (

                                        <div
                                            key={medicine.id}
                                            style={{
                                                ...styles.card,
                                                borderTop:
                                                    `4px solid ${statusInfo.color}`
                                            }}
                                        >

                                            {/* CARD HEADER */}

                                            <div
                                                style={
                                                    styles.cardHeader
                                                }
                                            >

                                                <div
                                                    style={{
                                                        ...styles.medicineIcon,
                                                        background:
                                                            statusInfo.background,
                                                        color:
                                                            statusInfo.color
                                                    }}
                                                >

                                                    <FaPills />

                                                </div>

                                                <div
                                                    style={
                                                        styles.statusBadge
                                                    }
                                                >

                                                    <StatusIcon />

                                                    {statusInfo.label}

                                                </div>

                                            </div>

                                            {/* MEDICINE */}

                                            <div style={styles.medicineInfo}>

                                                <h2
                                                    style={
                                                        styles.medicineName
                                                    }
                                                >

                                                    {medicine.name ||
                                                        "Unnamed Medicine"}

                                                </h2>

                                                <div
                                                    style={
                                                        styles.batchRow
                                                    }
                                                >

                                                    <span>
                                                        Batch Number
                                                    </span>

                                                    <strong>
                                                        {medicine.batchNumber ||
                                                            "N/A"}
                                                    </strong>

                                                </div>

                                            </div>

                                            {/* DETAILS */}

                                            <div
                                                style={
                                                    styles.detailsBox
                                                }
                                            >

                                                <div
                                                    style={
                                                        styles.detailItem
                                                    }
                                                >

                                                    <div
                                                        style={
                                                            styles.detailIcon
                                                        }
                                                    >

                                                        <FaBoxOpen />

                                                    </div>

                                                    <div>

                                                        <span
                                                            style={
                                                                styles.detailLabel
                                                            }
                                                        >
                                                            Available Stock
                                                        </span>

                                                        <strong
                                                            style={
                                                                styles.detailValue
                                                            }
                                                        >

                                                            {Number(
                                                                medicine.quantity
                                                            ) || 0}

                                                            {" "}units

                                                        </strong>

                                                    </div>

                                                </div>

                                                <div
                                                    style={
                                                        styles.detailItem
                                                    }
                                                >

                                                    <div
                                                        style={
                                                            styles.detailIcon
                                                        }
                                                    >

                                                        <FaPills />

                                                    </div>

                                                    <div>

                                                        <span
                                                            style={
                                                                styles.detailLabel
                                                            }
                                                        >
                                                            Category
                                                        </span>

                                                        <strong
                                                            style={
                                                                styles.detailValue
                                                            }
                                                        >

                                                            {medicine.category ||
                                                                "General"}

                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>

                                            {/* EXPIRY */}

                                            <div
                                                style={{
                                                    ...styles.expiryBox,
                                                    background:
                                                        statusInfo.background,
                                                    borderColor:
                                                        statusInfo.border
                                                }}
                                            >

                                                <div
                                                    style={
                                                        styles.expiryTop
                                                    }
                                                >

                                                    <div
                                                        style={
                                                            styles.expiryLabel
                                                        }
                                                    >

                                                        <FaCalendarAlt />

                                                        <span>
                                                            Expiry Date
                                                        </span>

                                                    </div>

                                                    {days !== null && (

                                                        <span
                                                            style={{
                                                                ...styles.daysBadge,
                                                                color:
                                                                    statusInfo.color
                                                            }}
                                                        >

                                                            <FaClock />

                                                            {days < 0
                                                                ? `${Math.abs(days)} days overdue`
                                                                : days === 0
                                                                    ? "Expires today"
                                                                    : `${days} days left`
                                                            }

                                                        </span>

                                                    )}

                                                </div>

                                                <div
                                                    style={{
                                                        ...styles.expiryDate,
                                                        color:
                                                            statusInfo.color
                                                    }}
                                                >

                                                    {formatDate(
                                                        medicine.expiryDate
                                                    )}

                                                </div>

                                            </div>

                                            {/* FOOTER */}

                                            <div
                                                style={
                                                    styles.cardFooter
                                                }
                                            >

                                                <span>
                                                    Medicine ID
                                                </span>

                                                <strong>
                                                    #{medicine.id}
                                                </strong>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

            </div>

        </div>

    );

}

// =========================================================
// STYLES
// SAME BLUE / CYAN MEDICAL COLOR THEME
// =========================================================

const styles = {

    container: {

        minHeight: "100vh",

        padding: "28px",

        background:
            "linear-gradient(135deg, #eff6ff 0%, #ecfeff 48%, #f8fafc 100%)",

        fontFamily:
            "Inter, Segoe UI, Arial, sans-serif",

        boxSizing: "border-box"

    },

    page: {

        width: "100%",

        maxWidth: "1550px",

        margin: "0 auto",

        padding: "32px",

        background: "#ffffff",

        border:
            "1px solid #dbeafe",

        borderRadius: "24px",

        boxShadow:
            "0 18px 50px rgba(15, 23, 42, 0.08)",

        boxSizing: "border-box"

    },

    // =====================================================
    // HEADER
    // =====================================================

    header: {

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        gap: "25px",

        paddingBottom: "25px",

        borderBottom:
            "1px solid #e2e8f0",

        marginBottom: "22px"

    },

    headerLeft: {

        display: "flex",

        alignItems: "center",

        gap: "20px",

        minWidth: 0

    },

    backButton: {

        display: "flex",

        alignItems: "center",

        gap: "8px",

        padding: "10px 15px",

        border:
            "1px solid #bfdbfe",

        borderRadius: "11px",

        background: "#eff6ff",

        color: "#2563eb",

        cursor: "pointer",

        fontSize: "13px",

        fontWeight: "700",

        transition: "all .2s ease"

    },

    headerDivider: {

        width: "1px",

        height: "45px",

        background: "#e2e8f0"

    },

    titleArea: {

        display: "flex",

        alignItems: "center",

        gap: "15px"

    },

    titleIcon: {

        width: "54px",

        height: "54px",

        flexShrink: 0,

        borderRadius: "15px",

        background:
            "linear-gradient(135deg, #2563eb, #06b6d4)",

        color: "#ffffff",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontSize: "22px",

        boxShadow:
            "0 8px 20px rgba(37,99,235,.20)"

    },

    pageTag: {

        color: "#2563eb",

        fontSize: "10px",

        fontWeight: "800",

        letterSpacing: "1.2px",

        marginBottom: "3px"

    },

    title: {

        margin: 0,

        color: "#0f172a",

        fontSize: "28px",

        fontWeight: "800",

        letterSpacing: "-0.5px"

    },

    subtitle: {

        margin: "4px 0 0",

        color: "#64748b",

        fontSize: "13px",

        lineHeight: "1.5"

    },

    refreshButton: {

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        gap: "9px",

        padding: "11px 17px",

        border: "none",

        borderRadius: "11px",

        background:
            "linear-gradient(135deg, #2563eb, #0891b2)",

        color: "#ffffff",

        cursor: "pointer",

        fontSize: "13px",

        fontWeight: "700",

        boxShadow:
            "0 7px 18px rgba(37,99,235,.20)"

    },

    // =====================================================
    // STATUS BANNER
    // =====================================================

    statusBanner: {

        display: "flex",

        alignItems: "center",

        gap: "13px",

        padding: "13px 16px",

        marginBottom: "22px",

        border:
            "1px solid #bae6fd",

        borderRadius: "13px",

        background:
            "linear-gradient(90deg, #f0f9ff, #ecfeff)"

    },

    statusBannerIcon: {

        width: "36px",

        height: "36px",

        borderRadius: "10px",

        background: "#dbeafe",

        color: "#2563eb",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        flexShrink: 0

    },

    statusBannerTitle: {

        display: "block",

        color: "#164e63",

        fontSize: "13px"

    },

    statusBannerText: {

        margin: "2px 0 0",

        color: "#64748b",

        fontSize: "12px"

    },

    // =====================================================
    // SUMMARY
    // =====================================================

    summaryGrid: {

        display: "grid",

        gridTemplateColumns:
            "repeat(4, minmax(190px, 1fr))",

        gap: "15px",

        marginBottom: "22px"

    },

    summaryCard: {

        position: "relative",

        display: "flex",

        alignItems: "center",

        gap: "13px",

        minHeight: "92px",

        padding: "16px",

        background: "#ffffff",

        border:
            "1px solid #e2e8f0",

        borderRadius: "15px",

        boxShadow:
            "0 5px 18px rgba(15,23,42,.04)",

        boxSizing: "border-box"

    },

    summaryIcon: {

        width: "46px",

        height: "46px",

        borderRadius: "12px",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontSize: "17px",

        flexShrink: 0

    },

    summaryContent: {

        display: "flex",

        flexDirection: "column",

        gap: "3px"

    },

    summaryLabel: {

        color: "#64748b",

        fontSize: "11px",

        fontWeight: "700"

    },

    summaryValue: {

        fontSize: "25px",

        lineHeight: 1,

        fontWeight: "800"

    },

    summaryArrow: {

        marginLeft: "auto",

        fontSize: "10px",

        opacity: ".5"

    },

    // =====================================================
    // TOOLBAR
    // =====================================================

    toolbar: {

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        gap: "20px",

        marginBottom: "22px"

    },

    searchSection: {

        flex: 1,

        maxWidth: "750px"

    },

    searchWrapper: {

        height: "48px",

        display: "flex",

        alignItems: "center",

        gap: "11px",

        padding: "0 15px",

        background: "#ffffff",

        border:
            "1px solid #cbd5e1",

        borderRadius: "12px",

        boxShadow:
            "0 3px 12px rgba(15,23,42,.03)",

        boxSizing: "border-box"

    },

    searchIcon: {

        color: "#64748b",

        fontSize: "15px",

        flexShrink: 0

    },

    searchInput: {

        width: "100%",

        height: "100%",

        border: "none",

        outline: "none",

        background: "transparent",

        color: "#1e293b",

        fontSize: "13px"

    },

    clearSearch: {

        width: "25px",

        height: "25px",

        border: "none",

        borderRadius: "50%",

        background: "#f1f5f9",

        color: "#64748b",

        cursor: "pointer",

        fontSize: "17px",

        lineHeight: "20px"

    },

    resultCount: {

        display: "flex",

        alignItems: "center",

        gap: "5px",

        padding: "9px 13px",

        border:
            "1px solid #e2e8f0",

        borderRadius: "10px",

        background: "#f8fafc",

        color: "#64748b",

        fontSize: "12px",

        whiteSpace: "nowrap"

    },

    // =====================================================
    // ERROR
    // =====================================================

    errorBox: {

        display: "flex",

        alignItems: "center",

        gap: "13px",

        padding: "15px",

        marginBottom: "22px",

        border:
            "1px solid #fecaca",

        borderRadius: "13px",

        background: "#fef2f2",

        color: "#b91c1c"

    },

    errorIcon: {

        width: "38px",

        height: "38px",

        borderRadius: "10px",

        background: "#fee2e2",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        flexShrink: 0

    },

    errorContent: {

        flex: 1

    },

    errorContentStrong: {

        fontSize: "13px"

    },

    errorContentP: {

        margin: "3px 0 0",

        fontSize: "12px"

    },

    retryButton: {

        padding: "9px 14px",

        border: "none",

        borderRadius: "9px",

        background: "#dc2626",

        color: "#ffffff",

        cursor: "pointer",

        fontSize: "12px",

        fontWeight: "700"

    },

    // =====================================================
    // LOADING
    // =====================================================

    loadingBox: {

        textAlign: "center",

        padding: "80px 20px"

    },

    spinner: {

        width: "42px",

        height: "42px",

        margin: "0 auto 18px",

        border:
            "4px solid #dbeafe",

        borderTop:
            "4px solid #2563eb",

        borderRadius: "50%",

        animation:
            "expirySpin 1s linear infinite"

    },

    loadingTitle: {

        margin: 0,

        color: "#1e293b",

        fontSize: "18px"

    },

    loadingText: {

        margin: "7px 0 0",

        color: "#64748b",

        fontSize: "13px"

    },

    // =====================================================
    // EMPTY
    // =====================================================

    emptyBox: {

        textAlign: "center",

        padding: "75px 20px",

        border:
            "1px dashed #cbd5e1",

        borderRadius: "18px",

        background: "#f8fafc"

    },

    emptyIcon: {

        width: "65px",

        height: "65px",

        margin: "0 auto 16px",

        borderRadius: "17px",

        background: "#eff6ff",

        color: "#2563eb",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontSize: "25px"

    },

    emptyTitle: {

        margin: 0,

        color: "#334155",

        fontSize: "19px"

    },

    emptyText: {

        margin: "7px auto 0",

        maxWidth: "450px",

        color: "#64748b",

        fontSize: "13px",

        lineHeight: "1.6"

    },

    clearButton: {

        marginTop: "15px",

        padding: "9px 15px",

        border: "none",

        borderRadius: "9px",

        background: "#2563eb",

        color: "#ffffff",

        cursor: "pointer",

        fontSize: "12px",

        fontWeight: "700"

    },

    // =====================================================
    // GRID
    // =====================================================

    grid: {

        display: "grid",

        gridTemplateColumns:
            "repeat(auto-fill, minmax(330px, 1fr))",

        gap: "18px"

    },

    // =====================================================
    // CARD
    // =====================================================

    card: {

        background: "#ffffff",

        border:
            "1px solid #e2e8f0",

        borderRadius: "17px",

        padding: "19px",

        boxShadow:
            "0 6px 22px rgba(15,23,42,.055)",

        boxSizing: "border-box",

        transition:
            "transform .2s ease, box-shadow .2s ease"

    },

    cardHeader: {

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        gap: "10px"

    },

    medicineIcon: {

        width: "46px",

        height: "46px",

        borderRadius: "13px",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontSize: "18px"

    },

    statusBadge: {

        display: "inline-flex",

        alignItems: "center",

        gap: "6px",

        padding: "6px 10px",

        borderRadius: "999px",

        background: "#f8fafc",

        border:
            "1px solid #e2e8f0",

        color: "#475569",

        fontSize: "11px",

        fontWeight: "800"

    },

    medicineInfo: {

        marginTop: "17px"

    },

    medicineName: {

        margin: 0,

        color: "#0f172a",

        fontSize: "18px",

        fontWeight: "800",

        lineHeight: "1.35"

    },

    batchRow: {

        display: "flex",

        alignItems: "center",

        gap: "7px",

        marginTop: "5px",

        fontSize: "11px",

        color: "#94a3b8"

    },

    // =====================================================
    // DETAILS
    // =====================================================

    detailsBox: {

        display: "grid",

        gridTemplateColumns: "1fr 1fr",

        gap: "10px",

        marginTop: "16px"

    },

    detailItem: {

        display: "flex",

        alignItems: "center",

        gap: "9px",

        padding: "11px",

        border:
            "1px solid #e2e8f0",

        borderRadius: "11px",

        background: "#f8fafc",

        minWidth: 0

    },

    detailIcon: {

        color: "#2563eb",

        fontSize: "14px",

        flexShrink: 0

    },

    detailLabel: {

        display: "block",

        color: "#94a3b8",

        fontSize: "9px",

        fontWeight: "800",

        textTransform: "uppercase",

        letterSpacing: ".4px"

    },

    detailValue: {

        display: "block",

        marginTop: "3px",

        color: "#334155",

        fontSize: "12px",

        fontWeight: "700",

        whiteSpace: "nowrap",

        overflow: "hidden",

        textOverflow: "ellipsis"

    },

    // =====================================================
    // EXPIRY
    // =====================================================

    expiryBox: {

        marginTop: "15px",

        padding: "13px",

        border:
            "1px solid",

        borderRadius: "13px"

    },

    expiryTop: {

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        gap: "10px"

    },

    expiryLabel: {

        display: "flex",

        alignItems: "center",

        gap: "7px",

        color: "#64748b",

        fontSize: "11px",

        fontWeight: "800"

    },

    daysBadge: {

        display: "flex",

        alignItems: "center",

        gap: "5px",

        fontSize: "10px",

        fontWeight: "800",

        textAlign: "right"

    },

    expiryDate: {

        marginTop: "7px",

        fontSize: "17px",

        fontWeight: "800"

    },

    // =====================================================
    // FOOTER
    // =====================================================

    cardFooter: {

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        marginTop: "14px",

        paddingTop: "12px",

        borderTop:
            "1px solid #f1f5f9",

        color: "#94a3b8",

        fontSize: "10px"

    }

};

// =========================================================
// ANIMATION + RESPONSIVE CSS
// =========================================================

if (
    typeof document !== "undefined" &&
    !document.getElementById("expiry-check-professional-css")
) {

    const style =
        document.createElement("style");

    style.id =
        "expiry-check-professional-css";

    style.innerHTML = `

        @keyframes expirySpin {

            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }

        }

        .expiry-card-hover:hover {

            transform: translateY(-3px);

            box-shadow:
                0 12px 30px rgba(15,23,42,.09);

        }

        @media (max-width: 1100px) {

            .expiry-summary-grid {
                grid-template-columns: repeat(2, 1fr);
            }

        }

        @media (max-width: 850px) {

            .expiry-header {
                flex-direction: column;
                align-items: flex-start;
            }

        }

        @media (max-width: 700px) {

            .expiry-page {
                padding: 20px !important;
            }

            .expiry-container {
                padding: 15px !important;
            }

            .expiry-summary-grid {
                grid-template-columns: 1fr;
            }

            .expiry-toolbar {
                flex-direction: column;
                align-items: stretch;
            }

            .expiry-search-section {
                max-width: none !important;
            }

            .expiry-header-left {
                flex-wrap: wrap;
            }

            .expiry-header-divider {
                display: none;
            }

        }

        @media (max-width: 480px) {

            .expiry-details-box {
                grid-template-columns: 1fr !important;
            }

            .expiry-grid {
                grid-template-columns: 1fr !important;
            }

        }

    `;

    document.head.appendChild(style);

}

export default ExpiryCheck;