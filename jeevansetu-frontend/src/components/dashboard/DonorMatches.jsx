// jeevansetu-frontend/src/components/dashboard/DonorMatches.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiDroplet, FiClock, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import useRequests from "../../hooks/useRequests";
import useRequestActions from "../../hooks/useRequestActions";
import toast from "../../lib/toast";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = [
  { label: "Any", value: "" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const renderSocialLink = (label, href) => {
  if (!href || typeof href !== "string" || href.trim().length === 0) {
    return null;
  }

  return (
    <a
      key={label}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-xs text-white/80 hover:bg-white/15 border border-white/10"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <span>{label}</span>
    </a>
  );
};

export default function DonorMatches({ profile, onSummaryChange }) {
  const [filters, setFilters] = useState({
    bloodGroup: profile?.bloodGroup || "",
    location: profile?.city || "",
    urgencyLevel: "",
  });

  const {
    requests,
    loading,
    error,
    refresh,
    setFilters: updateFilters,
  } = useRequests({
    status: "open",
    bloodGroup: filters.bloodGroup,
    location: filters.location,
  });

  const {
    loading: actionLoading,
    error: actionError,
    matchRequest,
  } = useRequestActions({ refresh });

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    updateFilters({ [key]: value });
  };

  const formattedRequests = useMemo(() => requests, [requests]);

  const prevCountRef = useRef(requests.length);
  useEffect(() => {
    if (!onSummaryChange) return;
    if (prevCountRef.current === requests.length) return;
    prevCountRef.current = requests.length;
    onSummaryChange({ total: requests.length });
  }, [onSummaryChange, requests.length]);

  const handleMatch = async (id) => {
    try {
      await matchRequest(id);
      toast.success("Request matched! Contact the recipient soon.");
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to match request";
      toast.error(message);
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-b from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.65)] p-6 space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FiDroplet className="text-rose-300" />
              <span>Open Requests Near You</span>
            </h3>
            <p className="text-sm text-white/60">
              Filter and match to help someone in urgent need of plasma.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/60 bg-black/40 border border-white/10 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>
              {formattedRequests.length || 0} active request
              {formattedRequests.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-xs text-white/60 uppercase">Blood Group</label>
          <select
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90"
            value={filters.bloodGroup}
            onChange={(e) => onFilterChange("bloodGroup", e.target.value)}
          >
            <option value="">Any</option>
            {BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/60 uppercase">Urgency</label>
          <select
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90"
            value={filters.urgencyLevel}
            onChange={(e) => onFilterChange("urgencyLevel", e.target.value)}
          >
            {URGENCY_LEVELS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/60 uppercase">Location</label>
          <input
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90"
            value={filters.location}
            onChange={(e) => onFilterChange("location", e.target.value)}
            placeholder="City or state"
          />
        </div>
      </div>

      {(error || actionError) && (
        <div className="rounded-lg bg-red-500/10 border border-red-400/40 text-red-200 text-sm px-3 py-2">
          {actionError || error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-white/50 flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          Loading requests...
        </p>
      )}

      {!loading && !formattedRequests.length && (
        <p className="text-sm text-white/60">
          No matching requests found right now.
        </p>
      )}

      <div className="space-y-4">
        {formattedRequests.map((req) => {
          const requester = req.requestedBy || {};
          const socialLinks = [
            { label: "Instagram", href: requester?.social?.instagram },
            { label: "X", href: requester?.social?.x },
            { label: "Facebook", href: requester?.social?.facebook },
          ]
            .map(({ label, href }) => renderSocialLink(label, href))
            .filter(Boolean);

          return (
            <div
              key={req._id || req.id}
              className="rounded-2xl bg-black/50 border border-white/10 p-4 flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <FiUser className="text-emerald-300" />
                    <span>{req.patientName}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-white/70 flex items-center gap-1">
                    <FiClock className="text-white/50" />
                    <span>
                      Needed by {new Date(req.neededBy).toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-200 border border-blue-500/40">
                    {req.urgencyLevel.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide bg-emerald-500/10 text-emerald-200 border border-emerald-400/40">
                    Plasma Request
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs sm:text-sm text-white/75">
                <div className="flex items-center gap-2">
                  <FiDroplet className="text-rose-300" />
                  <div>
                    <p className="text-[11px] uppercase text-white/50">Blood</p>
                    <p className="font-semibold text-white/90">
                      {req.bloodGroup}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-amber-300" />
                  <div>
                    <p className="text-[11px] uppercase text-white/50">
                      Quantity
                    </p>
                    <p className="font-semibold text-white/90">
                      {req.quantityRequired} ml
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-sky-300" />
                  <div>
                    <p className="text-[11px] uppercase text-white/50">
                      Location
                    </p>
                    <p className="font-semibold text-white/90 line-clamp-1">
                      {req.location}
                    </p>
                  </div>
                </div>
                {req.contactPhone && (
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-emerald-300" />
                    <div>
                      <p className="text-[11px] uppercase text-white/50">
                        Contact
                      </p>
                      <p className="font-semibold text-white/90">
                        {req.contactPhone}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {req.hospitalName && (
                <p className="text-xs sm:text-sm text-white/70">
                  <span className="font-semibold text-white/85">Hospital:</span>{" "}
                  <span className="text-white/90">{req.hospitalName}</span>
                </p>
              )}

              {req.notes && (
                <p className="text-xs sm:text-sm text-white/65 border-l border-white/20 pl-3">
                  {req.notes}
                </p>
              )}

              {(requester?.email || socialLinks.length > 0) && (
                <div className="border-t border-white/10 pt-3 space-y-2 text-xs sm:text-sm">
                  <p className="text-white/70 font-medium flex items-center gap-2">
                    <FiUser className="text-emerald-300" />
                    <span>Recipient contact details</span>
                  </p>
                  {requester?.email && (
                    <div className="text-white/80">
                      Email:{" "}
                      <a
                        href={`mailto:${requester.email}`}
                        className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
                      >
                        {requester.email}
                      </a>
                    </div>
                  )}
                  {socialLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-white/70">
                      {socialLinks}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => handleMatch(req._id || req.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 font-semibold text-sm flex items-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.45)]"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Matching..." : "Match & Offer Help"}
                </button>
                <button
                  onClick={refresh}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white/80 hover:bg-white/10 text-xs sm:text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
