import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "../styles/BackToDashboard.css";

function BackToDashboard() {

    const navigate = useNavigate();

    const handleBack = () => {

        const role = localStorage.getItem("role");

        if (role === "ADMIN" || role === "ROLE_ADMIN") {

            navigate("/admin-dashboard");

        } else if (
            role === "PHARMACIST" ||
            role === "ROLE_PHARMACIST"
        ) {

            navigate("/pharmacist-dashboard");

        } else if (
            role === "STAFF" ||
            role === "ROLE_STAFF"
        ) {

            navigate("/staff-dashboard");

        } else {

            navigate("/");

        }
    };

    return (
        <button
            className="back-dashboard-btn"
            onClick={handleBack}
        >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
        </button>
    );
}

export default BackToDashboard;