"use client";
import { useState } from 'react';
import { Alert, Button, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { updateGuestResponse } from '../lib/api';

export default function GuestResponseEditor({ eventId, guest, onUpdated }) {
  const [editing,setEditing]=useState(false), [draft,setDraft]=useState(null), [busy,setBusy]=useState(false), [error,setError]=useState('');
  const start=()=>{setDraft({response:guest.response,adults:String(guest.adults),kids:String(guest.kids)});setError('');setEditing(true);};
  const save=async()=>{
    const adults=draft.response==='no'?0:Number(draft.adults), kids=draft.response==='no'?0:Number(draft.kids);
    if (![adults,kids].every(n=>Number.isInteger(n)&&n>=0&&n<=100) || (draft.response!=='no' && (!draft.adults.trim()||!draft.kids.trim()||adults+kids===0))) {setError('Enter whole numbers from 0 to 100, with at least one attendee for Yes or Maybe.');return;}
    setBusy(true);setError('');
    try {await updateGuestResponse(eventId,guest.id,{response:draft.response,adults,kids});await onUpdated();setEditing(false);}catch(e){setError(e.message);}finally{setBusy(false);}
  };
  if(!editing)return <Button size="small" startIcon={<EditOutlinedIcon/>} onClick={start} sx={{mt:1}}>Edit response</Button>;
  return <Stack spacing={1.5} sx={{mt:2,p:1.5,borderRadius:2,bgcolor:'action.hover'}}>
    <Typography variant="subtitle2">Update {guest.name}’s RSVP</Typography>
    {error && <Alert severity="error">{error}</Alert>}
    <ToggleButtonGroup exclusive fullWidth value={draft.response} disabled={busy} aria-label={`Response for ${guest.name}`} onChange={(_,response)=>{if(response)setDraft({...draft,response});}}>
      {[['yes','Yes','success'],['no','No','standard'],['maybe','Maybe','warning']].map(([value,label,color])=><ToggleButton key={value} value={value} color={color} sx={{textTransform:'none'}}>{label}</ToggleButton>)}
    </ToggleButtonGroup>
    {draft.response!=='no' && <Stack direction="row" spacing={1}>{['adults','kids'].map(field=><TextField key={field} label={field==='adults'?'Adults':'Kids'} type="number" size="small" fullWidth disabled={busy} value={draft[field]} inputProps={{min:0,max:100,step:1}} onChange={e=>setDraft({...draft,[field]:e.target.value})}/>)}</Stack>}
    {draft.response==='no' && <Typography variant="caption" color="text.secondary">Attendee counts will be cleared.</Typography>}
    <Stack direction="row" spacing={1}><Button variant="contained" disabled={busy} onClick={save}>{busy?'Saving…':'Save response'}</Button><Button disabled={busy} onClick={()=>setEditing(false)}>Cancel</Button></Stack>
  </Stack>;
}
