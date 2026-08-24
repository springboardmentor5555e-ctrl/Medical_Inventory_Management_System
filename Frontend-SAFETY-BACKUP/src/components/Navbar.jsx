import { Link } from "react-router-dom";
import "../styles/navbar.css";

function Navbar(){

    return(
        <div className="navbar">

            <div className="logo">
                💊 MediStock
            </div>

            <div className="nav-links">

                <Link to="/">Dashboard</Link>

                <Link to="/medicines">
                    Medicines
                </Link>

                <Link to="/add">
                    Add Medicine
                </Link>

                <Link to="/reports">
                    Reports
                </Link>
                

            </div>

        </div>
    )

}

export default Navbar;