"use client";
import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, LinearProgress, MenuItem, Paper, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { useAuth } from "../lib/auth";
import { Navigate, RouterLink } from "../lib/navigation";
import { fetchOwnerProfile, fetchVendorServices, fetchVendorDashboardSummary, fetchVendorAttention } from "../lib/api";
import { vendorProfilePath } from "../lib/vendorProfilePath";
import AppDownloadLinks from "../components/AppDownloadLinks";

const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value) || 0);
const count = value => new Intl.NumberFormat("en-US").format(Number(value) || 0);
const dateLabel = value => {
  if (!value) return "Date to be confirmed";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date to be confirmed" : date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
};
const attentionSections = [
  { key: "unsigned_contracts", endpoint: "unsigned-contracts", label: "Unsigned contracts", caption: "Review contracts waiting for a signature", color: "warning" },
  { key: "unscheduled_upcoming", endpoint: "unscheduled-upcoming", label: "Upcoming unscheduled", caption: "Confirm the schedule for the next 7 days", color: "primary" },
  { key: "past_not_completed", endpoint: "past-not-completed", label: "Past due completion", caption: "Close the loop on past events", color: "error" },
];
const panelSx = { p: { xs: 2.5, md: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none", minWidth: 0 };
function Panel({ title, subtitle, children, ...props }) {
  return <Paper component="section" sx={panelSx} {...props}><Typography component="h2" variant="h6" fontWeight={700}>{title}</Typography>{subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>{subtitle}</Typography>}<Box sx={{ mt: 3 }}>{children}</Box></Paper>;
}
function WorkList({ items }) {
  return <Stack divider={<Divider />} spacing={2}>{items.map((item, index) => <Stack key={item.inquiry_id || index} direction="row" spacing={2} sx={{ minWidth: 0 }}>
    <Avatar variant="rounded" sx={{ bgcolor: theme => alpha(theme.palette.primary.main, .1), color: "primary.main", width: 44, height: 44 }}><EventAvailableRoundedIcon /></Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={700} sx={{ overflowWrap: "anywhere" }}>{item.event_name || "Upcoming event"}</Typography><Typography variant="body2" color="text.secondary">{dateLabel(item.start_time)}</Typography><Typography variant="body2" color="text.secondary">{[item.service_name || item.service_type_name, [item.client_first_name, item.client_last_name].filter(Boolean).join(" ")].filter(Boolean).join(" · ")}</Typography><Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" sx={{ mt: 1 }}><Chip size="small" variant="outlined" label={String(item.status || "Upcoming").replaceAll("_", " ")} />{item.quote_amount != null && <Typography variant="body2" fontWeight={600}>{money(item.quote_amount)}</Typography>}</Stack></Box>
  </Stack>)}</Stack>;
}

export default function VendorDashboardPage() {
  const { auth, authReady, isAuthenticated } = useAuth();
  const [services, setServices] = useState(null);
  const [owner, setOwner] = useState(null);
  const [serviceId, setServiceId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [detail, setDetail] = useState(null);
  const vendor = authReady && isAuthenticated && auth?.userType === "vendor";

  useEffect(() => {
    if (!vendor) return;
    const controller = new AbortController();
    let active = true;
    setLoading(true); setError(""); setSummary(null);
    async function load() {
      try {
        const [list, profile] = await Promise.all([fetchVendorServices(), fetchOwnerProfile().catch(() => null)]);
        if (!active) return;
        const nextServices = Array.isArray(list) ? list : [];
        setServices(nextServices); setOwner(profile);
        const selected = nextServices.some(service => String(service.service_id) === serviceId) ? serviceId : "";
        if (selected !== serviceId) { setServiceId(selected); return; }
        if (nextServices.length) {
          const data = await fetchVendorDashboardSummary(selected, { signal: controller.signal });
          if (active) { setSummary(data); setUpdatedAt(new Date()); }
        }
      } catch (err) { if (active && err.name !== "AbortError") setError(err); }
      finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; controller.abort(); };
  }, [vendor, serviceId, revision]);

  useEffect(() => {
    if (!vendor) return;
    const refresh = () => { if (document.visibilityState === "visible") setRevision(value => value + 1); };
    const timer = setInterval(refresh, 5 * 60 * 1000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [vendor]);

  useEffect(() => {
    if (!detail?.endpoint) return;
    const controller = new AbortController();
    fetchVendorAttention(detail.endpoint, { signal: controller.signal }).then(data => {
      const items = Array.isArray(data?.inquiries) ? data.inquiries : [];
      setDetail(current => current?.endpoint === detail.endpoint ? { ...current, loading: false, items: serviceId ? items.filter(item => String(item.service_id) === serviceId) : items } : current);
    }).catch(err => { if (err.name !== "AbortError") setDetail(current => current ? { ...current, loading: false, error: err.message } : current); });
    return () => controller.abort();
  }, [detail?.endpoint, serviceId]);

  if (!authReady) return <Box role="status" sx={{ p: 6, textAlign: "center" }}><CircularProgress aria-label="Loading your workspace" /></Box>;
  if (!isAuthenticated) return <Navigate to="/login?account=vendor&next=%2Fdashboard" replace />;
  if (auth?.userType !== "vendor") return <Navigate to="/events" replace />;
  const cards = summary?.cards || {};
  const revenue = summary?.revenue || {};
  const pipeline = summary?.pipeline || {};
  const stages = [{ key: "open", label: "Open", color: "primary" }, { key: "pending", label: "Pending", color: "warning" }, { key: "confirmed", label: "Scheduled", color: "success" }];
  const total = stages.reduce((sum, stage) => sum + (Number(pipeline[stage.key]) || 0), 0);
  const upcoming = Array.isArray(summary?.upcoming) ? summary.upcoming : [];
  const metrics = [
    { label: "Open inquiries", value: count(cards.open_inquiries), href: "/inquiries?status=open", note: "New opportunities to connect", icon: InboxOutlinedIcon, color: "primary" },
    { label: "Awaiting action", value: count(cards.awaiting_action), href: "/inquiries?status=pending", note: "Pending inquiries and contracts", icon: ScheduleRoundedIcon, color: "warning" },
    { label: "Unscheduled · next 7 days", value: count(cards.upcoming_week), href: "/inquiries?status=confirmed", note: "Confirmed work to schedule", icon: EventAvailableRoundedIcon, color: "success" },
    { label: "Revenue this month", value: money(cards.revenue_this_month), note: revenue.month_delta_pct == null ? "No prior-month comparison" : `${revenue.month_delta_pct > 0 ? "+" : ""}${revenue.month_delta_pct}% vs last month`, icon: PaymentsOutlinedIcon, color: "secondary" },
  ];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return <Stack spacing={3}>
    <Stack direction={{ xs: "column", md: "row" }} gap={3} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
      <Box><Typography variant="overline" color="primary.main" sx={{ letterSpacing: ".15em", fontWeight: 700 }}>BUSINESS WORKSPACE</Typography><Typography component="h1" sx={{ fontWeight: 700, fontSize: { xs: 30, md: 38 }, letterSpacing: "-.03em", lineHeight: 1.2, mt: .5 }}>{greeting}, {owner?.first_name?.trim() || auth.userFirstName || "there"}.</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Your business at a glance. Your next move, in focus.</Typography></Box>
      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap"><Button component={RouterLink} to={`/inquiries${serviceId ? `?service_id=${encodeURIComponent(serviceId)}` : ""}`} color="inherit">View inquiries</Button><TextField select size="small" label="Service" value={serviceId} onChange={event => { setServiceId(event.target.value); setDetail(null); }} disabled={loading || !services?.length} sx={{ minWidth: 190, maxWidth: 330, flex: 1 }}><MenuItem value="">All services</MenuItem>{(services || []).map(service => <MenuItem key={service.service_id} value={String(service.service_id)}>{[service.name || "Service", service.business_name].filter(Boolean).join(" · ")}</MenuItem>)}</TextField><Button variant="outlined" onClick={() => setRevision(value => value + 1)} disabled={loading} aria-label="Refresh dashboard" sx={{ minWidth: 44, height: 40, px: 1 }}><RefreshRoundedIcon /></Button></Stack>
    </Stack>
    {error && <Alert severity={error.status === 402 ? "warning" : "error"} action={<Button color="inherit" onClick={() => setRevision(value => value + 1)}>{error.status === 402 ? "Check again" : "Retry"}</Button>}>
      {error.status === 402 && <Typography fontWeight={700}>Subscription required</Typography>}
      {error.message || "Unable to load your dashboard."}
      {error.status === 402 && !error.ownerActionRequired && <Box sx={{ mt: 2 }}><Typography variant="body2" sx={{ mb: 1 }}>Open the EezEvent mobile app to choose or renew your plan, then check again here.</Typography><AppDownloadLinks /></Box>}
    </Alert>}
    {loading ? <Box role="status" aria-label="Loading dashboard" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>{[0, 1, 2, 3].map(key => <Skeleton key={key} variant="rounded" height={180} />)}</Box> : !error && services?.length === 0 ? <Panel title="Your business starts here" subtitle="Add your business and services in the EezEvent mobile app. Your activity will appear here when you’re ready."><AppDownloadLinks /></Panel> : null}
    {!loading && !error && summary && <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>{metrics.map(({ label, value, note, icon: Icon, color, href }) => <Paper key={label} component={href ? RouterLink : "div"} {...(href ? { to: `${href}${serviceId ? `&service_id=${encodeURIComponent(serviceId)}` : ""}` } : {})} sx={{ ...panelSx, position: "relative", overflow: "hidden", color: "text.primary", textDecoration: "none", ...(href ? { "&:hover": { borderColor: "text.secondary" }, "&:focus-visible": { outline: "2px solid", outlineColor: "primary.light", outlineOffset: 3 } } : {}) }}><Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}><Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography><Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: theme => alpha(theme.palette[color].main, .1), color: `${color}.main` }}><Icon fontSize="small" /></Avatar></Stack><Typography sx={{ fontSize: 36, fontWeight: 700, letterSpacing: "-.03em", my: 1 }}>{value}</Typography><Typography variant="caption" color="text.secondary">{note}</Typography></Paper>)}</Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" }, gap: 3 }}>
        <Panel title="Needs attention" subtitle="Small steps that keep your business moving."><Stack spacing={1}>{attentionSections.map(section => <Button key={section.key} color="inherit" onClick={() => setDetail({ ...section, loading: true, items: [] })} sx={{ textAlign: "left", justifyContent: "space-between", p: 1.5, borderRadius: 2, gap: 2 }}><Box><Typography fontWeight={600}>{section.label}</Typography><Typography variant="body2" color="text.secondary">{section.caption}</Typography></Box><Stack direction="row" spacing={1} alignItems="center"><Typography color={`${section.color}.main`} fontWeight={700} fontSize={24}>{count(summary.attention?.[section.key])}</Typography><ArrowForwardRoundedIcon fontSize="small" /></Stack></Button>)}</Stack></Panel>
        <Panel title="Your pipeline" subtitle={`${count(total)} inquiries across your active pipeline`}><Stack spacing={2.5}>{stages.map(stage => <Box key={stage.key}><Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}><Button component={RouterLink} to={`/inquiries?status=${stage.key}${serviceId ? `&service_id=${encodeURIComponent(serviceId)}` : ""}`} color="inherit" size="small" sx={{ p: 0, minWidth: 0 }}>{stage.label}</Button><Typography variant="body2" fontWeight={700}>{count(pipeline[stage.key])}</Typography></Stack><LinearProgress aria-label={`${stage.label} share of pipeline`} variant="determinate" color={stage.color} value={total ? (Number(pipeline[stage.key]) || 0) / total * 100 : 0} sx={{ height: 9, borderRadius: 9, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { borderRadius: 9 } }} /></Box>)}</Stack></Panel>
        <Panel title="Upcoming work" subtitle="Your next confirmed events, ordered by event date.">{upcoming.length ? <WorkList items={upcoming} /> : <Stack alignItems="center" spacing={1.5} sx={{ py: 4, textAlign: "center" }}><EventAvailableRoundedIcon sx={{ fontSize: 36, color: "text.secondary" }} /><Typography fontWeight={600}>Room for your next great event</Typography><Typography variant="body2" color="text.secondary">Your upcoming confirmed work will appear here.</Typography></Stack>}</Panel>
        <Stack spacing={3}><Panel title="Revenue snapshot" subtitle="A clear view of the business you’re building."><Typography variant="body2" color="text.secondary">This month</Typography><Typography sx={{ fontSize: 36, fontWeight: 700, letterSpacing: "-.03em" }}>{money(revenue.this_month)}</Typography><Divider sx={{ my: 2.5 }} /><Stack direction="row" justifyContent="space-between" gap={2}><Box><Typography variant="body2" color="text.secondary">Last month</Typography><Typography variant="h6">{money(revenue.last_month)}</Typography></Box><Box><Typography variant="body2" color="text.secondary">Year to date</Typography><Typography variant="h6">{money(revenue.ytd)}</Typography></Box></Stack></Panel><Panel title="Your storefront" subtitle="See how your services appear to potential clients."><Stack spacing={1}>{(services || []).filter(service => !serviceId || String(service.service_id) === serviceId).map(service => <Button key={service.service_id} component={RouterLink} to={vendorProfilePath(service)} startIcon={<StorefrontOutlinedIcon />} endIcon={<ArrowForwardRoundedIcon />} sx={{ justifyContent: "space-between", textAlign: "left", color: theme => theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main }}>{service.name || "View service"}</Button>)}</Stack></Panel></Stack>
      </Box>
      <Paper sx={{ ...panelSx, bgcolor: theme => alpha(theme.palette.primary.main, .04) }}><Stack direction={{ xs: "column", md: "row" }} gap={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}><Box><Typography fontWeight={700}>Keep business moving, wherever you are.</Typography><Typography variant="body2" color="text.secondary">Use the EezEvent app to respond to inquiries, sign contracts, and manage bookings.</Typography></Box><AppDownloadLinks /></Stack></Paper>
      {updatedAt && <Typography role="status" variant="caption" color="text.secondary" sx={{ textAlign: "right" }}>Updated {updatedAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} · Refreshes every 5 minutes</Typography>}
    </>}
    <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="sm"><DialogTitle>{detail?.label}</DialogTitle><DialogContent dividers>{detail?.loading ? <Box role="status" sx={{ textAlign: "center", p: 4 }}><CircularProgress aria-label="Loading attention items" /></Box> : detail?.error ? <Alert severity="error">{detail.error}</Alert> : detail?.items?.length ? <WorkList items={detail.items} /> : <Stack spacing={1} alignItems="center" sx={{ py: 4 }}><CheckCircleOutlineRoundedIcon color="success" /><Typography>All clear for this service selection.</Typography></Stack>}<Divider sx={{ my: 3 }} /><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Continue in the mobile app to take action on these items.</Typography><AppDownloadLinks /></DialogContent><DialogActions><Button onClick={() => setDetail(null)}>Close</Button></DialogActions></Dialog>
  </Stack>;
}
