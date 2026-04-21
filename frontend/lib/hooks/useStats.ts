"use client";
import { useEffect, useState } from "react";
import { getStats } from "@/lib/data";
import type { DashboardStats } from "@/lib/types";

export function useStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  return { stats };
}
