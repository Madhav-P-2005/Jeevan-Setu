import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "../lib/toast";

import api from "../lib/api";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = useMemo(
    () => (location.state?.email || "").trim().toLowerCase(),
    [location.state]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      email: initialEmail,
      otp: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const emailValue = watch("email");

  useEffect(() => {
    if (initialEmail) {
      setValue("email", initialEmail);
    }
  }, [initialEmail, setValue]);

  useEffect(() => {
    if (resendTimer <= 0) return undefined;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const onSubmit = async ({ email, otp }) => {
    const emailNorm = (email || "").trim().toLowerCase();
    const otpTrim = (otp || "").trim();

    if (!emailNorm || !otpTrim) {
      toast.error("Please provide your email and the OTP.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/auth/verify-email", {
        email: emailNorm,
        otp: otpTrim,
      });
      toast.success("Email verified! You can now sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Unable to verify email";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    const emailNorm = (emailValue || "").trim().toLowerCase();
    if (!emailNorm) {
      toast.error("Enter your email to resend the OTP.");
      return;
    }

    try {
      setResending(true);
      await api.post("/auth/resend-otp", { email: emailNorm });
      toast.success("A new OTP has been sent to your email.");
      setResendTimer(60);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Unable to resend OTP";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-900 to-black" />
      <div className="absolute inset-0 -z-0">
        <div className="absolute -top-24 left-10 w-72 h-72 rounded-full blur-3xl opacity-30 bg-rose-500" />
        <div className="absolute -bottom-24 right-10 w-72 h-72 rounded-full blur-3xl opacity-20 bg-orange-500" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 py-16">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8">
          <h1 className="text-3xl font-semibold text-center">
            Verify your email
          </h1>
          <p className="mt-3 text-sm text-white/70 text-center">
            Enter the 6-digit OTP sent to your inbox to activate your JeevanSetu
            account.
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
                className={`w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40 ${
                  errors.email ? "ring-rose-500" : ""
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
                <p className="mt-2 text-sm text-rose-200">
                  ⚠️ {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                One-Time Password (OTP)
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className={`tracking-widest text-lg text-center w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40 ${
                  errors.otp ? "ring-rose-500" : ""
                }`}
                placeholder="000000"
                {...register("otp", {
                  required: "OTP is required",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "Enter the 6 digit code",
                  },
                })}
              />
              {errors.otp && (
                <p className="mt-2 text-sm text-rose-200">
                  ⚠️ {errors.otp.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 disabled:opacity-60 disabled:cursor-not-allowed font-semibold tracking-wide"
            >
              {submitting ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/70">
            Didn&apos;t receive the code?
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || resending}
              className="ml-1 text-rose-300 hover:text-rose-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resending
                ? "Sending..."
                : resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : "Resend OTP"}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-white/70">
            Already verified?
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="ml-1 text-rose-300 hover:text-rose-200 font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
