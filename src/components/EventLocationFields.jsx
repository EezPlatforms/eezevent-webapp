"use client";
import { Stack, TextField, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

export const eventLocationPayload = event => Object.fromEntries(['venue_booking_planned','address_line1','address_line2','city','state','zipcode'].map(key=>[key,key==='venue_booking_planned'?(event[key] ?? null):(event[key] || '')]));

export default function EventLocationFields({ value, onChange, disabled=false }) {
  const update=(key,next)=>onChange({...value,[key]:next});
  return <Stack spacing={2}>
    <Typography fontWeight={600}>Do you already have a venue in mind?</Typography>
    <ToggleButtonGroup exclusive fullWidth value={value.venue_booking_planned == null ? null : String(value.venue_booking_planned)} disabled={disabled} aria-label="Do you already have a venue in mind?" onChange={(_,next)=>{if(next!==null)update('venue_booking_planned',next==='true');}}>
      <ToggleButton value="false">Yes</ToggleButton><ToggleButton value="true">No</ToggleButton>
    </ToggleButtonGroup>
    {value.venue_booking_planned===true && <Typography variant="body2" color="text.secondary">Let EezEvent help you discover venues and other event services near your preferred ZIP code, all in one place.</Typography>}
    {value.venue_booking_planned===false && <>
      <Typography variant="body2" color="text.secondary">Where will your event take place? You can update this address anytime.</Typography>
      {[['address_line1','Street address',255],['address_line2','Apartment, suite, or unit (optional)',255],['city','City',100],['state','State',100]].map(([key,label,maxLength])=><TextField key={key} label={label} required={key!=='address_line2'} fullWidth disabled={disabled} value={value[key] || ''} inputProps={{maxLength}} onChange={e=>update(key,e.target.value)}/>)}
    </>}
    <TextField label={value.venue_booking_planned===true?'Event area ZIP code':'ZIP code'} required={typeof value.venue_booking_planned==='boolean'} fullWidth disabled={disabled} value={value.zipcode || ''} inputProps={{maxLength:20}} onChange={e=>update('zipcode',e.target.value)}/>
  </Stack>;
}
