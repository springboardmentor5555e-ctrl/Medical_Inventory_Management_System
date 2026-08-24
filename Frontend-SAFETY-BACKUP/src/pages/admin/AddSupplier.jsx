import { useState } from "react";
import axios from "axios";

import {
    FaTruck,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaPlus,
    FaBuilding,
    FaCheckCircle,
    FaShieldAlt
} from "react-icons/fa";


function AddSupplier() {

    const initialState = {
        name: "",
        contact: "",
        email: "",
        address: ""
    };

    const [supplier, setSupplier] = useState(initialState);
    const [loading, setLoading] = useState(false);


    // =========================================================
    // HANDLE INPUT CHANGE
    // =========================================================

    const handleChange = (e) => {

        setSupplier({
            ...supplier,
            [e.target.name]: e.target.value
        });

    };


    // =========================================================
    // SUBMIT FORM
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // Supplier name validation
        if (!supplier.name.trim()) {

            alert("Supplier name is required");
            return;

        }


        // Contact validation
        if (
            supplier.contact &&
            !/^[0-9]{10}$/.test(supplier.contact)
        ) {

            alert("Enter valid 10 digit contact number");
            return;

        }


        // Email validation
        if (
            supplier.email &&
            !/\S+@\S+\.\S+/.test(supplier.email)
        ) {

            alert("Enter valid email address");
            return;

        }


        try {

            setLoading(true);


            const token = localStorage.getItem("token");


            if (!token) {

                alert("Session expired. Please login again");
                return;

            }


            await axios.post(
                "http://localhost:8080/api/suppliers",
                supplier,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );


            alert("Supplier Added Successfully");


            setSupplier(initialState);


        } catch (error) {

            console.error("Supplier Error:", error);


            if (error.response) {

                if (error.response.status === 403) {

                    alert("Access Denied. Login as ADMIN.");

                }

                else if (error.response.status === 401) {

                    alert("Unauthorized. Please login again.");

                }

                else {

                    alert(
                        error.response.data?.message ||
                        "Unable to add supplier"
                    );

                }

            }

            else {

                alert("Server is not reachable");

            }

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <div
            className="
                w-full
                min-h-full
                bg-white
                p-4
                md:p-6
                lg:p-8
            "
        >

            <div
                className="
                    w-full
                    max-w-[1500px]
                    mx-auto
                "
            >


                {/* =================================================
                    TOP BAR
                ================================================= */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        mb-7
                    "
                >

                    <div>

                        <p
                            className="
                                text-xs
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                text-blue-600
                                mb-1
                            "
                        >
                            Admin / Suppliers
                        </p>


                        <h1
                            className="
                                text-2xl
                                md:text-3xl
                                font-bold
                                text-slate-800
                            "
                        >
                            Add Supplier
                        </h1>


                        <p
                            className="
                                text-sm
                                text-slate-500
                                mt-1
                            "
                        >
                            Register a new pharmaceutical supplier
                        </p>

                    </div>


                    {/* SYSTEM STATUS */}

                    <div
                        className="
                            hidden
                            sm:flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-xl
                            bg-white
                            border
                            border-emerald-200
                            shadow-sm
                            text-sm
                            font-semibold
                            text-emerald-600
                        "
                    >

                        <FaCheckCircle />

                        System Active

                    </div>

                </div>



                {/* =================================================
                    WHITE HEADER CARD
                ================================================= */}

                <div
                    className="
                        bg-white
                        rounded-3xl
                        border
                        border-slate-200
                        shadow-sm
                        mb-6
                        overflow-hidden
                    "
                >

                    <div
                        className="
                            p-6
                            md:p-8
                            lg:p-10
                            flex
                            flex-col
                            md:flex-row
                            md:items-center
                            md:justify-between
                            gap-6
                        "
                    >


                        {/* LEFT */}

                        <div
                            className="
                                flex
                                items-center
                                gap-5
                            "
                        >

                            <div
                                className="
                                    w-16
                                    h-16
                                    md:w-20
                                    md:h-20
                                    rounded-2xl
                                    bg-blue-50
                                    border
                                    border-blue-100
                                    flex
                                    items-center
                                    justify-center
                                    text-blue-600
                                    flex-shrink-0
                                "
                            >

                                <FaTruck size={32} />

                            </div>


                            <div>

                                <h2
                                    className="
                                        text-2xl
                                        md:text-3xl
                                        font-bold
                                        text-slate-800
                                    "
                                >
                                    Supplier Management
                                </h2>


                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        md:text-base
                                        text-slate-500
                                        max-w-xl
                                    "
                                >
                                    Create a supplier profile to manage
                                    pharmaceutical vendors and inventory
                                    purchases.
                                </p>

                            </div>

                        </div>



                        {/* ACCESS LEVEL */}

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                bg-slate-50
                                border
                                border-slate-200
                                rounded-2xl
                                px-5
                                py-4
                            "
                        >

                            <div
                                className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-white
                                    border
                                    border-slate-200
                                    flex
                                    items-center
                                    justify-center
                                    text-blue-600
                                "
                            >

                                <FaShieldAlt />

                            </div>


                            <div>

                                <p
                                    className="
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    Access Level
                                </p>


                                <p
                                    className="
                                        text-sm
                                        font-bold
                                        text-slate-700
                                    "
                                >
                                    Administrator
                                </p>

                            </div>

                        </div>

                    </div>

                </div>



                {/* =================================================
                    CONTENT
                ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-[300px_minmax(0,1fr)]
                        gap-6
                        items-start
                    "
                >


                    {/* =================================================
                        LEFT INFORMATION PANEL
                    ================================================= */}

                    <div
                        className="
                            bg-white
                            rounded-3xl
                            border
                            border-slate-200
                            shadow-sm
                            p-6
                        "
                    >

                        <div
                            className="
                                w-12
                                h-12
                                rounded-xl
                                bg-blue-50
                                border
                                border-blue-100
                                text-blue-600
                                flex
                                items-center
                                justify-center
                                mb-5
                            "
                        >

                            <FaBuilding size={21} />

                        </div>


                        <h3
                            className="
                                text-lg
                                font-bold
                                text-slate-800
                            "
                        >
                            Supplier Profile
                        </h3>


                        <p
                            className="
                                mt-2
                                text-sm
                                leading-6
                                text-slate-500
                            "
                        >
                            Add the supplier's contact and location details.
                            These details can be used when managing medicine
                            inventory and supplier records.
                        </p>



                        {/* INFO ROWS */}

                        <div
                            className="
                                mt-6
                                space-y-3
                            "
                        >

                            <InfoRow
                                icon={<FaTruck />}
                                title="Supplier"
                                text="Company identification"
                            />


                            <InfoRow
                                icon={<FaPhone />}
                                title="Contact"
                                text="10 digit phone number"
                            />


                            <InfoRow
                                icon={<FaEnvelope />}
                                title="Email"
                                text="Business communication"
                            />


                            <InfoRow
                                icon={<FaMapMarkerAlt />}
                                title="Address"
                                text="Supplier location"
                            />

                        </div>



                        {/* INFORMATION MESSAGE */}

                        <div
                            className="
                                mt-6
                                rounded-2xl
                                bg-white
                                border
                                border-blue-100
                                p-4
                                shadow-sm
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-start
                                    gap-3
                                "
                            >

                                <FaCheckCircle
                                    className="
                                        text-blue-600
                                        mt-0.5
                                        flex-shrink-0
                                    "
                                />


                                <p
                                    className="
                                        text-xs
                                        leading-5
                                        text-slate-500
                                    "
                                >
                                    Supplier name is required. Other fields
                                    can be completed according to your
                                    available supplier information.
                                </p>

                            </div>

                        </div>

                    </div>



                    {/* =================================================
                        FORM CARD
                    ================================================= */}

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


                        {/* FORM HEADER */}

                        <div
                            className="
                                px-6
                                md:px-8
                                py-6
                                border-b
                                border-slate-200
                                bg-white
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                "
                            >

                                <div>

                                    <h3
                                        className="
                                            text-xl
                                            md:text-2xl
                                            font-bold
                                            text-slate-800
                                        "
                                    >
                                        Supplier Details
                                    </h3>


                                    <p
                                        className="
                                            text-sm
                                            text-slate-500
                                            mt-1
                                        "
                                    >
                                        Enter supplier information below.
                                    </p>

                                </div>


                                <div
                                    className="
                                        hidden
                                        sm:flex
                                        w-11
                                        h-11
                                        rounded-xl
                                        bg-blue-50
                                        border
                                        border-blue-100
                                        items-center
                                        justify-center
                                        text-blue-600
                                    "
                                >

                                    <FaBuilding />

                                </div>

                            </div>

                        </div>



                        {/* FORM BODY */}

                        <form
                            onSubmit={handleSubmit}
                            className="
                                p-6
                                md:p-8
                            "
                        >


                            {/* =================================================
                                BASIC INFORMATION
                            ================================================= */}

                            <div
                                className="mb-8"
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        mb-5
                                    "
                                >

                                    <div
                                        className="
                                            w-8
                                            h-8
                                            rounded-lg
                                            bg-blue-50
                                            border
                                            border-blue-100
                                            text-blue-600
                                            flex
                                            items-center
                                            justify-center
                                        "
                                    >

                                        <FaBuilding size={13} />

                                    </div>


                                    <div>

                                        <h4
                                            className="
                                                text-sm
                                                font-bold
                                                text-slate-800
                                            "
                                        >
                                            Basic Information
                                        </h4>


                                        <p
                                            className="
                                                text-xs
                                                text-slate-400
                                                mt-0.5
                                            "
                                        >
                                            Supplier identity and contact
                                        </p>

                                    </div>

                                </div>



                                {/* INPUT GRID */}

                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        md:grid-cols-2
                                        gap-5
                                    "
                                >

                                    <InputBox
                                        icon={<FaTruck />}
                                        color="text-blue-600"
                                        label="Supplier Name"
                                        name="name"
                                        value={supplier.name}
                                        change={handleChange}
                                        placeholder="ABC Pharmaceuticals"
                                    />


                                    <InputBox
                                        icon={<FaPhone />}
                                        color="text-emerald-600"
                                        label="Contact Number"
                                        name="contact"
                                        value={supplier.contact}
                                        change={handleChange}
                                        placeholder="9876543210"
                                        maxLength={10}
                                    />


                                    <InputBox
                                        icon={<FaEnvelope />}
                                        color="text-rose-500"
                                        label="Email Address"
                                        name="email"
                                        value={supplier.email}
                                        change={handleChange}
                                        placeholder="supplier@gmail.com"
                                    />

                                </div>

                            </div>



                            {/* =================================================
                                ADDRESS
                            ================================================= */}

                            <div
                                className="mb-8"
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        mb-5
                                    "
                                >

                                    <div
                                        className="
                                            w-8
                                            h-8
                                            rounded-lg
                                            bg-purple-50
                                            border
                                            border-purple-100
                                            text-purple-600
                                            flex
                                            items-center
                                            justify-center
                                        "
                                    >

                                        <FaMapMarkerAlt size={13} />

                                    </div>


                                    <div>

                                        <h4
                                            className="
                                                text-sm
                                                font-bold
                                                text-slate-800
                                            "
                                        >
                                            Location Information
                                        </h4>


                                        <p
                                            className="
                                                text-xs
                                                text-slate-400
                                                mt-0.5
                                            "
                                        >
                                            Where the supplier is located
                                        </p>

                                    </div>

                                </div>



                                <label
                                    className="
                                        block
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        mb-2
                                    "
                                >
                                    Address
                                </label>


                                <div
                                    className="
                                        flex
                                        items-start
                                        gap-3
                                        bg-white
                                        border
                                        border-slate-200
                                        rounded-2xl
                                        p-4
                                        transition
                                        focus-within:border-blue-400
                                        focus-within:ring-4
                                        focus-within:ring-blue-50
                                    "
                                >

                                    <div
                                        className="
                                            w-9
                                            h-9
                                            rounded-lg
                                            bg-slate-50
                                            border
                                            border-slate-200
                                            text-purple-600
                                            flex
                                            items-center
                                            justify-center
                                            flex-shrink-0
                                        "
                                    >

                                        <FaMapMarkerAlt size={14} />

                                    </div>


                                    <textarea
                                        name="address"
                                        value={supplier.address}
                                        onChange={handleChange}
                                        rows="5"
                                        placeholder="Enter complete supplier address"
                                        className="
                                            w-full
                                            bg-transparent
                                            outline-none
                                            resize-none
                                            text-sm
                                            text-slate-700
                                            placeholder:text-slate-400
                                            leading-6
                                        "
                                    />

                                </div>

                            </div>



                            {/* =================================================
                                DIVIDER
                            ================================================= */}

                            <div
                                className="
                                    border-t
                                    border-slate-100
                                    mb-6
                                "
                            />



                            {/* =================================================
                                ACTIONS
                            ================================================= */}

                            <div
                                className="
                                    flex
                                    flex-col-reverse
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                    gap-4
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    Please verify supplier information before
                                    submitting.
                                </p>


                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        w-full
                                        sm:w-auto
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-3
                                        px-7
                                        py-3.5
                                        rounded-xl
                                        bg-blue-600
                                        hover:bg-blue-700
                                        text-white
                                        font-bold
                                        shadow-md
                                        shadow-blue-100
                                        transition
                                        duration-200
                                        hover:-translate-y-0.5
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                        disabled:hover:translate-y-0
                                    "
                                >

                                    {loading ? (

                                        <>

                                            <span
                                                className="
                                                    w-4
                                                    h-4
                                                    rounded-full
                                                    border-2
                                                    border-white/40
                                                    border-t-white
                                                    animate-spin
                                                "
                                            />

                                            Adding Supplier...

                                        </>

                                    ) : (

                                        <>

                                            <FaPlus size={13} />

                                            Add Supplier

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            </div>

        </div>

    );

}



// =========================================================
// INPUT COMPONENT
// =========================================================

function InputBox({
    icon,
    color,
    label,
    name,
    value,
    change,
    placeholder,
    maxLength
}) {

    return (

        <div
            className="w-full"
        >

            <label
                className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                    mb-2
                "
            >
                {label}
            </label>


            <div
                className="
                    flex
                    items-center
                    gap-3
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    px-4
                    transition
                    focus-within:border-blue-400
                    focus-within:ring-4
                    focus-within:ring-blue-50
                "
            >

                <div
                    className={`
                        w-9
                        h-9
                        rounded-lg
                        bg-slate-50
                        border
                        border-slate-100
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                        ${color}
                    `}
                >

                    {icon}

                </div>


                <input
                    type={name === "email" ? "email" : "text"}
                    name={name}
                    value={value}
                    onChange={change}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className="
                        w-full
                        py-4
                        bg-transparent
                        outline-none
                        text-sm
                        text-slate-700
                        placeholder:text-slate-400
                    "
                />

            </div>

        </div>

    );

}



// =========================================================
// INFO ROW
// =========================================================

function InfoRow({
    icon,
    title,
    text
}) {

    return (

        <div
            className="
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                bg-white
                border
                border-slate-200
            "
        >

            <div
                className="
                    w-9
                    h-9
                    rounded-lg
                    bg-slate-50
                    border
                    border-slate-100
                    flex
                    items-center
                    justify-center
                    text-blue-600
                    flex-shrink-0
                "
            >

                {icon}

            </div>


            <div>

                <p
                    className="
                        text-xs
                        font-bold
                        text-slate-700
                    "
                >
                    {title}
                </p>


                <p
                    className="
                        text-[11px]
                        text-slate-400
                        mt-0.5
                    "
                >
                    {text}
                </p>

            </div>

        </div>

    );

}


export default AddSupplier;