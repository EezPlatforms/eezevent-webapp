"use client";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import GoogleIcon from "@mui/icons-material/Google";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  Alert,
  Box,
  Button,
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
import { Navigate, useLocation, useNavigate } from "../lib/navigation";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, loginWithGoogle, resendValidationCode, validateEmail } = useAuth();
  const [loginType, setLoginType] = useState("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "";
  const authMode = String(
    process.env.NEXT_PUBLIC_AUTH_MODE || process.env.NEXT_PUBLIC_AUTH_MODE || "mixed",
  ).toLowerCase();
  const isSocialOnlyAuth = authMode === "social_only";

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const nextPath = location.state?.nextPath || "/";

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
    if (!googleClientId) {
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
          width: 392,
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
  }, [googleClientId, handleGoogleCredential]);

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

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 160px)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 480,
          p: { xs: 3, md: 4 },
          border: "1px solid rgba(120,147,255,0.18)",
          background:
            "linear-gradient(180deg, rgba(32,40,132,0.96), rgba(21,28,99,0.96))",
          boxShadow: "0 18px 40px rgba(8, 12, 46, 0.18)",
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" color="primary.light">
              Sign In
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.5 }}>
              Access your EezEvent workspace
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Use the same client or vendor credentials supported by the mobile app and backend.
            </Typography>
          </Box>

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
            sx={{
              "& .MuiToggleButton-root": {
                color: "text.secondary",
                borderColor: "rgba(120,147,255,0.24)",
                py: 1.2,
              },
              "& .Mui-selected": {
                backgroundColor: "rgba(46,53,232,0.18) !important",
                color: "common.white !important",
              },
            }}
          >
            <ToggleButton value="client">Client</ToggleButton>
            <ToggleButton value="vendor">Vendor</ToggleButton>
          </ToggleButtonGroup>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {validationMessage ? <Alert severity="success">{validationMessage}</Alert> : null}

          {googleClientId ? (
            <Paper
              sx={{
                p: 2,
                border: "1px solid rgba(120,147,255,0.18)",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <Stack spacing={1.25}>
                <Typography variant="body2" color="text.secondary">
                  Use the same Google sign-in configuration as the mobile app.
                </Typography>
                <Box
                  ref={googleButtonRef}
                  sx={{
                    minHeight: 44,
                    opacity: googleLoading ? 0.65 : 1,
                    pointerEvents: googleLoading ? "none" : "auto",
                  }}
                />
                {googleLoading ? (
                  <Button variant="contained" startIcon={<GoogleIcon />} disabled fullWidth>
                    Signing in with Google...
                  </Button>
                ) : null}
              </Stack>
            </Paper>
          ) : (
            <Alert severity="info">
              Google sign-in is not configured. Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` or
              `EXPO_PUBLIC_GOOGLE_CLIENT_ID` for the web app.
            </Alert>
          )}

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
                {loading ? "Signing in..." : `Sign in as ${loginType}`}
              </Button>
            </Stack>
          ) : null}

          {requireValidation ? (
            <Paper
              sx={{
                p: 2.25,
                border: "1px solid rgba(120,147,255,0.18)",
                backgroundColor: "rgba(255,255,255,0.05)",
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
        </Stack>
      </Paper>
    </Box>
  );
}
