import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/AddSupplier.css";


function EditSupplier() {

    const { id } = useParams();

    const navigate = useNavigate();


    const [supplier, setSupplier] = useState({

        supplierName: "",
        companyName: "",
        phone: "",
        email: "",
        address: ""

    });



    useEffect(() => {

        loadSupplier();

    }, []);



    const loadSupplier = async () => {

        try {

            const response = await api.get(`/suppliers/${id}`);

            setSupplier(response.data);

        } catch(error) {

            console.log(error);

        }

    };



    const handleChange = (e) => {

        setSupplier({

            ...supplier,
            [e.target.name]: e.target.value

        });

    };



    const updateSupplier = async(e)=>{

        e.preventDefault();


        try {

            await api.put(
                `/suppliers/${id}`,
                supplier
            );


            alert("Supplier updated successfully");

            navigate("/suppliers");


        } catch(error){

            console.log(error);

        }

    };



    return (

        <div className="add-supplier-container">


            <div className="add-supplier-box">


                <h2>Edit Supplier</h2>


                <form onSubmit={updateSupplier}>


                    <input
                    name="supplierName"
                    placeholder="Supplier Name"
                    value={supplier.supplierName}
                    onChange={handleChange}
                    />


                    <input
                    name="companyName"
                    placeholder="Company Name"
                    value={supplier.companyName}
                    onChange={handleChange}
                    />


                    <input
                    name="phone"
                    placeholder="Phone Number"
                    value={supplier.phone}
                    onChange={handleChange}
                    />


                    <input
                    name="email"
                    placeholder="Email"
                    value={supplier.email}
                    onChange={handleChange}
                    />


                    <input
                    name="address"
                    placeholder="Address"
                    value={supplier.address}
                    onChange={handleChange}
                    />


                    <button type="submit">
                        Update Supplier
                    </button>


                </form>


            </div>


        </div>

    );

}


export default EditSupplier;