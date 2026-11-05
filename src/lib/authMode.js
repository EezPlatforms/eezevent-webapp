// Web equivalent of mobile's EXPO_PUBLIC_AUTH_MODE. `development` and other
// non-social_only values retain mobile's mixed-mode behavior for local testing.
export const resolveAuthMode = (value, environment = process.env.NODE_ENV) => {
  const configured = String(value || "").trim().toLowerCase();
  if (!configured) return environment === "production" ? "social_only" : "mixed";
  return configured === "social_only" ? "social_only" : "mixed";
};

export const authMode = resolveAuthMode(process.env.NEXT_PUBLIC_AUTH_MODE);
export const isSocialOnlyAuth = authMode === "social_only";
