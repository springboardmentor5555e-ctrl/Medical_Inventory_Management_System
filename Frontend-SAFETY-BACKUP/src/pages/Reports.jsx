import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "../styles/Reports.css";


function Reports() {

    const navigate = useNavigate();


    return (

        <div className="reports-container">


            <FaArrowLeft
                className="back-btn"
                onClick={() => navigate("/admin-dashboard")}
            />


            <h2>📊 Reports</h2>


            <div className="report-cards">


                <div className="report-card">

                    <h3>💊 Stock Report</h3>

                    <p>
                        View available medicines,
                        low stock and quantity details.
                    </p>
                    <div className="report-actions">

<button onClick={() => navigate("/stock-report")}>
    👁 View Report
</button>

<button onClick={() => window.open("http://localhost:8082/api/reports/stock/download")}>
    ⬇ Download
</button>

</div>

                </div>



                <div className="report-card">

                    <h3>⚠ Expiry Report</h3>

                    <p>
                        Check expired medicines and
                        medicines expiring soon.
                    </p>
                    <div className="report-actions">

<button onClick={() => navigate("/expiry-report")}>
    👁 View Report
</button>

<button onClick={() => window.open("http://localhost:8082/api/reports/expiry/download")}>
    ⬇ Download
</button>

</div>

                </div>



                <div className="report-card">

                    <h3>🏢 Supplier Report</h3>

                    <p>
                        View supplier details and
                        medicine supply information.
                    </p>
                    <div className="report-actions">

<button onClick={() => navigate("/supplier-report")}>
    👁 View Report
</button>

<button onClick={() => window.open("http://localhost:8082/api/reports/supplier/download")}>
    ⬇ Download
</button>

</div>
                </div>


            </div>


        </div>

    );

}


export default Reports;