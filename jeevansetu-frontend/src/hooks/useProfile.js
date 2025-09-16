// Path: jeevansetu-frontend/src/hooks/useProfile.js
import { useCallback, useEffect, useState } from "react";
import api from "../lib/api";

export default function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/profile");
      const user = res?.data?.data?.user || null;
      setProfile(user);
      setError("");
      return user;
    } catch (err) {
      setError(
        err?.response?.status === 401
          ? "Please log in to access the dashboard."
          : "Failed to load dashboard data. Please try again."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, setProfile, loading, error, refresh };
}
