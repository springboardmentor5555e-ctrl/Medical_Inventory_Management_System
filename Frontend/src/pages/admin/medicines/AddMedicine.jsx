import { useState } from "react";
import axios from "axios";

import {
    FaPills,
    FaCalendarAlt,
    FaSave,
    FaBoxOpen,
    FaTag,
    FaIndustry,
    FaTruck,
    FaHashtag,
    FaRupeeSign,
    FaExclamationTriangle,
    FaCheckCircle
} from "react-icons/fa";


function AddMedicine() {

    const initialState = {

        name: "",
        batchNumber: "",
        category: "",
        supplier: "",
        manufacturer: "",
        quantity: "",
        price: "",
        sellingPrice: "",
        minStockLevel: 10,
        manufactureDate: "",
        expiryDate: ""

    };


    const [medicine, setMedicine] =
        useState(initialState);

    const [loading, setLoading] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");


    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (e) => {

        setMedicine({

            ...medicine,

            [e.target.name]: e.target.value

        });

        setErrorMessage("");
        setSuccessMessage("");

    };


    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");


        // DATE VALIDATION

        if (
            medicine.manufactureDate &&
            medicine.expiryDate &&
            medicine.manufactureDate >
            medicine.expiryDate
        ) {

            setErrorMessage(
                "Manufacture date cannot be after expiry date."
            );

            return;

        }


        // QUANTITY VALIDATION

        if (
            medicine.quantity === "" ||
            Number(medicine.quantity) < 0
        ) {

            setErrorMessage(
                "Please enter a valid quantity."
            );

            return;

        }


        // PRICE VALIDATION

        if (
            medicine.price === "" ||
            Number(medicine.price) < 0
        ) {

            setErrorMessage(
                "Please enter a valid purchase price."
            );

            return;

        }


        // SELLING PRICE VALIDATION

        if (
            medicine.sellingPrice !== "" &&
            Number(medicine.sellingPrice) < 0
        ) {

            setErrorMessage(
                "Selling price cannot be negative."
            );

            return;

        }


        try {

            setLoading(true);


            const token =
                localStorage.getItem("token");


            const payload = {

                ...medicine,

                quantity:
                    Number(medicine.quantity),

                price:
                    Number(medicine.price),

                sellingPrice:
                    Number(
                        medicine.sellingPrice || 0
                    ),

                minStockLevel:
                    Number(
                        medicine.minStockLevel
                    )

            };


            await axios.post(

                "http://localhost:8080/api/medicines",

                payload,

                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );


            setSuccessMessage(
                "Medicine has been added successfully."
            );


            setMedicine(initialState);

        }


        catch (error) {

            console.error(
                "Add medicine error:",
                error
            );


            if (error.response) {

                const data =
                    error.response.data;


                if (typeof data === "string") {

                    setErrorMessage(data);

                }

                else if (data?.message) {

                    setErrorMessage(
                        data.message
                    );

                }

                else if (data?.error) {

                    setErrorMessage(
                        data.error
                    );

                }

                else {

                    setErrorMessage(
                        "Unable to add medicine. Please check the entered details."
                    );

                }

            }

            else {

                setErrorMessage(
                    "Server is not reachable. Please make sure Spring Boot is running."
                );

            }

        }


        finally {

            setLoading(false);

        }

    };


    // =========================================================
    // INPUT COMPONENT
    // =========================================================

    const InputField = ({
        name,
        label,
        icon,
        type = "text",
        required = false,
        min,
        step,
        placeholder
    }) => (

        <div>

            <label
                className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                    mb-2
                "
            >

                <span className="
                    inline-flex
                    items-center
                    gap-2
                ">

                    <span className="text-blue-600">
                        {icon}
                    </span>

                    {label}

                    {required && (
                        <span className="text-red-500">
                            *
                        </span>
                    )}

                </span>

            </label>


            <input

                name={name}

                type={type}

                value={medicine[name]}

                onChange={handleChange}

                required={required}

                min={min}

                step={step}

                placeholder={placeholder}

                className="
                    w-full
                    h-12
                    px-4
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    text-slate-800
                    placeholder:text-slate-400
                    outline-none
                    transition
                    focus:bg-white
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-100
                    hover:border-slate-300
                "

            />

        </div>

    );


    return (

        <div className="
            min-h-screen
            bg-gradient-to-br
            from-slate-50
            via-blue-50
            to-white
            p-4
            md:p-8
        ">

            <div className="
                max-w-6xl
                mx-auto
            ">


                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="
                    bg-white
                    rounded-3xl
                    border
                    border-slate-200
                    shadow-sm
                    p-6
                    md:p-8
                    mb-6
                ">

                    <div className="
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-5
                    ">

                        <div className="
                            flex
                            items-center
                            gap-4
                        ">

                            <div className="
                                w-14
                                h-14
                                rounded-2xl
                                bg-blue-600
                                text-white
                                flex
                                items-center
                                justify-center
                                shadow-lg
                                shadow-blue-200
                            ">

                                <FaPills size={26} />

                            </div>


                            <div>

                                <p className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-blue-600
                                    mb-1
                                ">

                                    Inventory Management

                                </p>


                                <h1 className="
                                    text-2xl
                                    md:text-3xl
                                    font-extrabold
                                    text-slate-800
                                ">

                                    Add Medicine

                                </h1>


                                <p className="
                                    text-sm
                                    text-slate-500
                                    mt-1
                                ">

                                    Add a new medicine and its
                                    inventory details.

                                </p>

                            </div>

                        </div>


                        <div className="
                            hidden
                            md:flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-xl
                            bg-emerald-50
                            border
                            border-emerald-100
                            text-emerald-700
                            text-sm
                            font-semibold
                        ">

                            <FaCheckCircle />

                            Inventory Ready

                        </div>

                    </div>

                </div>



                {/* =====================================================
                    ALERTS
                ===================================================== */}

                {successMessage && (

                    <div className="
                        mb-6
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-emerald-200
                        bg-emerald-50
                        px-5
                        py-4
                        text-emerald-700
                        font-semibold
                    ">

                        <FaCheckCircle
                            className="text-emerald-600"
                        />

                        {successMessage}

                    </div>

                )}


                {errorMessage && (

                    <div className="
                        mb-6
                        flex
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        px-5
                        py-4
                        text-red-700
                        font-medium
                    ">

                        <FaExclamationTriangle
                            className="
                                mt-0.5
                                flex-shrink-0
                            "
                        />

                        <span>
                            {errorMessage}
                        </span>

                    </div>

                )}



                {/* =====================================================
                    FORM
                ===================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="
                        bg-white
                        rounded-3xl
                        border
                        border-slate-200
                        shadow-sm
                        overflow-hidden
                    "
                >


                    {/* =================================================
                        BASIC INFORMATION
                    ================================================= */}

                    <div className="
                        px-6
                        md:px-8
                        py-6
                        border-b
                        border-slate-100
                    ">

                        <div className="
                            flex
                            items-center
                            gap-3
                            mb-6
                        ">

                            <div className="
                                w-10
                                h-10
                                rounded-xl
                                bg-blue-50
                                text-blue-600
                                flex
                                items-center
                                justify-center
                            ">

                                <FaPills />

                            </div>


                            <div>

                                <h2 className="
                                    text-lg
                                    font-bold
                                    text-slate-800
                                ">

                                    Medicine Information

                                </h2>


                                <p className="
                                    text-xs
                                    text-slate-500
                                ">

                                    Enter the basic details
                                    of the medicine.

                                </p>

                            </div>

                        </div>


                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            lg:grid-cols-3
                            gap-5
                        ">


                            <InputField
                                name="name"
                                label="Medicine Name"
                                icon={<FaPills />}
                                placeholder="e.g. Paracetamol"
                                required
                            />


                            <InputField
                                name="batchNumber"
                                label="Batch Number"
                                icon={<FaHashtag />}
                                placeholder="e.g. BTH-2026-001"
                                required
                            />


                            <InputField
                                name="category"
                                label="Category"
                                icon={<FaTag />}
                                placeholder="e.g. Tablets"
                                required
                            />


                            <InputField
                                name="supplier"
                                label="Supplier Name"
                                icon={<FaTruck />}
                                placeholder="Supplier name"
                            />


                            <InputField
                                name="manufacturer"
                                label="Manufacturer"
                                icon={<FaIndustry />}
                                placeholder="Manufacturer name"
                            />

                        </div>

                    </div>



                    {/* =================================================
                        STOCK INFORMATION
                    ================================================= */}

                    <div className="
                        px-6
                        md:px-8
                        py-6
                        border-b
                        border-slate-100
                        bg-slate-50/40
                    ">

                        <div className="
                            flex
                            items-center
                            gap-3
                            mb-6
                        ">

                            <div className="
                                w-10
                                h-10
                                rounded-xl
                                bg-indigo-50
                                text-indigo-600
                                flex
                                items-center
                                justify-center
                            ">

                                <FaBoxOpen />

                            </div>


                            <div>

                                <h2 className="
                                    text-lg
                                    font-bold
                                    text-slate-800
                                ">

                                    Stock & Pricing

                                </h2>


                                <p className="
                                    text-xs
                                    text-slate-500
                                ">

                                    Configure quantity,
                                    prices and stock limits.

                                </p>

                            </div>

                        </div>


                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            lg:grid-cols-4
                            gap-5
                        ">


                            <InputField
                                name="quantity"
                                label="Initial Quantity"
                                icon={<FaBoxOpen />}
                                type="number"
                                min="0"
                                step="1"
                                placeholder="0"
                                required
                            />


                            <InputField
                                name="price"
                                label="Purchase Price"
                                icon={<FaRupeeSign />}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                required
                            />


                            <InputField
                                name="sellingPrice"
                                label="Selling Price"
                                icon={<FaRupeeSign />}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />


                            <InputField
                                name="minStockLevel"
                                label="Minimum Stock Level"
                                icon={<FaExclamationTriangle />}
                                type="number"
                                min="0"
                                step="1"
                                placeholder="10"
                                required
                            />

                        </div>

                    </div>



                    {/* =================================================
                        DATE INFORMATION
                    ================================================= */}

                    <div className="
                        px-6
                        md:px-8
                        py-6
                    ">

                        <div className="
                            flex
                            items-center
                            gap-3
                            mb-6
                        ">

                            <div className="
                                w-10
                                h-10
                                rounded-xl
                                bg-amber-50
                                text-amber-600
                                flex
                                items-center
                                justify-center
                            ">

                                <FaCalendarAlt />

                            </div>


                            <div>

                                <h2 className="
                                    text-lg
                                    font-bold
                                    text-slate-800
                                ">

                                    Medicine Dates

                                </h2>


                                <p className="
                                    text-xs
                                    text-slate-500
                                ">

                                    Important dates for
                                    expiry monitoring.

                                </p>

                            </div>

                        </div>


                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-5
                        ">


                            {/* MANUFACTURE DATE */}

                            <div>

                                <label className="
                                    block
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    mb-2
                                ">

                                    <span className="
                                        inline-flex
                                        items-center
                                        gap-2
                                    ">

                                        <FaCalendarAlt
                                            className="text-blue-600"
                                        />

                                        Manufacture Date

                                        <span className="
                                            text-red-500
                                        ">

                                            *

                                        </span>

                                    </span>

                                </label>


                                <input

                                    name="manufactureDate"

                                    type="date"

                                    value={
                                        medicine.manufactureDate
                                    }

                                    onChange={handleChange}

                                    required

                                    className="
                                        w-full
                                        h-12
                                        px-4
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        text-slate-800
                                        outline-none
                                        transition
                                        focus:bg-white
                                        focus:border-blue-500
                                        focus:ring-4
                                        focus:ring-blue-100
                                    "

                                />

                            </div>



                            {/* EXPIRY DATE */}

                            <div>

                                <label className="
                                    block
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    mb-2
                                ">

                                    <span className="
                                        inline-flex
                                        items-center
                                        gap-2
                                    ">

                                        <FaExclamationTriangle
                                            className="text-red-500"
                                        />

                                        Expiry Date

                                        <span className="
                                            text-red-500
                                        ">

                                            *

                                        </span>

                                    </span>

                                </label>


                                <input

                                    name="expiryDate"

                                    type="date"

                                    value={
                                        medicine.expiryDate
                                    }

                                    onChange={handleChange}

                                    required

                                    className="
                                        w-full
                                        h-12
                                        px-4
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        text-slate-800
                                        outline-none
                                        transition
                                        focus:bg-white
                                        focus:border-blue-500
                                        focus:ring-4
                                        focus:ring-blue-100
                                    "

                                />

                            </div>

                        </div>

                    </div>



                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="
                        px-6
                        md:px-8
                        py-5
                        bg-slate-50
                        border-t
                        border-slate-100
                        flex
                        flex-col-reverse
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-4
                    ">


                        <p className="
                            text-xs
                            text-slate-500
                        ">

                            <span className="
                                text-red-500
                                font-bold
                            ">

                                *

                            </span>

                            &nbsp; Required fields

                        </p>


                        <button

                            type="submit"

                            disabled={loading}

                            className="
                                w-full
                                sm:w-auto
                                min-w-[190px]
                                h-12
                                px-7
                                rounded-xl
                                bg-blue-600
                                hover:bg-blue-700
                                active:bg-blue-800
                                text-white
                                font-bold
                                flex
                                items-center
                                justify-center
                                gap-3
                                shadow-lg
                                shadow-blue-200
                                transition-all
                                duration-200
                                disabled:opacity-60
                                disabled:cursor-not-allowed
                            "

                        >

                            {loading ? (

                                <>

                                    <span className="
                                        w-5
                                        h-5
                                        border-2
                                        border-white/40
                                        border-t-white
                                        rounded-full
                                        animate-spin
                                    " />

                                    Saving Medicine...

                                </>

                            ) : (

                                <>

                                    <FaSave />

                                    Add Medicine

                                </>

                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}


export default AddMedicine;
