import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProfileImages } from '../src/lib/vendorProfileImages.js';

test('main image displays without additional portfolio photos', () => {
  const images = buildProfileImages({ name: 'Music', main_image_url: '/main.jpg' });
  assert.equal(images.length, 1);
  assert.equal(images[0].url, '/main.jpg');
  assert.equal(images[0].title, 'Music');
});

test('main image leads the gallery without duplicating it or changing portfolio order', () => {
  const portfolio = [{ url: '/one.jpg' }, { url: '/main.jpg' }, { url: '/two.jpg' }];
  assert.deepEqual(buildProfileImages({ main_image_url: '/main.jpg' }, portfolio).map(image => image.url),
    ['/main.jpg', '/one.jpg', '/two.jpg']);
  assert.equal(portfolio.length, 3);
});

test('profiles without a main image retain their additional photos', () => {
  const portfolio = [{ url: '/one.jpg' }];
  assert.deepEqual(buildProfileImages({}, portfolio), portfolio);
  assert.deepEqual(buildProfileImages(null), []);
});
