"use client";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "../lib/navigation";
import VendorDetailsDialog from "../components/VendorDetailsDialog";
import { fetchServicesByZipcode, fetchServiceTypes } from "../lib/api";
import { getServiceTypeImage, normalizeServiceTypeKey } from "../lib/serviceTypeImages";

const ZIP_REGEX = /^\d{5}(-\d{4})?$/;

const formatPrice = (value) => {
  if (!value) return "";
  if (Number.isFinite(Number(value))) {
    return `$${Number(value).toLocaleString()}`;
  }
  return String(value).trim().startsWith("$") ? String(value).trim() : `$${String(value).trim()}`;
};

const serviceAccent = (value) => {
  const normalized = normalizeServiceTypeKey(value);
  const palette = {
    CATERING: "#FFD166",
    PHOTOGRAPHY: "#7FDBCA",
    DJ_SERVICES: "#FE7AA3",
    DECORATORS: "#7893FF",
    FLORISTS: "#8BE28B",
    EVENT_PLANNERS: "#A58BFF",
    VENUE_RENTALS: "#67C6FF",
  };
  return palette[normalized] || "#7893FF";
};

function ServiceCard({ item, typeLabel, onView }) {
  const service = item?.service || {};
  const business = item?.business || {};
  const accent = serviceAccent(service?.type);
  const serviceTypeImage = getServiceTypeImage(service?.type);
  const locationLabel =
    [service?.service_city || business?.city, service?.service_state || business?.state]
      .filter(Boolean)
      .join(", ") ||
    service?.service_zip ||
    business?.zip ||
    "";
  const shortDescription = service?.description
    ? service.description.length > 92
      ? `${service.description.slice(0, 89)}...`
      : service.description
    : "";

  return (
    <Paper
      sx={{
        p: 1.75,
        height: "100%",
        border: "1px solid rgba(120,147,255,0.16)",
        background:
          "linear-gradient(180deg, rgba(32,40,132,0.96), rgba(24,31,107,0.96))",
        boxShadow: "0 12px 28px rgba(7, 11, 42, 0.16)",
      }}
    >
      <Stack spacing={1.5} sx={{ height: "100%" }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            component="img"
            src={serviceTypeImage}
            alt={typeLabel || service?.type_name || service?.type || "Service type"}
            sx={{
              width: 72,
              height: 72,
              objectFit: "cover",
              borderRadius: 1,
              border: `1px solid ${accent}`,
              boxShadow: `0 10px 24px ${accent}33`,
              backgroundColor: "rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          />
          <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    lineHeight: 1.15,
                    fontSize: { xs: "1.55rem", md: "1.7rem" },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {service?.name || "Service"}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {business?.contact_name || business?.business_name || "Vendor"}
                </Typography>
              </Box>
              {service?.price ? (
                <Chip
                  label={formatPrice(service.price)}
                  sx={{ flexShrink: 0, maxWidth: "48%" }}
                />
              ) : null}
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={typeLabel || service?.type_name || service?.type || "Service type"}
                  sx={{ maxWidth: "100%" }}
                />
                {locationLabel ? (
                  <Chip icon={<LocationOnRoundedIcon />} label={locationLabel} />
                ) : null}
                {service?.capacity ? <Chip label={`Capacity ${service.capacity}`} /> : null}
              </Stack>
              <Button
                variant="contained"
                onClick={onView}
                sx={{ flexShrink: 0, minWidth: { sm: 124 } }}
              >
                View vendor
              </Button>
            </Stack>

            {shortDescription ? (
              <Typography
                color="text.secondary"
                sx={{
                  pt: 0.25,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {shortDescription}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function SearchVendorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [zipcode, setZipcode] = useState(searchParams.get("zipcode") || "");
  const [results, setResults] = useState([]);
  const [serviceTypesMap, setServiceTypesMap] = useState({});
  const [selectedTypes, setSelectedTypes] = useState(["all"]);
  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(false);
  const [touched, setTouched] = useState(Boolean(searchParams.get("zipcode")));
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const serviceTypeCounts = useMemo(() => {
    const counts = new Map();
    results.forEach((item) => {
      const type = item?.service?.type;
      if (!type) return;
      counts.set(type, (counts.get(type) || 0) + 1);
    });
    return counts;
  }, [results]);

  const serviceTypeOptions = useMemo(
    () =>
      Array.from(serviceTypeCounts.entries()).map(([key, count]) => ({
        key,
        label: serviceTypesMap?.[key] || key,
        count,
      })),
    [serviceTypeCounts, serviceTypesMap],
  );

  const filteredResults = useMemo(() => {
    if (selectedTypes.includes("all")) return results;
    return results.filter((item) => selectedTypes.includes(item?.service?.type));
  }, [results, selectedTypes]);
  const hasSearchState = touched || loading || results.length > 0;
  const isCompactHeader = results.length > 0 && !loading;

  useEffect(() => {
    let cancelled = false;

    const loadServiceTypes = async () => {
      setTypesLoading(true);
      try {
        const data = await fetchServiceTypes();
        if (!cancelled) {
          setServiceTypesMap(data || {});
        }
      } catch {
        if (!cancelled) {
          setServiceTypesMap({});
        }
      } finally {
        if (!cancelled) {
          setTypesLoading(false);
        }
      }
    };

    loadServiceTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  const runSearch = async (nextZip = zipcode) => {
    const targetZip = String(nextZip || "").trim();
    setZipcode(targetZip);
    setTouched(true);

    if (!ZIP_REGEX.test(targetZip)) {
      setError("Please enter a valid U.S. ZIP code, for example 28277.");
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchServicesByZipcode(targetZip);
      setResults(Array.isArray(data) ? data : []);
      setSelectedTypes(["all"]);
      setSearchParams(targetZip ? { zipcode: targetZip } : {});
    } catch (err) {
      setResults([]);
      setError(err.message || "Unable to search vendors right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialZip = searchParams.get("zipcode");
    if (initialZip) {
      runSearch(initialZip);
    }
    // Intentionally only on first mount so we don't loop on setSearchParams.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleType = (value) => {
    setSelectedTypes((current) => {
      if (value === "all") return ["all"];
      const withoutAll = current.filter((item) => item !== "all");
      if (withoutAll.includes(value)) {
        const next = withoutAll.filter((item) => item !== value);
        return next.length ? next : ["all"];
      }
      return [...withoutAll, value];
    });
  };

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 2.5, md: isCompactHeader ? 2.5 : 4.5 },
          border: "1px solid rgba(120,147,255,0.22)",
          background:
            "linear-gradient(145deg, rgba(32,40,132,0.96) 0%, rgba(21,28,99,0.96) 100%)",
          boxShadow: "0 16px 36px rgba(8, 12, 46, 0.18)",
        }}
      >
        {isCompactHeader ? (
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", lg: "center" }}
            justifyContent="space-between"
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ minWidth: 0 }}
            >
              <Chip
                icon={<StorefrontRoundedIcon />}
                label="Vendor Search"
                color="primary"
                sx={{ alignSelf: "flex-start" }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5">Find vendors by ZIP code</Typography>
                <Typography color="text.secondary">
                  Refine the search without pushing results below the fold.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.25}
              sx={{ width: { xs: "100%", lg: "auto" }, minWidth: { lg: 560 } }}
            >
              <TextField
                label="ZIP code"
                value={zipcode}
                onChange={(event) => setZipcode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    runSearch();
                  }
                }}
                error={touched && zipcode.length > 0 && !ZIP_REGEX.test(zipcode.trim())}
                placeholder="28277"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnRoundedIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchRoundedIcon />}
                onClick={() => runSearch()}
                disabled={loading}
                sx={{ minWidth: { md: 220 } }}
              >
                {loading ? "Searching..." : "Search vendors"}
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={1.5}>
                <Chip
                  icon={<StorefrontRoundedIcon />}
                  label="Vendor Search"
                  color="primary"
                  sx={{ alignSelf: "flex-start" }}
                />
                <Typography variant="h2" sx={{ fontSize: { xs: "2.4rem", md: "3.5rem" } }}>
                  Find services by ZIP code.
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Search the live vendor catalog from `eezevent-services` and review service,
                  business, location, and catalog details before reaching out.
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                sx={{
                  p: 2.5,
                  border: "1px solid rgba(120,147,255,0.16)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Stack spacing={1.5}>
                  <TextField
                    label="ZIP code"
                    value={zipcode}
                    onChange={(event) => setZipcode(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        runSearch();
                      }
                    }}
                    error={touched && zipcode.length > 0 && !ZIP_REGEX.test(zipcode.trim())}
                    placeholder="28277"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnRoundedIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchRoundedIcon />}
                    onClick={() => runSearch()}
                    disabled={loading}
                  >
                    {loading ? "Searching..." : "Search vendors"}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {results.length > 0 || serviceTypeOptions.length > 0 ? (
        <Paper
          sx={{
            p: 3,
            border: "1px solid rgba(120,147,255,0.16)",
            backgroundColor: "rgba(28,35,118,0.9)",
            boxShadow: "0 14px 28px rgba(8, 12, 46, 0.14)",
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography variant="h5">
                  {filteredResults.length} vendor{filteredResults.length === 1 ? "" : "s"} near{" "}
                  {zipcode}
                </Typography>
                <Typography color="text.secondary">
                  Filter results by service type, similar to the mobile search flow.
                </Typography>
              </Box>
              <Chip
                icon={<FilterListRoundedIcon />}
                label={typesLoading ? "Loading types..." : `${serviceTypeOptions.length} service types`}
              />
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                clickable
                label="All"
                onClick={() => toggleType("all")}
                sx={{
                  backgroundColor: selectedTypes.includes("all")
                    ? "rgba(46,53,232,0.95)"
                    : "rgba(255,255,255,0.08)",
                  color: selectedTypes.includes("all")
                    ? "common.white"
                    : "rgba(230,231,255,0.82)",
                  borderColor: selectedTypes.includes("all")
                    ? "rgba(154,168,255,0.88)"
                    : "rgba(120,147,255,0.34)",
                  boxShadow: selectedTypes.includes("all")
                    ? "0 10px 20px rgba(46,53,232,0.28)"
                    : "none",
                }}
              />
              {serviceTypeOptions.map((option) => (
                <Chip
                  key={option.key}
                  clickable
                  label={`${option.label} (${option.count})`}
                  onClick={() => toggleType(option.key)}
                  sx={{
                    backgroundColor: selectedTypes.includes(option.key)
                      ? "rgba(46,53,232,0.95)"
                      : "rgba(255,255,255,0.08)",
                    color: selectedTypes.includes(option.key)
                      ? "common.white"
                      : "rgba(230,231,255,0.82)",
                    borderColor: selectedTypes.includes(option.key)
                      ? "rgba(154,168,255,0.88)"
                      : "rgba(120,147,255,0.34)",
                    boxShadow: selectedTypes.includes(option.key)
                      ? "0 10px 20px rgba(46,53,232,0.28)"
                      : "none",
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      {loading ? (
        <Paper
          sx={{
            p: 5,
            border: "1px solid rgba(120,147,255,0.16)",
            backgroundColor: "rgba(28,35,118,0.9)",
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress color="primary" />
            <Typography color="text.secondary">Searching services...</Typography>
          </Stack>
        </Paper>
      ) : null}

      {!loading && hasSearchState && !error && results.length === 0 ? (
        <Paper
          sx={{
            p: 5,
            textAlign: "center",
            border: "1px solid rgba(120,147,255,0.16)",
            backgroundColor: "rgba(28,35,118,0.9)",
          }}
        >
          <Typography variant="h5">No vendors found</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Try a different ZIP code to broaden the search.
          </Typography>
        </Paper>
      ) : null}

      {!loading && results.length > 0 && filteredResults.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px solid rgba(120,147,255,0.16)",
            backgroundColor: "rgba(28,35,118,0.9)",
          }}
        >
          <Typography variant="h6">No matches for the selected type</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Choose another service type to see more vendors.
          </Typography>
        </Paper>
      ) : null}

      <Grid container spacing={3}>
        {filteredResults.map((item) => (
          <Grid key={item?.service?.service_id || item?.service?.name} size={{ xs: 12, md: 6, xl: 4 }}>
            <ServiceCard
              item={item}
              typeLabel={serviceTypesMap?.[item?.service?.type] || item?.service?.type_name}
              onView={() => setSelectedItem(item)}
            />
          </Grid>
        ))}
      </Grid>

      <VendorDetailsDialog
        open={Boolean(selectedItem)}
        item={selectedItem}
        typeLabel={
          selectedItem ? serviceTypesMap?.[selectedItem?.service?.type] || selectedItem?.service?.type_name : ""
        }
        onClose={() => setSelectedItem(null)}
      />
    </Stack>
  );
}
