/** Pure functions shared by the browser interface and Node's built-in test runner. */
export const defaultFilters = Object.freeze({
  type: 'all', audience: 'all', query: '', favoritesOnly: false, sort: 'latest'
});
const validTypes = new Set(['all', 'article', 'discussion']);
const validAudiences = new Set(['all', 'customers', 'partners', 'teams']);

export function cleanFilters(input = {}) {
  return {
    type: validTypes.has(input.type) ? input.type : 'all',
    audience: validAudiences.has(input.audience) ? input.audience : 'all',
    query: typeof input.query === 'string' ? input.query.slice(0, 200) : '',
    favoritesOnly: input.favoritesOnly === true,
    sort: input.sort === 'az' ? 'az' : 'latest'
  };
}
export function filterResources(items, filters, favoriteIds = []) {
  const f = cleanFilters(filters);
  const needle = f.query.trim().toLocaleLowerCase('en-GB');
  const favorites = new Set(favoriteIds);
  return items.filter(item =>
    (f.type === 'all' || item.type === f.type) &&
    (f.audience === 'all' || item.audience === f.audience) &&
    (!f.favoritesOnly || favorites.has(item.id)) &&
    (!needle || [item.title, item.description, item.topic].some(text => text.toLocaleLowerCase('en-GB').includes(needle)))
  ).sort((a, b) => f.sort === 'az' ? a.title.localeCompare(b.title, 'en-GB') : b.date.localeCompare(a.date));
}
