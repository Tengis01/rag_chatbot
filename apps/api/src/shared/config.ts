/** Validate deployment settings without logging their values. */
export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const production = env.NODE_ENV === "production";
  function origin(name: string) {
    const value = env[name];
    if (!value && !production) return undefined;
    try {
      const url = new URL(value ?? "");
      if ((production ? url.protocol !== "https:" : !["http:", "https:"].includes(url.protocol)) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error();
      return url.origin;
    } catch {
      throw new Error(`${name} must be an HTTPS origin in production`);
    }
  }
  function integer(name: string, fallback: number, max: number) {
    const value = Number(env[name] ?? fallback);
    if (!Number.isInteger(value) || value < 1 || value > max) throw new Error(`${name} is outside the supported range`);
    return value;
  }
  if (production) {
    for (const name of ["DATABASE_URL", "GEMINI_API_KEY", "BETTER_AUTH_SECRET"]) {
      if (!env[name]?.trim()) throw new Error(`${name} is required in production`);
    }
    if (env.BETTER_AUTH_SECRET!.length < 32 || env.BETTER_AUTH_SECRET!.includes("dev-insecure")) {
      throw new Error("BETTER_AUTH_SECRET must be a new random secret of at least 32 characters");
    }
  }
  return {
    production,
    frontendURL: origin("FRONTEND_URL"),
    authURL: origin("BETTER_AUTH_URL"),
    maxUploadSizeMb: integer("MAX_UPLOAD_SIZE_MB", 20, 20),
    maxPasteLength: integer("MAX_PASTE_LENGTH", 500_000, 500_000),
    chatTimeoutMs: integer("CHAT_TIMEOUT_MS", 90_000, 90_000),
    drainFile: env.DRAIN_FILE,
    revision: env.APP_REVISION ?? "development",
  };
}

export const config = readConfig();
