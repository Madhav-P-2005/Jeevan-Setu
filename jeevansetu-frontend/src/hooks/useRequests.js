// jeevansetu-frontend/src/hooks/useRequests.js

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const serializeFilters = (filters) => {
  return Object.entries(filters || {}).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === "") return acc;
    if (typeof value === "boolean") {
      acc[key] = value ? "true" : "false";
    } else if (value instanceof Date) {
      acc[key] = value.toISOString();
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export default function useRequests(initialFilters = {}) {
  const [filters, setFilters] = useState(() => ({ ...initialFilters }));
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialFiltersKey = useMemo(
    () => JSON.stringify(initialFilters || {}),
    [initialFilters]
  );

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...(initialFilters || {}) }));
  }, [initialFiltersKey]);

  const params = useMemo(() => serializeFilters(filters), [filters]);

  const fetchRequests = useCallback(async (overrideFilters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/requests", {
        params: serializeFilters({ ...filters, ...overrideFilters }),
      });
      const data = res?.data?.data?.requests || [];
      setRequests(data);
      setError("");
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load requests";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, params]);

  const updateFilters = useCallback((next) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const refresh = useCallback(() => fetchRequests(), [fetchRequests]);

  return {
    requests,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    refresh,
  };
}
