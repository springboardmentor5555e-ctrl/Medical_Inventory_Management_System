import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../services/api";
import "../styles/AddMedicine.css";

function AddMedicine() {

    const navigate = useNavigate();

    const [medicine, setMedicine] = useState({
        name: "",
        batchNumber: "",
        category: "",
        supplier: "",
        quantity: "",
        manufacturingDate: "",
        expiryDate: "",
        price: "",
        lowStockLimit: ""
    });

    const handleChange = (e) => {

        setMedicine({
            ...medicine,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await api.post("/medicines", medicine);

            alert("Medicine Added Successfully ✅");

            navigate("/admin-dashboard");
             } catch (error) {

        console.log("Error:", error);
        console.log("Response:", error.response);
        console.log("Data:", error.response?.data);
        console.log("Status:", error.response?.status);

        alert("Unable to save medicine.");
    }

    };

    return (
        <div className="add-page">

            <FaArrowLeft
                className="back-btn"
                onClick={() => navigate("/admin-dashboard")}
            />

            <div className="add-card">

                <h2>💊 Add Medicine</h2>

                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        <div className="form-group">
                            <label>Medicine Name</label>
                            <input
                                type="text"
                                name="name"
                                value={medicine.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Batch Number</label>
                            <input
                                type="text"
                                name="batchNumber"
                                value={medicine.batchNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <input
                                type="text"
                                name="category"
                                value={medicine.category}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Supplier</label>
                            <input
                                type="text"
                                name="supplier"
                                value={medicine.supplier}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={medicine.quantity}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Price</label>
                            <input
                                type="number"
                                name="price"
                                value={medicine.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Manufacturing Date</label>
                            <input
                                type="date"
                                name="manufacturingDate"
                                value={medicine.manufacturingDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Expiry Date</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={medicine.expiryDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Low Stock Limit</label>
                            <input
                                type="number"
                                name="lowStockLimit"
                                value={medicine.lowStockLimit}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                    <div className="button-group">

                        <button
                            type="reset"
                            className="reset-btn"
                        >
                            Reset
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                        >
                            Save Medicine
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default AddMedicine;