"use client";
import HostMobileAppNotice from "./HostMobileAppNotice";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import { useColorMode } from "../app/providers";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { RouterLink, useLocation } from "../lib/navigation";
import logo from "../../assets/eezevent-just-logo.png";
import { navItems } from "../data/content";
import { useAuth } from "../lib/auth";

const navigationIcons = {
  "/events": EventOutlinedIcon,
  "/search-vendors": SearchRoundedIcon,
  "/login": LoginRoundedIcon,
};
function NavigationIcon({ to }) {
  const Icon = navigationIcons[to] || HelpOutlineRoundedIcon;
  return <Icon fontSize="small" />;
}

export default function AppShell({ children, contentSx }) {
  const { mode, toggleMode } = useColorMode();
  const location = useLocation();
  const { auth, isAuthenticated, logout } = useAuth();
  const [accountAnchor, setAccountAnchor] = useState(null);
  const [mobileAnchor, setMobileAnchor] = useState(null);
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  useEffect(() => {
    setMobileAnchor(null);
    setAccountAnchor(null);
  }, [desktop, location.pathname]);
  const visibleNavItems = useMemo(
    () =>
      navItems.filter((item) => {
        if (isAuthenticated && item.to === "/login") return false;
        if (item.to === "/events") {
          return isAuthenticated && auth?.userType === "client";
        }
        return true;
      }),
    [auth?.userType, isAuthenticated],
  );
  const accountLabel = useMemo(() => {
    const firstName = auth?.userFirstName?.trim();
    if (firstName) return firstName;
    if (auth?.userEmail) return auth.userEmail.split("@")[0];
    return "Account";
  }, [auth]);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: "blur(14px)",
          background:
            "var(--eez-surface-29)",
          borderBottom: "var(--eez-border-12)",
          boxShadow: "0 10px 24px rgba(9, 13, 50, 0.24)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 84, gap: { xs: 1, sm: 2 }, justifyContent: "space-between" }}>
            <Stack
              component={RouterLink}
              to="/"
              aria-label="EezEvent home"
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                textDecoration: "none",
                color: "text.primary",
                borderRadius: 1,
                "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main", outlineOffset: 4 },
              }}
            >
              <Box
                component="img"
                src={logo.src}
                alt="EezEvent logo"
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 0.5,
                  p: 0.2,
                  objectFit: "contain",
                  backgroundColor: "var(--eez-surface-2)",
                  border: "var(--eez-border-13)",
                }}
              />
              <Box>
                <Typography variant="h5" sx={{ lineHeight: 1, color: "text.primary" }}>
                  EezEvent
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", lg: "block" } }}>
                  Event planning with operational discipline
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {visibleNavItems.map((item) => {
                  const selected =
                    !item.external && (item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to));

                  return (
                    <Button
                      key={item.to}
                      component={item.external ? "a" : RouterLink}
                      {...(item.external
                        ? { href: item.to, target: "_blank", rel: "noopener noreferrer", "aria-label": `${item.label} (opens in a new tab)` }
                        : { to: item.to })}
                      startIcon={<NavigationIcon to={item.to} />}
                      endIcon={item.external ? <OpenInNewRoundedIcon sx={{ fontSize: "16px !important" }} /> : undefined}
                      variant={selected ? "contained" : "text"}
                      color={selected ? "primary" : "inherit"}
                      sx={{
                        display: { xs: "none", md: "inline-flex" },
                        color: selected ? "common.white" : "var(--eez-ink-12)",
                        minWidth: "auto",
                        px: selected ? 2.2 : 1.4,
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              {isAuthenticated ? (
                <>
                  <Button
                    variant="text"
                    color="inherit"
                    startIcon={<PersonOutlineRoundedIcon fontSize="small" />}
                    onClick={(event) => setAccountAnchor(event.currentTarget)}
                    sx={{
                      display: { xs: "none", md: "inline-flex" },
                      color: "var(--eez-ink-13)",
                      px: 1.25,
                      minWidth: "auto",
                    }}
                  >
                    {accountLabel}
                  </Button>
                  <Menu
                    anchorEl={accountAnchor}
                    open={Boolean(accountAnchor)}
                    onClose={() => setAccountAnchor(null)}
                    PaperProps={{
                      sx: {
                        minWidth: 240,
                        mt: 1,
                        border: "var(--eez-border-3)",
                        background:
                          "var(--eez-surface-30)",
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Signed in as
                      </Typography>
                      <Typography sx={{ mt: 0.35, wordBreak: "break-word" }}>
                        {auth?.userEmail || "Account"}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem
                      onClick={async () => {
                        setAccountAnchor(null);
                        await logout();
                      }}
                    >
                      <LogoutRoundedIcon fontSize="small" style={{ marginRight: 10 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : null}
              <IconButton
                id="mobile-navigation-button"
                aria-label="Open navigation menu"
                aria-controls={mobileAnchor ? "mobile-navigation-menu" : undefined}
                aria-haspopup="menu"
                aria-expanded={Boolean(mobileAnchor)}
                color="inherit"
                onClick={event => setMobileAnchor(event.currentTarget)}
                sx={{ display: { xs: "inline-flex", md: "none" } }}
              >
                <MenuRoundedIcon />
              </IconButton>
              <Menu
                id="mobile-navigation-menu"
                anchorEl={mobileAnchor}
                open={Boolean(mobileAnchor) && !desktop}
                onClose={() => setMobileAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                MenuListProps={{ "aria-labelledby": "mobile-navigation-button" }}
                PaperProps={{ sx: { mt: 1, minWidth: 240, maxWidth: "calc(100vw - 32px)", border: "1px solid", borderColor: "divider", borderRadius: 2 } }}
              >
                {visibleNavItems.map(item => <MenuItem
                  key={item.to}
                  component={item.external ? "a" : RouterLink}
                  {...(item.external
                    ? { href: item.to, target: "_blank", rel: "noopener noreferrer", "aria-label": `${item.label} (opens in a new tab)` }
                    : { to: item.to })}
                  selected={!item.external && location.pathname.startsWith(item.to)}
                  onClick={() => setMobileAnchor(null)}
                  sx={{ py: 1.5, gap: 2, justifyContent: "space-between" }}
                ><Stack direction="row" spacing={1.5} alignItems="center"><NavigationIcon to={item.to} /><span>{item.label}</span></Stack>{item.external && <OpenInNewRoundedIcon fontSize="small" />}</MenuItem>)}
                {isAuthenticated && <Divider />}
                {isAuthenticated && <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{accountLabel}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{auth?.userEmail}</Typography>
                </Box>}
                {isAuthenticated && <MenuItem onClick={async () => { setMobileAnchor(null); await logout(); }} sx={{ py: 1.5, gap: 1 }}><LogoutRoundedIcon fontSize="small" />Logout</MenuItem>}
              </Menu>
              <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
                <IconButton color="inherit" onClick={toggleMode} aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
                  {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, ...contentSx }}>
        <HostMobileAppNotice />
        {children}
      </Container>
    </Box>
  );
}
