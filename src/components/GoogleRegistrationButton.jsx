"use client";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

export default function GoogleRegistrationButton({ onCredential, onError, disabled }) {
  const container = useRef(null);
  const callbacks = useRef({ onCredential, onError });
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  useEffect(() => { callbacks.current = { onCredential, onError }; }, [onCredential, onError]);
  useEffect(() => {
    if (!clientId) return;
    let active = true;
    const initialize = () => {
      if (!active || !container.current || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: response => {
        if (active) callbacks.current.onCredential(response);
      }, auto_select: false });
      container.current.innerHTML = "";
      window.google.accounts.id.renderButton(container.current, { type: "standard", theme: "outline", size: "large", text: "signup_with", width: Math.min(container.current.clientWidth || 300, 400) });
    };
    const failed = () => { if (active) callbacks.current.onError("Google sign-up could not load. Please reload the page and try again."); };
    let script = document.getElementById("google-identity-sdk");
    if (window.google?.accounts?.id) initialize();
    else {
      if (!script) {
        script = document.createElement("script");
        script.id = "google-identity-sdk";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", initialize);
      script.addEventListener("error", failed);
    }
    return () => { active = false; script?.removeEventListener("load", initialize); script?.removeEventListener("error", failed); };
  }, [clientId]);
  return <Box ref={container} aria-busy={disabled} sx={{ minHeight: 44, opacity: disabled ? .6 : 1, pointerEvents: disabled ? "none" : "auto" }} />;
}
