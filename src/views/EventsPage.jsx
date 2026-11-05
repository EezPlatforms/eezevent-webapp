"use client";
import { alpha } from "@mui/material/styles";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { memo, useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { Navigate, useNavigate } from "../lib/navigation";
import { useAuth } from "../lib/auth";
import { fetchClientEvents } from "../lib/api";
import { getEventTypeIcon } from "../lib/eventTypeIcons";

const INACTIVE_STATUSES = new Set(["cancelled", "completed", "archived"]);

function formatDateRange(startTime, endTime) {
  if (!startTime || !endTime) return "Date not available";

  const start = new Date(startTime);
  const end = new Date(endTime);
  const sameDay = start.toDateString() === end.toDateString();

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (sameDay) {
    return `${dateFormatter.format(start)} · ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
  }

  return `${dateFormatter.format(start)} - ${dateFormatter.format(end)}`;
}

function formatBudget(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "Budget pending";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const EventCard = memo(function EventCard({ event }) {
  const EventTypeIcon = getEventTypeIcon(event.event_type);
  const normalizedStatus = String(event.status || "In Progress").trim().toLowerCase();
  const statusTone = normalizedStatus === "cancelled" ? "error" : normalizedStatus === "completed" ? "success" : "primary";
  const created = event.created_at ? new Date(event.created_at) : null;
  const createdLabel = created && !Number.isNaN(created.getTime())
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(created) : "";
  return <Paper component="article" sx={{ height: "100%", p: { xs: 2.5, sm: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 3, bgcolor: "background.paper", boxShadow: "0 4px 20px rgba(7,11,42,.05)" }}>
    <Stack spacing={2.5}>
      <Stack direction="row" gap={2} alignItems="flex-start">
        <Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", flexShrink: 0, borderRadius: 2, bgcolor: theme => alpha(theme.palette.primary.main, .07), color: theme => theme.palette.mode === "light" ? theme.palette.primary.main : theme.palette.primary.light }}><EventTypeIcon sx={{ fontSize: 24 }} /></Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>{event.event_type || "Event"}</Typography>
          <Typography component="h2" sx={{ fontSize: { xs: 21, sm: 24 }, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.3, mt: .5, overflowWrap: "anywhere" }}>{event.name}</Typography>
        </Box>
        <Box sx={{ textAlign: "right", flexShrink: 0, maxWidth: "32%" }}>
          <Typography variant="caption" color="text.secondary">Budget</Typography>
          <Typography sx={{ fontSize: { xs: 16, sm: 20 }, fontWeight: 700, mt: .5, overflowWrap: "anywhere" }}>{formatBudget(event.budget)}</Typography>
        </Box>
      </Stack>
      {event.description && <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{event.description}</Typography>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)" }, gap: { xs: 2, sm: 2.5 }, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" spacing={1} sx={{ gridColumn: { xs: "1 / -1", sm: "auto" }, minWidth: 0 }}>
          <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: "text.secondary", mt: .25 }} />
          <Box><Typography variant="caption" color="text.secondary">Date & time</Typography><Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.6, mt: .25 }}>{formatDateRange(event.start_time, event.end_time)}</Typography></Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ minWidth: 0 }}>
          <LocationOnRoundedIcon sx={{ fontSize: 18, color: "text.secondary", mt: .25 }} />
          <Box><Typography variant="caption" color="text.secondary">ZIP code</Typography><Typography variant="body2" sx={{ fontWeight: 600, mt: .25 }}>{event.zipcode || "Not set"}</Typography></Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ minWidth: 0 }}>
          <PeopleAltRoundedIcon sx={{ fontSize: 18, color: "text.secondary", mt: .25 }} />
          <Box><Typography variant="caption" color="text.secondary">Guests</Typography><Typography variant="body2" sx={{ fontWeight: 600, mt: .25 }}>{event.number_of_guests || 0}</Typography></Box>
        </Stack>
      </Box>
      <Stack direction="row" gap={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap">
        <Chip size="small" label={event.status || "In Progress"} icon={<Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "currentColor" }} />} sx={{ height: 26, border: "none", borderRadius: 1.25, fontSize: 12, bgcolor: theme => alpha(theme.palette[statusTone].main, .08), color: theme => theme.palette.mode === "light" ? theme.palette[statusTone].dark : theme.palette[statusTone].light, "& .MuiChip-icon": { ml: 1.25, color: "inherit" }, "& .MuiChip-label": { px: 1 } }} />
        {createdLabel && <Typography variant="caption" color="text.secondary">Created {createdLabel}</Typography>}
      </Stack>
    </Stack>
  </Paper>;
});

export default function EventsPage() {
  const navigate = useNavigate();
  const { auth, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deferredEvents = useDeferredValue(events);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const items = await fetchClientEvents({
          includeInactive,
          includeTeam: false,
        });
        if (!active) return;
        setEvents(items);
      } catch (nextError) {
        if (!active) return;
        setError(nextError.message || "Unable to load events.");
        setEvents([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (isAuthenticated && auth?.userType === "client") {
      loadEvents();
    } else {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [auth?.userType, includeInactive, isAuthenticated]);

  const ownedEvents = useMemo(
    () =>
      [...deferredEvents].sort((left, right) => {
        const leftTime = new Date(left.start_time).getTime();
        const rightTime = new Date(right.start_time).getTime();
        return leftTime - rightTime;
      }),
    [deferredEvents],
  );

  const activeCount = ownedEvents.filter(
    (event) => !INACTIVE_STATUSES.has(String(event.status || "").toLowerCase()),
  ).length;
  const inactiveCount = ownedEvents.length - activeCount;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (auth?.userType !== "client") {
    return <Navigate to="/" replace />;
  }

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 2.25, md: 4 },
          border: "var(--eez-border-11)",
          background:
            "var(--eez-surface-21)",
          boxShadow: "0 20px 48px rgba(4, 8, 34, 0.3)",
        }}
      >
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={{ xs: 0.8, md: 1.2 }}>
              <Typography variant="overline" color="primary.light">
                Client Workspace
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: "1.9rem", md: "3rem" } }}>
                Your events
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  maxWidth: 760,
                  fontSize: { xs: "1rem", md: "1.15rem" },
                }}
              >
                Review every event you own, along with timing, guest count, and operating status.
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack
              spacing={{ xs: 0.75, md: 1.25 }}
              justifyContent={{ md: "flex-end" }}
              alignItems={{ xs: "flex-start", md: "flex-end" }}
            >
              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                {includeInactive ? (
                  <>
                    <Chip label={`${ownedEvents.length} total`} color="primary" />
                    <Chip label={`${activeCount} active`} />
                    <Chip label={`${inactiveCount} inactive`} />
                  </>
                ) : (
                  <Chip label={`${activeCount} active`} color="primary" />
                )}
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.5, sm: 1.25 }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={includeInactive}
                      onChange={(event) => {
                        const nextChecked = event.target.checked;
                        startTransition(() => {
                          setIncludeInactive(nextChecked);
                        });
                      }}
                      color="primary"
                      disabled={loading || isPending}
                    />
                  }
                  label={isPending ? "Updating..." : "Include inactive"}
                  sx={{
                    mr: 0,
                    "& .MuiFormControlLabel-label": {
                      color: "text.secondary",
                      fontWeight: 600,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => navigate("/events/new")}
                  fullWidth
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  Create event
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <Paper
          sx={{
            p: 5,
            display: "grid",
            placeItems: "center",
            border: "var(--eez-border-3)",
            backgroundColor: "var(--eez-surface-22)",
          }}
        >
          <Stack spacing={1.25} alignItems="center">
            <CircularProgress color="primary" />
            <Typography color="text.secondary">Loading your events</Typography>
          </Stack>
        </Paper>
      ) : null}

      {!loading && !error && ownedEvents.length === 0 ? (
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            border: "var(--eez-border-3)",
            backgroundColor: "var(--eez-surface-22)",
          }}
        >
          <Stack spacing={1.5} alignItems="flex-start">
            <EventBusyRoundedIcon color="primary" sx={{ fontSize: 34 }} />
            <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", md: "1.8rem" } }}>
              No events yet
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 620 }}>
              {includeInactive
                ? "No events match the current filter. Active, cancelled, and completed events will appear here when available."
                : "No active events yet. Cancelled and completed events stay hidden until you turn on the inactive-events toggle."}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => navigate("/events/new")}
            >
              Create your first event
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {!loading && !error && ownedEvents.length > 0 ? (
        <Grid container spacing={3}>
          {ownedEvents.map((event) => (
            <Grid key={event.event_id || `${event.name}-${event.start_time}`} size={{ xs: 12, md: 6 }}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>
      ) : null}
    </Stack>
  );
}
