"use client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider } from "../lib/auth";
import { eezEventTheme } from "../theme";
export default function Providers({children}) { return <AppRouterCacheProvider><ThemeProvider theme={eezEventTheme}><CssBaseline/><AuthProvider>{children}</AuthProvider></ThemeProvider></AppRouterCacheProvider>; }
