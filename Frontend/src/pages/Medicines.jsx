import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import BackToDashboard from "../components/BackToDashboard";

import api from "../services/api";
import "../styles/Medicines.css";

function Medicines() {

    const navigate = useNavigate();
    // =====================================================
    // ROLE
    // =====================================================

    const storedRole = localStorage.getItem("role");

    const role = String(storedRole || "")
        .replace("ROLE_", "")
        .toUpperCase();

    const isAdmin = role === "ADMIN";

    // =====================================================
    // STATES
    // =====================================================

    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const [editId, setEditId] = useState(null);

    const [editMedicine, setEditMedicine] = useState({});

    // =====================================================
    // LOAD MEDICINES
    // =====================================================

    useEffect(() => {
        loadMedicines();
    }, []);

    const loadMedicines = async () => {

        try {

            const response =
                await api.get("/medicines");

            console.log(
                "Medicines received:",
                response.data
            );

            setMedicines(response.data);

        } catch (error) {

            console.error(
                "Error loading medicines:",
                error
            );

            if (error.response?.status === 401) {
                alert("Please login again.");
            }

            if (error.response?.status === 403) {
                alert("You are not authorized to view medicines.");
            }
        }
    };

    // =====================================================
    // SEARCH + CATEGORY FILTER
    // =====================================================

    const filteredMedicines =
        medicines.filter((medicine) => {

            const medicineName =
                String(medicine.name || "");

            const medicineCategory =
                String(medicine.category || "");

            const matchSearch =
                medicineName
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );

            const matchCategory =
                category === "All" ||
                medicineCategory === category;

            return (
                matchSearch &&
                matchCategory
            );
        });

    // =====================================================
    // START EDIT
    // =====================================================

    const startEdit = (medicine) => {

        setEditId(medicine.id);

        setEditMedicine({
            ...medicine
        });
    };

    // =====================================================
    // CANCEL EDIT
    // =====================================================

    const cancelEdit = () => {

        setEditId(null);

        setEditMedicine({});
    };

    // =====================================================
    // HANDLE EDIT
    // =====================================================

    const handleEditChange = (e) => {

        const { name, value } = e.target;

        setEditMedicine({
            ...editMedicine,
            [name]: value
        });
    };

    // =====================================================
    // UPDATE MEDICINE
    // =====================================================

    const updateMedicine = async () => {

        try {

            await api.put(
                `/medicines/${editId}`,
                editMedicine
            );

            alert(
                "Medicine updated successfully!"
            );

            setEditId(null);

            setEditMedicine({});

            await loadMedicines();

        } catch (error) {

            console.error(
                "Update medicine error:",
                error
            );

            console.error(
                "Response:",
                error.response?.data
            );

            if (error.response?.status === 403) {

                alert(
                    "You are not authorized to edit medicines."
                );

            } else {

                alert(
                    error.response?.data?.message ||
                    "Failed to update medicine."
                );
            }
        }
    };

    // =====================================================
    // DELETE MEDICINE
    // =====================================================

    const deleteMedicine = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this medicine?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `/medicines/${id}`
            );

            alert(
                "Medicine deleted successfully!"
            );

            await loadMedicines();

        } catch (error) {

            console.error(
                "Delete medicine error:",
                error
            );

            console.error(
                "Response:",
                error.response?.data
            );

            if (error.response?.status === 403) {

                alert(
                    "You are not authorized to delete medicines."
                );

            } else {

                alert(
                    error.response?.data?.message ||
                    "Failed to delete medicine."
                );
            }
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="medicine-page">

            <div className="medicine-card">

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <div className="medicine-header">

                    <div className="page-title">

                        <BackToDashboard />

                        <h2>
                            💊 Medicines
                        </h2>

                    </div>

                </div>

                {/* ================================================= */}
                {/* FILTERS */}
                {/* ================================================= */}

                <div className="filters">

                    <input
                        type="text"
                        placeholder="🔍 Search Medicine..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        className="search-box"
                    />

                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(
                                e.target.value
                            )
                        }
                        className="category-filter"
                    >

                        <option value="All">
                            All Categories
                        </option>

                        <option value="Tablet">
                            Tablet
                        </option>

                        <option value="Capsule">
                            Capsule
                        </option>

                        <option value="Syrup">
                            Syrup
                        </option>

                        <option value="Injection">
                            Injection
                        </option>

                        <option value="Cream">
                            Cream
                        </option>

                        <option value="Drops">
                            Drops
                        </option>

                        <option value="Other">
                            Other
                        </option>

                    </select>

                </div>

                {/* ================================================= */}
                {/* TABLE */}
                {/* ================================================= */}

                <table>

                    <thead>

                        <tr>

                            <th>Name</th>

                            <th>Batch</th>

                            <th>Category</th>

                            <th>Supplier</th>

                            <th>Quantity</th>

                            <th>Price</th>

                            <th>Expiry</th>

                            {isAdmin && (
                                <th>Actions</th>
                            )}

                        </tr>

                    </thead>

                    <tbody>

                        {filteredMedicines.map(
                            (medicine) => (

                                <tr
                                    key={
                                        medicine.id
                                    }
                                >

                                    {/* ================= NAME ================= */}

                                    <td>

                                        {editId ===
                                        medicine.id ? (

                                            <input
                                                type="text"
                                                name="name"
                                                value={
                                                    editMedicine.name ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />

                                        ) : (

                                            medicine.name

                                        )}

                                    </td>

                                    {/* ================= BATCH ================= */}

                                    <td>

                                        {editId ===
                                        medicine.id ? (

                                            <input
                                                type="text"
                                                name="batchNumber"
                                                value={
                                                    editMedicine.batchNumber ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />

                                        ) : (

                                            medicine.batchNumber

                                        )}

                                    </td>

                                    {/* ================= CATEGORY ================= */}

                                    <td>

                                        {editId ===
                                        medicine.id ? (

                                            <select
                                                name="category"
                                                value={
                                                    editMedicine.category ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            >

                                                <option value="">
                                                    Select
                                                </option>

                                                <option value="Tablet">
                                                    Tablet
                                                </option>

                                                <option value="Capsule">
                                                    Capsule
                                                </option>

                                                <option value="Syrup">
                                                    Syrup
                                                </option>

                                                <option value="Injection">
                                                    Injection
                                                </option>

                                                <option value="Cream">
                                                    Cream
                                                </option>

                                                <option value="Drops">
                                                    Drops
                                                </option>

                                                <option value="Other">
                                                    Other
                                                </option>

                                            </select>

                                        ) : (

                                            medicine.category

                                        )}

                                    </td>

                                    {/* ================= SUPPLIER ================= */}

                                    <td>

                                        {editId ===
                                        medicine.id ? (

                                            <input
                                                type="text"
                                                name="supplier"
                                                value={
                                                    editMedicine.supplier ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />

                                        ) : (

                                            medicine.supplier

                                        )}

                                    </td>

                                    {/* ================= QUANTITY ================= */}

                                    <td>

                                        {editId ===
                                        medicine.id ? (

                                            <input
                                                type="number"
                                                name="quantity"
                                                value={
                                                    editMedicine.quantity ??
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />

                                        ) : (

                                            medicine.quantity

                                        )}

                                    </td>

                                    {/* ================= PRICE ================= */}

                                    <td>

                                        {editId ===
                                        medicine.id ? (

                                            <input
                                                type="number"
                                                step="0.01"
                                                name="price"
                                                value={
                                                    editMedicine.price ??
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />

                                        ) : (

                                            `₹${medicine.price}`

                                        )}

                                    </td>

                                    {/* ================= EXPIRY ================= */}

                                    <td>

                                        {editId ===
                                        medicine.id ? (

                                            <input
                                                type="date"
                                                name="expiryDate"
                                                value={
                                                    editMedicine.expiryDate ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />

                                        ) : (

                                            medicine.expiryDate

                                        )}

                                    </td>

                                    {/* ================= ACTIONS ================= */}

                                    {isAdmin && (

                                        <td>

                                            {editId ===
                                            medicine.id ? (

                                                <>

                                                    <button
                                                        className="save-btn"
                                                        onClick={
                                                            updateMedicine
                                                        }
                                                        title="Save"
                                                    >
                                                        <FaSave />
                                                        Save
                                                    </button>

                                                    <button
                                                        className="cancel-btn"
                                                        onClick={
                                                            cancelEdit
                                                        }
                                                        title="Cancel"
                                                    >
                                                        <FaTimes />
                                                        Cancel
                                                    </button>

                                                </>

                                            ) : (

                                                <>

                                                    <button
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            startEdit(
                                                                medicine
                                                            )
                                                        }
                                                        title="Edit Medicine"
                                                    >
                                                        <FaEdit />
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-btn"
                                                        onClick={() =>
                                                            deleteMedicine(
                                                                medicine.id
                                                            )
                                                        }
                                                        title="Delete Medicine"
                                                    >
                                                        <FaTrash />
                                                        Delete
                                                    </button>

                                                </>

                                            )}

                                        </td>

                                    )}

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

                {/* ================================================= */}
                {/* NO RESULTS */}
                {/* ================================================= */}

                {filteredMedicines.length === 0 && (

                    <p className="no-medicines">
                        No medicines found.
                    </p>

                )}

            </div>

        </div>
    );
}

export default Medicines;