// Path :- jeevansetu-frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { clearAccessToken } from "../lib/auth";

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

  // Helpers
  const formatDateTime = (iso) => {
    if (!iso) return "Not provided";
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(iso);
    }
  };

  const roleBadgeClasses = (role) => {
    if (role === "donor") return "bg-green-500/20 text-green-300";
    if (role === "recipient") return "bg-blue-500/20 text-blue-300";
    return "bg-white/10 text-white/80";
  };

  // Render a social link if present, else a subtle placeholder
  const renderSocial = (label, href) => {
    if (href && typeof href === "string" && href.trim().length > 0) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rose-300 hover:text-rose-200 underline underline-offset-4 break-all"
          title={`${label} profile`}
        >
          {href}
        </a>
      );
    }
    return <span className="text-white/60">Not provided</span>;
  };

  // Handle incident updates (refresh data after edit/delete)
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // Even if server fails, clear client session
      console.warn("Logout request failed, clearing client session anyway.");
    } finally {
      clearAccessToken();
      navigate("/login");
    }
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

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information Card */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
              <div className="flex items-center mb-6">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <h2 className="text-xl font-semibold text-white">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/60">Full Name</label>
                    <p className="text-lg text-white/90 font-medium">{profile?.name || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60">Email Address</label>
                    <p className="text-lg text-white/90">{profile?.email || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60">Phone Number</label>
                    <p className="text-lg text-white/90">{profile?.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/60">City</label>
                    <p className="text-lg text-white/90">{profile?.city || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60">State</label>
                    <p className="text-lg text-white/90">{profile?.state || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60">Country</label>
                    <p className="text-lg text-white/90">{profile?.country || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60">Address</label>
                    <p className="text-white/90">
                      {profile?.address?.line1?.trim() || profile?.address?.line2?.trim()
                        ? [profile?.address?.line1, profile?.address?.line2].filter(Boolean).join(", ")
                        : "Not provided"}
                    </p>
                    {profile?.address?.postalCode?.trim() && (
                      <p className="text-white/70 text-sm mt-1">Postal Code: {profile.address.postalCode}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60">Blood Group</label>
                    <p className="text-lg text-white/90">{profile?.bloodGroup || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60">Member Since</label>
                    <p className="text-lg text-white/90">{formatDateTime(profile?.createdAt)}</p>
                  </div>
                </div>
              </div>
              {/* Message */}
              <div className="mt-6">
                <label className="text-sm font-medium text-white/60">Message</label>
                <p className="text-white/90 mt-1 whitespace-pre-line">
                  {profile?.message?.trim() ? profile.message : "Not provided"}
                </p>
              </div>

              {/* Social Links */}
              <div className="mt-6">
                <label className="text-sm font-medium text-white/60">Social Links</label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm text-white/60">Instagram</span>
                    <div className="mt-1">{renderSocial("Instagram", profile?.social?.instagram)}</div>
                  </div>
                  <div>
                    <span className="block text-sm text-white/60">X</span>
                    <div className="mt-1">{renderSocial("X", profile?.social?.x)}</div>
                  </div>
                  <div>
                    <span className="block text-sm text-white/60">Facebook</span>
                    <div className="mt-1">{renderSocial("Facebook", profile?.social?.facebook)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status & Quick Actions */}
          <div className="space-y-6">
            {/* Account Status Card */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-white">Account Status</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">Role</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleBadgeClasses(profile?.role)}`}>
                    {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Citizen"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile?.available ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                    {profile?.available ? "Active" : "Unavailable"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">User ID</span>
                  <span className="text-sm text-white/90 font-mono">#{profile?.id || profile?._id || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">Last Donation</span>
                  <span className="text-sm text-white/90">{profile?.lastDonationAt ? formatDateTime(profile.lastDonationAt) : "Not recorded"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">Updated</span>
                  <span className="text-sm text-white/90">{formatDateTime(profile?.updatedAt)}</span>
                </div>
              </div>
            </div>
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

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 font-semibold tracking-wide"
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 font-semibold tracking-wide"
          >
            Logout
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