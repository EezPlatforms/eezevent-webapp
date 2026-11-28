import assert from 'node:assert/strict';
import test from 'node:test';
import { getPendingBusinessTransfer } from '../src/lib/businessTransfers.js';

test('business cards show only their own unexpired pending transfer', () => {
  const now = Date.parse('2026-11-22T12:00:00Z');
  const pending = { business_id: 109, status: 'pending', expires_at: '2026-11-23T12:00:00Z' };
  assert.equal(getPendingBusinessTransfer([pending], '109', now), pending);
  assert.equal(getPendingBusinessTransfer([pending], 110, now), undefined);
  for (const status of ['accepted', 'declined', 'cancelled', 'expired']) {
    assert.equal(getPendingBusinessTransfer([{ ...pending, status }], 109, now), undefined);
  }
  for (const expires_at of ['2026-11-22T12:00:00Z', '2026-11-21T12:00:00Z', null, 'invalid']) {
    assert.equal(getPendingBusinessTransfer([{ ...pending, expires_at }], 109, now), undefined);
  }
  assert.equal(getPendingBusinessTransfer([], 109, now), undefined);
});
