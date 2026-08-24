import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/dashboard.css";

function Suppliers() {

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState(null);

    const [editData, setEditData] = useState({
        name: "",
        contact: "",
        email: "",
        address: ""
    });

    useEffect(() => {
        loadSuppliers();
    }, []);

    // ============================
    // LOAD SUPPLIERS
    // ============================

    const loadSuppliers = async () => {

        try {

            const response = await api.get("/suppliers");

            console.log("SUPPLIERS DATA:", response.data);

            setSuppliers(response.data);

        } catch (error) {

            console.error("Error loading suppliers:", error);

        } finally {

            setLoading(false);

        }
    };


    // ============================
    // DELETE SUPPLIER
    // ============================

    const deleteSupplier = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this supplier?"
        );

        if (!confirmDelete) return;

        try {

            await api.delete(`/suppliers/${id}`);

            alert("Supplier deleted successfully!");

            loadSuppliers();

} catch (error) {

    console.error("DELETE ERROR:", error);

    console.error("STATUS:", error.response?.status);

    console.error("DATA:", error.response?.data);

    alert(
        "Delete failed: " +
        (
            error.response?.data?.message ||
            error.response?.data ||
            "Backend error"
        )
    );
}
    };


    // ============================
    // START EDIT
    // ============================

    const startEdit = (supplier) => {

        setEditingId(supplier.id);

        setEditData({
            name: supplier.name || "",
            contact: supplier.contact || "",
            email: supplier.email || "",
            address: supplier.address || ""
        });

    };


    // ============================
    // HANDLE EDIT INPUT
    // ============================

    const handleEditChange = (e) => {

        setEditData({
            ...editData,
            [e.target.name]: e.target.value
        });

    };


    // ============================
    // SAVE EDIT
    // ============================

    const saveEdit = async (id) => {

        try {

            await api.put(`/suppliers/${id}`, editData);

            alert("Supplier updated successfully! ✅");

            setEditingId(null);

            loadSuppliers();

        } catch (error) {

            console.error("Error updating supplier:", error);

            alert("Failed to update supplier.");

        }
    };


    // ============================
    // CANCEL EDIT
    // ============================

    const cancelEdit = () => {

        setEditingId(null);

    };


    return (

        <div className="dashboard">

            <div className="main">

                {/* Supplier List Header */}

                <div className="welcome">

                    <h2>Supplier List</h2>

                    <p>
                        Manage your medicine suppliers
                    </p>

                </div>


                {/* Supplier Data */}

                {loading ? (

                    <h3>Loading suppliers...</h3>

                ) : suppliers.length === 0 ? (

                    <h3>No suppliers found.</h3>

                ) : (

                    <div className="suppliers-table-container">

                        <table className="suppliers-table">

                            <thead>

                                <tr>

                                    <th>ID</th>

                                    <th>Supplier Name</th>

                                    <th>Contact</th>

                                    <th>Email</th>

                                    <th>Address</th>

                                    <th>Actions</th>

                                </tr>

                            </thead>


                            <tbody>

                                {suppliers.map((supplier) => (

                                    <tr key={supplier.id}>

                                        <td>
                                            {supplier.id}
                                        </td>


                                        {editingId === supplier.id ? (

                                            <>

                                                <td>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={editData.name}
                                                        onChange={handleEditChange}
                                                    />
                                                </td>


                                                <td>
                                                    <input
                                                        type="text"
                                                        name="contact"
                                                        value={editData.contact}
                                                        onChange={handleEditChange}
                                                    />
                                                </td>


                                                <td>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={editData.email}
                                                        onChange={handleEditChange}
                                                    />
                                                </td>


                                                <td>
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        value={editData.address}
                                                        onChange={handleEditChange}
                                                    />
                                                </td>


                                                <td className="supplier-actions">

                                                    <button
                                                        className="save-btn"
                                                        onClick={() =>
                                                            saveEdit(supplier.id)
                                                        }
                                                    >
                                                        Save
                                                    </button>


                                                    <button
                                                        className="cancel-btn"
                                                        onClick={cancelEdit}
                                                    >
                                                        Cancel
                                                    </button>

                                                </td>

                                            </>

                                        ) : (

                                            <>

                                                <td>
                                                    {supplier.name}
                                                </td>

                                                <td>
                                                    {supplier.contact}
                                                </td>

                                                <td>
                                                    {supplier.email}
                                                </td>

                                                <td>
                                                    {supplier.address}
                                                </td>


                                                <td className="supplier-actions">

                                                    <button
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            startEdit(supplier)
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        className="delete-btn"
                                                        onClick={() =>
                                                            deleteSupplier(
                                                                supplier.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </td>

                                            </>

                                        )}

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

}

export default Suppliers;