import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditSupplier() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [supplier, setSupplier] = useState({
        name: "",
        contact: "",
        email: "",
        address: ""
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSupplier();
    }, []);

    const loadSupplier = async () => {

        try {

            const response = await api.get(`/suppliers/${id}`);

            setSupplier(response.data);

        } catch (error) {

            console.error("Error loading supplier:", error);

            alert("Failed to load supplier.");

        } finally {

            setLoading(false);

        }
    };

    const handleChange = (e) => {

        setSupplier({
            ...supplier,
            [e.target.name]: e.target.value
        });

    };

    const updateSupplier = async (e) => {

        e.preventDefault();

        try {

            await api.put(`/suppliers/${id}`, supplier);

            alert("Supplier updated successfully! ✅");

            navigate("/suppliers");

        } catch (error) {

            console.error("Error updating supplier:", error);

            alert("Failed to update supplier.");

        }
    };

    if (loading) {
        return <h3>Loading supplier...</h3>;
    }

    return (

        <div className="dashboard">

            <div className="main">

                <div className="welcome">

                    <h2>Edit Supplier</h2>

                    <p>Update supplier details</p>

                </div>

                <form onSubmit={updateSupplier}>

                    <input
                        type="text"
                        name="name"
                        placeholder="Supplier Name"
                        value={supplier.name}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="contact"
                        placeholder="Contact Number"
                        value={supplier.contact}
                        onChange={handleChange}
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={supplier.email}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={supplier.address}
                        onChange={handleChange}
                    />

                    <button type="submit">
                        Update Supplier
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/suppliers")}
                    >
                        Cancel
                    </button>

                </form>

            </div>

        </div>

    );
}

export default EditSupplier;