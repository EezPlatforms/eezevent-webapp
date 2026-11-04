"use client";
import { useEffect, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import AppleIcon from "@mui/icons-material/Apple";
import ShopOutlinedIcon from "@mui/icons-material/ShopOutlined";
import { useAuth } from "../lib/auth";

const dismissalKey = "eezevent-host-mobile-notice-dismissed";

export default function HostMobileAppNotice() {
  const { auth, authReady, isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);
  const isHost = authReady && isAuthenticated && auth?.userType === "client";
  useEffect(() => {
    if (!isHost) { setVisible(false); return; }
    try { setVisible(sessionStorage.getItem(dismissalKey) !== "true"); }
    catch { setVisible(true); }
  }, [isHost]);
  if (!isHost || !visible) return null;
  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(dismissalKey, "true"); } catch { /* Dismiss for this page if storage is disabled. */ }
  };
  return <Alert role="status" severity="info" variant="outlined" icon={<PhoneIphoneRoundedIcon />} onClose={dismiss}
    sx={{ mb: 3, bgcolor: "background.paper", borderColor: "divider", color: "text.primary", borderRadius: 2, "& .MuiAlert-icon": { color: "primary.main" }, "& .MuiAlert-message": { width: "100%" } }}>
    <Stack direction={{ xs: "column", lg: "row" }} gap={1.5} alignItems={{ xs: "flex-start", lg: "center" }} justifyContent="space-between">
      <Box><Typography variant="body2" fontWeight={700}>Get the full EezEvent experience</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .25 }}>Use the mobile app for full event planning and management.</Typography></Box>
      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ flexShrink: 0 }}>
        <Button component="a" href="https://apps.apple.com/us/app/eezevent/id6774633058" target="_blank" rel="noopener noreferrer" aria-label="Download EezEvent on the App Store (opens in a new tab)" color="secondary" size="small" variant="outlined" startIcon={<AppleIcon />}>App Store</Button>
        <Button component="a" href="https://play.google.com/store/apps/details?id=com.eezevent.app" target="_blank" rel="noopener noreferrer" aria-label="Download EezEvent on Google Play (opens in a new tab)" color="secondary" size="small" variant="outlined" startIcon={<ShopOutlinedIcon />}>Google Play</Button>
      </Stack>
    </Stack>
  </Alert>;
}
