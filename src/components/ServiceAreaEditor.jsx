"use client";
import { useEffect, useState } from 'react';
import { Alert, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { lookupServiceAreaZip } from '../lib/api';

export default function ServiceAreaEditor({ value, onChange, serviceZip, disabled }) {
  const zip = value.zip_code ?? serviceZip ?? '';
  const radius = String(value.radius_miles ?? 50);
  const [location, setLocation] = useState(null);
  const [lookupError, setLookupError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setLocation(null); setLookupError('');
    if (/^\d{5}$/.test(zip)) lookupServiceAreaZip(zip, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setLocation(result); })
      .catch(error => { if (!controller.signal.aborted) setLookupError(error.message || 'Unable to look up this ZIP code.'); });
    return () => controller.abort();
  }, [zip]);
  const place = location ? [location.city, location.state || location.state_code].filter(Boolean).join(', ') : '';
  return <Stack spacing={2}>
    <Typography component="h3" variant="h6">Service area</Typography>
    {place && <Typography color="text.secondary">{place} · {radius} miles</Typography>}
    <TextField fullWidth label="Service area ZIP" value={zip} disabled={disabled} inputProps={{ inputMode: 'numeric', maxLength: 5 }} onChange={e => onChange({ ...value, zip_code: e.target.value, latitude: undefined, longitude: undefined })} />
    {lookupError && <Alert severity="warning">{lookupError}</Alert>}
    <Stack spacing={1}><Typography fontWeight={600}>Local coverage (miles)</Typography><Typography variant="body2" color="text.secondary">Choose a quick option or enter your own distance below.</Typography></Stack>
    <ToggleButtonGroup exclusive aria-label="Quick coverage choices" value={Number(radius)} disabled={disabled} onChange={(_, miles) => { if (miles !== null) onChange({ ...value, radius_miles: String(miles) }); }} sx={{ flexWrap: 'wrap', gap: 1, '& .MuiToggleButtonGroup-grouped': { border: 1, borderColor: 'divider', borderRadius: '10px !important', m: '0 !important' }, '& .Mui-selected': { color: 'text.primary', bgcolor: 'action.selected' } }}>
      {[10, 25, 50, 75, 100].map(miles => <ToggleButton key={miles} value={miles} aria-label={`${miles} miles`}>{miles}</ToggleButton>)}
    </ToggleButtonGroup>
    <TextField label="Custom local coverage" type="number" value={radius} disabled={disabled} onChange={e => onChange({ ...value, radius_miles: e.target.value })} inputProps={{ min: 0, max: 500, step: 'any' }} InputProps={{ endAdornment: <InputAdornment position="end">miles</InputAdornment> }} error={radius.trim() === '' || !Number.isFinite(Number(radius)) || Number(radius) < 0 || Number(radius) > 500} helperText="Enter a distance from 0 to 500 miles." />
    {place && <Typography variant="body2" color="text.secondary">This service will appear for events within {radius} miles of {place}.</Typography>}
  </Stack>;
}
