import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchAdminBusinesses, fetchAdminServices, saveAdminBusiness, saveAdminService, setAdminBusinessActive, sendBusinessContactCode, verifyBusinessContactCode } from '../src/lib/api.js';

test('business administration uses authenticated business and service contracts', async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const requests = [];
  globalThis.window = { localStorage: { getItem: () => JSON.stringify({ token: 'owner-session' }) } };
  globalThis.fetch = async (url, options) => {
    requests.push({ url: new URL(url, 'https://example.com'), options });
    return { ok: true, json: async () => ({}) };
  };
  try {
    await fetchAdminBusinesses();
    await fetchAdminServices(7);
    await saveAdminBusiness(null, { business_name: 'Studio' });
    await saveAdminBusiness(7, { business_name: 'New Studio' });
    await saveAdminService(7, null, { name: 'Catering', price: '100' });
    await saveAdminService(7, 9, { name: 'Catering', price: '200', status: 'inactive' });
    await setAdminBusinessActive(7, false);
    await setAdminBusinessActive(7, true);
    await sendBusinessContactCode(7, 'owner@example.com');
    await verifyBusinessContactCode(7, 'owner@example.com', '123456');
    assert.deepEqual(requests.map(r => [r.url.pathname, r.options.method || 'GET']), [
      ['/business/my_businesses', 'GET'], ['/business/business/7/services/history', 'GET'],
      ['/business/add_business', 'POST'], ['/business/business/7', 'PUT'],
      ['/business/add_services/7', 'POST'], ['/business/service/9', 'PUT'],
      ['/business/business/7', 'DELETE'], ['/business/business/7/activate', 'PUT'],
      ['/business/business/7/email/send-code', 'POST'], ['/business/business/7/email/verify', 'POST'],
    ]);
    assert.equal(requests[0].url.searchParams.get('include_inactive'), 'true');
    assert.equal(JSON.parse(requests[5].options.body).status, 'inactive');
    assert.deepEqual(JSON.parse(requests[9].options.body), { email: 'owner@example.com', code: '123456' });
    for (const { options } of requests) assert.equal(options.headers.get('Authorization'), 'Bearer owner-session');
  } finally { globalThis.fetch = originalFetch; globalThis.window = originalWindow; }
});

test('single-service editor fetch is authenticated, uncached, and returns service details directly', async () => {
  const { fetchAdminService } = await import('../src/lib/api.js');
  const previousFetch = globalThis.fetch;
  const previousWindow = globalThis.window;
  globalThis.window = { localStorage: { getItem: () => JSON.stringify({ token: 'owner-session' }) } };
  const expected = { service_id: 42, business_id: 109, name: 'Venue', specialty_ids: ['venue-one'] };
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: new URL(url, 'https://example.com'), options };
    return { ok: true, json: async () => expected };
  };
  try {
    assert.deepEqual(await fetchAdminService(42), expected);
    assert.equal(request.url.pathname, '/business/service/42');
    assert.equal(request.options.method || 'GET', 'GET');
    assert.equal(request.options.cache, 'no-store');
    assert.equal(request.options.headers.get('Authorization'), 'Bearer owner-session');
  } finally { globalThis.fetch = previousFetch; globalThis.window = previousWindow; }
});
