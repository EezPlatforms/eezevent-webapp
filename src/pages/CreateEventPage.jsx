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

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { auth, isAuthenticated } = useAuth();
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
      color: "rgba(230,231,255,0.74)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#B7C1FF",
      fontWeight: 700,
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
      color: "#A9B4FF",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(15,22,86,0.52)",
      "& fieldset": {
        borderColor: "rgba(120,147,255,0.34)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(150,171,255,0.54)",
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
      if (isEventPlanner) {
        await createPlannerEventForClient({
          ...payload,
          client_email: clientData.email.trim().toLowerCase(),
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          phone: clientData.phone,
        });
      } else {
        await createClientEvent(payload);
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
                  border: "1px solid rgba(120,147,255,0.18)",
                  backgroundColor: "rgba(20,29,104,0.72)",
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
                border: "1px solid rgba(120,147,255,0.18)",
                backgroundColor: "rgba(20,29,104,0.72)",
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="ZIP code"
                      value={eventData.zipcode}
                      onChange={(next) => updateField("zipcode", next.target.value)}
                      sx={formFieldSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Start time"
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
                      label="End time"
                      type="datetime-local"
                      value={normalizeDateTimeLocal(eventData.end_time)}
                      onChange={(next) => updateField("end_time", next.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={formFieldSx}
                    />
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
                border: "1px solid rgba(120,147,255,0.18)",
                backgroundColor: "rgba(20,29,104,0.72)",
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
                            : "rgba(255,255,255,0.06)",
                          color: isSelected ? "common.white" : "text.primary",
                          borderColor: isSelected
                            ? "#7F8CFF"
                            : isCommon
                              ? "rgba(255,209,102,0.45)"
                              : "rgba(120,147,255,0.3)",
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
                border: "1px solid rgba(120,147,255,0.18)",
                backgroundColor: "rgba(20,29,104,0.72)",
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
