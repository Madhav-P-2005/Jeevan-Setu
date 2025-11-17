// Path: jeevansetu-frontend/src/components/dashboard/QuickStatsCard.jsx
import React from "react";

const Badge = ({ children, tone = "neutral" }) => {
  const tones = {
    success: "bg-green-500/20 text-green-300",
    warn: "bg-yellow-500/20 text-yellow-300",
    neutral: "bg-white/10 text-white/80",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone] || tones.neutral}`}>
      {children}
    </span>
  );
};

const KPI = ({ label, value, tooltip, infoTooltip }) => (
  <div className="rounded-xl bg-black/30 border border-white/10 p-3 flex flex-col gap-1 min-h-[72px] justify-center">
    <div className="text-xs text-white/60 inline-flex items-center gap-1">
      <span>{label}</span>
      {infoTooltip && (
        <span className="text-white/50 hover:text-white/80 cursor-help" title={infoTooltip} aria-label="Info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 7a1.25 1.25 0 110-2.5A1.25 1.25 0 0112 9zm-1.5 2.25h3v6h-3v-6z"/>
          </svg>
        </span>
      )}
    </div>
    <div className="text-white/90 text-sm font-medium" title={tooltip}>{value}</div>
  </div>
);

const QuickStatsCard = ({
  profile,
  savingAvailability,
  onToggleAvailable,
  onCopyId,
  onRefresh,
  onOpenOverview,
  onStartEditProfile,
  onOpenStatus,
  onOpenMatches,
  onOpenRequests,
  formatDateTime,
  relativeTime,
  donorMatchesCount = 0,
  recipientRequestCount = 0,
  isDonor = false,
  isRecipient = false,
}) => {
  const lastDonationDate = profile?.lastDonationAt ? new Date(profile.lastDonationAt) : null;
  const lastDonationValue = lastDonationDate
    ? `${relativeTime(profile.lastDonationAt)}`
    : "Not recorded";

  const memberSinceValue = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      })
    : "—";

  const availabilityTone = profile?.available ? "success" : "warn";

  // Eligibility (frontend only): default cooldown 56 days after last donation
  const cooldownDays = 56;
  const formatDDMonYYYY = (d) => {
    try {
      const day = String(d.getDate()).padStart(2, "0");
      const mon = d.toLocaleString("en-GB", { month: "short" });
      const y = d.getFullYear();
      return `${day} ${mon} ${y}`;
    } catch {
      return String(d);
    }
  };
  let nextEligibleStr = "—";
  let nextEligibleTooltip = undefined;
  let eligibilityLabel = "Add last donation";
  let eligibilityTooltip = "Add your last donation date in the overview card to track eligibility.";
  let eligibilityTone = "warn";
  if (lastDonationDate) {
    const next = new Date(lastDonationDate.getTime() + cooldownDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const msDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.ceil((next.getTime() - now.getTime()) / msDay);
    nextEligibleTooltip = next.toLocaleString();
    if (diffDays <= 0) {
      nextEligibleStr = formatDDMonYYYY(next);
      eligibilityLabel = "Eligible now";
      eligibilityTooltip = "You're outside the 56 day cooldown window.";
      eligibilityTone = "success";
    } else if (diffDays <= 7) {
      nextEligibleStr = `in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
      eligibilityLabel = `Cooldown (${diffDays}d)`;
      eligibilityTooltip = `You can donate again on ${formatDDMonYYYY(next)}.`;
      eligibilityTone = "warn";
    } else {
      nextEligibleStr = formatDDMonYYYY(next);
      eligibilityLabel = `Cooldown (${diffDays}d)`;
      eligibilityTooltip = `You can donate again on ${formatDDMonYYYY(next)}.`;
      eligibilityTone = "warn";
    }
  }

  const tipToneClasses = {
    success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
    warn: "border-amber-400/30 bg-amber-500/10 text-amber-100",
    neutral: "border-white/10 bg-white/5 text-white/80",
  };

  const quickTip = (() => {
    if (isDonor) {
      const hasLastDonation = Boolean(lastDonationDate);
      if (!hasLastDonation) {
        return {
          title: "Add your last donation date",
          description: "Log when you last donated so we can calculate your next eligibility window automatically.",
          tone: "warn",
          cta: "Update date",
          onClick: onOpenStatus,
        };
      }

      const next = new Date((lastDonationDate || new Date()).getTime() + cooldownDays * 24 * 60 * 60 * 1000);
      const now = new Date();
      const msDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.ceil((next.getTime() - now.getTime()) / msDay);

      if (diffDays > 0) {
        return {
          title: "Currently in cooldown",
          description: `You can donate again on ${formatDDMonYYYY(next)}. Keep your availability on so recipients know you're almost ready!`,
          tone: "warn",
        };
      }

      if (donorMatchesCount > 0) {
        return {
          title: "Matches waiting",
          description: `${donorMatchesCount} recipients match your profile right now. Review the list and accept one when you're ready to help.`,
          tone: "success",
          cta: "View matches",
          onClick: onOpenMatches,
        };
      }

      return {
        title: "You're ready to donate",
        description: "No pending matches at the moment. Keep an eye on requests or share your Jeevan Setu profile to reach more recipients.",
        tone: "success",
      };
    }

    if (isRecipient) {
      if (recipientRequestCount <= 0) {
        return {
          title: "Create your first request",
          description: "Share details about the blood component, location, and urgency so nearby donors can reach out.",
          tone: "neutral",
          cta: "Open requests",
          onClick: onOpenRequests,
        };
      }

      return {
        title: "Track your requests",
        description: `You currently have ${recipientRequestCount} request${recipientRequestCount === 1 ? "" : "s"}. Keep them updated so donors know the latest status.`,
        tone: "neutral",
        cta: "Manage requests",
        onClick: onOpenRequests,
      };
    }

    return {
      title: "Complete your profile",
      description: "Add more details to unlock tailored insights and faster matching.",
      tone: "neutral",
      cta: "Edit profile",
      onClick: onStartEditProfile || onOpenOverview,
    };
  })();

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
      <div className="flex items-center mb-4">
        <div className="w-3 h-3 bg-rose-500 rounded-full mr-3"></div>
        <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onStartEditProfile || onOpenOverview}
          className="w-full h-11 inline-flex items-center justify-center px-5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-sm font-semibold whitespace-nowrap leading-none text-center"
        >
          Edit Profile
        </button>
        <button
          onClick={onToggleAvailable}
          disabled={savingAvailability}
          className="w-full h-11 inline-flex items-center justify-center px-5 rounded-xl bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 text-sm font-semibold disabled:opacity-60 whitespace-nowrap leading-none text-center"
        >
          {profile?.available ? "Set Unavailable" : "Set Active"}
        </button>
      </div>

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <KPI
          label="Last Donation"
          value={lastDonationValue}
          tooltip={lastDonationDate ? lastDonationDate.toLocaleString() : "Not recorded"}
        />
        <KPI
          label="Member Since"
          value={memberSinceValue}
          tooltip={profile?.createdAt ? formatDateTime(profile.createdAt) : undefined}
        />
        <div className="col-span-2 rounded-xl bg-black/30 border border-white/10 p-4 min-h-[96px]">
          <div className="text-xs text-white/60 mb-3">Availability</div>
          <div className="flex items-center justify-between gap-6 flex-nowrap">
            <div className="flex-1 min-w-0 pr-8">
              <span className="inline-flex whitespace-nowrap">
                <Badge tone={availabilityTone}>{profile?.available ? "Active" : "Unavailable"}</Badge>
              </span>
            </div>
            <div className="shrink-0">
              <div
                role="switch"
                aria-checked={profile?.available ? "true" : "false"}
                tabIndex={0}
                onClick={onToggleAvailable}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleAvailable(); } }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-600 ${profile?.available ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-neutral-700"} ${savingAvailability ? "opacity-60" : ""}`}
                title={profile?.available ? "Set Unavailable" : "Set Active"}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${profile?.available ? "translate-x-6" : "translate-x-1"}`} />
              </div>
            </div>
          </div>
        </div>
        <KPI
          label="Next Eligible"
          value={nextEligibleStr}
          tooltip={lastDonationDate ? `${formatDDMonYYYY(new Date(lastDonationDate.getTime() + cooldownDays * 24 * 60 * 60 * 1000))} • Cooldown: ${cooldownDays} days` : undefined}
        />
        <KPI
          label="Eligibility"
          value={eligibilityLabel}
          tooltip={eligibilityTooltip}
          infoTooltip="Donors are generally eligible to donate again after 56 days from their last donation. Always follow local regulations and medical advice."
        />
        {isDonor && (
          <KPI
            label="Matches Pending"
            value={donorMatchesCount}
            tooltip={`${donorMatchesCount} open requests matching your filters`}
          />
        )}
        {isRecipient && (
          <KPI
            label="My Requests"
            value={recipientRequestCount}
            tooltip={`${recipientRequestCount} requests created`}
          />
        )}
      </div>

      {quickTip && (
        <div className={`mt-5 rounded-2xl border px-4 py-4 ${tipToneClasses[quickTip.tone] || tipToneClasses.neutral}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold leading-tight">{quickTip.title}</p>
              <p className="text-xs sm:text-sm opacity-80 mt-1 leading-relaxed">{quickTip.description}</p>
            </div>
            {quickTip.cta && quickTip.onClick && (
              <button
                onClick={quickTip.onClick}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-xs sm:text-sm font-semibold text-white transition-colors"
              >
                {quickTip.cta}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickStatsCard;
