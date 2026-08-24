import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
    FaBoxOpen,
    FaPlus,
    FaMinus,
    FaArrowLeft,
    FaCheckCircle,
    FaExclamationTriangle
} from "react-icons/fa";


function UpdateStock() {

    const navigate = useNavigate();


    // =========================================================
    // STATES
    // =========================================================

    const [medicines, setMedicines] = useState([]);

    const [form, setForm] = useState({
        medicineId: "",
        quantity: "",
        operation: "ADD"
    });

    const [loading, setLoading] = useState(true);

    const [updating, setUpdating] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");



    // =========================================================
    // LOAD MEDICINES
    // =========================================================

    useEffect(() => {

        loadMedicines();

    }, []);



    const loadMedicines = async () => {

        try {

            setLoading(true);

            setError("");

            const token =
                localStorage.getItem("token");


            const response = await axios.get(

                "http://localhost:8080/api/medicines",

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );


            setMedicines(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        }

        catch (err) {

            console.log(
                "Load medicines error:",
                err.response?.data ||
                err.message
            );


            setError(
                "Unable to load medicines."
            );

        }

        finally {

            setLoading(false);

        }

    };



    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setForm({

            ...form,

            [name]: value

        });


        setMessage("");

        setError("");

    };



    // =========================================================
    // UPDATE STOCK
    // =========================================================

    const updateStock = async (e) => {

        e.preventDefault();


        setMessage("");

        setError("");


        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!form.medicineId) {

            setError(
                "Please select a medicine."
            );

            return;

        }


        if (
            !form.quantity ||
            Number(form.quantity) <= 0
        ) {

            setError(
                "Please enter a quantity greater than 0."
            );

            return;

        }


        // -----------------------------------------------------
        // FIND SELECTED MEDICINE
        // -----------------------------------------------------

        const selectedMedicine =
            medicines.find(

                medicine =>
                    String(medicine.id) ===
                    String(form.medicineId)

            );


        if (!selectedMedicine) {

            setError(
                "Selected medicine was not found."
            );

            return;

        }


        // -----------------------------------------------------
        // REMOVE STOCK VALIDATION
        // -----------------------------------------------------

        if (
            form.operation === "REMOVE" &&
            Number(form.quantity) >
                Number(selectedMedicine.quantity || 0)
        ) {

            setError(

                `Cannot remove ${form.quantity}. ` +
                `Available stock is only ${selectedMedicine.quantity}.`

            );

            return;

        }


        try {

            setUpdating(true);


            const token =
                localStorage.getItem("token");


            // -------------------------------------------------
            // API REQUEST
            // -------------------------------------------------

            await axios.put(

                `http://localhost:8080/api/staff/stock/update/${form.medicineId}`,

                {

                    quantity:
                        Number(form.quantity),

                    operation:
                        form.operation

                },

                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            setMessage(
                "Stock updated successfully!"
            );


            // -------------------------------------------------
            // CLEAR FORM
            // -------------------------------------------------

            setForm({

                medicineId: "",
                quantity: "",
                operation: "ADD"

            });


            // -------------------------------------------------
            // RELOAD MEDICINES
            // -------------------------------------------------

            await loadMedicines();


        }

        catch (err) {

            console.log(
                "Stock update error:",
                err.response?.data ||
                err.message
            );


            setError(

                err.response?.data?.message ||
                err.response?.data ||
                "Stock update failed."

            );

        }

        finally {

            setUpdating(false);

        }

    };



    // =========================================================
    // GET SELECTED MEDICINE
    // =========================================================

    const selectedMedicine =
        medicines.find(

            medicine =>
                String(medicine.id) ===
                String(form.medicineId)

        );



    // =========================================================
    // CALCULATE PREVIEW
    // =========================================================

    const currentStock =
        Number(
            selectedMedicine?.quantity || 0
        );


    const updateQuantity =
        Number(form.quantity || 0);


    const newStock =
        form.operation === "ADD"

            ?

            currentStock + updateQuantity

            :

            currentStock - updateQuantity;



    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="
            min-h-screen
            bg-gradient-to-br
            from-blue-50
            via-cyan-50
            to-white
            p-6
        ">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
                max-w-5xl
                mx-auto
                mb-6
            ">


                <button

                    type="button"

                    onClick={() =>
                        navigate("/admin/dashboard")
                    }

                    className="
                        flex
                        items-center
                        gap-2
                        text-blue-600
                        hover:text-blue-800
                        font-semibold
                        mb-5
                    "

                >

                    <FaArrowLeft />

                    Back to Dashboard

                </button>



                <div className="
                    bg-white
                    rounded-2xl
                    shadow-sm
                    border
                    p-6
                ">

                    <div className="
                        flex
                        items-center
                        gap-4
                    ">


                        <div className="
                            bg-blue-600
                            text-white
                            p-4
                            rounded-2xl
                        ">

                            <FaBoxOpen
                                size={28}
                            />

                        </div>


                        <div>

                            <h1 className="
                                text-3xl
                                font-bold
                                text-gray-800
                            ">

                                Update Stock

                            </h1>


                            <p className="
                                text-gray-500
                                mt-1
                            ">

                                Add or remove medicine stock

                            </p>

                        </div>

                    </div>

                </div>

            </div>



            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="
                max-w-5xl
                mx-auto
                grid
                grid-cols-1
                lg:grid-cols-2
                gap-6
            ">


                {/* =================================================
                    UPDATE FORM
                ================================================= */}

                <div className="
                    bg-white
                    rounded-2xl
                    shadow-lg
                    border
                    p-7
                ">


                    <h2 className="
                        text-xl
                        font-bold
                        text-gray-800
                        mb-6
                    ">

                        Stock Adjustment

                    </h2>



                    {/* SUCCESS */}

                    {message && (

                        <div className="
                            bg-green-50
                            border
                            border-green-200
                            text-green-700
                            px-4
                            py-3
                            rounded-xl
                            mb-5
                            flex
                            items-center
                            gap-3
                        ">

                            <FaCheckCircle />

                            {message}

                        </div>

                    )}



                    {/* ERROR */}

                    {error && (

                        <div className="
                            bg-red-50
                            border
                            border-red-200
                            text-red-700
                            px-4
                            py-3
                            rounded-xl
                            mb-5
                            flex
                            items-center
                            gap-3
                        ">

                            <FaExclamationTriangle />

                            {error}

                        </div>

                    )}



                    <form
                        onSubmit={updateStock}
                        className="space-y-5"
                    >


                        {/* MEDICINE */}

                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-gray-700
                                mb-2
                            ">

                                Select Medicine

                            </label>


                            <select

                                name="medicineId"

                                value={
                                    form.medicineId
                                }

                                onChange={
                                    handleChange
                                }

                                disabled={loading || updating}

                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-xl
                                    px-4
                                    py-3
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    bg-white
                                "

                            >

                                <option value="">

                                    Select Medicine

                                </option>


                                {medicines.map(
                                    medicine => (

                                        <option
                                            key={
                                                medicine.id
                                            }
                                            value={
                                                medicine.id
                                            }
                                        >

                                            {medicine.name}
                                            {" "}
                                            -
                                            {" "}
                                            Stock:
                                            {" "}
                                            {medicine.quantity}

                                        </option>

                                    )
                                )}

                            </select>


                            {loading && (

                                <p className="
                                    text-sm
                                    text-gray-500
                                    mt-2
                                ">

                                    Loading medicines...

                                </p>

                            )}

                        </div>



                        {/* QUANTITY */}

                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-gray-700
                                mb-2
                            ">

                                Quantity

                            </label>


                            <input

                                type="number"

                                name="quantity"

                                min="1"

                                value={
                                    form.quantity
                                }

                                onChange={
                                    handleChange
                                }

                                disabled={updating}

                                placeholder="Enter quantity"

                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-xl
                                    px-4
                                    py-3
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "

                            />

                        </div>



                        {/* OPERATION */}

                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-gray-700
                                mb-2
                            ">

                                Operation

                            </label>


                            <select

                                name="operation"

                                value={
                                    form.operation
                                }

                                onChange={
                                    handleChange
                                }

                                disabled={updating}

                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-xl
                                    px-4
                                    py-3
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    bg-white
                                "

                            >

                                <option value="ADD">

                                    ADD STOCK

                                </option>


                                <option value="REMOVE">

                                    REMOVE STOCK

                                </option>

                            </select>

                        </div>



                        {/* BUTTON */}

                        <button

                            type="submit"

                            disabled={
                                updating ||
                                loading
                            }

                            className="

                                w-full

                                bg-blue-600
                                hover:bg-blue-700

                                disabled:bg-gray-400

                                text-white

                                py-3

                                rounded-xl

                                font-semibold

                                flex
                                items-center
                                justify-center
                                gap-3

                                transition

                            "

                        >

                            {updating ? (

                                <>
                                    Updating...
                                </>

                            ) : (

                                <>

                                    {form.operation === "ADD"
                                        ? <FaPlus />
                                        : <FaMinus />
                                    }

                                    Update Stock

                                </>

                            )}

                        </button>


                    </form>

                </div>



                {/* =================================================
                    STOCK PREVIEW
                ================================================= */}

                <div className="
                    bg-white
                    rounded-2xl
                    shadow-lg
                    border
                    p-7
                ">


                    <h2 className="
                        text-xl
                        font-bold
                        text-gray-800
                        mb-6
                    ">

                        Stock Preview

                    </h2>



                    {!selectedMedicine ? (

                        <div className="
                            h-64
                            flex
                            flex-col
                            items-center
                            justify-center
                            text-gray-400
                        ">

                            <FaBoxOpen
                                size={55}
                                className="mb-4"
                            />

                            <p>

                                Select a medicine to
                                view stock details

                            </p>

                        </div>

                    ) : (

                        <div className="space-y-5">


                            {/* MEDICINE NAME */}

                            <div className="
                                bg-blue-50
                                rounded-xl
                                p-5
                            ">

                                <p className="
                                    text-sm
                                    text-gray-500
                                ">

                                    Medicine

                                </p>


                                <h3 className="
                                    text-xl
                                    font-bold
                                    text-blue-700
                                    mt-1
                                ">

                                    {
                                        selectedMedicine.name
                                    }

                                </h3>

                            </div>



                            {/* CURRENT */}

                            <div className="
                                flex
                                items-center
                                justify-between
                                bg-gray-50
                                rounded-xl
                                p-5
                            ">

                                <div>

                                    <p className="
                                        text-sm
                                        text-gray-500
                                    ">

                                        Current Stock

                                    </p>

                                    <p className="
                                        text-2xl
                                        font-bold
                                        text-gray-800
                                    ">

                                        {currentStock}

                                    </p>

                                </div>


                                <FaBoxOpen
                                    className="text-blue-500"
                                    size={30}
                                />

                            </div>



                            {/* CHANGE */}

                            <div className="
                                flex
                                items-center
                                justify-between
                                bg-gray-50
                                rounded-xl
                                p-5
                            ">

                                <div>

                                    <p className="
                                        text-sm
                                        text-gray-500
                                    ">

                                        Stock Change

                                    </p>

                                    <p className={`
                                        text-2xl
                                        font-bold
                                        ${
                                            form.operation ===
                                            "ADD"

                                            ? "text-green-600"

                                            : "text-red-600"
                                        }
                                    `}>

                                        {form.operation === "ADD"
                                            ? "+"
                                            : "-"
                                        }

                                        {updateQuantity}

                                    </p>

                                </div>


                                {form.operation === "ADD"

                                    ?

                                    <FaPlus
                                        className="
                                            text-green-500
                                        "
                                        size={25}
                                    />

                                    :

                                    <FaMinus
                                        className="
                                            text-red-500
                                        "
                                        size={25}
                                    />

                                }

                            </div>



                            {/* NEW STOCK */}

                            <div className="
                                bg-purple-50
                                rounded-xl
                                p-5
                            ">

                                <p className="
                                    text-sm
                                    text-gray-500
                                ">

                                    New Stock

                                </p>


                                <p className={`
                                    text-3xl
                                    font-bold
                                    mt-1
                                    ${
                                        newStock < 0
                                            ? "text-red-600"
                                            : "text-purple-700"
                                    }
                                `}>

                                    {newStock}

                                </p>

                            </div>


                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}


export default UpdateStock;