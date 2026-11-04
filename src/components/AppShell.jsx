"use client";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { RouterLink, useLocation } from "../lib/navigation";
import logo from "../../assets/eezevent-just-logo.png";
import { navItems } from "../data/content";
import { useAuth } from "../lib/auth";

export default function AppShell({ children }) {
  const location = useLocation();
  const { auth, isAuthenticated, logout } = useAuth();
  const [accountAnchor, setAccountAnchor] = useState(null);
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
            "linear-gradient(180deg, rgba(38,47,194,0.98) 0%, rgba(33,42,162,0.96) 100%)",
          borderBottom: "1px solid rgba(120, 147, 255, 0.26)",
          boxShadow: "0 10px 24px rgba(9, 13, 50, 0.24)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 84, gap: 2, justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
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
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(230,231,255,0.2)",
                }}
              />
              <Box>
                <Typography variant="h5" sx={{ lineHeight: 1, color: "common.white" }}>
                  EezEvent
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Event planning with operational discipline
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {visibleNavItems.map((item) => {
                  const selected =
                    item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);

                  return (
                    <Button
                      key={item.to}
                      component={RouterLink}
                      to={item.to}
                      variant={selected ? "contained" : "text"}
                      color={selected ? "primary" : "inherit"}
                      sx={{
                        display: { xs: "none", sm: "inline-flex" },
                        color: selected ? "common.white" : "rgba(230,231,255,0.88)",
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
                      color: "rgba(230,231,255,0.9)",
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
                        border: "1px solid rgba(120,147,255,0.18)",
                        background:
                          "linear-gradient(180deg, rgba(32,40,132,0.98), rgba(21,28,99,0.98))",
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
              {!isAuthenticated ? (
                <Button
                  component="a"
                  href="mailto:support@eezevent.com?subject=Early%20access%20request"
                  variant="outlined"
                  color="secondary"
                  sx={{ display: { xs: "none", md: "inline-flex" } }}
                >
                  Request access
                </Button>
              ) : null}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {children}
      </Container>
    </Box>
  );
}
