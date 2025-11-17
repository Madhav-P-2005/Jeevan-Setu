// jeevansetu-frontend/src/hooks/useRequestActions.js

import { useCallback, useState } from "react";
import api from "../lib/api";

export default function useRequestActions({ refresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const exec = useCallback(async (fn) => {
    setLoading(true);
    setError("");
    try {
      return await fn();
    } catch (err) {
      const message = err?.response?.data?.message || "Request action failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRequest = useCallback(
    (payload) =>
      exec(async () => {
        const res = await api.post("/requests", payload);
        await refresh?.();
        return res?.data?.data?.request;
      }),
    [exec, refresh]
  );

  const matchRequest = useCallback(
    (id) =>
      exec(async () => {
        const res = await api.post(`/requests/${id}/match`);
        await refresh?.();
        return res?.data?.data?.request;
      }),
    [exec, refresh]
  );

  const updateStatus = useCallback(
    (id, status) =>
      exec(async () => {
        const res = await api.patch(`/requests/${id}/status`, { status });
        await refresh?.();
        return res?.data?.data?.request;
      }),
    [exec, refresh]
  );

  return {
    loading,
    error,
    createRequest,
    matchRequest,
    updateStatus,
  };
}
