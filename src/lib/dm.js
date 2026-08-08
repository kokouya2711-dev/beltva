import { base44 } from "@/api/base44Client";

export function canonicalIds(id1, id2) {
  return id1 < id2 ? { a: id1, b: id2 } : { a: id2, b: id1 };
}

export async function getConversation(meId, otherId) {
  const { a, b } = canonicalIds(meId, otherId);
  const existing = await base44.entities.Conversation.filter({ a_id: a, b_id: b });
  return existing[0] || null;
}

export async function getOrCreateConversation(meId, otherId) {
  let conv = await getConversation(meId, otherId);
  if (conv) return conv;
  const { a, b } = canonicalIds(meId, otherId);
  conv = await base44.entities.Conversation.create({
    a_id: a, b_id: b, status: "active", requester_id: meId,
    last_message: "", last_message_at: new Date().toISOString(), last_sender_id: meId
  });
  return conv;
}

// Check whether `me` is allowed to start a DM with `otherUser`, per the
// recipient's dm_scope setting. Returns { ok, message }.
export async function checkDmScope(meId, otherUser) {
  if (!otherUser || otherUser.id === meId) return { ok: true };
  const scope = otherUser.dm_scope || "everyone";
  if (scope === "none") return { ok: false, message: "dm.blocked" };
  if (scope === "followings") {
    const f = await base44.entities.Follow.filter({ follower_id: otherUser.id, followee_id: meId });
    if (!f.length) return { ok: false, message: "dm.followingsOnly" };
  }
  return { ok: true };
}

export async function sendMessage(conv, meId, { content, image_url }) {
  const msg = await base44.entities.Message.create({
    conversation_id: conv.id, sender_id: meId,
    content: content || "", image_url: image_url || "", reactions: "[]"
  });
  const updates = {
    last_message: image_url ? "dm.imageMessage" : (content || ""),
    last_message_at: new Date().toISOString(),
    last_sender_id: meId
  };
  if (conv.status === "requested" && conv.requester_id !== meId) updates.status = "active";
  const myField = meId === conv.a_id ? "a_read_at" : "b_read_at";
  updates[myField] = new Date().toISOString();
  await base44.entities.Conversation.update(conv.id, updates);
  const otherId = meId === conv.a_id ? conv.b_id : conv.a_id;
  notify(otherId, meId, "dm", image_url ? "dm.imageSent" : (content || ""), conv.id);
  return { msg, conv: { ...conv, ...updates } };
}

export async function acceptRequest(conv, meId) {
  const myField = meId === conv.a_id ? "a_read_at" : "b_read_at";
  return base44.entities.Conversation.update(conv.id, { status: "active", [myField]: new Date().toISOString() });
}

export async function declineRequest(conv) {
  const msgs = await base44.entities.Message.filter({ conversation_id: conv.id });
  for (const m of msgs) await base44.entities.Message.delete(m.id);
  await base44.entities.Conversation.delete(conv.id);
}

export async function blockUser(meId, otherId) {
  const ex = await base44.entities.Block.filter({ blocker_id: meId, blocked_id: otherId });
  if (!ex.length) await base44.entities.Block.create({ blocker_id: meId, blocked_id: otherId });
}
export async function unblockUser(meId, otherId) {
  const ex = await base44.entities.Block.filter({ blocker_id: meId, blocked_id: otherId });
  for (const b of ex) await base44.entities.Block.delete(b.id);
}
export async function blockExists(meId, otherId) {
  const [a, b] = await Promise.all([
    base44.entities.Block.filter({ blocker_id: meId, blocked_id: otherId }),
    base44.entities.Block.filter({ blocker_id: otherId, blocked_id: meId })
  ]);
  return a.length > 0 || b.length > 0;
}
export async function muteUser(meId, otherId) {
  const ex = await base44.entities.Mute.filter({ muter_id: meId, muted_id: otherId });
  if (!ex.length) await base44.entities.Mute.create({ muter_id: meId, muted_id: otherId });
}
export async function unmuteUser(meId, otherId) {
  const ex = await base44.entities.Mute.filter({ muter_id: meId, muted_id: otherId });
  for (const m of ex) await base44.entities.Mute.delete(m.id);
}
export async function isMuted(meId, otherId) {
  const ex = await base44.entities.Mute.filter({ muter_id: meId, muted_id: otherId });
  return ex.length > 0;
}
export async function reportUser(meId, otherId, reason) {
  await base44.entities.Report.create({ reporter_id: meId, reported_id: otherId, reason, target_type: "user", target_id: otherId });
}

export async function updatePresence(meId, isTraining = false) {
  if (!meId) return;
  const ex = await base44.entities.Presence.filter({ created_by_id: meId });
  const now = new Date().toISOString();
  if (ex.length > 0) {
    await Promise.all(ex.map(r => base44.entities.Presence.update(r.id, { last_seen: now, is_training: isTraining })));
  } else {
    await base44.entities.Presence.create({ last_seen: now, is_training: isTraining });
  }
}

export async function notify(userId, actorId, type, text, targetId) {
  if (!userId || userId === actorId) return;
  const [bl, mt, user] = await Promise.all([
    base44.entities.Block.filter({ blocker_id: userId, blocked_id: actorId }),
    base44.entities.Mute.filter({ muter_id: userId, muted_id: actorId }),
    base44.entities.User.get(userId).catch(() => null)
  ]);
  if (bl.length || mt.length) return;
  let prefs = { dm: true, follow: true, comment: true };
  if (user?.notif_prefs) { try { prefs = { ...prefs, ...JSON.parse(user.notif_prefs) }; } catch {} }
  const key = type === "dm" ? "dm" : type === "follow" ? "follow" : "comment";
  if (prefs[key] === false) return;
  base44.entities.Notification.create({ user_id: userId, type, actor_id: actorId, text, read: false, target_id: targetId, target_type: type }).catch(() => {});
}

export function parseReactions(s) {
  try { return JSON.parse(s || "[]"); } catch { return []; }
}
export function groupReactions(reactions) {
  const g = {};
  reactions.forEach((r) => { g[r.emoji] = (g[r.emoji] || 0) + 1; });
  return g;
}
export async function toggleReaction(message, meId, emoji) {
  const reactions = parseReactions(message.reactions);
  const idx = reactions.findIndex((r) => r.user_id === meId && r.emoji === emoji);
  let next;
  if (idx >= 0) next = reactions.filter((_, i) => i !== idx);
  else next = [...reactions, { user_id: meId, emoji }];
  await base44.entities.Message.update(message.id, { reactions: JSON.stringify(next) });
  return next;
}