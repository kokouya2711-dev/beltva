// Module-level store for comment count updates across page navigations.
// PostDetail writes here when a comment is added; PostCard reads on mount.
const updates = {};

export function setCommentCountUpdate(postId, count) {
  updates[postId] = count;
}

export function getCommentCountUpdate(postId) {
  const v = updates[postId];
  return v !== undefined ? v : null;
}

export function clearCommentCountUpdate(postId) {
  delete updates[postId];
}