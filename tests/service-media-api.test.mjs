import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchServiceImages, uploadAdminServiceImage, setAdminServiceMainImage, deleteAdminServiceImage, saveAdminCatalogItem, deleteAdminCatalogItem, orderAdminCatalogItems } from '../src/lib/api.js';

test('service media uses multipart uploads and the existing image and catalog endpoints', async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const requests = [];
  globalThis.window = { localStorage: { getItem: () => JSON.stringify({ token: 'owner-session' }) } };
  globalThis.fetch = async (url, options) => {
    requests.push({ url: new URL(url, 'https://example.com'), options });
    return { ok: true, json: async () => ({}) };
  };
  try {
    const file = new File(['photo'], 'venue.jpg', { type: 'image/jpeg' });
    await uploadAdminServiceImage(9, file, { main: true, caption: 'Main & front' });
    await uploadAdminServiceImage(9, file);
    await setAdminServiceMainImage(9, 2);
    await deleteAdminServiceImage(9, 2);
    await saveAdminCatalogItem(9, null, { file, title: 'Package', price: '100', notes: 'Includes decor' });
    await saveAdminCatalogItem(9, 3, { title: 'Updated', price: '', notes: '' });
    await saveAdminCatalogItem(9, 3, { file, title: 'Updated' });
    await deleteAdminCatalogItem(9, 3);
    await orderAdminCatalogItems(9, [4, 3]);
    assert.deepEqual(requests.map(r => [r.url.pathname, r.options.method]), [
      ['/business/service/9/main-image', 'POST'], ['/business/service/9/images', 'POST'],
      ['/business/service/9/images/2/main', 'PUT'], ['/business/service/9/images/2', 'DELETE'],
      ['/business/service/9/catalog-items', 'POST'], ['/business/service/9/catalog-items/3', 'PUT'],
      ['/business/service/9/catalog-items/3', 'PUT'], ['/business/service/9/catalog-items/3', 'DELETE'],
      ['/business/service/9/catalog-items/order', 'PUT'],
    ]);
    assert.equal(requests[0].url.searchParams.get('caption'), 'Main & front');
    assert.equal(requests[0].options.body.get('file').name, 'venue.jpg');
    assert.equal(requests[4].options.body.get('files').name, 'venue.jpg');
    assert.deepEqual(JSON.parse(requests[4].options.body.get('metadata')), [{ title: 'Package', price: '100', notes: 'Includes decor' }]);
    assert.equal(requests[5].options.body.get('price'), '');
    assert.equal(requests[5].options.body.has('file'), false);
    assert.equal(requests[6].options.body.get('file').name, 'venue.jpg');
    assert.deepEqual(JSON.parse(requests[8].options.body), { item_ids: [4, 3] });
    for (const { options } of requests) {
      assert.equal(options.headers.get('Authorization'), 'Bearer owner-session');
      if (options.body instanceof FormData) assert.equal(options.headers.has('Content-Type'), false);
    }
  } finally { globalThis.fetch = originalFetch; globalThis.window = originalWindow; }
});

test('gallery image requests keep the gallery-only API contract', async () => {
  const previousFetch = globalThis.fetch;
  let requested;
  globalThis.fetch = async (url) => {
    requested = new URL(url, 'https://example.com');
    return { ok: true, json: async () => [] };
  };
  try {
    await fetchServiceImages(9);
    assert.equal(requested.pathname, '/business/service/9/images');
    assert.equal(requested.search, '');
  } finally { globalThis.fetch = previousFetch; }
});
