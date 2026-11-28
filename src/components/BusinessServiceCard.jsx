"use client";
import { useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { normalizeAssetUrl } from '../lib/api';
import { formatPrice } from '../lib/formatPrice';
import { getServiceTypeImage } from '../lib/serviceTypeImages';
import { vendorProfilePath } from '../lib/vendorProfilePath';
import { RouterLink } from '../lib/navigation';

export default function BusinessServiceCard({ service, businessId }) {
  const mainImage = normalizeAssetUrl(service.main_image_url);
  const [failedImage, setFailedImage] = useState(null);
  const image = mainImage && failedImage !== mainImage ? mainImage : getServiceTypeImage(service.type);
  return <Card component="article" elevation={0} sx={{ border: 'var(--eez-border-1)', borderRadius: 3, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
    <Box sx={{ position: 'relative', aspectRatio: '16 / 9', bgcolor: 'action.hover', overflow: 'hidden' }}>
      <Box component="img" src={image} alt={service.name || 'Service'} loading="lazy" onError={() => setFailedImage(mainImage)} sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
    </Box>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Stack spacing={1.5} sx={{ height: '100%' }}>
        <Stack direction="row" gap={1} alignItems="center" justifyContent="space-between"><Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{service.type_name || service.type || 'Service'}</Typography><Chip size="small" variant="outlined" color={service.status === 'active' ? 'success' : 'default'} label={service.status === 'active' ? 'Active' : 'Inactive'} /></Stack>
        <Typography component="h3" variant="h6" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{service.name}</Typography>
        <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{formatPrice(service.price) || 'Contact for pricing'}</Typography>
        <Box sx={{ flex: 1 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button component={RouterLink} to={vendorProfilePath(service)} variant="outlined" fullWidth aria-label={`View public profile for ${service.name || 'service'}`}>Public view</Button>
          <Button component={RouterLink} to={`/business-admin/${businessId}/services/${service.service_id}`} variant="outlined" fullWidth>Edit service</Button>
        </Stack>
      </Stack>
    </CardContent>
  </Card>;
}
