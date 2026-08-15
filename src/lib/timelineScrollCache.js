// Module-level cache for timeline state + scroll position.
// Saves on unmount so returning from post detail restores the exact position.
let scrollY = 0;
let cachedData = null;

export function saveTimelineCache(data) {
  cachedData = data;
  scrollY = window.scrollY;
}

export function getTimelineCache() {
  return cachedData;
}

export function getTimelineScrollY() {
  return scrollY;
}

export function clearTimelineCache() {
  cachedData = null;
  scrollY = 0;
}