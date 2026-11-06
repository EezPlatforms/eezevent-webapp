"use client";
import GuestResponseEditor from "./GuestResponseEditor";
import InvitationDetails from "./InvitationDetails";
import { useEffect, useState } from 'react';
import { Alert, Button, Stack, Typography, Box, Dialog, DialogTitle, DialogContent, IconButton, Tabs, Tab, Chip, CircularProgress, TextField } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { getHostInvitation, uploadInvitationImage, updateInvitation, normalizeAssetUrl } from '../lib/api';

export default function EventInvitation({ eventId }) {
  const [open, setOpen] = useState(false), [tab, setTab] = useState(0);
  const [hostMessage,setHostMessage] = useState(''), [saved,setSaved] = useState(false);
  const [data, setData] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [copied, setCopied] = useState(false);
  const run = async (action) => { setBusy(true); setError(''); try { await action(); setData(await getHostInvitation(eventId)); } catch(e) { setError(e.message); } finally { setBusy(false); } };
  useEffect(() => {setHostMessage(data?.invitation?.host_message || '');},[data?.invitation?.host_message,open]);
  const show = () => { setOpen(true); setSaved(false); setTab(0); setData(null); setCopied(false); run(async () => {}); };
  const url = data?.invitation ? `${window.location.origin}/invite/${data.invitation.token}` : '';
  const message = `You're invited to ${data?.invitation?.name}! RSVP: ${url}`;
  return <>
    <Button startIcon={<MailOutlineRoundedIcon />} onClick={show} sx={{alignSelf:'flex-start'}}>Invitation & RSVPs</Button>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" scroll="paper" aria-labelledby="invitation-title" PaperProps={{sx:{borderRadius:4,...(tab===1?{height:'min(780px, calc(100dvh - 64px))'}:{})}}}>
      <DialogTitle id="invitation-title" sx={{pr:7,pt:3,pb:1}}>Invitation & RSVPs
        <IconButton aria-label="Close invitation" onClick={() => setOpen(false)} sx={{position:'absolute',right:16,top:16}}><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <Box sx={{px:3}}><Typography color="text.secondary" variant="body2">Create an invitation, share it with your guests, and keep track of who's coming.</Typography>
        <Tabs value={tab} onChange={(_,value) => setTab(value)} sx={{mt:2}} aria-label="Invitation tools"><Tab label="Invitation" id="invitation-tab-0" aria-controls="invitation-panel-0"/><Tab label={`Guest responses${data ? ` (${data.responses.length})` : ''}`} id="invitation-tab-1" aria-controls="invitation-panel-1"/></Tabs>
      </Box>
      {tab === 1 && <Box sx={{px:3,py:1.5,flexShrink:0,borderTop:'1px solid',borderColor:'divider'}}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb:1}}><Typography variant="subtitle2">RSVP overview</Typography><Button size="small" startIcon={<RefreshRoundedIcon/>} disabled={busy} onClick={() => run(async () => {})}>Refresh</Button></Stack>
        {data && <Stack direction="row" gap={1.5}>{['yes','maybe'].map(status => {
          const stats=data.summary?.[status] || {responses:0,adults:0,kids:0};
          const StatusIcon=status==='yes'?CheckCircleOutlineRoundedIcon:HelpOutlineRoundedIcon;
          return <Box key={status} sx={{flex:1,minWidth:0,p:{xs:1.5,sm:2},borderRadius:2.5,bgcolor:status==='yes'?'#dcfce7':'#fef3c7',color:status==='yes'?'#166534':'#92400e'}}>
            <Stack direction="row" gap={.75} alignItems="center"><StatusIcon fontSize="small"/><Typography fontWeight={700}>{status==='yes'?'Yes':'Maybe'}</Typography></Stack>
            <Typography sx={{fontSize:26,fontWeight:700,lineHeight:1.3,mt:.75}}>{stats.responses}<Box component="span" sx={{fontSize:12,fontWeight:500,ml:.75}}>RSVPs</Box></Typography>
            <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{mt:1}}><Stack direction="row" gap={.5} alignItems="center"><PersonOutlineRoundedIcon sx={{fontSize:17}}/><Typography variant="caption">{stats.adults} adults</Typography></Stack><Stack direction="row" gap={.5} alignItems="center"><ChildCareRoundedIcon sx={{fontSize:17}}/><Typography variant="caption">{stats.kids} kids</Typography></Stack></Stack>
          </Box>;
        })}</Stack>}
      </Box>}
      <DialogContent dividers sx={{p:3,minHeight:0,overflowY:"auto"}}>
        <Stack spacing={2.5} role="tabpanel" id={`invitation-panel-${tab}`} aria-labelledby={`invitation-tab-${tab}`}>
          {error && <Alert severity="error">{error}</Alert>}
          {busy && <Stack direction="row" spacing={1} alignItems="center" role="status"><CircularProgress size={18}/><Typography variant="body2">Updating invitation…</Typography></Stack>}
          {!data && !busy && <Button onClick={() => run(async () => {})}>Try again</Button>}
          {data && tab === 0 && <>
            <Box sx={{border:'1px dashed',borderColor:'divider',borderRadius:3,p:2.5,textAlign:'center',bgcolor:'action.hover'}}>
              {data.invitation ? <Box component="img" src={normalizeAssetUrl(data.invitation.image_url)} alt="Invitation" sx={{width:'100%',height:240,objectFit:'contain',mb:2,borderRadius:2}}/> : <MailOutlineRoundedIcon sx={{fontSize:40,color:'primary.main',mb:1}}/>}
              <Typography fontWeight={600}>{data.invitation ? 'Your invitation' : 'Start with your invitation image'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{mt:.5,mb:2}}>JPG, PNG or WebP · Up to 5 MB</Typography>
              <Button component="label" variant="contained" startIcon={<UploadRoundedIcon/>} disabled={busy}>{data.invitation ? 'Replace image' : 'Upload image'}<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const file=e.target.files?.[0]; if(file) run(() => uploadInvitationImage(eventId,file)); e.target.value=''; }}/></Button>
            </Box>
            {data.invitation && <Stack spacing={1.5}>
              <TextField label="Message from the host (optional)" multiline minRows={3} value={hostMessage} disabled={busy}
                inputProps={{maxLength:2000}} helperText={`${hostMessage.length}/2000 · Shown to everyone with your invitation link.`}
                onChange={event=>{setHostMessage(event.target.value);setSaved(false);}}/>
              <Button variant="outlined" disabled={busy || hostMessage===(data.invitation.host_message || '')} onClick={()=>run(async()=>{await updateInvitation(eventId,hostMessage);setSaved(true);})}>Save message</Button>
              {saved && <Alert severity="success">Invitation message saved.</Alert>}
            </Stack>}
            {data.invitation && <InvitationDetails invitation={data.invitation} />}
            {data.invitation && <Stack spacing={1.5}>
              <Typography fontWeight={600}>Invite your guests</Typography>
              <Typography variant="body2" color="text.secondary">Guests can RSVP from this link without creating an account.</Typography>
              <TextField label="Invitation link" value={url} fullWidth size="small" slotProps={{input:{readOnly:true}}}/>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                <Button variant="outlined" startIcon={<ContentCopyRoundedIcon/>} onClick={async () => {try {await navigator.clipboard.writeText(url);setCopied(true);} catch {setError('Copy the link shown above.');}}}>{copied ? 'Copied' : 'Copy'}</Button>
                <Button variant="outlined" href={`sms:?body=${encodeURIComponent(message)}`}>SMS</Button>
                <Button variant="outlined" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">WhatsApp</Button>
              </Stack>
            </Stack>}
          </>}
          {data && tab === 1 && <>
            {!data.responses.length && <Box sx={{textAlign:'center',py:5}}><Typography fontWeight={600}>Your guest list starts here</Typography><Typography color="text.secondary" variant="body2" sx={{mt:1}}>Share your invitation link. Responses will appear here as guests RSVP.</Typography></Box>}
            {data.responses.map(g => <Box key={g.id} sx={{p:2,border:'1px solid',borderColor:'divider',borderRadius:2}}><Stack direction="row" justifyContent="space-between" gap={1}><Typography fontWeight={600}>{g.name}</Typography><Chip size="small" label={{yes:'Yes',no:'No',maybe:'Maybe'}[g.response]} sx={{bgcolor:g.response==='yes'?'#dcfce7':g.response==='maybe'?'#fef3c7':'#f3f4f6',color:g.response==='yes'?'#166534':g.response==='maybe'?'#92400e':'#4b5563',fontWeight:600}}/></Stack>{g.response!=='no' && <Typography variant="body2" sx={{mt:1}}>{g.adults} adults · {g.kids} kids</Typography>}<Typography variant="body2" color="text.secondary" sx={{overflowWrap:'anywhere'}}>{[g.email,g.phone_display || g.phone].filter(Boolean).join(' · ')}</Typography>{g.message && <Typography variant="body2" sx={{mt:1.5,p:1.5,bgcolor:"action.hover",borderRadius:1,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{g.message}</Typography>}<GuestResponseEditor eventId={eventId} guest={g} onUpdated={async()=>setData(await getHostInvitation(eventId))}/></Box>)}
          </>}
        </Stack>
      </DialogContent>
    </Dialog>
  </>;
}
