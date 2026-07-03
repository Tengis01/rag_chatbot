import Constants from "expo-constants";

/**
 * API base URL resolution with liveness probing.
 *
 * The app runs in three environments with different API addresses:
 *   - home LAN, office LAN (physical phone via Expo Go)
 *   - Android emulator (10.0.2.2 = host loopback alias)
 *
 * Candidates are probed in parallel with GET /health (2s timeout);
 * the first one that answers wins and is cached for the session.
 *
 * EXPO_PUBLIC_API_URL (single URL) skips probing entirely — use for
 * production builds where the API address is fixed.
 * EXPO_PUBLIC_API_URLS (comma-separated) adds known addresses to the
 * probe list (e.g. home + office machine IPs).
 */

const PROBE_TIMEOUT_MS = 2000;

let resolvedBase: string | null = null;
let resolving: Promise<string> | null = null;

function candidateList(): string[] {
  const candidates: string[] = [];

  const extra = process.env.EXPO_PUBLIC_API_URLS;
  if (extra) {
    extra
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((url) => candidates.push(url));
  }

  // Metro dev-server host = the dev machine's current LAN IP.
  // Covers home/office automatically when running through Expo Go.
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  if (host) candidates.push(`http://${host}:4000`);

  candidates.push("http://10.0.2.2:4000"); // Android emulator
  candidates.push("http://localhost:4000");

  // Deduplicate, preserve order
  return [...new Set(candidates)];
}

async function probe(base: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/health`, { signal: controller.signal });
    if (!res.ok) throw new Error(`health ${res.status}`);
    return base;
  } finally {
    clearTimeout(timer);
  }
}

/** Resolve (and cache) the reachable API base. Throws if nothing answers. */
export async function resolveApiBase(): Promise<string> {
  // Hard override — no probing (production builds)
  if (process.env.EXPO_PUBLIC_API_URL) {
    resolvedBase = process.env.EXPO_PUBLIC_API_URL;
    return resolvedBase;
  }

  if (resolvedBase) return resolvedBase;
  if (resolving) return resolving;

  resolving = Promise.any(candidateList().map(probe))
    .then((base) => {
      resolvedBase = base;
      console.log(`[api-base] resolved API base: ${base}`);
      return base;
    })
    .finally(() => {
      resolving = null;
    });

  return resolving;
}

/**
 * Best synchronous guess, used only before/without probing
 * (e.g. auth client construction). Probing corrects it at boot.
 */
export function getApiBaseSync(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (resolvedBase) return resolvedBase;
  return candidateList()[0];
}

/** Forget the cached base so the next call re-probes (after network errors). */
export function invalidateApiBase(): void {
  resolvedBase = null;
}
