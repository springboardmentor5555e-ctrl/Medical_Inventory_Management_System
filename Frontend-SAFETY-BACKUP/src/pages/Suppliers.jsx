import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrash, FaEdit } from "react-icons/fa";
import api from "../services/api";
import "../styles/Suppliers.css";


function Suppliers() {

  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);


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



  const deleteSupplier = async (id) => {

    if(window.confirm("Delete this supplier?")) {

      await api.delete(`/suppliers/${id}`);

      loadSuppliers();

    }

  };



  return (

    <div className="suppliers-container">


      <FaArrowLeft
        className="back-btn"
        onClick={() => navigate("/admin-dashboard")}
      />


      <h2>🏢 Suppliers List</h2>


      <table>

        <thead>

          <tr>
            <th>Supplier Name</th>
            <th>Company Name</th>
            <th>Phone Number</th>
            <th>Action</th>
          </tr>

        </thead>


        <tbody>


          {suppliers.map((supplier) => (

            <tr key={supplier.id}>


              <td>
                {supplier.supplierName}
              </td>


              <td>
                {supplier.companyName}
              </td>
              <td>{supplier.phone}</td>
              <td>
    <button
        className="edit-btn"
        onClick={() => navigate(`/edit-supplier/${supplier.id}`)}
    >
        <FaEdit />
    </button>

    <button
        className="delete-btn"
        onClick={() => deleteSupplier(supplier.id)}
    >
        <FaTrash />
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