"use client";
import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack, TextField, Typography } from '@mui/material';
import { uploadAdminServiceImage } from '../lib/api';
import { uploadGalleryBatch, validateGalleryImage } from '../lib/galleryUploads';

function PendingPhoto({ entry, disabled, onChange, onRemove }) {
  const [url, setUrl] = useState('');
  useEffect(() => { const next = URL.createObjectURL(entry.file); setUrl(next); return () => URL.revokeObjectURL(next); }, [entry.file]);
  return <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      {url && <Box component="img" src={url} alt={entry.file.name} sx={{ width: { xs: '100%', sm: 120 }, height: 100, objectFit: 'cover', borderRadius: 1 }} />}
      <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{entry.file.name}</Typography>
        <TextField size="small" label="Caption (optional)" value={entry.caption} disabled={disabled} onChange={e => onChange(e.target.value)} />
        {entry.error && <Alert severity="error">{entry.error}</Alert>}
        <Button size="small" color="error" disabled={disabled} onClick={onRemove} sx={{ alignSelf: 'flex-start' }}>Remove</Button>
      </Stack>
    </Stack>
  </Box>;
}
export default function GalleryUploadDialog({ serviceId, onClose, onUploaded, onBusyChange }) {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const lock = useRef(false);
  const nextId = useRef(0);
  const upload = async () => {
    if (lock.current || !entries.length) return;
    lock.current = true; setBusy(true); onBusyChange(true); setError('');
    try {
      const result = await uploadGalleryBatch(entries, (file, caption) => uploadAdminServiceImage(serviceId, file, { caption }), (current, total) => setProgress({ current, total }));
      setEntries(result.failed);
      if (result.failed.length) setError(`${result.uploaded} uploaded. ${result.failed.length} failed. Retry uploads only retries the remaining photos.`);
      if (result.uploaded) await onUploaded(result.uploaded);
      if (!result.failed.length) onClose();
    } catch (err) { setError(err.message || 'Unable to refresh the gallery. Close and reopen Images to reload.'); }
    finally { lock.current = false; setBusy(false); setProgress(null); onBusyChange(false); }
  };
  return <Dialog open onClose={() => { if (!busy) onClose(); }} fullWidth maxWidth="sm">
    <DialogTitle>Add gallery photos</DialogTitle>
    <DialogContent dividers><Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">Select multiple JPG, PNG, or WebP images. Each image must be 5 MB or smaller.</Typography>
      {error && <Alert severity="warning">{error}</Alert>}
      <Button component="label" variant="outlined" disabled={busy}>Choose photos<input type="file" hidden multiple accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => {
        const files = Array.from(e.target.files || []); e.target.value = '';
        const valid = []; const errors = [];
        for (const file of files) {
          try { validateGalleryImage(file); valid.push({ id: nextId.current++, file, caption: '' }); }
          catch (err) { errors.push(`${file.name}: ${err.message}`); }
        }
        setEntries(current => [...current, ...valid]); setError(errors.join(' '));
      }} /></Button>
      {entries.length > 0 && <Typography variant="body2">{entries.length} photo{entries.length === 1 ? '' : 's'} ready to upload</Typography>}
      {entries.map(entry => <PendingPhoto key={entry.id} entry={entry} disabled={busy} onChange={caption => setEntries(current => current.map(item => item.id === entry.id ? { ...item, caption } : item))} onRemove={() => setEntries(current => current.filter(item => item.id !== entry.id))} />)}
      {progress && <Stack spacing={1} role="status"><Typography variant="body2">Uploading photo {progress.current} of {progress.total}…</Typography><LinearProgress /></Stack>}
    </Stack></DialogContent>
    <DialogActions><Button disabled={busy} onClick={onClose}>Close</Button><Button variant="contained" disabled={busy || !entries.length} onClick={upload}>{busy ? 'Uploading…' : entries.some(entry => entry.error) ? 'Retry uploads' : `Upload${entries.length ? ` ${entries.length}` : ''} photos`}</Button></DialogActions>
  </Dialog>;
}
