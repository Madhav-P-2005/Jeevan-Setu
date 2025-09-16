// Path: jeevansetu-frontend/src/hooks/useProfileUpdate.js
import { useState, useCallback } from "react";
import api from "../lib/api";

// Usage:
// const { savingAvailability, savingLastDonation, savingProfile, updateAvailability, updateLastDonation, updateProfile } =
//   useProfileUpdate({ setProfile, refresh });
export default function useProfileUpdate({ setProfile, refresh }) {
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [savingLastDonation, setSavingLastDonation] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const updateAvailability = useCallback(
    async (next) => {
      // optimistic
      setSavingAvailability(true);
      setProfile((p) => (p ? { ...p, available: next } : p));
      try {
        await api.put("/auth/profile", { available: next });
        await refresh();
      } catch (e) {
        // rollback - refresh from server
        await refresh();
        throw e;
      } finally {
        setSavingAvailability(false);
      }
    },
    [setProfile, refresh]
  );

  const updateLastDonation = useCallback(
    async (dateOrNull) => {
      setSavingLastDonation(true);
      try {
        const body = dateOrNull ? { lastDonationAt: dateOrNull } : { lastDonationAt: null };
        await api.put("/auth/profile", body);
        await refresh();
      } catch (e) {
        throw e;
      } finally {
        setSavingLastDonation(false);
      }
    },
    [refresh]
  );

  const updateProfile = useCallback(
    async (partial) => {
      setSavingProfile(true);
      try {
        await api.put("/auth/profile", partial);
        await refresh();
      } catch (e) {
        throw e;
      } finally {
        setSavingProfile(false);
      }
    },
    [refresh]
  );

  return {
    savingAvailability,
    savingLastDonation,
    savingProfile,
    updateAvailability,
    updateLastDonation,
    updateProfile,
  };
}
