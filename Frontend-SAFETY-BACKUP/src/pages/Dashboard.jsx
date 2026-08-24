import Navbar from "../components/Navbar";
import "../styles/dashboard.css";
import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard(){
    const [dashboardData, setDashboardData] = useState({
    totalMedicines: 0,
    lowStockMedicines: 0,
    goingToExpire: 0,
    expiredMedicines: 0
});

useEffect(() => {
    loadDashboard();
}, []);

const loadDashboard = async () => {
    try {
        const response = await api.get("/medicines/dashboard-summary");
        setDashboardData(response.data);
    } catch (error) {
        console.log(error);
    }
};

return(

<div>

<Navbar/>

<div className="dashboard-container">

<h1>
Medical Inventory Management Platform
</h1>

<h2>
Dashboard
</h2>
<div className="cards">

    <div className="card blue">
        <h3>Total Medicines</h3>
       <p>{dashboardData.totalMedicines}</p>
    </div>

    <div className="card red">
        <h3>Low Stock Medicines</h3>
        <p>{dashboardData.lowStockMedicines}</p>
    </div>

    <div className="card yellow">
        <h3>Going To Expire</h3>
        <p>{dashboardData.goingToExpire}</p>
    </div>

    <div className="card orange">
        <h3>Expired Medicines</h3>
        <p>{dashboardData.expiredMedicines}</p>
    </div>

</div>


<div className="welcome-box">

<h2>
Welcome to MediStock
</h2>

<p>
Manage medicines, monitor stock levels and track expiry dates easily.
</p>


</div>


</div>

</div>

)

}

export default Dashboard;