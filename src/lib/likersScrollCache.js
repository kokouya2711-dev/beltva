// Module-level scroll position cache for likers page.
// Keyed by post ID so different posts don't collide.
const cache = new Map();

export function saveLikersScroll(postId, scrollPos) {
  cache.set(postId, scrollPos);
}

export function getLikersScroll(postId) {
  return cache.get(postId) || 0;
}