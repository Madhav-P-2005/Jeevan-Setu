// Path: jeevansetu-frontend/src/components/dashboard/DonationHistory.jsx
import React from "react";

const DonationHistory = ({ donationHistory = [] }) => {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
      <h3 className="text-lg font-semibold">Donation History</h3>
      {!donationHistory.length ? (
        <p className="text-white/60 mt-2">No donations recorded yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-white/10">
          {donationHistory.map((d, idx) => (
            <li key={idx} className="py-3 flex items-center justify-between">
              <span className="text-white/80">{d?.date ? new Date(d.date).toLocaleDateString() : "—"}</span>
              <span className="text-white/60 text-sm">{d?.notes || "Donation"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DonationHistory;
