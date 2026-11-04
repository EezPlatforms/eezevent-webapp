"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider } from "../lib/auth";
import { createEezEventTheme } from "../theme";

const ColorModeContext = createContext({ mode: "light", toggleMode: () => {} });
export const useColorMode = () => useContext(ColorModeContext);
const storageKey = "eezevent-color-mode";

const saveModeCookie = mode => {
  document.cookie = `${storageKey}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
};

export default function Providers({ children, initialMode = "light" }) {
  // Use the server snapshot throughout hydration, including deferred Suspense content.
  const [mode, setMode] = useState(initialMode);
  useEffect(() => {
    const syncMode = event => {
      if (event.key !== storageKey) return;
      const next = event.newValue === "dark" ? "dark" : "light";
      saveModeCookie(next);
      setMode(next);
    };
    window.addEventListener("storage", syncMode);
    return () => window.removeEventListener("storage", syncMode);
  }, []);
  const theme = useMemo(() => createEezEventTheme(mode), [mode]);
  const colorMode = useMemo(() => ({ mode, toggleMode: () => {
    const next = mode === "light" ? "dark" : "light";
    saveModeCookie(next);
    try { localStorage.setItem(storageKey, next); } catch { /* Keep the session preference. */ }
    setMode(next);
  } }), [mode]);
  return <AppRouterCacheProvider><ColorModeContext.Provider value={colorMode}><ThemeProvider theme={theme}><CssBaseline /><AuthProvider>{children}</AuthProvider></ThemeProvider></ColorModeContext.Provider></AppRouterCacheProvider>;
}
