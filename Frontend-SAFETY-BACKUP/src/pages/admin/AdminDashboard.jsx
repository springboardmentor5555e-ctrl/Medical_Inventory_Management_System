import { useEffect, useState } from "react";
import axios from "axios";

import DashboardCard from "../../components/admin/DashboardCard";
import LowStockCard from "../../components/admin/LowStockCard";
import ExpiryCard from "../../components/admin/ExpiryCard";
import NotificationPanel from "../../components/admin/NotificationPanel";

import { useNavigate } from "react-router-dom";



function AdminDashboard() {

    const navigate = useNavigate();



    // =========================================================
    // DASHBOARD STATE
    // =========================================================

    const [dashboard, setDashboard] = useState({

        totalMedicines: 0,

        totalSuppliers: 0,

        totalUsers: 0,

        totalStock: 0,

        lowStockCount: 0,

        salesToday: 0,

        expiredCount: 0

    });



    const [lowStock, setLowStock] = useState([]);

    const [expiry, setExpiry] = useState([]);

    const [notifications, setNotifications] = useState([]);

    const [loading, setLoading] = useState(true);



    // =========================================================
    // LOAD DASHBOARD
    // =========================================================

    const loadDashboard = async () => {

        try {

            const token = localStorage.getItem("token");


            // -------------------------------------------------
            // TOKEN CHECK
            // -------------------------------------------------

            if (!token) {

                navigate("/");

                return;

            }



            const config = {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            };



            // =================================================
            // SUMMARY
            // =================================================

            const summaryResponse = await axios.get(

                "http://localhost:8080/api/dashboard/summary",

                config

            );


            console.log(
                "Admin Dashboard Summary:",
                summaryResponse.data
            );


            setDashboard({

                totalMedicines:
                    summaryResponse.data.totalMedicines || 0,

                totalSuppliers:
                    summaryResponse.data.totalSuppliers || 0,

                totalUsers:
                    summaryResponse.data.totalUsers || 0,

                totalStock:
                    summaryResponse.data.totalStock || 0,

                lowStockCount:
                    summaryResponse.data.lowStockCount || 0,

                salesToday:
                    summaryResponse.data.salesToday || 0,

                expiredCount:
                    summaryResponse.data.expiredCount || 0

            });



            // =================================================
            // LOW STOCK
            // =================================================

            const lowStockResponse = await axios.get(

                "http://localhost:8080/api/dashboard/low-stock",

                config

            );


            setLowStock(

                lowStockResponse.data || []

            );



            // =================================================
            // EXPIRY ALERTS
            // =================================================

            const expiryResponse = await axios.get(

                "http://localhost:8080/api/dashboard/expiry-alerts",

                config

            );


            setExpiry(

                expiryResponse.data || []

            );



            // =================================================
            // NOTIFICATIONS
            // =================================================

            const notificationResponse = await axios.get(

                "http://localhost:8080/api/notifications",

                config

            );


            setNotifications(

                notificationResponse.data || []

            );



        }

        catch (error) {

            console.error(

                "Admin Dashboard Error:",

                error.response?.status,

                error.response?.data || error.message

            );


            // -------------------------------------------------
            // TOKEN EXPIRED / ACCESS DENIED
            // -------------------------------------------------

            if (

                error.response?.status === 401 ||

                error.response?.status === 403

            ) {

                localStorage.removeItem("token");

                localStorage.removeItem("role");

                navigate("/");

            }

        }

        finally {

            setLoading(false);

        }

    };



    // =========================================================
    // AUTO REFRESH
    // =========================================================

    useEffect(() => {

        loadDashboard();


        const interval = setInterval(() => {

            loadDashboard();

        }, 5000);


        return () => {

            clearInterval(interval);

        };

    }, []);



    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="h-96 flex items-center justify-center">

                <div className="
                    bg-white
                    shadow
                    rounded-2xl
                    px-10
                    py-8
                ">

                    <h2 className="
                        text-xl
                        font-semibold
                        text-blue-600
                    ">

                        Loading Dashboard...

                    </h2>

                </div>

            </div>

        );

    }



    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="space-y-6">



            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="
                    bg-white
                    border
                    rounded-2xl
                    shadow-sm
                    p-8
                    flex
                    justify-between
                    items-center
                "
            >

                <div>

                    <h1 className="
                        text-3xl
                        font-bold
                        text-gray-800
                    ">

                        Welcome back, Admin 👋

                    </h1>


                    <p className="
                        text-gray-500
                        mt-2
                    ">

                        Manage medicines, suppliers and
                        hospital inventory

                    </p>

                </div>



                {/* SYSTEM STATUS */}

                <div
                    className="
                        hidden
                        md:block
                        bg-green-50
                        rounded-xl
                        px-6
                        py-4
                    "
                >

                    <p className="
                        text-sm
                        text-gray-500
                    ">

                        System Status

                    </p>


                    <h3 className="
                        text-green-600
                        font-bold
                    ">

                        ● Online

                    </h3>

                </div>

            </div>



            {/* =================================================
                DASHBOARD CARDS
            ================================================= */}

            <div
                className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-4
                    gap-6
                "
            >


                {/* TOTAL MEDICINES */}

                <DashboardCard

                    icon="medicine"

                    title="Total Medicines"

                    value={dashboard.totalMedicines}

                    color="bg-blue-600"

                    subtitle="Available medicines"

                />



                {/* TOTAL SUPPLIERS */}

                <DashboardCard

                    icon="supplier"

                    title="Total Suppliers"

                    value={dashboard.totalSuppliers}

                    color="bg-green-600"

                    subtitle="Registered suppliers"

                />



                {/* LOW STOCK */}

                <DashboardCard

                    icon="warning"

                    title="Low Stock"

                    value={dashboard.lowStockCount}

                    color="bg-orange-500"

                    subtitle="Need attention"

                />



                {/* TOTAL STOCK */}

                <DashboardCard

                    icon="stock"

                    title="Total Stock"

                    value={dashboard.totalStock}

                    color="bg-purple-600"

                    subtitle="Available quantity"

                />

            </div>



            {/* =================================================
                ALERTS
            ================================================= */}

            <div
                className="
                    grid
                    grid-cols-1
                    xl:grid-cols-2
                    gap-6
                "
            >


                {/* LOW STOCK */}

                <div
                    className="
                        bg-white
                        border
                        rounded-2xl
                        shadow-sm
                        p-5
                    "
                >

                    <LowStockCard

                        medicines={lowStock}

                    />

                </div>



                {/* EXPIRY */}

                <div
                    className="
                        bg-white
                        border
                        rounded-2xl
                        shadow-sm
                        p-5
                    "
                >

                    <ExpiryCard

                        medicines={expiry}

                    />

                </div>

            </div>



            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <div
                className="
                    bg-white
                    border
                    rounded-2xl
                    shadow-sm
                    p-5
                "
            >

                <NotificationPanel

                    notifications={notifications}

                />

            </div>



            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div
                className="
                    bg-white
                    border
                    rounded-2xl
                    shadow-sm
                    p-6
                "
            >


                <h2
                    className="
                        text-xl
                        font-bold
                        text-gray-800
                        mb-5
                    "
                >

                    Quick Actions

                </h2>



                <div
                    className="
                        grid
                        grid-cols-2
                        md:grid-cols-3
                        xl:grid-cols-6
                        gap-4
                    "
                >


                    {/* =================================================
                        ADD MEDICINE
                    ================================================= */}

                    <button

                        onClick={() =>
                            navigate("/admin/add-medicine")
                        }

                        className="
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            rounded-xl
                            py-4
                            font-semibold
                            transition
                            shadow-sm
                        "

                    >

                        💊

                        <br />

                        Add Medicine

                    </button>



                    {/* =================================================
                        VIEW MEDICINES
                    ================================================= */}

                    <button

                        onClick={() =>
                            navigate("/admin/view-medicines")
                        }

                        className="
                            bg-green-600
                            hover:bg-green-700
                            text-white
                            rounded-xl
                            py-4
                            font-semibold
                            transition
                            shadow-sm
                        "

                    >

                        📦

                        <br />

                        Medicines

                    </button>



                    {/* =================================================
                        UPDATE STOCK
                    ================================================= */}

                    <button

                        onClick={() =>
                            navigate("/admin/update-stock")
                        }

                        className="
                            bg-cyan-600
                            hover:bg-cyan-700
                            text-white
                            rounded-xl
                            py-4
                            font-semibold
                            transition
                            shadow-sm
                        "

                    >

                        📥

                        <br />

                        Update Stock

                    </button>



                    {/* =================================================
                        SUPPLIER
                    ================================================= */}

                    <button

                        onClick={() =>
                            navigate("/admin/add-supplier")
                        }

                        className="
                            bg-purple-600
                            hover:bg-purple-700
                            text-white
                            rounded-xl
                            py-4
                            font-semibold
                            transition
                            shadow-sm
                        "

                    >

                        🚚

                        <br />

                        Supplier

                    </button>



                    {/* =================================================
                        USERS
                    ================================================= */}

                    <button

                        onClick={() =>
                            navigate("/admin/users")
                        }

                        className="
                            bg-orange-500
                            hover:bg-orange-600
                            text-white
                            rounded-xl
                            py-4
                            font-semibold
                            transition
                            shadow-sm
                        "

                    >

                        👥

                        <br />

                        Users

                    </button>



                    {/* =================================================
                        REPORTS
                    ================================================= */}

                    <button

                        onClick={() =>
                            navigate("/admin/reports")
                        }

                        className="
                            bg-red-600
                            hover:bg-red-700
                            text-white
                            rounded-xl
                            py-4
                            font-semibold
                            transition
                            shadow-sm
                        "

                    >

                        📊

                        <br />

                        Reports

                    </button>


                </div>

            </div>



        </div>

    );

}



export default AdminDashboard;