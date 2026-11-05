export const safeReturnPath = (value, fallback = "/") => {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://eezevent.com");
    return url.origin === "https://eezevent.com" ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch { return fallback; }
};
