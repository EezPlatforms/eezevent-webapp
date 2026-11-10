import test from 'node:test';
import assert from 'node:assert/strict';
import { endTimeForStart, offsetEventTime } from '../src/lib/eventDateTime.js';

test('defaults end time one hour after start across midnight and year end', () => {
  assert.equal(endTimeForStart('2026-12-31T23:30', ''), '2027-01-01T00:30');
});
test('moving start past or onto the end resets the end, preserving later custom ends', () => {
  assert.equal(endTimeForStart('2026-11-09T15:00', '2026-11-09T14:00'), '2026-11-09T16:00');
  assert.equal(endTimeForStart('2026-11-09T15:00', '2026-11-09T15:00'), '2026-11-09T16:00');
  assert.equal(endTimeForStart('2026-11-09T15:00', '2026-11-10T12:00'), '2026-11-10T12:00');
});
test('picker minimum is one minute later; incomplete starts do not change the end', () => {
  assert.equal(offsetEventTime('2026-11-09T23:59', 1), '2026-11-10T00:00');
  assert.equal(offsetEventTime('', 1), '');
  assert.equal(endTimeForStart('', '2026-11-09T16:00'), '2026-11-09T16:00');
  assert.equal(endTimeForStart('invalid', '2026-11-09T16:00'), '2026-11-09T16:00');
});
