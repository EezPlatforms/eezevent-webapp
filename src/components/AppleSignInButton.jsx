"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import { authorizeWithApple } from "../lib/appleSignIn";
import AppleIcon from "@mui/icons-material/Apple";

const clientId = process.env.NEXT_PUBLIC_APPLE_WEB_CLIENT_ID;
const redirectURI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;
export const appleSignInConfigured = Boolean(clientId && redirectURI);

export default function AppleSignInButton({ onCredential, onError, onBusyChange, disabled = false }) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  useEffect(() => {
    if (!appleSignInConfigured) return;
    if (window.AppleID?.auth) { setReady(true); return; }
    let script = document.getElementById("apple-signin-sdk");
    const loaded = () => setReady(Boolean(window.AppleID?.auth));
    const failed = () => onError("Apple sign-in could not load. Please reload the page and try again.");
    if (!script) {
      script = document.createElement("script");
      script.id = "apple-signin-sdk";
      script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", loaded);
    script.addEventListener("error", failed);
    return () => { script.removeEventListener("load", loaded); script.removeEventListener("error", failed); };
  }, [onError]);

  const signIn = async () => {
    if (disabled || !ready || inFlight.current) return;
    inFlight.current = true; setBusy(true); onBusyChange?.(true); onError("");
    try {
      const response = await authorizeWithApple(window.AppleID.auth, { clientId, redirectURI });
      await onCredential(response);
    } catch (err) {
      if (!["popup_closed_by_user", "user_cancelled_authorize"].includes(err?.error)) {
        onError(err?.message || "Apple sign-in failed. Please try again.");
      }
    } finally {
      inFlight.current = false; setBusy(false); onBusyChange?.(false);
    }
  };
  if (!appleSignInConfigured) return null;
  return <Button type="button" variant="contained" fullWidth startIcon={<AppleIcon />} disabled={disabled || !ready || busy} onClick={signIn} sx={{ bgcolor: "#000", color: "#fff", minHeight: 44, "&:hover": { bgcolor: "#222" } }}>{busy ? "Connecting to Apple…" : "Continue with Apple"}</Button>;
}
