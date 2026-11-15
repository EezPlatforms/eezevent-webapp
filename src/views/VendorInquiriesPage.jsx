"use client";
import { useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, InputAdornment, MenuItem, Pagination, Paper, Skeleton, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useAuth } from "../lib/auth";
import { Navigate, useSearchParams } from "../lib/navigation";
import { fetchVendorInquiries, fetchVendorServices } from "../lib/api";
import { filterVendorInquiries, groupVendorInquiries, inquiryBuckets, inquiryStatusColor, inquiryStatusLabel, normalizeInquiryStatus } from "../lib/vendorInquiries";
import AppDownloadLinks from "../components/AppDownloadLinks";

const panel = { border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none", minWidth: 0, overflow: "hidden" };
const accent = (theme, color) => color === 'text.secondary' ? theme.palette.text.secondary : theme.palette[color][theme.palette.mode === 'dark' ? 'light' : 'dark'];
const money = value => value == null ? 'Not quoted yet' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0);
const date = value => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Date to be confirmed';
};
function StatusBadge({ status }) {
  const color = inquiryStatusColor(status);
  return <Chip size="small" label={inquiryStatusLabel(status)} sx={{ fontWeight: 700, color: theme => accent(theme, color), bgcolor: theme => alpha(accent(theme, color), .12), border: '1px solid', borderColor: theme => alpha(accent(theme, color), .25) }} />;
}
export default function VendorInquiriesPage() {
  const { auth, authReady, isAuthenticated } = useAuth();
  const [params, setParams] = useSearchParams();
  const requestedBucket = params.get('status') || 'open';
  const bucket = ['all', ...inquiryBuckets.map(item => item.key)].includes(requestedBucket) ? requestedBucket : 'open';
  const serviceId = params.get('service_id') || '';
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const vendor = authReady && isAuthenticated && auth?.userType === 'vendor';
  useEffect(() => {
    if (!vendor) return;
    const controller = new AbortController();
    let active = true;
    setLoading(true); setError(null); setSelected(null);
    Promise.all([
      Promise.all(inquiryBuckets.map(group => fetchVendorInquiries(group.key, { signal: controller.signal }))),
      fetchVendorServices(),
    ]).then(([buckets, list]) => {
      if (!active) return;
      setItems([...new Map(buckets.flat().map(item => [item.inquiry_id, item])).values()]);
      setServices(Array.isArray(list) ? list : []); setUpdatedAt(new Date());
    }).catch(err => { if (active && err.name !== 'AbortError') setError(err); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [vendor, revision]);
  useEffect(() => { setPage(1); }, [bucket, serviceId, status, search, sort, revision]);
  useEffect(() => { setStatus(''); }, [bucket, serviceId]);
  const scoped = useMemo(() => filterVendorInquiries(items, { serviceId, bucket: 'all' }), [items, serviceId]);
  const statuses = useMemo(() => [...new Set(scoped.filter(item => bucket === 'all' || item.bucket === bucket).map(item => normalizeInquiryStatus(item.status)))].sort(), [scoped, bucket]);
  const filtered = useMemo(() => filterVendorInquiries(items, { bucket, serviceId, status, search, sort }), [items, bucket, serviceId, status, search, sort]);
  const groups = useMemo(() => groupVendorInquiries(filtered), [filtered]);
  const pageCount = Math.max(1, Math.ceil(groups.length / 10));
  const currentPage = Math.min(page, pageCount);
  const changeScope = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setStatus(''); setPage(1); setParams(next);
  };
  if (!authReady) return <Box role="status" sx={{ textAlign: 'center', py: 6 }}><CircularProgress aria-label="Loading your workspace" /></Box>;
  if (!isAuthenticated) return <Navigate to={`/login?account=vendor&next=${encodeURIComponent(`/inquiries?${params}`)}`} replace />;
  if (auth?.userType !== 'vendor') return <Navigate to="/events" replace />;
  return <Stack spacing={3}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}><Box><Typography variant="overline" sx={{ color: theme => accent(theme, 'primary'), letterSpacing: '.15em', fontWeight: 700 }}>BUSINESS WORKSPACE</Typography><Typography component="h1" sx={{ fontSize: { xs: 30, md: 38 }, fontWeight: 700, letterSpacing: '-.03em' }}>Inquiries</Typography><Typography color="text.secondary">From first hello to confirmed plans. Keep every opportunity in view.</Typography></Box><Button variant="outlined" color="inherit" startIcon={<RefreshRoundedIcon />} disabled={loading} onClick={() => setRevision(value => value + 1)}>Refresh</Button></Stack>
    {error && <Alert severity={error.status === 402 ? 'warning' : 'error'} action={<Button color="inherit" onClick={() => setRevision(value => value + 1)}>Try again</Button>}><Typography fontWeight={700}>{error.status === 402 ? 'Subscription required' : 'Unable to load inquiries'}</Typography>{error.message}{error.status === 402 && !error.ownerActionRequired && <Box sx={{ mt: 2 }}><Typography variant="body2" sx={{ mb: 1 }}>Choose or renew your plan in the EezEvent mobile app.</Typography><AppDownloadLinks /></Box>}</Alert>}
    <Paper sx={panel}>
      <Tabs value={bucket} onChange={(_, value) => changeScope('status', value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="Inquiry groups" sx={{ px: 1, borderBottom: '1px solid', borderColor: 'divider', '& .MuiTab-root': { py: 2.5, minHeight: 64, textTransform: 'none', color: 'text.secondary' }, '& .MuiTab-root.Mui-selected': { color: theme => accent(theme, 'primary') }, '& .MuiTabs-indicator': { bgcolor: theme => accent(theme, 'primary') } }}>
        {[{ key: 'all', label: 'All inquiries' }, ...inquiryBuckets].map(group => <Tab key={group.key} value={group.key} label={<Stack direction="row" alignItems="center" gap={1}><span>{group.label}</span><Chip size="small" label={loading || error ? '—' : scoped.filter(item => group.key === 'all' || item.bucket === group.key).length} sx={{ height: 22, bgcolor: 'action.hover', color: 'inherit' }} /></Stack>} />)}
      </Tabs>
      <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="body2" color="text.secondary">{bucket === 'all' ? 'Open, pending, scheduled, and vendor-declined inquiries.' : inquiryBuckets.find(group => group.key === bucket)?.description}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1.5fr 1.2fr 1fr 1fr' }, gap: 2 }}>
          <TextField size="small" label="Search inquiries" placeholder="Event, client, service, or inquiry #" value={search} onChange={event => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }} />
          <TextField select size="small" label="Service" value={serviceId} onChange={event => changeScope('service_id', event.target.value)}><MenuItem value="">All services</MenuItem>{serviceId && !services.some(service => String(service.service_id) === serviceId) && <MenuItem value={serviceId}>Selected service #{serviceId}</MenuItem>}{services.map(service => <MenuItem key={service.service_id} value={String(service.service_id)}>{[service.name || 'Service', service.business_name].filter(Boolean).join(' · ')}</MenuItem>)}</TextField>
          <TextField select size="small" label="Status" value={status} onChange={event => setStatus(event.target.value)}><MenuItem value="">All statuses</MenuItem>{statuses.map(value => <MenuItem key={value} value={value}>{inquiryStatusLabel(value)}</MenuItem>)}</TextField>
          <TextField select size="small" label="Sort by" value={sort} onChange={event => setSort(event.target.value)}><MenuItem value="newest">Newest inquiry</MenuItem><MenuItem value="event-date">Event date</MenuItem></TextField>
        </Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}><Typography variant="body2" color="text.secondary" role="status">{loading ? 'Loading inquiries…' : error ? 'Inquiries unavailable' : `${filtered.length} ${filtered.length === 1 ? 'inquiry' : 'inquiries'} across ${groups.length} ${groups.length === 1 ? 'event' : 'events'}`}</Typography>{(search || status || serviceId) && <Button color="inherit" size="small" onClick={() => { setSearch(''); setStatus(''); changeScope('service_id', ''); }}>Clear filters</Button>}</Stack>
      </Stack>
    </Paper>
    {loading ? <Stack spacing={2} role="status" aria-label="Loading inquiries">{[0, 1, 2].map(key => <Skeleton key={key} variant="rounded" height={175} />)}</Stack> : !error && groups.length === 0 ? <Paper sx={{ ...panel, p: 6, textAlign: 'center' }}><InboxOutlinedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 2 }} /><Typography variant="h6">{search || status || serviceId ? 'No inquiries match your filters' : 'No inquiries here yet'}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{search || status || serviceId ? 'Try a different search, service, or status.' : 'Inquiries will appear here as clients connect with your services.'}</Typography></Paper> : !error && <>
      <Stack spacing={2}>{groups.slice((currentPage - 1) * 10, currentPage * 10).map(group => <Paper key={group.key} component="section" sx={panel}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: { xs: 2, md: 2.5 }, bgcolor: 'action.hover' }}><Avatar variant="rounded" src={group.event.profile_image_url || undefined} alt="" sx={{ width: 48, height: 48, bgcolor: theme => alpha(accent(theme, 'primary'), .12), color: theme => accent(theme, 'primary') }}><EventOutlinedIcon /></Avatar><Box sx={{ minWidth: 0, flex: 1 }}><Typography component="h2" variant="h6" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{group.event.event_name || 'Untitled event'}</Typography><Typography variant="body2" color="text.secondary">{date(group.event.start_time)}</Typography><Typography variant="body2" color="text.secondary">{[group.event.client_first_name, group.event.client_last_name].filter(Boolean).join(' ') || 'Client'}{group.event.zipcode ? ` · ZIP ${group.event.zipcode}` : ''}</Typography></Box>{group.inquiries.length > 1 && <Chip size="small" label={`${group.inquiries.length} inquiries`} />}</Stack>
        <Stack divider={<Divider />}>{group.inquiries.map(item => <Box key={item.inquiry_id} sx={{ p: { xs: 2, md: 2.5 }, borderLeft: '4px solid', borderLeftColor: theme => accent(theme, inquiryStatusColor(item.status)) }}><Stack direction={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}><Box sx={{ minWidth: 0 }}><Stack direction="row" alignItems="center" gap={1} flexWrap="wrap"><Typography fontWeight={700}>{item.service_name || item.service_type_name || 'Service'}</Typography><StatusBadge status={item.status} />{item.is_referral && <Chip size="small" variant="outlined" label="Referral" />}</Stack><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>{item.business_name || 'Your business'} · Inquiry #{item.inquiry_id}</Typography></Box><Stack direction="row" alignItems="center" gap={2} justifyContent="space-between" sx={{ width: { xs: '100%', sm: 'auto' } }}><Typography fontWeight={600} variant="body2">{money(item.quote_amount)}</Typography><Button color="inherit" size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => setSelected(item)} aria-label={`View inquiry ${item.inquiry_id} for ${item.service_name || 'service'}`}>View</Button></Stack></Stack></Box>)}</Stack>
      </Paper>)}</Stack>
      {pageCount > 1 && <Stack alignItems="center"><Pagination count={pageCount} page={currentPage} onChange={(_, value) => setPage(value)} aria-label="Inquiry pages" /></Stack>}
      {updatedAt && <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>Updated {updatedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Typography>}
    </>}
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm"><DialogTitle>Inquiry #{selected?.inquiry_id}</DialogTitle><DialogContent dividers>{selected && <Stack spacing={2}><StatusBadge status={selected.status} /><Typography variant="h6">{selected.event_name || 'Event'}</Typography><Typography color="text.secondary">{selected.service_name || 'Service'} · {selected.business_name || 'Your business'}</Typography><Divider /><Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'minmax(90px, 1fr) 2fr', gap: 1.5, '& dt': { color: 'text.secondary' }, '& dd': { m: 0, overflowWrap: 'anywhere' } }}><Typography component="dt">Client</Typography><Typography component="dd">{[selected.client_first_name, selected.client_last_name].filter(Boolean).join(' ') || 'Not provided'}</Typography><Typography component="dt">Event starts</Typography><Typography component="dd">{date(selected.start_time)}</Typography><Typography component="dt">Event ends</Typography><Typography component="dd">{date(selected.end_time)}</Typography><Typography component="dt">Quote</Typography><Typography component="dd">{money(selected.quote_amount)}</Typography><Typography component="dt">Guests</Typography><Typography component="dd">{selected.number_of_guests ?? 'Not provided'}</Typography><Typography component="dt">Received</Typography><Typography component="dd">{date(selected.created_at)}</Typography></Box><Alert severity="info">Use the EezEvent mobile app to reply, manage quotes, and take action on this inquiry.</Alert><AppDownloadLinks /></Stack>}</DialogContent><DialogActions><Button color="inherit" onClick={() => setSelected(null)}>Close</Button></DialogActions></Dialog>
  </Stack>;
}
