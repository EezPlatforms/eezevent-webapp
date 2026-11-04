"use client";
import { formatPrice } from "../lib/formatPrice";

import { useRef } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

export default function VendorMediaCarousel({ items, index, onChange, onClose, label }) {
  const touchStart = useRef(null);
  const item = items[index];
  const move = direction => onChange((index + direction + items.length) % items.length);
  return <Dialog open={Boolean(item)} onClose={onClose} maxWidth="lg" fullWidth aria-labelledby="vendor-media-title"
    onKeyDown={event => {
      if (items.length < 2) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        move(event.key === "ArrowLeft" ? -1 : 1);
      }
    }} PaperProps={{ sx: { background: "var(--eez-surface-16)", borderRadius: 3 } }}>
    {item && <>
      <DialogTitle id="vendor-media-title" sx={{ pr: 7 }}>{label}</DialogTitle>
      <IconButton aria-label="Close image viewer" onClick={onClose} sx={{ position: "absolute", right: 12, top: 12 }}><CloseRoundedIcon /></IconButton>
      <DialogContent sx={{ pt: 0 }}>
        <Box onTouchStart={event => { touchStart.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }}
          onTouchEnd={event => {
            const start = touchStart.current;
            touchStart.current = null;
            if (!start || items.length < 2) return;
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
          }} sx={{ background: "var(--eez-surface-26)", borderRadius: 2, overflow: "hidden" }}>
          {item.url ? <Box key={item.url} component="img" src={item.url} alt={item.title || item.caption || label} sx={{ display: "block", width: "100%", height: { xs: "42vh", md: "58vh" }, objectFit: "contain" }} /> : <Typography sx={{ p: 6, textAlign: "center" }}>No image available for this package.</Typography>}
        </Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ my: 2 }}>
          <Button startIcon={<ChevronLeftRoundedIcon />} onClick={() => move(-1)} disabled={items.length < 2} sx={{ color: "text.primary" }}>Previous</Button>
          <Typography role="status" aria-live="polite" variant="body2">{index + 1} / {items.length}</Typography>
          <Button endIcon={<ChevronRightRoundedIcon />} onClick={() => move(1)} disabled={items.length < 2} sx={{ color: "text.primary" }}>Next</Button>
        </Stack>
        <Box sx={{ overflowWrap: "anywhere" }}>
          <Typography component="h3" variant="h6">{item.title || item.caption || `${label} ${index + 1}`}</Typography>
          {item.package && <Typography sx={{ color: "var(--eez-ink-3)", fontWeight: 700, mt: 1 }}>{formatPrice(item.price) || "Contact vendor for pricing"}</Typography>}
          {(item.notes || item.package) && <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{item.notes?.trim() || "Package details haven’t been provided by the vendor yet."}</Typography>}
        </Box>
      </DialogContent>
    </>}
  </Dialog>;
}
