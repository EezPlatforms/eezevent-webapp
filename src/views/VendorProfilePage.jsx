"use client";
import { vendorProfilePath } from "../lib/vendorProfilePath";
import { useAuth } from "../lib/auth";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import VendorInquiry from "../components/VendorInquiry";
import { RouterLink } from "../lib/navigation";
import { formatPrice } from "../lib/formatPrice";
import { useEffect, useState } from "react";


import { Alert, Box, Button, ButtonBase, Chip, CircularProgress, Divider, Paper, Rating, Stack, Typography } from "@mui/material";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import VendorMediaCarousel from "../components/VendorMediaCarousel";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { fetchPublicServiceProfile, fetchServiceImages, fetchServiceCatalogItems, fetchVendorReviews } from "../lib/api";

export default function VendorProfilePage({serviceId,initialProfile,returnTo = null, initialInquiry = false, initialInquiryEvent = ""}) {
  const { isAuthenticated, authReady } = useAuth();
  const [inquiryOpen, setInquiryOpen] = useState(initialInquiry);
  const inquiryParams = new URLSearchParams({ inquiry: "1" });
  if (returnTo) inquiryParams.set("returnTo", returnTo);
  const inquiryPath = `${vendorProfilePath(initialProfile?.service || { service_id: serviceId })}?${inquiryParams}`;
  const [profile, setProfile] = useState(initialProfile || null);
  const [images, setImages] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [average, setAverage] = useState(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(!initialProfile);
  const [moreLoading, setMoreLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [viewer, setViewer] = useState(null);
  const [copied, setCopied] = useState(false);
  // Keep server HTML and the first client render identical during hydration.
  const [browserShareUrl, setBrowserShareUrl] = useState(null);
  const shareUrl = browserShareUrl?.serviceId === serviceId
    ? browserShareUrl.url
    : `https://eezevent.com${vendorProfilePath(initialProfile?.service || { service_id: serviceId })}`;

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("returnTo");
    url.searchParams.delete("inquiry");
    url.searchParams.delete("inquiryEvent");
    setBrowserShareUrl({ serviceId, url: url.href });
  }, [serviceId]);
  const validId = /^\d+$/.test(serviceId || "");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setProfile(initialProfile || null);
    setReviews([]);
    setViewer(null);
    setOffset(0);
    if (!validId) { setError("Invalid vendor profile link."); setLoading(false); return; }
    Promise.all([
      initialProfile ? Promise.resolve(initialProfile) : fetchPublicServiceProfile(serviceId),
      fetchServiceImages(serviceId),
      fetchServiceCatalogItems(serviceId),
    ]).then(([p, i, c]) => {
      if (!active) return;
      if (!p?.service) throw new Error("Vendor profile not found.");
      setProfile(p);
      setImages(i);
      setCatalog(c);
    }).catch(e => { if (active) setError(e.message || "Unable to load profile."); })
      .finally(() => { if (active) setLoading(false); });
    fetchVendorReviews(serviceId).then(data => {
      if (!active) return;
      setReviews(data.reviews);
      setReviewCount(data.reviewCount);
      setAverage(data.averageRating);
      setOffset(data.reviews.length);
    }).catch(e => { if (active) setReviewError(e.message); });
    return () => { active = false; };
  }, [serviceId, validId, initialProfile]);

  const loadMore = async () => {
    setMoreLoading(true);
    setReviewError("");
    try {
      const data = await fetchVendorReviews(serviceId, { limit: 5, offset });
      setReviews(current => [...current, ...data.reviews.filter(r => !current.some(existing => existing.id === r.id))]);
      setOffset(current => current + data.reviews.length);
      setReviewCount(data.reviewCount);
      setAverage(data.averageRating);
    } catch (e) { setReviewError(e.message); }
    finally { setMoreLoading(false); }
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); }
    catch { setCopied(false); }
  };
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: profile?.service?.name || "EezEvent vendor", url: shareUrl }); }
      catch (e) { if (e.name !== "AbortError") await copyLink(); }
    } else await copyLink();
  };
  const service = profile?.service || {};
  const business = profile?.business || {};
  const location = [service.service_city || business.city, service.service_state || business.state].filter(Boolean).join(", ");
  const card = { p: { xs: 2.5, md: 4 }, border: "var(--eez-border-5)", background: "var(--eez-surface-16)", borderRadius: 3, boxShadow: "none" };
  const sectionTitle = { fontSize: { xs: 23, md: 27 }, letterSpacing: "-0.02em", mb: 2.5 };
  const viewerItems = viewer?.kind === "catalog"
    ? catalog.map((item, index) => ({ ...item, title: item.title?.trim() || `Service package ${index + 1}`, package: true }))
    : images;
  const imageButton = { display: "block", width: "100%", textAlign: "left", "&:focus-visible": { outline: "3px solid #b8c1ff", outlineOffset: -3 }, "&:hover img": { opacity: .85 } };
  const hasRating = reviewCount > 0 && average != null;

  if (loading) return <Stack alignItems="center" sx={{ py: 10 }}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error}</Alert>;
  return <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ minWidth: 0 }}>

    <Box component="header">
    {returnTo && <Button component={RouterLink} to={returnTo} scroll={false} startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start", color: "text.secondary", px: 0, py: .5, mb: 1 }}>Explore vendors</Button>}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2}>
        <Chip size="small" label={service.type_name || service.type || "Event vendor"} sx={{ color: "var(--eez-ink-3)", borderColor: "var(--eez-outline-3)", letterSpacing: ".04em" }} />
        <Button variant="outlined" color="secondary" size="small" sx={{ py: .75, px: 1.5 }} startIcon={<ShareRoundedIcon />} onClick={share}>Share profile</Button>
      </Stack>
      <Typography component="h1" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: { xs: 32, sm: 40, md: 46 }, lineHeight: 1.12, letterSpacing: "-.035em", mt: 1.25, mb: 1.25, overflowWrap: "anywhere" }}>{service.name}</Typography>
      <Stack direction="row" gap={2} flexWrap="wrap" alignItems="center" sx={{ color: "text.secondary" }}>
        {business.business_name && <Typography>{business.business_name}</Typography>}
        {location && <Stack direction="row" gap={0.5} alignItems="center"><LocationOnOutlinedIcon fontSize="small" /><Typography>{location}</Typography></Stack>}
        <Typography component="a" href="#reviews" sx={{ color: "inherit", textUnderlineOffset: 4 }}>{hasRating ? `★ ${Number(average).toFixed(1)} · ${reviewCount} reviews` : "No reviews yet"}</Typography>
      </Stack>
    </Box>
    {images.length > 0 && <Box component="section" aria-label="Vendor portfolio" sx={{ display: "grid", gridTemplateColumns: images.length > 1 ? { xs: "1fr 1fr", md: images.length === 4 ? "1fr 1fr" : images.length < 5 ? "2fr 1fr" : "2fr 1fr 1fr" } : "1fr", gap: 1.5, borderRadius: 3, overflow: "hidden" }}>
      {images.slice(0, 5).map((image, index) => <ButtonBase aria-label={`View portfolio photo ${index + 1}`} onClick={() => setViewer({ kind: "portfolio", index })} key={image.id || index} sx={{ ...imageButton, position: "relative", gridColumn: index === 0 ? { xs: "1 / -1", md: images.length > 1 ? "1" : "1 / -1" } : "auto", gridRow: index === 0 ? { md: images.length === 3 || images.length >= 5 ? "span 2" : "auto" } : "auto", minWidth: 0 }}>
        <Box component="img" src={image.url} alt={image.caption || `${service.name} portfolio photo ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} sx={{ display: "block", width: "100%", height: index === 0 ? { xs: 260, md: images.length === 4 ? 204 : 420 } : { xs: 140, md: images.length > 2 ? 204 : 420 }, objectFit: "cover" }} />
        {index === 0 && service.price && <Box component="span" sx={{ position: "absolute", top: { xs: 12, sm: 16 }, right: { xs: 12, sm: 16 }, maxWidth: "calc(100% - 32px)", px: 2, py: 1.25, borderRadius: 2, bgcolor: "rgba(255,255,255,.95)", color: "#18243b", boxShadow: "0 4px 16px rgba(0,0,0,.15)", pointerEvents: "none", textAlign: "right" }}>
          <Typography component="span" variant="caption" sx={{ display: "block", color: "#526078" }}>Starting price</Typography>
          <Typography component="span" sx={{ display: "block", fontWeight: 700, fontSize: { xs: 16, sm: 20 }, lineHeight: 1.35, overflowWrap: "anywhere" }}>{formatPrice(service.price)}</Typography>
        </Box>}
      </ButtonBase>)}
    </Box>}
    <VendorInquiry serviceSlug={service.slug} serviceId={serviceId} serviceName={service.name} returnTo={returnTo} open={inquiryOpen} onOpenChange={setInquiryOpen} initialEvent={initialInquiryEvent} />
    <Stack spacing={1}>
      <Stack direction="row" gap={1.25} flexWrap="wrap">
        <Button variant="contained" startIcon={<ShareRoundedIcon />} onClick={share}>Share this vendor</Button>
        <Button variant="outlined" color="secondary" startIcon={<WhatsAppIcon />} component="a" href={`https://wa.me/?text=${encodeURIComponent(`Check out ${service.name} on EezEvent: ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer">Share on WhatsApp</Button>
        <Button color="secondary" startIcon={<ContentCopyRoundedIcon />} onClick={copyLink}>{copied ? "Link copied" : "Copy profile link"}</Button>
      </Stack>
      <Typography variant="caption" color="text.secondary" role="status" aria-live="polite">{copied ? "Profile link copied. Ready to share." : "Share with your event team, friends, or family."}</Typography>
    </Stack>
    <Box component="nav" aria-label="Profile sections" sx={{ display: "flex", gap: { xs: 3, md: 4 }, borderBottom: "var(--eez-border-6)", overflowX: "auto" }}>
      {[["about", "Overview"], ...(catalog.length ? [["services", "Services & catalog"]] : []), ["reviews", "Reviews"], ...(images.length > 5 ? [["portfolio", "All photos"]] : [])].map(([id, label]) => <Button key={id} component="a" href={`#${id}`} sx={{ color: "text.primary", borderRadius: 0, px: 0, pb: 2, flexShrink: 0, "&:hover": { color: "var(--eez-ink-4)", background: "transparent" } }}>{label}</Button>)}
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) 310px" }, gap: { xs: 3, md: 4 }, alignItems: "start" }}>
    <Stack spacing={3} sx={{ minWidth: 0, "& > *[id]": { scrollMarginTop: 32 } }}>
    <Paper component="section" id="about" sx={card}><Typography component="h2" sx={sectionTitle}>About this service</Typography><Typography color="text.secondary" sx={{ lineHeight: 1.85, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{service.description || "The vendor hasn’t added a description yet."}</Typography>

    </Paper>
    {catalog.length > 0 && <Paper component="section" id="services" sx={card}><Typography component="h2" sx={sectionTitle}>Services & catalog</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
        {catalog.map((item, index) => <Paper key={item.id || index} sx={{ backgroundColor: "var(--eez-surface-17)", border: "var(--eez-border-7)", boxShadow: "none", borderRadius: 2, overflow: "hidden" }}>
          <ButtonBase onClick={() => setViewer({ kind: "catalog", index })} aria-label={`View ${item.title?.trim() || `service package ${index + 1}`}`} sx={{ ...imageButton, height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}>
            {item.url && <Box component="img" src={item.url} alt={item.title || `Service package ${index + 1}`} loading="lazy" sx={{ width: "100%", height: 190, objectFit: "cover" }} />}
            <Stack spacing={1.5} sx={{ p: 2.5, flex: 1, overflowWrap: "anywhere" }}>
              <Typography variant="overline" sx={{ color: "var(--eez-ink-5)", letterSpacing: ".1em" }}>Service package</Typography>
              <Typography component="h3" sx={{ fontSize: 21, fontWeight: 700, lineHeight: 1.3 }}>{item.title?.trim() || `Service package ${index + 1}`}</Typography>
              <Typography sx={{ fontWeight: 700, color: "var(--eez-ink-3)" }}>{formatPrice(item.price) || "Contact vendor for pricing"}</Typography>
              <Box sx={{ flex: 1 }}><Typography variant="body2" fontWeight={700} sx={{ mb: .5 }}>Package details</Typography><Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>{item.notes?.trim() || "Package details haven’t been provided by the vendor yet."}</Typography></Box>
              <Typography sx={{ color: "var(--eez-ink-4)", fontWeight: 700, pt: 1 }}>View package & photos →</Typography>
            </Stack>
          </ButtonBase>
        </Paper>)}
      </Box>
    </Paper>}
    <Paper component="section" id="reviews" sx={card}><Typography component="h2" sx={sectionTitle}>Customer reviews</Typography>
      {reviewCount > 0 && average != null && <Typography color="text.secondary" sx={{ mb: 3, fontSize: 18 }}>{Number(average).toFixed(1)} out of 5 · {reviewCount} reviews</Typography>}
      {reviewError && <Alert severity="warning" sx={{ mb: 2 }}>{reviewError}</Alert>}
      {!reviews.length && !reviewError && <Typography color="text.secondary">No reviews yet.</Typography>}
      <Stack spacing={2}>{reviews.map(review => <Box key={review.id}>
        <Typography fontWeight={700}>{review.authorName || "EezEvent customer"}</Typography>
        <Rating value={Number(review.rating) || 0} readOnly size="small" />
        <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{review.comment}</Typography>
        {review.vendorResponse && <Box sx={{ ml: 2, mt: 1.5, p: 2, borderLeft: "3px solid", borderColor: "primary.main", backgroundColor: "var(--eez-surface-7)" }}>
          <Typography fontWeight={700}>Vendor response</Typography><Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{review.vendorResponse}</Typography>
        </Box>}
        <Divider sx={{ mt: 2 }} />
      </Box>)}</Stack>
      {offset < reviewCount && <Button sx={{ mt: 2 }} onClick={loadMore} disabled={moreLoading}>{moreLoading ? "Loading..." : "Load more reviews"}</Button>}
    </Paper>
    {images.length > 5 && <Paper component="section" id="portfolio" sx={card}>
      <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 2.5 }}><PhotoLibraryOutlinedIcon /><Typography component="h2" sx={{ ...sectionTitle, mb: 0 }}>Portfolio</Typography></Stack>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.5 }}>{images.slice(5).map((image, index) => <ButtonBase key={image.id || index} aria-label={`View portfolio photo ${index + 6}`} onClick={() => setViewer({ kind: "portfolio", index: index + 5 })} sx={{ ...imageButton, borderRadius: 2, overflow: "hidden" }}><Box component="img" src={image.url} alt={image.caption || `${service.name} portfolio photo ${index + 6}`} loading="lazy" sx={{ display: "block", width: "100%", height: { xs: 140, sm: 220 }, objectFit: "cover" }} /></ButtonBase>)}</Box>
    </Paper>}
    </Stack>
    <Paper component="aside" aria-label="Vendor details and sharing" sx={{
      ...card,
      p: 3,
      position: { md: "sticky" },
      // Clear the 84px sticky header and leave breathing room at both edges.
      top: { md: 108 },
      maxHeight: { md: "calc(100dvh - 132px)" },
      overflowY: { md: "auto" },
      overscrollBehaviorY: "contain",
    }}>
      <Typography variant="overline" sx={{ color: "var(--eez-ink-5)", letterSpacing: ".12em" }}>At a glance</Typography>
      <Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, mt: 1, mb: 2 }}>{service.type_name || service.type || "Event service"}</Typography>
      {location && <Stack direction="row" spacing={1} sx={{ mb: 2 }}><LocationOnOutlinedIcon sx={{ color: "var(--eez-ink-5)" }} /><Typography color="text.secondary">{location}</Typography></Stack>}
      {service.price && <Box sx={{ py: 2, borderTop: "var(--eez-border-8)" }}><Typography variant="body2" color="text.secondary">Starting price</Typography><Typography sx={{ fontSize: 28, fontWeight: 700, mt: .5 }}>{formatPrice(service.price)}</Typography></Box>}
      {hasRating && <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 2 }}><Rating value={Number(average)} precision={0.1} readOnly size="small" /><Typography variant="body2">{Number(average).toFixed(1)} ({reviewCount})</Typography></Stack>}
      <Divider sx={{ my: 2.5, borderColor: "var(--eez-outline-4)" }} />
      <Typography fontWeight={700} sx={{ mb: .5 }}>Planning together?</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>Share this vendor with your event team, friends, or family.</Typography>
      <Stack spacing={1.25}>
        <Button variant="contained" startIcon={<ShareRoundedIcon />} onClick={share}>Share this vendor</Button>
        <Button variant="outlined" color="secondary" startIcon={<WhatsAppIcon />} component="a" href={`https://wa.me/?text=${encodeURIComponent(`Check out ${service.name} on EezEvent: ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer">Share on WhatsApp</Button>
        <Button sx={{ color: "text.secondary" }} startIcon={<ContentCopyRoundedIcon />} onClick={copyLink}>{copied ? "Link copied" : "Copy profile link"}</Button>
      </Stack>
      <Divider sx={{ my: 2.5, borderColor: "divider" }} />
      <Stack spacing={1.25}>
        {isAuthenticated ? <Button variant="contained" startIcon={<SendRoundedIcon />} onClick={() => setInquiryOpen(true)} disabled={!authReady}>Send an inquiry</Button> : <>
          <Button component={RouterLink} to={`/login?account=client&next=${encodeURIComponent(inquiryPath)}`} variant="contained" disabled={!authReady}>Log in to inquire</Button>
          <Button component={RouterLink} to={`/register?next=${encodeURIComponent(inquiryPath)}`} variant="outlined" color="secondary" disabled={!authReady}>Create an account</Button>
        </>}
      </Stack>
    </Paper>
    </Box>
    <VendorMediaCarousel items={viewerItems} index={viewer?.index ?? -1} label={viewer?.kind === "catalog" ? "Service packages" : "Vendor portfolio"} onChange={index => setViewer(current => current ? { ...current, index } : null)} onClose={() => setViewer(null)} />
  </Stack>;
}
