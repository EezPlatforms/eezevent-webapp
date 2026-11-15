import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchOwnerProfile, fetchVendorServices, fetchVendorDashboardSummary, fetchVendorAttention } from '../src/lib/api.js';
import { signInDestination } from '../src/lib/returnPath.js';

test('vendor sign-in defaults to dashboard while preserving explicit continuations', () => {
  assert.equal(signInDestination('vendor'), '/dashboard');
  assert.equal(signInDestination('client'), '/');
  assert.equal(signInDestination('vendor', '/invite/abc?response=1'), '/invite/abc?response=1');
  assert.equal(signInDestination('vendor', '/vendors/123'), '/vendors/123');
  assert.equal(signInDestination('vendor', '//external.example'), '/dashboard');
});

test('dashboard reuses existing authenticated mobile endpoints without mutations', async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const requests = [];
  globalThis.window = { localStorage: { getItem: () => JSON.stringify({ token: 'vendor-session' }) } };
  globalThis.fetch = async (url, options) => {
    requests.push({ url: new URL(url, 'https://example.com'), options });
    return { ok: true, json: async () => ({}) };
  };
  try {
    await fetchOwnerProfile();
    await fetchVendorServices();
    await fetchVendorDashboardSummary();
    const controller = new AbortController();
    await fetchVendorDashboardSummary('42', { signal: controller.signal });
    for (const section of ['unsigned-contracts', 'unscheduled-upcoming', 'past-not-completed']) await fetchVendorAttention(section);
    assert.deepEqual(requests.map(request => request.url.pathname), [
      '/business/owner/me', '/business/vendor/services',
      '/inquiries/v2/inquiries/vendor/dashboard/summary', '/inquiries/v2/inquiries/vendor/dashboard/summary',
      '/inquiries/v2/inquiries/notifications/unsigned-contracts', '/inquiries/v2/inquiries/notifications/unscheduled-upcoming',
      '/inquiries/v2/inquiries/notifications/past-not-completed',
    ]);
    assert.equal(requests[2].url.search, '');
    assert.equal(requests[3].url.searchParams.get('service_id'), '42');
    assert.equal(requests[3].options.signal, controller.signal);
    for (const { options } of requests) {
      assert.equal(options.headers.get('Authorization'), 'Bearer vendor-session');
      assert.equal(options.method || 'GET', 'GET');
      assert.equal(options.cache, 'no-store');
    }
    assert.throws(() => fetchVendorAttention('../other'), /Unknown attention section/);
  } finally { globalThis.fetch = originalFetch; globalThis.window = originalWindow; }
});
