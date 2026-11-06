"use client";
import Link from 'next/link';
import { Box, Stack, Typography } from '@mui/material';
import logo from '../../assets/eezevent-just-logo.png';

export function BrandLogo() {
  return <Box component="img" src={logo.src} alt="EezEvent logo" sx={{
    width:52,height:52,flexShrink:0,borderRadius:0.5,p:0.2,objectFit:'contain',
    backgroundColor:'var(--eez-surface-2)',border:'var(--eez-border-13)',
  }}/>;
}

export const BRAND_TAGLINE = 'More organized. Less chaos.';

export default function BrandIdentity() {
  return <Stack component={Link} href="/" aria-label="EezEvent home" direction="row" spacing={1.5} alignItems="center" sx={{
    textDecoration:'none',borderRadius:1,
    '&:focus-visible':{outline:'3px solid',outlineColor:'primary.main',outlineOffset:4},
  }}>
    <BrandLogo/>
    <Box>
      <Typography component="span" sx={{
        display:'block',fontFamily:theme=>theme.typography.fontFamily,fontSize:24,fontWeight:700,
        lineHeight:1,letterSpacing:'-0.02em',
        color:theme=>theme.palette.mode==='light'?theme.palette.primary.main:theme.palette.primary.light,
      }}>EezEvent</Typography>
      {<Typography variant="body2" color="text.secondary" sx={{fontSize:12,mt:.5,whiteSpace:'nowrap'}}>{BRAND_TAGLINE}</Typography>}
    </Box>
  </Stack>;
}
