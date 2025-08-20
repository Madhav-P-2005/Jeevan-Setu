// Path :- jeevansetu-frontend/src/pages/Login.jsx


import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../lib/api";
import { setAccessToken } from "../lib/auth";
import { BiDonateBlood } from "react-icons/bi";
import { FaLock } from "react-icons/fa";

const Login = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      const payload = {
        email: (data.email || "").trim().toLowerCase(),
        password: data.password,
      };
      const res = await api.post("/auth/login", payload);
      const token = res?.data?.data?.accessToken || res?.data?.accessToken;
      if (!token) throw new Error("No access token returned");
      setAccessToken(token);
      const redirectTo = location.state?.from?.pathname || "/profile";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-900 to-black" />
      <div className="absolute inset-0 -z-0">
        <div className="absolute -top-24 right-10 w-64 h-64 rounded-full blur-3xl opacity-30 bg-rose-600" />
        <div className="absolute -bottom-24 left-10 w-64 h-64 rounded-full blur-3xl opacity-20 bg-red-500" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 py-16 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-orange-500 flex items-center justify-center shadow-2xl">
            <BiDonateBlood className="w-7 h-7 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Welcome back</h2>
          <p className="mt-1 text-white/70 text-sm">Sign in to जीवन Setu</p>
        </div>

        <div className="mt-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email address
              </label>
              <input
                id="email"
                {...register("email", {
                  required: "Email Address is required",
                  maxLength: 50,
                  minLength: 3,
                })}
                className={`w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40 ${errors.email ? "ring-rose-500" : ""}`}
                type="email"
                placeholder="you@example.com"
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-rose-300 flex items-center">⚠️ {errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-white/90">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-rose-300 hover:text-rose-200">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  {...register("password", { required: "Password is required" })}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-10 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40 ${errors.password ? "ring-rose-500" : ""}`}
                />
                <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-rose-300 flex items-center">⚠️ {errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-200 text-sm px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold tracking-wide"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/70">
            Don’t have an account?{' '}
            <Link to="/register" className="text-rose-300 hover:text-rose-200 font-medium">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;