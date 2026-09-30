import test from 'node:test';
import assert from 'node:assert/strict';
import { BASELINE, isUnread, unreadPostIds, markPostRead, cleanActivityState } from '../src/activity.js';
import { readPreference, writePreference } from '../src/storage.js';
const viewer = { id: 'demo-you', role: 'member' };
const post = { id: 'p1', authorId: 'other', createdAt: '2026-09-20T09:00:00Z' };
const reply = (id, authorId = 'other', authorRole = 'member', createdAt = '2026-09-24T09:00:00Z') => ({ id, postId: 'p1', authorId, authorRole, createdAt, body: 'Fictional reply' });
const empty = () => ({ comments: [], readByUser: {} });
test('a new reply by another member makes an existing post unread', () => {
  assert.equal(isUnread(post, [reply('c1')], viewer), true);
});
test('a user does not get an unread indicator for their own reply', () => {
  assert.equal(isUnread(post, [reply('c1', viewer.id)], viewer), false);
});
test('an own reply does not hide earlier unseen activity by somebody else', () => {
  assert.equal(isUnread(post, [reply('c1'), reply('c2', viewer.id, 'member', '2026-09-25T09:00:00Z')], viewer), true);
});
test('a moderator reply suppresses the moderator queue without suppressing member activity', () => {
  const comments = [reply('c1', 'mod', 'moderator'), reply('c2', 'other', 'member', '2026-09-25T09:00:00Z')];
  assert.equal(isUnread(post, comments, { ...viewer, role: 'moderator' }), false);
  assert.equal(isUnread(post, comments, viewer), true);
});
test('opening a post records only its visible activity and clears its indicator', () => {
  const comments = [reply('c1')];
  const original = empty();
  const next = markPostRead(original, post, comments, viewer);
  assert.equal(isUnread(post, comments, viewer, next.readByUser[viewer.id].p1), false);
  assert.deepEqual(original, empty());
});
test('a reply arriving after the read snapshot becomes unread again', () => {
  const comments = [reply('c1')];
  const next = markPostRead(empty(), post, comments, viewer);
  assert.equal(isUnread(post, [...comments, reply('c2', 'other', 'member', '2026-09-25T09:00:00Z')], viewer, next.readByUser[viewer.id].p1), true);
});
test('folder and topic aggregation changes no read state and does not clear other posts', () => {
  const otherPost = { ...post, id: 'p2' };
  const comments = [reply('c1'), { ...reply('c2'), postId: 'p2' }];
  const state = empty();
  assert.deepEqual([...unreadPostIds([post, otherPost], comments, state, viewer)], ['p1', 'p2']);
  assert.deepEqual(state, empty());
  const next = markPostRead(state, post, comments, viewer);
  assert.deepEqual([...unreadPostIds([post, otherPost], comments, next, viewer)], ['p2']);
});
test('read markers are isolated by viewer and never move backwards', () => {
  const state = { comments: [], readByUser: { 'someone-else': { p1: Date.parse('2026-09-25T09:00:00Z') }, 'demo-you': { p1: BASELINE } } };
  assert.equal(unreadPostIds([post], [reply('c1')], state, viewer).size, 1);
  const next = markPostRead(markPostRead(state, post, [reply('c1')], viewer), post, [], viewer);
  assert.equal(next.readByUser[viewer.id].p1, Date.parse('2026-09-24T09:00:00Z'));
});
test('new posts by other people can be unread while own posts cannot', () => {
  const newPost = { ...post, createdAt: '2026-09-24T09:00:00Z' };
  assert.equal(isUnread(newPost, [], viewer), true);
  assert.equal(isUnread({ ...newPost, authorId: viewer.id }, [], viewer), false);
});
test('malformed and future saved read markers cannot silence notifications', () => {
  const state = cleanActivityState({ comments: [null, { ...reply('c1'), authorId: 'demo-member' }, { ...reply('c2'), postId: 'unknown' }], readByUser: { 'demo-you': { p1: Date.now() + 10000 } } }, ['p1']);
  assert.equal(state.comments.length, 1);
  assert.deepEqual(state.readByUser['demo-you'], {});
  assert.deepEqual(cleanActivityState(null, ['p1']), emptyWithUser());
});
function emptyWithUser() { return { comments: [], readByUser: { 'demo-you': {} } }; }
test('blocked or corrupt storage has a safe in-memory fallback', () => {
  const denied = { getItem() { throw Error('Blocked'); }, setItem() { throw Error('Blocked'); } };
  assert.deepEqual(readPreference(denied, 'key', []), []);
  assert.equal(writePreference(denied, 'key', {}), false);
  assert.deepEqual(readPreference({ getItem: () => '{broken' }, 'key', {}), {});
});
