"use client";
import { useState } from "react";
import { Box, Button, Divider, InputAdornment, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { RouterLink, useNavigate } from "../lib/navigation";
import { useAuth } from "../lib/auth";

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, auth } = useAuth();
  const [zipcode, setZipcode] = useState("");
  const [error, setError] = useState(false);
  const search = event => {
    event.preventDefault();
    const zip = zipcode.trim();
    if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) { setError(true); return; }
    navigate(zip ? `/search-vendors?zipcode=${encodeURIComponent(zip)}` : "/search-vendors");
  };
  return <Stack spacing={4} sx={{ py: { xs: 2, md: 6 } }}>
    <Box sx={{ width: "100%" }}>
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: ".16em" }}>{isAuthenticated ? "Welcome back" : "Welcome to EezEvent"}</Typography>
      <Typography component="h1" variant="h1" sx={{ fontSize: { xs: 42, md: 56, lg: 64 }, lineHeight: 1.12, mt: 1, mb: 2 }}>Your next event starts here.</Typography>
      <Typography sx={{ fontSize: { xs: 18, md: 21 }, lineHeight: 1.65 }} color="text.secondary">Find the right vendors for your event, or sign in to your workspace.</Typography>
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.35fr) minmax(0, 1fr)" }, gap: 3 }}>
      <Paper component="section" sx={{ order: { xs: 2, md: 1 }, p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none" }}>
        <Stack spacing={2.5}>
          <Box sx={{ width: 48, height: 48, bgcolor: "primary.main", color: "primary.contrastText", borderRadius: 2, display: "grid", placeItems: "center" }}><SearchRoundedIcon /></Box>
          <Box><Typography component="h2" variant="h5" gutterBottom>Find vendors near you</Typography><Typography color="text.secondary">Explore services, compare packages, and read reviews. No account needed.</Typography></Box>
          <Stack component="form" onSubmit={search} spacing={1.5}>
            <TextField label="Your event ZIP code" placeholder="28277" value={zipcode} onChange={event => { setZipcode(event.target.value); setError(false); }} error={error} helperText={error ? "Enter a valid U.S. ZIP code." : "Enter a ZIP code or go straight to vendor search."} inputProps={{ inputMode: "numeric", maxLength: 10, autoComplete: "postal-code" }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> }} />
            <Button type="submit" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>Search vendors</Button>
          </Stack>
        </Stack>
      </Paper>
      <Paper component="section" sx={{ order: { xs: 1, md: 2 }, p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none" }}>
        <Stack spacing={3}>
          {isAuthenticated ? <>
            <Typography component="h2" variant="h5">Good to see you{auth?.userFirstName ? `, ${auth.userFirstName}` : ""}.</Typography>
            <Typography color="text.secondary">You’re signed in. Explore vendors{auth?.userType === "client" ? " or pick up where you left off with your events" : " and find inspiration for your next event"}.</Typography>
            <Button component={RouterLink} to={auth?.userType === "client" ? "/events" : "/search-vendors"} variant="outlined" color="secondary" endIcon={<ArrowForwardRoundedIcon />}>{auth?.userType === "client" ? "My events" : "Explore vendors"}</Button>
          </> : <>
            <Box><Typography component="h2" variant="h5" gutterBottom>Already have an account?</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Sign in to your Host or Business workspace.</Typography><Button component={RouterLink} to="/login" variant="outlined" color="secondary" fullWidth startIcon={<LoginRoundedIcon />}>Log in</Button></Box>
            <Divider />
            <Box><Typography component="h2" variant="h6" gutterBottom>New to EezEvent?</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Create a Host account to plan events or a Business account for your services.</Typography><Button component={RouterLink} to="/register" variant="outlined" color="secondary" fullWidth startIcon={<PersonAddAltRoundedIcon />}>Create an account</Button></Box>
          </>}
        </Stack>
      </Paper>
    </Box>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="center" alignItems="center" sx={{ pt: 1 }}>
      <Typography color="text.secondary" variant="body2">Want to learn more about EezEvent?</Typography>
      <Link href="https://www.eezevent.com" target="_blank" rel="noopener noreferrer" sx={{ color: "text.primary", display: "inline-flex", gap: .75, alignItems: "center", textUnderlineOffset: 4 }}>Visit www.eezevent.com <OpenInNewRoundedIcon sx={{ fontSize: 16 }} /></Link>
    </Stack>
  </Stack>;
}
