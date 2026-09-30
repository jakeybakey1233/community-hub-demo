import { resources, audiences, folders, topics, posts, seedReplies, authorNames, articleParagraphs } from './data.js';
import { defaultFilters, cleanFilters, filterResources } from './filters.js';
import { demoViewer, cleanActivityState, unreadPostIds, markPostRead } from './activity.js';
import { readPreference, writePreference } from './storage.js';

const FILTER_KEY = 'community-hub-demo.filters.v1';
const FAVORITE_KEY = 'community-hub-demo.favorites.v1';
const ACTIVITY_KEY = 'community-hub-demo.activity.v2';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
// Access to localStorage itself can throw, before any getItem call.
let storage;
try { storage = window.localStorage; } catch { storage = null; }
let filters = cleanFilters({ ...defaultFilters, ...readPreference(storage, FILTER_KEY, {}) });
const saved = readPreference(storage, FAVORITE_KEY, []);
let favorites = new Set(Array.isArray(saved) ? saved.filter(id => resources.some(r => r.id === id)) : []);
let activity = cleanActivityState(readPreference(storage, ACTIVITY_KEY, {}), posts.map(p => p.id));
let viewer = { ...demoViewer };
let route = { kind: 'browse', id: null };
const comments = () => [...seedReplies, ...activity.comments];
const unread = () => unreadPostIds(posts, comments(), activity, viewer);
const saveActivity = () => writePreference(storage, ACTIVITY_KEY, activity);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
const date = iso => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso));
function link(text, href, className) { const a = el('a', className, text); a.href = href; return a; }
function statusBadge(count) {
  const badge = el('span', count ? 'activity-badge unread' : 'activity-badge', count ? `${count} unread ${count === 1 ? 'post' : 'posts'}` : 'All read');
  if (count) { const dot = el('span', 'unread-dot'); dot.setAttribute('aria-hidden', 'true'); badge.prepend(dot); }
  return badge;
}
function postBadge(isNew) {
  const badge = el('span', isNew ? 'activity-badge unread' : 'activity-badge', isNew ? 'New activity' : 'Read');
  if (isNew) { const dot = el('span', 'unread-dot'); dot.setAttribute('aria-hidden', 'true'); badge.prepend(dot); }
  return badge;
}
function announce(message) { $('#announcement').textContent = message; }
function backLink(text, href) { return link(`← ${text}`, href, 'back-link'); }

function createCard(item, unreadIds) {
  const card = el('article', 'resource-card');
  card.dataset.resourceId = item.id;
  const icon = el('div', `resource-icon ${item.type}`, item.type === 'article' ? '▤' : '◌');
  icon.setAttribute('aria-hidden', 'true');
  const body = el('div', 'resource-body');
  const labels = el('div', 'resource-labels');
  labels.append(el('span', `type-tag ${item.type}`, item.type === 'article' ? 'HELP ARTICLE' : 'COMMUNITY POST'));
  labels.append(el('span', 'audience-tag', audiences[item.audience]));
  if (item.type === 'discussion') labels.append(postBadge(unreadIds.has(item.id)));
  const heading = el('h3');
  const headingLink = link(item.title, `#/${item.type === 'article' ? 'article' : 'post'}/${item.id}`);
  headingLink.dataset.focusKey = `resource-${item.id}`;
  heading.append(headingLink);
  const footer = el('div', 'resource-footer');
  footer.append(el('span', '', item.topic), el('span', '', '·'), el('span', '', date(item.date)));
  if (item.type === 'discussion') {
    const replies = comments().filter(c => c.postId === item.id);
    footer.append(el('span', '', `· ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`));
    if (replies.some(c => c.authorRole === 'moderator')) footer.append(el('span', 'moderator-tag', 'Moderator replied'));
  } else footer.append(el('span', '', `· ${item.minutes} min read`));
  body.append(labels, heading, el('p', 'resource-description', item.description), footer);
  const save = el('button', 'favorite-button', favorites.has(item.id) ? '★' : '☆');
  save.type = 'button';
  save.dataset.focusKey = `favorite-${item.id}`;
  save.setAttribute('aria-label', `${favorites.has(item.id) ? 'Remove' : 'Add'} ${item.title} ${favorites.has(item.id) ? 'from' : 'to'} favourites`);
  save.setAttribute('aria-pressed', String(favorites.has(item.id)));
  save.addEventListener('click', () => {
    const wasSaved = favorites.has(item.id);
    wasSaved ? favorites.delete(item.id) : favorites.add(item.id);
    writePreference(storage, FAVORITE_KEY, [...favorites]);
    render();
    announce(wasSaved ? 'Resource removed from favourites.' : 'Resource saved to favourites.');
  });
  card.append(icon, body, save);
  return card;
}
function topicPosts(id) { return posts.filter(p => p.topicId === id); }
function folderPosts(id) { const ids = new Set(topics.filter(t => t.folderId === id).map(t => t.id)); return posts.filter(p => ids.has(p.topicId)); }
function navigationCard(item, kind, items, unreadIds) {
  const card = link('', `#/${kind}/${item.id}`, 'navigation-card');
  card.append(el('h3', '', item.title), el('p', '', item.description), statusBadge(items.filter(p => unreadIds.has(p.id)).length));
  return card;
}
function renderBrowse(unreadIds) {
  $('#folder-list').replaceChildren(...folders.map(f => navigationCard(f, 'folder', folderPosts(f.id), unreadIds)));
  const matches = filterResources(resources, filters, [...favorites]);
  $('#results-list').replaceChildren(...matches.map(item => createCard(item, unreadIds)));
  $('#results-count').textContent = `${matches.length} ${matches.length === 1 ? 'resource' : 'resources'} found`;
  $('#no-results').hidden = matches.length > 0;
  writePreference(storage, FILTER_KEY, filters);
}
function setDetail(title, eyebrow, back, breadcrumb) {
  $('#detail-title').textContent = title;
  $('#detail-eyebrow').textContent = eyebrow;
  $('#detail-back').replaceChildren(back);
  $('#breadcrumb-current').textContent = breadcrumb;
  $('#detail-content').replaceChildren();
}
function renderFolder(unreadIds) {
  const folder = folders.find(f => f.id === route.id);
  if (!folder) return renderMissing();
  setDetail(folder.title, 'COMMUNITY FOLDER', backLink('All resources', '#/browse'), folder.title);
  const note = el('p', 'view-note', 'Opening this folder or a topic leaves individual posts unread. Open a post to record its activity as read.');
  const grid = el('div', 'folder-grid');
  grid.append(...topics.filter(t => t.folderId === folder.id).map(t => navigationCard(t, 'topic', topicPosts(t.id), unreadIds)));
  $('#detail-content').append(note, grid);
}
function renderTopic(unreadIds) {
  const topic = topics.find(t => t.id === route.id);
  if (!topic) return renderMissing();
  setDetail(topic.title, 'COMMUNITY TOPIC', backLink('Folder', `#/folder/${topic.folderId}`), topic.title);
  const list = el('div', 'results-list');
  list.append(...topicPosts(topic.id).map(item => createCard(item, unreadIds)));
  $('#detail-content').append(el('p', 'view-note', 'The blue indicator belongs to the specific post with unseen activity.'), list);
}
function renderPost(unreadIds) {
  const post = posts.find(p => p.id === route.id);
  if (!post) return renderMissing();
  setDetail(post.title, 'COMMUNITY DISCUSSION', backLink('Topic', `#/topic/${post.topicId}`), post.topic);
  const body = el('article', 'post-body');
  body.append(el('p', 'post-meta', `${authorNames[post.authorId]} · ${date(post.createdAt)} · ${audiences[post.audience]}`), el('p', '', post.body));
  const status = el('div', 'post-status');
  status.append(postBadge(unreadIds.has(post.id)));
  const mark = el('button', 'secondary-button', 'Mark current activity as read');
  mark.type = 'button'; mark.dataset.focusKey = 'mark-read';
  mark.addEventListener('click', () => { activity = markPostRead(activity, post, comments(), viewer); saveActivity(); render(); announce('Current post activity marked as read.'); });
  status.append(mark);
  const heading = el('h3', '', 'Replies');
  const replyList = el('ol', 'reply-list');
  for (const reply of comments().filter(c => c.postId === post.id).sort((a,b) => a.createdAt.localeCompare(b.createdAt))) {
    const li = el('li', 'reply');
    li.append(el('p', 'post-meta', `${authorNames[reply.authorId]}${reply.authorRole === 'moderator' ? ' · Moderator' : ''} · ${date(reply.createdAt)}`), el('p', '', reply.body));
    replyList.append(li);
  }
  if (!replyList.childElementCount) replyList.append(el('li', 'reply', 'No replies yet. Try adding one with the scenario controls.'));
  $('#detail-content').append(body, status, heading, replyList, el('p', 'view-note', 'A reply added after this view opened remains new until you mark it read or open the post again.'));
}
function renderArticle() {
  const item = resources.find(r => r.id === route.id && r.type === 'article');
  if (!item) return renderMissing();
  setDetail(item.title, 'HELP ARTICLE', backLink('All resources', '#/browse'), item.topic);
  const article = el('article', 'post-body');
  article.append(el('p', 'post-meta', `${date(item.date)} · ${item.minutes} min read · ${audiences[item.audience]}`), ...articleParagraphs(item).map(text => el('p', '', text)));
  $('#detail-content').append(article);
}
function renderMissing() {
  setDetail('Resource not found', 'UNKNOWN LINK', backLink('All resources', '#/browse'), 'Not found');
  $('#detail-content').append(el('p', '', 'This resource is not part of the fictional demo. Use the link above to return to the explorer.'));
}
function render() {
  const focusKey = document.activeElement?.dataset.focusKey;
  const unreadIds = unread();
  $('#activity-summary').textContent = `${unreadIds.size} ${unreadIds.size === 1 ? 'post has' : 'posts have'} unread activity for this ${viewer.role}.`;
  $('#browse-view').hidden = route.kind !== 'browse';
  $('#detail-view').hidden = route.kind === 'browse';
  $('#hero').hidden = route.kind !== 'browse';
  if (route.kind === 'browse') { $('#breadcrumb-current').textContent = audiences[filters.audience]; renderBrowse(unreadIds); }
  else if (route.kind === 'folder') renderFolder(unreadIds);
  else if (route.kind === 'topic') renderTopic(unreadIds);
  else if (route.kind === 'post') renderPost(unreadIds);
  else renderArticle();
  if (focusKey) {
    const replacement = $$('[data-focus-key]').find(node => node.dataset.focusKey === focusKey && node.closest('[hidden]') === null);
    (replacement ?? (route.kind === 'browse' ? $('#results-heading') : $('#detail-title'))).focus({ preventScroll: true });
  }
}
function routeFromHash() {
  const parts = location.hash.slice(1).split('/').filter(Boolean);
  const kind = ['folder', 'topic', 'post', 'article'].includes(parts[0]) ? parts[0] : 'browse';
  const id = parts[1] ?? null;
  const changed = kind !== route.kind || id !== route.id;
  route = { kind, id };
  // Only an explicit post navigation marks it read, never rendering or navigation to a parent.
  if (changed && kind === 'post') {
    const post = posts.find(p => p.id === id);
    if (post) { activity = markPostRead(activity, post, comments(), viewer); saveActivity(); $('#scenario-post').value = id; }
  }
  render();
  if (changed && kind !== 'browse') $('#detail-title').focus({ preventScroll: false });
}
function syncControls() {
  $(`input[name="content-type"][value="${filters.type}"]`).checked = true;
  $(`input[name="audience"][value="${filters.audience}"]`).checked = true;
  $('#search-input').value = filters.query;
  $('#favorites-only').checked = filters.favoritesOnly;
  $('#sort-order').value = filters.sort;
}
function resetFilters() { filters = { ...defaultFilters }; syncControls(); render(); }
function updateFilters(patch) { filters = cleanFilters({ ...filters, ...patch }); render(); }
$$('input[name="content-type"]').forEach(input => input.addEventListener('change', () => updateFilters({ type: input.value })));
$$('input[name="audience"]').forEach(input => input.addEventListener('change', () => updateFilters({ audience: input.value })));
$('#favorites-only').addEventListener('change', e => updateFilters({ favoritesOnly: e.target.checked }));
$('#sort-order').addEventListener('change', e => updateFilters({ sort: e.target.value }));
$('#search-form').addEventListener('submit', e => { e.preventDefault(); updateFilters({ query: $('#search-input').value }); });
$('#search-input').addEventListener('input', e => { if (!e.target.value) updateFilters({ query: '' }); });
$('#reset-filters').addEventListener('click', resetFilters);
$('.empty-reset').addEventListener('click', resetFilters);
$('#viewer-role').addEventListener('change', e => { viewer = { ...viewer, role: e.target.value }; render(); announce(`Viewing activity as a ${viewer.role}.`); });
$('#scenario-post').replaceChildren(...posts.map(post => { const option = el('option', '', post.title); option.value = post.id; return option; }));
$('#scenario-form').addEventListener('submit', e => {
  e.preventDefault();
  if (activity.comments.length >= 200) { announce('The demo stores up to 200 added replies. Reset the demo to try again.'); return; }
  const author = $('#scenario-author').value;
  const authorId = author === 'you' ? viewer.id : author === 'moderator' ? 'demo-moderator' : 'demo-member';
  const authorRole = author === 'moderator' || (author === 'you' && viewer.role === 'moderator') ? 'moderator' : 'member';
  const newest = Math.max(Date.now() - 1, ...comments().map(c => Date.parse(c.createdAt)));
  const timestamp = newest + 1;
  const createdAt = new Date(timestamp).toISOString();
  const body = $('#scenario-body').value.trim().slice(0,1000) || `A fictional reply from ${authorNames[authorId]} to demonstrate the activity rules.`;
  activity = { ...activity, comments: [...activity.comments, { id: `added-${timestamp}`, postId: $('#scenario-post').value, authorId, authorRole, createdAt, body }] };
  saveActivity(); render(); announce(`Example reply added by ${authorNames[authorId]}. Activity indicators updated.`);
});
$('#reset-demo').addEventListener('click', () => {
  activity = cleanActivityState({}, posts.map(p => p.id));
  favorites = new Set(); viewer = { ...demoViewer }; $('#viewer-role').value = 'member';
  filters = { ...defaultFilters }; syncControls();
  writePreference(storage, FAVORITE_KEY, []); saveActivity();
  location.hash = '/browse'; route = { kind: 'browse', id: null }; render();
  announce('Demo reset to the initial fictional activity.');
});
window.addEventListener('hashchange', routeFromHash);
syncControls(); routeFromHash();
