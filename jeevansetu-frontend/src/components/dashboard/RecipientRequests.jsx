// jeevansetu-frontend/src/components/dashboard/RecipientRequests.jsx

import React, { useEffect, useMemo } from "react";
import { FiDroplet, FiClock, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import { useForm } from "react-hook-form";
import useRequests from "../../hooks/useRequests";
import useRequestActions from "../../hooks/useRequestActions";
import toast from "../../lib/toast";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "Critical", value: "high" },
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
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-xs text-white/80 hover:bg-white/20"
    >
      <span>{label}</span>
    </a>
  );
};

const statusBadge = {
  open: "bg-blue-500/20 text-blue-300",
  matched: "bg-amber-500/20 text-amber-300",
  fulfilled: "bg-green-500/20 text-green-300",
  cancelled: "bg-red-500/20 text-red-300",
};

export default function RecipientRequests({ profile, onSummaryChange }) {
  const {
    requests,
    loading: loadingRequests,
    error: listError,
    refresh,
  } = useRequests({ mine: true, status: "all" });
  const {
    loading: actionLoading,
    error: actionError,
    createRequest,
    updateStatus,
  } = useRequestActions({ refresh });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      patientName: profile?.name || "",
      hospitalName: "",
      contactPhone: profile?.phone || "",
      neededBy: "",
      bloodGroup: profile?.bloodGroup || "A+",
      quantityRequired: 500,
      location:
        [profile?.city, profile?.state].filter(Boolean).join(", ") || "",
      urgencyLevel: "medium",
      notes: "",
    },
  });

  const groupedRequests = useMemo(() => {
    const sections = {
      open: [],
      matched: [],
      fulfilled: [],
      cancelled: [],
    };
    requests.forEach((req) => {
      (sections[req.status] || sections.open).push(req);
    });
    return sections;
  }, [requests]);

  useEffect(() => {
    onSummaryChange?.({
      total: requests.length,
      open: groupedRequests.open.length,
      matched: groupedRequests.matched.length,
      fulfilled: groupedRequests.fulfilled.length,
    });
  }, [
    onSummaryChange,
    requests.length,
    groupedRequests.open.length,
    groupedRequests.matched.length,
    groupedRequests.fulfilled.length,
  ]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      patientName: data.patientName.trim(),
      hospitalName: data.hospitalName.trim(),
      contactPhone: data.contactPhone.trim(),
      location: data.location.trim(),
      notes: (data.notes || "").trim(),
      quantityRequired: Number(data.quantityRequired),
    };
    try {
      await createRequest(payload);
      toast.success("Plasma request published successfully");
      reset();
    } catch (err) {
      const message =
        err?.response?.data?.message || "Unable to create plasma request";
      toast.error(message);
    }
  };

  const handleStatusChange = async (reqId, status, successMessage) => {
    try {
      await updateStatus(reqId, status);
      toast.success(successMessage);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to update status";
      toast.error(message);
    }
  };

  const renderRequests = (items, title) => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
        {title}
      </h4>
      {!items.length ? (
        <p className="text-white/50 text-sm">No requests in this state.</p>
      ) : (
        <div className="space-y-3">
          {items.map((req) => {
            const donor = req.matchedDonor || {};
            const donorSocial = [
              { label: "Instagram", href: donor?.social?.instagram },
              { label: "X", href: donor?.social?.x },
              { label: "Facebook", href: donor?.social?.facebook },
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
                    <h5 className="text-white font-semibold flex items-center gap-2">
                      <FiUser className="text-emerald-300" />
                      <span>{req.patientName}</span>
                    </h5>
                    <p className="text-xs sm:text-sm text-white/70 flex items-center gap-1">
                      <FiClock className="text-white/50" />
                      <span>
                        Needed by {new Date(req.neededBy).toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        statusBadge[req.status] ||
                        "bg-white/10 text-white/70 border-white/20"
                      }`}
                    >
                      {req.status.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide bg-emerald-500/10 text-emerald-200 border border-emerald-400/40">
                      Your Request
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs sm:text-sm text-white/75">
                  <div className="flex items-center gap-2">
                    <FiDroplet className="text-rose-300" />
                    <div>
                      <p className="text-[11px] uppercase text-white/50">
                        Blood
                      </p>
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
                    <span className="font-semibold text-white/85">
                      Hospital:
                    </span>{" "}
                    <span className="text-white/90">{req.hospitalName}</span>
                  </p>
                )}

                {req.notes && (
                  <p className="text-xs sm:text-sm text-white/65 border-l border-white/20 pl-3">
                    {req.notes}
                  </p>
                )}

                {req.status === "matched" && donor?.name && (
                  <div className="border-t border-white/10 pt-3 space-y-2 text-xs sm:text-sm">
                    <p className="text-white/70 font-medium flex items-center gap-2">
                      <FiUser className="text-emerald-300" />
                      <span>Matched donor</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/80">
                      <div>
                        Name:{" "}
                        <span className="text-white/90 font-medium">
                          {donor.name}
                        </span>
                      </div>
                      {donor.bloodGroup && (
                        <div>
                          Blood Group:{" "}
                          <span className="text-white/90 font-medium">
                            {donor.bloodGroup}
                          </span>
                        </div>
                      )}
                      {donor.phone && (
                        <div>
                          Phone:{" "}
                          <span className="text-white/90 font-medium">
                            {donor.phone}
                          </span>
                        </div>
                      )}
                      {donor.email && (
                        <div>
                          Email:{" "}
                          <a
                            href={`mailto:${donor.email}`}
                            className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
                          >
                            {donor.email}
                          </a>
                        </div>
                      )}
                      {(donor.city || donor.state) && (
                        <div>
                          Location:{" "}
                          <span className="text-white/90 font-medium">
                            {[donor.city, donor.state]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                    {donorSocial.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-white/70">
                        {donorSocial}
                      </div>
                    )}
                    <p className="text-[11px] text-white/60">
                      Coordinate directly with the matched donor to plan the
                      donation. Mark the request fulfilled once the transfusion
                      is complete.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {req.status !== "fulfilled" && req.status !== "cancelled" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusChange(
                            req._id || req.id,
                            "fulfilled",
                            "Marked as fulfilled"
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-xs sm:text-sm font-medium shadow-[0_8px_20px_rgba(16,185,129,0.45)]"
                        disabled={actionLoading}
                      >
                        Mark Fulfilled
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(
                            req._id || req.id,
                            "cancelled",
                            "Request cancelled"
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-xs sm:text-sm font-medium"
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {req.status === "cancelled" && (
                    <button
                      onClick={() =>
                        handleStatusChange(
                          req._id || req.id,
                          "open",
                          "Request reopened"
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-600/80 hover:bg-slate-600 text-xs sm:text-sm font-medium"
                      disabled={actionLoading}
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">
          Raise a Plasma Request
        </h3>
        <p className="text-sm text-white/60">
          Provide accurate details so compatible donors can step in fast. We
          recommend at least 100&nbsp;ml for plasma transfusions.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="space-y-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">
            Patient Name
          </label>
          <input
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90"
            {...register("patientName", {
              required: "Patient name is required",
            })}
          />
          {errors.patientName && (
            <p className="text-xs text-red-300">{errors.patientName.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">
            Hospital
          </label>
          <input
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90"
            {...register("hospitalName")}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">
            Contact Phone
          </label>
          <input
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90"
            {...register("contactPhone")}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">
            Needed By
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90"
            {...register("neededBy", {
              required: "Needed by time is required",
            })}
          />
          {errors.neededBy && (
            <p className="text-xs text-red-300">{errors.neededBy.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">
            Blood Group
          </label>
          <select
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90"
            {...register("bloodGroup", { required: true })}
          >
            {BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">
            Quantity (ml)
          </label>
          <input
            type="number"
            min={100}
            step={50}
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90"
            {...register("quantityRequired", {
              required: "Quantity is required",
              min: {
                value: 100,
                message: "Minimum 100 ml required for plasma support",
              },
            })}
          />
          {errors.quantityRequired && (
            <p className="text-xs text-red-300">
              {errors.quantityRequired.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">
            Location
          </label>
          <input
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90"
            placeholder="City, Hospital area"
            {...register("location", {
              required: "Location helps donors plan quickly",
            })}
          />
          {errors.location && (
            <p className="text-xs text-red-300">{errors.location.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">
            Urgency
          </label>
          <select
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90"
            {...register("urgencyLevel")}
          >
            {URGENCY_LEVELS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">
            Additional Notes
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90"
            {...register("notes")}
          />
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
          <button
            type="submit"
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 font-semibold"
          >
            {actionLoading ? "Posting..." : "Publish Plasma Request"}
          </button>
          {(listError || actionError) && (
            <span className="text-sm text-red-300">
              {actionError || listError}
            </span>
          )}
        </div>
      </form>

      <div className="space-y-6">
        {renderRequests(groupedRequests.open, "Open")}
        {renderRequests(groupedRequests.matched, "Matched")}
        {renderRequests(groupedRequests.fulfilled, "Fulfilled")}
        {renderRequests(groupedRequests.cancelled, "Cancelled")}
      </div>

      {loadingRequests && (
        <p className="text-sm text-white/50">Refreshing requests...</p>
      )}
    </div>
  );
}
