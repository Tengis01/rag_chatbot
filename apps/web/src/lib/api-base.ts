// Production defaults to the dedicated HTTPS API host; local Vite keeps LAN access.
export const API_BASE = (import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? `https://api.${window.location.hostname}` : `http://${window.location.hostname}:4000`)
).replace(/\/$/, "");
