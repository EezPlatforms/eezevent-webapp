import assert from 'node:assert/strict';
import test from 'node:test';
import { vendorProfilePath, validServiceReference } from '../src/lib/vendorProfilePath.js';

test('profile URLs prefer stable slugs and preserve legacy ID fallback', () => {
  assert.equal(vendorProfilePath({slug:'nihi-cakes-ab12',service_id:109}),'/vendors/nihi-cakes-ab12');
  assert.equal(vendorProfilePath({service_id:109}),'/vendors/109');
  for (const reference of ['109','nihi-cakes','service-abc123']) assert.equal(validServiceReference(reference),true);
  for (const reference of ['../109','https://example.com','foo/bar','',null,'a'.repeat(121)]) assert.equal(validServiceReference(reference),false);
});
