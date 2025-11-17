import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "../lib/toast";

import api from "../lib/api";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = useMemo(
    () => (params.get("email") || "").trim().toLowerCase(),
    [params]
  );
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ otp, password, confirmPassword }) => {
    if (!email) {
      toast.error("Reset request is missing context. Please start again.");
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      toast.error("Enter the 6-digit OTP we emailed you.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        email,
        otp: otp.trim(),
        password,
      });
      toast.success("Password reset successfully. You can now sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Unable to reset password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black" />
      <div className="absolute inset-0 -z-0">
        <div className="absolute -top-24 right-8 w-72 h-72 rounded-full blur-3xl opacity-30 bg-emerald-500" />
        <div className="absolute -bottom-24 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 bg-teal-500" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 py-16">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8">
          <h1 className="text-3xl font-semibold text-center">Reset password</h1>
          <p className="mt-3 text-sm text-white/70 text-center">
            Enter the OTP we emailed you and set a new password.
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
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white/80 cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                6-digit OTP
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                inputMode="numeric"
                className={`w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-white/40 ${
                  errors.otp ? "ring-emerald-500" : ""
                }`}
                placeholder="123456"
                {...register("otp", {
                  required: "OTP is required",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "OTP must be 6 digits",
                  },
                })}
              />
              {errors.otp && (
                <p className="mt-2 text-sm text-emerald-200">
                  ⚠️ {errors.otp.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                className={`w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-white/40 ${
                  errors.password ? "ring-emerald-500" : ""
                }`}
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "At least 6 characters" },
                })}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-emerald-200">
                  ⚠️ {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-white/40 ${
                  errors.confirmPassword ? "ring-emerald-500" : ""
                }`}
                placeholder="••••••••"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-emerald-200">
                  ⚠️ {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-60 disabled:cursor-not-allowed font-semibold tracking-wide"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/70">
            Back to{" "}
            <Link
              to="/login"
              className="text-emerald-300 hover:text-emerald-200 font-medium"
            >
              login page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
