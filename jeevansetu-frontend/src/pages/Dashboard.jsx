// Path :- jeevansetu-frontend/src/pages/Dashboard.jsx

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { clearAccessToken } from "../lib/auth";
import StatusCard from "../components/dashboard/StatusCard";
import PersonalInfoCard from "../components/dashboard/PersonalInfoCard";
import DonationHistory from "../components/dashboard/DonationHistory";
import QuickStatsCard from "../components/dashboard/QuickStatsCard";
import RecipientRequests from "../components/dashboard/RecipientRequests";
import DonorMatches from "../components/dashboard/DonorMatches";
import useProfile from "../hooks/useProfile";
import useProfileUpdate from "../hooks/useProfileUpdate";
import useDonationHistory from "../hooks/useDonationHistory";
import {
  FiUser,
  FiActivity,
  FiClock,
  FiList,
  FiLogOut,
  FiRefreshCw,
  FiMenu,
  FiX,
  FiTrendingUp,
} from "react-icons/fi";
import toast from "../lib/toast";

const Dashboard = () => {
  // State management for dashboard data
  const { profile, setProfile, loading, error, refresh } = useProfile();
  const {
    savingAvailability,
    savingLastDonation,
    savingProfile,
    updateAvailability,
    updateLastDonation,
    updateProfile,
  } = useProfileUpdate({ setProfile, refresh });
  const [lastDonationInput, setLastDonationInput] = useState("");
  const [inlineMsg, setInlineMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(null);
  const [recipientSummary, setRecipientSummary] = useState({
    total: 0,
    open: 0,
    matched: 0,
    fulfilled: 0,
  });
  const [donorSummary, setDonorSummary] = useState({ total: 0 });
  const navigate = useNavigate();

  const isDonor = profile?.role === "donor";
  const isRecipient = profile?.role === "recipient";

  const {
    donations,
    loading: donationsLoading,
    error: donationsError,
    refresh: refreshDonations,
  } = useDonationHistory(isDonor);

  const donationHistoryData = isDonor
    ? donations
    : profile?.donationHistory || [];
  const donationHistoryLoading = isDonor ? donationsLoading : false;
  const donationHistoryError = isDonor ? donationsError : "";
  const donationHistoryRefresh = isDonor ? refreshDonations : undefined;

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
      setTimeout(() => setInlineMsg(""), 1500);
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

  const handleSectionNav = useCallback((key) => {
    setActiveSection(key);
    setSidebarOpen(false);
  }, []);

  const navItems = useMemo(() => {
    const items = [
      { key: "overview", label: "Overview", icon: FiUser },
      { key: "quick-stats", label: "Quick Stats", icon: FiTrendingUp },
    ];
    if (isRecipient) {
      items.push({
        key: "requests",
        label: "Recipient Requests",
        icon: FiList,
      });
    }
    if (isDonor) {
      items.push({ key: "matches", label: "Donor Matches", icon: FiActivity });
    }
    items.push({ key: "history", label: "History", icon: FiClock });
    return items;
  }, [isDonor, isRecipient]);

  const handleOpenProfileSection = useCallback(
    () => handleSectionNav("overview"),
    [handleSectionNav]
  );
  const handleOpenStatusSection = useCallback(
    () => handleSectionNav("overview"),
    [handleSectionNav]
  );
  const handleOpenQuickStatsSection = useCallback(
    () => handleSectionNav("quick-stats"),
    [handleSectionNav]
  );
  const handleOpenRequestsSection = useCallback(
    () => handleSectionNav("requests"),
    [handleSectionNav]
  );
  const handleOpenMatchesSection = useCallback(
    () => handleSectionNav("matches"),
    [handleSectionNav]
  );

  const beginProfileDraft = useCallback(() => {
    if (!profile) return null;
    return {
      name: profile.name || "",
      phone: profile.phone || "",
      city: profile.city || "",
      state: profile.state || "",
      country: profile.country || "",
      bloodGroup: profile.bloodGroup || "",
      message: profile.message || "",
      addressLine1: profile.address?.line1 || "",
      addressLine2: profile.address?.line2 || "",
      postalCode: profile.address?.postalCode || "",
      instagram: profile.social?.instagram || "",
      x: profile.social?.x || "",
      facebook: profile.social?.facebook || "",
    };
  }, [profile]);

  const handleStartEditProfile = useCallback(() => {
    const draft = beginProfileDraft();
    if (!draft) return;
    handleSectionNav("overview");
    setProfileDraft(draft);
    setEditingProfile(true);
  }, [beginProfileDraft, handleSectionNav]);

  const handleDraftChange = useCallback((key, value) => {
    setProfileDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingProfile(false);
    setProfileDraft(null);
  }, []);

  const handleSaveProfile = useCallback(
    async (event) => {
      event.preventDefault();
      if (!profileDraft) return;
      try {
        await updateProfile(profileDraft);
        toast.success("Profile updated successfully");
        setEditingProfile(false);
        setProfileDraft(null);
      } catch (err) {
        const message =
          err?.response?.data?.message || "Failed to update profile";
        toast.error(message);
      }
    },
    [profileDraft, updateProfile]
  );

  // Logout handler
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // Even if server fails, clear client session
      console.warn("Logout request failed, clearing client session anyway.");
    } finally {
      clearAccessToken();
      toast.info("You have been logged out safely.");
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
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-white/10 bg-neutral-900/90 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-label="Dashboard navigation"
      >
        <div className="flex h-full flex-col">
          <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-orange-500 flex items-center justify-center shadow-lg">
                <span role="img" aria-label="Hospital" className="text-lg">
                  🏥
                </span>
              </div>
              <div>
                <p className="text-xs text-white/50">Welcome</p>
                <p className="text-sm font-semibold text-white/90 truncate max-w-[140px]">
                  {profile?.name || "Jeevan Setu"}
                </p>
              </div>
            </div>
            <button
              className="lg:hidden text-white/70 hover:text-white"
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-2">
              {navItems.map(({ key, label, icon: Icon }) => {
                const isActive = activeSection === key;
                return (
                  <li key={key}>
                    <button
                      onClick={() => handleSectionNav(key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                        isActive
                          ? "bg-rose-500/20 border-rose-400/40 text-white"
                          : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? "text-rose-200" : "text-rose-300"
                        }`}
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-white/10 px-6 py-5 space-y-3">
            <button
              onClick={handleRefresh}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/85 hover:bg-white/10 transition"
            >
              <FiRefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-sm font-semibold"
            >
              <FiLogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-900 to-black" />
        <div className="absolute -top-24 right-10 w-64 h-64 rounded-full blur-3xl opacity-30 bg-rose-600" />
        <div className="absolute -bottom-24 left-10 w-64 h-64 rounded-full blur-3xl opacity-20 bg-red-500" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 backdrop-blur-md bg-black/20 border-b border-white/10">
            <div className="flex items-center justify-between px-4 sm:px-8 py-5">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open navigation"
                >
                  <FiMenu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs sm:text-sm text-white/60">Dashboard</p>
                  <h1 className="text-lg sm:text-xl font-semibold text-white/90">
                    Namaste, {profile?.name || "User"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  <FiRefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3 py-2 text-sm font-semibold hover:from-red-700 hover:to-rose-700"
                >
                  <FiLogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-12">
            {activeSection === "overview" && (
              <section className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-white/90">
                    Your Overview
                  </h2>
                  <p className="text-sm text-white/60">
                    Quick glance at your personal details and availability.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6">
                    {editingProfile && profileDraft ? (
                      <form
                        onSubmit={handleSaveProfile}
                        className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 space-y-6"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                            <h2 className="text-xl font-semibold text-white">
                              Edit Personal Information
                            </h2>
                          </div>
                          <span className="text-sm text-white/60">
                            Fields marked * are required
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={profileDraft.name}
                              onChange={(e) =>
                                handleDraftChange("name", e.target.value)
                              }
                              required
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Phone *
                            </label>
                            <input
                              type="tel"
                              value={profileDraft.phone}
                              onChange={(e) =>
                                handleDraftChange("phone", e.target.value)
                              }
                              required
                              pattern="^\d{10}$"
                              title="Enter 10 digit number"
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Blood Group *
                            </label>
                            <select
                              value={profileDraft.bloodGroup}
                              onChange={(e) =>
                                handleDraftChange("bloodGroup", e.target.value)
                              }
                              required
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            >
                              <option value="" disabled>
                                Select blood group
                              </option>
                              {[
                                "A+",
                                "A-",
                                "B+",
                                "B-",
                                "AB+",
                                "AB-",
                                "O+",
                                "O-",
                              ].map((group) => (
                                <option key={group} value={group}>
                                  {group}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={profile?.email || ""}
                              readOnly
                              className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white/70 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              value={profileDraft.city}
                              onChange={(e) =>
                                handleDraftChange("city", e.target.value)
                              }
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              State
                            </label>
                            <input
                              type="text"
                              value={profileDraft.state}
                              onChange={(e) =>
                                handleDraftChange("state", e.target.value)
                              }
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Country
                            </label>
                            <input
                              type="text"
                              value={profileDraft.country}
                              onChange={(e) =>
                                handleDraftChange("country", e.target.value)
                              }
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              value={profileDraft.postalCode}
                              onChange={(e) =>
                                handleDraftChange("postalCode", e.target.value)
                              }
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Address Line 1
                            </label>
                            <input
                              type="text"
                              value={profileDraft.addressLine1}
                              onChange={(e) =>
                                handleDraftChange(
                                  "addressLine1",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              placeholder="Street, Area, Landmark"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Address Line 2
                            </label>
                            <input
                              type="text"
                              value={profileDraft.addressLine2}
                              onChange={(e) =>
                                handleDraftChange(
                                  "addressLine2",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              placeholder="Apartment, suite, etc. (optional)"
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Message
                            </label>
                            <textarea
                              rows={3}
                              value={profileDraft.message}
                              onChange={(e) =>
                                handleDraftChange("message", e.target.value)
                              }
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              placeholder="Share a note for recipients or donors"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-white/80 mb-2">
                                Instagram
                              </label>
                              <input
                                type="url"
                                value={profileDraft.instagram}
                                onChange={(e) =>
                                  handleDraftChange("instagram", e.target.value)
                                }
                                placeholder="https://instagram.com/username"
                                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/80 mb-2">
                                X
                              </label>
                              <input
                                type="url"
                                value={profileDraft.x}
                                onChange={(e) =>
                                  handleDraftChange("x", e.target.value)
                                }
                                placeholder="https://x.com/username"
                                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-white/80 mb-2">
                                Facebook
                              </label>
                              <input
                                type="url"
                                value={profileDraft.facebook}
                                onChange={(e) =>
                                  handleDraftChange("facebook", e.target.value)
                                }
                                placeholder="https://facebook.com/username"
                                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 font-semibold disabled:opacity-60"
                          >
                            {savingProfile ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <PersonalInfoCard
                        profile={profile}
                        formatDateTime={formatDateTime}
                      />
                    )}
                  </div>
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
              </section>
            )}

            {activeSection === "quick-stats" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white/90">
                    Quick Stats
                  </h2>
                  <p className="text-sm text-white/60">
                    Key metrics, cooldown status, and actionable tips tailored
                    to your role.
                  </p>
                </div>
                <QuickStatsCard
                  profile={profile}
                  savingAvailability={savingAvailability}
                  onToggleAvailable={onToggleAvailable}
                  onCopyId={onCopyId}
                  onRefresh={handleRefresh}
                  onOpenOverview={handleOpenProfileSection}
                  onStartEditProfile={handleStartEditProfile}
                  onOpenStatus={handleOpenStatusSection}
                  onOpenMatches={handleOpenMatchesSection}
                  onOpenRequests={handleOpenRequestsSection}
                  formatDateTime={formatDateTime}
                  relativeTime={relativeTime}
                  donorMatchesCount={donorSummary.total}
                  recipientRequestCount={recipientSummary.total}
                  isDonor={isDonor}
                  isRecipient={isRecipient}
                />
              </section>
            )}

            {activeSection === "requests" && isRecipient && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white/90">
                    Recipient Requests
                  </h2>
                  <p className="text-sm text-white/60">
                    Track and manage the help you have requested.
                  </p>
                </div>
                <RecipientRequests
                  profile={profile}
                  onSummaryChange={(summary) => setRecipientSummary(summary)}
                />
              </section>
            )}

            {activeSection === "matches" && isDonor && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white/90">
                    Donor Matches
                  </h2>
                  <p className="text-sm text-white/60">
                    Potential recipients waiting for your donation.
                  </p>
                </div>
                <DonorMatches
                  profile={profile}
                  onSummaryChange={(summary) => setDonorSummary(summary)}
                />
              </section>
            )}

            {activeSection === "history" && (
              <section className="space-y-6 pb-8">
                <div>
                  <h2 className="text-2xl font-semibold text-white/90">
                    Donation History
                  </h2>
                  <p className="text-sm text-white/60">
                    A timeline of your previous donations and activity.
                  </p>
                </div>
                <DonationHistory
                  donationHistory={donationHistoryData}
                  loading={donationHistoryLoading}
                  error={donationHistoryError}
                  onRefresh={donationHistoryRefresh}
                />
              </section>
            )}
          </main>

          <footer className="px-4 sm:px-8 py-6 text-sm text-white/50 border-t border-white/10 bg-black/30">
            Jeevan Setu • Last updated: {new Date().toLocaleString()}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
