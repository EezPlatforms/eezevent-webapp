"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { AdminSection } from './BusinessAdminLayout';
import { fetchAdminService, normalizeAssetUrl, fetchServiceImages, fetchServiceCatalogItems, uploadAdminServiceImage, setAdminServiceMainImage, deleteAdminServiceImage, saveAdminCatalogItem, deleteAdminCatalogItem, orderAdminCatalogItems } from '../lib/api';
import GalleryUploadDialog from './GalleryUploadDialog';
import { formatPrice } from '../lib/formatPrice';

const gridSx = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 };
const emptyDraft = { file: null, title: '', price: '', notes: '', caption: '' };
const validateFile = file => {
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Use a JPG, PNG, or WebP image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Images must be 5 MB or smaller.');
};
function MediaPreview({ url, title, large = false }) {
  const [failedUrl, setFailedUrl] = useState(null);
  return <Box sx={{ aspectRatio: large ? '16 / 7' : '4 / 3', maxHeight: large ? 320 : undefined, bgcolor: 'action.hover', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
    {url && failedUrl !== url ? <Box component="img" src={url} alt={title || 'Service image'} loading="lazy" onError={() => setFailedUrl(url)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />}
  </Box>;
}
export default function ServiceMediaManager({ serviceId, catalog = false, onBusyChange }) {
  const [items, setItems] = useState([]);
  const [main, setMain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [preview, setPreview] = useState('');
  const load = useCallback(async () => {
    if (catalog) return { items: await fetchServiceCatalogItems(serviceId), main: null };
    const [items, service] = await Promise.all([fetchServiceImages(serviceId), fetchAdminService(serviceId)]);
    return { items, main: service.main_image_url ? {
      id: service.main_image_id, url: normalizeAssetUrl(service.main_image_url), is_main: true,
    } : null };
  }, [catalog, serviceId]);
  const refresh = useCallback(async () => {
    const data = await load(); setItems(data.items); setMain(data.main);
  }, [load]);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    load().then(data => { if (active) { setItems(data.items); setMain(data.main); } })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load]);
  useEffect(() => {
    if (!draft.file) { setPreview(''); return; }
    const url = URL.createObjectURL(draft.file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [draft.file]);
  const run = async (action, success) => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); onBusyChange?.(true); setError(''); setMessage('');
    try { await action(); await refresh(); setMessage(success); }
    catch (e) { setError(e.message || 'Unable to save media. Please try again.'); }
    finally { busyRef.current = false; setBusy(false); onBusyChange?.(false); }
  };
  const open = (mode, item = null) => {
    setError(''); setEditor({ mode, item });
    setDraft({ ...emptyDraft, title: item?.title || '', price: item?.price || '', notes: item?.notes || '' });
  };
  const save = () => run(async () => {
    validateFile(draft.file);
    if (!editor.item && !draft.file) throw new Error('Choose an image to upload.');
    if (catalog) await saveAdminCatalogItem(serviceId, editor.item?.id, draft);
    else await uploadAdminServiceImage(serviceId, draft.file, { main: editor.mode === 'main', caption: draft.caption });
    setEditor(null); setDraft(emptyDraft);
  }, catalog ? 'Catalog item saved.' : 'Image saved.');
  const remove = item => {
    if (!window.confirm(catalog ? 'Delete this catalog item?' : 'Delete this service image?')) return;
    run(() => catalog ? deleteAdminCatalogItem(serviceId, item.id) : deleteAdminServiceImage(serviceId, item.id), catalog ? 'Catalog item deleted.' : 'Image deleted.');
  };
  const move = (index, delta) => {
    const next = [...items];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    run(() => orderAdminCatalogItems(serviceId, next.map(item => item.id)), 'Catalog order updated.');
  };
  const gallery = items;
  const card = (item, index) => <Card key={item.id} component="article" elevation={0} sx={{ border: 'var(--eez-border-1)', borderRadius: 3, minWidth: 0 }}>
    <MediaPreview url={item.url} title={catalog ? item.title : item.caption} />
    <CardContent><Stack spacing={1.5}>
      <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{catalog ? item.title || 'Untitled item' : item.caption || 'Service photo'}</Typography>
      {catalog && <><Typography>{formatPrice(item.price)}</Typography>{item.notes && <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{item.notes}</Typography>}</>}
      <Stack direction="row" gap={1} flexWrap="wrap">
        {catalog ? <Button disabled={busy} onClick={() => open('catalog', item)}>Edit item</Button> : <Button disabled={busy} onClick={() => run(() => setAdminServiceMainImage(serviceId, item.id), 'Main image updated.')}>Use as main</Button>}
        <Button color="error" disabled={busy} onClick={() => remove(item)}>Delete</Button>
      </Stack>
      {catalog && <Stack direction="row" spacing={1}><Button size="small" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label={`Move ${item.title || 'item'} earlier`}>Move earlier</Button><Button size="small" disabled={busy || index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${item.title || 'item'} later`}>Move later</Button></Stack>}
    </Stack></CardContent>
  </Card>;
  return <Stack spacing={3}>
    <Typography variant="body2" color="text.secondary">Uploads and media changes save immediately. JPG, PNG, or WebP · Up to 5 MB per image.</Typography>
    {!editor && error && <Alert severity="error" action={<Button disabled={busy} onClick={() => run(refresh, 'Media refreshed.')}>Retry</Button>}>{error}</Alert>}
    {message && <Alert severity="success">{message}</Alert>}
    {loading ? <CircularProgress aria-label="Loading service media" /> : catalog ? <AdminSection title="Catalog" subtitle="Showcase your offerings with photos, prices, and notes." action={<Button disabled={busy} variant="outlined" onClick={() => open('catalog')}>Add item</Button>}>
      {items.length ? <Box sx={gridSx}>{items.map(card)}</Box> : <Typography color="text.secondary">No catalog items yet. Add an image and details to showcase your first offering.</Typography>}
    </AdminSection> : <>
      <AdminSection title="Main image" subtitle="The photo shown on your service card and public profile." action={<Button disabled={busy} variant="outlined" onClick={() => open('main')}>{main ? 'Replace image' : 'Upload image'}</Button>}>
        {main ? <Box sx={{ maxWidth: 680, borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}><MediaPreview url={main.url} title={main.caption || 'Main service image'} large /><Stack direction="row" gap={2} alignItems="center" justifyContent="space-between" sx={{ p: 2 }}><Chip size="small" label="Main image" /><Button color="error" disabled={busy} onClick={() => remove(main)}>Delete image</Button></Stack></Box> : <Typography color="text.secondary">Upload a main image to help clients recognize your service.</Typography>}
      </AdminSection>
      <AdminSection title="Gallery" subtitle="Add portfolio photos so clients can explore your work." action={<Button disabled={busy} variant="outlined" onClick={() => open('gallery')}>Add photos</Button>}>
        {gallery.length ? <Box sx={gridSx}>{gallery.map(card)}</Box> : <Typography color="text.secondary">No gallery photos yet.</Typography>}
      </AdminSection>
    </>}
    {editor?.mode === 'gallery' && <GalleryUploadDialog serviceId={serviceId} onClose={() => setEditor(null)} onBusyChange={value => { setBusy(value); onBusyChange?.(value); }} onUploaded={async count => { await refresh(); setMessage(`${count} gallery photo${count === 1 ? '' : 's'} uploaded.`); }} />}
    <Dialog open={Boolean(editor) && editor.mode !== 'gallery'} onClose={() => { if (!busy) setEditor(null); }} fullWidth maxWidth="sm">
      <DialogTitle>{catalog ? editor?.item ? 'Edit catalog item' : 'Add catalog item' : editor?.mode === 'main' ? 'Upload main image' : 'Add gallery photo'}</DialogTitle>
      <DialogContent dividers><Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}
        {(preview || editor?.item?.url) && <MediaPreview url={preview || editor.item.url} title="Image preview" />}
        <Button component="label" variant="outlined" disabled={busy}>{draft.file ? 'Choose a different image' : editor?.item ? 'Replace image (optional)' : 'Choose image'}<input hidden type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => {
          const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
          try { validateFile(file); setError(''); setDraft(d => ({ ...d, file })); } catch (err) { setError(err.message); }
        }} /></Button>
        {draft.file && <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{draft.file.name}</Typography>}
        {catalog ? ['title', 'price', 'notes'].map(key => <TextField key={key} label={key === 'title' ? 'Title' : key === 'price' ? 'Price' : 'Notes'} value={draft[key]} disabled={busy} multiline={key === 'notes'} minRows={key === 'notes' ? 3 : undefined} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} />) : <TextField label="Caption (optional)" value={draft.caption} disabled={busy} onChange={e => setDraft(d => ({ ...d, caption: e.target.value }))} />}
      </Stack></DialogContent>
      <DialogActions><Button disabled={busy} onClick={() => setEditor(null)}>Cancel</Button><Button variant="contained" disabled={busy || (!editor?.item && !draft.file)} onClick={save}>{busy ? 'Saving…' : 'Save'}</Button></DialogActions>
    </Dialog>
  </Stack>;
}
