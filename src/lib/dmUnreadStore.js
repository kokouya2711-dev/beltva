// Shared DM unread count store (pull-based, single poller).
import { base44 } from "@/api/base44Client";

let count = 0;
let meId = null;
let listeners = new Set();
let pollTimer = null;
let eventAdded = false;
let msgUnsub = null;

export function initDmUnreadStore(id) {
  if (!id) return;
  if (id === meId && pollTimer) return;
  meId = id;
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(poll, 60000);
  poll();
  if (!eventAdded) {
    window.addEventListener("dm-unread-changed", poll);
    eventAdded = true;
    // Real-time: subscribe to new messages so the badge updates instantly
    try {
      msgUnsub = base44.entities.Message.subscribe((event) => {
        if (event.type === "create" && event.data?.sender_id !== meId) {
          setTimeout(poll, 500); // slight delay for conversation update to propagate
        }
      });
    } catch {}
  }
}

async function poll() {
  if (!meId) return;
  const [asA, asB] = await Promise.all([
    base44.entities.Conversation.filter({ a_id: meId }, "-last_message_at", 200).catch(() => []),
    base44.entities.Conversation.filter({ b_id: meId }, "-last_message_at", 200).catch(() => [])
  ]);
  const map = {};
  [...asA, ...asB].forEach(c => { map[c.id] = c; });
  let unread = 0;
  for (const c of Object.values(map)) {
    if (c.last_sender_id === meId) continue;
    const myRead = c[c.a_id === meId ? "a_read_at" : "b_read_at"];
    if (c.last_message_at && (!myRead || new Date(c.last_message_at).getTime() > new Date(myRead).getTime())) {
      unread++;
    }
  }
  if (unread !== count) {
    count = unread;
    listeners.forEach(fn => fn(count));
  }
}

export function subscribeDmUnread(fn) {
  listeners.add(fn);
  fn(count);
  return () => listeners.delete(fn);
}

export function getDmUnreadCount() { return count; }