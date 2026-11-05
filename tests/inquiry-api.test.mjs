import assert from 'node:assert/strict';
import test from 'node:test';
import { sendVendorInquiry } from '../src/lib/api.js';
import { safeReturnPath } from '../src/lib/returnPath.js';

test('inquiry uses the mobile API contract and active auth header', async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: { getItem: () => JSON.stringify({ token: 'test-session' }) } };
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ inquiry_id: 1 }) };
  };
  try {
    await sendVendorInquiry({ serviceId: '109', eventId: '22', message: '  Is this package available?  ' });
    assert.equal(new URL(request.url, 'https://example.com').pathname, '/inquiries/v2/inquiries');
    assert.equal(request.options.method, 'POST');
    assert.equal(request.options.headers.get('Authorization'), 'Bearer test-session');
    assert.deepEqual(JSON.parse(request.options.body), { vendor_id: 109, event_id: 22, message: 'Is this package available?' });
    await assert.rejects(() => sendVendorInquiry({serviceId:'109'}), /Select a vendor and event/);
  } finally { globalThis.fetch = originalFetch; globalThis.window = originalWindow; }
});

test('login, signup, and event creation retain a safe vendor continuation', () => {
  const profile = '/vendors/109?inquiry=1&returnTo=%2Fsearch-vendors%3Fzipcode%3D28277';
  assert.equal(safeReturnPath(profile), profile);
  const create = `/events/new?returnTo=${encodeURIComponent(profile)}`;
  assert.equal(safeReturnPath(create), create);
  for (const target of ['https://example.com', '//example.com', '/\\example.com', undefined]) assert.equal(safeReturnPath(target), '/');
});
