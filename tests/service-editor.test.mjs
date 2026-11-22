import assert from 'node:assert/strict';
import test from 'node:test';
import { changeServiceType, isVenueService, serviceEditorPayload } from '../src/lib/serviceEditor.js';

test('capacity applies only to venues and is cleared from other service payloads', () => {
  assert.equal(isVenueService('VENUE_RENTALS'), true);
  for (const type of ['TRANSPORTATION', 'CATERING', '']) {
    assert.equal(isVenueService(type), false);
    assert.equal(serviceEditorPayload({ type, capacity: '100' }, 7).capacity, null);
  }
  assert.equal(serviceEditorPayload({ type: 'VENUE_RENTALS', capacity: '100' }, '7').capacity, 100);
});
test('changing type resets specialties and capacity, while editing the same type preserves both', () => {
  const form = { type: 'VENUE_RENTALS', specialty_ids: ['venue-one'], capacity: 100, name: 'Studio' };
  assert.equal(changeServiceType(form, form.type), form);
  const changed = changeServiceType(form, 'CATERING');
  assert.deepEqual(changed.specialty_ids, []);
  assert.equal(changed.capacity, '');
  assert.equal(changed.name, form.name);
  assert.deepEqual(serviceEditorPayload(form, 7).specialty_ids, ['venue-one']);
});
