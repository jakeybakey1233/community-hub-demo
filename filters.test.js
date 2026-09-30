import test from 'node:test';
import assert from 'node:assert/strict';
import { resources } from '../src/data.js';
import { cleanFilters, defaultFilters, filterResources } from '../src/filters.js';
test('all audiences is available for both articles and community posts', () => {
  assert.equal(filterResources(resources, { type: 'article', audience: 'all' }).length, 5);
  assert.equal(filterResources(resources, { type: 'discussion', audience: 'all' }).length, 4);
});
test('audience selection applies consistently across content types', () => {
  assert.equal(filterResources(resources, { type: 'all', audience: 'customers' }).length, 3);
  assert.equal(filterResources(resources, { type: 'discussion', audience: 'customers' }).length, 1);
});
test('search matches title, summary or topic without case sensitivity', () => {
  assert.equal(filterResources(resources, { query: 'DATA QUALITY' }).length, 2);
  assert.equal(filterResources(resources, { query: 'sign-in' }).length, 1);
});
test('favourites are optional and only restrict when enabled', () => {
  assert.deepEqual(filterResources(resources, { favoritesOnly: true }, ['r2','r3']).map(r => r.id), ['r2','r3']);
  assert.equal(filterResources(resources, defaultFilters, []).length, resources.length);
});
test('sort supports alphabetical and most recent', () => {
  const alphabetical = filterResources(resources, { sort: 'az' });
  assert.equal(alphabetical[0].title, 'Account access: common questions');
  const latest = filterResources(resources, defaultFilters);
  assert.equal(latest[0].id, 'r1');
});
test('invalid saved filter values are safely replaced', () => {
  assert.deepEqual(cleanFilters({ type: 'invalid', audience: 'invalid', favoritesOnly: 'true', sort: '??' }), defaultFilters);
});
