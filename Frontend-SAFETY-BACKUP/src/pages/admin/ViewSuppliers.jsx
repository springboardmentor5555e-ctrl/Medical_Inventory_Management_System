import { useEffect, useState } from "react";
import axios from "axios";

import {
    FaTruck,
    FaSearch,
    FaTrash,
    FaEdit,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaTimes,
    FaCheckCircle,
    FaSyncAlt,
    FaUsers,
    FaBuilding
} from "react-icons/fa";


function ViewSuppliers() {

    const API = "http://localhost:8080/api/suppliers";

    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [showEdit, setShowEdit] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [selectedSupplier, setSelectedSupplier] = useState({
        id: "",
        name: "",
        contact: "",
        email: "",
        address: ""
    });

    // =========================================================
    // FETCH SUPPLIERS
    // =========================================================

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                alert("Session expired. Please login again.");
                return;
            }

            const res = await axios.get(API, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuppliers(
                Array.isArray(res.data)
                    ? res.data
                    : []
            );

        } catch (error) {

            console.error("Fetch suppliers error:", error);

            if (error.response?.status === 401) {
                alert("Unauthorized. Please login again.");
            } else if (error.response?.status === 403) {
                alert("Access denied. Admin privileges required.");
            } else {
                alert(
                    error.response?.data?.message ||
                    "Failed to load suppliers."
                );
            }

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // DELETE SUPPLIER
    // =========================================================

    const deleteSupplier = async (id) => {

        if (!window.confirm(
            "Are you sure you want to delete this supplier?"
        )) {
            return;
        }

        try {

            setDeletingId(id);

            const token = localStorage.getItem("token");

            if (!token) {
                alert("Session expired. Please login again.");
                return;
            }

            await axios.delete(
                `${API}/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuppliers(previous =>
                previous.filter(
                    supplier => supplier.id !== id
                )
            );

            alert("Supplier deleted successfully.");

        } catch (error) {

            console.error("Delete supplier error:", error);

            if (error.response?.status === 409) {

                alert(
                    error.response?.data?.message ||
                    "This supplier cannot be deleted because it is being used by other records."
                );

            } else {

                alert(
                    error.response?.data?.message ||
                    error.response?.data ||
                    "Delete failed."
                );

            }

        } finally {

            setDeletingId(null);

        }

    };


    // =========================================================
    // EDIT SUPPLIER
    // =========================================================

    const editSupplier = (supplier) => {

        setSelectedSupplier({
            id: supplier.id ?? "",
            name: supplier.name ?? "",
            contact: supplier.contact ?? "",
            email: supplier.email ?? "",
            address: supplier.address ?? ""
        });

        setShowEdit(true);

    };


    // =========================================================
    // UPDATE SUPPLIER
    // =========================================================

    const updateSupplier = async () => {

        const name = selectedSupplier.name.trim();
        const contact = selectedSupplier.contact.trim();
        const email = selectedSupplier.email.trim();
        const address = selectedSupplier.address.trim();

        if (!name) {
            alert("Supplier name is required.");
            return;
        }

        if (
            contact &&
            !/^[0-9]{10}$/.test(contact)
        ) {
            alert("Enter a valid 10 digit contact number.");
            return;
        }

        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            alert("Enter a valid email address.");
            return;
        }

        try {

            setUpdating(true);

            const token = localStorage.getItem("token");

            if (!token) {
                alert("Session expired. Please login again.");
                return;
            }

            const updatedData = {
                name,
                contact,
                email,
                address
            };

            await axios.put(
                `${API}/${selectedSupplier.id}`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setSuppliers(previous =>
                previous.map(supplier =>
                    supplier.id === selectedSupplier.id
                        ? {
                            ...supplier,
                            ...updatedData
                        }
                        : supplier
                )
            );

            setShowEdit(false);

            alert("Supplier updated successfully.");

        } catch (error) {

            console.error("Update supplier error:", error);

            alert(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to update supplier."
            );

        } finally {

            setUpdating(false);

        }

    };


    // =========================================================
    // FILTER
    // =========================================================

    const filteredSuppliers = suppliers.filter(
        supplier => {

            const value =
                search.trim().toLowerCase();

            if (!value) {
                return true;
            }

            return (

                supplier.name
                    ?.toString()
                    .toLowerCase()
                    .includes(value)

                ||

                supplier.contact
                    ?.toString()
                    .toLowerCase()
                    .includes(value)

                ||

                supplier.email
                    ?.toString()
                    .toLowerCase()
                    .includes(value)

                ||

                supplier.address
                    ?.toString()
                    .toLowerCase()
                    .includes(value)

            );

        }
    );


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const closeModal = () => {

        if (updating) {
            return;
        }

        setShowEdit(false);

    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="
            min-h-full
            w-full
            bg-white
            px-4
            py-6
            md:px-6
            lg:px-8
        ">

            <div className="
                max-w-[1600px]
                mx-auto
            ">


                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-5
                    mb-7
                ">

                    <div>

                        <div className="
                            flex
                            items-center
                            gap-3
                            mb-2
                        ">

                            <div className="
                                w-10
                                h-10
                                rounded-xl
                                bg-slate-100
                                border
                                border-slate-200
                                flex
                                items-center
                                justify-center
                                text-slate-700
                            ">

                                <FaTruck />

                            </div>

                            <span className="
                                text-xs
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                text-slate-500
                            ">
                                Administration
                            </span>

                        </div>


                        <h1 className="
                            text-2xl
                            md:text-3xl
                            font-bold
                            text-slate-900
                        ">
                            Supplier Management
                        </h1>


                        <p className="
                            text-sm
                            text-slate-500
                            mt-1
                        ">
                            View, search and manage pharmaceutical suppliers
                        </p>

                    </div>


                    {/* STATUS */}

                    <div className="
                        flex
                        items-center
                        gap-2
                        px-4
                        py-2.5
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                        text-sm
                        font-semibold
                        text-slate-700
                        w-fit
                    ">

                        <FaCheckCircle
                            className="text-emerald-500"
                        />

                        System Active

                    </div>

                </div>


                {/* =====================================================
                    SUMMARY CARD
                ===================================================== */}

                <div className="
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    shadow-sm
                    p-5
                    md:p-6
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
                                bg-slate-100
                                border
                                border-slate-200
                                flex
                                items-center
                                justify-center
                                text-slate-700
                            ">

                                <FaBuilding size={22} />

                            </div>


                            <div>

                                <h2 className="
                                    text-lg
                                    font-bold
                                    text-slate-800
                                ">
                                    Pharmaceutical Suppliers
                                </h2>

                                <p className="
                                    text-sm
                                    text-slate-500
                                    mt-1
                                ">
                                    Registered supplier and vendor information
                                </p>

                            </div>

                        </div>


                        {/* TOTAL */}

                        <div className="
                            flex
                            items-center
                            gap-4
                            px-5
                            py-3
                            rounded-2xl
                            bg-slate-50
                            border
                            border-slate-200
                        ">

                            <div className="
                                w-10
                                h-10
                                rounded-xl
                                bg-white
                                border
                                border-slate-200
                                flex
                                items-center
                                justify-center
                                text-slate-600
                            ">

                                <FaUsers />

                            </div>


                            <div>

                                <p className="
                                    text-xs
                                    text-slate-500
                                    font-medium
                                ">
                                    Total Suppliers
                                </p>

                                <p className="
                                    text-xl
                                    font-bold
                                    text-slate-900
                                ">
                                    {suppliers.length}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    SEARCH
                ===================================================== */}

                <div className="
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    shadow-sm
                    p-4
                    md:p-5
                    mb-6
                ">

                    <div className="
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-4
                    ">


                        {/* SEARCH INPUT */}

                        <div className="
                            flex
                            items-center
                            gap-3
                            w-full
                            md:max-w-2xl
                            bg-slate-50
                            border
                            border-slate-200
                            rounded-xl
                            px-4
                            focus-within:bg-white
                            focus-within:border-slate-400
                            focus-within:ring-4
                            focus-within:ring-slate-100
                        ">

                            <FaSearch
                                className="text-slate-400"
                            />

                            <input
                                type="text"
                                placeholder="
                                    Search supplier, contact, email or address...
                                "
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                className="
                                    w-full
                                    py-3
                                    bg-transparent
                                    outline-none
                                    text-sm
                                    text-slate-700
                                    placeholder:text-slate-400
                                "
                            />


                            {search && (

                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="
                                        w-8
                                        h-8
                                        rounded-lg
                                        flex
                                        items-center
                                        justify-center
                                        text-slate-400
                                        hover:bg-slate-200
                                        hover:text-slate-700
                                    "
                                >

                                    <FaTimes />

                                </button>

                            )}

                        </div>


                        {/* RESULTS + REFRESH */}

                        <div className="
                            flex
                            items-center
                            gap-3
                        ">

                            <div className="
                                px-4
                                py-2.5
                                rounded-xl
                                bg-slate-100
                                border
                                border-slate-200
                                text-slate-700
                                text-sm
                                font-semibold
                            ">

                                {filteredSuppliers.length} Result
                                {filteredSuppliers.length !== 1
                                    ? "s"
                                    : ""}

                            </div>


                            <button
                                type="button"
                                onClick={fetchSuppliers}
                                disabled={loading}
                                className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-white
                                    border
                                    border-slate-200
                                    text-slate-600
                                    hover:bg-slate-100
                                    hover:text-slate-900
                                    flex
                                    items-center
                                    justify-center
                                    transition
                                    disabled:opacity-50
                                "
                                title="Refresh"
                            >

                                <FaSyncAlt
                                    className={
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                            </button>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    TABLE
                ===================================================== */}

                <div className="
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    shadow-sm
                    overflow-hidden
                ">


                    {/* TABLE TITLE */}

                    <div className="
                        px-5
                        md:px-6
                        py-5
                        border-b
                        border-slate-200
                        flex
                        items-center
                        gap-3
                    ">

                        <div className="
                            w-10
                            h-10
                            rounded-xl
                            bg-slate-100
                            border
                            border-slate-200
                            flex
                            items-center
                            justify-center
                            text-slate-700
                        ">

                            <FaTruck />

                        </div>


                        <div>

                            <h3 className="
                                text-lg
                                font-bold
                                text-slate-800
                            ">
                                Supplier Records
                            </h3>

                            <p className="
                                text-xs
                                text-slate-500
                            ">
                                Registered pharmaceutical vendors
                            </p>

                        </div>

                    </div>


                    {/* LOADING */}

                    {loading ? (

                        <div className="
                            py-20
                            flex
                            flex-col
                            items-center
                            justify-center
                        ">

                            <div className="
                                w-10
                                h-10
                                rounded-full
                                border-4
                                border-slate-200
                                border-t-slate-700
                                animate-spin
                            " />

                            <p className="
                                mt-4
                                text-sm
                                font-semibold
                                text-slate-500
                            ">
                                Loading suppliers...
                            </p>

                        </div>

                    ) : filteredSuppliers.length === 0 ? (

                        /* EMPTY */

                        <div className="
                            py-20
                            px-6
                            text-center
                        ">

                            <div className="
                                mx-auto
                                w-16
                                h-16
                                rounded-2xl
                                bg-slate-100
                                border
                                border-slate-200
                                text-slate-400
                                flex
                                items-center
                                justify-center
                            ">

                                {search
                                    ? <FaSearch size={22} />
                                    : <FaTruck size={22} />
                                }

                            </div>


                            <h3 className="
                                mt-5
                                text-lg
                                font-bold
                                text-slate-800
                            ">
                                {search
                                    ? "No suppliers found"
                                    : "No suppliers available"
                                }
                            </h3>


                            <p className="
                                mt-2
                                text-sm
                                text-slate-500
                            ">
                                {search
                                    ? "Try another supplier name, contact, email or address."
                                    : "There are currently no suppliers registered."
                                }
                            </p>

                        </div>

                    ) : (

                        /* TABLE */

                        <div className="overflow-x-auto">

                            <table className="
                                w-full
                                min-w-[1100px]
                            ">

                                <thead className="
                                    bg-slate-50
                                    border-b
                                    border-slate-200
                                ">

                                    <tr>

                                        <th className="
                                            px-6
                                            py-4
                                            text-left
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        ">
                                            ID
                                        </th>

                                        <th className="
                                            px-6
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
                                            px-6
                                            py-4
                                            text-left
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        ">
                                            Contact
                                        </th>

                                        <th className="
                                            px-6
                                            py-4
                                            text-left
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        ">
                                            Email
                                        </th>

                                        <th className="
                                            px-6
                                            py-4
                                            text-left
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        ">
                                            Address
                                        </th>

                                        <th className="
                                            px-6
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


                                <tbody>

                                    {filteredSuppliers.map(
                                        supplier => (

                                            <tr
                                                key={supplier.id}
                                                className="
                                                    border-b
                                                    border-slate-100
                                                    hover:bg-slate-50
                                                    transition
                                                "
                                            >

                                                {/* ID */}

                                                <td className="px-6 py-5">

                                                    <span className="
                                                        inline-flex
                                                        min-w-9
                                                        h-9
                                                        px-2
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        bg-slate-100
                                                        border
                                                        border-slate-200
                                                        text-slate-600
                                                        text-xs
                                                        font-bold
                                                    ">
                                                        {supplier.id}
                                                    </span>

                                                </td>


                                                {/* SUPPLIER */}

                                                <td className="px-6 py-5">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                    ">

                                                        <div className="
                                                            w-11
                                                            h-11
                                                            rounded-xl
                                                            bg-slate-100
                                                            border
                                                            border-slate-200
                                                            flex
                                                            items-center
                                                            justify-center
                                                            text-slate-600
                                                        ">

                                                            <FaTruck />

                                                        </div>


                                                        <div>

                                                            <p className="
                                                                font-bold
                                                                text-slate-800
                                                            ">
                                                                {supplier.name ||
                                                                    "Unnamed Supplier"}
                                                            </p>

                                                            <p className="
                                                                text-xs
                                                                text-slate-400
                                                                mt-1
                                                            ">
                                                                Pharmaceutical Vendor
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* CONTACT */}

                                                <td className="px-6 py-5">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                        text-sm
                                                        text-slate-600
                                                    ">

                                                        <span className="
                                                            w-9
                                                            h-9
                                                            rounded-lg
                                                            bg-slate-100
                                                            border
                                                            border-slate-200
                                                            flex
                                                            items-center
                                                            justify-center
                                                            text-slate-600
                                                        ">

                                                            <FaPhone size={13} />

                                                        </span>

                                                        {supplier.contact ||
                                                            "Not provided"}

                                                    </div>

                                                </td>


                                                {/* EMAIL */}

                                                <td className="px-6 py-5">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                        text-sm
                                                        text-slate-600
                                                    ">

                                                        <span className="
                                                            w-9
                                                            h-9
                                                            rounded-lg
                                                            bg-slate-100
                                                            border
                                                            border-slate-200
                                                            flex
                                                            items-center
                                                            justify-center
                                                            text-slate-600
                                                        ">

                                                            <FaEnvelope size={13} />

                                                        </span>

                                                        <span className="break-all">
                                                            {supplier.email ||
                                                                "Not provided"}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* ADDRESS */}

                                                <td className="
                                                    px-6
                                                    py-5
                                                    max-w-[300px]
                                                ">

                                                    <div className="
                                                        flex
                                                        items-start
                                                        gap-3
                                                        text-sm
                                                        text-slate-600
                                                    ">

                                                        <span className="
                                                            w-9
                                                            h-9
                                                            rounded-lg
                                                            bg-slate-100
                                                            border
                                                            border-slate-200
                                                            flex
                                                            items-center
                                                            justify-center
                                                            text-slate-600
                                                            flex-shrink-0
                                                        ">

                                                            <FaMapMarkerAlt size={13} />

                                                        </span>

                                                        <span className="leading-5">
                                                            {supplier.address ||
                                                                "Not provided"}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* ACTIONS */}

                                                <td className="px-6 py-5">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                    ">


                                                        {/* EDIT */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editSupplier(
                                                                    supplier
                                                                )
                                                            }
                                                            className="
                                                                w-10
                                                                h-10
                                                                rounded-xl
                                                                bg-white
                                                                border
                                                                border-slate-200
                                                                text-slate-600
                                                                hover:bg-slate-100
                                                                hover:text-slate-900
                                                                transition
                                                                flex
                                                                items-center
                                                                justify-center
                                                            "
                                                            title="Edit supplier"
                                                        >

                                                            <FaEdit size={14} />

                                                        </button>


                                                        {/* DELETE */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteSupplier(
                                                                    supplier.id
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                supplier.id
                                                            }
                                                            className="
                                                                w-10
                                                                h-10
                                                                rounded-xl
                                                                bg-white
                                                                border
                                                                border-slate-200
                                                                text-slate-500
                                                                hover:bg-slate-100
                                                                hover:text-slate-900
                                                                transition
                                                                flex
                                                                items-center
                                                                justify-center
                                                                disabled:opacity-50
                                                            "
                                                            title="Delete supplier"
                                                        >

                                                            {deletingId ===
                                                            supplier.id ? (

                                                                <span className="
                                                                    w-4
                                                                    h-4
                                                                    rounded-full
                                                                    border-2
                                                                    border-slate-200
                                                                    border-t-slate-700
                                                                    animate-spin
                                                                " />

                                                            ) : (

                                                                <FaTrash size={14} />

                                                            )}

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>


            {/* =========================================================
                EDIT MODAL
            ========================================================= */}

            {showEdit && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        p-4
                        bg-slate-900/40
                        backdrop-blur-sm
                    "
                    onMouseDown={(e) => {

                        if (
                            e.target === e.currentTarget &&
                            !updating
                        ) {
                            setShowEdit(false);
                        }

                    }}
                >

                    <div className="
                        w-full
                        max-w-2xl
                        max-h-[92vh]
                        overflow-y-auto
                        bg-white
                        rounded-3xl
                        shadow-2xl
                        border
                        border-slate-200
                    ">


                        {/* MODAL HEADER */}

                        <div className="
                            px-6
                            md:px-8
                            py-6
                            border-b
                            border-slate-200
                            bg-slate-50
                        ">

                            <div className="
                                flex
                                items-center
                                justify-between
                                gap-4
                            ">

                                <div className="
                                    flex
                                    items-center
                                    gap-4
                                ">

                                    <div className="
                                        w-12
                                        h-12
                                        rounded-xl
                                        bg-white
                                        border
                                        border-slate-200
                                        text-slate-700
                                        flex
                                        items-center
                                        justify-center
                                    ">

                                        <FaEdit size={18} />

                                    </div>


                                    <div>

                                        <h2 className="
                                            text-xl
                                            md:text-2xl
                                            font-bold
                                            text-slate-900
                                        ">
                                            Edit Supplier
                                        </h2>

                                        <p className="
                                            text-sm
                                            text-slate-500
                                            mt-1
                                        ">
                                            Update supplier information
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={updating}
                                    className="
                                        w-10
                                        h-10
                                        rounded-xl
                                        bg-white
                                        border
                                        border-slate-200
                                        text-slate-500
                                        hover:bg-slate-100
                                        hover:text-slate-900
                                        flex
                                        items-center
                                        justify-center
                                        transition
                                    "
                                >

                                    <FaTimes />

                                </button>

                            </div>

                        </div>


                        {/* MODAL BODY */}

                        <div className="
                            p-6
                            md:p-8
                            space-y-6
                        ">


                            {/* NAME */}

                            <FormInput
                                label="Supplier Name"
                                icon={<FaTruck />}
                                value={selectedSupplier.name}
                                placeholder="Enter supplier name"
                                onChange={(e) =>
                                    setSelectedSupplier({
                                        ...selectedSupplier,
                                        name: e.target.value
                                    })
                                }
                            />


                            {/* CONTACT */}

                            <FormInput
                                label="Contact Number"
                                icon={<FaPhone />}
                                value={selectedSupplier.contact}
                                placeholder="9876543210"
                                maxLength={10}
                                onChange={(e) =>
                                    setSelectedSupplier({
                                        ...selectedSupplier,
                                        contact:
                                            e.target.value.replace(
                                                /\D/g,
                                                ""
                                            )
                                    })
                                }
                            />


                            {/* EMAIL */}

                            <FormInput
                                label="Email Address"
                                icon={<FaEnvelope />}
                                type="email"
                                value={selectedSupplier.email}
                                placeholder="supplier@gmail.com"
                                onChange={(e) =>
                                    setSelectedSupplier({
                                        ...selectedSupplier,
                                        email: e.target.value
                                    })
                                }
                            />


                            {/* ADDRESS */}

                            <div>

                                <label className="
                                    block
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    mb-2
                                ">
                                    Address
                                </label>


                                <div className="
                                    flex
                                    items-start
                                    gap-3
                                    bg-slate-50
                                    border
                                    border-slate-200
                                    rounded-2xl
                                    p-4
                                    focus-within:bg-white
                                    focus-within:border-slate-400
                                    focus-within:ring-4
                                    focus-within:ring-slate-100
                                ">

                                    <div className="
                                        w-9
                                        h-9
                                        rounded-lg
                                        bg-white
                                        border
                                        border-slate-200
                                        text-slate-600
                                        flex
                                        items-center
                                        justify-center
                                        flex-shrink-0
                                    ">

                                        <FaMapMarkerAlt size={14} />

                                    </div>


                                    <textarea
                                        rows="4"
                                        value={selectedSupplier.address}
                                        onChange={(e) =>
                                            setSelectedSupplier({
                                                ...selectedSupplier,
                                                address:
                                                    e.target.value
                                            })
                                        }
                                        placeholder="Enter complete supplier address"
                                        className="
                                            w-full
                                            bg-transparent
                                            outline-none
                                            resize-none
                                            text-sm
                                            text-slate-700
                                            placeholder:text-slate-400
                                        "
                                    />

                                </div>

                            </div>


                            {/* BUTTONS */}

                            <div className="
                                flex
                                flex-col-reverse
                                sm:flex-row
                                justify-end
                                gap-3
                                pt-4
                                border-t
                                border-slate-100
                            ">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={updating}
                                    className="
                                        px-6
                                        py-3
                                        rounded-xl
                                        bg-white
                                        border
                                        border-slate-200
                                        text-slate-700
                                        font-semibold
                                        hover:bg-slate-100
                                        transition
                                        disabled:opacity-50
                                    "
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    onClick={updateSupplier}
                                    disabled={updating}
                                    className="
                                        px-7
                                        py-3
                                        rounded-xl
                                        bg-slate-900
                                        hover:bg-slate-800
                                        text-white
                                        font-bold
                                        shadow-lg
                                        transition
                                        flex
                                        items-center
                                        justify-center
                                        gap-3
                                        disabled:opacity-50
                                    "
                                >

                                    {updating ? (

                                        <>
                                            <span className="
                                                w-4
                                                h-4
                                                rounded-full
                                                border-2
                                                border-white/40
                                                border-t-white
                                                animate-spin
                                            " />

                                            Updating...

                                        </>

                                    ) : (

                                        <>
                                            <FaCheckCircle size={14} />
                                            Update Supplier
                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


// =========================================================
// FORM INPUT
// =========================================================

function FormInput({
    label,
    icon,
    type = "text",
    value,
    placeholder,
    maxLength,
    onChange
}) {

    return (

        <div>

            <label className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
            ">
                {label}
            </label>


            <div className="
                flex
                items-center
                gap-3
                bg-slate-50
                border
                border-slate-200
                rounded-2xl
                px-4
                focus-within:bg-white
                focus-within:border-slate-400
                focus-within:ring-4
                focus-within:ring-slate-100
            ">

                <div className="
                    w-9
                    h-9
                    rounded-lg
                    bg-white
                    border
                    border-slate-200
                    text-slate-600
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                ">

                    {icon}

                </div>


                <input
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    onChange={onChange}
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


export default ViewSuppliers;
