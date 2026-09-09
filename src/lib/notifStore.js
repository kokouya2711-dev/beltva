// Shared timeline notification unread count store (pull-based, single poller).
import { base44 } from "@/api/base44Client";

let count = 0;
let meId = null;
let listeners = new Set();
let pollTimer = null;
let eventAdded = false;

export function initNotifStore(id) {
  if (!id) return;
  if (id === meId && pollTimer) return;
  meId = id;
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(poll, 60000);
  poll();
  if (!eventAdded) {
    window.addEventListener("notifications-changed", poll);
    eventAdded = true;
  }
}

async function poll() {
  if (!meId) return;
  const ns = await base44.entities.Notification.filter({ user_id: meId }, "-created_date", 30).catch(() => []);
  const nc = ns.filter(n => !n.read).length;
  if (nc !== count) {
    count = nc;
    listeners.forEach(fn => fn(count));
  }
}

export function subscribeNotif(fn) {
  listeners.add(fn);
  fn(count);
  return () => listeners.delete(fn);
}

export function getNotifCount() { return count; }

export async function markAllNotifRead() {
  if (!meId) return;
  const ns = await base44.entities.Notification.filter({ user_id: meId, read: false }, "-created_date", 100).catch(() => []);
  if (ns.length) {
    await base44.entities.Notification.bulkUpdate(ns.map(n => ({ id: n.id, read: true }))).catch(() => {});
  }
  count = 0;
  listeners.forEach(fn => fn(0));
  window.dispatchEvent(new CustomEvent("notifications-changed"));
}