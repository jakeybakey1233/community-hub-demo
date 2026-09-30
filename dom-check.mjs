import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
const html = await readFile(new URL('../preview.html', import.meta.url), 'utf8');
const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
if (!script) throw new Error('Run npm run build:preview before the DOM check');
let assertions = 0;
const equal = (actual, expected, message) => { assert.equal(actual, expected, message); assertions++; };
function createDOM(preferences = {}, blockStorage = false) {
  // No resource loading or network navigation. Execute only our committed preview source.
  const dom = new JSDOM(html, { url: 'https://demo.example.invalid/', runScripts: 'outside-only' });
  if (blockStorage) Object.defineProperty(dom.window, 'localStorage', { get() { throw new Error('Blocked test storage'); } });
  else for (const [key,value] of Object.entries(preferences)) dom.window.localStorage.setItem(key,value);
  dom.window.eval(script);
  return dom;
}
let dom = createDOM();
let window = dom.window;
let document = window.document;
const q = selector => document.querySelector(selector);
const nextTask = () => new Promise(resolve => setTimeout(resolve, 5));
async function navigate(hash) { window.location.hash = hash; await nextTask(); }
function change(selector, value) { q(selector).value = value; q(selector).dispatchEvent(new window.Event('change', { bubbles: true })); }
function submit(selector) { q(selector).dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); }
const count = () => Number(q('#activity-summary').textContent.match(/^\d+/)[0]);
const preferences = () => Object.fromEntries(Array.from({ length: window.localStorage.length }, (_,i) => {
  const key = window.localStorage.key(i); return [key, window.localStorage.getItem(key)];
}));
try {
  equal(q('#results-list').children.length, 9, 'Initial resources render');
  equal(count(), 3, 'Three seeded posts are unread for a member');
  equal(q('#folder-list').children[0].querySelector('.activity-badge').textContent, '2 unread posts', 'Folder aggregates its specific posts');
  await navigate('/folder/operations');
  equal(count(), 3, 'Folder visit leaves posts unread');
  await navigate('/topic/quality');
  equal(count(), 3, 'Topic visit leaves posts unread');
  equal(q('#detail-content .resource-card').dataset.resourceId, 'r2', 'Topic contains its actual post');
  equal(q('#detail-content .activity-badge').textContent, 'New activity', 'Post-level indicator is visible');
  await navigate('/post/r2');
  equal(count(), 2, 'Opening one post clears only its own activity');
  equal(q('#detail-content .activity-badge').textContent, 'Read', 'Opened post becomes read');
  change('#scenario-author', 'you'); submit('#scenario-form');
  equal(count(), 2, 'Own reply does not make the post unread');
  change('#scenario-author', 'member'); submit('#scenario-form');
  equal(count(), 3, 'A later external reply becomes unread while the view is open');
  q('[data-focus-key="mark-read"]').focus(); q('[data-focus-key="mark-read"]').click();
  equal(count(), 2, 'Explicit read action clears the later reply');
  equal(document.activeElement.dataset.focusKey, 'mark-read', 'Read-button focus survives rendering');
  const stored = preferences();
  dom.window.close(); dom = createDOM(stored); window = dom.window; document = window.document;
  equal(count(), 2, 'Read snapshot survives a fresh DOM/session with saved preferences');
  change('#viewer-role', 'moderator');
  equal(count(), 2, 'Moderator view suppresses the moderator-replied post');
  q('#reset-demo').click(); await nextTask();
  equal(count(), 3, 'Reset restores the seeded member activity');
  const star = q('[data-focus-key="favorite-r1"]'); star.focus(); star.click();
  equal(document.activeElement.dataset.focusKey, 'favorite-r1', 'Favourite control retains focus');
  equal(q('[data-focus-key="favorite-r1"]').getAttribute('aria-pressed'), 'true', 'Favourite pressed state updates');
  q('#favorites-only').checked = true; q('#favorites-only').dispatchEvent(new window.Event('change', { bubbles: true }));
  equal(q('#results-list').children.length, 1, 'Favourites-only filter works');
  q('[data-focus-key="favorite-r1"]').focus(); q('[data-focus-key="favorite-r1"]').click();
  equal(q('#no-results').hidden, false, 'Removing the final favourite shows the empty state');
  equal(document.activeElement.id, 'results-heading', 'Focus moves to the results heading if its resource disappears');
  q('.empty-reset').click(); q('#search-input').value = 'sign-in'; submit('#search-form');
  equal(q('#results-list').children.length, 1, 'Search and reset events are connected');
  equal(q('#results-list .resource-card').dataset.resourceId, 'r4', 'Search matches the right resource');
  q('#reset-filters').click();
  await navigate('/article/r1');
  equal(q('#detail-title').textContent, 'Understanding your billing summary', 'Article links open actual content');
  await navigate('/post/missing');
  equal(q('#detail-title').textContent, 'Resource not found', 'Unknown resource links have a safe view');
  dom.window.close(); dom = createDOM({ 'community-hub-demo.filters.v1': '{broken', 'community-hub-demo.favorites.v1': '{"bad":true}' }); window = dom.window; document = window.document;
  equal(q('#results-list').children.length, 9, 'Malformed storage does not break initial rendering');
  dom.window.close(); dom = createDOM({}, true); window = dom.window; document = window.document;
  equal(q('#results-list').children.length, 9, 'Storage-object access denial has an in-memory fallback');
  await navigate('/post/r8');
  change('#scenario-author', 'member'); q('#scenario-body').value = '<img src=x onerror=alert(1)>'; submit('#scenario-form');
  equal(q('.reply-list').querySelectorAll('img').length, 0, 'Reply input is rendered as text, not HTML');
  equal(q('.reply-list').lastElementChild.textContent.includes('<img src=x onerror=alert(1)>'), true, 'Literal content is preserved safely');
  console.log(`DOM interaction checks passed: ${assertions} assertions. This checks events and state, not visual browser rendering.`);
} finally { dom.window.close(); }
