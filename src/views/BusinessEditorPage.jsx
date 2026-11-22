"use client";
import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { fetchAdminBusinesses, fetchAdminServices, saveAdminBusiness, setAdminBusinessActive, sendBusinessContactCode, verifyBusinessContactCode } from '../lib/api';
import { RouterLink, useNavigate } from '../lib/navigation';
import { AdminHeading, AdminSection, AdminSaveBar, adminGridSx, adminPanelSx } from '../components/BusinessAdminLayout';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import BusinessServiceCard from '../components/BusinessServiceCard';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
const fields = [['business_name', 'Business name'], ['contact_name', 'Contact name'], ['email', 'Contact email'], ['phone', 'Phone'], ['street', 'Street'], ['street2', 'Address line 2'], ['city', 'City'], ['state', 'State'], ['zip', 'ZIP code'], ['description', 'Description']];
export default function BusinessEditorPage({ businessId }) {
  const isNew = businessId === 'new';
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [form, setForm] = useState(null);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [tab, setTab] = useState('profile');
  useEffect(() => {
    let active = true;
    if (isNew) { setForm(Object.fromEntries(fields.map(([key]) => [key, '']))); return; }
    Promise.all([fetchAdminBusinesses(), fetchAdminServices(businessId)]).then(([items, list]) => {
      if (!active) return;
      const item = items.find(b => String(b.business_id) === businessId);
      if (!item) throw new Error('Business not found or not owned by you.');
      setBusiness(item); setForm(item); setServices(list);
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [businessId, isNew]);
  const run = async action => { setBusy(true); setError(''); setMessage(''); try { await action(); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  return <Stack spacing={3}>
    <AdminHeading backTo="/business-admin" title={isNew ? 'Add business' : business?.business_name || 'Manage business'} subtitle="Shape your public profile, keep contact details up to date, and organize the services you offer.">
      {business && <Stack direction="row" spacing={1}><Chip size="small" variant="outlined" color={business.status === 'active' ? 'success' : 'default'} label={business.status === 'active' ? 'Active business' : 'Inactive business'} /><Chip size="small" variant="outlined" color={business.email_validated ? 'success' : 'warning'} label={business.email_validated ? 'Email verified' : 'Email verification pending'} /></Stack>}
    </AdminHeading>
    {error && <Alert severity="error">{error}</Alert>}{message && <Alert severity="success">{message}</Alert>}
    {!form && !error && <CircularProgress aria-label="Loading business" />}
    {business && <Tabs value={tab} onChange={(_, value) => setTab(value)} aria-label="Business management" variant="scrollable" scrollButtons="auto" textColor="inherit" sx={{ borderBottom: 1, borderColor: 'divider', '& .MuiTabs-indicator': { bgcolor: t => t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.main } }}>
      <Tab value="profile" label="Business profile" id="business-tab-profile" aria-controls="business-panel-profile" />
      <Tab value="services" label={`Services (${services.length})`} id="business-tab-services" aria-controls="business-panel-services" />
      <Tab value="settings" label="Settings" id="business-tab-settings" aria-controls="business-panel-settings" />
    </Tabs>}
    <Box role={business ? 'tabpanel' : undefined} id="business-panel-profile" aria-labelledby={business ? 'business-tab-profile' : undefined} hidden={tab !== 'profile'}>
    {form && <Stack component="form" spacing={3} onSubmit={e => { e.preventDefault(); run(async () => {
      const payload = Object.fromEntries(fields.map(([key]) => [key, form[key] || '']));
      payload.latitude = business?.latitude ?? null; payload.longitude = business?.longitude ?? null;
      const saved = await saveAdminBusiness(isNew ? null : businessId, payload);
      if (isNew) navigate(`/business-admin/${saved.business_id}`);
      else { setBusiness(saved); setForm(saved); setMessage('Business saved.'); }
    }); }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3, alignItems: 'start' }}>
      {[
        { title: 'Business profile', subtitle: 'Introduce your business to potential clients.', icon: BusinessOutlinedIcon, keys: ['business_name', 'description'] },
        { title: 'Contact details', subtitle: 'The name, email, and phone shown on your public service profiles.', icon: ContactMailOutlinedIcon, keys: ['contact_name', 'email', 'phone'] },
        { title: 'Business address', subtitle: 'Help clients understand where your business is based.', icon: LocationOnOutlinedIcon, keys: ['street', 'street2', 'city', 'state', 'zip'] },
      ].map(group => <AdminSection sx={group.title === 'Business profile' ? { gridColumn: '1 / -1' } : {}} key={group.title} title={group.title} subtitle={group.subtitle} icon={group.icon}>
        <Box sx={adminGridSx}>{group.keys.map(key => <TextField key={key} fullWidth sx={['business_name', 'description', 'street', 'street2'].includes(key) ? { gridColumn: '1 / -1' } : {}} label={fields.find(([k]) => k === key)[1]} value={form[key] || ''} required={!['street2', 'description'].includes(key)} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} multiline={key === 'description'} minRows={key === 'description' ? 2 : undefined} inputProps={key === 'description' ? { maxLength: 255 } : {}} helperText={key === 'description' ? `Optional · ${(form.description || '').length}/255 characters` : key === 'email' ? 'Save email changes before requesting a verification code.' : undefined} onChange={e => setForm(current => ({ ...current, [key]: e.target.value }))} disabled={busy || business?.status === 'inactive'} />)}</Box>
      </AdminSection>)}
      </Box>
      <AdminSaveBar busy={busy} disabled={business?.status === 'inactive'} label={isNew ? 'Create business' : 'Save business'} cancelTo="/business-admin" />
    </Stack>}
    </Box>
    {business && <>
      <Box role="tabpanel" id="business-panel-settings" aria-labelledby="business-tab-settings" hidden={tab !== 'settings'}><Stack spacing={3}>
      <AdminSection title="Contact email verification" subtitle="Keep your public contact information verified." icon={ContactMailOutlinedIcon}><Stack spacing={2}><Typography color="text.secondary">{business.email} · {business.email_validated ? 'Verified' : 'Verify your saved contact email to make your services publicly visible.'}</Typography>{!business.email_validated && business.status === 'active' && <><Button disabled={busy} onClick={() => run(async () => { await sendBusinessContactCode(businessId, business.email); setMessage('Verification code sent.'); })}>Send verification code</Button><TextField label="Verification code" value={code} onChange={e => setCode(e.target.value)} /><Button disabled={busy || !code.trim()} onClick={() => run(async () => { await verifyBusinessContactCode(businessId, business.email, code.trim()); setBusiness(b => ({ ...b, email_validated: true })); setMessage('Contact email verified.'); })}>Verify email</Button></>}</Stack></AdminSection>
      <Paper elevation={0} sx={adminPanelSx}><Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'center' }} justifyContent="space-between"><Box><Typography fontWeight={700}>Business availability</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Inactive businesses are hidden from clients. Disable active services before deactivating.</Typography></Box><Button sx={{ flexShrink: 0 }} variant="outlined" disabled={busy} color={business.status === 'active' ? 'error' : 'primary'} onClick={() => {
        const active = business.status !== 'active';
        if (!window.confirm(active ? 'Reactivate this business?' : 'Deactivate this business? Disable all active services first.')) return;
        run(async () => { const result = await setAdminBusinessActive(businessId, active); setBusiness(b => ({ ...b, ...result, status: active ? 'active' : 'inactive' })); setMessage(active ? 'Business reactivated.' : 'Business deactivated.'); });
      }}>{business.status === 'active' ? 'Deactivate business' : 'Reactivate business'}</Button></Stack></Paper>
      </Stack></Box>
      <Box role="tabpanel" id="business-panel-services" aria-labelledby="business-tab-services" hidden={tab !== 'services'}>
      <AdminSection title="Services" subtitle="Manage the offerings clients see on your storefront." icon={BusinessOutlinedIcon} action={business.status === 'active' ? <Button component={RouterLink} to={`/business-admin/${businessId}/services/new`} startIcon={<AddRoundedIcon />} variant="outlined" size="small">Add service</Button> : null}>{services.length === 0 ? <Typography color="text.secondary">Add your first service to build your public profile.</Typography> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 }}>{services.map(service => <BusinessServiceCard key={service.service_id} service={service} businessId={businessId} />)}</Box>}</AdminSection>
      </Box>
    </>}
  </Stack>;
}
