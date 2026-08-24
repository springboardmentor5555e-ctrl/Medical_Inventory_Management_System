import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../services/api";
import "../styles/AddSupplier.css";


function AddSupplier() {

    const navigate = useNavigate();


    const [supplier, setSupplier] = useState({

        supplierName: "",
        companyName: "",
        phone: "",
        email: "",
        address: ""

    });



    const handleChange = (e) => {

        setSupplier({

            ...supplier,
            [e.target.name]: e.target.value

        });

    };


const addSupplier = async (e) => {

    e.preventDefault();

    try {

        const response = await api.post("/suppliers", {
    name: supplier.supplierName,
    contact: supplier.phone,
    email: supplier.email,
    address: supplier.address
});

        console.log("Supplier saved:", response.data);

        alert("Supplier added successfully! ✅");

        navigate("/suppliers");

    } catch (error) {

        console.error(
            "Error adding supplier:",
            error
        );

        if (error.response) {

            alert(
                "Failed to add supplier: " +
                (error.response.data?.message ||
                 "Server error")
            );

        } else {

            alert(
                "Failed to add supplier. Please check the backend."
            );

        }

    }
};
    return (

    <div className="add-supplier-container">

        <div className="add-supplier-box">

           <div className="page-title">

<button
className="back-btn"
onClick={() => navigate("/admin-dashboard")}
>
<FaArrowLeft />
</button>

<div className="page-header">

    <button
        className="back-btn"
        onClick={() => navigate("/admin-dashboard")}
    >
    </button>

    <h2> Add Supplier</h2>

</div>

</div>


            <form onSubmit={addSupplier}>

                <input
                    type="text"
                    name="supplierName"
                    placeholder="Supplier Name"
                    value={supplier.supplierName}
                    onChange={handleChange}
                />


                <input
                    type="text"
                    name="companyName"
                    placeholder="Company Name"
                    value={supplier.companyName}
                    onChange={handleChange}
                />


                <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={supplier.phone}
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
                <button type="submit" className="submit-btn">
    Add Supplier
</button>
                            </form>

        </div>

    </div>

    );
}


export default AddSupplier;