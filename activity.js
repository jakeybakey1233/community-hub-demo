/** Activity decisions are pure; navigating a folder or topic cannot mark a post read. */
export const BASELINE = Date.parse('2026-09-22T00:00:00Z');
export const demoViewer = Object.freeze({ id: 'demo-you', role: 'member' });
const stamp = value => typeof value === 'number' ? value : Date.parse(value);

export function latestActivity(post, comments) {
  return Math.max(stamp(post.createdAt), ...comments.filter(c => c.postId === post.id).map(c => stamp(c.createdAt)).filter(Number.isFinite));
}

export function isUnread(post, comments, viewer, readAt = BASELINE) {
  const replies = comments.filter(c => c.postId === post.id);
  // A reply by any moderator resolves the moderator queue for this demonstration.
  if (viewer.role === 'moderator' && replies.some(c => c.authorRole === 'moderator')) return false;
  const cutoff = Number.isFinite(stamp(readAt)) ? stamp(readAt) : BASELINE;
  const activity = [{ authorId: post.authorId, createdAt: post.createdAt }, ...replies];
  return activity.some(item => item.authorId !== viewer.id && stamp(item.createdAt) > cutoff);
}

export function unreadPostIds(posts, comments, state, viewer) {
  const reads = state.readByUser?.[viewer.id] ?? {};
  return new Set(posts.filter(post => isUnread(post, comments, viewer, reads[post.id] ?? BASELINE)).map(post => post.id));
}

export function markPostRead(state, post, comments, viewer) {
  const previous = state.readByUser?.[viewer.id]?.[post.id] ?? BASELINE;
  return { ...state, readByUser: { ...state.readByUser, [viewer.id]: {
    ...state.readByUser?.[viewer.id], [post.id]: Math.max(previous, latestActivity(post, comments))
  } } };
}

export function cleanActivityState(input, validPostIds) {
  const ids = new Set(validPostIds);
  const roles = new Set(['member', 'moderator']);
  const authors = new Set(['demo-you', 'demo-member', 'demo-moderator']);
  const comments = Array.isArray(input?.comments) ? input.comments.filter(c =>
    c && typeof c.id === 'string' && ids.has(c.postId) && authors.has(c.authorId) && roles.has(c.authorRole) &&
    typeof c.body === 'string' && c.body.length <= 1000 && Number.isFinite(Date.parse(c.createdAt))
  ).slice(-200).map(c => ({ id: c.id, postId: c.postId, authorId: c.authorId, authorRole: c.authorRole,
    body: c.body, createdAt: new Date(c.createdAt).toISOString() })) : [];
  const reads = input?.readByUser?.['demo-you'];
  const readByUser = { 'demo-you': {} };
  if (reads && typeof reads === 'object' && !Array.isArray(reads)) {
    for (const id of ids) if (Number.isFinite(reads[id]) && reads[id] >= BASELINE && reads[id] <= Date.now()) readByUser['demo-you'][id] = reads[id];
  }
  return { comments, readByUser };
}
