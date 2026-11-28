import assert from 'node:assert/strict';
import test from 'node:test';
import { businessServiceAddress, matchesBusinessAddress, serviceAreaError, serviceAreaPayload } from '../src/lib/serviceLocation.js';
import { fetchAdminBusiness, fetchServiceAreas, lookupServiceAreaZip } from '../src/lib/api.js';

test('business-address selection copies every address field and detects existing matches', () => {
  const business = { street: 'Main St', street2: 'Suite 1', city: 'Waxhaw', state: 'NC', zip: '28173' };
  const address = businessServiceAddress(business);
  assert.deepEqual(address, { service_street: 'Main St', service_street2: 'Suite 1', service_city: 'Waxhaw', service_state: 'NC', service_zip: '28173' });
  assert.equal(matchesBusinessAddress({ ...address, service_city: ' waxhaw ' }, business), true);
  assert.equal(matchesBusinessAddress({ ...address, service_zip: '28277' }, business), false);
});
test('coverage defaults and validation match mobile, and preserve saved center coordinates', () => {
  assert.equal(serviceAreaError({}, '28173'), '');
  assert.deepEqual(serviceAreaPayload({}, '28173'), { zip_code: '28173', radius_miles: 50, travel_available: true });
  for (const radius_miles of ['0', '100', '125.5', '500']) assert.equal(serviceAreaError({ radius_miles }, '28173'), '');
  for (const radius_miles of ['', ' ', '-1', '501', 'NaN']) assert.ok(serviceAreaError({ radius_miles }, '28173'));
  assert.ok(serviceAreaError({ zip_code: '1234' }, '28173'));
  const payload = serviceAreaPayload({ id: 9, zip_code: '28277', radius_miles: '100', latitude: 35, longitude: -80 }, '28173');
  assert.deepEqual(payload, { zip_code: '28277', radius_miles: 100, travel_available: true, latitude: 35, longitude: -80 });
});
test('address and area reads use existing backend endpoints without mutations', async () => {
  const original = globalThis.fetch;
  const paths = [];
  globalThis.fetch = async (url, options) => {
    paths.push(new URL(url, 'https://example.com').pathname);
    assert.equal(options.method || 'GET', 'GET');
    return { ok: true, json: async () => ({}) };
  };
  try {
    await fetchAdminBusiness(109);
    await fetchServiceAreas(42);
    await lookupServiceAreaZip('28173');
    assert.deepEqual(paths, ['/business/business/109', '/business/service/42/service-areas', '/api/v1/locations/zip/28173']);
  } finally { globalThis.fetch = original; }
});
