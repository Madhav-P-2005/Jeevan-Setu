// Path :- jeevansetu-frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const Dashboard = () => {
  // State management for dashboard data
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch all dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);

  // Function to fetch dashboard data (can be called to refresh)
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch authenticated user's profile
      const profileResponse = await api.get("/auth/profile");
      const user = profileResponse?.data?.data?.user || null;
      setProfile(user);
      setError("");

      console.log("✅ Dashboard data loaded successfully");
      console.log("📊 Profile:", user);
    } catch (err) {
      console.error("❌ Error loading dashboard data:", err);

      if (err.response?.status === 401) {
        setError("Please log in to access the dashboard.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle incident updates (refresh data after edit/delete)
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center text-white/80">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading your dashboard...</p>
          <p className="text-sm text-white/60">Fetching your profile</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 text-rose-200 p-6 max-w-md w-full text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-2 px-4 rounded-lg hover:from-red-700 hover:to-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-900 to-black" />
      <div className="absolute inset-0 -z-0">
        <div className="absolute -top-24 right-10 w-64 h-64 rounded-full blur-3xl opacity-30 bg-rose-600" />
        <div className="absolute -bottom-24 left-10 w-64 h-64 rounded-full blur-3xl opacity-20 bg-red-500" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-orange-500 flex items-center justify-center shadow-2xl">
            <span className="text-xl">🏥</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Welcome, {profile?.name || "User"}</h2>
          <p className="mt-1 text-white/70 text-sm">Your Jeevan Setu dashboard</p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
            <p className="text-white/60 text-sm">Role</p>
            <p className="text-xl font-semibold mt-1 capitalize">{profile?.role || "citizen"}</p>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
            <p className="text-white/60 text-sm">Blood Group</p>
            <p className="text-xl font-semibold mt-1">{profile?.bloodGroup || "-"}</p>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
            <p className="text-white/60 text-sm">Location</p>
            <p className="text-xl font-semibold mt-1">{profile?.location || "-"}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
          <h3 className="text-lg font-semibold">Donation History</h3>
          {!profile?.donationHistory?.length ? (
            <p className="text-white/60 mt-2">No donations recorded yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/10">
              {profile.donationHistory.map((d, idx) => (
                <li key={idx} className="py-3 flex items-center justify-between">
                  <span className="text-white/80">{d?.date ? new Date(d.date).toLocaleDateString() : "—"}</span>
                  <span className="text-white/60 text-sm">{d?.notes || "Donation"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button onClick={handleRefresh} className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 font-semibold tracking-wide">
            Refresh
          </button>
        </div>

        <div className="mt-10 text-center text-sm text-white/50">
          Jeevan Setu • Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;