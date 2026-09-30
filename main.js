import { resources, audiences } from './data.js';
import { defaultFilters, cleanFilters, filterResources } from './filters.js';

const FILTER_KEY = 'community-hub-demo.filters.v1';
const FAVORITE_KEY = 'community-hub-demo.favorites.v1';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; } // Private browsing or unavailable storage should not break the UI.
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Optional preference storage. */ }
}
let filters = cleanFilters({ ...defaultFilters, ...readStorage(FILTER_KEY, {}) });
let favorites = new Set((() => { const saved = readStorage(FAVORITE_KEY, []); return Array.isArray(saved) ? saved.filter(id => resources.some(r => r.id === id)) : []; })());

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text; // Avoid HTML injection from resource data.
  return node;
}
const displayDate = iso => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));

function createCard(item) {
  const card = el('article', 'resource-card');
  const icon = el('div', `resource-icon ${item.type}`, item.type === 'article' ? '▤' : '◌');
  icon.setAttribute('aria-hidden', 'true');
  const body = el('div', 'resource-body');
  const meta = el('div', 'resource-labels');
  meta.append(el('span', `type-tag ${item.type}`, item.type === 'article' ? 'HELP ARTICLE' : 'COMMUNITY POST'));
  meta.append(el('span', 'audience-tag', audiences[item.audience]));
  const heading = el('h3', '', item.title);
  const description = el('p', 'resource-description', item.description);
  const footer = el('div', 'resource-footer');
  footer.append(el('span', '', item.topic));
  footer.append(el('span', 'meta-divider', '•'));
  footer.append(el('span', '', displayDate(item.date)));
  footer.append(el('span', 'meta-divider', '•'));
  footer.append(el('span', '', item.type === 'article' ? `${item.minutes} min read` : `${item.replies} replies`));
  if (item.moderator) footer.append(el('span', 'moderator-tag', '✓ Moderator replied'));
  body.append(meta, heading, description, footer);
  const save = el('button', 'favorite-button', favorites.has(item.id) ? '★' : '☆');
  save.type = 'button';
  save.setAttribute('aria-label', `${favorites.has(item.id) ? 'Remove' : 'Add'} ${item.title} ${favorites.has(item.id) ? 'from' : 'to'} favourites`);
  save.setAttribute('aria-pressed', String(favorites.has(item.id)));
  save.title = 'Toggle favourite';
  save.addEventListener('click', () => {
    favorites.has(item.id) ? favorites.delete(item.id) : favorites.add(item.id);
    writeStorage(FAVORITE_KEY, [...favorites]);
    render();
  });
  card.append(icon, body, save);
  return card;
}
function render() {
  const matches = filterResources(resources, filters, [...favorites]);
  const list = $('#results-list');
  list.replaceChildren(...matches.map(createCard));
  $('#results-count').textContent = `${matches.length} ${matches.length === 1 ? 'resource' : 'resources'} found`;
  $('#no-results').hidden = matches.length > 0;
  $('#breadcrumb-current').textContent = audiences[filters.audience];
  writeStorage(FILTER_KEY, filters);
}
function updateFilters(patch) { filters = cleanFilters({ ...filters, ...patch }); render(); }
function syncControls() {
  $(`input[name="content-type"][value="${filters.type}"]`).checked = true;
  $(`input[name="audience"][value="${filters.audience}"]`).checked = true;
  $('#search-input').value = filters.query;
  $('#favorites-only').checked = filters.favoritesOnly;
  $('#sort-order').value = filters.sort;
}
function reset() { filters = { ...defaultFilters }; syncControls(); render(); }
$$('input[name="content-type"]').forEach(input => input.addEventListener('change', () => updateFilters({ type: input.value })));
$$('input[name="audience"]').forEach(input => input.addEventListener('change', () => updateFilters({ audience: input.value })));
$('#favorites-only').addEventListener('change', e => updateFilters({ favoritesOnly: e.target.checked }));
$('#sort-order').addEventListener('change', e => updateFilters({ sort: e.target.value }));
$('#search-form').addEventListener('submit', e => { e.preventDefault(); updateFilters({ query: $('#search-input').value }); });
$('#search-input').addEventListener('input', e => { if (!e.target.value) updateFilters({ query: '' }); });
$('#reset-filters').addEventListener('click', reset);
$('.empty-reset').addEventListener('click', reset);
syncControls();
render();
