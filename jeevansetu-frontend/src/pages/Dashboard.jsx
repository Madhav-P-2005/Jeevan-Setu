// Path :- jeevansetu-frontend/src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { clearAccessToken } from "../lib/auth";
import StatusCard from "../components/dashboard/StatusCard";
import PersonalInfoCard from "../components/dashboard/PersonalInfoCard";
import DonationHistory from "../components/dashboard/DonationHistory";
import useProfile from "../hooks/useProfile";
import useProfileUpdate from "../hooks/useProfileUpdate";

const Dashboard = () => {
  // State management for dashboard data
  const { profile, setProfile, loading, error, refresh } = useProfile();
  const {
    savingAvailability,
    savingLastDonation,
    updateAvailability,
    updateLastDonation,
    updateProfile,
  } = useProfileUpdate({ setProfile, refresh });
  const [lastDonationInput, setLastDonationInput] = useState("");
  const [inlineMsg, setInlineMsg] = useState("");
  const navigate = useNavigate();

  // Prime date input from loaded profile
  useEffect(() => {
    if (!profile) return;
    if (profile?.lastDonationAt) {
      try {
        const d = new Date(profile.lastDonationAt);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setLastDonationInput(`${yyyy}-${mm}-${dd}`);
      } catch {}
    } else {
      setLastDonationInput("");
    }
  }, [profile]);

  // M1 handlers
  const onToggleAvailable = async () => {
    if (!profile) return;
    const next = !profile.available;
    setInlineMsg("");
    try {
      await updateAvailability(next);
      setInlineMsg("Availability updated");
    } catch {
      setInlineMsg("Failed to update availability");
    } finally {
      setTimeout(() => setInlineMsg(""), 2000);
    }
  };

  const onSaveLastDonation = async () => {
    if (savingLastDonation) return;
    setInlineMsg("");
    try {
      await updateLastDonation(lastDonationInput || null);
      setInlineMsg("Last donation saved");
    } catch {
      setInlineMsg("Failed to save date");
    } finally {
      setTimeout(() => setInlineMsg(""), 2000);
    }
  };

  const onClearLastDonation = async () => {
    if (savingLastDonation) return;
    setInlineMsg("");
    try {
      await updateLastDonation(null);
      setLastDonationInput("");
      setInlineMsg("Last donation cleared");
    } catch {
      setInlineMsg("Failed to clear date");
    } finally {
      setTimeout(() => setInlineMsg(""), 2000);
    }
  };

  const onCopyId = async () => {
    try {
      await navigator.clipboard.writeText(profile?.id || profile?._id || "");
      setInlineMsg("ID copied");
      setTimeout(() => setInlineMsg(""), 1500);
    } catch {
      setInlineMsg("Copy failed");
      setTimeout(() => setInlineMsg("") , 1500);
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

  // Relative time helper for tooltip
  const relativeTime = (iso) => {
    if (!iso) return "";
    const now = Date.now();
    const t = new Date(iso).getTime();
    const diff = Math.max(0, Math.floor((now - t) / 1000));
    if (diff < 60) return `${diff}s ago`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
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
    refresh();
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
            <PersonalInfoCard profile={profile} formatDateTime={formatDateTime} />
          </div>

          {/* Account Status & Quick Actions */}
          <div className="space-y-6">
            <StatusCard
              profile={profile}
              savingAvail={savingAvailability}
              savingDate={savingLastDonation}
              lastDonationInput={lastDonationInput}
              inlineMsg={inlineMsg}
              roleBadgeClasses={roleBadgeClasses}
              formatDateTime={formatDateTime}
              relativeTime={relativeTime}
              onToggleAvailable={onToggleAvailable}
              onSaveLastDonation={onSaveLastDonation}
              onClearLastDonation={onClearLastDonation}
              onCopyId={onCopyId}
              onRefresh={handleRefresh}
              onDateChange={(v) => setLastDonationInput(v)}
            />
          </div>
        </div>

        <DonationHistory donationHistory={profile?.donationHistory} />

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