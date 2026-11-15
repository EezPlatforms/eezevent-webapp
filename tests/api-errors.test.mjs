import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchVendorServices } from '../src/lib/api.js';

test('API errors preserve subscription messages, roles, codes and status', async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const ownerActionRequired of [false, true]) {
      const message = ownerActionRequired
        ? 'This business subscription is inactive. The business owner must choose a plan to continue.'
        : 'Your business subscription is inactive. Choose a plan to continue.';
      globalThis.fetch = async () => ({ ok: false, status: 402, json: async () => ({ detail: {
        code: 'BUSINESS_SUBSCRIPTION_INACTIVE', message,
        upgrade_required: !ownerActionRequired, owner_action_required: ownerActionRequired,
      } }) });
      await assert.rejects(fetchVendorServices(), error => {
        assert.equal(error.message, message);
        assert.equal(error.status, 402);
        assert.equal(error.code, 'BUSINESS_SUBSCRIPTION_INACTIVE');
        assert.equal(error.ownerActionRequired, ownerActionRequired);
        assert.equal(error.upgradeRequired, !ownerActionRequired);
        return true;
      });
    }
  } finally { globalThis.fetch = originalFetch; }
});

test('API errors retain string messages and provide useful malformed-response fallbacks', async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const [status, body, expected] of [
      [403, { detail: 'Access denied' }, 'Access denied'],
      [409, { detail: { message: 'Upgrade your plan', code: 'PLAN_BUSINESS_LIMIT_EXCEEDED' } }, 'Upgrade your plan'],
      [402, { detail: {} }, 'Your business subscription is inactive. Renew your plan in the EezEvent mobile app to continue.'],
      [500, { detail: {} }, 'Request failed with status 500'],
      [502, null, 'Request failed with status 502'],
    ]) {
      globalThis.fetch = async () => ({ ok: false, status, json: async () => {
        if (body === null) throw new SyntaxError('Not JSON');
        return body;
      } });
      await assert.rejects(fetchVendorServices(), error => error.status === status && error.message === expected);
    }
  } finally { globalThis.fetch = originalFetch; }
});
