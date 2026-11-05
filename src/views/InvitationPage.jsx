"use client";
import BrandIdentity from '../components/BrandIdentity';
import AppDownloadLinks from '../components/AppDownloadLinks';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import RSVPPhoneField from "../components/RSVPPhoneField";
import InvitationDetails from "../components/InvitationDetails";
import { useEffect, useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Alert, Box, Button, Container, ToggleButton, ToggleButtonGroup, Paper, Stack, TextField, Typography } from '@mui/material';
import { getPublicInvitation, submitInvitationRSVP, normalizeAssetUrl } from '../lib/api';
export default function InvitationPage({ token }) {
  const [invitation,setInvitation]=useState(null), [error,setError]=useState(''), [message,setMessage]=useState(''), [busy,setBusy]=useState(false);
  const [form,setForm]=useState({name:'',email:'',phone:'',response:'yes',adults:1,kids:0,message:''});
  useEffect(() => { getPublicInvitation(token).then(setInvitation).catch(e=>setError(e.message)); },[token]);
  const submit=async e=>{e.preventDefault();if(!form.email.trim() && !form.phone.trim()){setError('Provide an email address or phone number.');return;}setBusy(true);setError('');try{const result=await submitInvitationRSVP(token,{...form,adults:form.response==='no'?0:Number(form.adults),kids:form.response==='no'?0:Number(form.kids)});setMessage(result.message);}catch(e){setError(e.message);}finally{setBusy(false);}};
  return <Container maxWidth="sm" sx={{py:{xs:2.5,sm:4}}}>
    <Stack component="header" direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{mb:2.5}}>
      <BrandIdentity />
    </Stack>
    <Paper sx={{p:{xs:2.5,sm:3},borderRadius:3}}><Stack spacing={2}>
    {error && <Alert severity="error">{error}</Alert>}
    {!invitation && !error && <Typography>Loading invitation…</Typography>}
    {invitation && <><Typography variant="h4" component="h1">{invitation.name}</Typography>
      <InvitationDetails invitation={invitation} />
      <Box component="img" src={normalizeAssetUrl(invitation.image_url)} alt={`Invitation to ${invitation.name}`} sx={{width:'100%',height:{xs:260,sm:320},objectFit:'contain',borderRadius:3,bgcolor:'action.hover'}} />
      {message ? <Alert severity="success">{message}</Alert> : <Stack component="form" spacing={2} onSubmit={submit}>
        <Typography variant="h5">Will you attend?</Typography>
        <Typography variant="body2" color="text.secondary">Provide an email address or phone number. You can include both.</Typography>
        {['name','email'].map(field=><TextField key={field} label={field==='email'?'Email address':'Your name'} type={field==='email'?'email':'text'} required={field==='name'} value={form[field]} inputProps={{maxLength:field==='name'?150:254}} onChange={e=>setForm(current=>({...current,[field]:e.target.value}))} />)}
        <RSVPPhoneField value={form.phone} onChange={phone=>setForm(current=>({...current,phone}))}/>
        <ToggleButtonGroup
          exclusive fullWidth value={form.response} disabled={busy} aria-label="RSVP response"
          onChange={(_,response)=>{if(response)setForm(current=>({...current,response}));}}
          sx={{gap:1,'& .MuiToggleButtonGroup-grouped':{border:'1px solid',borderRadius:'10px !important'}}}
        >
          {[['yes','Yes','success'],['no','No',null],['maybe','Maybe','warning']].map(([value,label,tone])=><ToggleButton
            key={value} value={value} type="button"
            sx={theme=>{
              const color=tone?theme.palette[tone].main:theme.palette.text.secondary;
              return {minHeight:48,textTransform:'none',fontSize:16,fontWeight:700,color,borderColor:alpha(color,.45),
                '&.Mui-selected':{color,bgcolor:alpha(color,.14),borderColor:color,boxShadow:`inset 0 0 0 1px ${color}`},
                '&.Mui-selected:hover':{bgcolor:alpha(color,.2)},'&:hover':{bgcolor:alpha(color,.08)},
              };
            }}
          >{label}</ToggleButton>)}
        </ToggleButtonGroup>
        {form.response!=='no' && ['adults','kids'].map(field=><TextField key={field} label={field==='adults'?'Adults attending':'Kids attending'} type="number" required inputProps={{min:0,max:100,step:1}} value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} />)}
        <TextField label="Message to the host (optional)" multiline minRows={3} value={form.message} inputProps={{maxLength:1000}} helperText={`${form.message.length}/1000 characters`} onChange={e=>setForm({...form,message:e.target.value})}/>
        <Typography variant="body2">Your contact details and response will be shared with the host. Contact the host to change your RSVP.</Typography>
        <Button type="submit" variant="contained" disabled={busy}>{busy?'Sending…':'Send RSVP'}</Button>
      </Stack>}
    </>}
  </Stack></Paper>
    <Paper component="aside" aria-label="Get the EezEvent app" variant="outlined" sx={{mt:2.5,p:2.5,borderRadius:3,bgcolor:'background.paper'}}>
      <Stack spacing={1.5}>
        <Stack direction="row" gap={1} alignItems="center"><AutoAwesomeRoundedIcon color="primary" fontSize="small"/><Typography fontWeight={700}>Plan your next event with EezEvent</Typography></Stack>
        <Typography variant="body2" color="text.secondary">Hosting an event? Install EezEvent to find vendors, coordinate plans, and manage invitations—all free for hosts. Get started below.</Typography>
        <AppDownloadLinks promptInstall/>
        <Typography variant="caption" color="text.secondary">RSVP right here — no app download required.</Typography>
      </Stack>
    </Paper>
    <Typography component="footer" variant="caption" color="text.secondary" sx={{display:'block',textAlign:'center',mt:2}}>Invitations powered by EezEvent</Typography>
  </Container>;
}
