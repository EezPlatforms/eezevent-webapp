"use client";
import { useEffect, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { fetchAdminBusinesses, fetchAdminServices, saveAdminBusiness, setAdminBusinessActive, sendBusinessContactCode, verifyBusinessContactCode } from '../lib/api';
import { RouterLink, useNavigate } from '../lib/navigation';
import { AdminHeading, AdminSection, AdminSaveBar, adminGridSx, adminPanelSx } from '../components/BusinessAdminLayout';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import BusinessServiceCard from '../components/BusinessServiceCard';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
const fields = [['business_name', 'Business name'], ['contact_name', 'Contact name'], ['email', 'Contact email'], ['phone', 'Phone'], ['street', 'Street'], ['street2', 'Address line 2'], ['city', 'City'], ['state', 'State'], ['zip', 'ZIP code'], ['description', 'Description']];
export default function BusinessEditorPage({ businessId, editing = false }) {
  const isNew = businessId === 'new';
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [form, setForm] = useState(null);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const isEditing = isNew || editing;
  useEffect(() => {
    let active = true;
    if (isNew) { setForm(Object.fromEntries(fields.map(([key]) => [key, '']))); return; }
    Promise.all([fetchAdminBusinesses(), editing ? Promise.resolve([]) : fetchAdminServices(businessId)]).then(([items, list]) => {
      if (!active) return;
      const item = items.find(b => String(b.business_id) === businessId);
      if (!item) throw new Error('Business not found or not owned by you.');
      setBusiness(item); setForm(item); setServices(list);
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [businessId, isNew, editing]);
  const run = async action => { setBusy(true); setError(''); setMessage(''); try { await action(); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  const description = typeof business?.description === 'string' ? business.description.trim() : '';
  return <Stack spacing={3}>
    <AdminHeading backTo={editing ? `/business-admin/${businessId}` : '/business-admin'} backLabel={editing ? 'Business overview' : 'Business Admin'} title={isNew ? 'Add business' : editing ? 'Edit business' : business?.business_name || 'Manage business'} subtitle={isEditing ? 'Update your business profile, contact details, and address.' : 'Your business profile, services, and settings at a glance.'}>
      {business && <Stack direction="row" spacing={1}><Chip size="small" variant="outlined" color={business.status === 'active' ? 'success' : 'default'} label={business.status === 'active' ? 'Active business' : 'Inactive business'} /><Chip size="small" variant="outlined" color={business.email_validated ? 'success' : 'warning'} label={business.email_validated ? 'Email verified' : 'Email verification pending'} /></Stack>}
    </AdminHeading>
    {error && <Alert severity="error">{error}</Alert>}{message && <Alert severity="success">{message}</Alert>}
    {!form && !error && <CircularProgress aria-label="Loading business" />}
    {business && !isEditing && <AdminSection title="Business profile" icon={BusinessOutlinedIcon} action={business.status === 'active' ? <Button component={RouterLink} to={`/business-admin/${businessId}/edit`} variant="outlined" size="small" sx={{ flexShrink: 0 }}>Edit business</Button> : null}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
        <Stack spacing={1}><Typography variant="body2" color="text.secondary">Contact details</Typography><Typography fontWeight={600}>{business.contact_name}</Typography><Typography sx={{ overflowWrap: 'anywhere' }}>{business.email}</Typography><Typography>{business.phone}</Typography></Stack>
        <Stack spacing={1}><Typography variant="body2" color="text.secondary">Business address</Typography><Typography>{[business.street, business.street2].filter(Boolean).join(', ')}</Typography><Typography>{[business.city, business.state, business.zip].filter(Boolean).join(', ')}</Typography></Stack>
        {description ? <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>About this business</Typography><Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{description}</Typography></Box> : null}
      </Box>
    </AdminSection>}
    {form && isEditing && <Stack component="form" spacing={3} onSubmit={e => { e.preventDefault(); run(async () => {
      const payload = Object.fromEntries(fields.map(([key]) => [key, form[key] || '']));
      payload.latitude = business?.latitude ?? null; payload.longitude = business?.longitude ?? null;
      const saved = await saveAdminBusiness(isNew ? null : businessId, payload);
      if (isNew) navigate(`/business-admin/${saved.business_id}`);
      else navigate(`/business-admin/${businessId}`);
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
      <AdminSaveBar busy={busy} disabled={business?.status === 'inactive'} label={isNew ? 'Create business' : 'Save business'} cancelTo={isNew ? '/business-admin' : `/business-admin/${businessId}`} />
    </Stack>}
    {business && !isEditing && <>
      <AdminSection title="Services" subtitle="Manage the offerings clients see on your storefront." icon={BusinessOutlinedIcon} action={business.status === 'active' ? <Button component={RouterLink} to={`/business-admin/${businessId}/services/new`} startIcon={<AddRoundedIcon />} variant="outlined" size="small">Add service</Button> : null}>{services.length === 0 ? <Typography color="text.secondary">Add your first service to build your public profile.</Typography> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 }}>{services.map(service => <BusinessServiceCard key={service.service_id} service={service} businessId={businessId} />)}</Box>}</AdminSection>
      <Accordion elevation={0} disableGutters sx={{ ...adminPanelSx, p: 0, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} aria-controls="business-settings-content" id="business-settings-header" sx={{ px: 3, py: 1 }}><Box><Typography component="h2" variant="h6" fontWeight={700}>Settings</Typography><Typography variant="body2" color="text.secondary">Email verification and business availability</Typography></Box></AccordionSummary>
        <AccordionDetails id="business-settings-content"><Stack spacing={3}>
      <AdminSection title="Contact email verification" subtitle="Keep your public contact information verified." icon={ContactMailOutlinedIcon}><Stack spacing={2}><Typography color="text.secondary">{business.email} · {business.email_validated ? 'Verified' : 'Verify your saved contact email to make your services publicly visible.'}</Typography>{!business.email_validated && business.status === 'active' && <><Button disabled={busy} onClick={() => run(async () => { await sendBusinessContactCode(businessId, business.email); setMessage('Verification code sent.'); })}>Send verification code</Button><TextField label="Verification code" value={code} onChange={e => setCode(e.target.value)} /><Button disabled={busy || !code.trim()} onClick={() => run(async () => { await verifyBusinessContactCode(businessId, business.email, code.trim()); setBusiness(b => ({ ...b, email_validated: true })); setMessage('Contact email verified.'); })}>Verify email</Button></>}</Stack></AdminSection>
      <Paper elevation={0} sx={adminPanelSx}><Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'center' }} justifyContent="space-between"><Box><Typography fontWeight={700}>Business availability</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Inactive businesses are hidden from clients. Disable active services before deactivating.</Typography></Box><Button sx={{ flexShrink: 0 }} variant="outlined" disabled={busy} color={business.status === 'active' ? 'error' : 'primary'} onClick={() => {
        const active = business.status !== 'active';
        if (!window.confirm(active ? 'Reactivate this business?' : 'Deactivate this business? Disable all active services first.')) return;
        run(async () => { const result = await setAdminBusinessActive(businessId, active); setBusiness(b => ({ ...b, ...result, status: active ? 'active' : 'inactive' })); setMessage(active ? 'Business reactivated.' : 'Business deactivated.'); });
      }}>{business.status === 'active' ? 'Deactivate business' : 'Reactivate business'}</Button></Stack></Paper>
      </Stack></AccordionDetails></Accordion>
    </>}
  </Stack>;
}
