import assert from 'node:assert/strict';
import test from 'node:test';
import { authorizeWithApple } from '../src/lib/appleSignIn.js';
import { loginWithApple, registerWithApple } from '../src/lib/api.js';

test('Apple popup binds the response to the current attempt and retains first-authorization profile', async () => {
  let config;
  const auth = { init: value => { config = value; }, signIn: async () => ({ authorization: { state: config.state, id_token: 'apple-token' }, user: { name: { firstName: 'Pat' }, email: 'relay@example.com' } }) };
  const response = await authorizeWithApple(auth, { clientId: 'web.services.id', redirectURI: 'https://example.com/login' });
  assert.equal(config.usePopup, true);
  assert.equal(config.scope, 'name email');
  assert.equal(response.user.name.firstName, 'Pat');
  const firstState = config.state;
  await authorizeWithApple(auth, { clientId: 'web.services.id', redirectURI: 'https://example.com/login' });
  assert.notEqual(config.state, firstState);
  auth.signIn = async () => ({ authorization: { state: firstState, id_token: 'apple-token' } });
  await assert.rejects(authorizeWithApple(auth, {}), /could not be verified/);
  auth.signIn = async () => ({ authorization: { state: config.state } });
  await assert.rejects(authorizeWithApple(auth, {}), /could not be verified/);
});

test('Apple API login and registration preserve roles, profile and agreement data', async () => {
  const originalFetch = globalThis.fetch;
  let call;
  globalThis.fetch = async (url, options) => {
    call = { path: new URL(url, 'https://example.com').pathname, method: options.method, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ token: 'session' }) };
  };
  try {
    for (const role of ['client', 'vendor']) {
      await loginWithApple({ idToken: 'apple-token', userType: role });
      assert.deepEqual(call, { path: '/auth/apple/login', method: 'POST', body: { id_token: 'apple-token', provider: 'apple', user_type: role, client_platform: 'web' } });
      const payload = { id_token: 'apple-token', user_type: role, first_name: 'Pat', email: 'relay@example.com', accepted_terms_version: 'privacy-v1', [role === 'client' ? 'accepted_customer_terms_version' : 'accepted_vendor_agreement_version']: 'terms-v2' };
      await registerWithApple(payload);
      assert.equal(call.path, '/auth/apple/register');
      assert.deepEqual(call.body, { ...payload, provider: 'apple', client_platform: 'web' });
    }
  } finally { globalThis.fetch = originalFetch; }
});
