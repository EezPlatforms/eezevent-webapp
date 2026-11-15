export const inquiryBuckets = [
  { key: 'open', label: 'Open', description: 'New inquiries and client replies', color: 'primary' },
  { key: 'pending', label: 'Pending', description: 'Quotes and contracts in progress', color: 'warning' },
  { key: 'confirmed', label: 'Scheduled', description: 'Confirmed work and signed contracts', color: 'success' },
  { key: 'declined', label: 'Vendor declined', description: 'Inquiries you have declined', color: 'error' },
];
export const normalizeInquiryStatus = value => String(value || '').trim().replaceAll('_', ' ').toLowerCase();
export const inquiryStatusLabel = value => {
  const status = normalizeInquiryStatus(value);
  if (status === 'confirmed') return 'Scheduled';
  return status ? status.replace(/\b\w/g, char => char.toUpperCase()) : 'Unknown';
};
export const inquiryStatusColor = value => {
  const status = normalizeInquiryStatus(value);
  if (status.includes('declined')) return 'error';
  if (['confirmed', 'contract signed', 'quote accepted', 'client responded', 'completed'].includes(status)) return 'success';
  if (['under review', 'contract issued', 'awaiting vendor contract'].includes(status)) return 'warning';
  if (status === 'quote sent') return 'info';
  if (['cancelled', 'expired'].includes(status)) return 'text.secondary';
  return 'primary';
};
export function filterVendorInquiries(items, { bucket = 'all', serviceId = '', status = '', search = '', sort = 'newest' } = {}) {
  const term = search.trim().toLowerCase();
  const dateValue = (value, fallback) => {
    const date = value ? new Date(value).getTime() : NaN;
    return Number.isNaN(date) ? fallback : date;
  };
  return items.filter(item => (!bucket || bucket === 'all' || item.bucket === bucket)
    && (!serviceId || String(item.service_id) === String(serviceId))
    && (!status || normalizeInquiryStatus(item.status) === status)
    && (!term || [item.event_name, item.client_first_name, item.client_last_name, item.service_name, item.business_name, item.inquiry_id, inquiryStatusLabel(item.status)].some(value => String(value ?? '').toLowerCase().includes(term))))
    .sort((a, b) => sort === 'event-date'
      ? dateValue(a.start_time, Infinity) - dateValue(b.start_time, Infinity)
      : dateValue(b.created_at, 0) - dateValue(a.created_at, 0));
}
export function groupVendorInquiries(items) {
  const groups = new Map();
  items.forEach(item => {
    const key = item.event_id != null ? `event:${item.event_id}` : `inquiry:${item.inquiry_id}`;
    if (!groups.has(key)) groups.set(key, { key, event: item, inquiries: [] });
    groups.get(key).inquiries.push(item);
  });
  return [...groups.values()];
}
