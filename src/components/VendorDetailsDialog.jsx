"use client";
import { vendorProfilePath } from "../lib/vendorProfilePath";
import { formatPrice } from "../lib/formatPrice";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Button } from "@mui/material";
import { RouterLink } from "../lib/navigation";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import XIcon from "@mui/icons-material/X";
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  fetchPublicServiceProfile,
  fetchServiceCatalogItems,
  fetchServiceImages,
} from "../lib/api";

const formatAddress = (service, business) =>
  [
    service?.service_street || business?.street,
    service?.service_street2,
    service?.service_city || business?.city,
    service?.service_state || business?.state,
    service?.service_zip || business?.zip,
  ]
    .filter(Boolean)
    .join(", ");

const toExternalUrl = (value) => {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const socialLinks = (service) =>
  [
    {
      label: "Instagram",
      value: service?.instagram,
      icon: <InstagramIcon fontSize="small" />,
    },
    {
      label: "Facebook / Website",
      value: service?.facebook,
      icon: <LanguageRoundedIcon fontSize="small" />,
    },
    {
      label: "X",
      value: service?.twitter,
      icon: <XIcon fontSize="small" />,
    },
    {
      label: "LinkedIn",
      value: service?.linkedin,
      icon: <LinkedInIcon fontSize="small" />,
    },
  ].filter((item) => item.value);

export default function VendorDetailsDialog({ open, item, typeLabel, onClose }) {
  const [details, setDetails] = useState(null);
  const [images, setImages] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const serviceId = item?.service?.service_id;
      if (!open || !serviceId) {
        setDetails(null);
        setImages([]);
        setCatalogItems([]);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [profile, nextImages, nextCatalogItems] = await Promise.all([
          fetchPublicServiceProfile(serviceId),
          fetchServiceImages(serviceId),
          fetchServiceCatalogItems(serviceId),
        ]);

        if (cancelled) return;
        setDetails(profile);
        setImages(nextImages);
        setCatalogItems(nextCatalogItems);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Unable to load vendor details.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [item, open]);

  const service = details?.service || item?.service || {};
  const business = details?.business || item?.business || {};
  const address = formatAddress(service, business);
  const mapLink = service?.google_map_link
    ? toExternalUrl(service.google_map_link)
    : address
      ? `https://www.google.com/maps?q=${encodeURIComponent(address)}`
      : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          border: "var(--eez-border-3)",
          background:
            "var(--eez-surface-27)",
          backdropFilter: "blur(16px)",
        },
      }}
    >
      <DialogTitle sx={{ pr: 7 }}>
        <Stack spacing={1}>
          <Typography variant="h4">{service?.name || "Vendor"}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={typeLabel || service?.type_name || service?.type || "Service"} />
            {service?.price ? <Chip label={formatPrice(service.price)} /> : null}
            {service?.capacity ? <Chip label={`Capacity ${service.capacity}`} /> : null}
          </Stack>
        </Stack>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12, color: "text.secondary" }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {item?.service?.service_id && <Button component={RouterLink} to={vendorProfilePath(item.service)} onClick={onClose} variant="contained" sx={{ mb: 2 }}>Open shareable profile & reviews</Button>}
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
            <CircularProgress color="primary" />
          </Stack>
        ) : error ? (
          <Paper
            sx={{
              p: 3,
              border: "1px solid rgba(255,90,122,0.35)",
              backgroundColor: "rgba(255,90,122,0.08)",
            }}
          >
            <Typography color="error.main">{error}</Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {images.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(3, minmax(0, 220px))",
                  },
                  justifyContent: { md: "start" },
                  gap: 1,
                }}
              >
                {images.slice(0, 3).map((image, index) => (
                  <Box
                    key={image.id || image.url || index}
                    component="img"
                    src={image.url}
                    alt={image.caption || service?.name || "Vendor image"}
                    sx={{
                      width: "100%",
                      maxWidth: { md: 220 },
                      height: { xs: 120, sm: 150, md: 140 },
                      objectFit: "cover",
                      borderRadius: 1.5,
                      border: "var(--eez-border-3)",
                      boxShadow: "0 10px 18px rgba(8, 12, 46, 0.12)",
                    }}
                  />
                ))}
              </Box>
            ) : null}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" },
                gap: 3,
              }}
            >
              <Stack spacing={3}>
                <Paper
                  sx={{
                    p: 3,
                    border: "var(--eez-border-1)",
                    backgroundColor: "var(--eez-surface-20)",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography variant="h6">Service overview</Typography>
                    <Typography color="text.secondary">
                      {service?.description || "No service description provided."}
                    </Typography>
                  </Stack>
                </Paper>

                <Paper
                  sx={{
                    p: 3,
                    border: "var(--eez-border-1)",
                    backgroundColor: "var(--eez-surface-20)",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography variant="h6">Business</Typography>
                    <Typography>{business?.business_name || "Business"}</Typography>
                    {business?.description ? (
                      <Typography color="text.secondary">{business.description}</Typography>
                    ) : null}
                    <Divider />
                    <Stack spacing={1.25}>
                      {business?.contact_name ? (
                        <Typography color="text.secondary">
                          Contact: {business.contact_name}
                        </Typography>
                      ) : null}
                      {business?.phone ? (
                        <Link
                          href={`tel:${business.phone}`}
                          underline="none"
                          color="inherit"
                          sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
                        >
                          <PhoneRoundedIcon fontSize="small" />
                          {business.phone}
                        </Link>
                      ) : null}
                      {business?.email ? (
                        <Link
                          href={`mailto:${business.email}`}
                          underline="none"
                          color="inherit"
                          sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
                        >
                          <EmailRoundedIcon fontSize="small" />
                          {business.email}
                        </Link>
                      ) : null}
                      {address ? (
                        <Stack direction="row" spacing={1.25} alignItems="flex-start">
                          <LocationOnRoundedIcon fontSize="small" sx={{ mt: 0.15 }} />
                          <Box>
                            <Typography color="text.secondary">{address}</Typography>
                            {mapLink ? (
                              <Link
                                href={mapLink}
                                target="_blank"
                                rel="noreferrer"
                                underline="hover"
                                color="primary.light"
                              >
                                Open map
                              </Link>
                            ) : null}
                          </Box>
                        </Stack>
                      ) : null}
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>

              <Stack spacing={3}>
                {socialLinks(service).length > 0 ? (
                  <Paper
                    sx={{
                      p: 3,
                      border: "var(--eez-border-1)",
                      backgroundColor: "var(--eez-surface-20)",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Typography variant="h6">Social links</Typography>
                      {socialLinks(service).map((link) => (
                        <Link
                          key={link.label}
                          href={toExternalUrl(link.value)}
                          target="_blank"
                          rel="noreferrer"
                          underline="none"
                          color="inherit"
                          sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
                        >
                          {link.icon}
                          {link.label}
                        </Link>
                      ))}
                    </Stack>
                  </Paper>
                ) : null}

                {catalogItems.length > 0 ? (
                  <Paper
                    sx={{
                      p: 3,
                      border: "var(--eez-border-1)",
                      backgroundColor: "var(--eez-surface-20)",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Typography variant="h6">Catalog</Typography>
                      {catalogItems.map((catalogItem) => (
                        <Paper
                          key={catalogItem.id}
                          sx={{
                            p: 1.5,
                            border: "var(--eez-border-10)",
                            backgroundColor: "var(--eez-surface-28)",
                          }}
                        >
                          <Stack spacing={1}>
                            {catalogItem.url ? (
                              <Box
                                component="img"
                                src={catalogItem.url}
                                alt={catalogItem.title || service?.name || "Catalog item"}
                                sx={{
                                  width: "100%",
                                  height: 160,
                                  objectFit: "cover",
                                  borderRadius: 1,
                                }}
                              />
                            ) : null}
                            <Typography fontWeight={700}>
                              {catalogItem.title || "Catalog item"}
                            </Typography>
                            {catalogItem.price ? (
                              <Typography color="primary.light" fontWeight={700}>
                                {formatPrice(catalogItem.price)}
                              </Typography>
                            ) : null}
                            {catalogItem.notes ? (
                              <Typography color="text.secondary">{catalogItem.notes}</Typography>
                            ) : null}
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Paper>
                ) : null}
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
