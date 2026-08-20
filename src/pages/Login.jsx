import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Pill, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

// Yup login validation schema
const schema = yup.object().shape({
  username: yup.string().required("Username or Email is required"),
  password: yup.string().min(5, "Password must be at least 5 characters").required("Password is required"),
});

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage("");
    const result = await login(data.username, data.password);
    if (result.success) {
      toast.success("Welcome back to MediStock!");
      navigate("/");
    } else {
      setErrorMessage(result.error);
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Decorative Clinical Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2f4f6_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-60 z-0" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        {/* Medical Cross Icon */}
        <div className="w-16 h-16 rounded-3xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20 mb-4 animate-bounce">
          <Pill className="w-9 h-9 transform rotate-45" />
        </div>
        
        <h2 className="text-3xl font-extrabold font-display text-center text-slate-800 tracking-tight">
          MediStock
        </h2>
        <p className="mt-1 text-center text-sm font-semibold text-slate-400">
          Medical Inventory Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-slate-100">
          
          {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-150 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-red-600 font-medium">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="font-bold">Login Blocked</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                User ID or Email
              </label>
              <div className="mt-1.5">
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your User ID or Email"
                  {...register("username")}
                  className={`w-full px-4 py-3 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${
                    errors.username ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-brand"
                  }`}
                />
                {errors.username && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-brand hover:text-brand-hover">
                  Forgot?
                </Link>
              </div>
              <div className="mt-1.5">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full px-4 py-3 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${
                    errors.password ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-brand"
                  }`}
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 border border-transparent rounded-2xl text-sm font-extrabold text-white bg-brand hover:bg-brand-hover shadow-lg shadow-brand/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-55 cursor-pointer transition-all"
              >
                {loading ? "Authenticating Session..." : "Secure Login"}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 space-y-3">

            {/* Google OAuth2 Login Button */}
            <button
              type="button"
              onClick={() => {
                window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
              }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
            >
              {/* Google Icon SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-xs text-slate-400 font-medium text-center">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-brand hover:text-brand-hover">
                Register
              </Link>
            </p>
          </div>

        </div>
        
      </div>
    </div>
  );
};

export default Login;
