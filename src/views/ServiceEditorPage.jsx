"use client";
import { useEffect, useRef, useState } from 'react';
import { Alert, Autocomplete, Box, CircularProgress, MenuItem, Stack, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { fetchAdminService, fetchServiceTypes, fetchServiceSpecialties, saveAdminService } from '../lib/api';
import { useNavigate } from '../lib/navigation';
import { AdminHeading, AdminSection, AdminSaveBar, adminGridSx } from '../components/BusinessAdminLayout';
import ServiceMediaManager from '../components/ServiceMediaManager';
import { changeServiceType, isVenueService, serviceEditorPayload } from '../lib/serviceEditor';
const fields = [['name', 'Service name'], ['description', 'Description'], ['price', 'Price'], ['capacity', 'Capacity'], ['service_street', 'Service street'], ['service_street2', 'Address line 2'], ['service_city', 'City'], ['service_state', 'State'], ['service_zip', 'ZIP code'], ['google_map_link', 'Google Maps link'], ['facebook', 'Facebook'], ['instagram', 'Instagram'], ['twitter', 'X / Twitter'], ['linkedin', 'LinkedIn']];
export default function ServiceEditorPage({ businessId, serviceId }) {
  const isNew = serviceId === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [types, setTypes] = useState({});
  const [specialties, setSpecialties] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [tab, setTab] = useState('details');
  const invalidField = useRef(null);
  useEffect(() => {
    if (tab === 'details' && invalidField.current) {
      invalidField.current.reportValidity();
      invalidField.current = null;
    }
  }, [tab]);
  useEffect(() => {
    let active = true;
    Promise.all([fetchServiceTypes(), isNew ? Promise.resolve(null) : fetchAdminService(serviceId), fetchServiceSpecialties()]).then(([categories, service, catalog]) => {
      if (!active) return;
      setTypes(categories);
      setSpecialties(catalog);
      const item = isNew ? { name: '', price: '', type: '', status: 'active', show_availability: true } : service;
      if (!item || (!isNew && String(item.business_id) !== String(businessId))) throw new Error('Service not found in this business.');
      setForm({ ...item, specialty_ids: item.specialty_ids || (item.specialties || []).map(s => s.id) });
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [businessId, serviceId, isNew]);
  const change = (key, value) => setForm(current => key === 'type' ? changeServiceType(current, value) : { ...current, [key]: value });
  const specialtyOptions = specialties.filter(s => s.service_type === form?.type);
  return <Stack spacing={3}>
    <AdminHeading backTo={`/business-admin/${businessId}`} backLabel="Manage business" title={isNew ? 'Add service' : form?.name || 'Edit service'} subtitle="Build an offering that stands out. Add the details clients need to choose your service with confidence." />
    {error && <Alert severity="error">{error}</Alert>}
    {!form && !error && <CircularProgress aria-label="Loading service" />}
    {form && <Stack component="form" spacing={2.5} onInvalidCapture={e => {
      if (tab !== 'details') { invalidField.current = e.target; setTab('details'); }
    }} onSubmit={async e => {
      e.preventDefault();
      if (busy || mediaBusy || (!isNew && ['images', 'catalog'].includes(tab))) return;
      setBusy(true); setError('');
      try {
        const payload = serviceEditorPayload(form, businessId);
        const saved = await saveAdminService(businessId, isNew ? null : serviceId, payload);
        navigate(isNew ? `/business-admin/${businessId}/services/${saved.service_id}` : `/business-admin/${businessId}`);
      } catch (err) { setError(err.message); } finally { setBusy(false); }
    }}>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} aria-label="Service editing" variant="scrollable" scrollButtons="auto" textColor="inherit" sx={{ borderBottom: 1, borderColor: 'divider', '& .MuiTabs-indicator': { bgcolor: t => t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.main } }}>
        {[['details', 'Service details'], ['location', 'Location'], ['social', 'Social profiles'], ['visibility', 'Visibility'], ['images', 'Images'], ['catalog', 'Catalog']].map(([value, label]) => <Tab disabled={mediaBusy} key={value} value={value} label={label} id={`service-tab-${value}`} aria-controls={`service-panel-${value}`} />)}
      </Tabs>
      <Box role="tabpanel" id="service-panel-details" aria-labelledby="service-tab-details" hidden={tab !== 'details'}>
      <AdminSection title="Service details" subtitle="Choose your service type, then describe what you offer."><Box sx={adminGridSx}>
        <TextField fullWidth select required label="Service type" sx={{ gridColumn: '1 / -1' }} value={form.type || ''} disabled={busy} onChange={e => change('type', e.target.value)}>{Object.entries(types).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}</TextField>
        {['name', 'price'].map(key => <TextField key={key} fullWidth required label={key === 'name' ? 'Service name' : 'Price'} value={form[key] || ''} disabled={busy} onChange={e => change(key, e.target.value)} />)}
        {specialtyOptions.length > 0 && <Autocomplete multiple disableCloseOnSelect options={specialtyOptions} sx={{ gridColumn: '1 / -1' }} disabled={busy}
          value={specialtyOptions.filter(s => (form.specialty_ids || []).includes(s.id))}
          getOptionLabel={option => option.name} isOptionEqualToValue={(a, b) => a.id === b.id}
          getOptionDisabled={option => (form.specialty_ids || []).length >= 20 && !(form.specialty_ids || []).includes(option.id)}
          onChange={(_, selected) => change('specialty_ids', selected.map(s => s.id))}
          renderInput={params => <TextField {...params} label="Specialties" helperText="Optional · Choose up to 20 specialties for this service type." />} />}
        <TextField fullWidth required multiline minRows={3} sx={{ gridColumn: '1 / -1' }} label="Description" value={form.description || ''} disabled={busy} onChange={e => change('description', e.target.value)} />
        {isVenueService(form.type) && <TextField fullWidth required label="Capacity" type="number" value={form.capacity ?? ''} disabled={busy} inputProps={{ min: 1, step: 1 }} onChange={e => change('capacity', e.target.value)} helperText="Maximum number of guests the venue can accommodate." />}
      </Box></AdminSection>
      </Box>
      <Box role="tabpanel" id="service-panel-visibility" aria-labelledby="service-tab-visibility" hidden={tab !== 'visibility'}>
      <AdminSection title="Service status" subtitle="Inactive services are hidden from search results and won’t receive new inquiries."><Box sx={adminGridSx}>
        <Stack spacing={1.5}><Typography id="service-status-label" fontWeight={600}>Status</Typography>
          <ToggleButtonGroup exclusive value={form.status || 'active'} disabled={busy} aria-labelledby="service-status-label" onChange={(_, value) => { if (value !== null) change('status', value); }} sx={{ '& .Mui-selected': { color: 'text.primary', bgcolor: 'action.selected' } }}>
            <ToggleButton value="active">Active</ToggleButton><ToggleButton value="inactive">Inactive</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Stack spacing={1.5}><Typography id="service-availability-label" fontWeight={600}>Show availability</Typography>
          <ToggleButtonGroup exclusive value={form.show_availability ?? true} disabled={busy} aria-labelledby="service-availability-label" onChange={(_, value) => { if (value !== null) change('show_availability', value); }} sx={{ '& .Mui-selected': { color: 'text.primary', bgcolor: 'action.selected' } }}>
            <ToggleButton value={true}>Yes</ToggleButton><ToggleButton value={false}>No</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box></AdminSection>
      </Box>
      {[
        { tab: 'location', title: 'Service location', subtitle: 'Add the address where this service is based.', keys: ['service_street', 'service_street2', 'service_city', 'service_state', 'service_zip', 'google_map_link'] },
        { tab: 'social', title: 'Social profiles', subtitle: 'Give clients more ways to explore your work. These links are optional.', keys: ['facebook', 'instagram', 'twitter', 'linkedin'] },
      ].map(group => <Box key={group.tab} role="tabpanel" id={`service-panel-${group.tab}`} aria-labelledby={`service-tab-${group.tab}`} hidden={tab !== group.tab}><AdminSection title={group.title} subtitle={group.subtitle}><Box sx={adminGridSx}>
      {fields.filter(([key]) => group.keys.includes(key)).map(([key, label]) => <TextField fullWidth sx={['name', 'description', 'service_street', 'service_street2'].includes(key) ? { gridColumn: '1 / -1' } : {}} key={key} label={label} value={form[key] ?? ''} disabled={busy} required={['name', 'price'].includes(key)} type={key === 'capacity' ? 'number' : 'text'} inputProps={key === 'capacity' ? { min: 0, step: 1 } : {}} multiline={key === 'description'} minRows={key === 'description' ? 4 : undefined} onChange={e => change(key, e.target.value)} />)}
      </Box></AdminSection></Box>)}
      {['images', 'catalog'].includes(tab) && <Box role="tabpanel" id={`service-panel-${tab}`} aria-labelledby={`service-tab-${tab}`}>
        {isNew ? <Alert severity="info">Save your service details first, then open Images or Catalog to upload photos and offerings.</Alert> : <ServiceMediaManager key={`${serviceId}-${tab}`} serviceId={serviceId} catalog={tab === 'catalog'} onBusyChange={setMediaBusy} />}
      </Box>}
      {(!['images', 'catalog'].includes(tab) || isNew) && <AdminSaveBar busy={busy || mediaBusy} label={isNew ? 'Create service' : 'Save service'} cancelTo={`/business-admin/${businessId}`} />}
    </Stack>}
  </Stack>;
}
