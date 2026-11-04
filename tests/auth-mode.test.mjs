import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { resolveAuthMode } from '../src/lib/authMode.js';

test('auth modes match mobile while production defaults to social-only', () => {
  assert.equal(resolveAuthMode(undefined, 'production'), 'social_only');
  assert.equal(resolveAuthMode('', 'development'), 'mixed');
  assert.equal(resolveAuthMode(' SOCIAL_ONLY ', 'development'), 'social_only');
  assert.equal(resolveAuthMode('mixed', 'production'), 'mixed');
  assert.equal(resolveAuthMode('development', 'development'), 'mixed');
});

test('social-only blocks every manual auth request without blocking Google', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import * as api from './src/lib/api.js';
    let requests = 0;
    globalThis.fetch = async () => { requests++; return {ok:true,json:async()=>({})}; };
    for (const call of [
      () => api.loginClient('a','b'), () => api.loginVendor('a','b'),
      () => api.registerAccount('client', {}), () => api.registerAccount('vendor', {}),
      () => api.validateClientEmail('a','123456'), () => api.validateBusinessEmail('a','123456'),
      () => api.resendClientEmailCode('a'), () => api.resendBusinessEmailCode('a'),
    ]) await assert.rejects(call, /disabled/);
    assert.equal(requests, 0);
    await api.loginWithGoogle({idToken:'test',userType:'client'});
    await api.registerWithGoogle({id_token:'test',user_type:'vendor'});
    assert.equal(requests, 2);
  `], { cwd: new URL('..', import.meta.url), env: { ...process.env, NEXT_PUBLIC_AUTH_MODE:'social_only' }, encoding:'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
