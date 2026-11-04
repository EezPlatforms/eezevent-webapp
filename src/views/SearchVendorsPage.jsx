"use client";
import { vendorProfilePath } from "../lib/vendorProfilePath";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
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
  Rating,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { RouterLink, useSearchParams } from "../lib/navigation";
import { fetchVendorSearch, fetchServiceTypes } from "../lib/api";
import { readVendorSearch, saveVendorSearch, vendorSearchUrl } from "../lib/vendorSearchState";
import { getServiceTypeImage } from "../lib/serviceTypeImages";

const ZIP_REGEX = /^\d{5}(-\d{4})?$/;

const formatPrice = (value) => {
  if (!value) return "";
  if (Number.isFinite(Number(value))) {
    return `$${Number(value).toLocaleString()}`;
  }
  return String(value).trim().startsWith("$") ? String(value).trim() : `$${String(value).trim()}`;
};

function ServiceCard({ item, typeLabel, returnTo, onOpen }) {
  const service = item?.service || {};
  const business = item?.business || {};
  const reviewCount = Number(service.review_count) || 0;
  const averageRating = Number(service.average_rating);
  const hasRating = reviewCount > 0 && service.average_rating != null && Number.isFinite(averageRating);
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
      component={RouterLink}
      to={`${vendorProfilePath(service)}?returnTo=${encodeURIComponent(returnTo)}`}
      onClick={onOpen}
      aria-label={`View ${service.name || "vendor"} profile`}
      sx={{
        display: "block",
        textDecoration: "none",
        color: "text.primary",
        cursor: "pointer",
        position: "relative",
        transition: "transform 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out",
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": {
            transform: "translateY(-5px) scale(1.01)",
            zIndex: 1,
            borderColor: "primary.main",
            boxShadow: theme => `0 0 0 1px ${theme.palette.primary.main}, 0 0 18px ${theme.palette.primary.main}26, 0 18px 36px rgba(7, 11, 42, 0.18)`,
          },
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": { transform: "none" },
        },
        "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main", outlineOffset: 3 },
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        height: "100%",
        border: "var(--eez-border-1)",
        background:
          "var(--eez-surface-1)",
        boxShadow: "0 4px 18px rgba(7, 11, 42, 0.06)",
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={{ xs: 1.75, sm: 2 }} alignItems="flex-start">
          <Stack spacing={1} alignItems="center" sx={{ width: { xs: 76, sm: 88 }, flexShrink: 0 }}>
            <Box component="img" src={service.main_image_url || serviceTypeImage} alt={service.name || "Service"} loading="lazy"
              sx={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "action.hover" }} />
            {item.is_pro_boosted && <Chip icon={<WorkspacePremiumOutlinedIcon />} label="Pro" size="small" color="primary" aria-label="Pro subscription" sx={{ height: 24, borderRadius: 1.5, fontSize: 12, "& .MuiChip-icon": { fontSize: 16 }, "& .MuiChip-label": { px: 1 } }} />}
          </Stack>
          <Stack spacing={.75} sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: ".04em", lineHeight: 1.4, minWidth: 0 }}>{typeLabel || service.type_name || service.type || "Event service"}</Typography>
              <Typography sx={{ fontSize: { xs: 13, sm: 15 }, fontWeight: 700, lineHeight: 1.4, textAlign: "right", maxWidth: "48%", flexShrink: 0, overflowWrap: "anywhere" }}>{service.price ? formatPrice(service.price) : "Contact for pricing"}</Typography>
            </Stack>
            <Typography component="h2" sx={{ fontWeight: 700, fontSize: { xs: 20, sm: 23 }, lineHeight: 1.25, letterSpacing: "-.02em", overflowWrap: "anywhere", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{service.name || "Service"}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{business.business_name || business.contact_name || "Vendor"}</Typography>
            <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ pt: .25 }}>
              {hasRating ? <Stack direction="row" alignItems="center" gap={.75}>
                <Rating value={averageRating} precision={.1} readOnly size="small" aria-label={`${averageRating.toFixed(1)} out of 5 stars`} sx={{ fontSize: 17 }} />
                <Typography variant="body2" fontWeight={600}>{averageRating.toFixed(1)}</Typography>
                <Typography variant="caption" color="text.secondary">({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</Typography>
              </Stack> : <Typography variant="caption" color="text.secondary">No reviews yet</Typography>}
              {locationLabel && <Stack direction="row" spacing={.5} alignItems="center" sx={{ color: "text.secondary" }}><LocationOnRoundedIcon sx={{ fontSize: 16 }} /><Typography variant="body2">{locationLabel}</Typography></Stack>}
            </Stack>
            {service.capacity && <Typography variant="caption" color="text.secondary">Capacity: {service.capacity}</Typography>}
          </Stack>
        </Stack>
        {shortDescription && <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{shortDescription}</Typography>}

      </Stack>
    </Paper>
  );
}

export default function SearchVendorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [zipcode, setZipcode] = useState(searchParams.get("zipcode") || "");
  const [results, setResults] = useState([]);
  const [serviceTypesMap, setServiceTypesMap] = useState({});
  const [selectedTypes, setSelectedTypes] = useState(searchParams.get("type") ? [searchParams.get("type")] : ["all"]);
  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(false);
  const [touched, setTouched] = useState(Boolean(searchParams.get("zipcode")));
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [moreLoading, setMoreLoading] = useState(false);
  const [moreError, setMoreError] = useState("");
  const [filterAnchor, setFilterAnchor] = useState(null);
  const requestId = useRef(0);
  const morePending = useRef(false);

  useEffect(() => () => { requestId.current += 1; }, []);

  const serviceTypeOptions = useMemo(() => Object.entries(serviceTypesMap).map(([key, label]) => ({ key, label })), [serviceTypesMap]);

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

  const runSearch = async (nextZip = zipcode, types = selectedTypes) => {
    const id = ++requestId.current;
    setHasMore(false);
    setMoreLoading(false);
    setMoreError("");
    morePending.current = false;
    const targetZip = String(nextZip || "").trim();
    setZipcode(targetZip);
    setTouched(true);

    if (!ZIP_REGEX.test(targetZip)) {
      setError("Please enter a valid U.S. ZIP code, for example 28277.");
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchVendorSearch(targetZip, { category: types[0] });
      if (id !== requestId.current) return;
      setResults(data.items);
      setPage(data.page);
      setHasMore(data.hasMore);
      setTotal(data.total);
      setSelectedTypes(types);
      setSearchParams(new URLSearchParams(vendorSearchUrl(targetZip, types).split("?")[1] || ""));
    } catch (err) {
      if (id !== requestId.current) return;
      setResults([]);
      setError(err.message || "Unable to search vendors right now.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loading || morePending.current || !hasMore) return;
    const id = requestId.current;
    morePending.current = true;
    setMoreLoading(true);
    setMoreError("");
    try {
      const data = await fetchVendorSearch(searchParams.get("zipcode"), { page: page + 1, category: selectedTypes[0] });
      if (id !== requestId.current) return;
      setResults(current => {
        const ids = new Set(current.map(item => item.service.service_id));
        return [...current, ...data.items.filter(item => !ids.has(item.service.service_id))];
      });
      setPage(data.page);
      setHasMore(data.hasMore);
      setTotal(data.total);
    } catch (err) {
      if (id === requestId.current) setMoreError(err.message || "Unable to load more vendors.");
    } finally {
      if (id === requestId.current) { morePending.current = false; setMoreLoading(false); }
    }
  };

  useEffect(() => {
    const initialZip = searchParams.get("zipcode");
    if (initialZip) {
      const saved = readVendorSearch(initialZip);
      const category = searchParams.get("type") || "all";
      if (saved?.version === 2 && saved.category === category) {
        setPage(saved.page || 1);
        setHasMore(Boolean(saved.hasMore));
        setTotal(saved.total ?? saved.results.length);
        setResults(saved.results);
        setServiceTypesMap(saved.serviceTypesMap || {});
        const frame = requestAnimationFrame(() => window.scrollTo(0, Number(saved.scrollY) || 0));
        return () => cancelAnimationFrame(frame);
      }
      runSearch(initialZip, searchParams.get("type") ? [searchParams.get("type")] : ["all"]);
    }
    // Intentionally only on first mount so we don't loop on setSearchParams.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleType = value => {
    const next = value === "all" || selectedTypes.includes(value) ? ["all"] : [value];
    setSelectedTypes(next);
    runSearch(searchParams.get("zipcode") || zipcode, next);
  };

  const returnTo = vendorSearchUrl(searchParams.get("zipcode"), selectedTypes);
  const rememberSearch = () => saveVendorSearch({
    version: 2, zipcode: searchParams.get("zipcode"), category: selectedTypes[0], results, serviceTypesMap, scrollY: window.scrollY, page, hasMore, total,
  });

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 2.5, md: isCompactHeader ? 2.5 : 4.5 },
          border: "var(--eez-border-2)",
          background:
            "var(--eez-surface-3)",
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
                  Discover local vendors and explore their services, packages, and reviews before reaching out.
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                sx={{
                  p: 2.5,
                  border: "var(--eez-border-1)",
                  backgroundColor: "var(--eez-surface-2)",
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

      {hasSearchState && !error && <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ minWidth: 0 }}>
          <Typography component="h2" variant="h6" sx={{ fontSize: { xs: 17, sm: 20 } }}>{loading ? "Finding vendors…" : `${total} service${total === 1 ? "" : "s"}`}<Box component="span" sx={{ color: "text.secondary", fontWeight: 400 }}> near {searchParams.get("zipcode") || zipcode}</Box></Typography>
          {!selectedTypes.includes("all") && <Chip size="small" label={serviceTypesMap[selectedTypes[0]] || selectedTypes[0]} onDelete={loading ? undefined : () => toggleType("all")} />}
        </Stack>
        <Button
          id="vendor-filter-button"
          variant="outlined" color="secondary" startIcon={<FilterListRoundedIcon />}
          onClick={event => setFilterAnchor(event.currentTarget)}
          disabled={typesLoading || loading}
          aria-haspopup="menu" aria-expanded={Boolean(filterAnchor)} aria-controls={filterAnchor ? "vendor-filter-menu" : undefined}
          sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
        >Filters{!selectedTypes.includes("all") ? " (1)" : ""}</Button>
      </Stack>}
      <Menu
        id="vendor-filter-menu" anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}
        MenuListProps={{ "aria-labelledby": "vendor-filter-button" }}
        PaperProps={{ sx: { mt: 1, width: 300, maxWidth: "calc(100vw - 32px)", maxHeight: "min(420px, 65dvh)", border: "1px solid", borderColor: "divider", borderRadius: 2 } }}
      >
        <MenuItem disabled sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>Service type</MenuItem>
        {[{ key: "all", label: "All service types" }, ...serviceTypeOptions].map(option => <MenuItem
          key={option.key} selected={selectedTypes.includes(option.key)}
          onClick={() => { setFilterAnchor(null); if (!selectedTypes.includes(option.key)) toggleType(option.key); }}
          sx={{ gap: 1.5, py: 1.25, whiteSpace: "normal" }}
        ><Box sx={{ width: 20, flexShrink: 0, display: "flex" }}>{selectedTypes.includes(option.key) && <CheckRoundedIcon fontSize="small" />}</Box>{option.label}</MenuItem>)}
      </Menu>

      {loading ? (
        <Paper
          sx={{
            p: 5,
            border: "var(--eez-border-1)",
            backgroundColor: "var(--eez-surface-4)",
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
            border: "var(--eez-border-1)",
            backgroundColor: "var(--eez-surface-4)",
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
            border: "var(--eez-border-1)",
            backgroundColor: "var(--eez-surface-4)",
          }}
        >
          <Typography variant="h6">No matches for the selected type</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Choose another service type to see more vendors.
          </Typography>
        </Paper>
      ) : null}

      <Grid container spacing={3}>
        {!loading && filteredResults.map((item) => (
          <Grid key={item?.service?.service_id || item?.service?.name} size={{ xs: 12, md: 6, xl: 4 }}>
            <ServiceCard
              item={item}
              returnTo={returnTo}
              onOpen={rememberSearch}
              typeLabel={serviceTypesMap?.[item?.service?.type] || item?.service?.type_name}
            />
          </Grid>
        ))}
      </Grid>
      {moreError && <Alert severity="warning">{moreError}</Alert>}
      {!loading && results.length > 0 && <Stack alignItems="center" spacing={1.5}>
        <Typography variant="body2" color="text.secondary" role="status">Showing {results.length} of {total} services</Typography>
        {hasMore && <Button variant="outlined" onClick={loadMore} disabled={moreLoading}>{moreLoading ? "Loading more vendors..." : moreError ? "Retry loading more" : "Load more vendors"}</Button>}
      </Stack>}



    </Stack>
  );
}
