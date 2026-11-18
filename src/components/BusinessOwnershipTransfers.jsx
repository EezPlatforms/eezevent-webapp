"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import {
  fetchBusinessTransfers, fetchOwnerProfile, fetchVendorServices,
  lookupBusinessTransferOwner, requestBusinessTransfer,
  decideBusinessTransfer, cancelBusinessTransfer,
} from "../lib/api";

export default function BusinessOwnershipTransfers() {
  const [profile, setProfile] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [selected, setSelected] = useState("");
  const [email, setEmail] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const refresh = useCallback(async () => {
    const [owner, services, invitations] = await Promise.all([
      fetchOwnerProfile(), fetchVendorServices(), fetchBusinessTransfers(),
    ]);
    setProfile(owner);
    setBusinesses([...new Map((Array.isArray(services) ? services : []).filter(s => s.business_id)
      .map(s => [s.business_id, { id: s.business_id, name: s.business_name || `Business #${s.business_id}` }])).values()]);
    setTransfers(invitations);
  }, []);
  useEffect(() => { refresh().catch(e => setMessage(e.message)); }, [refresh]);
  const run = async action => {
    setBusy(true); setMessage("");
    try { await action(); await refresh(); }
    catch (error) { setMessage(error.message || "Transfer request failed."); }
    finally { setBusy(false); }
  };
  const pending = transfers.filter(t => t.status === "pending");
  return <Card variant="outlined" sx={{ mt: 3 }}>
    <CardContent><Stack spacing={2}>
      <Typography variant="h6">Business ownership transfers</Typography>
      <Typography variant="body2" color="text.secondary">
        Transfer a business you set up for a vendor. Only a verified registered business owner can accept. The business stays yours until they accept.
      </Typography>
      {message && <Alert severity="info">{message}</Alert>}
      <TextField select SelectProps={{ native: true }} label="Business to transfer" value={selected}
        onChange={e => { setSelected(e.target.value); setRecipient(null); }}>
        <option value="">Choose a business</option>
        {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </TextField>
      <TextField label="Recipient's registered email" type="email" value={email}
        onChange={e => { setEmail(e.target.value); setRecipient(null); }} />
      <Button variant="outlined" disabled={busy || !selected || !email.trim()}
        onClick={() => run(async () => { const owner = await lookupBusinessTransferOwner(email.trim()); setRecipient(owner); })}>
        Find registered owner
      </Button>
      {recipient && <Box>
        <Typography variant="body2">Recipient: {recipient.display_name} ({recipient.email})</Typography>
        <Button variant="contained" disabled={busy} onClick={() => {
          if (!window.confirm(`Send ownership invitation to ${recipient.email}?`)) return;
          run(async () => { await requestBusinessTransfer(selected, recipient.email); setRecipient(null); setEmail(""); setMessage("Invitation created."); });
        }}>Email transfer invitation</Button>
      </Box>}
      {pending.map(t => <Box key={t.id} sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
        <Typography fontWeight={600}>{t.business_name || `Business #${t.business_id}`}</Typography>
        {t.to_owner_id === profile?.business_owner_id ? <>
          <Typography variant="body2">You've been invited to take ownership. Expires {new Date(t.expires_at).toLocaleDateString()}.</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button disabled={busy} variant="contained" onClick={() => {
              if (window.confirm("Accept ownership of this business and its services?"))
                run(() => decideBusinessTransfer(t.id, true));
            }}>Accept ownership</Button>
            <Button disabled={busy} onClick={() => run(() => decideBusinessTransfer(t.id, false))}>Decline</Button>
          </Stack>
        </> : t.from_owner_id === profile?.business_owner_id ? <>
          <Typography variant="body2">Awaiting recipient acceptance.</Typography>
          <Button disabled={busy} onClick={() => run(() => cancelBusinessTransfer(t.id))}>Cancel invitation</Button>
        </> : null}
      </Box>)}
    </Stack></CardContent>
  </Card>;
}
