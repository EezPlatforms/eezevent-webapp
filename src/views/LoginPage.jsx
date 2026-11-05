"use client";
import AppleSignInButton from "../components/AppleSignInButton";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import logo from "../../assets/eezevent-just-logo.png";
import { alpha } from "@mui/material/styles";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  Alert,
  Box,
  Button,
  Divider,
  Link,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, RouterLink, useLocation, useNavigate } from "../lib/navigation";
import { isSocialOnlyAuth } from "../lib/authMode";
import { useAuth } from "../lib/auth";

export default function LoginPage({ initialLoginType = "client", initialNextPath = "/" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, loginWithGoogle, loginWithApple, resendValidationCode, validateEmail } = useAuth();
  const [loginType, setLoginType] = useState(initialLoginType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [requireValidation, setRequireValidation] = useState(false);
  const [validationCode, setValidationCode] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [validating, setValidating] = useState(false);
  const [resending, setResending] = useState(false);
  const googleButtonRef = useRef(null);
  const googleInitializedRef = useRef(false);
  const loginTypeRef = useRef(loginType);
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "";


  const nextPath = initialNextPath;

  useEffect(() => {
    loginTypeRef.current = loginType;
  }, [loginType]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setValidationMessage("");
    setLoading(true);

    try {
      await login({ loginType, email, password });
      navigate(nextPath, { replace: true });
    } catch (err) {
      const message = err.message || "Login failed";
      if (message.toLowerCase().includes("not validated")) {
        setRequireValidation(true);
        setError("Email not validated. Enter the 6-digit code sent to your email.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = useCallback(
    async (googleResponse) => {
      const credential = googleResponse?.credential;
      if (!credential) {
        setError("Google login failed. Please try again.");
        return;
      }

      setGoogleLoading(true);
      setError("");
      setValidationMessage("");
      setRequireValidation(false);

      try {
        const selectedLoginType = loginTypeRef.current;
        await loginWithGoogle({ loginType: selectedLoginType, idToken: credential });
        navigate(nextPath, { replace: true });
      } catch (err) {
        setError(err.message || "Google login failed");
      } finally {
        setGoogleLoading(false);
      }
    },
    [loginWithGoogle, navigate, nextPath],
  );

  useEffect(() => {
    if (isAuthenticated || !googleClientId) {
      return undefined;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        return;
      }

      if (!googleInitializedRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        googleInitializedRef.current = true;
      }

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: Math.min(400, googleButtonRef.current.clientWidth || 320),
        });
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return undefined;
    }

    let script = document.getElementById("google-identity-sdk");
    const onLoad = () => initializeGoogle();

    if (!script) {
      script = document.createElement("script");
      script.id = "google-identity-sdk";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = onLoad;
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", onLoad);
    }

    return () => {
      script?.removeEventListener("load", onLoad);
    };
  }, [googleClientId, handleGoogleCredential, isAuthenticated]);

  const handleValidate = async () => {
    setError("");
    setValidationMessage("");
    setValidating(true);
    try {
      await validateEmail({ loginType, email, code: validationCode });
      setRequireValidation(false);
      setValidationCode("");
      setValidationMessage("Email validated successfully. Please log in again.");
    } catch (err) {
      setError(err.message || "Invalid validation code");
    } finally {
      setValidating(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setValidationMessage("");
    setResending(true);
    try {
      await resendValidationCode({ loginType, email });
      setValidationMessage("A new validation code has been sent to your email.");
    } catch (err) {
      setError(err.message || "Unable to resend code");
    } finally {
      setResending(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={nextPath} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 220px)",
        py: { xs: 1, md: 3 },
        display: "grid",
        placeItems: "center",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 3, sm: 4.5 },
          borderRadius: 3,
          border: "var(--eez-border-3)",
          background:
            "var(--eez-surface-18)",
          boxShadow: theme => theme.palette.mode === "light" ? "0 16px 48px rgba(24,36,59,0.08)" : "0 16px 48px rgba(0,0,0,0.18)",
        }}
      >
        <Stack spacing={2.5}>
          <Stack spacing={1.5} alignItems="center" sx={{ textAlign: "center", mb: .5 }}>
            <Box component="img" src={logo.src} alt="EezEvent" sx={{ width: 48, height: 48, borderRadius: 1.5, mb: .5 }} />
            <Typography component="h1" sx={{ fontSize: { xs: 29, sm: 32 }, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-.025em" }}>Welcome back</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 16 }}>Choose your account to continue.</Typography>
          </Stack>

          <ToggleButtonGroup
            exclusive
            value={loginType}
            onChange={(_event, nextValue) => {
              if (!nextValue) return;
              setLoginType(nextValue);
              setError("");
              setValidationMessage("");
              setRequireValidation(false);
            }}
            fullWidth
            aria-label="Sign-in account type"
            disabled={loading || googleLoading || appleLoading}
            sx={{
              gap: 1.5,
              "& .MuiToggleButtonGroup-grouped": { border: "1px solid", borderColor: "divider", borderRadius: "12px !important", m: "0 !important" },
              "& .MuiToggleButton-root": { color: "text.secondary", py: 1.75, flexDirection: "column", gap: .75, fontSize: 15, fontWeight: 600, textTransform: "none" },
              "& .MuiToggleButton-root.Mui-selected": {
                bgcolor: theme => alpha(theme.palette.primary.main, theme.palette.mode === "light" ? .06 : .18),
                color: theme => theme.palette.mode === "light" ? theme.palette.primary.main : theme.palette.primary.light,
                borderColor: "primary.main",
                "&:hover": { bgcolor: theme => alpha(theme.palette.primary.main, .12) },
              },
            }}
          >
            <ToggleButton value="vendor"><StorefrontOutlinedIcon />Business</ToggleButton>
            <ToggleButton value="client"><PersonOutlineRoundedIcon />Host</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", lineHeight: 1.6 }}>
            {loginType === "vendor" ? "Access your business account and services." : "Access your events and planning workspace."}
          </Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {validationMessage ? <Alert severity="success">{validationMessage}</Alert> : null}

          {googleClientId ? (
            <Stack spacing={1.5} alignItems="center" sx={{ py: 1 }}>
              <Box
                ref={googleButtonRef}
                sx={{ width: "100%", minHeight: 44, display: "flex", justifyContent: "center", opacity: googleLoading || appleLoading ? .6 : 1, pointerEvents: googleLoading || appleLoading ? "none" : "auto" }}
              />
              <Typography variant="caption" color="text.secondary" role="status" aria-live="polite" sx={{ textAlign: "center" }}>
                {googleLoading ? "Signing you in…" : "Continue securely with your Google account."}
              </Typography>
            </Stack>
          ) : (
            <Alert severity="info">Google sign-in is currently unavailable. Please try again later.</Alert>
          )}
          <AppleSignInButton disabled={loading || googleLoading || appleLoading} onBusyChange={setAppleLoading} onError={setError} onCredential={async response => {
            setError(""); setValidationMessage(""); setRequireValidation(false);
            await loginWithApple({ loginType, idToken: response.authorization.id_token });
            navigate(nextPath, { replace: true });
          }} />
          {!isSocialOnlyAuth && googleClientId && <Divider sx={{ color: "text.secondary", fontSize: 13 }}>or use email</Divider>}

          {!isSocialOnlyAuth ? (
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((current) => !current)} edge="end">
                        {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                disabled={loading}
              >
                {loading ? "Signing in..." : `Sign in as ${loginType === "vendor" ? "Business" : "Host"}`}
              </Button>
            </Stack>
          ) : null}

          {!isSocialOnlyAuth && requireValidation ? (
            <Paper
              sx={{
                p: 2.25,
                border: "var(--eez-border-3)",
                backgroundColor: "var(--eez-surface-7)",
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="h6">Validate your email</Typography>
                <Typography color="text.secondary">
                  Enter the 6-digit code sent to {email || "your email address"}.
                </Typography>
                <TextField
                  label="Validation code"
                  value={validationCode}
                  onChange={(event) => setValidationCode(event.target.value)}
                  inputProps={{ inputMode: "numeric", maxLength: 6 }}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                  <Button variant="contained" onClick={handleValidate} disabled={validating}>
                    {validating ? "Validating..." : "Validate email"}
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={handleResend} disabled={resending}>
                    {resending ? "Sending..." : "Resend code"}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ) : null}
          <Divider />
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", lineHeight: 1.8 }}>New to EezEvent?{" "}<Link component={RouterLink} to={`/register?next=${encodeURIComponent(nextPath)}`} sx={{ color: theme => theme.palette.mode === "light" ? theme.palette.primary.main : theme.palette.primary.light, fontWeight: 600, textUnderlineOffset: 3 }}>Create an account</Link></Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
