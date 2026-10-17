'use client';

import { useCallback, useSyncExternalStore } from 'react';

// ─────────────────────────────────────────────────────────────
// Local, device-scoped state backed by localStorage.
//
// Read through `useSyncExternalStore` (not an effect) so server rendering
// stays deterministic, and every hook in the tab sees the same value the
// moment it is written.
// ─────────────────────────────────────────────────────────────

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

const snapshotCache = new Map<string, { raw: string | null; value: unknown }>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function writeStored(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode / quota) — the value still
    // updates for this render because the snapshot cache is written below.
  }
  snapshotCache.delete(key);
  notify();
}

export function useStoredState<T>(
  key: string,
  fallback: T
): [T, (value: T) => void] {
  const getSnapshot = useCallback((): T => {
    if (typeof window === 'undefined') return fallback;

    const raw = window.localStorage.getItem(key);
    const cached = snapshotCache.get(key);

    if (cached && cached.raw === raw) return cached.value as T;

    let value: T = fallback;
    if (raw) {
      try {
        value = JSON.parse(raw) as T;
      } catch {
        value = fallback;
      }
    }

    snapshotCache.set(key, { raw, value });
    return value;
  }, [key, fallback]);

  const value = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => fallback
  );

  const setValue = useCallback(
    (next: T) => writeStored(key, next),
    [key]
  );

  return [value, setValue];
}
