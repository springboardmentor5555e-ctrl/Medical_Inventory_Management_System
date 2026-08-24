import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
    FaArrowLeft,
    FaReceipt,
    FaSearch,
    FaFilePdf,
    FaSyncAlt,
    FaShoppingCart,
    FaBoxes,
    FaMoneyBillWave,
    FaCalendarAlt,
    FaPills,
    FaExclamationTriangle,
    FaTimes
} from "react-icons/fa";



function SalesHistory() {

    const navigate = useNavigate();

    const API = "http://localhost:8080";



    // =========================================================
    // STATES
    // =========================================================

    const [sales, setSales] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [error, setError] = useState("");

    const [downloading, setDownloading] = useState(false);



    // =========================================================
    // LOAD SALES HISTORY
    // =========================================================

    const loadSales = async () => {

        try {

            setLoading(true);

            setError("");

            const token =
                localStorage.getItem("token");

            const userId =
                localStorage.getItem("userId");



            if (!token) {

                setError(
                    "Your login session has expired. Please login again."
                );

                return;

            }



            if (!userId) {

                setError(
                    "User ID is missing. Please login again."
                );

                return;

            }



            const response = await axios.get(

                `${API}/api/sales/user/${userId}`,

                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );



            if (Array.isArray(response.data)) {

                setSales(response.data);

            }
            else {

                setSales([]);

                setError(
                    "Unexpected response received from server."
                );

            }



        }
        catch (error) {

            console.error(
                "Sales History Error:",
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
                    "You do not have permission to view sales history."
                );

            }
            else if (!error.response) {

                setError(
                    "Backend server is not running."
                );

            }
            else {

                setError(
                    "Unable to load sales history."
                );

            }

        }
        finally {

            setLoading(false);

        }

    };



    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadSales();

    }, []);



    // =========================================================
    // DOWNLOAD PDF
    // =========================================================

   const downloadPDF = async () => {

    try {

        const token =
            localStorage.getItem("token");

        if (!token) {

            alert(
                "Login session expired. Please login again."
            );

            navigate("/");

            return;

        }


        const response = await axios.get(

            "http://localhost:8080/api/sales/pdf",

            {

                headers: {

                    Authorization:
                        `Bearer ${token}`

                },

                responseType: "blob"

            }

        );


        const pdfFile =
            new Blob(
                [response.data],
                {
                    type: "application/pdf"
                }
            );


        const url =
            window.URL.createObjectURL(pdfFile);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "sales-history.pdf";


        document.body.appendChild(link);

        link.click();

        link.remove();


        window.URL.revokeObjectURL(url);


    }

    catch (error) {

        console.error(
            "PDF Download Error:",
            error
        );


        if (error.response) {

            console.error(
                "PDF Error Status:",
                error.response.status
            );

            console.error(
                "PDF Error Data:",
                error.response.data
            );

        }


        alert(
            "Unable to download sales PDF. Please check the Spring Boot console."
        );

    }

};



    // =========================================================
    // FILTER SALES
    // =========================================================

    const filteredSales = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();



        if (!searchValue) {

            return sales;

        }



        return sales.filter((sale) => {

            const medicineName =
                sale.medicine?.name
                    ?.toString()
                    .toLowerCase() || "";



            const batchNumber =
                sale.medicine?.batchNumber
                    ?.toString()
                    .toLowerCase() || "";



            const category =
                sale.medicine?.category
                    ?.toString()
                    .toLowerCase() || "";



            return (

                medicineName.includes(searchValue) ||

                batchNumber.includes(searchValue) ||

                category.includes(searchValue)

            );

        });

    }, [sales, search]);



    // =========================================================
    // SALES SUMMARY
    // =========================================================

    const summary = useMemo(() => {

        const totalSales =
            sales.length;



        const totalQuantity =
            sales.reduce(

                (total, sale) => {

                    return (
                        total +
                        (
                            Number(
                                sale.quantity
                            ) || 0
                        )
                    );

                },

                0

            );



        const totalAmount =
            sales.reduce(

                (total, sale) => {

                    return (

                        total +

                        (
                            Number(
                                sale.totalAmount
                            ) || 0
                        )

                    );

                },

                0

            );



        return {

            totalSales,

            totalQuantity,

            totalAmount

        };

    }, [sales]);



    // =========================================================
    // FORMAT AMOUNT
    // =========================================================

    const formatAmount = (amount) => {

        return Number(
            amount || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };



    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {

            return "N/A";

        }



        const parsedDate =
            new Date(date);



        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "N/A";

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
    // RENDER
    // =========================================================

    return (

        <div style={styles.container}>

            <div style={styles.page}>



                {/* =================================================
                    HEADER
                ================================================= */}

                <div style={styles.header}>

                    <div style={styles.headerLeft}>



                        {/* BACK */}

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
                                Back to Dashboard
                            </span>

                        </button>



                        {/* TITLE */}

                        <div style={styles.titleArea}>

                            <div style={styles.titleIcon}>

                                <FaReceipt />

                            </div>



                            <div>

                                <h1 style={styles.title}>

                                    Sales History

                                </h1>



                                <p style={styles.subtitle}>

                                    View completed medicine
                                    sales and transaction details.

                                </p>

                            </div>

                        </div>



                    </div>



                    {/* ACTIONS */}

                    <div style={styles.headerActions}>



                        <button

                            onClick={loadSales}

                            disabled={loading}

                            style={styles.refreshButton}

                        >

                            <FaSyncAlt
                                style={{
                                    animation:
                                        loading
                                            ? "spin 1s linear infinite"
                                            : "none"
                                }}
                            />

                            <span>

                                {loading
                                    ? "Refreshing..."
                                    : "Refresh"}

                            </span>

                        </button>



                        <button

                            onClick={downloadPDF}

                            disabled={
                                downloading ||
                                sales.length === 0
                            }

                            style={{
                                ...styles.pdfButton,

                                opacity:
                                    downloading ||
                                    sales.length === 0
                                        ? 0.6
                                        : 1,

                                cursor:
                                    downloading ||
                                    sales.length === 0
                                        ? "not-allowed"
                                        : "pointer"
                            }}

                        >

                            <FaFilePdf />

                            <span>

                                {downloading
                                    ? "Generating..."
                                    : "Download PDF"}

                            </span>

                        </button>



                    </div>

                </div>



                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                {!loading && !error && (

                    <div style={styles.summaryGrid}>



                        {/* TOTAL SALES */}

                        <div style={styles.summaryCard}>

                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    background: "#dbeafe",
                                    color: "#2563eb"
                                }}
                            >

                                <FaReceipt />

                            </div>



                            <div>

                                <p
                                    style={
                                        styles.summaryLabel
                                    }
                                >

                                    Total Sales

                                </p>



                                <h2
                                    style={
                                        styles.summaryValue
                                    }
                                >

                                    {summary.totalSales}

                                </h2>

                            </div>

                        </div>



                        {/* ITEMS SOLD */}

                        <div style={styles.summaryCard}>

                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    background: "#dcfce7",
                                    color: "#16a34a"
                                }}
                            >

                                <FaBoxes />

                            </div>



                            <div>

                                <p
                                    style={
                                        styles.summaryLabel
                                    }
                                >

                                    Items Sold

                                </p>



                                <h2
                                    style={{
                                        ...styles.summaryValue,
                                        color: "#16a34a"
                                    }}
                                >

                                    {summary.totalQuantity}

                                </h2>

                            </div>

                        </div>



                        {/* TOTAL REVENUE */}

                        <div style={styles.summaryCard}>

                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    background: "#fef3c7",
                                    color: "#d97706"
                                }}
                            >

                                <FaMoneyBillWave />

                            </div>



                            <div>

                                <p
                                    style={
                                        styles.summaryLabel
                                    }
                                >

                                    Total Revenue

                                </p>



                                <h2
                                    style={{
                                        ...styles.summaryValue,
                                        color: "#d97706"
                                    }}
                                >

                                    ₹
                                    {formatAmount(
                                        summary.totalAmount
                                    )}

                                </h2>

                            </div>

                        </div>



                        {/* FILTERED */}

                        <div style={styles.summaryCard}>

                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    background: "#f3e8ff",
                                    color: "#9333ea"
                                }}
                            >

                                <FaShoppingCart />

                            </div>



                            <div>

                                <p
                                    style={
                                        styles.summaryLabel
                                    }
                                >

                                    Showing

                                </p>



                                <h2
                                    style={{
                                        ...styles.summaryValue,
                                        color: "#9333ea"
                                    }}
                                >

                                    {filteredSales.length}

                                </h2>

                            </div>

                        </div>



                    </div>

                )}



                {/* =================================================
                    SEARCH
                ================================================= */}

                <div style={styles.searchSection}>

                    <div style={styles.searchWrapper}>

                        <FaSearch
                            style={styles.searchIcon}
                        />



                        <input

                            type="text"

                            placeholder="Search medicine, batch or category..."

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

                                style={
                                    styles.clearButton
                                }

                            >

                                <FaTimes />

                            </button>

                        )}

                    </div>



                    <div style={styles.resultText}>

                        Showing

                        <strong>

                            {filteredSales.length}

                        </strong>

                        transactions

                    </div>

                </div>



                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div style={styles.errorBox}>

                        <FaExclamationTriangle />



                        <div>

                            <strong>

                                Sales History Error

                            </strong>



                            <p style={styles.errorText}>

                                {error}

                            </p>

                        </div>



                        <button

                            onClick={loadSales}

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

                            Loading Sales History

                        </h2>



                        <p style={styles.loadingText}>

                            Please wait while your
                            sales records are being loaded.

                        </p>

                    </div>

                )}



                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    !error &&
                    sales.length === 0 && (

                        <div style={styles.emptyBox}>

                            <div style={styles.emptyIcon}>

                                <FaReceipt />

                            </div>



                            <h2 style={styles.emptyTitle}>

                                No Sales Records

                            </h2>



                            <p style={styles.emptyText}>

                                No medicine sales have been
                                recorded for your account yet.

                            </p>

                        </div>

                    )}



                {/* =================================================
                    SEARCH EMPTY
                ================================================= */}

                {!loading &&
                    !error &&
                    sales.length > 0 &&
                    filteredSales.length === 0 && (

                        <div style={styles.emptyBox}>

                            <div style={styles.emptyIcon}>

                                <FaSearch />

                            </div>



                            <h2 style={styles.emptyTitle}>

                                No Matching Sales

                            </h2>



                            <p style={styles.emptyText}>

                                No sales match your current
                                search.

                            </p>



                            <button

                                onClick={() =>
                                    setSearch("")
                                }

                                style={styles.clearSearchButton}

                            >

                                Clear Search

                            </button>

                        </div>

                    )}



                {/* =================================================
                    SALES TABLE
                ================================================= */}

                {!loading &&
                    !error &&
                    filteredSales.length > 0 && (

                        <div style={styles.tableCard}>

                            <div style={styles.tableHeader}>

                                <div>

                                    <h2
                                        style={
                                            styles.tableTitle
                                        }
                                    >

                                        Recent Transactions

                                    </h2>



                                    <p
                                        style={
                                            styles.tableSubtitle
                                        }
                                    >

                                        Detailed record of
                                        completed medicine sales.

                                    </p>

                                </div>



                                <div
                                    style={
                                        styles.transactionBadge
                                    }
                                >

                                    <FaReceipt />

                                    {filteredSales.length}
                                    {" "}
                                    Records

                                </div>

                            </div>



                            <div
                                style={
                                    styles.tableContainer
                                }
                            >

                                <table
                                    style={styles.table}
                                >

                                    <thead>

                                        <tr>

                                            <th
                                                style={
                                                    styles.th
                                                }
                                            >
                                                #
                                            </th>

                                            <th
                                                style={{
                                                    ...styles.th,
                                                    textAlign:
                                                        "left"
                                                }}
                                            >
                                                Medicine
                                            </th>

                                            <th
                                                style={
                                                    styles.th
                                                }
                                            >
                                                Batch
                                            </th>

                                            <th
                                                style={
                                                    styles.th
                                                }
                                            >
                                                Quantity
                                            </th>

                                            <th
                                                style={{
                                                    ...styles.th,
                                                    textAlign:
                                                        "right"
                                                }}
                                            >
                                                Amount
                                            </th>

                                            <th
                                                style={
                                                    styles.th
                                                }
                                            >
                                                Sold Date
                                            </th>

                                        </tr>

                                    </thead>



                                    <tbody>

                                        {filteredSales.map(

                                            (sale, index) => (

                                                <tr
                                                    key={
                                                        sale.id ||
                                                        index
                                                    }
                                                    style={
                                                        styles.tr
                                                    }
                                                >

                                                    {/* NUMBER */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >

                                                        <span
                                                            style={
                                                                styles.rowNumber
                                                            }
                                                        >

                                                            {index + 1}

                                                        </span>

                                                    </td>



                                                    {/* MEDICINE */}

                                                    <td
                                                        style={{
                                                            ...styles.td,
                                                            textAlign:
                                                                "left"
                                                        }}
                                                    >

                                                        <div
                                                            style={
                                                                styles.medicineCell
                                                            }
                                                        >

                                                            <div
                                                                style={
                                                                    styles.medicineIconSmall
                                                                }
                                                            >

                                                                <FaPills />

                                                            </div>



                                                            <div>

                                                                <strong
                                                                    style={
                                                                        styles.medicineName
                                                                    }
                                                                >

                                                                    {
                                                                        sale
                                                                            .medicine
                                                                            ?.name ||
                                                                        "N/A"
                                                                    }

                                                                </strong>



                                                                <span
                                                                    style={
                                                                        styles.categoryText
                                                                    }
                                                                >

                                                                    {
                                                                        sale
                                                                            .medicine
                                                                            ?.category ||
                                                                        "Medicine"
                                                                    }

                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>



                                                    {/* BATCH */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >

                                                        <span
                                                            style={
                                                                styles.batchBadge
                                                            }
                                                        >

                                                            {
                                                                sale
                                                                    .medicine
                                                                    ?.batchNumber ||
                                                                "N/A"
                                                            }

                                                        </span>

                                                    </td>



                                                    {/* QUANTITY */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >

                                                        <span
                                                            style={
                                                                styles.quantityBadge
                                                            }
                                                        >

                                                            {
                                                                Number(
                                                                    sale.quantity
                                                                ) || 0
                                                            }

                                                        </span>

                                                    </td>



                                                    {/* AMOUNT */}

                                                    <td
                                                        style={{
                                                            ...styles.td,
                                                            textAlign:
                                                                "right"
                                                        }}
                                                    >

                                                        <strong
                                                            style={
                                                                styles.amount
                                                            }
                                                        >

                                                            ₹
                                                            {formatAmount(
                                                                sale.totalAmount
                                                            )}

                                                        </strong>

                                                    </td>



                                                    {/* DATE */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >

                                                        <div
                                                            style={
                                                                styles.dateCell
                                                            }
                                                        >

                                                            <FaCalendarAlt
                                                                style={
                                                                    styles.dateIcon
                                                                }
                                                            />

                                                            <span>

                                                                {formatDate(
                                                                    sale.saleDate
                                                                )}

                                                            </span>

                                                        </div>

                                                    </td>

                                                </tr>

                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )}

            </div>

        </div>

    );

}



// =========================================================
// STYLES
// =========================================================

const styles = {

    container: {

        minHeight: "100vh",

        background:
            "linear-gradient(135deg, #eff6ff 0%, #ecfeff 50%, #f8fafc 100%)",

        padding: "30px",

        fontFamily:
            "Inter, Segoe UI, Arial, sans-serif"

    },


    page: {

        width: "100%",

        maxWidth: "1500px",

        margin: "0 auto",

        background: "rgba(255,255,255,0.96)",

        border:
            "1px solid rgba(226,232,240,0.9)",

        borderRadius: "28px",

        padding: "32px",

        boxShadow:
            "0 20px 60px rgba(15,23,42,0.10)",

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

        paddingBottom: "28px",

        borderBottom:
            "1px solid #e2e8f0",

        marginBottom: "28px"

    },


    headerLeft: {

        display: "flex",

        alignItems: "center",

        gap: "24px",

        minWidth: 0

    },


    titleArea: {

        display: "flex",

        alignItems: "center",

        gap: "16px"

    },


    titleIcon: {

        width: "56px",

        height: "56px",

        borderRadius: "18px",

        background:
            "linear-gradient(135deg,#2563eb,#06b6d4)",

        color: "white",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontSize: "23px",

        boxShadow:
            "0 10px 25px rgba(37,99,235,0.22)"

    },


    title: {

        margin: 0,

        color: "#0f172a",

        fontSize: "30px",

        fontWeight: "800",

        letterSpacing: "-0.5px"

    },


    subtitle: {

        margin: "6px 0 0",

        color: "#64748b",

        fontSize: "14px",

        lineHeight: "1.6"

    },


    backButton: {

        display: "flex",

        alignItems: "center",

        gap: "8px",

        padding: "11px 18px",

        border: "1px solid #dbeafe",

        borderRadius: "14px",

        background: "#eff6ff",

        color: "#2563eb",

        cursor: "pointer",

        fontSize: "14px",

        fontWeight: "700",

        whiteSpace: "nowrap"

    },


    headerActions: {

        display: "flex",

        alignItems: "center",

        gap: "10px"

    },


    refreshButton: {

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        gap: "8px",

        padding: "12px 17px",

        border: "1px solid #dbeafe",

        borderRadius: "13px",

        background: "#eff6ff",

        color: "#2563eb",

        cursor: "pointer",

        fontSize: "13px",

        fontWeight: "700"

    },


    pdfButton: {

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        gap: "8px",

        padding: "12px 18px",

        border: "none",

        borderRadius: "13px",

        background:
            "linear-gradient(135deg,#dc2626,#ef4444)",

        color: "white",

        fontSize: "13px",

        fontWeight: "700",

        boxShadow:
            "0 8px 18px rgba(220,38,38,0.18)"

    },


    // =====================================================
    // SUMMARY
    // =====================================================

    summaryGrid: {

        display: "grid",

        gridTemplateColumns:
            "repeat(4, minmax(180px, 1fr))",

        gap: "18px",

        marginBottom: "25px"

    },


    summaryCard: {

        display: "flex",

        alignItems: "center",

        gap: "15px",

        padding: "20px",

        borderRadius: "20px",

        background: "#ffffff",

        border:
            "1px solid #e2e8f0",

        boxShadow:
            "0 6px 20px rgba(15,23,42,0.05)"

    },


    summaryIcon: {

        width: "50px",

        height: "50px",

        borderRadius: "15px",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontSize: "19px",

        flexShrink: 0

    },


    summaryLabel: {

        margin: 0,

        color: "#64748b",

        fontSize: "13px",

        fontWeight: "600"

    },


    summaryValue: {

        margin: "5px 0 0",

        color: "#0f172a",

        fontSize: "25px",

        fontWeight: "800"

    },


    // =====================================================
    // SEARCH
    // =====================================================

    searchSection: {

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        gap: "20px",

        padding: "18px",

        marginBottom: "25px",

        borderRadius: "20px",

        background: "#f8fafc",

        border:
            "1px solid #e2e8f0"

    },


    searchWrapper: {

        flex: 1,

        height: "48px",

        display: "flex",

        alignItems: "center",

        gap: "12px",

        padding: "0 15px",

        background: "white",

        border:
            "1px solid #dbe3ec",

        borderRadius: "14px"

    },


    searchIcon: {

        color: "#94a3b8",

        fontSize: "16px"

    },


    searchInput: {

        width: "100%",

        height: "100%",

        border: "none",

        outline: "none",

        background: "transparent",

        color: "#334155",

        fontSize: "14px"

    },


    clearButton: {

        border: "none",

        background: "transparent",

        color: "#94a3b8",

        cursor: "pointer",

        fontSize: "13px"

    },


    resultText: {

        display: "flex",

        alignItems: "center",

        gap: "6px",

        color: "#64748b",

        fontSize: "13px",

        whiteSpace: "nowrap"

    },


    // =====================================================
    // ERROR
    // =====================================================

    errorBox: {

        display: "flex",

        alignItems: "center",

        gap: "14px",

        padding: "17px 20px",

        marginBottom: "25px",

        borderRadius: "16px",

        background: "#fef2f2",

        border:
            "1px solid #fecaca",

        color: "#b91c1c"

    },


    errorText: {

        margin: "3px 0 0",

        color: "#dc2626",

        fontSize: "13px"

    },


    retryButton: {

        marginLeft: "auto",

        padding: "9px 15px",

        border: "none",

        borderRadius: "10px",

        background: "#dc2626",

        color: "white",

        cursor: "pointer",

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

        width: "44px",

        height: "44px",

        margin: "0 auto 20px",

        border:
            "4px solid #dbeafe",

        borderTop:
            "4px solid #2563eb",

        borderRadius: "50%",

        animation:
            "spin 1s linear infinite"

    },


    loadingTitle: {

        margin: 0,

        color: "#1e293b",

        fontSize: "20px"

    },


    loadingText: {

        marginTop: "8px",

        color: "#64748b",

        fontSize: "14px"

    },


    // =====================================================
    // EMPTY
    // =====================================================

    emptyBox: {

        textAlign: "center",

        padding: "75px 20px"

    },


    emptyIcon: {

        width: "70px",

        height: "70px",

        margin: "0 auto 18px",

        borderRadius: "20px",

        background: "#f1f5f9",

        color: "#94a3b8",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontSize: "28px"

    },


    emptyTitle: {

        margin: 0,

        color: "#334155",

        fontSize: "20px",

        fontWeight: "800"

    },


    emptyText: {

        marginTop: "8px",

        color: "#64748b",

        fontSize: "14px"

    },


    clearSearchButton: {

        marginTop: "18px",

        padding: "10px 18px",

        border: "none",

        borderRadius: "11px",

        background: "#2563eb",

        color: "white",

        cursor: "pointer",

        fontWeight: "700"

    },


    // =====================================================
    // TABLE CARD
    // =====================================================

    tableCard: {

        background: "white",

        border:
            "1px solid #e2e8f0",

        borderRadius: "22px",

        overflow: "hidden",

        boxShadow:
            "0 8px 25px rgba(15,23,42,0.05)"

    },


    tableHeader: {

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        padding: "22px 24px",

        borderBottom:
            "1px solid #e2e8f0"

    },


    tableTitle: {

        margin: 0,

        color: "#0f172a",

        fontSize: "18px",

        fontWeight: "800"

    },


    tableSubtitle: {

        margin: "5px 0 0",

        color: "#64748b",

        fontSize: "13px"

    },


    transactionBadge: {

        display: "flex",

        alignItems: "center",

        gap: "7px",

        padding: "8px 12px",

        borderRadius: "10px",

        background: "#eff6ff",

        color: "#2563eb",

        fontSize: "12px",

        fontWeight: "800"

    },


    tableContainer: {

        width: "100%",

        overflowX: "auto"

    },


    table: {

        width: "100%",

        minWidth: "900px",

        borderCollapse: "collapse"

    },


    th: {

        padding: "15px 16px",

        background: "#f8fafc",

        color: "#64748b",

        borderBottom:
            "1px solid #e2e8f0",

        textAlign: "center",

        fontSize: "11px",

        fontWeight: "800",

        textTransform: "uppercase",

        letterSpacing: "0.4px",

        whiteSpace: "nowrap"

    },


    td: {

        padding: "16px",

        borderBottom:
            "1px solid #f1f5f9",

        textAlign: "center",

        color: "#475569",

        fontSize: "13px",

        whiteSpace: "nowrap"

    },


    tr: {

        transition:
            "background .2s ease"

    },


    rowNumber: {

        display: "inline-flex",

        alignItems: "center",

        justifyContent: "center",

        width: "30px",

        height: "30px",

        borderRadius: "9px",

        background: "#f1f5f9",

        color: "#64748b",

        fontSize: "12px",

        fontWeight: "800"

    },


    // =====================================================
    // MEDICINE CELL
    // =====================================================

    medicineCell: {

        display: "flex",

        alignItems: "center",

        gap: "12px"

    },


    medicineIconSmall: {

        width: "38px",

        height: "38px",

        borderRadius: "11px",

        background: "#eff6ff",

        color: "#2563eb",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        flexShrink: 0

    },


    medicineName: {

        display: "block",

        color: "#1e293b",

        fontSize: "13px",

        fontWeight: "800"

    },


    categoryText: {

        display: "block",

        marginTop: "3px",

        color: "#94a3b8",

        fontSize: "11px"

    },


    // =====================================================
    // BADGES
    // =====================================================

    batchBadge: {

        display: "inline-block",

        padding: "6px 10px",

        borderRadius: "8px",

        background: "#f8fafc",

        border:
            "1px solid #e2e8f0",

        color: "#475569",

        fontSize: "11px",

        fontWeight: "700"

    },


    quantityBadge: {

        display: "inline-flex",

        alignItems: "center",

        justifyContent: "center",

        minWidth: "38px",

        padding: "6px 9px",

        borderRadius: "8px",

        background: "#dcfce7",

        color: "#15803d",

        fontWeight: "800"

    },


    amount: {

        color: "#0f172a",

        fontSize: "14px",

        fontWeight: "800"

    },


    // =====================================================
    // DATE
    // =====================================================

    dateCell: {

        display: "inline-flex",

        alignItems: "center",

        justifyContent: "center",

        gap: "7px",

        color: "#64748b",

        fontSize: "12px"

    },


    dateIcon: {

        color: "#94a3b8"

    }

};



// =========================================================
// ANIMATION
// =========================================================

if (

    typeof document !== "undefined" &&

    !document.getElementById(
        "sales-history-animation"
    )

) {

    const style =
        document.createElement("style");

    style.id =
        "sales-history-animation";

    style.innerHTML = `

        @keyframes spin {

            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }

        }

        @media (max-width: 1100px) {

            .sales-summary-grid {
                grid-template-columns:
                    repeat(2, 1fr);
            }

        }

        @media (max-width: 800px) {

            .sales-header {
                flex-direction: column;
                align-items: flex-start;
            }

        }

    `;

    document.head.appendChild(style);

}



export default SalesHistory;