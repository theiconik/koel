"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "@clerk/nextjs";

/**
 * Shared auth + AbortController pattern for GET-style loads.
 * Pass a stable fetcher (useCallback with [] deps wrapping lib/data calls).
 */
export function useAuthResource<T>(
  fetcher: (token: string | null | undefined, signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
): {
  data: T | undefined;
  setData: Dispatch<SetStateAction<T | undefined>>;
  loading: boolean;
  error: Error | null;
  reload: () => void;
} {
  const { getToken, isLoaded } = useAuth();
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!isLoaded) return;
    const ac = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const result = await fetcherRef.current(token, ac.signal);
        if (cancelled) return;
        setData(result);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
    // fetcher held in ref — deps drive when to re-run
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetcherRef.current always used
  }, [getToken, isLoaded, reloadKey, ...deps]);

  return { data, setData, loading, error, reload };
}
