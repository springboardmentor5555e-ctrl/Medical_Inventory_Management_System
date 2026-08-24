import Navbar from "../components/Navbar";
import "../styles/dashboard.css";
import { useEffect, useState } from "react";
import api from "../services/api";
import { FaBell } from "react-icons/fa";

function Dashboard(){
    const [dashboardData, setDashboardData] = useState({
    totalMedicines: 0,
    lowStockMedicines: 0,
    goingToExpire: 0,
    expiredMedicines: 0
});
    const [registrationRequests, setRegistrationRequests] = useState([]);

    const [showRegistrationNotifications, setShowRegistrationNotifications] =
        useState(false);

        useEffect(() => {

    loadDashboard();

    loadRegistrationRequests();

    const interval = setInterval(() => {

        loadRegistrationRequests();

    }, 10000);

    return () => {
        clearInterval(interval);
    };

}, []);

const loadDashboard = async () => {
    try {
        const response = await api.get("/medicines/dashboard-summary");
        setDashboardData(response.data);
    } catch (error) {
        console.log(error);
    }
};

const loadRegistrationRequests = async () => {

    try {

        const response = await api.get(
            "/admin/registration-requests"
        );

        setRegistrationRequests(response.data);

    } catch (error) {

        console.log(
            "Registration request error:",
            error
        );

    }
};

const approveRegistration = async (userId) => {

    try {

        await api.put(
            `/admin/registration-requests/${userId}/approve`
        );

        alert("User approved successfully ✅");

        loadRegistrationRequests();

    } catch (error) {

        console.log(
            "Approval error:",
            error
        );

        alert("Unable to approve user.");

    }
};

return(

<div>

<div className="admin-navbar-wrapper">

    <Navbar />

    <div className="registration-notification-wrapper">

        <FaBell
            className="registration-bell"
            onClick={() =>
                setShowRegistrationNotifications(
                    !showRegistrationNotifications
                )
            }
        />

        {registrationRequests.length > 0 && (

            <span className="registration-notification-count">
                {registrationRequests.length}
            </span>

        )}

    </div>


    {showRegistrationNotifications && (

        <div className="registration-notification-panel">

            <h3>
                🔔 Registration Requests
            </h3>


            {registrationRequests.length === 0 ? (

                <p className="no-registration-request">
                    No new registration requests.
                </p>

            ) : (

                registrationRequests.map((user) => (

                    <div
                        className="registration-request"
                        key={user.id}
                    >

                        <div className="registration-user-info">

                            <strong>
                                {user.fullName}
                            </strong>

                            <span>
                                {user.role}
                            </span>

                            <small>
                                {user.email}
                            </small>

                        </div>


                        <button
                            className="accept-registration-btn"
                            onClick={() =>
                                approveRegistration(user.id)
                            }
                        >
                            ✓ Accept
                        </button>

                    </div>

                ))

            )}

        </div>

    )}

</div>

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