import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaArrowLeft, FaLock } from "react-icons/fa";

import api from "../services/api";
import "../styles/ForgotPassword.css";

function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        try {

            setLoading(true);

            const response = await api.post(
                "/auth/forgot-password",
                {
                    email: email.trim()
                }
            );

            setMessage(
                response.data?.message ||
                "A new password has been sent to your email."
            );

        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to reset password. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="forgot-page">

            <div className="forgot-card">

                <div className="forgot-icon">
                    🔐
                </div>

                <h1>MediStock</h1>

                <h2>Forgot Password?</h2>

                <p className="forgot-description">
                    Enter your registered email address.
                    We will send you a new temporary password.
                </p>

                <form onSubmit={handleSubmit}>

                    <label>
                        Email Address
                    </label>

                    <div className="forgot-input">

                        <FaEnvelope />

                        <input
                            type="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                    </div>

                    {message && (
                        <div className="success-message">
                            ✅ {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            ❌ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="reset-password-btn"
                        disabled={loading}
                    >

                        {loading
                            ? "Sending..."
                            : "Send New Password"
                        }

                    </button>

                </form>

                <button
                    className="back-login-btn"
                    onClick={() => navigate("/")}
                >

                    <FaArrowLeft />
                    Back to Login

                </button>

            </div>

        </div>

    );

}

export default ForgotPassword;