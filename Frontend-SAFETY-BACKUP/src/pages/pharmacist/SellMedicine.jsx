import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
    FaSearch,
    FaShoppingCart,
    FaArrowLeft,
    FaCheckCircle,
    FaCheck,
    FaPlus,
    FaMinus,
    FaTrash,
    FaPills,
    FaBoxOpen,
    FaTimes,
    FaExclamationTriangle
} from "react-icons/fa";


function SellMedicine() {

    const navigate = useNavigate();

    const API = "http://localhost:8080";


    // =========================================================
    // STATES
    // =========================================================

    const [medicines, setMedicines] = useState([]);

    const [search, setSearch] = useState("");

    const [selected, setSelected] = useState([]);

    const [quantities, setQuantities] = useState({});

    const [message, setMessage] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    const [loading, setLoading] = useState(true);

    const [selling, setSelling] = useState(false);


    // =========================================================
    // LOAD MEDICINES
    // =========================================================

    const loadMedicines = async () => {

        setLoading(true);

        try {

            const token = localStorage.getItem("token");


            if (!token) {

                setErrorMessage(
                    "Your session has expired. Please login again."
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


            setMedicines(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        }
        catch (error) {

            console.error(
                "Medicine Load Error:",
                error.response?.data || error.message
            );


            if (error.response?.status === 401) {

                setErrorMessage(
                    "Session expired. Please login again."
                );

            }
            else if (error.response?.status === 403) {

                setErrorMessage(
                    "You do not have permission to view medicines."
                );

            }
            else {

                setErrorMessage(
                    "Unable to load medicines. Please try again."
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

        loadMedicines();

    }, []);


    // =========================================================
    // SELECT / UNSELECT MEDICINE
    // =========================================================

    const selectMedicine = (medicine) => {

        setMessage("");

        setErrorMessage("");


        const exists = selected.some(
            item => item.id === medicine.id
        );


        // -----------------------------------------
        // REMOVE IF ALREADY SELECTED
        // -----------------------------------------

        if (exists) {

            setSelected(
                selected.filter(
                    item => item.id !== medicine.id
                )
            );


            setQuantities(prev => {

                const updated = {
                    ...prev
                };

                delete updated[medicine.id];

                return updated;

            });


            return;

        }


        // -----------------------------------------
        // DO NOT SELECT OUT OF STOCK
        // -----------------------------------------

        if (
            Number(medicine.quantity) <= 0
        ) {

            setErrorMessage(
                `${medicine.name} is out of stock.`
            );

            return;

        }


        // -----------------------------------------
        // ADD MEDICINE
        // -----------------------------------------

        setSelected(prev => [
            ...prev,
            medicine
        ]);


        setQuantities(prev => ({
            ...prev,
            [medicine.id]: 1
        }));

    };


    // =========================================================
    // REMOVE MEDICINE FROM SALE
    // =========================================================

    const removeMedicine = (id) => {

        setSelected(prev =>
            prev.filter(
                medicine => medicine.id !== id
            )
        );


        setQuantities(prev => {

            const updated = {
                ...prev
            };

            delete updated[id];

            return updated;

        });

    };


    // =========================================================
    // UPDATE QUANTITY
    // =========================================================

    const updateQuantity = (id, value) => {

        const medicine = selected.find(
            item => item.id === id
        );


        if (!medicine) {
            return;
        }


        let quantity = Number(value);


        if (
            Number.isNaN(quantity) ||
            quantity < 1
        ) {

            quantity = 1;

        }


        const availableStock =
            Number(medicine.quantity) || 0;


        if (quantity > availableStock) {

            quantity = availableStock;

        }


        setQuantities(prev => ({
            ...prev,
            [id]: quantity
        }));

    };


    // =========================================================
    // INCREASE QUANTITY
    // =========================================================

    const increaseQuantity = (medicine) => {

        const current =
            Number(quantities[medicine.id]) || 1;


        const availableStock =
            Number(medicine.quantity) || 0;


        if (
            current >= availableStock
        ) {

            return;

        }


        updateQuantity(
            medicine.id,
            current + 1
        );

    };


    // =========================================================
    // DECREASE QUANTITY
    // =========================================================

    const decreaseQuantity = (medicine) => {

        const current =
            Number(quantities[medicine.id]) || 1;


        if (current <= 1) {

            return;

        }


        updateQuantity(
            medicine.id,
            current - 1
        );

    };


    // =========================================================
    // FILTER MEDICINES
    // =========================================================

    const filteredMedicines = useMemo(() => {

        const value =
            search.trim().toLowerCase();


        if (!value) {

            return medicines;

        }


        return medicines.filter(
            medicine =>

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

                medicine.manufacturer
                    ?.toLowerCase()
                    .includes(value)

        );

    }, [medicines, search]);


    // =========================================================
    // TOTAL ITEMS
    // =========================================================

    const totalItems = useMemo(() => {

        return selected.reduce(
            (total, medicine) => {

                return (
                    total +
                    (
                        Number(
                            quantities[medicine.id]
                        ) || 0
                    )
                );

            },
            0
        );

    }, [selected, quantities]);


    // =========================================================
    // TOTAL AMOUNT
    // =========================================================

    const totalAmount = useMemo(() => {

        return selected.reduce(
            (total, medicine) => {

                const quantity =
                    Number(
                        quantities[medicine.id]
                    ) || 0;


                const price =
                    Number(
                        medicine.sellingPrice
                    ) || 0;


                return total + (
                    price * quantity
                );

            },
            0
        );

    }, [selected, quantities]);


    // =========================================================
    // SELL MULTIPLE MEDICINES
    // =========================================================

    const sellMedicine = async () => {

        setMessage("");

        setErrorMessage("");


        // -----------------------------------------
        // CHECK SELECTION
        // -----------------------------------------

        if (
            selected.length === 0
        ) {

            setErrorMessage(
                "Please select at least one medicine."
            );

            return;

        }


        try {

            // -----------------------------------------
            // CREATE SALE LIST
            // -----------------------------------------

            const saleList = selected.map(
                medicine => {

                    const quantity =
                        Number(
                            quantities[medicine.id]
                        );


                    if (
                        !quantity ||
                        quantity <= 0
                    ) {

                        throw new Error(
                            `Enter a valid quantity for ${medicine.name}.`
                        );

                    }


                    const availableStock =
                        Number(
                            medicine.quantity
                        ) || 0;


                    if (
                        availableStock <= 0
                    ) {

                        throw new Error(
                            `${medicine.name} is out of stock.`
                        );

                    }


                    if (
                        quantity >
                        availableStock
                    ) {

                        throw new Error(
                            `Not enough stock for ${medicine.name}. Available stock: ${availableStock}`
                        );

                    }


                    return {
                        medicineId: medicine.id,
                        quantity: quantity
                    };

                }
            );


            // -----------------------------------------
            // GET LOGIN DETAILS
            // -----------------------------------------

            const token =
                localStorage.getItem("token");


            const userId =
                localStorage.getItem("userId");


            if (!token) {

                setErrorMessage(
                    "Your session has expired. Please login again."
                );

                return;

            }


            if (!userId) {

                setErrorMessage(
                    "User ID missing. Please login again."
                );

                return;

            }


            // -----------------------------------------
            // START SELLING
            // -----------------------------------------

            setSelling(true);


            console.log(
                "Selling medicines:",
                saleList
            );


            // -----------------------------------------
            // API REQUEST
            // -----------------------------------------

            await axios.post(

                `${API}/api/sales/sell-multiple/${userId}`,

                {
                    medicines: saleList
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json"
                    }
                }

            );


            // -----------------------------------------
            // SUCCESS
            // -----------------------------------------

            setMessage(
                "Medicines sold successfully."
            );


            setSelected([]);

            setQuantities({});


            // -----------------------------------------
            // REFRESH STOCK
            // -----------------------------------------

            await loadMedicines();

        }
        catch (error) {

            console.error(
                "Sale Error:",
                error.response?.data ||
                error.message
            );


            let message =
                "Sale failed. Please try again.";


            if (
                typeof error.response?.data ===
                "string"
            ) {

                message =
                    error.response.data;

            }
            else if (
                error.response?.data?.message
            ) {

                message =
                    error.response.data.message;

            }
            else if (
                error.message
            ) {

                message =
                    error.message;

            }


            setErrorMessage(message);

        }
        finally {

            setSelling(false);

        }

    };


    // =========================================================
    // STOCK STATUS
    // =========================================================

    const getStockStatus = (medicine) => {

        const quantity =
            Number(medicine.quantity) || 0;


        const minStockLevel =
            Number(
                medicine.minStockLevel
            ) || 10;


        if (
            quantity <= 0
        ) {

            return {

                label: "Out of Stock",

                className:
                    "bg-red-50 text-red-700 border-red-200"

            };

        }


        if (
            quantity <= minStockLevel
        ) {

            return {

                label: "Low Stock",

                className:
                    "bg-orange-50 text-orange-700 border-orange-200"

            };

        }


        return {

            label: "Available",

            className:
                "bg-green-50 text-green-700 border-green-200"

        };

    };


    // =========================================================
    // CLEAR SEARCH
    // =========================================================

    const clearSearch = () => {

        setSearch("");

    };


    // =========================================================
    // CLEAR SALE
    // =========================================================

    const clearSale = () => {

        setSelected([]);

        setQuantities({});

        setMessage("");

        setErrorMessage("");

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="min-h-full bg-slate-100 pb-10">


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="w-full px-2 sm:px-4 lg:px-6">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div
                    className="
                        flex
                        flex-col
                        gap-5
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                        mb-7
                    "
                >

                    <div>

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                mb-2
                            "
                        >

                            <button
                                onClick={() =>
                                    navigate(
                                        "/pharmacist/dashboard"
                                    )
                                }
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-white
                                    border
                                    border-slate-200
                                    text-slate-600
                                    hover:text-blue-600
                                    hover:border-blue-200
                                    shadow-sm
                                    transition
                                "
                            >

                                <FaArrowLeft />

                            </button>


                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-blue-600
                                "
                            >
                                Pharmacist
                            </span>

                        </div>


                        <h1
                            className="
                                text-3xl
                                font-bold
                                text-slate-800
                            "
                        >
                            Sell Medicines
                        </h1>


                        <p
                            className="
                                mt-1
                                text-slate-500
                            "
                        >
                            Select medicines, enter quantities,
                            and complete the sale.
                        </p>

                    </div>


                    {/* =================================================
                        SUMMARY BADGES
                    ================================================= */}

                    <div
                        className="
                            flex
                            flex-wrap
                            gap-3
                        "
                    >

                        {/* MEDICINES */}

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                bg-white
                                border
                                border-slate-200
                                rounded-2xl
                                px-5
                                py-3
                                shadow-sm
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
                                "
                            >

                                <FaPills />

                            </div>


                            <div>

                                <p
                                    className="
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    Medicines
                                </p>


                                <p
                                    className="
                                        font-bold
                                        text-slate-800
                                    "
                                >
                                    {medicines.length}
                                </p>

                            </div>

                        </div>


                        {/* SELECTED */}

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                bg-white
                                border
                                border-slate-200
                                rounded-2xl
                                px-5
                                py-3
                                shadow-sm
                            "
                        >

                            <div
                                className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-green-50
                                    text-green-600
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <FaShoppingCart />

                            </div>


                            <div>

                                <p
                                    className="
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    Selected
                                </p>


                                <p
                                    className="
                                        font-bold
                                        text-slate-800
                                    "
                                >
                                    {selected.length}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {message && (

                    <div
                        className="
                            mb-6
                            flex
                            items-center
                            gap-3
                            rounded-2xl
                            border
                            border-green-200
                            bg-green-50
                            px-5
                            py-4
                            text-green-700
                        "
                    >

                        <FaCheckCircle />


                        <span className="font-semibold">
                            {message}
                        </span>


                        <button
                            onClick={() =>
                                setMessage("")
                            }
                            className="
                                ml-auto
                                text-green-500
                                hover:text-green-800
                            "
                        >

                            <FaTimes />

                        </button>

                    </div>

                )}


                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {errorMessage && (

                    <div
                        className="
                            mb-6
                            flex
                            items-center
                            gap-3
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            px-5
                            py-4
                            text-red-700
                        "
                    >

                        <FaExclamationTriangle />


                        <span className="font-semibold">
                            {errorMessage}
                        </span>


                        <button
                            onClick={() =>
                                setErrorMessage("")
                            }
                            className="
                                ml-auto
                                text-red-500
                                hover:text-red-800
                            "
                        >

                            <FaTimes />

                        </button>

                    </div>

                )}


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div
                    className="
                        bg-white
                        rounded-3xl
                        border
                        border-slate-200
                        shadow-sm
                        p-5
                        mb-7
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            md:flex-row
                            md:items-center
                            md:justify-between
                        "
                    >

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
                                    batch, category or manufacturer...
                                "
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    py-3.5
                                    pl-12
                                    pr-12
                                    text-slate-700
                                    outline-none
                                    transition
                                    focus:border-blue-500
                                    focus:ring-4
                                    focus:ring-blue-100
                                "
                            />


                            {search && (

                                <button
                                    onClick={clearSearch}
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


                        <div
                            className="
                                text-sm
                                text-slate-500
                            "
                        >

                            Showing

                            <span
                                className="
                                    mx-1
                                    font-bold
                                    text-slate-800
                                "
                            >
                                {filteredMedicines.length}
                            </span>

                            medicines

                        </div>

                    </div>

                </div>


                {/* =================================================
                    CONTENT GRID
                ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        xl:grid-cols-3
                        gap-7
                        items-start
                    "
                >


                    {/* =================================================
                        MEDICINES
                    ================================================= */}

                    <section
                        className="
                            xl:col-span-2
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                mb-4
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-xl
                                        font-bold
                                        text-slate-800
                                    "
                                >
                                    Available Medicines
                                </h2>


                                <p
                                    className="
                                        text-sm
                                        text-slate-500
                                        mt-1
                                    "
                                >
                                    Click a medicine to add it
                                    to the sale.
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            LOADING
                        ================================================= */}

                        {loading ? (

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-2
                                    gap-5
                                "
                            >

                                {[1, 2, 3, 4].map(item => (

                                    <div
                                        key={item}
                                        className="
                                            bg-white
                                            rounded-3xl
                                            border
                                            border-slate-200
                                            p-6
                                            animate-pulse
                                        "
                                    >

                                        <div
                                            className="
                                                h-12
                                                w-12
                                                rounded-2xl
                                                bg-slate-200
                                                mb-5
                                            "
                                        />


                                        <div
                                            className="
                                                h-5
                                                w-3/4
                                                bg-slate-200
                                                rounded
                                                mb-3
                                            "
                                        />


                                        <div
                                            className="
                                                h-4
                                                w-1/2
                                                bg-slate-200
                                                rounded
                                                mb-6
                                            "
                                        />


                                        <div
                                            className="
                                                h-10
                                                w-full
                                                bg-slate-200
                                                rounded-xl
                                            "
                                        />

                                    </div>

                                ))}

                            </div>

                        ) : filteredMedicines.length === 0 ? (

                            /* =================================================
                                EMPTY
                            ================================================= */

                            <div
                                className="
                                    bg-white
                                    rounded-3xl
                                    border
                                    border-slate-200
                                    p-12
                                    text-center
                                "
                            >

                                <div
                                    className="
                                        mx-auto
                                        w-16
                                        h-16
                                        rounded-2xl
                                        bg-slate-100
                                        flex
                                        items-center
                                        justify-center
                                        text-slate-400
                                        text-2xl
                                        mb-4
                                    "
                                >

                                    <FaSearch />

                                </div>


                                <h3
                                    className="
                                        text-lg
                                        font-bold
                                        text-slate-700
                                    "
                                >
                                    No medicines found
                                </h3>


                                <p
                                    className="
                                        text-sm
                                        text-slate-500
                                        mt-1
                                    "
                                >
                                    Try another medicine name,
                                    batch number or category.
                                </p>

                            </div>

                        ) : (

                            /* =================================================
                                MEDICINE CARDS
                            ================================================= */

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-2
                                    gap-5
                                "
                            >

                                {filteredMedicines.map(
                                    medicine => {

                                        const isSelected =
                                            selected.some(
                                                item =>
                                                    item.id ===
                                                    medicine.id
                                            );


                                        const status =
                                            getStockStatus(
                                                medicine
                                            );


                                        const isOutOfStock =
                                            Number(
                                                medicine.quantity
                                            ) <= 0;


                                        return (

                                            <div
                                                key={medicine.id}
                                                onClick={() => {

                                                    if (
                                                        !isOutOfStock &&
                                                        !selling
                                                    ) {

                                                        selectMedicine(
                                                            medicine
                                                        );

                                                    }

                                                }}
                                                className={`
                                                    relative
                                                    bg-white
                                                    rounded-3xl
                                                    border
                                                    p-6
                                                    transition-all
                                                    duration-200

                                                    ${
                                                        isSelected
                                                            ? "border-blue-500 ring-4 ring-blue-100 shadow-lg"
                                                            : "border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-lg"
                                                    }

                                                    ${
                                                        isOutOfStock
                                                            ? "opacity-60 cursor-not-allowed"
                                                            : "cursor-pointer"
                                                    }
                                                `}
                                            >

                                                {/* SELECTED */}

                                                {isSelected && (

                                                    <div
                                                        className="
                                                            absolute
                                                            top-4
                                                            right-4
                                                            w-8
                                                            h-8
                                                            rounded-full
                                                            bg-blue-600
                                                            text-white
                                                            flex
                                                            items-center
                                                            justify-center
                                                        "
                                                    >

                                                        <FaCheck
                                                            size={13}
                                                        />

                                                    </div>

                                                )}


                                                {/* ICON */}

                                                <div
                                                    className="
                                                        w-12
                                                        h-12
                                                        rounded-2xl
                                                        bg-blue-50
                                                        text-blue-600
                                                        flex
                                                        items-center
                                                        justify-center
                                                        mb-5
                                                    "
                                                >

                                                    <FaPills
                                                        size={20}
                                                    />

                                                </div>


                                                {/* NAME */}

                                                <h3
                                                    className="
                                                        text-lg
                                                        font-bold
                                                        text-slate-800
                                                        pr-8
                                                    "
                                                >
                                                    {medicine.name}
                                                </h3>


                                                {/* BATCH */}

                                                <p
                                                    className="
                                                        text-sm
                                                        text-slate-500
                                                        mt-1
                                                    "
                                                >

                                                    Batch:

                                                    <span
                                                        className="
                                                            ml-1
                                                            font-medium
                                                            text-slate-700
                                                        "
                                                    >
                                                        {
                                                            medicine.batchNumber
                                                        }
                                                    </span>

                                                </p>


                                                {/* CATEGORY */}

                                                {medicine.category && (

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-slate-400
                                                            mt-1
                                                        "
                                                    >
                                                        Category:
                                                        {" "}
                                                        {
                                                            medicine.category
                                                        }
                                                    </p>

                                                )}


                                                {/* PRICE + STATUS */}

                                                <div
                                                    className="
                                                        mt-5
                                                        flex
                                                        items-center
                                                        justify-between
                                                    "
                                                >

                                                    <div>

                                                        <p
                                                            className="
                                                                text-xs
                                                                text-slate-400
                                                            "
                                                        >
                                                            Selling Price
                                                        </p>


                                                        <p
                                                            className="
                                                                text-xl
                                                                font-bold
                                                                text-slate-800
                                                            "
                                                        >

                                                            ₹
                                                            {Number(
                                                                medicine.sellingPrice
                                                            ).toFixed(2)}

                                                        </p>

                                                    </div>


                                                    <span
                                                        className={`
                                                            px-3
                                                            py-1.5
                                                            rounded-full
                                                            border
                                                            text-xs
                                                            font-bold
                                                            ${status.className}
                                                        `}
                                                    >
                                                        {status.label}
                                                    </span>

                                                </div>


                                                {/* STOCK */}

                                                <div
                                                    className="
                                                        mt-5
                                                        flex
                                                        items-center
                                                        justify-between
                                                        border-t
                                                        border-slate-100
                                                        pt-4
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

                                                        <FaBoxOpen />

                                                        Available Stock

                                                    </div>


                                                    <span
                                                        className="
                                                            font-bold
                                                            text-slate-800
                                                        "
                                                    >
                                                        {
                                                            medicine.quantity
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </section>


                    {/* =================================================
                        SALE SUMMARY
                    ================================================= */}

                    <aside
                        className="
                            xl:sticky
                            xl:top-6
                        "
                    >

                        <div
                            className="
                                bg-white
                                rounded-3xl
                                border
                                border-slate-200
                                shadow-lg
                                overflow-hidden
                            "
                        >

                            {/* HEADER */}

                            <div
                                className="
                                    bg-gradient-to-r
                                    from-blue-700
                                    to-cyan-500
                                    p-6
                                    text-white
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <div>

                                        <p
                                            className="
                                                text-blue-100
                                                text-sm
                                            "
                                        >
                                            Current Sale
                                        </p>


                                        <h2
                                            className="
                                                text-2xl
                                                font-bold
                                                mt-1
                                            "
                                        >
                                            Order Summary
                                        </h2>

                                    </div>


                                    <div
                                        className="
                                            w-12
                                            h-12
                                            rounded-2xl
                                            bg-white/20
                                            flex
                                            items-center
                                            justify-center
                                        "
                                    >

                                        <FaShoppingCart
                                            size={20}
                                        />

                                    </div>

                                </div>

                            </div>


                            <div className="p-5">


                                {/* =================================================
                                    EMPTY SALE
                                ================================================= */}

                                {selected.length === 0 ? (

                                    <div
                                        className="
                                            py-10
                                            text-center
                                        "
                                    >

                                        <div
                                            className="
                                                mx-auto
                                                w-16
                                                h-16
                                                rounded-2xl
                                                bg-slate-100
                                                text-slate-400
                                                flex
                                                items-center
                                                justify-center
                                                text-2xl
                                                mb-4
                                            "
                                        >

                                            <FaShoppingCart />

                                        </div>


                                        <h3
                                            className="
                                                font-bold
                                                text-slate-700
                                            "
                                        >
                                            No medicines selected
                                        </h3>


                                        <p
                                            className="
                                                text-sm
                                                text-slate-500
                                                mt-1
                                            "
                                        >
                                            Select medicines from
                                            the list to start a sale.
                                        </p>

                                    </div>

                                ) : (

                                    /* =================================================
                                        SELECTED MEDICINES
                                    ================================================= */

                                    <div
                                        className="
                                            space-y-4
                                            max-h-[420px]
                                            overflow-y-auto
                                            pr-1
                                        "
                                    >

                                        {selected.map(
                                            medicine => {

                                                const quantity =
                                                    Number(
                                                        quantities[
                                                            medicine.id
                                                        ]
                                                    ) || 1;


                                                const lineTotal =
                                                    quantity *
                                                    (
                                                        Number(
                                                            medicine.sellingPrice
                                                        ) || 0
                                                    );


                                                return (

                                                    <div
                                                        key={
                                                            medicine.id
                                                        }
                                                        className="
                                                            rounded-2xl
                                                            border
                                                            border-slate-200
                                                            bg-slate-50
                                                            p-4
                                                        "
                                                    >

                                                        {/* NAME */}

                                                        <div
                                                            className="
                                                                flex
                                                                items-start
                                                                justify-between
                                                                gap-3
                                                            "
                                                        >

                                                            <div>

                                                                <h4
                                                                    className="
                                                                        font-bold
                                                                        text-slate-800
                                                                    "
                                                                >
                                                                    {
                                                                        medicine.name
                                                                    }
                                                                </h4>


                                                                <p
                                                                    className="
                                                                        text-xs
                                                                        text-slate-500
                                                                        mt-1
                                                                    "
                                                                >

                                                                    ₹
                                                                    {Number(
                                                                        medicine.sellingPrice
                                                                    ).toFixed(2)}

                                                                    {" "}
                                                                    per unit

                                                                </p>

                                                            </div>


                                                            <button
                                                                onClick={() =>
                                                                    removeMedicine(
                                                                        medicine.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    selling
                                                                }
                                                                className="
                                                                    text-slate-400
                                                                    hover:text-red-500
                                                                    transition
                                                                    disabled:opacity-50
                                                                "
                                                            >

                                                                <FaTrash
                                                                    size={13}
                                                                />

                                                            </button>

                                                        </div>


                                                        {/* QUANTITY */}

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                justify-between
                                                                mt-4
                                                            "
                                                        >

                                                            <div
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    border
                                                                    border-slate-200
                                                                    bg-white
                                                                    rounded-xl
                                                                    overflow-hidden
                                                                "
                                                            >

                                                                {/* MINUS */}

                                                                <button
                                                                    onClick={() =>
                                                                        decreaseQuantity(
                                                                            medicine
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        selling ||
                                                                        quantity <= 1
                                                                    }
                                                                    className="
                                                                        w-9
                                                                        h-9
                                                                        flex
                                                                        items-center
                                                                        justify-center
                                                                        text-slate-500
                                                                        hover:bg-slate-100
                                                                        disabled:opacity-40
                                                                    "
                                                                >

                                                                    <FaMinus
                                                                        size={10}
                                                                    />

                                                                </button>


                                                                {/* INPUT */}

                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max={
                                                                        medicine.quantity
                                                                    }
                                                                    value={
                                                                        quantity
                                                                    }
                                                                    disabled={
                                                                        selling
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateQuantity(
                                                                            medicine.id,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="
                                                                        w-12
                                                                        h-9
                                                                        text-center
                                                                        border-x
                                                                        border-slate-200
                                                                        outline-none
                                                                        font-bold
                                                                        text-slate-700
                                                                    "
                                                                />


                                                                {/* PLUS */}

                                                                <button
                                                                    onClick={() =>
                                                                        increaseQuantity(
                                                                            medicine
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        selling ||
                                                                        quantity >=
                                                                            Number(
                                                                                medicine.quantity
                                                                            )
                                                                    }
                                                                    className="
                                                                        w-9
                                                                        h-9
                                                                        flex
                                                                        items-center
                                                                        justify-center
                                                                        text-slate-500
                                                                        hover:bg-slate-100
                                                                        disabled:opacity-40
                                                                    "
                                                                >

                                                                    <FaPlus
                                                                        size={10}
                                                                    />

                                                                </button>

                                                            </div>


                                                            {/* LINE TOTAL */}

                                                            <span
                                                                className="
                                                                    font-bold
                                                                    text-slate-800
                                                                "
                                                            >
                                                                ₹
                                                                {lineTotal.toFixed(
                                                                    2
                                                                )}
                                                            </span>

                                                        </div>


                                                        {/* MAX STOCK */}

                                                        <p
                                                            className="
                                                                text-xs
                                                                text-slate-400
                                                                mt-2
                                                            "
                                                        >
                                                            Max available:
                                                            {" "}
                                                            {
                                                                medicine.quantity
                                                            }
                                                        </p>

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>

                                )}


                                {/* =================================================
                                    TOTAL
                                ================================================= */}

                                {selected.length > 0 && (

                                    <div
                                        className="
                                            mt-5
                                            border-t
                                            border-slate-200
                                            pt-5
                                        "
                                    >

                                        {/* SELECTED */}

                                        <div
                                            className="
                                                flex
                                                justify-between
                                                text-sm
                                                text-slate-500
                                                mb-2
                                            "
                                        >

                                            <span>
                                                Selected medicines
                                            </span>


                                            <span
                                                className="
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >
                                                {
                                                    selected.length
                                                }
                                            </span>

                                        </div>


                                        {/* QUANTITY */}

                                        <div
                                            className="
                                                flex
                                                justify-between
                                                text-sm
                                                text-slate-500
                                                mb-4
                                            "
                                        >

                                            <span>
                                                Total quantity
                                            </span>


                                            <span
                                                className="
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >
                                                {totalItems}
                                            </span>

                                        </div>


                                        {/* TOTAL AMOUNT */}

                                        <div
                                            className="
                                                rounded-2xl
                                                bg-slate-900
                                                text-white
                                                p-5
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                "
                                            >

                                                <div>

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-slate-400
                                                        "
                                                    >
                                                        Total Amount
                                                    </p>


                                                    <p
                                                        className="
                                                            text-2xl
                                                            font-bold
                                                            mt-1
                                                        "
                                                    >
                                                        ₹
                                                        {totalAmount.toFixed(
                                                            2
                                                        )}
                                                    </p>

                                                </div>


                                                <FaShoppingCart
                                                    className="
                                                        text-slate-400
                                                    "
                                                />

                                            </div>

                                        </div>


                                        {/* =================================================
                                            SELL BUTTON
                                        ================================================= */}

                                        <button
                                            onClick={
                                                sellMedicine
                                            }
                                            disabled={
                                                selling
                                            }
                                            className="
                                                w-full
                                                mt-4
                                                flex
                                                items-center
                                                justify-center
                                                gap-3
                                                rounded-2xl
                                                bg-blue-600
                                                hover:bg-blue-700
                                                disabled:bg-blue-300
                                                text-white
                                                py-4
                                                font-bold
                                                shadow-lg
                                                shadow-blue-200
                                                transition
                                            "
                                        >

                                            {selling ? (

                                                <>

                                                    <span
                                                        className="
                                                            w-5
                                                            h-5
                                                            border-2
                                                            border-white
                                                            border-t-transparent
                                                            rounded-full
                                                            animate-spin
                                                        "
                                                    />

                                                    Processing Sale...

                                                </>

                                            ) : (

                                                <>

                                                    <FaShoppingCart />

                                                    Complete Sale

                                                </>

                                            )}

                                        </button>


                                        {/* =================================================
                                            CLEAR
                                        ================================================= */}

                                        <button
                                            onClick={
                                                clearSale
                                            }
                                            disabled={
                                                selling
                                            }
                                            className="
                                                w-full
                                                mt-3
                                                py-3
                                                rounded-2xl
                                                text-sm
                                                font-semibold
                                                text-slate-500
                                                hover:bg-slate-100
                                                transition
                                                disabled:opacity-50
                                            "
                                        >

                                            Clear Selection

                                        </button>

                                    </div>

                                )}

                            </div>

                        </div>

                    </aside>

                </div>

            </main>

        </div>

    );

}


export default SellMedicine;