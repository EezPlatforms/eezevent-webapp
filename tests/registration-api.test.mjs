import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchLegalDocument, registerAccount, registerWithGoogle, validateClientEmail, validateBusinessEmail, resendClientEmailCode, resendBusinessEmailCode } from '../src/lib/api.js';

test('registration uses mobile endpoints and preserves role-specific agreement versions', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ path: new URL(url, 'https://example.com').pathname, options, body: options.body ? JSON.parse(options.body) : null });
    return { ok: true, json: async () => ({ version: 'current-version', body: 'Current agreement', token: 'test-session' }) };
  };
  try {
    assert.equal((await fetchLegalDocument('privacyPolicy')).version, 'current-version');
    assert.equal(calls.at(-1).path, '/legal/documents/privacyPolicy');
    for (const [role, endpoint, agreement] of [
      ['client', '/clients/save_client', 'customer_terms'],
      ['vendor', '/business/register_business_owner', 'vendor_agreement'],
    ]) {
      const payload = { email: 'example@example.com', accepted_terms_version: 'privacy-v1', [`accepted_${agreement}_version`]: 'agreement-v2' };
      await registerAccount(role, payload);
      assert.equal(calls.at(-1).path, endpoint);
      assert.equal(calls.at(-1).options.method, 'POST');
      assert.deepEqual(calls.at(-1).body, payload);
      await registerWithGoogle({ ...payload, id_token: 'test-id-token', user_type: role });
      assert.equal(calls.at(-1).path, '/auth/google/register');
      assert.equal(calls.at(-1).body.user_type, role);
      assert.equal(calls.at(-1).body.client_platform, 'web');
      assert.equal(calls.at(-1).body[`accepted_${agreement}_version`], 'agreement-v2');
    }
    for (const [verify, resend, prefix] of [[validateClientEmail, resendClientEmailCode, '/clients'], [validateBusinessEmail, resendBusinessEmailCode, '/business']]) {
      await verify('example@example.com', '123456');
      assert.equal(calls.at(-1).path, `${prefix}/validate_email`);
      assert.equal(calls.at(-1).body.code, '123456');
      await resend('example@example.com');
      assert.equal(calls.at(-1).path, `${prefix}/resend_email_code`);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test('duplicate account errors remain actionable', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 409, json: async () => ({ detail: 'Email is already registered.' }) });
  try {
    await assert.rejects(() => registerAccount('client', {}), error => error.status === 409 && error.message === 'Email is already registered.');
  } finally { globalThis.fetch = originalFetch; }
});
