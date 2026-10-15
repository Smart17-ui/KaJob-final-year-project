// frontend/src/hooks/useVerification.ts

import { useCallback, useEffect, useState } from "react";

import {
  getVerificationStatus,
  type VerificationStatusResponse,
} from "@/api/verification";
import { getCurrentUser } from "@/shared/auth";

/* =========================================================
   MODULE-LEVEL CACHE
   ---------------------------------------------------------
   Multiple components on the same page (gate + modal + card)
   all need verification status. We share one fetch result
   per app session so we don't hammer the API.
========================================================= */

type CachedStatus = {
  data: VerificationStatusResponse | null;
  fetchedAt: number;
};

let cachedStatus: CachedStatus | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

function isCacheFresh(): boolean {
  if (!cachedStatus) return false;
  return Date.now() - cachedStatus.fetchedAt < CACHE_TTL_MS;
}

export function invalidateVerificationCache(): void {
  cachedStatus = null;
}

/* =========================================================
   HOOK
========================================================= */

export type VerificationState = {
  loading: boolean;
  verified: boolean;
  status: VerificationStatusResponse | null;
  refresh: () => Promise<void>;
};

export function useVerification(): VerificationState {
  // Fast path: user object from localStorage already carries is_verified
  const user = getCurrentUser();
  const fastVerified = user?.is_verified === true;

  const [loading, setLoading] = useState(!fastVerified);
  const [verified, setVerified] = useState(fastVerified);
  const [status, setStatus] = useState<VerificationStatusResponse | null>(
    isCacheFresh() ? cachedStatus!.data : null
  );

  const fetchStatus = useCallback(async () => {
    // If the user object says verified, skip the network call entirely
    if (fastVerified) {
      setVerified(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getVerificationStatus();
      cachedStatus = { data, fetchedAt: Date.now() };
      setStatus(data);
      setVerified(data.fully_verified === true);
    } catch (err) {
      console.error("[useVerification] failed to fetch status:", err);
      // Fail closed: treat as not verified, but keep the last known status
      setVerified(false);
    } finally {
      setLoading(false);
    }
  }, [fastVerified]);

  useEffect(() => {
    // Skip the fetch if we already have a fresh cache
    if (isCacheFresh() && cachedStatus!.data) {
      setStatus(cachedStatus!.data);
      setVerified(cachedStatus!.data.fully_verified === true);
      setLoading(false);
      return;
    }

    void fetchStatus();
  }, [fetchStatus]);

  const refresh = useCallback(async () => {
    invalidateVerificationCache();
    await fetchStatus();
  }, [fetchStatus]);

  return { loading, verified, status, refresh };
}
