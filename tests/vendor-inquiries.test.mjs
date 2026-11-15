import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchVendorInquiries } from '../src/lib/api.js';
import { filterVendorInquiries, groupVendorInquiries, inquiryStatusColor, inquiryStatusLabel } from '../src/lib/vendorInquiries.js';

const items = [
  { inquiry_id: 1, event_id: 10, event_name: 'Wedding', client_first_name: 'Sam', service_id: 2, service_name: 'Music', status: 'Submitted', bucket: 'open', created_at: '2026-11-01', start_time: '2026-12-10' },
  { inquiry_id: 2, event_id: 10, event_name: 'Wedding', service_id: 3, service_name: 'Catering', status: 'Quote Declined', bucket: 'pending', created_at: '2026-11-02', start_time: '2026-12-10' },
  { inquiry_id: 3, event_id: 11, event_name: 'Birthday', service_id: 2, status: 'Confirmed', bucket: 'confirmed', created_at: '2026-11-03', start_time: '2026-11-20' },
  { inquiry_id: 4, service_id: 2, status: 'Vendor Declined', bucket: 'declined' },
];

test('inquiry filters combine service, bucket, exact status and search without conflating declined groups', () => {
  assert.deepEqual(filterVendorInquiries(items, { bucket: 'pending' }).map(item => item.inquiry_id), [2]);
  assert.deepEqual(filterVendorInquiries(items, { bucket: 'declined' }).map(item => item.inquiry_id), [4]);
  assert.deepEqual(filterVendorInquiries(items, { serviceId: '2', bucket: 'open', search: ' SAM ', status: 'submitted' }).map(item => item.inquiry_id), [1]);
  assert.deepEqual(filterVendorInquiries(items, { search: 'catering' }).map(item => item.inquiry_id), [2]);
  assert.deepEqual(filterVendorInquiries(items, { search: 'scheduled' }).map(item => item.inquiry_id), [3]);
  assert.equal(filterVendorInquiries(items, { search: 'not present' }).length, 0);
  assert.equal(items[0].inquiry_id, 1);
});

test('sorting places missing event dates last and event grouping keeps multiple services together', () => {
  assert.deepEqual(filterVendorInquiries(items).map(item => item.inquiry_id), [3, 2, 1, 4]);
  assert.deepEqual(filterVendorInquiries(items, { sort: 'event-date' }).map(item => item.inquiry_id), [3, 1, 2, 4]);
  const groups = groupVendorInquiries(items);
  assert.equal(groups.length, 3);
  assert.deepEqual(groups[0].inquiries.map(item => item.inquiry_id), [1, 2]);
});

test('status labels match mobile and colors distinguish workflow states', () => {
  assert.equal(inquiryStatusLabel('CONFIRMED'), 'Scheduled');
  assert.equal(inquiryStatusLabel('CONTRACT_SIGNED'), 'Contract Signed');
  assert.equal(inquiryStatusLabel(null), 'Unknown');
  assert.equal(inquiryStatusColor('Quote Declined'), 'error');
  assert.equal(inquiryStatusColor('Contract Issued'), 'warning');
  assert.equal(inquiryStatusColor('Contract Signed'), 'success');
  assert.equal(inquiryStatusColor('Quote Sent'), 'info');
});

test('inquiry list uses each existing mobile bucket endpoint with authentication and cancellation', async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: { getItem: () => JSON.stringify({ token: 'test-vendor' }) } };
  const controller = new AbortController();
  try {
    for (const bucket of ['open', 'pending', 'confirmed', 'declined']) {
      globalThis.fetch = async (url, options) => {
        const parsed = new URL(url, 'https://example.com');
        assert.equal(parsed.pathname, '/inquiries/v2/inquiries/business/inquiries');
        assert.equal(parsed.searchParams.get('status'), bucket);
        assert.equal(options.headers.get('Authorization'), 'Bearer test-vendor');
        assert.equal(options.method || 'GET', 'GET');
        assert.equal(options.cache, 'no-store');
        assert.equal(options.signal, controller.signal);
        return { ok: true, json: async () => ({ inquiries: [{ inquiry_id: 1 }] }) };
      };
      const result = await fetchVendorInquiries(bucket, { signal: controller.signal });
      assert.equal(result[0].bucket, bucket);
    }
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ inquiries: null }) });
    assert.deepEqual(await fetchVendorInquiries(), []);
    await assert.rejects(fetchVendorInquiries('completed'), /Unknown inquiry group/);
  } finally { globalThis.fetch = originalFetch; globalThis.window = originalWindow; }
});
