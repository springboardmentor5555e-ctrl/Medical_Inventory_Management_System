import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import {
    FaEye,
    FaEyeSlash,
    FaUserShield,
    FaUserNurse,
    FaUserTie,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaLock
} from "react-icons/fa";

import registerBg from "../assets/register-bg.jpg";
import "../styles/Register.css";


function Register() {

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        fullName: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        role: "STAFF"
    });


    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (e) => {

        setData({
            ...data,
            [e.target.name]: e.target.value
        });

    };


    // =====================================================
    // REGISTER
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (
            !data.fullName ||
            !data.username ||
            !data.email ||
            !data.phone ||
            !data.password
        ) {

            alert("Please fill all the fields.");

            return;
        }


        if (data.phone.length !== 10) {

            alert(
                "Please enter a valid 10-digit mobile number."
            );

            return;
        }


        try {

            setLoading(true);


            const response = await axios.post(
                "http://localhost:8082/api/auth/register",
                data
            );


            console.log(
                "Registration Response:",
                response.data
            );


            alert(
                "Registration Successful! 🎉\n\nYour account has been sent to the Admin for approval."
            );


            // Clear form after successful registration

            setData({
                fullName: "",
                username: "",
                email: "",
                phone: "",
                password: "",
                role: "STAFF"
            });


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );


            console.error(
                "Backend Response:",
                error.response?.data
            );


            let message =
                "Registration Failed";


            if (error.response?.data) {


                if (
                    typeof error.response.data ===
                    "string"
                ) {

                    message =
                        error.response.data;

                }


                else if (
                    error.response.data.message
                ) {

                    message =
                        error.response.data.message;

                }


                else if (
                    error.response.data.error
                ) {

                    message =
                        error.response.data.error;

                }


                else {

                    message =
                        JSON.stringify(
                            error.response.data
                        );

                }

            }


            alert(message);


        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div
            className="auth-container"
            style={{
                backgroundImage:
                    `
                    linear-gradient(
                        135deg,
                        rgba(0,70,120,.85),
                        rgba(0,180,220,.65)
                    ),
                    url(${registerBg})
                    `
            }}
        >


            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="auth-left">


                <div className="brand">

                    <h1>
                        🏥 MediStock
                    </h1>

                    <p>
                        Create your medical inventory account
                    </p>

                </div>


                <div className="feature-list">

                    <div>
                        💊 Medicine Management
                    </div>

                    <div>
                        🚚 Supplier Management
                    </div>

                    <div>
                        ⚠ Expiry Monitoring
                    </div>

                    <div>
                        📊 Inventory Analytics
                    </div>

                </div>


            </div>


            {/* =================================================
                REGISTER CARD
            ================================================= */}

            <div className="auth-card register-card">


                <div className="medical-icon">
                    💊
                </div>


                <h1 className="title">
                    Create Account
                </h1>


                <p className="register-subtitle">
                    Register for your MediStock account
                </p>


                <form onSubmit={handleSubmit}>


                    {/* FULL NAME */}

                    <div className="input-group">

                        <FaUser />

                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={data.fullName}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* USERNAME */}

                    <div className="input-group">

                        <FaUser />

                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={data.username}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="input-group">

                        <FaEnvelope />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={data.email}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* PHONE */}

                    <div className="input-group">

                        <FaPhone />

                        <input
                            type="text"
                            name="phone"
                            placeholder="Mobile Number"
                            maxLength="10"
                            value={data.phone}
                            onChange={(e) => {

                                const value =
                                    e.target.value.replace(
                                        /\D/g,
                                        ""
                                    );

                                setData({
                                    ...data,
                                    phone: value
                                });

                            }}
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="input-group password-wrapper">

                        <FaLock />

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            name="password"
                            placeholder="Password"
                            value={data.password}
                            onChange={handleChange}
                            required
                        />


                        <button
                            type="button"
                            className="eye-btn"
                            onClick={() =>
                                setShowPassword(
                                    !showPassword
                                )
                            }
                        >

                            {showPassword
                                ? <FaEyeSlash />
                                : <FaEye />
                            }

                        </button>

                    </div>


                    {/* ROLE */}

                    <h3 className="role-title">
                        Choose Account Type
                    </h3>


                    <div className="role-box">


                        {/* ADMIN */}

                        <button
                            type="button"
                            className={
                                data.role === "ADMIN"
                                    ? "role active"
                                    : "role"
                            }
                            onClick={() =>
                                setData({
                                    ...data,
                                    role: "ADMIN"
                                })
                            }
                        >

                            <FaUserShield />

                            <span>
                                Admin
                            </span>

                        </button>


                        {/* PHARMACIST */}

                        <button
                            type="button"
                            className={
                                data.role === "PHARMACIST"
                                    ? "role active"
                                    : "role"
                            }
                            onClick={() =>
                                setData({
                                    ...data,
                                    role: "PHARMACIST"
                                })
                            }
                        >

                            <FaUserNurse />

                            <span>
                                Pharmacist
                            </span>

                        </button>


                        {/* STAFF */}

                        <button
                            type="button"
                            className={
                                data.role === "STAFF"
                                    ? "role active"
                                    : "role"
                            }
                            onClick={() =>
                                setData({
                                    ...data,
                                    role: "STAFF"
                                })
                            }
                        >

                            <FaUserTie />

                            <span>
                                Staff
                            </span>

                        </button>


                    </div>


                    {/* SUBMIT */}

                    <button
                        className="primary-btn"
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating Account..."
                            : "✅ Create Account"
                        }

                    </button>


                </form>


                {/* LOGIN LINK */}

                <div className="link">

                    <Link to="/">

                        Already have an account? Login

                    </Link>

                </div>


            </div>


        </div>

    );

}


export default Register;