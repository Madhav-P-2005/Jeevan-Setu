// Path :- jeevansetu-frontend/src/pages/Register.jsx


import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../lib/api";
import { setAccessToken } from "../lib/auth";
import { BiDonateBlood } from "react-icons/bi";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
      role: "donor",
      bloodGroup: "A+",
      country: "",
      state: "",
      city: "",
      address: "",
      phone: "",
      message: "",
      available: true,
      lastDonationAt: "",
    },
  });

  const onSubmit = async (data) => {
    if (data.password !== data.confirm_password) {
      setFormError("confirm_password", { message: "Passwords do not match" });
      setSubmitError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setSubmitError("");
      const payload = {
        name: data.name,
        email: (data.email || "").trim().toLowerCase(),
        password: data.password,
        role: data.role, // 'donor' | 'recipient'
        bloodGroup: data.bloodGroup,
        available: !!data.available,
        country: (data.country || "").trim(),
        state: (data.state || "").trim(),
        city: (data.city || "").trim(),
        phone: (data.phone || "").trim(),
        message: (data.message || "").trim(),
      };

      if (data.lastDonationAt) {
        payload.lastDonationAt = data.lastDonationAt;
      }

      // Include single address if provided
      if (data.address && data.address.trim()) {
        payload.address = data.address.trim();
      }

      const res = await api.post("/auth/register", payload);
      const token = res?.data?.data?.accessToken || res?.data?.accessToken;
      if (!token) throw new Error("No access token returned");

      setAccessToken(token);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed";
      setSubmitError(msg);
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

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-orange-500 flex items-center justify-center shadow-2xl">
            <BiDonateBlood className="w-7 h-7 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Create your account</h2>
          <p className="mt-1 text-white/70 text-sm">Join the जीवन Setu family</p>
        </div>

        <div className="mt-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Full Name</label>
                <input
                  {...register("name", { required: "Full name is required" })}
                  type="text"
                  className={`w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40 ${errors.name ? "ring-rose-500" : ""}`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-rose-300">⚠️ {errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Email Address</label>
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  className={`w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40 ${errors.email ? "ring-rose-500" : ""}`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-rose-300">⚠️ {errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Password</label>
                <input
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "At least 6 characters" } })}
                  type="password"
                  className={`w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40 ${errors.password ? "ring-rose-500" : ""}`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-rose-300">⚠️ {errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Confirm Password</label>
                <input
                  {...register("confirm_password", { required: "Confirm your password" })}
                  type="password"
                  className={`w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40 ${errors.confirm_password ? "ring-rose-500" : ""}`}
                  placeholder="••••••••"
                />
                {errors.confirm_password && (
                  <p className="mt-2 text-sm text-rose-300">⚠️ {errors.confirm_password.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Role</label>
                <select
                  {...register("role", { required: true })}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="donor">👤 Donor</option>
                  <option value="recipient">🏥 Recipient</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Blood Group</label>
                <select
                  {...register("bloodGroup", { required: "Blood group is required" })}
                  className={`w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 ${errors.bloodGroup ? "ring-rose-500" : ""}`}
                >
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
                {errors.bloodGroup && (
                  <p className="mt-2 text-sm text-rose-300">⚠️ {errors.bloodGroup.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Phone (optional)</label>
                <input
                  {...register("phone", { pattern: { value: /^\d{10}$/, message: "Enter 10 digit number" } })}
                  type="tel"
                  className={`w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40 ${errors.phone ? "ring-rose-500" : ""}`}
                  placeholder="9876543210"
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-rose-300">⚠️ {errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Country</label>
                <input
                  {...register("country")}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40"
                  placeholder="India"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">State</label>
                <input
                  {...register("state")}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40"
                  placeholder="Karnataka"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">City</label>
                <input
                  {...register("city")}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40"
                  placeholder="Hubballi"
                />
              </div>
            </div>

            {/* Address (optional) */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Address (optional)</label>
                <input
                  {...register("address")}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40"
                  placeholder="Street, Area, Landmark"
                />
              </div>
            </div>

            {/* Additional info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Message (optional)</label>
                <textarea
                  {...register("message")}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40"
                  placeholder="Any info for recipients or donors"
                />
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Available to donate?</label>
                  <label className="inline-flex items-center gap-3 select-none">
                    <input type="checkbox" {...register("available")} className="h-4 w-4 rounded border-white/20 bg-black/40" />
                    <span className="text-white/80 text-sm">Keep me available for requests</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Last Donation (optional)</label>
                  <input
                    {...register("lastDonationAt")}
                    type="date"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-white/40"
                  />
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-200 text-sm px-3 py-2">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold tracking-wide"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/70">
            Already have an account?{' '}
            <Link to="/login" className="text-rose-300 hover:text-rose-200 font-medium">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;