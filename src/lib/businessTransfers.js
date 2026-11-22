export const getPendingBusinessTransfer = (transfers, businessId, now = Date.now()) =>
  transfers.find(transfer => String(transfer.business_id) === String(businessId) &&
    transfer.status === 'pending' && new Date(transfer.expires_at).getTime() > now);
