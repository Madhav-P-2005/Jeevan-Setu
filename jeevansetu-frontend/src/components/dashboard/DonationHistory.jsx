// Path: jeevansetu-frontend/src/components/dashboard/DonationHistory.jsx
import React from "react";

const DonationHistory = ({ donationHistory = [], loading = false, error = "", onRefresh }) => {
  const renderContent = () => {
    if (loading) {
      return <p className="text-white/60 mt-2 text-sm">Loading donation history...</p>;
    }

    if (error) {
      return (
        <div className="mt-3 rounded-lg bg-red-500/10 border border-red-400/30 text-red-200 text-sm px-3 py-2 flex flex-wrap items-center gap-3">
          <span>{error}</span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 rounded-md bg-white/10 text-white/80 hover:bg-white/20 text-xs"
            >
              Retry
            </button>
          )}
        </div>
      );
    }

    if (!donationHistory.length) {
      return <p className="text-white/60 mt-2">No donations recorded yet.</p>;
    }

    return (
      <ul className="mt-4 divide-y divide-white/10">
        {donationHistory.map((d, idx) => (
          <li key={d?._id || idx} className="py-3 flex items-center justify-between">
            <span className="text-white/80">
              {d?.dateOfDonation || d?.date
                ? new Date(d.dateOfDonation || d.date).toLocaleDateString()
                : "—"}
            </span>
            <span className="text-white/60 text-sm">
              {d?.notes?.trim() ? d.notes : d?.followUpNotes?.trim() ? d.followUpNotes : "Donation"}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Donation History</h3>
        {onRefresh && !loading && (
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-xs font-medium"
          >
            Refresh
          </button>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default DonationHistory;
