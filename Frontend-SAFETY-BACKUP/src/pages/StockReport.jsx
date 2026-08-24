import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../services/api";
import "../styles/ReportTable.css";


function StockReport() {

    const navigate = useNavigate();

    const [medicines, setMedicines] = useState([]);


    useEffect(() => {

        loadMedicines();

    }, []);



    const loadMedicines = async () => {

        try {

            const response = await api.get("/medicines");

            setMedicines(response.data);

        } catch(error) {

            console.log(error);

        }

    };



    const totalMedicines = medicines.length;


    const totalQuantity = medicines.reduce(
        (sum, medicine) => sum + medicine.quantity,
        0
    );


    const lowStock = medicines.filter(
        (medicine) =>
        medicine.quantity <= medicine.lowStockLimit
    );



    return (

        <div className="report-page">


            <FaArrowLeft

                className="back-btn"

                onClick={() => navigate("/reports")}

            />


            <h2>💊 Medicine Stock Report</h2>



            <div className="report-summary">


                <div className="summary-card">

                    <h3>Total Medicines</h3>

                    <h1>{totalMedicines}</h1>

                </div>



                <div className="summary-card">

                    <h3>Total Quantity</h3>

                    <h1>{totalQuantity}</h1>

                </div>



                <div className="summary-card">

                    <h3>Low Stock</h3>

                    <h1>{lowStock.length}</h1>

                </div>


            </div>




            <table>


                <thead>

                    <tr>

                        <th>Name</th>
                        <th>Category</th>
                        <th>Supplier</th>
                        <th>Quantity</th>
                        <th>Status</th>

                    </tr>

                </thead>



                <tbody>


                {medicines.map((medicine)=>(


                    <tr key={medicine.id}>


                        <td>{medicine.name}</td>


                        <td>{medicine.category}</td>


                        <td>{medicine.supplier}</td>


                        <td>{medicine.quantity}</td>


                        <td>

                            {
                            medicine.quantity <= medicine.lowStockLimit
                            ?
                            "⚠ Low Stock"
                            :
                            "✓ Available"
                            }

                        </td>


                    </tr>


                ))}


                </tbody>


            </table>


        </div>

    );

}


export default StockReport;