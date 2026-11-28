"use client";
import { Avatar, Box, Breadcrumbs, Button, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { RouterLink } from '../lib/navigation';

export const adminIconSx = {
  bgcolor: t => alpha(t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.main, .12),
  color: t => t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.main,
};
export const adminGridSx = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 };
export const adminPanelSx = { p: { xs: 2.5, md: 3.5 }, borderRadius: 3, border: 'var(--eez-border-1)', background: 'var(--eez-surface-1)', minWidth: 0 };
export function AdminHeading({ title, subtitle, backTo, backLabel = 'Business Admin', action, children }) {
  return <Stack spacing={2.5}>
    {backTo && <Breadcrumbs aria-label="Breadcrumb"><Typography component={RouterLink} to={backTo} variant="body2" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{backLabel}</Typography><Typography variant="body2" color="text.primary">{title}</Typography></Breadcrumbs>}
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2.5} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
        <Avatar variant="rounded" sx={{ width: 56, height: 56, borderRadius: 3, ...adminIconSx }}><StorefrontOutlinedIcon sx={{ fontSize: 28 }} /></Avatar>
        <Box sx={{ minWidth: 0 }}><Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '.12em', fontWeight: 700 }}>BUSINESS WORKSPACE</Typography><Typography component="h1" sx={{ fontSize: { xs: 28, md: 36 }, lineHeight: 1.2, fontWeight: 700, letterSpacing: '-.03em', overflowWrap: 'anywhere' }}>{title}</Typography></Box>
      </Stack>
      {action}
    </Stack>
    <Typography color="text.secondary">{subtitle}</Typography>
    {children}
  </Stack>;
}
export function AdminSection({ title, subtitle, icon: Icon, action, children, sx, ...props }) {
  return <Paper component="section" elevation={0} sx={{ ...adminPanelSx, ...sx }} {...props}>
    <Stack direction="row" gap={2} alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">{Icon && <Icon sx={{ color: 'text.secondary', mt: .4 }} />}<Box><Typography component="h2" variant="h6" fontWeight={700}>{title}</Typography>{subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>{subtitle}</Typography>}</Box></Stack>{action}
    </Stack>{children}
  </Paper>;
}
export function AdminSaveBar({ busy, disabled, label, cancelTo }) {
  return <Paper elevation={0} sx={{ ...adminPanelSx, p: 2, position: 'sticky', bottom: 16, zIndex: 2, boxShadow: t => `0 8px 24px ${alpha(t.palette.common.black, .08)}` }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}><Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Review your details before saving.</Typography><Stack direction="row" spacing={1} sx={{ ml: 'auto' }}><Button component={RouterLink} to={cancelTo} color="inherit" disabled={busy}>Cancel</Button><Button type="submit" variant="contained" disabled={busy || disabled}>{busy ? 'Saving…' : label}</Button></Stack></Stack>
  </Paper>;
}
