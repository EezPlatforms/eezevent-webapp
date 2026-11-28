import assert from 'node:assert/strict';
import test from 'node:test';
import { uploadGalleryBatch, validateGalleryImage } from '../src/lib/galleryUploads.js';
const image = name => ({ name, type: 'image/jpeg', size: 100 });
test('gallery validates each selected image', () => {
  assert.doesNotThrow(() => validateGalleryImage(image('one.jpg')));
  assert.throws(() => validateGalleryImage({ type: 'image/gif', size: 10 }), /JPG, PNG, or WebP/);
  assert.throws(() => validateGalleryImage({ type: 'image/png', size: 5 * 1024 * 1024 + 1 }), /5 MB/);
});
test('partial uploads retain only failed images so retry does not duplicate successful photos', async () => {
  const entries = [1, 2, 3].map(id => ({ id, file: image(`${id}.jpg`), caption: `Photo ${id}` }));
  const calls = [];
  const progress = [];
  const result = await uploadGalleryBatch(entries, async (file, caption) => {
    calls.push([file.name, caption]); if (file.name === '2.jpg') throw Error('Network failure');
  }, (current, total) => progress.push([current, total]));
  assert.equal(result.uploaded, 2);
  assert.equal(result.failed.length, 1);
  assert.equal(result.failed[0].id, 2);
  assert.equal(result.failed[0].error, 'Network failure');
  assert.deepEqual(progress, [[1, 3], [2, 3], [3, 3]]);
  const retried = await uploadGalleryBatch(result.failed, async (file, caption) => calls.push([file.name, caption]));
  assert.equal(retried.uploaded, 1);
  assert.deepEqual(retried.failed, []);
  assert.deepEqual(calls.map(call => call[0]), ['1.jpg', '2.jpg', '3.jpg', '2.jpg']);
});
