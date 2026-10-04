"use client";
import { useCallback, useEffect, useState } from "react";
import type { PublicProvider, SetupRequest } from "./types";

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

export function useProviders() {
  const [providers, setProviders] = useState<PublicProvider[]>([]);
  useEffect(() => {
    api<PublicProvider[]>("/api/providers").then(setProviders).catch(() => {});
  }, []);
  return providers;
}

/** Requests as seen by `as` (a provider id) — contact details unmasked for leads they're interested in. */
export function useRequests(as: string) {
  const [requests, setRequests] = useState<SetupRequest[]>([]);
  const [error, setError] = useState("");
  const reload = useCallback(() => {
    api<SetupRequest[]>(`/api/requests${as ? `?as=${encodeURIComponent(as)}` : ""}`)
      .then((r) => { setRequests(r); setError(""); })
      .catch((e) => setError(e.message));
  }, [as]);
  useEffect(reload, [reload]);
  return { requests, setRequests, error, reload };
}

/** Remembers which provider this browser is acting as (a convenience, not authentication). */
export function useActingProvider() {
  const [as, setAs] = useState("");
  useEffect(() => {
    try { setAs(localStorage.getItem("rts-as") || ""); } catch {}
  }, []);
  const update = (v: string) => {
    setAs(v);
    try { localStorage.setItem("rts-as", v); } catch {}
  };
  return [as, update] as const;
}

export async function copyText(t: string) {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    return false;
  }
}
