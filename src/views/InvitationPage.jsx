"use client";
import BrandIdentity from '../components/BrandIdentity';
import AppDownloadLinks from '../components/AppDownloadLinks';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import RSVPPhoneField from "../components/RSVPPhoneField";
import InvitationDetails from "../components/InvitationDetails";
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../lib/auth';
import { RouterLink, useNavigate } from '../lib/navigation';
import { alpha } from '@mui/material/styles';
import { Alert, AlertTitle, Box, Button, Container, ToggleButton, ToggleButtonGroup, Paper, Stack, TextField, Typography } from '@mui/material';
import { getPublicInvitation, submitInvitationRSVP, getMyInvitationResponse, updateMyInvitationResponse, normalizeAssetUrl } from '../lib/api';
export default function InvitationPage({ token }) {
  const { auth, authReady, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [myResponse, setMyResponse] = useState(null);
  const [checkingResponse, setCheckingResponse] = useState(true);
  const [lookupError, setLookupError] = useState('');
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const returnPath = `/invite/${encodeURIComponent(token)}`;
  const loginPath = `/login?next=${encodeURIComponent(returnPath)}`;
  const registerPath = `/register?next=${encodeURIComponent(returnPath)}`;
  const [invitation,setInvitation]=useState(null), [error,setError]=useState(''), [message,setMessage]=useState(''), [busy,setBusy]=useState(false);
  const feedbackRef = useRef(null);
  const [submitError, setSubmitError] = useState('');
  const [feedbackAttempt, setFeedbackAttempt] = useState(0);
  const [savedResponse, setSavedResponse] = useState(null);
  const showFeedback = (severity, text) => {
    setSubmitError(severity === 'error' ? text : '');
    setMessage(severity === 'success' ? text : '');
    setFeedbackAttempt(attempt => attempt + 1);
  };
  useEffect(() => {
    if (!feedbackAttempt || busy || checkingResponse || !feedbackRef.current) return;
    feedbackRef.current.focus({ preventScroll: true });
    feedbackRef.current.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, [feedbackAttempt, busy, checkingResponse]);
  useEffect(() => {
    if (!lookupError || checkingResponse || !feedbackRef.current) return;
    feedbackRef.current.focus({ preventScroll: true });
    feedbackRef.current.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, [lookupError, checkingResponse]);
  const feedbackSx = { scrollMarginBlock: 24, overflowWrap: 'anywhere', '&:focus-visible': { outline: '2px solid', outlineColor: 'text.primary', outlineOffset: 3 } };
  const [form,setForm]=useState({name:'',email:'',phone:'',response:'yes',adults:1,kids:0,message:''});
  useEffect(() => {
    let active = true;
    setInvitation(null); setError(''); setMessage(''); setSubmitError(''); setSavedResponse(null);
    getPublicInvitation(token).then(data => { if (active) setInvitation(data); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [token]);
  useEffect(() => {
    let active = true;
    setMyResponse(null); setMessage(''); setSubmitError(''); setSavedResponse(null); setLookupError('');
    setForm({name:'',email:'',phone:'',response:'yes',adults:1,kids:0,message:''});
    if (!authReady) return;
    if (!isAuthenticated) { setCheckingResponse(false); return; }
    setCheckingResponse(true);
    getMyInvitationResponse(token).then(data => {
      if (!active) return;
      setMyResponse(data.response);
      setForm(data.response ? {...data.response, phone:data.response.phone || ''} : {name:data.name || '',email:data.email || '',phone:'',response:'yes',adults:1,kids:0,message:''});
    }).catch(async e => {
      if (!active) return;
      if (e.status === 401) { await logout(); return; }
      setLookupError(e.message);
    })
      .finally(() => { if (active) setCheckingResponse(false); });
    return () => { active = false; };
  }, [token, authReady, isAuthenticated, auth?.token, lookupAttempt, logout]);
  const switchAccount = async () => { await logout(); navigate(loginPath); };
  const submit = async e => {
    e.preventDefault();
    if (!myResponse && !form.email.trim() && !form.phone.trim()) { showFeedback('error', 'Provide an email address or phone number.'); return; }
    setBusy(true); setSubmitError(''); setMessage('');
    try {
      const attendance = {response:form.response,adults:form.response==='no'?0:Number(form.adults),kids:form.response==='no'?0:Number(form.kids),message:form.message};
      const result = myResponse
        ? await updateMyInvitationResponse(token, {...attendance,name:form.name,phone:form.phone})
        : await submitInvitationRSVP(token, {...form,...attendance});
      setSavedResponse(attendance);
      showFeedback('success', result.message);
      if (result.response) { setMyResponse(result.response); setForm({...result.response,phone:result.response.phone || ''}); }
      else if (isAuthenticated) {
        // Keep the saved confirmation visible while refreshing the private response.
        try {
          const data = await getMyInvitationResponse(token);
          if (data.response) { setMyResponse(data.response); setForm({...data.response,phone:data.response.phone || ''}); }
        } catch { /* RSVP was saved; a failed refresh must not replace its confirmation. */ }
      }
    } catch (e) { showFeedback('error', e.message); }
    finally { setBusy(false); }
  };
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
      {invitation.host_message && <Box sx={{p:2.5,borderRadius:2,bgcolor:'action.hover',borderLeft:'3px solid',borderColor:theme=>theme.palette.mode==='dark'?theme.palette.primary.light:theme.palette.primary.main}}>
        <Typography variant="subtitle2" color="text.primary" sx={{mb:1,overflowWrap:'anywhere'}}>A message from {invitation.host_name || 'your host'}</Typography>
        <Typography sx={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{invitation.host_message}</Typography>
      </Box>}
      {!isAuthenticated && authReady && <Alert severity="info">
        Already responded? Log in or create an account with the email used for your RSVP to view or edit it. For phone-only responses, contact the host.
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{mt:1}}><Button component={RouterLink} to={loginPath} color="secondary">Log in</Button><Button component={RouterLink} to={registerPath} color="secondary">Create an account</Button></Stack>
      </Alert>}
      {message && !myResponse ? <Alert ref={feedbackRef} severity="success" role="status" tabIndex={-1} sx={feedbackSx}>
        <AlertTitle>RSVP saved</AlertTitle>
        <Typography variant="body2">{message}</Typography>
        {savedResponse && <Typography variant="body2" sx={{mt:1,fontWeight:600}}>Your response: {savedResponse.response === 'yes' ? 'Yes' : savedResponse.response === 'no' ? 'No' : 'Maybe'} · {savedResponse.adults} adults · {savedResponse.kids} kids</Typography>}
      </Alert> : !authReady || checkingResponse ? <Typography role="status">Checking your RSVP…</Typography> : lookupError ? <Alert ref={feedbackRef} severity="warning" role="alert" tabIndex={-1} sx={feedbackSx}>{lookupError}<Stack direction="row" gap={1} flexWrap="wrap"><Button color="secondary" onClick={()=>setLookupAttempt(attempt=>attempt+1)}>Try again</Button><Button onClick={switchAccount} color="secondary">Log in with another account</Button></Stack></Alert> : <Stack component="form" onSubmit={submit}><Stack component="fieldset" disabled={busy} onChange={()=>{setSubmitError('');setMessage('');}} spacing={2.5} useFlexGap sx={{border:0,p:0,m:0,minWidth:0}}>
        <Typography variant="h5">{myResponse ? 'Your RSVP' : 'Will you attend?'}</Typography>
        {myResponse && <Typography color="text.secondary">Your saved response is {myResponse.response === 'yes' ? 'Yes' : myResponse.response === 'no' ? 'No' : 'Maybe'} · {myResponse.adults} adults · {myResponse.kids} kids. Update it below.</Typography>}
        {isAuthenticated && !myResponse && <Typography variant="body2" color="text.secondary">No RSVP matches your account email. If you responded with another email, log in with that account. For a phone-only response, contact the host. <Button color="secondary" size="small" disabled={busy} onClick={switchAccount}>Use another account</Button></Typography>}
        <Typography variant="body2" color="text.secondary">Provide an email address or phone number. If you include an email, we’ll send your RSVP confirmation and venue updates.</Typography>
        {['name','email'].map(field=><TextField key={field} label={field==='email'?'Email address (optional)':'Your name'} type={field==='email'?'email':'text'} required={field==='name'} disabled={busy || (field==='email' && Boolean(myResponse))} value={form[field]} inputProps={{maxLength:field==='name'?150:254}} onChange={e=>setForm(current=>({...current,[field]:e.target.value}))} />)}
        <RSVPPhoneField value={form.phone} onChange={phone=>setForm(current=>({...current,phone}))}/>
        <ToggleButtonGroup
          exclusive fullWidth value={form.response} disabled={busy} aria-label="RSVP response"
          onChange={(_,response)=>{if(response){setForm(current=>({...current,response}));setMessage('');setSubmitError('');}}}
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
        <Typography variant="body2">Your contact details and response will be shared with the host. You can edit your response here when signed in with the same verified email.</Typography>
        {submitError && <Alert ref={feedbackRef} severity="error" role="alert" tabIndex={-1} sx={feedbackSx}><AlertTitle>RSVP not saved</AlertTitle>{submitError}</Alert>}
        {message && myResponse && <Alert ref={feedbackRef} severity="success" role="status" tabIndex={-1} sx={feedbackSx}><AlertTitle>Changes saved</AlertTitle>{message}</Alert>}
        <Button type="submit" variant="contained" disabled={busy}>{busy?'Saving…':myResponse?'Save RSVP changes':'Send RSVP'}</Button>
      </Stack></Stack>}
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
