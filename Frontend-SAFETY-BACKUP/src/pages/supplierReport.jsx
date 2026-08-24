import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "../styles/Reports.css";


function SupplierReport(){

    const navigate = useNavigate();


    const downloadPDF = () => {

        window.open("http://localhost:8082/api/reports/stock/download")

    };


    return(

        <div className="reports-container">


            <FaArrowLeft
                className="back-btn"
                onClick={()=>navigate("/reports")}
            />


            <div className="report-header">

                <h2>🏢 Supplier Report</h2>


                <button 
                className="download-btn"
                onClick={downloadPDF}
                >
                    ⬇ Download PDF
                </button>

            </div>



            <div className="report-card">

                <h3>Supplier Details</h3>


                <p>
                    Supplier Name: ABC Medical Suppliers
                </p>


                <p>
                    Contact: 9876543210
                </p>


                <p>
                    Medicines Supplied: 25
                </p>


            </div>


        </div>

    );

}


export default SupplierReport;