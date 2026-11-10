"use client";
import { useState } from 'react';
import { Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EventLocationFields, { eventLocationPayload } from './EventLocationFields';
import { updateEventLocation } from '../lib/api';

export default function EventLocationEditor({ event, onSaved }) {
  const [open,setOpen]=useState(false), [draft,setDraft]=useState(null), [busy,setBusy]=useState(false), [error,setError]=useState('');
  const current=event;
  const addressParts=[current.address_line1,current.address_line2,current.city,current.state].map(value=>String(value || '').trim());
  const address=current.venue_booking_planned===false && addressParts.some(Boolean)
    ? [...addressParts,current.zipcode].filter(Boolean).join(', ')
    : null;
  const save=async()=>{
    if(typeof draft.venue_booking_planned!=='boolean'){setError('Choose whether you already know your event venue.');return;}
    setBusy(true);setError('');
    try{onSaved(await updateEventLocation(event.event_id,eventLocationPayload(draft)));setOpen(false);}catch(e){setError(e.message);}finally{setBusy(false);}
  };
  return <Stack spacing={.5}>
    <Stack direction={{xs:"column",sm:"row"}} alignItems={{xs:"flex-start",sm:"center"}} spacing={{xs:0,sm:1}} useFlexGap flexWrap="wrap">
      <Typography variant="body2" color={address?'text.primary':'text.secondary'} sx={{overflowWrap:'anywhere',minWidth:0}}>{address || 'Event venue to be confirmed.'}</Typography>
      <Button color="secondary" size="small" startIcon={<LocationOnOutlinedIcon/>} sx={{flexShrink:0,paddingInline:0,paddingBlock:.5,minHeight:44,'& .MuiButton-startIcon':{marginLeft:0,marginRight:1},'& .MuiButton-startIcon > *':{fontSize:18}}} onClick={()=>{setDraft(eventLocationPayload(current));setError('');setOpen(true);}}>Edit event location</Button>
    </Stack>
    <Dialog fullWidth maxWidth="sm" open={open} onClose={()=>{if(!busy)setOpen(false);}} aria-labelledby={`event-location-${event.event_id}`}>
      <DialogTitle id={`event-location-${event.event_id}`}>Event location</DialogTitle>
      <DialogContent><Stack component="form" id={`location-form-${event.event_id}`} spacing={2} onSubmit={e=>{e.preventDefault();save();}} sx={{pt:1}}>
        {error && <Alert severity="error">{error}</Alert>}
        {draft && <EventLocationFields value={draft} onChange={setDraft} disabled={busy}/>}
      </Stack></DialogContent>
      <DialogActions><Button disabled={busy} onClick={()=>setOpen(false)}>Cancel</Button><Button type="submit" form={`location-form-${event.event_id}`} variant="contained" disabled={busy}>{busy?'Saving…':'Save location'}</Button></DialogActions>
    </Dialog>
  </Stack>;
}
