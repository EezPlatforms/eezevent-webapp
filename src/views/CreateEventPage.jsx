"use client";
import EventLocationFields from "../components/EventLocationFields";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "../lib/navigation";
import { useAuth } from "../lib/auth";
import {
  createClientEvent,
  createPlannerEventForClient,
  fetchClientByEmail,
  fetchEventTypes,
  fetchServiceTypes,
} from "../lib/api";
import { getServiceHintsForEventType } from "../lib/eventServiceHints";

function toNumber(value) {
  if (value === "" || value == null) return 0;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function CreateEventPage({ returnTo = "" }) {
  const navigate = useNavigate();
  const { auth, isAuthenticated, authReady } = useAuth();
  const isEventPlanner = Boolean(auth?.isEventPlanner);
  const [eventTypes, setEventTypes] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [clientLookupLoading, setClientLookupLoading] = useState(false);
  const [clientLookupError, setClientLookupError] = useState("");
  const [clientLocked, setClientLocked] = useState(false);
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    zipcode: "",
    venue_booking_planned:null, address_line1:"", address_line2:"", city:"", state:"",
    start_time: "",
    end_time: "",
    number_of_guests: "",
    event_type: "",
    budget: "",
  });
  const [clientData, setClientData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [selectedServiceTypes, setSelectedServiceTypes] = useState([]);

  const formFieldSx = {
    "& .MuiInputLabel-root": {
      color: "var(--eez-ink-9)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "var(--eez-ink-10)",
      fontWeight: 700,
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
      color: "var(--eez-ink-11)",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--eez-surface-23)",
      "& fieldset": {
        borderColor: "var(--eez-outline-2)",
      },
      "&:hover fieldset": {
        borderColor: "var(--eez-outline-6)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#4752FF",
        borderWidth: 2,
      },
    },
  };

  useEffect(() => {
    let active = true;

    async function loadTypes() {
      setLoadingTypes(true);
      try {
        const [eventTypeResponse, serviceTypeResponse] = await Promise.all([
          fetchEventTypes(),
          fetchServiceTypes(),
        ]);
        if (!active) return;
        const nextEventTypes = Array.isArray(eventTypeResponse) ? eventTypeResponse : [];
        const nextServiceTypes = Object.entries(serviceTypeResponse || {}).map(([key, label]) => ({
          key,
          label,
        }));
        setEventTypes(nextEventTypes);
        setServiceTypes(nextServiceTypes);
        if (nextEventTypes.length) {
          setEventData((current) => ({
            ...current,
            event_type: current.event_type || nextEventTypes[0].value,
          }));
        }
      } catch (nextError) {
        if (!active) return;
        setError(nextError.message || "Unable to load event setup data.");
      } finally {
        if (active) {
          setLoadingTypes(false);
        }
      }
    }

    loadTypes();

    return () => {
      active = false;
    };
  }, []);

  const commonServiceHints = useMemo(
    () => new Set(getServiceHintsForEventType(eventData.event_type)),
    [eventData.event_type],
  );

  const updateField = (key, value) => {
    setEventData((current) => ({ ...current, [key]: value }));
    setError("");
    setSuccessMessage("");
  };

  const updateClientField = (key, value) => {
    setClientData((current) => ({ ...current, [key]: value }));
    setClientLookupError("");
    if (key === "email") {
      setClientLocked(false);
    }
  };

  const handleLookupClient = async () => {
    const normalized = clientData.email.trim().toLowerCase();
    if (!normalized) {
      setClientLocked(false);
      setClientLookupError("");
      return;
    }

    setClientLookupLoading(true);
    setClientLookupError("");
    try {
      const data = await fetchClientByEmail(normalized);
      setClientData((current) => ({
        ...current,
        email: normalized,
        first_name: data?.first_name || "",
        last_name: data?.last_name || "",
        phone: data?.phone || "",
      }));
      setClientLocked(Boolean(data?.client_id));
    } catch (nextError) {
      if (String(nextError.message || "").includes("404")) {
        setClientLocked(false);
        setClientLookupError("Client not found. Please enter first and last name.");
      } else {
        setClientLookupError(nextError.message || "Unable to look up client.");
      }
    } finally {
      setClientLookupLoading(false);
    }
  };

  const handleToggleServiceType = (typeKey) => {
    setSelectedServiceTypes((current) =>
      current.includes(typeKey)
        ? current.filter((item) => item !== typeKey)
        : [...current, typeKey],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!eventData.name || !eventData.start_time || !eventData.end_time || !eventData.event_type) {
      setError("Event name, type, start time, and end time are required.");
      return;
    }

    if (isEventPlanner) {
      if (!clientData.email) {
        setError("Client email is required.");
        return;
      }
      if (!clientLocked && (!clientData.first_name || !clientData.last_name)) {
        setError("Client first and last name are required for new clients.");
        return;
      }
    }

    if(typeof eventData.venue_booking_planned!=='boolean'){setError('Choose whether you already know your event venue.');return;}
    const start = new Date(eventData.start_time);
    const end = new Date(eventData.end_time);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start >= end) {
      setError("Start time must be before end time.");
      return;
    }

    const selectedEventType = eventTypes.find((type) => type.value === eventData.event_type);
    const payload = {
      ...eventData,
      number_of_guests: toNumber(eventData.number_of_guests),
      budget: toNumber(eventData.budget),
      event_type: selectedEventType?.name || eventData.event_type,
      service_types: selectedServiceTypes,
    };

    setSubmitting(true);
    try {
      let createdEvent;
      if (isEventPlanner) {
        createdEvent = await createPlannerEventForClient({
          ...payload,
          client_email: clientData.email.trim().toLowerCase(),
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          phone: clientData.phone,
        });
      } else {
        createdEvent = await createClientEvent(payload);
      }
      if (returnTo) {
        const target = new URL(returnTo, window.location.origin);
        const eventId = createdEvent?.event_id || createdEvent?.event?.event_id;
        if (eventId) target.searchParams.set("inquiryEvent", String(eventId));
        navigate(`${target.pathname}${target.search}`, { replace: true });
        return;
      }
      setSuccessMessage("Event created successfully.");
      setTimeout(() => {
        navigate("/events", { replace: true });
      }, 500);
    } catch (nextError) {
      setError(nextError.message || "Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authReady) return <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>;
  if (!isAuthenticated) {
    const next = `/events/new${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;
    return <Navigate to={`/login?account=client&next=${encodeURIComponent(next)}`} replace />;
  }

  if (auth?.userType !== "client") {
    return <Navigate to="/" replace />;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
        <Box>
          <Typography variant="overline" color="primary.light">
            Client Workspace
          </Typography>
          <Typography variant="h3" sx={{ mt: 0.5 }}>
            Create event
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
            Use the same event setup flow as the mobile app: event details first, then service
            needs, then team collaboration after the event is saved.
          </Typography>
        </Box>
        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/events")}
        >
          Back to events
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack component="form" spacing={3} onSubmit={handleSubmit}>
            {isEventPlanner ? (
              <Paper
                sx={{
                  p: 3,
                  border: "var(--eez-border-3)",
                  backgroundColor: "var(--eez-surface-24)",
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonSearchRoundedIcon color="primary" />
                    <Typography variant="h5">Client details</Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <TextField
                        fullWidth
                        label="Client email"
                        value={clientData.email}
                        onChange={(next) => updateClientField("email", next.target.value)}
                        onBlur={handleLookupClient}
                        type="email"
                        sx={formFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="secondary"
                        startIcon={
                          clientLookupLoading ? <CircularProgress size={16} color="inherit" /> : <PersonSearchRoundedIcon />
                        }
                        onClick={handleLookupClient}
                        sx={{ height: "100%" }}
                      >
                        Lookup client
                      </Button>
                    </Grid>
                    {clientLookupError ? (
                      <Grid size={12}>
                        <Alert severity="warning">{clientLookupError}</Alert>
                      </Grid>
                    ) : null}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="First name"
                        value={clientData.first_name}
                        onChange={(next) => updateClientField("first_name", next.target.value)}
                        disabled={clientLocked}
                        sx={formFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Last name"
                        value={clientData.last_name}
                        onChange={(next) => updateClientField("last_name", next.target.value)}
                        disabled={clientLocked}
                        sx={formFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={clientData.phone}
                        onChange={(next) => updateClientField("phone", next.target.value)}
                        disabled={clientLocked}
                        sx={formFieldSx}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            ) : null}

            <Paper
              sx={{
                p: 3,
                border: "var(--eez-border-3)",
                backgroundColor: "var(--eez-surface-24)",
              }}
            >
              <Stack spacing={2.25}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EventRoundedIcon color="primary" />
                  <Typography variant="h5">Event details</Typography>
                </Stack>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      required
                      label="Event name"
                      value={eventData.name}
                      onChange={(next) => updateField("name", next.target.value)}
                      sx={formFieldSx}
                    />
                  </Grid>
                  <Grid size={12}>
                    <EventLocationFields value={eventData} onChange={next=>{
                      setEventData(next);
                      if(next.venue_booking_planned===true && eventData.venue_booking_planned!==true)setSelectedServiceTypes(current=>[...new Set([...current,'VENUE_RENTALS'])]);
                    }} disabled={submitting}/>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      required
                      select
                      label="Event type"
                      value={eventData.event_type}
                      onChange={(next) => updateField("event_type", next.target.value)}
                      disabled={loadingTypes}
                      sx={formFieldSx}
                    >
                      {eventTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.value || type.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={12}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          required
                          label="Start date & time"
                          type="datetime-local"
                          value={normalizeDateTimeLocal(eventData.start_time)}
                          onChange={(next) => updateField("start_time", next.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={formFieldSx}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          required
                          label="End date & time"
                          type="datetime-local"
                          value={normalizeDateTimeLocal(eventData.end_time)}
                          onChange={(next) => updateField("end_time", next.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={formFieldSx}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Guests"
                      value={eventData.number_of_guests}
                      onChange={(next) => updateField("number_of_guests", next.target.value)}
                      sx={formFieldSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Budget"
                      value={eventData.budget}
                      onChange={(next) => updateField("budget", next.target.value)}
                      sx={formFieldSx}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label="Description"
                      value={eventData.description}
                      onChange={(next) => updateField("description", next.target.value)}
                      sx={formFieldSx}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: 3,
                border: "var(--eez-border-3)",
                backgroundColor: "var(--eez-surface-24)",
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AutoAwesomeRoundedIcon color="primary" />
                  <Typography variant="h5">Preferred services</Typography>
                </Stack>
                <Typography color="text.secondary">
                  Stars highlight services commonly hired for this event type, matching the mobile
                  event setup flow.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {serviceTypes.map((type) => {
                    const isSelected = selectedServiceTypes.includes(type.key);
                    const isCommon =
                      commonServiceHints.has(type.label) ||
                      commonServiceHints.has(type.key) ||
                      commonServiceHints.has(String(type.label).toUpperCase());

                    return (
                      <Chip
                        key={type.key}
                        label={type.label}
                        onClick={() => handleToggleServiceType(type.key)}
                        color={isSelected ? "primary" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        icon={
                          isCommon ? (
                            <AutoAwesomeRoundedIcon
                              sx={{
                                color: isSelected ? "common.white" : "warning.main",
                              }}
                            />
                          ) : undefined
                        }
                        sx={{
                          background: isSelected
                            ? "linear-gradient(180deg, #4854FF 0%, #2E35E8 100%)"
                            : "var(--eez-surface-25)",
                          color: isSelected ? "common.white" : "text.primary",
                          borderColor: isSelected
                            ? "#7F8CFF"
                            : isCommon
                              ? "rgba(255,209,102,0.45)"
                              : "var(--eez-outline-7)",
                          boxShadow: isSelected
                            ? "0 10px 22px rgba(46,53,232,0.28), inset 0 1px 0 rgba(255,255,255,0.12)"
                            : "none",
                          "& .MuiChip-label": {
                            color: isSelected ? "common.white" : undefined,
                          },
                        }}
                      />
                    );
                  })}
                </Stack>
              </Stack>
            </Paper>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button variant="outlined" color="secondary" onClick={() => navigate("/events")}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckRoundedIcon />}
                disabled={submitting || loadingTypes}
              >
                {submitting ? "Saving..." : "Create event"}
              </Button>
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Paper
              sx={{
                p: 3,
                border: "var(--eez-border-3)",
                backgroundColor: "var(--eez-surface-24)",
              }}
            >
              <Stack spacing={1.1}>
                <Typography variant="h6">After creation</Typography>
                <Typography color="text.secondary">
                  Team members can be added once the event exists. That matches the current mobile
                  flow and backend model.
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
