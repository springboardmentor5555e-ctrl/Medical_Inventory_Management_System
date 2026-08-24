import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    FaPills,
    FaSearch,
    FaPlus,
    FaEdit,
    FaTrash,
    FaCalendarAlt,
    FaBoxes,
    FaExclamationTriangle,
    FaCheckCircle,
    FaLayerGroup,
    FaTimes,
    FaSyncAlt
} from "react-icons/fa";

function ViewMedicines() {

    const navigate = useNavigate();

    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    // =========================================================
    // LOAD MEDICINES
    // =========================================================

    useEffect(() => {

        loadMedicines();

    }, []);

    const loadMedicines = async () => {

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            const res = await axios.get(
                "http://localhost:8080/api/medicines",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMedicines(
                Array.isArray(res.data)
                    ? res.data
                    : []
            );

        } catch (error) {

            console.error(
                "Medicine loading error:",
                error
            );

            if (error.response?.status === 401) {

                alert(
                    "Session expired. Please login again."
                );

            } else if (error.response?.status === 403) {

                alert(
                    "Access denied. Login with ADMIN account."
                );

            } else {

                alert(
                    "Failed to load medicines."
                );

            }

        } finally {

            setLoading(false);

        }

    };

    // =========================================================
    // GET SUPPLIER NAME
    // =========================================================

    const getSupplierName = (medicine) => {

        if (!medicine) {
            return "—";
        }

        if (
            medicine.supplier &&
            typeof medicine.supplier === "object"
        ) {

            return (
                medicine.supplier.name ||
                medicine.supplier.supplierName ||
                "—"
            );

        }

        return medicine.supplier || "—";

    };

    // =========================================================
    // DELETE MEDICINE
    // =========================================================

    const deleteMedicine = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this medicine?\n\nThis action cannot be undone."
        );

        if (!confirmDelete) {
            return;
        }

        try {

            setDeletingId(id);

            const token = localStorage.getItem("token");

            const response = await axios.delete(
                `http://localhost:8080/api/medicines/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(
                response.data ||
                "Medicine deleted successfully."
            );

            await loadMedicines();

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            alert(
                error.response?.data ||
                "Unable to delete medicine."
            );

        } finally {

            setDeletingId(null);

        }

    };

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredMedicines = useMemo(() => {

        const value = search
            .trim()
            .toLowerCase();

        if (!value) {

            return medicines;

        }

        return medicines.filter((medicine) => {

            const supplierName =
                getSupplierName(medicine)
                    .toLowerCase();

            return (

                medicine.name
                    ?.toLowerCase()
                    .includes(value)

                ||

                medicine.batchNumber
                    ?.toLowerCase()
                    .includes(value)

                ||

                medicine.category
                    ?.toLowerCase()
                    .includes(value)

                ||

                supplierName.includes(value)

                ||

                medicine.manufacturer
                    ?.toLowerCase()
                    .includes(value)

            );

        });

    }, [medicines, search]);

    // =========================================================
    // STOCK STATUS
    // =========================================================

    const getStockStatus = (
        quantity,
        minStockLevel = 10
    ) => {

        const qty =
            Number(quantity || 0);

        const minimum =
            Number(minStockLevel || 10);

        if (qty <= 0) {

            return {

                text: "Out of Stock",

                icon:
                    <FaExclamationTriangle />,

                className:
                    "bg-red-50 text-red-700 border-red-200"

            };

        }

        if (qty <= minimum) {

            return {

                text: "Low Stock",

                icon:
                    <FaExclamationTriangle />,

                className:
                    "bg-amber-50 text-amber-700 border-amber-200"

            };

        }

        return {

            text: "Available",

            icon:
                <FaCheckCircle />,

            className:
                "bg-emerald-50 text-emerald-700 border-emerald-200"

        };

    };

    // =========================================================
    // EXPIRY STATUS
    // =========================================================

    const getExpiryStatus = (date) => {

        if (!date) {

            return {

                text: "No Date",

                className:
                    "bg-gray-100 text-gray-600 border-gray-200"

            };

        }

        const today = new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        const expiry =
            new Date(date);

        expiry.setHours(
            0,
            0,
            0,
            0
        );

        const difference =
            (
                expiry.getTime() -
                today.getTime()
            ) /
            (
                1000 *
                60 *
                60 *
                24
            );

        if (difference < 0) {

            return {

                text: "Expired",

                className:
                    "bg-red-50 text-red-700 border-red-200"

            };

        }

        if (difference <= 30) {

            return {

                text: "Near Expiry",

                className:
                    "bg-orange-50 text-orange-700 border-orange-200"

            };

        }

        return {

            text: "Safe",

            className:
                "bg-emerald-50 text-emerald-700 border-emerald-200"

        };

    };

    // =========================================================
    // SUMMARY
    // =========================================================

    const totalMedicines =
        medicines.length;

    const lowStockMedicines =
        medicines.filter(
            (medicine) =>

                Number(
                    medicine.quantity || 0
                )

                <=

                Number(
                    medicine.minStockLevel || 10
                )

        ).length;

    const expiredMedicines =
        medicines.filter(
            (medicine) => {

                if (!medicine.expiryDate) {
                    return false;
                }

                const today =
                    new Date();

                today.setHours(
                    0,
                    0,
                    0,
                    0
                );

                const expiry =
                    new Date(
                        medicine.expiryDate
                    );

                expiry.setHours(
                    0,
                    0,
                    0,
                    0
                );

                return expiry < today;

            }
        ).length;

    const nearExpiryMedicines =
        medicines.filter(
            (medicine) => {

                if (!medicine.expiryDate) {
                    return false;
                }

                const today =
                    new Date();

                today.setHours(
                    0,
                    0,
                    0,
                    0
                );

                const expiry =
                    new Date(
                        medicine.expiryDate
                    );

                expiry.setHours(
                    0,
                    0,
                    0,
                    0
                );

                const days =
                    (
                        expiry.getTime() -
                        today.getTime()
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    );

                return (
                    days >= 0 &&
                    days <= 30
                );

            }
        ).length;

    const availableMedicines =
        medicines.filter(
            (medicine) =>

                Number(
                    medicine.quantity || 0
                )

                >

                Number(
                    medicine.minStockLevel || 10
                )

        ).length;

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

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
    // UI
    // =========================================================

    return (

        <div className="
            w-full
            max-w-full
            min-h-full
            bg-gradient-to-br
            from-slate-50
            via-blue-50/40
            to-cyan-50/30
            p-3
            sm:p-4
            md:p-5
            lg:p-6
            overflow-x-hidden
        ">

            <div className="
                w-full
                max-w-full
                mx-auto
                space-y-5
            ">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="
                    relative
                    overflow-hidden
                    rounded-3xl
                    bg-white
                    border
                    border-slate-200
                    shadow-sm
                    w-full
                    max-w-full
                ">

                    <div className="
                        absolute
                        -right-20
                        -top-24
                        w-72
                        h-72
                        bg-blue-100/60
                        rounded-full
                        blur-3xl
                    "></div>

                    <div className="
                        absolute
                        -left-20
                        -bottom-28
                        w-72
                        h-72
                        bg-cyan-100/50
                        rounded-full
                        blur-3xl
                    "></div>

                    <div className="
                        relative
                        p-5
                        md:p-6
                    ">

                        <div className="
                            flex
                            flex-col
                            xl:flex-row
                            xl:items-center
                            xl:justify-between
                            gap-5
                        ">

                            {/* HEADER LEFT */}

                            <div className="
                                flex
                                items-start
                                gap-4
                                min-w-0
                            ">

                                <div className="
                                    w-14
                                    h-14
                                    md:w-16
                                    md:h-16
                                    rounded-2xl
                                    bg-gradient-to-br
                                    from-blue-600
                                    to-cyan-500
                                    flex
                                    items-center
                                    justify-center
                                    shadow-lg
                                    shadow-blue-200
                                    flex-shrink-0
                                ">

                                    <FaPills
                                        className="text-white"
                                        size={27}
                                    />

                                </div>

                                <div className="min-w-0">

                                    <div className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-2
                                    ">

                                        <h1 className="
                                            text-2xl
                                            md:text-3xl
                                            font-bold
                                            text-slate-800
                                        ">
                                            Medicine Inventory
                                        </h1>

                                        <span className="
                                            px-3
                                            py-1
                                            rounded-full
                                            bg-blue-50
                                            text-blue-700
                                            border
                                            border-blue-100
                                            text-xs
                                            font-semibold
                                        ">
                                            ADMIN
                                        </span>

                                    </div>

                                    <p className="
                                        text-slate-500
                                        mt-2
                                        text-sm
                                        md:text-base
                                    ">
                                        Manage medicines, stock levels,
                                        suppliers and expiry information.
                                    </p>

                                    <div className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-4
                                        mt-4
                                        text-sm
                                        text-slate-500
                                    ">

                                        <span className="
                                            flex
                                            items-center
                                            gap-2
                                        ">

                                            <FaLayerGroup
                                                className="text-blue-500"
                                            />

                                            {totalMedicines}
                                            {" "}
                                            medicines

                                        </span>

                                        <span className="
                                            hidden
                                            sm:block
                                            text-slate-300
                                        ">
                                            |
                                        </span>

                                        <span className="
                                            flex
                                            items-center
                                            gap-2
                                        ">

                                            <FaBoxes
                                                className="text-cyan-500"
                                            />

                                            Inventory management

                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* HEADER BUTTONS */}

                            <div className="
                                flex
                                flex-col
                                sm:flex-row
                                gap-3
                                flex-shrink-0
                            ">

                                <button
                                    onClick={loadMedicines}
                                    disabled={loading}
                                    className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        px-4
                                        py-3
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        text-slate-700
                                        hover:bg-slate-50
                                        font-semibold
                                        transition
                                        disabled:opacity-50
                                    "
                                >

                                    <FaSyncAlt
                                        className={
                                            loading
                                                ? "animate-spin"
                                                : ""
                                        }
                                    />

                                    Refresh

                                </button>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/admin/add-medicine"
                                        )
                                    }
                                    className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        px-5
                                        py-3
                                        rounded-xl
                                        bg-gradient-to-r
                                        from-blue-600
                                        to-cyan-500
                                        hover:from-blue-700
                                        hover:to-cyan-600
                                        text-white
                                        font-semibold
                                        shadow-lg
                                        shadow-blue-200
                                        transition
                                    "
                                >

                                    <FaPlus />

                                    Add Medicine

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                <div className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    xl:grid-cols-5
                    gap-4
                    w-full
                ">

                    {/* TOTAL */}

                    <div className="
                        bg-white
                        border
                        border-slate-200
                        rounded-2xl
                        p-5
                        shadow-sm
                        hover:shadow-md
                        transition
                    ">

                        <div className="
                            flex
                            items-center
                            justify-between
                            gap-3
                        ">

                            <div className="min-w-0">

                                <p className="
                                    text-sm
                                    font-medium
                                    text-slate-500
                                ">
                                    Total Medicines
                                </p>

                                <h2 className="
                                    text-3xl
                                    font-bold
                                    text-slate-800
                                    mt-2
                                ">
                                    {totalMedicines}
                                </h2>

                                <p className="
                                    text-xs
                                    text-slate-400
                                    mt-1
                                ">
                                    In inventory
                                </p>

                            </div>

                            <div className="
                                w-12
                                h-12
                                rounded-xl
                                bg-blue-50
                                flex
                                items-center
                                justify-center
                                flex-shrink-0
                            ">

                                <FaPills
                                    className="text-blue-600"
                                    size={20}
                                />

                            </div>

                        </div>

                    </div>

                    {/* AVAILABLE */}

                    <div className="
                        bg-white
                        border
                        border-slate-200
                        rounded-2xl
                        p-5
                        shadow-sm
                        hover:shadow-md
                        transition
                    ">

                        <div className="
                            flex
                            items-center
                            justify-between
                            gap-3
                        ">

                            <div>

                                <p className="
                                    text-sm
                                    font-medium
                                    text-slate-500
                                ">
                                    Available
                                </p>

                                <h2 className="
                                    text-3xl
                                    font-bold
                                    text-emerald-600
                                    mt-2
                                ">
                                    {availableMedicines}
                                </h2>

                                <p className="
                                    text-xs
                                    text-slate-400
                                    mt-1
                                ">
                                    Healthy stock
                                </p>

                            </div>

                            <div className="
                                w-12
                                h-12
                                rounded-xl
                                bg-emerald-50
                                flex
                                items-center
                                justify-center
                                flex-shrink-0
                            ">

                                <FaCheckCircle
                                    className="text-emerald-600"
                                    size={20}
                                />

                            </div>

                        </div>

                    </div>

                    {/* LOW STOCK */}

                    <div className="
                        bg-white
                        border
                        border-slate-200
                        rounded-2xl
                        p-5
                        shadow-sm
                        hover:shadow-md
                        transition
                    ">

                        <div className="
                            flex
                            items-center
                            justify-between
                            gap-3
                        ">

                            <div>

                                <p className="
                                    text-sm
                                    font-medium
                                    text-slate-500
                                ">
                                    Low Stock
                                </p>

                                <h2 className="
                                    text-3xl
                                    font-bold
                                    text-amber-600
                                    mt-2
                                ">
                                    {lowStockMedicines}
                                </h2>

                                <p className="
                                    text-xs
                                    text-slate-400
                                    mt-1
                                ">
                                    Needs attention
                                </p>

                            </div>

                            <div className="
                                w-12
                                h-12
                                rounded-xl
                                bg-amber-50
                                flex
                                items-center
                                justify-center
                                flex-shrink-0
                            ">

                                <FaExclamationTriangle
                                    className="text-amber-600"
                                    size={20}
                                />

                            </div>

                        </div>

                    </div>

                    {/* NEAR EXPIRY */}

                    <div className="
                        bg-white
                        border
                        border-slate-200
                        rounded-2xl
                        p-5
                        shadow-sm
                        hover:shadow-md
                        transition
                    ">

                        <div className="
                            flex
                            items-center
                            justify-between
                            gap-3
                        ">

                            <div>

                                <p className="
                                    text-sm
                                    font-medium
                                    text-slate-500
                                ">
                                    Near Expiry
                                </p>

                                <h2 className="
                                    text-3xl
                                    font-bold
                                    text-orange-600
                                    mt-2
                                ">
                                    {nearExpiryMedicines}
                                </h2>

                                <p className="
                                    text-xs
                                    text-slate-400
                                    mt-1
                                ">
                                    Within 30 days
                                </p>

                            </div>

                            <div className="
                                w-12
                                h-12
                                rounded-xl
                                bg-orange-50
                                flex
                                items-center
                                justify-center
                                flex-shrink-0
                            ">

                                <FaCalendarAlt
                                    className="text-orange-600"
                                    size={20}
                                />

                            </div>

                        </div>

                    </div>

                    {/* EXPIRED */}

                    <div className="
                        bg-white
                        border
                        border-slate-200
                        rounded-2xl
                        p-5
                        shadow-sm
                        hover:shadow-md
                        transition
                    ">

                        <div className="
                            flex
                            items-center
                            justify-between
                            gap-3
                        ">

                            <div>

                                <p className="
                                    text-sm
                                    font-medium
                                    text-slate-500
                                ">
                                    Expired
                                </p>

                                <h2 className="
                                    text-3xl
                                    font-bold
                                    text-red-600
                                    mt-2
                                ">
                                    {expiredMedicines}
                                </h2>

                                <p className="
                                    text-xs
                                    text-slate-400
                                    mt-1
                                ">
                                    Requires action
                                </p>

                            </div>

                            <div className="
                                w-12
                                h-12
                                rounded-xl
                                bg-red-50
                                flex
                                items-center
                                justify-center
                                flex-shrink-0
                            ">

                                <FaExclamationTriangle
                                    className="text-red-600"
                                    size={20}
                                />

                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    SEARCH BAR
                ================================================= */}

                <div className="
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    shadow-sm
                    p-4
                    w-full
                    max-w-full
                ">

                    <div className="
                        flex
                        flex-col
                        lg:flex-row
                        gap-4
                        lg:items-center
                        lg:justify-between
                    ">

                        <div className="
                            relative
                            flex-1
                            min-w-0
                        ">

                            <FaSearch
                                className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                                size={15}
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
                                    Search medicine, batch,
                                    category, supplier or manufacturer...
                                "
                                className="
                                    w-full
                                    pl-11
                                    pr-11
                                    py-3.5
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50/50
                                    focus:bg-white
                                    focus:border-blue-400
                                    focus:ring-4
                                    focus:ring-blue-100
                                    outline-none
                                    transition
                                    text-sm
                                    text-slate-700
                                    placeholder:text-slate-400
                                "
                            />

                            {search && (

                                <button
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    className="
                                        absolute
                                        right-4
                                        top-1/2
                                        -translate-y-1/2
                                        text-slate-400
                                        hover:text-slate-700
                                    "
                                >

                                    <FaTimes />

                                </button>

                            )}

                        </div>

                        <div className="
                            flex
                            items-center
                            justify-between
                            lg:justify-end
                            gap-4
                            flex-shrink-0
                        ">

                            <div className="
                                text-sm
                                text-slate-500
                            ">

                                Showing{" "}

                                <span className="
                                    font-bold
                                    text-slate-800
                                ">
                                    {filteredMedicines.length}
                                </span>

                                {" "}of{" "}

                                <span className="
                                    font-bold
                                    text-slate-800
                                ">
                                    {medicines.length}
                                </span>

                            </div>

                            {search && (

                                <button
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    className="
                                        text-sm
                                        font-semibold
                                        text-blue-600
                                        hover:text-blue-700
                                    "
                                >
                                    Clear
                                </button>

                            )}

                        </div>

                    </div>

                </div>

                {/* =================================================
                    TABLE CONTAINER
                ================================================= */}

                <div className="
                    w-full
                    max-w-full
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    shadow-sm
                    overflow-hidden
                ">

                    {/* TABLE HEADER */}

                    <div className="
                        px-4
                        md:px-5
                        py-4
                        border-b
                        border-slate-100
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-3
                    ">

                        <div className="min-w-0">

                            <h2 className="
                                text-lg
                                font-bold
                                text-slate-800
                            ">
                                Medicine List
                            </h2>

                            <p className="
                                text-sm
                                text-slate-500
                                mt-1
                            ">
                                Current medicine inventory and availability status
                            </p>

                        </div>

                        <div className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                            text-xs
                            font-medium
                            text-slate-500
                        ">

                            <span className="
                                w-2
                                h-2
                                rounded-full
                                bg-emerald-500
                            "></span>

                            Available

                            <span className="
                                w-2
                                h-2
                                rounded-full
                                bg-amber-500
                                ml-2
                            "></span>

                            Low stock

                            <span className="
                                w-2
                                h-2
                                rounded-full
                                bg-red-500
                                ml-2
                            "></span>

                            Expired

                        </div>

                    </div>

                    {/* TABLE SCROLL AREA */}

                    <div className="
                        w-full
                        max-w-full
                        overflow-x-auto
                    ">

                        <table className="
                            w-full
                            min-w-[1050px]
                        ">

                            <thead>

                                <tr className="
                                    bg-slate-50
                                    border-b
                                    border-slate-200
                                ">

                                    <th className="
                                        px-4
                                        py-4
                                        text-left
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">
                                        Medicine
                                    </th>

                                    <th className="
                                        px-4
                                        py-4
                                        text-left
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">
                                        Category
                                    </th>

                                    <th className="
                                        px-4
                                        py-4
                                        text-left
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">
                                        Batch
                                    </th>

                                    <th className="
                                        px-4
                                        py-4
                                        text-left
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">
                                        Supplier
                                    </th>

                                    <th className="
                                        px-4
                                        py-4
                                        text-center
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">
                                        Quantity
                                    </th>

                                    <th className="
                                        px-4
                                        py-4
                                        text-right
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">
                                        Price
                                    </th>

                                    <th className="
                                        px-4
                                        py-4
                                        text-center
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">
                                        Stock Status
                                    </th>

                                    <th className="
                                        px-4
                                        py-4
                                        text-center
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">
                                        Expiry
                                    </th>

                                    <th className="
                                        px-4
                                        py-4
                                        text-center
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    ">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="
                                divide-y
                                divide-slate-100
                            ">

                                {/* =================================================
                                    LOADING
                                ================================================= */}

                                {loading && (

                                    <tr>

                                        <td
                                            colSpan="9"
                                            className="
                                                py-16
                                                text-center
                                            "
                                        >

                                            <div className="
                                                flex
                                                flex-col
                                                items-center
                                                justify-center
                                            ">

                                                <div className="
                                                    w-12
                                                    h-12
                                                    rounded-full
                                                    bg-blue-50
                                                    flex
                                                    items-center
                                                    justify-center
                                                    mb-4
                                                ">

                                                    <FaSyncAlt
                                                        className="
                                                            text-blue-600
                                                            animate-spin
                                                        "
                                                        size={20}
                                                    />

                                                </div>

                                                <p className="
                                                    font-semibold
                                                    text-slate-700
                                                ">
                                                    Loading medicines...
                                                </p>

                                                <p className="
                                                    text-sm
                                                    text-slate-400
                                                    mt-1
                                                ">
                                                    Please wait while we fetch your inventory.
                                                </p>

                                            </div>

                                        </td>

                                    </tr>

                                )}

                                {/* =================================================
                                    EMPTY
                                ================================================= */}

                                {!loading &&
                                    filteredMedicines.length === 0 && (

                                        <tr>

                                            <td
                                                colSpan="9"
                                                className="
                                                    py-16
                                                    text-center
                                                "
                                            >

                                                <div className="
                                                    flex
                                                    flex-col
                                                    items-center
                                                ">

                                                    <div className="
                                                        w-16
                                                        h-16
                                                        rounded-2xl
                                                        bg-slate-100
                                                        flex
                                                        items-center
                                                        justify-center
                                                        mb-4
                                                    ">

                                                        <FaPills
                                                            className="
                                                                text-slate-400
                                                            "
                                                            size={25}
                                                        />

                                                    </div>

                                                    <h3 className="
                                                        font-bold
                                                        text-slate-700
                                                    ">
                                                        No medicines found
                                                    </h3>

                                                    <p className="
                                                        text-sm
                                                        text-slate-400
                                                        mt-1
                                                        max-w-md
                                                    ">

                                                        {search

                                                            ?

                                                            "Try changing your search term or clear the search."

                                                            :

                                                            "Your medicine inventory is currently empty."

                                                        }

                                                    </p>

                                                    {search ? (

                                                        <button
                                                            onClick={() =>
                                                                setSearch("")
                                                            }
                                                            className="
                                                                mt-4
                                                                px-4
                                                                py-2
                                                                rounded-lg
                                                                bg-blue-50
                                                                text-blue-600
                                                                font-semibold
                                                                text-sm
                                                                hover:bg-blue-100
                                                            "
                                                        >
                                                            Clear Search
                                                        </button>

                                                    ) : (

                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    "/admin/add-medicine"
                                                                )
                                                            }
                                                            className="
                                                                mt-4
                                                                px-4
                                                                py-2
                                                                rounded-lg
                                                                bg-blue-600
                                                                text-white
                                                                font-semibold
                                                                text-sm
                                                                hover:bg-blue-700
                                                            "
                                                        >
                                                            Add First Medicine
                                                        </button>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    )}

                                {/* =================================================
                                    MEDICINES
                                ================================================= */}

                                {!loading &&
                                    filteredMedicines.map(
                                        (medicine) => {

                                            const stock =
                                                getStockStatus(
                                                    medicine.quantity,
                                                    medicine.minStockLevel
                                                );

                                            const expiry =
                                                getExpiryStatus(
                                                    medicine.expiryDate
                                                );

                                            const supplierName =
                                                getSupplierName(
                                                    medicine
                                                );

                                            return (

                                                <tr
                                                    key={
                                                        medicine.id
                                                    }
                                                    className="
                                                        group
                                                        hover:bg-blue-50/40
                                                        transition
                                                    "
                                                >

                                                    {/* MEDICINE */}

                                                    <td className="
                                                        px-4
                                                        py-4
                                                    ">

                                                        <div className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                        ">

                                                            <div className="
                                                                w-11
                                                                h-11
                                                                rounded-xl
                                                                bg-gradient-to-br
                                                                from-blue-50
                                                                to-cyan-50
                                                                border
                                                                border-blue-100
                                                                flex
                                                                items-center
                                                                justify-center
                                                                flex-shrink-0
                                                            ">

                                                                <FaPills
                                                                    className="
                                                                        text-blue-600
                                                                    "
                                                                    size={18}
                                                                />

                                                            </div>

                                                            <div className="
                                                                min-w-0
                                                            ">

                                                                <p className="
                                                                    font-bold
                                                                    text-slate-800
                                                                    truncate
                                                                    max-w-[200px]
                                                                ">
                                                                    {
                                                                        medicine.name ||
                                                                        "Unnamed Medicine"
                                                                    }
                                                                </p>

                                                                <p className="
                                                                    text-xs
                                                                    text-slate-500
                                                                    mt-1
                                                                    truncate
                                                                    max-w-[200px]
                                                                ">
                                                                    {
                                                                        medicine.manufacturer ||
                                                                        "Manufacturer not specified"
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* CATEGORY */}

                                                    <td className="
                                                        px-4
                                                        py-4
                                                    ">

                                                        <span className="
                                                            inline-flex
                                                            px-3
                                                            py-1.5
                                                            rounded-lg
                                                            bg-slate-100
                                                            text-slate-600
                                                            text-xs
                                                            font-semibold
                                                        ">
                                                            {
                                                                medicine.category ||
                                                                "—"
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* BATCH */}

                                                    <td className="
                                                        px-4
                                                        py-4
                                                    ">

                                                        <p className="
                                                            font-mono
                                                            text-sm
                                                            font-semibold
                                                            text-slate-700
                                                        ">
                                                            {
                                                                medicine.batchNumber ||
                                                                "—"
                                                            }
                                                        </p>

                                                    </td>

                                                    {/* SUPPLIER */}

                                                    <td className="
                                                        px-4
                                                        py-4
                                                    ">

                                                        <p className="
                                                            text-sm
                                                            font-medium
                                                            text-slate-600
                                                            max-w-[150px]
                                                            truncate
                                                        ">
                                                            {
                                                                supplierName
                                                            }
                                                        </p>

                                                    </td>

                                                    {/* QUANTITY */}

                                                    <td className="
                                                        px-4
                                                        py-4
                                                        text-center
                                                    ">

                                                        <div className="
                                                            flex
                                                            flex-col
                                                            items-center
                                                        ">

                                                            <span className="
                                                                text-lg
                                                                font-bold
                                                                text-slate-800
                                                            ">
                                                                {
                                                                    medicine.quantity ??
                                                                    0
                                                                }
                                                            </span>

                                                            <span className="
                                                                text-[11px]
                                                                text-slate-400
                                                            ">
                                                                units
                                                            </span>

                                                        </div>

                                                    </td>

                                                    {/* PRICE */}

                                                    <td className="
                                                        px-4
                                                        py-4
                                                        text-right
                                                    ">

                                                        <span className="
                                                            font-bold
                                                            text-blue-700
                                                        ">
                                                            ₹
                                                            {Number(
                                                                medicine.price ||
                                                                0
                                                            ).toFixed(2)}
                                                        </span>

                                                    </td>

                                                    {/* STOCK STATUS */}

                                                    <td className="
                                                        px-4
                                                        py-4
                                                        text-center
                                                    ">

                                                        <span
                                                            className={`
                                                                inline-flex
                                                                items-center
                                                                gap-1.5
                                                                px-3
                                                                py-1.5
                                                                rounded-full
                                                                border
                                                                text-xs
                                                                font-bold
                                                                ${stock.className}
                                                            `}
                                                        >

                                                            {
                                                                stock.icon
                                                            }

                                                            {
                                                                stock.text
                                                            }

                                                        </span>

                                                    </td>

                                                    {/* EXPIRY */}

                                                    <td className="
                                                        px-4
                                                        py-4
                                                    ">

                                                        <div className="
                                                            flex
                                                            flex-col
                                                            items-center
                                                            gap-2
                                                        ">

                                                            <span
                                                                className={`
                                                                    inline-flex
                                                                    px-3
                                                                    py-1.5
                                                                    rounded-full
                                                                    border
                                                                    text-xs
                                                                    font-bold
                                                                    ${expiry.className}
                                                                `}
                                                            >
                                                                {
                                                                    expiry.text
                                                                }
                                                            </span>

                                                            <span className="
                                                                flex
                                                                items-center
                                                                gap-1.5
                                                                text-xs
                                                                text-slate-500
                                                            ">

                                                                <FaCalendarAlt />

                                                                {
                                                                    formatDate(
                                                                        medicine.expiryDate
                                                                    )
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td className="
                                                        px-4
                                                        py-4
                                                    ">

                                                        <div className="
                                                            flex
                                                            items-center
                                                            justify-center
                                                            gap-2
                                                        ">

                                                            <button
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/admin/edit-medicine/${medicine.id}`
                                                                    )
                                                                }
                                                                title="Edit medicine"
                                                                className="
                                                                    w-9
                                                                    h-9
                                                                    rounded-lg
                                                                    bg-amber-50
                                                                    border
                                                                    border-amber-100
                                                                    text-amber-600
                                                                    hover:bg-amber-500
                                                                    hover:text-white
                                                                    flex
                                                                    items-center
                                                                    justify-center
                                                                    transition
                                                                "
                                                            >

                                                                <FaEdit
                                                                    size={14}
                                                                />

                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    deleteMedicine(
                                                                        medicine.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    medicine.id
                                                                }
                                                                title="Delete medicine"
                                                                className="
                                                                    w-9
                                                                    h-9
                                                                    rounded-lg
                                                                    bg-red-50
                                                                    border
                                                                    border-red-100
                                                                    text-red-600
                                                                    hover:bg-red-500
                                                                    hover:text-white
                                                                    flex
                                                                    items-center
                                                                    justify-center
                                                                    transition
                                                                    disabled:opacity-50
                                                                "
                                                            >

                                                                {
                                                                    deletingId ===
                                                                    medicine.id

                                                                        ?

                                                                        <FaSyncAlt
                                                                            className="
                                                                                animate-spin
                                                                            "
                                                                            size={14}
                                                                        />

                                                                        :

                                                                        <FaTrash
                                                                            size={14}
                                                                        />
                                                                }

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                            </tbody>

                        </table>

                    </div>

                    {/* TABLE FOOTER */}

                    {!loading &&
                        medicines.length > 0 && (

                            <div className="
                                px-4
                                md:px-5
                                py-4
                                border-t
                                border-slate-100
                                bg-slate-50/50
                                flex
                                flex-col
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                gap-3
                            ">

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">

                                    Showing{" "}

                                    <span className="
                                        font-semibold
                                        text-slate-700
                                    ">
                                        {
                                            filteredMedicines.length
                                        }
                                    </span>

                                    {" "}medicine
                                    {
                                        filteredMedicines.length !==
                                        1
                                            ? "s"
                                            : ""
                                    }

                                </p>

                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                    text-xs
                                    text-slate-400
                                ">

                                    <FaCheckCircle
                                        className="
                                            text-emerald-500
                                        "
                                    />

                                    Inventory data synced

                                </div>

                            </div>

                        )}

                </div>

            </div>

        </div>

    );

}

export default ViewMedicines;