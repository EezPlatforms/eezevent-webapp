import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VendorProfileSeo from "../components/VendorProfileSeo";
import { Alert, Box, Button, Chip, CircularProgress, Divider, Paper, Rating, Stack, Typography } from "@mui/material";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { fetchPublicServiceProfile, fetchServiceImages, fetchServiceCatalogItems, fetchVendorReviews } from "../lib/api";

export default function VendorProfilePage() {
  const { serviceId } = useParams();
  const [profile, setProfile] = useState(null);
  const [images, setImages] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [average, setAverage] = useState(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;
  const validId = /^\d+$/.test(serviceId || "");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setProfile(null);
    setReviews([]);
    setOffset(0);
    if (!validId) { setError("Invalid vendor profile link."); setLoading(false); return; }
    Promise.all([
      fetchPublicServiceProfile(serviceId),
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
  }, [serviceId, validId]);

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
  const card = { p: { xs: 2.5, md: 3 }, border: "1px solid rgba(120,147,255,0.18)", background: "linear-gradient(145deg, rgba(32,40,132,0.96), rgba(21,28,99,0.96))" };

  if (loading) return <Stack alignItems="center" sx={{ py: 10 }}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error}</Alert>;
  return <><VendorProfileSeo service={service} business={business} images={images} reviewCount={reviewCount} averageRating={average} /><Stack spacing={3}>
    <Paper sx={card}>
      <Stack spacing={2}>
        <Chip label={service.type_name || service.type || "EezEvent Vendor"} sx={{ alignSelf: "flex-start" }} />
        <Typography variant="h3">{service.name}</Typography>
        <Typography variant="h6" color="text.secondary">{business.business_name || ""}{location ? ` · ${location}` : ""}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {reviewCount > 0 && average != null ? <>
            <Rating value={Number(average)} precision={0.1} readOnly />
            <Typography>{Number(average).toFixed(1)} ({reviewCount} reviews)</Typography>
          </> : <Typography color="text.secondary">No reviews yet</Typography>}
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Button variant="contained" startIcon={<ShareRoundedIcon />} onClick={share}>Share profile</Button>
          <Button variant="outlined" startIcon={<WhatsAppIcon />} component="a" href={`https://wa.me/?text=${encodeURIComponent(`Check out ${service.name} on EezEvent: ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</Button>
          <Button variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={copyLink}>{copied ? "Link copied" : "Copy link"}</Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">For Instagram, copy the link and paste it into a story link sticker, bio, or message.</Typography>
      </Stack>
    </Paper>
    {images.length > 0 && <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 1.5 }}>
      {images.map((image, index) => <Box key={image.id || index} component="img" src={image.url} alt={image.caption || service.name} loading="lazy" sx={{ width: "100%", height: { xs: 160, md: 240 }, objectFit: "cover", borderRadius: 2 }} />)}
    </Box>}
    <Paper sx={card}><Typography variant="h5" gutterBottom>About this service</Typography><Typography color="text.secondary">{service.description || "No description provided."}</Typography>
      {service.price && <Typography sx={{ mt: 2 }}>Starting price: {service.price}</Typography>}
    </Paper>
    {catalog.length > 0 && <Paper sx={card}><Typography variant="h5" gutterBottom>Services & catalog</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
        {catalog.map((item, index) => <Paper key={item.id || index} sx={{ p: 2, backgroundColor: "rgba(255,255,255,0.05)" }}>
          {item.url && <Box component="img" src={item.url} alt={item.title || "Catalog item"} loading="lazy" sx={{ width: "100%", height: 170, objectFit: "cover", borderRadius: 1 }} />}
          <Typography fontWeight={700}>{item.title}</Typography><Typography color="text.secondary">{item.notes}</Typography>{item.price && <Typography>{item.price}</Typography>}
        </Paper>)}
      </Box>
    </Paper>}
    <Paper sx={card}><Typography variant="h5" gutterBottom>Customer reviews</Typography>
      {reviewCount > 0 && average != null && <Typography color="text.secondary" sx={{ mb: 2 }}>{Number(average).toFixed(1)} out of 5 · {reviewCount} reviews</Typography>}
      {reviewError && <Alert severity="warning" sx={{ mb: 2 }}>{reviewError}</Alert>}
      {!reviews.length && !reviewError && <Typography color="text.secondary">No reviews yet.</Typography>}
      <Stack spacing={2}>{reviews.map(review => <Box key={review.id}>
        <Typography fontWeight={700}>{review.authorName || "EezEvent customer"}</Typography>
        <Rating value={Number(review.rating) || 0} readOnly size="small" />
        <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{review.comment}</Typography>
        {review.vendorResponse && <Box sx={{ ml: 2, mt: 1.5, p: 2, borderLeft: "3px solid", borderColor: "primary.main", backgroundColor: "rgba(255,255,255,0.05)" }}>
          <Typography fontWeight={700}>Vendor response</Typography><Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{review.vendorResponse}</Typography>
        </Box>}
        <Divider sx={{ mt: 2 }} />
      </Box>)}</Stack>
      {offset < reviewCount && <Button sx={{ mt: 2 }} onClick={loadMore} disabled={moreLoading}>{moreLoading ? "Loading..." : "Load more reviews"}</Button>}
    </Paper>
  </Stack></>;
}
