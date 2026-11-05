import { Button, Stack } from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import ShopOutlinedIcon from '@mui/icons-material/ShopOutlined';

export default function AppDownloadLinks({ color = 'primary', promptInstall = false }) {
  return <Stack direction="row" gap={1} flexWrap="wrap" sx={{flexShrink:0}}>
    <Button component="a" href="https://apps.apple.com/us/app/eezevent/id6774633058" target="_blank" rel="noopener noreferrer" aria-label="Download EezEvent on the App Store (opens in a new tab)" color={color} size="small" variant="outlined" startIcon={<AppleIcon/>}>{promptInstall ? 'Install for iPhone' : 'App Store'}</Button>
    <Button component="a" href="https://play.google.com/store/apps/details?id=com.eezevent.app" target="_blank" rel="noopener noreferrer" aria-label="Download EezEvent on Google Play (opens in a new tab)" color={color} size="small" variant="outlined" startIcon={<ShopOutlinedIcon/>}>{promptInstall ? 'Install for Android' : 'Google Play'}</Button>
  </Stack>;
}
