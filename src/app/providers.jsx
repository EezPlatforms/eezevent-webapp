"use client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider } from "../lib/auth";
import { eezEventTheme } from "../theme";
export default function Providers({children}) { return <ThemeProvider theme={eezEventTheme}><CssBaseline/><AuthProvider>{children}</AuthProvider></ThemeProvider>; }
