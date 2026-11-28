"use client";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
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
import BrandIdentity from "./BrandIdentity";
import { navItems } from "../data/content";
import { useAuth } from "../lib/auth";

const navigationIcons = {
  "/dashboard": DashboardOutlinedIcon,
  "/business-admin": StorefrontOutlinedIcon,
  "/inquiries": InboxOutlinedIcon,
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
      [...(isAuthenticated && auth?.userType === "vendor" ? [{ to: "/dashboard", label: "Dashboard" }, { to: "/inquiries", label: "Inquiries" }, { to: "/business-admin", label: "Businesses" }] : []), ...navItems].filter((item) => {
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
            <BrandIdentity />

            <Stack direction="row" spacing={1} alignItems="center">
              {visibleNavItems.filter(item => item.to !== '/search-vendors' && (!isAuthenticated || item.label !== 'Help')).map((item) => {
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
                        px: selected ? 1.5 : 1,
                        py: 1,
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              <Tooltip title="Search vendors">
                <IconButton component={RouterLink} to="/search-vendors" aria-label="Search vendors" aria-current={location.pathname.startsWith('/search-vendors') ? 'page' : undefined} color="inherit" sx={{ display: { xs: 'none', md: 'inline-flex' }, color: 'var(--eez-ink-12)', ...(location.pathname.startsWith('/search-vendors') ? { bgcolor: 'action.selected' } : {}) }}>
                  <SearchRoundedIcon />
                </IconButton>
              </Tooltip>
              {isAuthenticated ? (
                <>
                  <Button
                    id="account-menu-button"
                    aria-controls={accountAnchor ? 'account-menu' : undefined}
                    aria-haspopup="menu"
                    aria-expanded={Boolean(accountAnchor)}
                    variant="text"
                    color="inherit"
                    endIcon={<ExpandMoreRoundedIcon fontSize="small" />}
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
                    id="account-menu"
                    MenuListProps={{ "aria-labelledby": "account-menu-button" }}
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
                    <MenuItem component="a" href="https://www.eezevent.com/help.html" target="_blank" rel="noopener noreferrer" aria-label="Help (opens in a new tab)" onClick={() => setAccountAnchor(null)} sx={{ gap: 1.25 }}>
                      <HelpOutlineRoundedIcon fontSize="small" />Help<OpenInNewRoundedIcon sx={{ ml: 'auto', fontSize: 16 }} />
                    </MenuItem>
                    <MenuItem onClick={() => { toggleMode(); setAccountAnchor(null); }} sx={{ gap: 1.25 }}>
                      {mode === 'light' ? <DarkModeRoundedIcon fontSize="small" /> : <LightModeRoundedIcon fontSize="small" />}Switch to {mode === 'light' ? 'dark' : 'light'} mode
                    </MenuItem>
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
                <Divider />
                <MenuItem onClick={() => { toggleMode(); setMobileAnchor(null); }} sx={{ py: 1.5, gap: 1.5 }}>
                  {mode === 'light' ? <DarkModeRoundedIcon fontSize="small" /> : <LightModeRoundedIcon fontSize="small" />}Switch to {mode === 'light' ? 'dark' : 'light'} mode
                </MenuItem>
                {isAuthenticated && <Divider />}
                {isAuthenticated && <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{accountLabel}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{auth?.userEmail}</Typography>
                </Box>}
                {isAuthenticated && <MenuItem onClick={async () => { setMobileAnchor(null); await logout(); }} sx={{ py: 1.5, gap: 1 }}><LogoutRoundedIcon fontSize="small" />Logout</MenuItem>}
              </Menu>
              {!isAuthenticated && <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
                <IconButton sx={{ display: { xs: "none", md: "inline-flex" } }} color="inherit" onClick={toggleMode} aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
                  {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
                </IconButton>
              </Tooltip>}
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
