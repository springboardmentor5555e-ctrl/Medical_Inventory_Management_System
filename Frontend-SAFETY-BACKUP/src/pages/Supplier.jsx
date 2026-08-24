import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import api from "../services/api";
import "../styles/Suppliers.css";


function Suppliers() {

    const navigate = useNavigate();

    const [suppliers, setSuppliers] = useState([]);

    const [editId, setEditId] = useState(null);

    const [editSupplier, setEditSupplier] = useState({});


    useEffect(() => {

        loadSuppliers();

    }, []);



    const loadSuppliers = async () => {

        try {

            const response = await api.get("/suppliers");

            setSuppliers(response.data);

        } catch(error) {

            console.log(error);

        }

    };



    const deleteSupplier = async(id)=>{

        if(window.confirm("Delete this supplier?")){

            await api.delete(`/suppliers/${id}`);

            loadSuppliers();

        }

    };



    const startEdit = (supplier)=>{

        setEditId(supplier.id);

        setEditSupplier({...supplier});

    };



    const handleEditChange = (e)=>{

        setEditSupplier({

            ...editSupplier,

            [e.target.name]: e.target.value

        });

    };



    const updateSupplier = async()=>{

        try{

            await api.put(
                `/suppliers/${editId}`,
                editSupplier
            );


            setEditId(null);

            loadSuppliers();


        }catch(error){

            console.log(error);

        }

    };




    return (

        <div className="suppliers-container">


            <FaArrowLeft
                className="back-btn"
                onClick={()=>navigate("/admin-dashboard")}
            />


            <h2>🏢 Suppliers List</h2>


            <table>


                <thead>

                    <tr>

                        <th>Name</th>

                        <th>Company</th>

                        <th>Phone</th>

                        <th>Email</th>

                        <th>Action</th>

                    </tr>

                </thead>



                <tbody>


                {suppliers.map((supplier)=>(


                    <tr key={supplier.id}>


                        <td>

                        {
                        editId===supplier.id ?

                        <input
                        name="supplierName"
                        value={editSupplier.supplierName}
                        onChange={handleEditChange}
                        />

                        :

                        supplier.supplierName

                        }

                        </td>



                        <td>

                        {
                        editId===supplier.id ?

                        <input
                        name="companyName"
                        value={editSupplier.companyName}
                        onChange={handleEditChange}
                        />

                        :

                        supplier.companyName

                        }

                        </td>



                        <td>

                        {
                        editId===supplier.id ?

                        <input
                        name="phone"
                        value={editSupplier.phone}
                        onChange={handleEditChange}
                        />

                        :

                        supplier.phone

                        }

                        </td>



                        <td>

                        {
                        editId===supplier.id ?

                        <input
                        name="email"
                        value={editSupplier.email}
                        onChange={handleEditChange}
                        />

                        :

                        supplier.email

                        }

                        </td>



                        <td>


                        {
                        editId===supplier.id ?

                        <button onClick={updateSupplier}>
                            Save
                        </button>

                        :

                        <button
                        className="edit-btn"
                        onClick={()=>startEdit(supplier)}
                        >
                            <FaEdit/>
                        </button>

                        }



                        <button
                        className="delete-btn"
                        onClick={()=>deleteSupplier(supplier.id)}
                        >

                            <FaTrash/>

                        </button>


                        </td>


                    </tr>


                ))}


                </tbody>


            </table>


        </div>

    );

}


export default Suppliers;