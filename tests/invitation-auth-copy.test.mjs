import assert from 'node:assert/strict';
import test from 'node:test';
import { isInvitationReturnPath } from '../src/lib/returnPath.js';

test('invitation auth context recognizes invitation return paths with query or hash', () => {
  for (const path of ['/invite/token-123_abc','/invite/token/','/invite/token?source=email','/invite/token#rsvp']) assert.equal(isInvitationReturnPath(path),true,path);
});
test('normal login and untrusted return paths do not enable invitation context', () => {
  for (const path of ['/', '/events', '/invite/', '/invite/token/other', '//example.com/invite/token', 'https://example.com/invite/token', undefined]) assert.equal(isInvitationReturnPath(path),false,String(path));
});
