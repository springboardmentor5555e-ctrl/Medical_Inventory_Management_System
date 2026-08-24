import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaEnvelope,
    FaLock
} from "react-icons/fa";

import "../styles/Login.css";


function Login() {

    const navigate = useNavigate();

    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {

    e.preventDefault();

    // ===========================
    // PHARMACIST LOGIN
    // ===========================
if (role === "Pharmacist") {

    if (email.trim() !== "" && password.trim() !== "") {

        navigate("/pharmacist-dashboard");
        return;

    } else {

        alert("Please enter email and password");
        return;

    }

}
// ===========================
// STAFF LOGIN
// ===========================
if (role === "Staff") {

    if (email.trim() !== "" && password.trim() !== "") {

        localStorage.setItem("role", "Staff");

        navigate("/staff-dashboard");
        return;

    } else {

        alert("Please enter email and password");
        return;

    }

}
    // ===========================
    // ADMIN LOGIN
    // ===========================
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {

        localStorage.setItem(
            "user",
            JSON.stringify({
                email: email,
                password: password,
                role: role
            })
        );

        alert("Admin account created successfully");

      localStorage.setItem("role", "admin");
navigate("/admin-dashboard");

    } else {

        if (
            savedUser.email === email &&
            savedUser.password === password
        ) {

       if (role === "admin") {

    localStorage.setItem("role", "admin");
    navigate("/admin-dashboard");

} else if (role === "Pharmacist") {

    localStorage.setItem("role", "Pharmacist");
    navigate("/pharmacist-dashboard");

} else if (role === "Staff") {

    localStorage.setItem("role", "Staff");
    navigate("/staff-dashboard");

}

        } else if (
            savedUser.email === email &&
            savedUser.password !== password
        ) {

            alert("Invalid Password");

        } else {

            alert("Email not registered");

        }

    }

};


    return (

        <div className="login-page">


            <div className="login-card">



                <h1 className="logo-title">

                    💊 MediStock

                </h1>




                <form onSubmit={handleLogin}>
                    <div className="role-section">

    <h2 className="welcome-title">
        Welcome Back!
    </h2>

    <p className="welcome-subtitle">
        Sign in to continue to your account
    </p>

    <h3 className="role-heading">
        Select Your Role
    </h3>
<div className="role-cards">

    <div
        className={`role-card ${role === "admin" ? "active" : ""}`}
        onClick={() => setRole("admin")}
    >
        <div className="role-icon">👨‍💼</div>
        <p>Admin</p>
    </div>

    <div
        className={`role-card ${role === "Pharmacist" ? "active" : ""}`}
        onClick={() => setRole("Pharmacist")}
    >
        <div className="role-icon">💊</div>
        <p>Pharmacist</p>
    </div>

    <div
        className={`role-card ${role === "Staff" ? "active" : ""}`}
        onClick={() => setRole("Staff")}
    >
        <div className="role-icon">👩‍⚕️</div>
        <p>Staff</p>
    </div>

</div>
</div>   {/*// closes role-section*/}

                    <label className="form-label">

                        Email Address

                    </label>



                    <div className="input-box">


                        <FaEnvelope/>


                        <input

                        type="email"

                        placeholder="Enter your email"

                        value={email}

                        onChange={(e)=>setEmail(e.target.value)}

                        />


                    </div>






                    <label className="form-label">

                        Password

                    </label>



                    <div className="input-box">


                        <FaLock/>


                        <input

                        type="password"

                        placeholder="Enter your password"

                        value={password}

                        onChange={(e)=>setPassword(e.target.value)}

                        />


                    </div>







                    <button className="login-btn">


                        Login


                    </button>
                     <div className="login-links">

    <span
        className="forgot-password"
        onClick={() => navigate("/forgot-password")}
    >
        Forgot Password?
    </span>

    <span
        className="register-link"
        onClick={() => navigate("/register")}
    >
        Register Here
    </span>

</div>



                </form>



            </div>



        </div>

    );


}


export default Login;