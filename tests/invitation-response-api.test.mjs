import assert from 'node:assert/strict';
import test from 'node:test';
import { getMyInvitationResponse, updateMyInvitationResponse } from '../src/lib/api.js';
import { safeReturnPath } from '../src/lib/returnPath.js';

test('private RSVP lookup and update carry session and disable cached lookup', async () => {
  const previousFetch=globalThis.fetch, previousWindow=globalThis.window;
  const requests=[];
  globalThis.window={localStorage:{getItem:()=>JSON.stringify({token:'guest-session'})}};
  globalThis.fetch=async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>({response:{response:'yes',adults:2,kids:0}})};};
  try {
    const result=await getMyInvitationResponse('token/with space');
    assert.equal(result.response.response,'yes');
    assert.match(requests[0].url,/\/invitations\/token%2Fwith%20space\/response$/);
    assert.equal(requests[0].options.cache,'no-store');
    const payload={response:'maybe',adults:1,kids:1,message:'Updated',name:'Corrected Name',phone:'6175550100'};
    await updateMyInvitationResponse('token',payload);
    assert.equal(requests[1].options.method,'PATCH');
    assert.deepEqual(JSON.parse(requests[1].options.body),payload);
    for(const request of requests){
      assert.equal(request.options.headers.get('Authorization'),'Bearer guest-session');
      assert.equal(request.options.credentials,'include');
    }
  } finally {globalThis.fetch=previousFetch;globalThis.window=previousWindow;}
});

test('invitation survives safe login and registration return paths', () => {
  const path='/invite/token_123-abc';
  for(const route of ['login','register']) {
    const link=new URL(`/${route}?next=${encodeURIComponent(path)}`,'https://web.eezevent.com');
    assert.equal(safeReturnPath(link.searchParams.get('next')),path);
  }
});
