"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getStats } from "@/lib/data";
import type { DashboardStats } from "@/lib/types";

export function useStats() {
  const { getToken, isLoaded } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) setLoading(true);
        return getToken();
      })
      .then((token) => getStats(token))
      .then((data) => {
        if (cancelled) return;
        setStats(data);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, reloadKey]);

  return { stats, loading, error, reload: () => setReloadKey((key) => key + 1) };
}
