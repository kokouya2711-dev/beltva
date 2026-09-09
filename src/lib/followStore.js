// Global follow state store — single source of truth per userId.
// All FollowButton instances for the same targetId subscribe to the
// same entry, so toggling one instantly updates every other button
// (and the profile screen) for that user.
import { base44 } from "@/api/base44Client";

let meId = null;
let state = {};       // { [targetId]: { following: bool, recordId: string|null } }
let listeners = {};   // { [targetId]: Set<fn> }
let initialized = false;
let initPromise = null;

export function initFollowStore(id) {
  if (!id) return;
  if (id === meId && (initialized || initPromise)) return;
  if (id !== meId) {
    meId = id;
    state = {};
    listeners = {};
    initialized = false;
    initPromise = null;
  }
  initPromise = loadAllFollows();
}

async function loadAllFollows() {
  if (!meId) return;
  const follows = await base44.entities.Follow.filter({ follower_id: meId }, "-created_date", 500).catch(() => []);
  follows.forEach(f => {
    if (f.followee_id) {
      state[f.followee_id] = { following: true, recordId: f.id };
    }
  });
  initialized = true;
  initPromise = null;
  Object.keys(listeners).forEach(notifyListeners);
}

export function isFollowStoreInitialized() {
  return initialized;
}

export function getFollowState(targetId) {
  return state[targetId]?.following ?? false;
}

export function subscribeFollow(targetId, fn) {
  if (!listeners[targetId]) listeners[targetId] = new Set();
  listeners[targetId].add(fn);
  fn(getFollowState(targetId));
  return () => { listeners[targetId]?.delete(fn); };
}

function notifyListeners(targetId) {
  listeners[targetId]?.forEach(fn => fn(getFollowState(targetId)));
}

// Optimistic toggle — updates state immediately, reverts on API failure.
// Returns { following: bool } on success, throws on failure.
export async function toggleFollow(targetId) {
  if (!meId || !targetId || meId === targetId) return { following: false };
  const current = state[targetId]?.following ?? false;
  const prevRecordId = state[targetId]?.recordId ?? null;

  if (current) {
    // Unfollow
    state[targetId] = { following: false, recordId: null };
    notifyListeners(targetId);
    try {
      if (prevRecordId) await base44.entities.Follow.delete(prevRecordId);
      return { following: false };
    } catch (err) {
      state[targetId] = { following: true, recordId: prevRecordId };
      notifyListeners(targetId);
      throw err;
    }
  } else {
    // Follow
    state[targetId] = { following: true, recordId: null };
    notifyListeners(targetId);
    try {
      const rec = await base44.entities.Follow.create({ follower_id: meId, followee_id: targetId });
      state[targetId] = { following: true, recordId: rec.id };
      notifyListeners(targetId);
      return { following: true };
    } catch (err) {
      state[targetId] = { following: false, recordId: prevRecordId };
      notifyListeners(targetId);
      throw err;
    }
  }
}