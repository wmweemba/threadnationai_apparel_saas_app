"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api-client";
import type { CreditsResponse, TopupResponse } from "@threadnation/shared";

export function useCredits() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [dpaConsentSigned, setDpaConsentSigned] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);

  const fetchCredits = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await apiClient.get<CreditsResponse>(
        "/api/v1/credits",
        token
      );
      setBalance(data.credits);
      setDpaConsentSigned(data.dpa_consent_signed);
    } catch {
      // Silently ignore — balance stays null until next fetch
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  // Wait until Clerk has finished loading and the user is signed in
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      if (isLoaded) setIsLoading(false); // Clerk loaded but no session — stop spinner
      return;
    }
    fetchCredits();
  }, [isLoaded, isSignedIn, fetchCredits]);

  const topUp = useCallback(async () => {
    setTopUpLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const data = await apiClient.post<TopupResponse>(
        "/api/v1/credits/topup",
        {},
        token
      );
      setBalance(data.credits_remaining);
    } finally {
      setTopUpLoading(false);
    }
  }, [getToken]);

  const recordConsent = useCallback(async () => {
    // getToken() with skipCache forces a fresh token — avoids stale null on first render
    const token = await getToken({ skipCache: true });
    if (!token) throw new Error("Not authenticated — please refresh and try again.");
    await apiClient.patch("/api/v1/credits/consent", {}, token);
    setDpaConsentSigned(true);
  }, [getToken]);

  return {
    balance,
    dpaConsentSigned,
    isLoading,
    topUpLoading,
    topUp,
    recordConsent,
    refetch: fetchCredits,
  };
}
