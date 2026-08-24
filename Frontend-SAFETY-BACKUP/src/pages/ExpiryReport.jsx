import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../services/api";
import "../styles/ReportTable.css";


function ExpiryReport() {

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



    const today = new Date();



    const expiredMedicines = medicines.filter((medicine) => {

        return new Date(medicine.expiryDate) < today;

    });



    const expiringSoon = medicines.filter((medicine) => {

        const expiry = new Date(medicine.expiryDate);

        const difference =
            (expiry - today) / (1000 * 60 * 60 * 24);


        return difference > 0 && difference <= 30;

    });



    return (

        <div className="report-page">


            <FaArrowLeft

                className="back-btn"

                onClick={() => navigate("/reports")}

            />


            <h2>⚠ Medicine Expiry Report</h2>



            <div className="report-summary">


                <div className="summary-card">

                    <h3>Total Medicines</h3>

                    <h1>{medicines.length}</h1>

                </div>



                <div className="summary-card">

                    <h3>Expired</h3>

                    <h1>{expiredMedicines.length}</h1>

                </div>



                <div className="summary-card">

                    <h3>Expiring Soon</h3>

                    <h1>{expiringSoon.length}</h1>

                </div>


            </div>




            <table>

                <thead>

                    <tr>

                        <th>Name</th>
                        <th>Batch</th>
                        <th>Expiry Date</th>
                        <th>Status</th>

                    </tr>

                </thead>


                <tbody>


                {medicines.map((medicine)=>(


                    <tr key={medicine.id}>


                        <td>
                            {medicine.name}
                        </td>


                        <td>
                            {medicine.batchNumber}
                        </td>


                        <td>
                            {medicine.expiryDate}
                        </td>


                        <td>


                        {
                        new Date(medicine.expiryDate) < today
                        ?
                        "❌ Expired"
                        :
                        "✅ Available"
                        }


                        </td>


                    </tr>


                ))}


                </tbody>


            </table>


        </div>

    );

}


export default ExpiryReport;