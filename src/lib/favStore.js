// Global favorite state store — single source of truth per postId.
// Enables optimistic UI and real-time sync between feed, favorites tab, etc.
import { base44 } from "@/api/base44Client";

let meId = null;
let state = {};       // { [postId]: favId }
let listeners = new Set();
let initialized = false;
let initPromise = null;

export function initFavStore(id) {
  if (!id) return;
  if (id === meId && (initialized || initPromise)) return;
  if (id !== meId) {
    meId = id;
    state = {};
    listeners.clear();
    initialized = false;
    initPromise = null;
  }
  initPromise = loadAllFavs();
}

async function loadAllFavs() {
  if (!meId) return;
  const favs = await base44.entities.Favorite.filter({ created_by_id: meId }).catch(() => []);
  state = {};
  favs.forEach(f => { if (f.post_id) state[f.post_id] = f.id; });
  initialized = true;
  initPromise = null;
  notifyAll();
}

export function isFavStoreInitialized() { return initialized; }

export function getFavState(postId) {
  return state[postId] ?? null;
}

// Subscribe to changes for a specific post — fn receives favId (or null)
export function subscribeFavPost(postId, fn) {
  fn(getFavState(postId));
  const listener = () => fn(getFavState(postId));
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Subscribe to any favorite change — for screens that need to re-filter lists
export function subscribeFavUpdates(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyAll() {
  listeners.forEach(fn => fn());
}

// Optimistic toggle — updates state immediately, reverts on API failure
export async function toggleFav(postId) {
  if (!meId || !postId) return;
  const currentFavId = state[postId] ?? null;

  if (currentFavId) {
    delete state[postId];
    notifyAll();
    try {
      await base44.entities.Favorite.delete(currentFavId);
    } catch (err) {
      state[postId] = currentFavId;
      notifyAll();
      throw err;
    }
  } else {
    state[postId] = "pending";
    notifyAll();
    try {
      const rec = await base44.entities.Favorite.create({ post_id: postId });
      state[postId] = rec.id;
      notifyAll();
    } catch (err) {
      delete state[postId];
      notifyAll();
      throw err;
    }
  }
}