import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
    FaArrowLeft,
    FaSearch,
    FaBoxes,
    FaCheckCircle,
    FaExclamationTriangle,
    FaTimesCircle,
    FaSyncAlt,
    FaPills,
    FaCalendarAlt,
    FaTag,
    FaWarehouse,
    FaRupeeSign,
    FaFilter,
    FaClock
} from "react-icons/fa";



function ViewStock() {

    const navigate = useNavigate();

    const API = "http://localhost:8080";

    // =========================================================
    // STATES
    // =========================================================

    const [medicines, setMedicines] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [filter, setFilter] = useState("ALL");



    // =========================================================
    // LOAD STOCK
    // =========================================================

    const loadStock = async (isRefresh = false) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token = localStorage.getItem("token");

            if (!token) {

                setError(
                    "Your login session has expired. Please login again."
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
                    "Unexpected response received from the server."
                );

            }

        }
        catch (error) {

            console.error(
                "Stock Loading Error:",
                error
            );


            if (error.response?.status === 401) {

                setError(
                    "Unauthorized. Please login again."
                );

            }
            else if (error.response?.status === 403) {

                setError(
                    "You do not have permission to view medicine stock."
                );

            }
            else if (error.response?.status >= 500) {

                setError(
                    "Server error. Please check your backend."
                );

            }
            else {

                setError(
                    "Unable to load medicine stock. Please try again."
                );

            }

        }
        finally {

            setLoading(false);
            setRefreshing(false);

        }

    };



    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadStock();

    }, []);



    // =========================================================
    // STOCK HELPERS
    // =========================================================

    const getQuantity = (medicine) => {

        return Number(medicine.quantity) || 0;

    };


    const getMinStock = (medicine) => {

        return Number(medicine.minStockLevel) || 10;

    };



    // =========================================================
    // STATUS
    // =========================================================

    const getStatus = (medicine) => {

        const quantity = getQuantity(medicine);

        const minStock = getMinStock(medicine);


        if (quantity <= 0) {

            return {
                key: "OUT",
                label: "Out of Stock",
                icon: <FaTimesCircle />,
                className:
                    "bg-red-50 text-red-700 border-red-200"
            };

        }


        if (quantity <= minStock) {

            return {
                key: "LOW",
                label: "Low Stock",
                icon: <FaExclamationTriangle />,
                className:
                    "bg-amber-50 text-amber-700 border-amber-200"
            };

        }


        return {
            key: "AVAILABLE",
            label: "Available",
            icon: <FaCheckCircle />,
            className:
                "bg-emerald-50 text-emerald-700 border-emerald-200"
        };

    };



    // =========================================================
    // EXPIRY STATUS
    // =========================================================

    const getExpiryInfo = (expiryDate) => {

        if (!expiryDate) {

            return {
                label: "N/A",
                className: "text-slate-400",
                badge:
                    "bg-slate-100 text-slate-500 border-slate-200"
            };

        }


        const today = new Date();

        today.setHours(0, 0, 0, 0);


        const expiry = new Date(expiryDate);

        expiry.setHours(0, 0, 0, 0);


        const difference =
            expiry.getTime() -
            today.getTime();


        const days =
            Math.ceil(
                difference /
                (1000 * 60 * 60 * 24)
            );


        if (days < 0) {

            return {
                label: "Expired",
                className: "text-red-600",
                badge:
                    "bg-red-50 text-red-700 border-red-200"
            };

        }


        if (days <= 30) {

            return {
                label: `${days} days left`,
                className: "text-amber-600",
                badge:
                    "bg-amber-50 text-amber-700 border-amber-200"
            };

        }


        return {
            label: formatDate(expiryDate),
            className: "text-emerald-600",
            badge:
                "bg-emerald-50 text-emerald-700 border-emerald-200"
        };

    };



    // =========================================================
    // FORMAT DATE
    // =========================================================

    function formatDate(date) {

        if (!date) return "N/A";


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

    }



    // =========================================================
    // FILTER MEDICINES
    // =========================================================

    const filteredMedicines = useMemo(() => {

        const searchValue =
            search
                .trim()
                .toLowerCase();


        return medicines.filter(
            (medicine) => {

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


                const matchesSearch =
                    !searchValue ||
                    name.includes(searchValue) ||
                    batch.includes(searchValue) ||
                    category.includes(searchValue);


                const status =
                    getStatus(medicine);


                const matchesFilter =
                    filter === "ALL" ||
                    status.key === filter;


                return (
                    matchesSearch &&
                    matchesFilter
                );

            }
        );

    }, [medicines, search, filter]);



    // =========================================================
    // SUMMARY COUNTS
    // =========================================================

    const totalMedicines =
        medicines.length;


    const availableMedicines =
        medicines.filter(
            medicine =>
                getStatus(medicine).key ===
                "AVAILABLE"
        ).length;


    const lowStockMedicines =
        medicines.filter(
            medicine =>
                getStatus(medicine).key ===
                "LOW"
        ).length;


    const outOfStockMedicines =
        medicines.filter(
            medicine =>
                getStatus(medicine).key ===
                "OUT"
        ).length;


    const nearExpiryMedicines =
        medicines.filter(
            medicine => {

                const expiry =
                    getExpiryInfo(
                        medicine.expiryDate
                    );

                return (
                    expiry.label.includes("days left")
                );

            }
        ).length;



    // =========================================================
    // CLEAR SEARCH
    // =========================================================

    const clearSearch = () => {

        setSearch("");

        setFilter("ALL");

    };



    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div
            className="
                min-h-screen
                bg-gradient-to-br
                from-slate-50
                via-blue-50/40
                to-cyan-50/50
                px-3
                sm:px-5
                lg:px-8
                py-5
                lg:py-8
            "
        >

            <div className="max-w-[1600px] mx-auto">


                {/* =================================================
                    TOP HEADER
                ================================================= */}

                <div
                    className="
                        flex
                        flex-col
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                        gap-5
                        mb-7
                    "
                >

                    <div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/pharmacist/dashboard"
                                )
                            }
                            className="
                                inline-flex
                                items-center
                                gap-2
                                mb-4
                                px-4
                                py-2
                                rounded-xl
                                bg-white
                                border
                                border-slate-200
                                text-slate-600
                                text-sm
                                font-semibold
                                shadow-sm
                                hover:border-blue-300
                                hover:text-blue-600
                                transition
                            "
                        >

                            <FaArrowLeft />

                            Back to Dashboard

                        </button>


                        <div
                            className="
                                flex
                                items-center
                                gap-4
                            "
                        >

                            <div
                                className="
                                    w-14
                                    h-14
                                    rounded-2xl
                                    bg-gradient-to-br
                                    from-blue-600
                                    to-cyan-500
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                    shadow-lg
                                    shadow-blue-200
                                "
                            >

                                <FaWarehouse
                                    size={23}
                                />

                            </div>


                            <div>

                                <h1
                                    className="
                                        text-2xl
                                        sm:text-3xl
                                        font-bold
                                        text-slate-800
                                    "
                                >
                                    Medicine Stock
                                </h1>

                                <p
                                    className="
                                        text-sm
                                        text-slate-500
                                        mt-1
                                    "
                                >
                                    Monitor medicine inventory,
                                    availability and expiry status.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* REFRESH */}

                    <button
                        onClick={() =>
                            loadStock(true)
                        }
                        disabled={
                            loading ||
                            refreshing
                        }
                        className="
                            self-start
                            lg:self-center
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            px-5
                            py-3
                            rounded-xl
                            bg-white
                            border
                            border-slate-200
                            text-slate-700
                            font-semibold
                            text-sm
                            shadow-sm
                            hover:border-blue-300
                            hover:text-blue-600
                            disabled:opacity-60
                            transition
                        "
                    >

                        <FaSyncAlt
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh Stock"
                        }

                    </button>

                </div>



                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                {!loading && !error && (

                    <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            xl:grid-cols-5
                            gap-4
                            mb-7
                        "
                    >

                        {/* TOTAL */}

                        <SummaryCard
                            icon={<FaBoxes />}
                            label="Total Medicines"
                            value={totalMedicines}
                            iconClass="bg-blue-50 text-blue-600"
                        />


                        {/* AVAILABLE */}

                        <SummaryCard
                            icon={<FaCheckCircle />}
                            label="Available"
                            value={availableMedicines}
                            iconClass="bg-emerald-50 text-emerald-600"
                            valueClass="text-emerald-600"
                        />


                        {/* LOW */}

                        <SummaryCard
                            icon={<FaExclamationTriangle />}
                            label="Low Stock"
                            value={lowStockMedicines}
                            iconClass="bg-amber-50 text-amber-600"
                            valueClass="text-amber-600"
                        />


                        {/* OUT */}

                        <SummaryCard
                            icon={<FaTimesCircle />}
                            label="Out of Stock"
                            value={outOfStockMedicines}
                            iconClass="bg-red-50 text-red-600"
                            valueClass="text-red-600"
                        />


                        {/* EXPIRY */}

                        <SummaryCard
                            icon={<FaClock />}
                            label="Near Expiry"
                            value={nearExpiryMedicines}
                            iconClass="bg-purple-50 text-purple-600"
                            valueClass="text-purple-600"
                        />

                    </div>

                )}



                {/* =================================================
                    SEARCH + FILTER
                ================================================= */}

                <div
                    className="
                        bg-white
                        rounded-3xl
                        border
                        border-slate-200
                        shadow-sm
                        p-4
                        sm:p-5
                        mb-6
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            lg:flex-row
                            gap-4
                            lg:items-center
                        "
                    >

                        {/* SEARCH */}

                        <div
                            className="
                                relative
                                flex-1
                            "
                        >

                            <FaSearch
                                className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="
                                    Search medicine name,
                                    batch number or category...
                                "
                                className="
                                    w-full
                                    h-12
                                    rounded-2xl
                                    bg-slate-50
                                    border
                                    border-slate-200
                                    pl-11
                                    pr-4
                                    text-sm
                                    text-slate-700
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-4
                                    focus:ring-blue-100
                                    transition
                                "
                            />

                        </div>


                        {/* FILTER */}

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                flex-wrap
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-slate-500
                                    text-sm
                                    font-semibold
                                    mr-1
                                "
                            >

                                <FaFilter />

                                Filter

                            </div>


                            <FilterButton
                                label="All"
                                active={
                                    filter === "ALL"
                                }
                                onClick={() =>
                                    setFilter("ALL")
                                }
                            />


                            <FilterButton
                                label="Available"
                                active={
                                    filter === "AVAILABLE"
                                }
                                onClick={() =>
                                    setFilter(
                                        "AVAILABLE"
                                    )
                                }
                            />


                            <FilterButton
                                label="Low Stock"
                                active={
                                    filter === "LOW"
                                }
                                onClick={() =>
                                    setFilter("LOW")
                                }
                            />


                            <FilterButton
                                label="Out of Stock"
                                active={
                                    filter === "OUT"
                                }
                                onClick={() =>
                                    setFilter("OUT")
                                }
                            />

                        </div>

                    </div>


                    {/* RESULT INFO */}

                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            justify-between
                            gap-3
                            mt-4
                            pt-4
                            border-t
                            border-slate-100
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                text-slate-500
                            "
                        >

                            <FaBoxes />

                            Showing

                            <span
                                className="
                                    font-bold
                                    text-slate-800
                                "
                            >
                                {filteredMedicines.length}
                            </span>

                            of

                            <span
                                className="
                                    font-bold
                                    text-slate-800
                                "
                            >
                                {medicines.length}
                            </span>

                            medicines

                        </div>


                        {(search ||
                            filter !== "ALL") && (

                            <button
                                onClick={clearSearch}
                                className="
                                    text-sm
                                    font-semibold
                                    text-blue-600
                                    hover:text-blue-800
                                "
                            >
                                Clear filters
                            </button>

                        )}

                    </div>

                </div>



                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        className="
                            mb-6
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            px-5
                            py-4
                            flex
                            items-center
                            gap-3
                            text-red-700
                        "
                    >

                        <FaExclamationTriangle />

                        <div className="flex-1">

                            <p className="font-bold">
                                Unable to load stock
                            </p>

                            <p
                                className="
                                    text-sm
                                    mt-0.5
                                "
                            >
                                {error}
                            </p>

                        </div>


                        <button
                            onClick={() =>
                                loadStock()
                            }
                            className="
                                px-4
                                py-2
                                rounded-xl
                                bg-white
                                border
                                border-red-200
                                text-red-600
                                text-sm
                                font-semibold
                                hover:bg-red-100
                            "
                        >
                            Retry
                        </button>

                    </div>

                )}



                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div
                        className="
                            bg-white
                            rounded-3xl
                            border
                            border-slate-200
                            shadow-sm
                            overflow-hidden
                        "
                    >

                        <div
                            className="
                                p-5
                                border-b
                                border-slate-100
                            "
                        >

                            <div
                                className="
                                    h-5
                                    w-48
                                    bg-slate-200
                                    rounded
                                    animate-pulse
                                "
                            />

                        </div>


                        <div className="divide-y divide-slate-100">

                            {[1, 2, 3, 4, 5].map(
                                (item) => (

                                    <div
                                        key={item}
                                        className="
                                            p-5
                                            flex
                                            items-center
                                            gap-5
                                            animate-pulse
                                        "
                                    >

                                        <div
                                            className="
                                                w-10
                                                h-10
                                                rounded-xl
                                                bg-slate-200
                                            "
                                        />

                                        <div
                                            className="
                                                flex-1
                                                space-y-2
                                            "
                                        >

                                            <div
                                                className="
                                                    h-4
                                                    bg-slate-200
                                                    rounded
                                                    w-1/3
                                                "
                                            />

                                            <div
                                                className="
                                                    h-3
                                                    bg-slate-100
                                                    rounded
                                                    w-1/4
                                                "
                                            />

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                )}



                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    !error &&
                    filteredMedicines.length === 0 && (

                        <div
                            className="
                                bg-white
                                rounded-3xl
                                border
                                border-slate-200
                                shadow-sm
                                py-20
                                px-5
                                text-center
                            "
                        >

                            <div
                                className="
                                    w-20
                                    h-20
                                    mx-auto
                                    rounded-3xl
                                    bg-slate-100
                                    text-slate-400
                                    flex
                                    items-center
                                    justify-center
                                    text-3xl
                                    mb-5
                                "
                            >

                                <FaBoxes />

                            </div>


                            <h2
                                className="
                                    text-xl
                                    font-bold
                                    text-slate-800
                                "
                            >
                                No Medicines Found
                            </h2>


                            <p
                                className="
                                    mt-2
                                    text-sm
                                    text-slate-500
                                    max-w-md
                                    mx-auto
                                "
                            >
                                {search ||
                                filter !== "ALL"
                                    ? "No medicines match the current search or filter."
                                    : "There are currently no medicines in the inventory."
                                }
                            </p>


                            {(search ||
                                filter !== "ALL") && (

                                <button
                                    onClick={
                                        clearSearch
                                    }
                                    className="
                                        mt-5
                                        px-5
                                        py-2.5
                                        rounded-xl
                                        bg-blue-600
                                        text-white
                                        font-semibold
                                        text-sm
                                        hover:bg-blue-700
                                    "
                                >
                                    Clear Filters
                                </button>

                            )}

                        </div>

                    )}



                {/* =================================================
                    TABLE
                ================================================= */}

                {!loading &&
                    !error &&
                    filteredMedicines.length > 0 && (

                        <div
                            className="
                                bg-white
                                rounded-3xl
                                border
                                border-slate-200
                                shadow-sm
                                overflow-hidden
                            "
                        >

                            {/* TABLE HEADER */}

                            <div
                                className="
                                    px-5
                                    sm:px-6
                                    py-5
                                    border-b
                                    border-slate-100
                                    flex
                                    flex-col
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                    gap-3
                                "
                            >

                                <div>

                                    <h2
                                        className="
                                            text-lg
                                            font-bold
                                            text-slate-800
                                        "
                                    >
                                        Inventory Overview
                                    </h2>

                                    <p
                                        className="
                                            text-sm
                                            text-slate-500
                                            mt-1
                                        "
                                    >
                                        Current medicine stock
                                        and expiry information
                                    </p>

                                </div>


                                <div
                                    className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        px-3
                                        py-2
                                        rounded-xl
                                        bg-blue-50
                                        text-blue-700
                                        text-sm
                                        font-semibold
                                    "
                                >

                                    <FaWarehouse />

                                    Live Inventory

                                </div>

                            </div>


                            {/* TABLE */}

                            <div
                                className="
                                    overflow-x-auto
                                "
                            >

                                <table
                                    className="
                                        w-full
                                        min-w-[1150px]
                                    "
                                >

                                    <thead>

                                        <tr
                                            className="
                                                bg-slate-50
                                                border-b
                                                border-slate-200
                                            "
                                        >

                                            <TableHead>
                                                #
                                            </TableHead>

                                            <TableHead>
                                                Medicine
                                            </TableHead>

                                            <TableHead>
                                                Batch
                                            </TableHead>

                                            <TableHead>
                                                Category
                                            </TableHead>

                                            <TableHead>
                                                Stock
                                            </TableHead>

                                            <TableHead>
                                                Min Stock
                                            </TableHead>

                                            <TableHead>
                                                Price
                                            </TableHead>

                                            <TableHead>
                                                Expiry
                                            </TableHead>

                                            <TableHead>
                                                Status
                                            </TableHead>

                                        </tr>

                                    </thead>


                                    <tbody
                                        className="
                                            divide-y
                                            divide-slate-100
                                        "
                                    >

                                        {filteredMedicines.map(
                                            (
                                                medicine,
                                                index
                                            ) => {

                                                const quantity =
                                                    getQuantity(
                                                        medicine
                                                    );

                                                const minStock =
                                                    getMinStock(
                                                        medicine
                                                    );

                                                const status =
                                                    getStatus(
                                                        medicine
                                                    );

                                                const expiry =
                                                    getExpiryInfo(
                                                        medicine.expiryDate
                                                    );


                                                return (

                                                    <tr
                                                        key={
                                                            medicine.id ||
                                                            index
                                                        }
                                                        className="
                                                            hover:bg-blue-50/40
                                                            transition
                                                        "
                                                    >

                                                        {/* # */}

                                                        <TableCell>

                                                            <span
                                                                className="
                                                                    inline-flex
                                                                    w-8
                                                                    h-8
                                                                    items-center
                                                                    justify-center
                                                                    rounded-lg
                                                                    bg-slate-100
                                                                    text-slate-500
                                                                    text-xs
                                                                    font-bold
                                                                "
                                                            >
                                                                {index + 1}
                                                            </span>

                                                        </TableCell>


                                                        {/* MEDICINE */}

                                                        <TableCell>

                                                            <div
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-3
                                                                "
                                                            >

                                                                <div
                                                                    className="
                                                                        w-10
                                                                        h-10
                                                                        rounded-xl
                                                                        bg-blue-50
                                                                        text-blue-600
                                                                        flex
                                                                        items-center
                                                                        justify-center
                                                                        flex-shrink-0
                                                                    "
                                                                >

                                                                    <FaPills />

                                                                </div>


                                                                <div>

                                                                    <p
                                                                        className="
                                                                            font-bold
                                                                            text-slate-800
                                                                        "
                                                                    >
                                                                        {
                                                                            medicine.name ||
                                                                            "N/A"
                                                                        }
                                                                    </p>

                                                                    <p
                                                                        className="
                                                                            text-xs
                                                                            text-slate-400
                                                                            mt-0.5
                                                                        "
                                                                    >
                                                                        ID:{" "}
                                                                        {medicine.id ||
                                                                            "N/A"}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </TableCell>


                                                        {/* BATCH */}

                                                        <TableCell>

                                                            <div
                                                                className="
                                                                    inline-flex
                                                                    items-center
                                                                    gap-2
                                                                    text-sm
                                                                    text-slate-600
                                                                "
                                                            >

                                                                <FaTag
                                                                    className="
                                                                        text-slate-400
                                                                    "
                                                                />

                                                                {
                                                                    medicine.batchNumber ||
                                                                    "N/A"
                                                                }

                                                            </div>

                                                        </TableCell>


                                                        {/* CATEGORY */}

                                                        <TableCell>

                                                            <span
                                                                className="
                                                                    inline-flex
                                                                    items-center
                                                                    px-3
                                                                    py-1.5
                                                                    rounded-lg
                                                                    bg-slate-100
                                                                    text-slate-600
                                                                    text-xs
                                                                    font-semibold
                                                                "
                                                            >
                                                                {
                                                                    medicine.category ||
                                                                    "N/A"
                                                                }
                                                            </span>

                                                        </TableCell>


                                                        {/* QUANTITY */}

                                                        <TableCell>

                                                            <div
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                "
                                                            >

                                                                <span
                                                                    className={`
                                                                        inline-flex
                                                                        min-w-[48px]
                                                                        justify-center
                                                                        px-3
                                                                        py-1.5
                                                                        rounded-lg
                                                                        text-sm
                                                                        font-bold
                                                                        ${
                                                                            quantity <= 0
                                                                                ? "bg-red-50 text-red-700"
                                                                                : quantity <= minStock
                                                                                    ? "bg-amber-50 text-amber-700"
                                                                                    : "bg-emerald-50 text-emerald-700"
                                                                        }
                                                                    `}
                                                                >
                                                                    {
                                                                        quantity
                                                                    }
                                                                </span>

                                                                <span
                                                                    className="
                                                                        text-xs
                                                                        text-slate-400
                                                                    "
                                                                >
                                                                    units
                                                                </span>

                                                            </div>

                                                        </TableCell>


                                                        {/* MIN STOCK */}

                                                        <TableCell>

                                                            <span
                                                                className="
                                                                    font-semibold
                                                                    text-slate-600
                                                                "
                                                            >
                                                                {
                                                                    minStock
                                                                }
                                                            </span>

                                                        </TableCell>


                                                        {/* PRICE */}

                                                        <TableCell>

                                                            <div
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-1
                                                                    font-bold
                                                                    text-slate-800
                                                                "
                                                            >

                                                                <FaRupeeSign
                                                                    className="
                                                                        text-xs
                                                                        text-slate-400
                                                                    "
                                                                />

                                                                {
                                                                    Number(
                                                                        medicine.sellingPrice ??
                                                                        medicine.price ??
                                                                        0
                                                                    ).toFixed(2)
                                                                }

                                                            </div>

                                                            <p
                                                                className="
                                                                    text-[11px]
                                                                    text-slate-400
                                                                    mt-0.5
                                                                "
                                                            >
                                                                Selling price
                                                            </p>

                                                        </TableCell>


                                                        {/* EXPIRY */}

                                                        <TableCell>

                                                            <div>

                                                                <div
                                                                    className={`
                                                                        flex
                                                                        items-center
                                                                        gap-2
                                                                        text-sm
                                                                        font-semibold
                                                                        ${expiry.className}
                                                                    `}
                                                                >

                                                                    <FaCalendarAlt />

                                                                    {
                                                                        medicine.expiryDate
                                                                            ? formatDate(
                                                                                medicine.expiryDate
                                                                            )
                                                                            : "N/A"
                                                                    }

                                                                </div>


                                                                {medicine.expiryDate && (

                                                                    <span
                                                                        className={`
                                                                            inline-flex
                                                                            mt-1.5
                                                                            px-2
                                                                            py-1
                                                                            rounded-md
                                                                            border
                                                                            text-[10px]
                                                                            font-bold
                                                                            ${expiry.badge}
                                                                        `}
                                                                    >
                                                                        {
                                                                            expiry.label
                                                                        }
                                                                    </span>

                                                                )}

                                                            </div>

                                                        </TableCell>


                                                        {/* STATUS */}

                                                        <TableCell>

                                                            <span
                                                                className={`
                                                                    inline-flex
                                                                    items-center
                                                                    justify-center
                                                                    gap-2
                                                                    px-3
                                                                    py-2
                                                                    rounded-xl
                                                                    border
                                                                    text-xs
                                                                    font-bold
                                                                    whitespace-nowrap
                                                                    ${status.className}
                                                                `}
                                                            >

                                                                {
                                                                    status.icon
                                                                }

                                                                {
                                                                    status.label
                                                                }

                                                            </span>

                                                        </TableCell>

                                                    </tr>

                                                );

                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>


                            {/* TABLE FOOTER */}

                            <div
                                className="
                                    px-5
                                    sm:px-6
                                    py-4
                                    border-t
                                    border-slate-100
                                    bg-slate-50/70
                                    flex
                                    flex-col
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                    gap-3
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                        text-slate-500
                                    "
                                >
                                    Showing{" "}
                                    <span
                                        className="
                                            font-bold
                                            text-slate-700
                                        "
                                    >
                                        {filteredMedicines.length}
                                    </span>{" "}
                                    medicine records
                                </p>


                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-4
                                        text-xs
                                        text-slate-500
                                    "
                                >

                                    <span
                                        className="
                                            flex
                                            items-center
                                            gap-1.5
                                        "
                                    >

                                        <span
                                            className="
                                                w-2
                                                h-2
                                                rounded-full
                                                bg-emerald-500
                                            "
                                        />

                                        Available

                                    </span>


                                    <span
                                        className="
                                            flex
                                            items-center
                                            gap-1.5
                                        "
                                    >

                                        <span
                                            className="
                                                w-2
                                                h-2
                                                rounded-full
                                                bg-amber-500
                                            "
                                        />

                                        Low Stock

                                    </span>


                                    <span
                                        className="
                                            flex
                                            items-center
                                            gap-1.5
                                        "
                                    >

                                        <span
                                            className="
                                                w-2
                                                h-2
                                                rounded-full
                                                bg-red-500
                                            "
                                        />

                                        Out of Stock

                                    </span>

                                </div>

                            </div>

                        </div>

                    )}

            </div>

        </div>

    );

}



// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
    icon,
    label,
    value,
    iconClass,
    valueClass = "text-slate-800"
}) {

    return (

        <div
            className="
                bg-white
                rounded-2xl
                border
                border-slate-200
                p-5
                shadow-sm
                hover:shadow-md
                hover:-translate-y-0.5
                transition
            "
        >

            <div
                className="
                    flex
                    items-center
                    gap-4
                "
            >

                <div
                    className={`
                        w-12
                        h-12
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        text-lg
                        ${iconClass}
                    `}
                >

                    {icon}

                </div>


                <div>

                    <p
                        className="
                            text-xs
                            font-medium
                            text-slate-400
                        "
                    >
                        {label}
                    </p>

                    <p
                        className={`
                            text-2xl
                            font-bold
                            mt-1
                            ${valueClass}
                        `}
                    >
                        {value}
                    </p>

                </div>

            </div>

        </div>

    );

}



// =========================================================
// FILTER BUTTON
// =========================================================

function FilterButton({
    label,
    active,
    onClick
}) {

    return (

        <button
            onClick={onClick}
            className={`
                px-4
                py-2.5
                rounded-xl
                text-xs
                sm:text-sm
                font-semibold
                border
                transition
                ${
                    active
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                }
            `}
        >
            {label}
        </button>

    );

}



// =========================================================
// TABLE HEAD
// =========================================================

function TableHead({ children }) {

    return (

        <th
            className="
                px-5
                py-4
                text-left
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-slate-500
                whitespace-nowrap
            "
        >
            {children}
        </th>

    );

}



// =========================================================
// TABLE CELL
// =========================================================

function TableCell({ children }) {

    return (

        <td
            className="
                px-5
                py-4
                text-sm
                text-slate-600
                whitespace-nowrap
            "
        >
            {children}
        </td>

    );

}



export default ViewStock;
