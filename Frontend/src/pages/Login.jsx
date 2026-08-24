import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";

import api from "../services/api";
import "../styles/Login.css";

function Login() {

    const navigate = useNavigate();

    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        if (!role) {
            alert("Please select your role");
            return;
        }

        if (!email.trim() || !password.trim()) {
            alert("Please enter email and password");
            return;
        }

        try {

            // ==========================================
            // LOGIN THROUGH SPRING BOOT BACKEND
            // ==========================================

            const response = await api.post(
                "/auth/login",
                {
                    email: email.trim(),
                    password: password
                }
            );

            console.log("Login response:", response.data);

            // ==========================================
            // GET JWT FROM BACKEND
            // ==========================================

            const token = response.data.token;
            const backendRole = response.data.role;
            const userId = response.data.userId;

            if (!token) {

                alert("Login failed: JWT token was not received.");
                return;

            }

            // ==========================================
            // SAVE JWT
            // ==========================================

            localStorage.setItem(
                "token",
                token
            );

            // ==========================================
            // SAVE ROLE
            // ==========================================

            localStorage.setItem(
                "role",
                backendRole
            );

            // ==========================================
            // SAVE USER ID
            // ==========================================

            if (userId !== undefined && userId !== null) {

                localStorage.setItem(
                    "userId",
                    userId
                );

            }

            // ==========================================
            // NORMALIZE ROLE
            // ==========================================

            const normalizedRole =
                String(backendRole)
                    .replace("ROLE_", "")
                    .toUpperCase();

            // ==========================================
            // NAVIGATION
            // ==========================================

            if (normalizedRole === "ADMIN") {

                navigate("/admin-dashboard");

            } else if (normalizedRole === "PHARMACIST") {

                navigate("/pharmacist-dashboard");

            } else if (normalizedRole === "STAFF") {

                navigate("/staff-dashboard");

            } else {

                alert(
                    "Login successful, but the user role is not recognized: "
                    + backendRole
                );

            }

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            console.error(
                "Login response:",
                error.response?.data
            );

            if (error.response?.status === 401) {

                alert(
                    "Invalid email or password"
                );

            } else if (error.response?.status === 403) {

                alert(
                    "You are not authorized to login."
                );

            } else {

                alert(
                    error.response?.data?.message ||
                    "Login failed. Please try again."
                );

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
                                className={`role-card ${
                                    role === "admin"
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setRole("admin")
                                }
                            >
                                <div className="role-icon">
                                    👨‍💼
                                </div>

                                <p>Admin</p>
                            </div>

                            <div
                                className={`role-card ${
                                    role === "Pharmacist"
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setRole("Pharmacist")
                                }
                            >
                                <div className="role-icon">
                                    💊
                                </div>

                                <p>Pharmacist</p>
                            </div>

                            <div
                                className={`role-card ${
                                    role === "Staff"
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setRole("Staff")
                                }
                            >
                                <div className="role-icon">
                                    👩‍⚕️
                                </div>

                                <p>Staff</p>
                            </div>

                        </div>

                    </div>

                    <label className="form-label">
                        Email Address
                    </label>

                    <div className="input-box">

                        <FaEnvelope />

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                    </div>

                    <label className="form-label">
                        Password
                    </label>

                    <div className="input-box">

                        <FaLock />

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />

                    </div>

                    <button
                        className="login-btn"
                        type="submit"
                    >
                        Login
                    </button>

                    <div className="login-links">

                        <span
                            className="forgot-password"
                            onClick={() =>
                                navigate("/forgot-password")
                            }
                        >
                            Forgot Password?
                        </span>

                        <span
                            className="register-link"
                            onClick={() =>
                                navigate("/register")
                            }
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