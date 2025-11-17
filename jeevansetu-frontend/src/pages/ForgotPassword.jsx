import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "../lib/toast";

import api from "../lib/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
    },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ email }) => {
    try {
      setLoading(true);
      const payload = { email: (email || "").trim().toLowerCase() };
      if (!payload.email) {
        throw new Error("Email is required");
      }
      await api.post("/auth/forgot-password", payload);
      toast.success("If the email exists, an OTP has been emailed.");
      reset();
      navigate(`/reset-password?email=${encodeURIComponent(payload.email)}`);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Unable to send reset email";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black" />
      <div className="absolute inset-0 -z-0">
        <div className="absolute -top-24 left-6 w-72 h-72 rounded-full blur-3xl opacity-30 bg-blue-500" />
        <div className="absolute -bottom-24 right-10 w-72 h-72 rounded-full blur-3xl opacity-20 bg-cyan-400" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 py-16">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8">
          <h1 className="text-3xl font-semibold text-center">
            Forgot password
          </h1>
          <p className="mt-3 text-sm text-white/70 text-center">
            Enter the email linked to your JeevanSetu account and we'll send you
            reset instructions.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/40 ${
                  errors.email ? "ring-blue-500" : ""
                }`}
                placeholder="you@example.com"
                {...register("email", {
                  required: "Email is required",
                  maxLength: {
                    value: 50,
                    message: "Email must be under 50 characters",
                  },
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-blue-200">
                  ⚠️ {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed font-semibold tracking-wide"
            >
              {loading ? "Sending instructions..." : "Send reset link"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/70">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="text-blue-300 hover:text-blue-200 font-medium"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
