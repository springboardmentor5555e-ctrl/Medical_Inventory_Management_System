import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import api from "../services/api";
import "../styles/Medicines.css";

   function Medicines() {

    const navigate = useNavigate();

    const role = localStorage.getItem("role");

    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [editId, setEditId] = useState(null);

const [editMedicine, setEditMedicine] = useState({});

    useEffect(() => {
        loadMedicines();
    }, []);

   const loadMedicines = async () => {
    try {
        const response = await api.get("/medicines");

        console.log("Medicines received:", response.data);

        setMedicines(response.data);

    } catch (error) {
        console.log("Error:", error);
    }
};
const filteredMedicines = medicines.filter((medicine) => {

    const matchSearch =
        medicine.name.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
        category === "All" || medicine.category === category;

    return matchSearch && matchCategory;

});
    const deleteMedicine = async (id) => {
        if (window.confirm("Delete this medicine?")) {
            await api.delete(`/medicines/${id}`);
            loadMedicines();
        }
    };
    const startEdit = (medicine) => {

    setEditId(medicine.id);
    setEditMedicine({...medicine});

};


const handleEditChange = (e) => {

    setEditMedicine({
        ...editMedicine,
        [e.target.name]: e.target.value
    });

};


const updateMedicine = async () => {

    try {

        await api.put(
            `/medicines/${editId}`,
            editMedicine
        );

        setEditId(null);
        loadMedicines();

    } catch(error) {
        console.log("Role:", role);

    }

};

    return (
        <div className="medicine-page">
            <div className="medicine-card">
                <div className="medicine-header">
<div className="page-title">

<button
    className="back-btn"
    onClick={() => navigate(-1)}
>
    <FaArrowLeft />
</button>
  <h2 className="page-title">Medicines</h2>
    <div className="filters">

    </div>
</div>

<h2>💊 Medicines</h2>
</div>

<div className="filters">

    <div className="filters">

        <input
            type="text"
            placeholder="🔍 Search Medicine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-box"
        />

        <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-filter"
        >

            <option value="All">All Categories</option>

            <option value="Tablet">Tablet</option>

            <option value="Capsule">Capsule</option>

            <option value="Syrup">Syrup</option>

            <option value="Injection">Injection</option>

            <option value="Cream">Cream</option>

            <option value="Drops">Drops</option>

            <option value="Other">Other</option>

        </select>

    </div>

</div>
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
                            {role === "admin" && <th>Actions</th>}
                        </tr>

                    </thead>

                    <tbody>
                        {filteredMedicines.map((medicine) => (

                           <tr key={medicine.id}>

    <td>
        {editId === medicine.id ? (
            <input
                type="text"
                name="name"
                value={editMedicine.name}
                onChange={handleEditChange}
            />
        ) : (
            medicine.name
        )}
    </td>

    <td>{medicine.batchNumber}</td>

    <td>{medicine.category}</td>

    <td>{medicine.supplier}</td>

    <td>{medicine.quantity}</td>

    <td>₹{medicine.price}</td>

    <td>{medicine.expiryDate}</td>
    {role === "admin" && (
    <td>
        {editId === medicine.id ? (
            <button
                className="save-btn"
                onClick={updateMedicine}
            >
                Save
            </button>
        ) : (
            <>
                <button
                    className="edit-btn"
                    onClick={() => startEdit(medicine)}
                >
                    <FaEdit />
                </button>

                <button
                    className="delete-btn"
                    onClick={() => deleteMedicine(medicine.id)}
                >
                    <FaTrash />
                </button>
            </>
        )}
    </td>
)}

</tr>
                        ))}

                    </tbody>

                </table>

            </div>
            </div>
    );
}

export default Medicines;