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
  const statValueSx = {
    fontWeight: 700,
    fontSize: "0.92rem",
    lineHeight: 1.35,
    whiteSpace: "nowrap",
  };
  const statusChipSx =
    normalizedStatus === "cancelled"
      ? {
          background: "rgba(255,90,122,0.16)",
          color: "#FFD6DE",
          border: "1px solid rgba(255,90,122,0.36)",
        }
      : normalizedStatus === "completed"
        ? {
            background: "rgba(61,220,151,0.16)",
            color: "#D8FFE9",
            border: "1px solid rgba(61,220,151,0.34)",
          }
        : {
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
            color: "text.primary",
            border: "1px solid rgba(120,147,255,0.24)",
          };

  return (
    <Paper
      sx={{
        p: 0,
        height: "100%",
        border: "1px solid rgba(120,147,255,0.18)",
        background:
          "linear-gradient(180deg, rgba(34,43,146,0.92), rgba(20,29,104,0.96))",
        boxShadow: "0 18px 36px rgba(4, 8, 34, 0.24)",
        overflow: "hidden",
      }}
    >
      <Stack spacing={0}>
        <Box
          sx={{
            px: 2.5,
            py: 2.25,
            borderBottom: "1px solid rgba(120,147,255,0.14)",
            background:
              "linear-gradient(180deg, rgba(60,74,220,0.18), rgba(60,74,220,0.04))",
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack direction="row" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  borderRadius: 1.75,
                  background:
                    "linear-gradient(180deg, rgba(82,96,255,0.3), rgba(46,53,232,0.18))",
                  border: "1px solid rgba(165,181,255,0.42)",
                  color: "#F4F6FF",
                  boxShadow:
                    "0 12px 24px rgba(20,26,96,0.22), inset 0 1px 0 rgba(255,255,255,0.14)",
                }}
              >
                <EventTypeIcon
                  sx={{
                    fontSize: 28,
                    filter: "drop-shadow(0 2px 6px rgba(10,15,61,0.24))",
                  }}
                />
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "flex-start" }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="overline"
                      sx={{
                        color: "primary.light",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {event.event_type || "Event"}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontSize: { xs: "1.35rem", md: "1.6rem" },
                        lineHeight: 1.12,
                        mt: 0.1,
                      }}
                    >
                      {event.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={formatBudget(event.budget)}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.08)",
                      color: "text.primary",
                      fontSize: "1rem",
                      px: 0.5,
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.2 }}>
                  <Chip
                    label={event.status || "Active"}
                    sx={statusChipSx}
                  />
                  {event.created_at ? (
                    <Typography
                      color="text.secondary"
                      sx={{
                        alignSelf: "center",
                        fontSize: "0.98rem",
                      }}
                    >
                      Created{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(event.created_at))}
                    </Typography>
                  ) : null}
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ px: 2.5, py: 2.25 }}>
          <Stack spacing={2}>
            {event.description ? (
              <Typography
                color="text.secondary"
                sx={{
                  lineHeight: 1.6,
                  fontSize: "1.02rem",
                }}
              >
                {event.description}
              </Typography>
            ) : null}

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper
                  sx={{
                    p: 1.6,
                    height: "100%",
                    border: "1px solid rgba(120,147,255,0.16)",
                    backgroundColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <CalendarTodayRoundedIcon sx={{ color: "primary.light", mt: 0.15 }} />
                    <Box>
                      <Typography sx={statValueSx}>
                        {formatDateRange(event.start_time, event.end_time)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 6, md: 2.5 }}>
                <Paper
                  sx={{
                    p: 1.4,
                    height: "100%",
                    border: "1px solid rgba(120,147,255,0.16)",
                    backgroundColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnRoundedIcon sx={{ color: "primary.light", flexShrink: 0 }} />
                    <Typography sx={statValueSx}>
                      {event.zipcode || "Pending"}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 6, md: 2.5 }}>
                <Paper
                  sx={{
                    p: 1.4,
                    height: "100%",
                    border: "1px solid rgba(120,147,255,0.16)",
                    backgroundColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PeopleAltRoundedIcon sx={{ color: "primary.light", flexShrink: 0 }} />
                    <Typography sx={statValueSx}>
                      {event.number_of_guests || 0}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
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
          border: "1px solid rgba(120,147,255,0.2)",
          background:
            "linear-gradient(145deg, rgba(30,38,154,0.94) 0%, rgba(17,25,94,0.96) 70%, rgba(10,15,61,0.98) 100%)",
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
            border: "1px solid rgba(120,147,255,0.18)",
            backgroundColor: "rgba(20,29,104,0.7)",
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
            border: "1px solid rgba(120,147,255,0.18)",
            backgroundColor: "rgba(20,29,104,0.7)",
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
