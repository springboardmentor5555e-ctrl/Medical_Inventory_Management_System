import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaChartLine } from "react-icons/fa";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import api from "../services/api";
import "../styles/Analytics.css";


function Analytics() {
    const navigate = useNavigate();

    const [medicines, setMedicines] = useState([]);


    // =====================================================
    // LOAD MEDICINES
    // =====================================================

    useEffect(() => {

        loadMedicines();

        // Refresh analytics every 10 seconds
        const interval = setInterval(() => {

            loadMedicines();

        }, 10000);


        return () => clearInterval(interval);

    }, []);


    const loadMedicines = async () => {

        try {

            const response =
                await api.get("/medicines");

            console.log(
                "Analytics medicines:",
                response.data
            );

            setMedicines(response.data);

        } catch (error) {

            console.error(
                "Failed to load medicines:",
                error
            );

        }

    };


    // =====================================================
    // STOCK STATUS
    // =====================================================

    const stockData = [

        {
            name: "In Stock",

            value: medicines.filter(
                medicine =>
                    Number(medicine.quantity) > 20
            ).length
        },

        {
            name: "Low Stock",

            value: medicines.filter(
                medicine =>
                    Number(medicine.quantity) > 0 &&
                    Number(medicine.quantity) <= 20
            ).length
        },

        {
            name: "Out of Stock",

            value: medicines.filter(
                medicine =>
                    Number(medicine.quantity) === 0
            ).length
        }

    ];


    // =====================================================
    // CATEGORY DATA
    // =====================================================

    const categoryMap = {};


    medicines.forEach(medicine => {

        const category =
            medicine.category || "Other";


        categoryMap[category] =
            (categoryMap[category] || 0) + 1;

    });


    const categoryData =
        Object.entries(categoryMap).map(
            ([name, value]) => ({
                name,
                value
            })
        );


    // =====================================================
    // QUANTITY DATA
    // =====================================================

    const quantityData = medicines.map(
        medicine => ({

            name: medicine.name,

            quantity:
                Number(medicine.quantity) || 0

        })
    );


    // =====================================================
    // EXPIRY DATA
    // =====================================================

    const today = new Date();


    const expiryData = [

        {
            name: "Valid",

            value:
                medicines.filter(
                    medicine => {

                        if (!medicine.expiryDate) {

                            return true;

                        }


                        return new Date(
                            medicine.expiryDate
                        ) > today;

                    }
                ).length
        },


        {
            name: "Expired",

            value:
                medicines.filter(
                    medicine => {

                        if (!medicine.expiryDate) {

                            return false;

                        }


                        return new Date(
                            medicine.expiryDate
                        ) <= today;

                    }
                ).length
        }

    ];


    // =====================================================
    // COLORS
    // =====================================================

    const STOCK_COLORS = [

        "#1F5A94",   // Dark Blue
        "#E6A23C",   // Amber
        "#7B8794"    // Slate

    ];


    const EXPIRY_COLORS = [

        "#3B8C6E",   // Valid - Green
        "#C62828"    // Expired - Red

    ];


    const CATEGORY_COLORS = [

        "#2F6690",
        "#3E8E7E",
        "#7A6FA8",
        "#D28B4E",
        "#6C8EAD",
        "#8A6F9E",
        "#4F7C6B"

    ];


    // =====================================================
    // TOTAL STOCK
    // =====================================================

    const totalStock =
        medicines.reduce(

            (total, medicine) =>

                total +
                (
                    Number(
                        medicine.quantity
                    ) || 0
                ),

            0

        );


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div className="analytics-page">


            {/* =================================================
                HEADER
            ================================================= */}

       <div className="analytics-header">

    <button
        className="analytics-back-btn"
        onClick={() => navigate("/admin-dashboard")}
        title="Back to Dashboard"
    >
        <FaArrowLeft />
        <span>Dashboard</span>
    </button>

    <div className="analytics-title-section">

        <div className="analytics-title-icon">
            <FaChartLine />
        </div>

        <div>
            <h1>
                Medicine Analytics
            </h1>

            <p>
                Monitor medicine stock, categories,
                quantities and expiry status
            </p>
        </div>

    </div>

</div>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="analytics-summary">


                {/* TOTAL MEDICINES */}

                <div className="summary-card">

                    <h3>
                        Total Medicines
                    </h3>

                    <strong>
                        {medicines.length}
                    </strong>

                </div>


                {/* TOTAL STOCK */}

                <div className="summary-card">

                    <h3>
                        Total Stock
                    </h3>

                    <strong>
                        {totalStock}
                    </strong>

                </div>


                {/* LOW STOCK */}

                <div className="summary-card">

                    <h3>
                        Low Stock
                    </h3>

                    <strong>

                        {
                            stockData.find(
                                item =>
                                    item.name ===
                                    "Low Stock"
                            )?.value || 0
                        }

                    </strong>

                </div>


                {/* EXPIRED */}

                <div className="summary-card">

                    <h3>
                        Expired
                    </h3>

                    <strong>

                        {
                            expiryData.find(
                                item =>
                                    item.name ===
                                    "Expired"
                            )?.value || 0
                        }

                    </strong>

                </div>


            </div>


            {/* =================================================
                CHART GRID
            ================================================= */}

            <div className="charts-grid">


                {/* =================================================
                    STOCK STATUS PIE
                ================================================= */}

                <div className="chart-card">

                    <h2>
                        Medicine Stock Status
                    </h2>


                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >

                        <PieChart>

                            <Pie
                                data={stockData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={105}
                                label
                            >

                                {
                                    stockData.map(
                                        (entry, index) => (

                                            <Cell
                                                key={
                                                    `stock-${index}`
                                                }
                                                fill={
                                                    STOCK_COLORS[
                                                        index %
                                                        STOCK_COLORS.length
                                                    ]
                                                }
                                            />

                                        )
                                    )
                                }

                            </Pie>


                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>


                {/* =================================================
                    CATEGORY PIE
                ================================================= */}

                <div className="chart-card">

                    <h2>
                        Medicine Categories
                    </h2>


                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >

                        <PieChart>

                            <Pie
                                data={categoryData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={105}
                                label
                            >

                                {
                                    categoryData.map(
                                        (entry, index) => (

                                            <Cell
                                                key={
                                                    `category-${index}`
                                                }
                                                fill={
                                                    CATEGORY_COLORS[
                                                        index %
                                                        CATEGORY_COLORS.length
                                                    ]
                                                }
                                            />

                                        )
                                    )
                                }

                            </Pie>


                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>


                {/* =================================================
                    EXPIRY PIE
                ================================================= */}

                <div className="chart-card">

                    <h2>
                        Medicine Expiry Status
                    </h2>


                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >

                        <PieChart>

                            <Pie
                                data={expiryData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={105}
                                label
                            >

                                {
                                    expiryData.map(
                                        (entry, index) => (

                                            <Cell
                                                key={
                                                    `expiry-${index}`
                                                }
                                                fill={
                                                    EXPIRY_COLORS[
                                                        index %
                                                        EXPIRY_COLORS.length
                                                    ]
                                                }
                                            />

                                        )
                                    )
                                }

                            </Pie>


                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>


                {/* =================================================
                    QUANTITY BAR GRAPH
                ================================================= */}

                <div className="chart-card">

                    <h2>
                        Medicine Quantity
                    </h2>


                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >

                        <BarChart
                            data={quantityData}
                        >


                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#C7D8ED"
                            />


                            <XAxis
                                dataKey="name"
                                tick={{
                                    fill: "#526579",
                                    fontSize: 12
                                }}
                                angle={-25}
                                textAnchor="end"
                                height={80}
                            />


                            <YAxis
                                tick={{
                                    fill: "#526579"
                                }}
                            />


                            <Tooltip />


                            <Bar
                                dataKey="quantity"
                                fill="#5B6FB5"
                                radius={[
                                    8,
                                    8,
                                    0,
                                    0
                                ]}
                            />


                        </BarChart>

                    </ResponsiveContainer>

                </div>


            </div>


            {/* =================================================
                MEDICINE TRACKING FLOW
            ================================================= */}

            <div className="tracking-card">

                <h2>
                    🔄 Medicine Tracking Flow
                </h2>


                <div className="tracking-flow">


                    <div className="flow-box">

                        <span>
                            1
                        </span>

                        <h3>
                            Medicine Added
                        </h3>

                        <p>
                            Medicine information is
                            stored in inventory.
                        </p>

                    </div>


                    <div className="flow-arrow">
                        →
                    </div>


                    <div className="flow-box">

                        <span>
                            2
                        </span>

                        <h3>
                            Stock Monitoring
                        </h3>

                        <p>
                            Quantity is continuously
                            tracked.
                        </p>

                    </div>


                    <div className="flow-arrow">
                        →
                    </div>


                    <div className="flow-box">

                        <span>
                            3
                        </span>

                        <h3>
                            Stock Check
                        </h3>

                        <p>
                            System checks whether
                            stock is sufficient.
                        </p>

                    </div>


                    <div className="flow-arrow">
                        →
                    </div>


                    <div className="flow-box">

                        <span>
                            4
                        </span>

                        <h3>
                            Low Stock Alert
                        </h3>

                        <p>
                            Alert generated when
                            quantity becomes low.
                        </p>

                    </div>


                    <div className="flow-arrow">
                        →
                    </div>


                    <div className="flow-box">

                        <span>
                            5
                        </span>

                        <h3>
                            Expiry Monitoring
                        </h3>

                        <p>
                            Expiry dates are checked
                            automatically.
                        </p>

                    </div>


                    <div className="flow-arrow">
                        →
                    </div>


                    <div className="flow-box">

                        <span>
                            6
                        </span>

                        <h3>
                            Analytics
                        </h3>

                        <p>
                            Inventory information
                            is displayed visually.
                        </p>

                    </div>


                </div>

            </div>


        </div>

    );

}


export default Analytics;