"use client";
import { useCallback, useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, Chip, Divider, InputAdornment, Paper, Skeleton, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { fetchAdminBusinesses, fetchBusinessTransfers } from '../lib/api';
import { RouterLink } from '../lib/navigation';
import { AdminHeading, adminPanelSx, adminIconSx } from '../components/BusinessAdminLayout';
import { getPendingBusinessTransfer } from '../lib/businessTransfers';
import BusinessOwnershipTransfers from '../components/BusinessOwnershipTransfers';
export default function BusinessAdminPage() {
  const [businesses, setBusinesses] = useState(null);
  const [error, setError] = useState('');
  const [transfers, setTransfers] = useState([]);
  const [transferError, setTransferError] = useState('');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('businesses');
  const refresh = useCallback(async () => {
    setError(''); setTransferError('');
    const [businessResult, transferResult] = await Promise.allSettled([fetchAdminBusinesses(), fetchBusinessTransfers()]);
    if (businessResult.status === 'fulfilled') setBusinesses(businessResult.value);
    else setError(businessResult.reason.message);
    if (transferResult.status === 'fulfilled') setTransfers(transferResult.value);
    else { setTransfers([]); setTransferError('Transfer status could not be loaded. Please retry.'); }
  }, []);
  useEffect(() => {
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [refresh]);
  const filtered = businesses?.filter(b => [b.business_name, b.city, b.email].some(value => value?.toLowerCase().includes(query.toLowerCase())));
  return <Stack spacing={4}>
    <AdminHeading title="Business Admin" subtitle="A home for every business you manage. Keep profiles current, organize services, and manage ownership in one place." action={<Button component={RouterLink} to="/business-admin/new" variant="contained" startIcon={<AddRoundedIcon />}>Add business</Button>} />
    {error && <Alert severity="error" action={<Button onClick={refresh}>Retry</Button>}>{error}</Alert>}
    {transferError && <Alert severity="warning" action={<Button onClick={refresh}>Retry</Button>}>{transferError}</Alert>}
    <Tabs value={tab} onChange={(_, value) => setTab(value)} aria-label="Business administration" variant="scrollable" scrollButtons="auto" textColor="inherit" sx={{ borderBottom: 1, borderColor: 'divider', '& .MuiTabs-indicator': { bgcolor: t => t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.main } }}>
      <Tab value="businesses" label={`Your businesses${businesses ? ` (${businesses.length})` : ''}`} id="admin-tab-businesses" aria-controls="admin-panel-businesses" />
      <Tab value="transfers" label="Ownership transfers" id="admin-tab-transfers" aria-controls="admin-panel-transfers" />
    </Tabs>
    <Box role="tabpanel" id="admin-panel-businesses" aria-labelledby="admin-tab-businesses" hidden={tab !== 'businesses'}>
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} alignItems={{ sm: 'center' }}><Typography component="h2" variant="h6" fontWeight={700}>Your businesses</Typography><TextField size="small" label="Search businesses" value={query} onChange={e => setQuery(e.target.value)} sx={{ width: { xs: '100%', sm: 300 } }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }} /></Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>
        {!businesses && !error && [0, 1].map(key => <Skeleton key={key} variant="rounded" height={270} aria-label="Loading businesses" />)}
        {filtered?.map(b => <Paper elevation={0} key={b.business_id} sx={{ ...adminPanelSx, display: 'flex', flexDirection: 'column', transition: 'border-color .2s', '&:hover': { borderColor: t => t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.main } }}>
          <Stack direction="row" spacing={2} alignItems="flex-start"><Avatar variant="rounded" sx={{ ...adminIconSx, width: 48, height: 48 }}><StorefrontOutlinedIcon /></Avatar><Box sx={{ flex: 1, minWidth: 0 }}><Typography component="h3" variant="h6" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{b.business_name}</Typography><Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}><Chip size="small" variant="outlined" color={b.status === 'active' ? 'success' : 'default'} label={b.status === 'active' ? 'Active' : 'Inactive'} /><Chip size="small" variant="outlined" color={b.email_validated ? 'success' : 'warning'} label={b.email_validated ? 'Email verified' : 'Verify email'} />{getPendingBusinessTransfer(transfers, b.business_id) && <Chip size="small" variant="outlined" color="warning" label="Transfer pending" />}</Stack></Box></Stack>
          {getPendingBusinessTransfer(transfers, b.business_id) && <Stack spacing={1} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">Awaiting recipient acceptance. This business remains yours until they accept.</Typography>
            <Button size="small" onClick={() => setTab('transfers')} sx={{ alignSelf: 'flex-start' }}>View transfer</Button>
          </Stack>}
          <Stack spacing={1.25} sx={{ my: 3, flex: 1 }}><Stack direction="row" gap={1} alignItems="center"><LocationOnOutlinedIcon fontSize="small" color="action" /><Typography variant="body2" color="text.secondary">{[b.city, b.state].filter(Boolean).join(', ') || 'Location not added'}</Typography></Stack><Stack direction="row" gap={1} alignItems="center"><EmailOutlinedIcon fontSize="small" color="action" /><Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere', minWidth: 0 }}>{b.email}</Typography></Stack></Stack>
          <Divider sx={{ mb: 2 }} /><Button component={RouterLink} to={`/business-admin/${b.business_id}`} variant="outlined" sx={{ alignSelf: 'flex-start' }}>Manage business</Button>
        </Paper>)}
      </Box>
      {filtered?.length === 0 && <Paper elevation={0} sx={{ ...adminPanelSx, py: 6, textAlign: 'center' }}><StorefrontOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} /><Typography variant="h6">{businesses.length ? 'No matching businesses' : 'Your next business starts here'}</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>{businesses.length ? 'Try a different name, city, or email.' : 'Create your first business profile or accept an ownership invitation below.'}</Typography>{!businesses.length && <Button component={RouterLink} to="/business-admin/new" startIcon={<AddRoundedIcon />} variant="contained">Add business</Button>}</Paper>}
    </Stack>
    </Box>
    <Box role="tabpanel" id="admin-panel-transfers" aria-labelledby="admin-tab-transfers" hidden={tab !== 'transfers'}>
      <BusinessOwnershipTransfers onChanged={refresh} />
    </Box>
  </Stack>;
}
