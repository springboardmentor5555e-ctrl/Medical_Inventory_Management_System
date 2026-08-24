import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FaBell, FaMoon, FaUserCircle } from "react-icons/fa";
import pharmacistImg from "../assets/pharmacist.png";
import api from "../services/api";
import "../styles/dashboard.css";

function PharmacistDashboard() {

    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({

    totalMedicines: 0,

    totalStock: 0,

    lowStockMedicines: 0,

    expiredMedicines: 0,

    totalSuppliers: 0

});
    const [lowStockList, setLowStockList] = useState([]);
    const [expiryList, setExpiryList] = useState([]);
    const [expiredList, setExpiredList] = useState([]);
    const [darkMode, setDarkMode] = useState(false);

const [showProfile, setShowProfile] = useState(false);
const profileRef = useRef(null);

// Close profile box when clicking outside

useEffect(() => {

    const handleClickOutside = (event) => {

        if (
            profileRef.current &&
            !profileRef.current.contains(event.target)
        ) {

            setShowProfile(false);

        }

    };


    document.addEventListener(
        "mousedown",
        handleClickOutside
    );


    return () => {

        document.removeEventListener(
            "mousedown",
            handleClickOutside
        );

    };


}, []);


// Load dashboard data automatically

useEffect(() => {

    loadDashboard();
    const interval = setInterval(() => {

        loadDashboard();

    }, 10000);


    return () => clearInterval(interval);


}, []);

const loadDashboard = async () => {
    try {

        const response = await api.get("/medicines/dashboard-summary");

        const lowStockResponse = await api.get("/medicines/low-stock");

        const expiryResponse = await api.get("/medicines/expired");



        setDashboardData({

            ...response.data,
        });
        setLowStockList(lowStockResponse.data);

setExpiryList(expiryResponse.data);

// Temporary (same API)
setExpiredList(expiryResponse.data);


    } catch (error) {

        console.log(error);

    }
};

    return (

        <div className={darkMode ? "dashboard dark" : "dashboard"}>

            {/* Sidebar */}

          <div className="sidebar">

    {/* Pharmacist Profile */}

    <div className="admin-profile">

       <div className="profile">
    <img
        src={pharmacistImg}
        alt="Pharmacist"
        className="profile-image"
    />
    <h3>Pharmacist</h3>
</div>

    </div>

    {/* Logo */}

    <h2 className="logo">
        MediStock 🩺
    </h2>

    {/* Sidebar Buttons */}

    <button onClick={() => navigate("/pharmacist-dashboard")}>
        Dashboard
    </button>

    <button onClick={() => navigate("/medicines")}>
        Medicines Present
    </button>
    <button onClick={() => navigate("/notifications")}>
    🔔 Notifications
</button>

<button onClick={() => navigate("/")}>
    🚪 Logout
</button>

</div>

            {/* Main */}

            <div className="main">

                {/* Topbar */}

                <div className="topbar">

                    <h1>Medicine Supply Inventory System</h1>
                    <div className="icons">


    <FaMoon
        onClick={() => setDarkMode(!darkMode)}
        className="icon-btn"
    />
      <FaUserCircle
        onClick={(e) => {
            e.stopPropagation();
            setShowProfile(!showProfile);
        }}
        className="icon-btn"
    />
    {
showProfile && (

    <div 
        className="profile-box"
        ref={profileRef}
    >
        <h3>👤 Pharmacist Profile</h3>

<p>
    <b>Name:</b> Pharmacist
</p>

<p>
    <b>Email:</b> admin@medistock.com
</p>

<p>
    <b>Role:</b> Pharmacist
</p>

        </div>

    )
    }


</div>

                </div>

                {/* Welcome */}

                <div className="welcome">

                    <h2>Welcome Pharmacist</h2>

                    <p>
                        Manage your medicine inventory efficiently
                    </p>

                </div>

                {/* Dashboard Cards */}

          <div className="cards">

    <div className="card">
        <h3>💊 Total Medicines</h3>
        <h1>{dashboardData.totalMedicines}</h1>
    </div>

    <div className="card">
        <h3>⚠ Low Stock Medicines</h3>
        <h1>{dashboardData.lowStockMedicines}</h1>
    </div>

    <div className="card">
        <h3>⏳ Going to Expire</h3>
        <h1>{expiryList.length}</h1>
    </div>

    <div className="card">
        <h3>🚫 Expired Medicines</h3>
        <h1>{dashboardData.expiredMedicines}</h1>
    </div>

</div>

{/* Stock & Expiry Alerts */}

<div className="alerts-container">


    {/* Low Stock Box */}

    <div className="low-stock-box">

        <h2>⚠ Low Stock Medicines</h2>


        {lowStockList.length === 0 ? (

            <p className="no-stock">
                No medicines are low in stock.
            </p>

        ) : (

            lowStockList.map((medicine) => (

                <div
                    className="low-stock-item"
                    key={medicine.id}
                >

                    <div>
                        💊 <strong>{medicine.name}</strong>
                    </div>


                    <span className="qty">
                        Qty : {medicine.quantity}
                    </span>


                </div>

            ))

        )}

    </div>




    {/* Expiry Alert Box */}

    <div className="low-stock-box">


        <h2>⚠ Expiry Alert Medicines</h2>


        {expiryList.length === 0 ? (

            <p className="no-stock">
                No expiry alerts.
            </p>

        ) : (

            expiryList.map((medicine)=>(

                <div
                    className="low-stock-item"
                    key={medicine.id}
                >

                    <div>
                        💊 <strong>{medicine.name}</strong>
                    </div>


                    <span className="qty">
                        Expiry : {medicine.expiryDate}
                    </span>


                </div>

            ))

        )}


    </div>


</div>

            </div>

        </div>

    );

}

export default PharmacistDashboard;