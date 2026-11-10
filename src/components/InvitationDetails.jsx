import { Box, Stack, Typography } from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';

export default function InvitationDetails({ invitation }) {
  const start = new Date(invitation.start_time), end = new Date(invitation.end_time);
  const dateOptions = { weekday:'long', month:'long', day:'numeric', year:'numeric' };
  const timeOptions = { hour:'numeric', minute:'2-digit' };
  const sameDay = start.toDateString() === end.toDateString();
  const locations = invitation.locations || invitation.venues;
  const rows = [
    ...(invitation.host_name ? [{ Icon:PersonOutlineRoundedIcon, label:'Hosted by', text:invitation.host_name }] : []),
    { Icon:CalendarMonthRoundedIcon, label:'Save the date', text:start.toLocaleDateString(undefined,dateOptions) },
    { Icon:ScheduleRoundedIcon, label:'Time to celebrate', text:`${start.toLocaleTimeString(undefined,timeOptions)} – ${sameDay ? '' : `${end.toLocaleDateString(undefined,{month:'short',day:'numeric'})}, `}${end.toLocaleTimeString(undefined,timeOptions)}` },
    { Icon:LocationOnRoundedIcon, label:'Where we’ll gather', text: locations?.length ? locations.map(v=>[v.name,v.address || 'Address coming soon'].filter(Boolean).join(' · ')).join('\n') : `Venue TBD · Around ZIP ${invitation.zipcode || 'to be announced'}` },
  ];
  return <Stack spacing={1.5} sx={{p:2,borderRadius:3,bgcolor:'action.hover'}}>{rows.map(({Icon,label,text})=><Stack key={label} direction="row" gap={1.5} alignItems="flex-start"><Box sx={{p:1,borderRadius:2,bgcolor:'background.paper',color:theme=>theme.palette.mode==='dark'?theme.palette.common.white:theme.palette.primary.main,display:'flex'}}><Icon fontSize="small"/></Box><Box><Typography variant="overline" color="text.secondary" sx={{lineHeight:1.5}}>{label}</Typography><Typography variant="body2" fontWeight={600} sx={{whiteSpace:'pre-line'}}>{text}</Typography></Box></Stack>)}</Stack>;
}
