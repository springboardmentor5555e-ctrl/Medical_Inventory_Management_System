import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Pill, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

/**
 * OAuth2 Callback Page
 * The backend redirects here after a successful Google login with user data in URL params.
 * This page reads the params, stores the session, and navigates to the dashboard.
 */
export const OAuth2Callback = () => {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token    = searchParams.get("token");
    const id       = searchParams.get("id");
    const username = searchParams.get("username");
    const email    = searchParams.get("email");
    const fullName = searchParams.get("fullName");
    const role     = searchParams.get("role");
    const status   = searchParams.get("status");

    if (token && username) {
      loginWithToken({ token, id, username, email, fullName, role, status });
      toast.success(`Welcome, ${fullName}! Logged in via Google.`);
      navigate("/", { replace: true });
    } else {
      setError("Google login failed. No session token received. Please try again.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Google Login Failed</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-2xl bg-brand text-white text-sm font-bold"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-brand text-white flex items-center justify-center shadow-lg mx-auto animate-pulse">
          <Pill className="w-9 h-9 transform rotate-45" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default OAuth2Callback;
