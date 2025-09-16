// Path: jeevansetu-frontend/src/components/dashboard/StatusCard.jsx

import React from "react";

const StatusCard = ({
  profile,
  savingAvail,
  savingDate,
  lastDonationInput,
  inlineMsg,
  // helpers
  roleBadgeClasses,
  formatDateTime,
  relativeTime,
  // handlers
  onToggleAvailable,
  onSaveLastDonation,
  onClearLastDonation,
  onCopyId,
  onRefresh,
  onDateChange,
}) => {
  return (
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
            <span className="text-sm text-white/60">Availability</span>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${profile?.available ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                {profile?.available ? "Active" : "Unavailable"}
              </span>
              <div
                role="switch"
                aria-checked={profile?.available ? "true" : "false"}
                tabIndex={0}
                onClick={onToggleAvailable}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleAvailable(); } }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-600 ${profile?.available ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-neutral-700"} ${savingAvail ? "opacity-60" : ""}`}
                title={profile?.available ? "Set Unavailable" : "Set Active"}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${profile?.available ? "translate-x-6" : "translate-x-1"}`}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">User ID</span>
            <span className="text-sm text-white/90 font-mono">#{profile?.id || profile?._id || "—"}</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Last Donation</span>
              <span className="text-sm text-white/90">
                {profile?.lastDonationAt
                  ? (() => {
                      try {
                        return new Date(profile.lastDonationAt).toLocaleDateString();
                      } catch {
                        return String(profile.lastDonationAt);
                      }
                    })()
                  : "Not recorded"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
              <input
                type="date"
                value={lastDonationInput}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full sm:w-auto bg-black/40 border border-white/10 text-white/90 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-600"
              />
              <button
                onClick={onSaveLastDonation}
                disabled={savingDate}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-rose-600"
              >
                {savingDate ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => onClearLastDonation && onClearLastDonation()}
                disabled={savingDate}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 text-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-rose-600"
                title="Clear last donation"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">Updated</span>
            <span className="text-sm text-white/90" title={relativeTime(profile?.updatedAt)}>{formatDateTime(profile?.updatedAt)}</span>
          </div>
        </div>

        {/* Inline status message */}
        {inlineMsg && (
          <div className="mt-3 text-xs text-rose-200 bg-rose-500/10 border border-rose-400/20 rounded-lg px-2 py-1 inline-block">
            {inlineMsg}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onCopyId}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 text-sm"
          >
            Copy ID
          </button>
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
