"use client";
import { useCallback } from "react";
import { getStats } from "@/lib/data";
import { useAuthResource } from "@/hooks/useAuthResource";
import type { DashboardStats } from "@/lib/types";

export function useStats() {
  const fetchStats = useCallback(
    (token: string | null | undefined, signal: AbortSignal) =>
      getStats(token, { signal }),
    [],
  );

  const { data, loading, error, reload } = useAuthResource<DashboardStats>(
    fetchStats,
    [],
  );

  return {
    stats: data ?? null,
    loading,
    error,
    reload,
  };
}
