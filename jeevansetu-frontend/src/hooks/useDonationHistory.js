// jeevansetu-frontend/src/hooks/useDonationHistory.js

import { useCallback, useEffect, useState } from "react";
import api from "../lib/api";

export default function useDonationHistory(enabled = true) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!enabled) {
      setDonations([]);
      setLoading(false);
      setError("");
      return [];
    }
    setLoading(true);
    try {
      const res = await api.get("/donations/me");
      const history = res?.data?.data?.donations || [];
      setDonations(history);
      setError("");
      return history;
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load donation history";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      refresh();
    } else {
      setDonations([]);
      setLoading(false);
    }
  }, [enabled, refresh]);

  return {
    donations,
    loading,
    error,
    refresh,
  };
}
