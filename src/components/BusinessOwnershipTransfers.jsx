"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { AdminSection, adminGridSx } from "./BusinessAdminLayout";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  fetchBusinessTransfers, fetchOwnerProfile, fetchOwnedBusinesses,
  lookupBusinessTransferOwner, requestBusinessTransfer,
  decideBusinessTransfer, cancelBusinessTransfer,
} from "../lib/api";

export default function BusinessOwnershipTransfers({ showInvitationForm = true, onChanged }) {
  const [profile, setProfile] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [selected, setSelected] = useState("");
  const [email, setEmail] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const refresh = useCallback(async () => {
    const [owner, ownedBusinesses, invitations] = await Promise.all([
      fetchOwnerProfile(), fetchOwnedBusinesses(), fetchBusinessTransfers(),
    ]);
    setProfile(owner);
    setBusinesses((Array.isArray(ownedBusinesses) ? ownedBusinesses : []).map(b => ({ id: b.business_id, name: b.business_name || `Business #${b.business_id}` })));
    setTransfers(invitations);
  }, []);
  useEffect(() => { refresh().catch(e => setMessage(e.message)); }, [refresh]);
  const run = async action => {
    setBusy(true); setMessage("");
    try { await action(); await refresh(); await onChanged?.(); }
    catch (error) { setMessage(error.message || "Transfer request failed."); }
    finally { setBusy(false); }
  };
  const pending = transfers.filter(t => t.status === "pending" && new Date(t.expires_at).getTime() > Date.now());
  if (!showInvitationForm && !pending.length) return null;
  return <AdminSection title="Business ownership transfers" icon={SwapHorizRoundedIcon} subtitle="Accept or decline businesses offered to you, or cancel invitations you sent. Ownership changes only when the recipient accepts.">
    <Stack spacing={3}>
      {message && <Alert severity="info">{message}</Alert>}
      {showInvitationForm && <Box sx={{ ...adminGridSx, p: { xs: 2, sm: 3 }, bgcolor: "action.hover", borderRadius: 2 }}>
      <TextField fullWidth select SelectProps={{ native: true }} slotProps={{ inputLabel: { shrink: true } }} label="Business to transfer" value={selected}
        onChange={e => { setSelected(e.target.value); setRecipient(null); }}>
        <option value="">Choose a business</option>
        {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </TextField>
      <TextField fullWidth label="Recipient's registered email" type="email" value={email}
        onChange={e => { setEmail(e.target.value); setRecipient(null); }} />
      <Button sx={{ justifySelf: "start" }} variant="outlined" disabled={busy || !selected || !email.trim()}
        onClick={() => run(async () => { const owner = await lookupBusinessTransferOwner(email.trim()); setRecipient(owner); })}>
        Find registered owner
      </Button>
      {recipient && <Box sx={{ gridColumn: "1 / -1", overflowWrap: "anywhere" }}>
        <Typography variant="body2">Recipient: {recipient.display_name} ({recipient.email})</Typography>
        <Button variant="contained" disabled={busy} onClick={() => {
          if (!window.confirm(`Send ownership invitation to ${recipient.email}?`)) return;
          run(async () => { await requestBusinessTransfer(selected, recipient.email); setRecipient(null); setEmail(""); setMessage("Invitation created."); });
        }}>Email transfer invitation</Button>
      </Box>}
      </Box>}
      {pending.map(t => <Box key={t.id} sx={{ border: 1, borderColor: "divider", p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Typography fontWeight={700} sx={{ mb: 1 }}>{t.business_name || `Business #${t.business_id}`}</Typography>
        <Typography variant="body2" color="text.secondary">From: {t.from_owner_name || "Business owner"}</Typography>
        <Typography variant="body2" color="text.secondary">Invited: {t.created_at ? new Date(t.created_at).toLocaleDateString() : "Date unavailable"}</Typography>
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
    </Stack>
  </AdminSection>;
}
