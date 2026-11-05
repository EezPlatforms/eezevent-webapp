"use client";
import { useEffect, useState } from "react";
import { Alert, Box, Button, Checkbox, CircularProgress, Divider, FormControlLabel, IconButton, InputAdornment, Link, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import logo from "../../assets/eezevent-just-logo.png";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { isSocialOnlyAuth as socialOnly } from "../lib/authMode";
import AppleSignInButton, { appleSignInConfigured } from "../components/AppleSignInButton";
import GoogleRegistrationButton from "../components/GoogleRegistrationButton";
import { fetchLegalDocument, registerAccount } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Navigate, RouterLink } from "../lib/navigation";

export default function RegistrationPage({ nextPath = "/" }) {
  const { isAuthenticated, validateEmail, resendValidationCode, registerWithGoogle, registerWithApple } = useAuth();
  const [accountType, setAccountType] = useState("client");
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "", confirmPassword: "", is_event_planner: false });
  const [showPassword, setShowPassword] = useState(false);
  const [documents, setDocuments] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState("");
  const [retry, setRetry] = useState(0);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [stage, setStage] = useState("register");
  const [code, setCode] = useState("");
  const [appleBusy, setAppleBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const googleConfigured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const label = accountType === "vendor" ? "Business" : "Host";

  useEffect(() => {
    let active = true;
    setDocumentLoading(true);
    setDocuments(null);
    setDocumentError("");
    setAcceptedPrivacy(false);
    setAcceptedAgreement(false);
    Promise.all([fetchLegalDocument("privacyPolicy"), fetchLegalDocument(accountType === "vendor" ? "vendorAgreement" : "customerTerms")])
      .then(([privacy, agreement]) => {
        if (!privacy?.version || !agreement?.version) throw new Error("Unable to load the current agreements.");
        if (active) setDocuments({ privacy, agreement });
      })
      .catch(() => { if (active) setDocumentError("We couldn’t load the current agreements. Please retry before creating your account."); })
      .finally(() => { if (active) setDocumentLoading(false); });
    return () => { active = false; };
  }, [accountType, retry, socialOnly]);

  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault();
    if (socialOnly) return;
    if (busy) return;
    setError("");
    if (!form.first_name.trim() || !form.last_name.trim()) { setError("Enter your first and last name."); return; }
    if (form.password.length < 8) { setError("Use a password with at least 8 characters."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (!documents || !acceptedPrivacy || !acceptedAgreement) { setError("Read and accept the Privacy Policy and account agreement to continue."); return; }
    const acceptedAt = new Date().toISOString();
    const payload = {
      first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(), password: form.password,
      accepted_terms_at: acceptedAt, accepted_terms_version: documents.privacy.version,
      ...(accountType === "vendor" ? {
        accepted_vendor_agreement_at: acceptedAt, accepted_vendor_agreement_version: documents.agreement.version,
      } : {
        is_event_planner: form.is_event_planner,
        accepted_customer_terms_at: acceptedAt, accepted_customer_terms_version: documents.agreement.version,
      }),
    };
    setBusy(true);
    try {
      await registerAccount(accountType, payload);
      setForm(current => ({ ...current, email: payload.email, password: "", confirmPassword: "" }));
      setStage("verify");
    } catch (err) { setError(err.message || "Unable to create your account. Please try again."); }
    finally { setBusy(false); }
  };
  const verify = async event => {
    event.preventDefault();
    if (busy) return;
    if (!/^\d{6}$/.test(code)) { setError("Enter the 6-digit code from your email."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      await validateEmail({ loginType: accountType, email: form.email, code });
      setStage("complete");
    } catch (err) { setError(err.message || "Unable to verify this code."); }
    finally { setBusy(false); }
  };
  const resend = async () => {
    if (resending) return;
    setResending(true); setError(""); setNotice("");
    try {
      await resendValidationCode({ loginType: accountType, email: form.email });
      setNotice("A new code has been sent. Check your inbox and spam folder.");
    } catch (err) { setError(err.message || "Unable to resend your code."); }
    finally { setResending(false); }
  };

  const socialRegister = async (response, provider = "Google") => {
    if (busy) return;
    setError("");
    if (!(response.credential || response.authorization?.id_token) || !documents || !acceptedPrivacy || !acceptedAgreement) { setError(`Accept the agreements before signing up with ${provider}.`); return; }
    const acceptedAt = new Date().toISOString();
    setBusy(true);
    try {
      await (provider === "Apple" ? registerWithApple : registerWithGoogle)({
        id_token: response.credential || response.authorization?.id_token, user_type: accountType,
        ...(provider === "Apple" ? { email: response.user?.email, first_name: response.user?.name?.firstName, last_name: response.user?.name?.lastName } : {}),
        accepted_terms_at: acceptedAt, accepted_terms_version: documents.privacy.version,
        ...(accountType === "vendor" ? {
          accepted_vendor_agreement_at: acceptedAt, accepted_vendor_agreement_version: documents.agreement.version,
        } : {
          is_event_planner: form.is_event_planner,
          accepted_customer_terms_at: acceptedAt, accepted_customer_terms_version: documents.agreement.version,
        }),
      });
    } catch (err) { setError(err.message || `${provider} sign-up failed. Please try again.`); }
    finally { setBusy(false); }
  };

  if (isAuthenticated) return <Navigate to={nextPath} replace />;
  return <Box sx={{ minHeight: "calc(100dvh - 220px)", display: "grid", placeItems: "center", py: { xs: 1, md: 3 } }}><Paper sx={{ width: "100%", maxWidth: 460, mx: "auto", p: { xs: 3, sm: 4.5 }, border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: theme => theme.palette.mode === "light" ? "0 16px 48px rgba(24,36,59,0.08)" : "0 16px 48px rgba(0,0,0,0.18)" }}>
    <Stack spacing={2.5}>
      <Stack spacing={1.5} alignItems="center" sx={{ textAlign: "center", mb: .5 }}>
        <Box component="img" src={logo.src} alt="EezEvent" sx={{ width: 48, height: 48, borderRadius: 1.5, mb: .5 }} />
        <Typography component="h1" sx={{ fontSize: { xs: 29, sm: 32 }, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-.025em" }}>{stage === "verify" ? "Check your email" : stage === "complete" ? "You’re all set" : "Create your account"}</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 16 }}>{stage === "register" ? "Choose how you’ll use EezEvent." : `${label} account · ${form.email}`}</Typography>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {notice && <Alert severity="success">{notice}</Alert>}
      {stage === "register" ? <>
        <ToggleButtonGroup exclusive fullWidth value={accountType} disabled={busy || appleBusy} onChange={(_, value) => { if (value) { setAccountType(value); setError(""); } }} aria-label="Account type"
          sx={{
            gap: 1.5,
            "& .MuiToggleButtonGroup-grouped": { border: "1px solid", borderColor: "divider", borderRadius: "12px !important", m: "0 !important" },
            "& .MuiToggleButton-root": { color: "text.secondary", py: 1.75, flexDirection: "column", gap: .75, fontSize: 15, fontWeight: 600, textTransform: "none" },
            "& .MuiToggleButton-root.Mui-selected": {
              bgcolor: theme => alpha(theme.palette.primary.main, theme.palette.mode === "light" ? .06 : .18),
              color: theme => theme.palette.mode === "light" ? theme.palette.primary.main : theme.palette.primary.light,
              borderColor: "primary.main", "&:hover": { bgcolor: theme => alpha(theme.palette.primary.main, .12) },
            },
          }}>
          <ToggleButton value="vendor"><StorefrontOutlinedIcon />Business</ToggleButton>
          <ToggleButton value="client"><PersonOutlineRoundedIcon />Host</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", lineHeight: 1.6 }}>{accountType === "vendor" ? "Showcase your services and connect with hosts." : "Plan your events and discover local vendors."}</Typography>
        <Stack component="form" onSubmit={submit} spacing={2}>
          {!socialOnly && <>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField label="First name" name="first_name" value={form.first_name} onChange={update} required autoComplete="given-name" disabled={busy || appleBusy} inputProps={{ maxLength: 100 }} />
            <TextField label="Last name" name="last_name" value={form.last_name} onChange={update} required autoComplete="family-name" disabled={busy || appleBusy} inputProps={{ maxLength: 100 }} />
          </Box>
          <TextField label="Email" name="email" type="email" value={form.email} onChange={update} required autoComplete="email" disabled={busy || appleBusy} />
          <TextField label={accountType === "vendor" ? "Phone number" : "Phone number (optional)"} name="phone" type="tel" value={form.phone} onChange={update} required={accountType === "vendor"} autoComplete="tel" disabled={busy || appleBusy} />
          <TextField label="Password" name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={update} required autoComplete="new-password" disabled={busy || appleBusy} helperText="At least 8 characters." inputProps={{ minLength: 8 }} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}</IconButton></InputAdornment> }} />
          <TextField label="Confirm password" name="confirmPassword" type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={update} required autoComplete="new-password" disabled={busy || appleBusy} />
          </>}
          {accountType === "client" && <FormControlLabel control={<Checkbox checked={form.is_event_planner} onChange={event => setForm(current => ({ ...current, is_event_planner: event.target.checked }))} size="small" disabled={busy || appleBusy} />} sx={{ "& .MuiFormControlLabel-label": { fontSize: 14 } }} label="I’m an event planner" />}
          <Divider />
          {documentLoading && <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={18} /><Typography variant="body2">Loading current agreements…</Typography></Stack>}
          {documentError && <Alert severity="warning" action={<Button color="inherit" onClick={() => setRetry(value => value + 1)}>Retry</Button>}>{documentError}</Alert>}
          {documents && <Stack spacing={1.5} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: theme => alpha(theme.palette.primary.main, .025) }}>
            <Typography variant="body2" fontWeight={600}>Before you continue</Typography>
            <FormControlLabel sx={{ m: 0, alignItems: "flex-start", "& .MuiFormControlLabel-label": { fontSize: 14, lineHeight: 1.7, pt: .25 } }} control={<Checkbox size="small" required checked={acceptedPrivacy} onChange={event => setAcceptedPrivacy(event.target.checked)} disabled={busy || appleBusy} sx={{ p: .5, mr: 1 }} />} label={<>
              I accept the <Link href="https://eezevent.com/agreements/privacy-policy.html" target="_blank" rel="noopener noreferrer" aria-label="Privacy Policy (opens in a new tab)" onClick={event => event.stopPropagation()} sx={{ fontSize: "inherit", lineHeight: "inherit", color: "inherit", fontWeight: 600, textUnderlineOffset: 3 }}>Privacy Policy</Link>.
            </>} />
            <FormControlLabel sx={{ m: 0, alignItems: "flex-start", "& .MuiFormControlLabel-label": { fontSize: 14, lineHeight: 1.7, pt: .25 } }} control={<Checkbox size="small" required checked={acceptedAgreement} onChange={event => setAcceptedAgreement(event.target.checked)} disabled={busy || appleBusy} sx={{ p: .5, mr: 1 }} />} label={<>
              I accept the <Link href={accountType === "vendor" ? "https://eezevent.com/agreements/vendor-agreement.html" : "https://eezevent.com/agreements/customer-agreement.html"} target="_blank" rel="noopener noreferrer" aria-label={`${accountType === "vendor" ? "Vendor" : "Customer"} Agreement (opens in a new tab)`} onClick={event => event.stopPropagation()} sx={{ fontSize: "inherit", lineHeight: "inherit", color: "inherit", fontWeight: 600, textUnderlineOffset: 3 }}>{accountType === "vendor" ? "Vendor Agreement" : "Customer Agreement"}</Link>.
            </>} />
          </Stack>}
          {!socialOnly && <Button type="submit" variant="contained" size="large" disabled={busy || appleBusy || !documents || !acceptedPrivacy || !acceptedAgreement}>{busy ? "Creating account…" : `Create ${label} account`}</Button>}
          {googleConfigured ? <>
            {!socialOnly && <Divider>or sign up with Google</Divider>}
            {documents && acceptedPrivacy && acceptedAgreement
              ? <GoogleRegistrationButton onCredential={response => socialRegister(response)} onError={setError} disabled={busy || appleBusy} />
              : <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", display: "block", lineHeight: 1.6 }}>Accept both agreements to continue with Google.</Typography>}
          </> : socialOnly && !appleSignInConfigured ? <Alert severity="info">Account creation is temporarily unavailable. Please try again later.</Alert> : null}
          <AppleSignInButton disabled={busy || appleBusy || !documents || !acceptedPrivacy || !acceptedAgreement} onBusyChange={setAppleBusy} onError={setError} onCredential={response => socialRegister(response, "Apple")} />
        </Stack>
      </> : stage === "verify" ? <Stack component="form" onSubmit={verify} spacing={2}>
        <Typography color="text.secondary">Enter the 6-digit verification code sent to your email address. You can request a new code if it doesn’t arrive.</Typography>
        <TextField label="Verification code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required disabled={busy || resending} autoComplete="one-time-code" inputProps={{ inputMode: "numeric", pattern: "[0-9]{6}", maxLength: 6 }} />
        <Button type="submit" variant="contained" disabled={busy || resending}>{busy ? "Verifying…" : "Verify email"}</Button>
        <Button type="button" color="secondary" onClick={resend} disabled={busy || resending}>{resending ? "Sending…" : "Resend code"}</Button>
      </Stack> : <><Alert severity="success">Your email is verified. Sign in to start using your {label} account.</Alert><Button component={RouterLink} to={`/login?account=${accountType}&next=${encodeURIComponent(nextPath)}`} variant="contained">Log in as {label}</Button></>}
      {stage !== "complete" && <><Divider /><Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", lineHeight: 1.8 }}>Already have an account? <Link component={RouterLink} to={`/login?account=${accountType}&next=${encodeURIComponent(nextPath)}`} sx={{ color: theme => theme.palette.mode === "light" ? theme.palette.primary.main : theme.palette.primary.light, fontWeight: 600, textUnderlineOffset: 3 }}>Log in</Link></Typography></>}
    </Stack>
  </Paper></Box>;
}
