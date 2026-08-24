import {
    Link,
    useLocation
} from "react-router-dom";

import {
    useEffect,
    useState
} from "react";

import axios from "axios";

import {
    FaHospital,
    FaHome,
    FaPills,
    FaBoxOpen,
    FaTruck,
    FaUsers,
    FaChartBar,
    FaExclamationTriangle,
    FaFileInvoiceDollar,
    FaCog,
    FaSignOutAlt,
    FaBell,
    FaShoppingCart,
    FaWarehouse
} from "react-icons/fa";


function Sidebar() {

    // ==================================================
    // ROLE
    // ==================================================

    const role = localStorage.getItem("role");


    // ==================================================
    // LOCATION
    // ==================================================

    const location = useLocation();


    // ==================================================
    // USERNAME
    // ==================================================

    const username =
        localStorage.getItem("username") || "User";


    // ==================================================
    // NOTIFICATION STATE
    // ==================================================

    const [unreadCount, setUnreadCount] =
        useState(0);


    // ==================================================
    // LOAD NOTIFICATION COUNT
    // ==================================================

    useEffect(() => {

        loadNotificationCount();

    }, []);


    const loadNotificationCount = async () => {

        try {

            const token =
                localStorage.getItem("token");


            // ------------------------------------------
            // TOKEN CHECK
            // ------------------------------------------

            if (!token) {

                return;

            }


            // ------------------------------------------
            // API REQUEST
            // ------------------------------------------

            const response =
                await axios.get(

                    "http://localhost:8080/api/notifications/count",

                    {
                        headers: {

                            Authorization:
                                `Bearer ${token}`

                        }

                    }

                );


            // ------------------------------------------
            // SET COUNT
            // ------------------------------------------

            setUnreadCount(
                Number(response.data) || 0
            );

        }

        catch (error) {

            console.log(
                "Notification count error:",
                error.response?.data ||
                error.message
            );

        }

    };


    // ==================================================
    // ACTIVE MENU
    // ==================================================

    const activeMenu = (path) => {

        return location.pathname === path

            ?

            "bg-blue-600 text-white shadow-md"

            :

            "text-gray-600 hover:bg-blue-50 hover:text-blue-600";

    };


    // ==================================================
    // LOGOUT
    // ==================================================

    const logout = () => {

        localStorage.clear();

        window.location.href = "/";

    };


    // ==================================================
    // DASHBOARD ROUTE
    // ==================================================

    const dashboardPath =
        role
            ? `/${role.toLowerCase()}/dashboard`
            : "/";


    // ==================================================
    // NOTIFICATION ROUTE
    // ==================================================

    const notificationPath =
        role
            ? `/${role.toLowerCase()}/notifications`
            : "/";


    // ==================================================
    // UI
    // ==================================================

    return (

        <aside

            className="
                fixed
                top-0
                left-0
                w-64
                h-screen
                bg-white
                border-r
                shadow-sm
                flex
                flex-col
                p-5
                z-50
            "

        >


            {/* ==================================================
                LOGO
            ================================================== */}

            <div

                className="
                    flex
                    items-center
                    gap-3
                    mb-8
                "

            >

                <div

                    className="
                        bg-blue-600
                        text-white
                        p-3
                        rounded-xl
                    "

                >

                    <FaHospital size={25} />

                </div>


                <div>

                    <h1

                        className="
                            text-xl
                            font-bold
                            text-gray-800
                        "

                    >

                        MediStock

                    </h1>


                    <p

                        className="
                            text-xs
                            text-gray-500
                        "

                    >

                        Medical ERP System

                    </p>

                </div>

            </div>


            {/* ==================================================
                USER INFORMATION
            ================================================== */}

            <div

                className="
                    bg-blue-50
                    rounded-xl
                    p-4
                    mb-6
                "

            >

                <p

                    className="
                        text-xs
                        text-gray-500
                    "

                >

                    Logged in

                </p>


                <h3

                    className="
                        font-semibold
                        text-blue-700
                        truncate
                    "

                >

                    {username}

                </h3>


                <p

                    className="
                        text-xs
                        text-gray-500
                        mt-1
                    "

                >

                    {role || "USER"}

                </p>

            </div>


            {/* ==================================================
                MENU
            ================================================== */}

            <nav

                className="
                    flex-1
                    space-y-2
                    overflow-y-auto
                    pr-1
                "

            >


                {/* ==================================================
                    DASHBOARD
                ================================================== */}

                <Link

                    to={dashboardPath}

                    className={`

                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        rounded-xl
                        transition

                        ${activeMenu(dashboardPath)}

                    `}

                >

                    <FaHome />

                    Dashboard

                </Link>


                {/* ==================================================
                    NOTIFICATIONS
                ================================================== */}

                <Link

                    to={notificationPath}

                    className={`

                        flex
                        items-center
                        justify-between
                        px-4
                        py-3
                        rounded-xl
                        transition

                        ${activeMenu(notificationPath)}

                    `}

                >

                    <div

                        className="
                            flex
                            items-center
                            gap-3
                        "

                    >

                        <FaBell />

                        Notifications

                    </div>


                    {unreadCount > 0 && (

                        <span

                            className="
                                bg-red-500
                                text-white
                                text-xs
                                font-bold
                                min-w-6
                                h-6
                                px-2
                                rounded-full
                                flex
                                items-center
                                justify-center
                            "

                        >

                            {unreadCount}

                        </span>

                    )}

                </Link>


                {/* ==================================================
                    ADMIN MENU
                ================================================== */}

                {role === "ADMIN" && (

                    <>


                        {/* ==========================================
                            ADD MEDICINE
                        ========================================== */}

                        <Link

                            to="/admin/add-medicine"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/admin/add-medicine"
                                )}

                            `}

                        >

                            <FaPills />

                            Add Medicine

                        </Link>


                        {/* ==========================================
                            VIEW MEDICINES
                        ========================================== */}

                        <Link

                            to="/admin/view-medicines"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/admin/view-medicines"
                                )}

                            `}

                        >

                            <FaBoxOpen />

                            Medicines

                        </Link>


                        {/* ==========================================
                            UPDATE STOCK
                        ========================================== */}

                        <Link

                            to="/admin/update-stock"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/admin/update-stock"
                                )}

                            `}

                        >

                            <FaWarehouse />

                            Update Stock

                        </Link>


                        {/* ==========================================
                            ADD SUPPLIER
                        ========================================== */}

                        <Link

                            to="/admin/add-supplier"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/admin/add-supplier"
                                )}

                            `}

                        >

                            <FaTruck />

                            Add Supplier

                        </Link>


                        {/* ==========================================
                            VIEW SUPPLIERS
                        ========================================== */}

                        <Link

                            to="/admin/view-suppliers"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/admin/view-suppliers"
                                )}

                            `}

                        >

                            <FaTruck />

                            Suppliers

                        </Link>


                        {/* ==========================================
                            USERS
                        ========================================== */}

                        <Link

                            to="/admin/users"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/admin/users"
                                )}

                            `}

                        >

                            <FaUsers />

                            Users

                        </Link>


                        {/* ==========================================
                            REPORTS
                        ========================================== */}

                        <Link

                            to="/admin/reports"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/admin/reports"
                                )}

                            `}

                        >

                            <FaChartBar />

                            Reports

                        </Link>


                        {/* ==========================================
                            SETTINGS
                        ========================================== */}

                        <Link

                            to="/admin/settings"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/admin/settings"
                                )}

                            `}

                        >

                            <FaCog />

                            Settings

                        </Link>

                    </>

                )}


                {/* ==================================================
                    PHARMACIST MENU
                ================================================== */}

                {role === "PHARMACIST" && (

                    <>

                        {/* ==========================================
                            SELL MEDICINE
                        ========================================== */}

                        <Link

                            to="/pharmacist/sell"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/pharmacist/sell"
                                )}

                            `}

                        >

                            <FaShoppingCart />

                            Sell Medicine

                        </Link>


                        {/* ==========================================
                            VIEW STOCK
                        ========================================== */}

                        <Link

                            to="/pharmacist/stock"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/pharmacist/stock"
                                )}

                            `}

                        >

                            <FaPills />

                            Medicines

                        </Link>


                        {/* ==========================================
                            EXPIRY ALERTS
                        ========================================== */}

                        <Link

                            to="/pharmacist/expiry"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/pharmacist/expiry"
                                )}

                            `}

                        >

                            <FaExclamationTriangle />

                            Expiry Alerts

                        </Link>


                        {/* ==========================================
                            SALES HISTORY
                        ========================================== */}

                        <Link

                            to="/pharmacist/sales"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/pharmacist/sales"
                                )}

                            `}

                        >

                            <FaChartBar />

                            Sales History

                        </Link>

                    </>

                )}


                {/* ==================================================
                    STAFF MENU
                ================================================== */}

                {role === "STAFF" && (

                    <>

                        {/* ==========================================
                            STAFF VIEW STOCK ONLY
                        ========================================== */}

                        <Link

                            to="/staff/stock"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/staff/stock"
                                )}

                            `}

                        >

                            <FaBoxOpen />

                            View Stock

                        </Link>


                        {/* ==========================================
                            STAFF BILLING
                        ========================================== */}

                        <Link

                            to="/staff/billing"

                            className={`

                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                transition

                                ${activeMenu(
                                    "/staff/billing"
                                )}

                            `}

                        >

                            <FaFileInvoiceDollar />

                            Billing

                        </Link>

                    </>

                )}

            </nav>


            {/* ==================================================
                LOGOUT
            ================================================== */}

            <button

                onClick={logout}

                className="
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-xl
                    text-red-600
                    hover:bg-red-50
                    transition
                    mt-4
                    flex-shrink-0
                "

            >

                <FaSignOutAlt />

                Logout

            </button>

        </aside>

    );

}


export default Sidebar;