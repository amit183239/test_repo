/**
 * consent-banner.ts
 *
 * Fixes the flicker on first page load by deferring banner render until
 * the consent state is fully resolved from storage/network.
 * Previously the banner was rendered immediately (causing a flash), then
 * hidden once the existing-consent state loaded.
 *
 * Fixes: https://github.com/amit183239/test_repo/issues/92
 */

export type ConsentState = "accepted" | "declined" | "pending";

/**
 * Returns a Promise that resolves to the current consent state.
 * The banner should not be rendered until this resolves.
 */
export async function resolveConsentState(): Promise<ConsentState> {
  // Check local storage first (synchronous path — no flicker)
  const stored = localStorage.getItem("consent_state");
  if (stored === "accepted" || stored === "declined") {
    return stored;
  }

  // Fall back to server-side consent record (async path)
  try {
    const res = await fetch("/api/consent/state", { credentials: "include" });
    if (res.ok) {
      const data = await res.json() as { state: ConsentState };
      return data.state;
    }
  } catch {
    // Network error — default to pending so the banner shows once
  }

  return "pending";
}

/**
 * Mount the consent banner only after state is resolved.
 * Call this from the page bootstrap instead of mounting unconditionally.
 */
export async function mountConsentBanner(container: HTMLElement): Promise<void> {
  const state = await resolveConsentState();
  if (state !== "pending") {
    // Consent already given or declined — no banner needed
    return;
  }
  container.style.display = "block";
}
