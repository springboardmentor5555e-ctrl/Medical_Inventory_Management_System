import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/dashboard.css";

function Notifications() {

    const navigate = useNavigate();

    const [lowStock, setLowStock] = useState([]);
    const [expired, setExpired] = useState([]);

    useEffect(() => {

        loadNotifications();

    }, []);

    const loadNotifications = async () => {

        try {

            const lowStockResponse =
                await api.get("/medicines/low-stock");

            const expiredResponse =
                await api.get("/medicines/expired");

            setLowStock(lowStockResponse.data);
            setExpired(expiredResponse.data);

        } catch (error) {

            console.log(error);

        }

    };

    return (

        <div className="main">

            <h1>🔔 Notifications</h1>

            <button onClick={() => navigate("/pharmacist-dashboard")}>
                ⬅ Back
            </button>

            <br /><br />

            <h2>⚠ Low Stock Medicines</h2>

            {
                lowStock.length === 0 ?

                    <p>No Low Stock Medicines</p>

                    :

                    lowStock.map((medicine) => (

                        <div
                            key={medicine.id}
                            className="low-stock-item"
                        >

                            💊 {medicine.name}

                            &nbsp;

                            Qty : {medicine.quantity}

                        </div>

                    ))
            }

            <br />

            <h2>🚫 Expired Medicines</h2>

            {

                expired.length === 0 ?

                    <p>No Expired Medicines</p>

                    :

                    expired.map((medicine) => (

                        <div
                            key={medicine.id}
                            className="low-stock-item"
                        >

                            💊 {medicine.name}

                            &nbsp;

                            Expired on : {medicine.expiryDate}

                        </div>

                    ))

            }

        </div>

    );

}

export default Notifications;