"use client";
import { vendorProfilePath } from "../lib/vendorProfilePath";
import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { fetchClientEvents, sendVendorInquiry } from "../lib/api";
import { useAuth } from "../lib/auth";
import { RouterLink, useNavigate } from "../lib/navigation";

export default function VendorInquiry({ serviceSlug, serviceId, serviceName, returnTo, initialOpen = false, initialEvent = "", open: controlledOpen, onOpenChange }) {
  const { auth, authReady, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(initialOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(initialEvent);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const isHost = isAuthenticated && auth?.userType === "client";
  const params = new URLSearchParams({ inquiry: "1" });
  if (returnTo) params.set("returnTo", returnTo);
  const profilePath = `${vendorProfilePath({ slug: serviceSlug, service_id: serviceId })}?${params}`;
  const loginPath = `/login?account=client&next=${encodeURIComponent(profilePath)}`;
  const signupPath = `/register?next=${encodeURIComponent(profilePath)}`;
  const createEventPath = `/events/new?returnTo=${encodeURIComponent(profilePath)}`;
  const draftKey = `eezevent-inquiry-draft-${serviceId}`;

  useEffect(() => {
    if (!open || !isHost || !authReady) return;
    let active = true;
    setLoading(true); setError("");
    try {
      const saved = JSON.parse(sessionStorage.getItem(draftKey));
      if (saved?.user === auth.userEmail) setMessage(saved.message || "");
    } catch { /* Draft restoration is optional. */ }
    fetchClientEvents().then(data => {
      if (!active) return;
      setEvents(data);
      setEventId(current => data.some(event => String(event.event_id) === String(current)) ? current : data.length === 1 ? String(data[0].event_id) : "");
    }).catch(err => { if (active) setError(err.message || "Unable to load your events."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, isHost, authReady, auth?.token, draftKey, retry]);

  const rememberDraft = () => {
    try { sessionStorage.setItem(draftKey, JSON.stringify({ user: auth?.userEmail, message })); } catch { /* Continue without a draft if storage is disabled. */ }
  };
  const send = async event => {
    event.preventDefault();
    if (!authReady || !isHost || sending || sent) return;
    if (!events.some(item => String(item.event_id) === String(eventId))) { setError("Choose an event before sending your inquiry."); return; }
    setSending(true); setError("");
    try {
      await sendVendorInquiry({ serviceSlug, serviceId, eventId, message });
      setSent(true);
      try { sessionStorage.removeItem(draftKey); } catch { /* No saved draft to clear. */ }
    } catch (err) { setError(err.message || "Unable to send your inquiry. Please try again."); }
    finally { setSending(false); }
  };
  if (!authReady || (isAuthenticated && !isHost)) return null;

  return <>
    <Paper component="section" aria-label="Inquire about this vendor" variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2.5 }}>
      <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
        <Box><Typography component="h2" variant="h6">Interested in this vendor?</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>{isHost ? "Choose an event and send a message about what you need." : "Sign in as a Host to choose or create an event and send an inquiry."}</Typography></Box>
        <Stack spacing={1} sx={{ flexShrink: 0 }}>
          {isAuthenticated ? <Button variant="contained" startIcon={<SendRoundedIcon />} onClick={() => setOpen(true)} disabled={!authReady}>Send an inquiry</Button> : <Button component={RouterLink} to={loginPath} variant="contained" disabled={!authReady}>Log in to inquire</Button>}
          {!isAuthenticated && <Button component={RouterLink} to={signupPath} color="secondary" size="small">Create a Host account</Button>}
        </Stack>
      </Stack>
    </Paper>
    <Dialog open={open} onClose={() => { if (!sending) setOpen(false); }} fullWidth maxWidth="sm" aria-labelledby="vendor-inquiry-title">
      <DialogTitle id="vendor-inquiry-title" sx={{ pr: 7 }}>{sent ? "Inquiry sent" : `Send an inquiry to ${serviceName || "this vendor"}`}</DialogTitle>
      <IconButton aria-label="Close inquiry" onClick={() => setOpen(false)} disabled={sending} sx={{ position: "absolute", right: 12, top: 12 }}><CloseRoundedIcon /></IconButton>
      {!authReady || loading ? <DialogContent><Stack alignItems="center" sx={{ py: 4 }}><CircularProgress /></Stack></DialogContent> : !isHost ? <>
        <DialogContent><Typography color="text.secondary">{isAuthenticated ? "Inquiries are sent from Host accounts. Sign out of your Business account, then sign in as a Host to continue." : "Sign in or create a Host account to choose an event and send your inquiry."}</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {!isAuthenticated && <Button component={RouterLink} to={signupPath}>Create an account</Button>}
          {isAuthenticated ? <Button variant="contained" onClick={async () => { await logout(); navigate(loginPath); }}>Sign out and log in as Host</Button> : <Button component={RouterLink} to={loginPath} variant="contained">Log in</Button>}
        </DialogActions>
      </> : sent ? <>
        <DialogContent><Alert severity="success">Your inquiry was sent to {serviceName || "the vendor"} for {events.find(event => String(event.event_id) === String(eventId))?.name || "your event"}.</Alert></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}><Button onClick={() => setOpen(false)} variant="contained">Done</Button></DialogActions>
      </> : <Box component="form" onSubmit={send}>
        <DialogContent><Stack spacing={2.5}>
          {error && <Alert severity="error" action={!events.length ? <Button color="inherit" onClick={() => setRetry(value => value + 1)}>Retry</Button> : undefined}>{error}</Alert>}
          {!events.length ? <>
            {!error && <Typography color="text.secondary">Create an event first so the vendor receives the details they need to respond.</Typography>}
            <Button component={RouterLink} to={createEventPath} onClick={rememberDraft} variant="contained">Create an event</Button>
          </> : <>
            <TextField select label="Your event" value={eventId} onChange={event => setEventId(event.target.value)} fullWidth required disabled={sending}>
              {events.map(event => <MenuItem key={event.event_id} value={String(event.event_id)}>{event.name || `Event ${event.event_id}`}</MenuItem>)}
            </TextField>
            <Button component={RouterLink} to={createEventPath} onClick={rememberDraft} color="secondary" sx={{ alignSelf: "flex-start", px: 0 }} disabled={sending}>Create a new event instead</Button>
          </>}
          <TextField label="Your message" placeholder="Tell the vendor what you’re looking for…" multiline minRows={4} value={message} onChange={event => setMessage(event.target.value)} disabled={sending} inputProps={{ maxLength: 2000 }} helperText="Include any questions about packages, availability, or pricing." fullWidth />
        </Stack></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}><Button onClick={() => setOpen(false)} disabled={sending} color="secondary">Cancel</Button><Button type="submit" variant="contained" startIcon={<SendRoundedIcon />} disabled={sending || !eventId || !events.length}>{sending ? "Sending…" : "Send inquiry"}</Button></DialogActions>
      </Box>}
    </Dialog>
  </>;
}
