import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// DM push notification text templates for all 16 languages.
// The recipient's language setting determines which template is used.
const DM_PUSH_TEMPLATES = {
  ja: (name) => `${name}がメッセージを送信しました`,
  en: (name) => `${name} sent you a message.`,
  zh: (name) => `${name}给你发了一条消息`,
  "zh-TW": (name) => `${name}給你發了一則訊息`,
  ko: (name) => `${name}님이 메시지를 보냈습니다`,
  es: (name) => `${name} te envió un mensaje.`,
  fr: (name) => `${name} t'a envoyé un message.`,
  de: (name) => `${name} hat dir eine Nachricht gesendet.`,
  pt: (name) => `${name} te enviou uma mensagem.`,
  it: (name) => `${name} ti ha inviato un messaggio.`,
  ru: (name) => `${name} отправил вам сообщение`,
  vi: (name) => `${name} đã gửi bạn một tin nhắn`,
  id: (name) => `${name} mengirim kamu pesan.`,
  th: (name) => `${name} ส่งข้อความถึงคุณ`,
  hi: (name) => `${name} ने आपको संदेश भेजा`,
  ar: (name) => `${name} أرسل لك رسالة`,
  tr: (name) => `${name} sana bir mesaj gönderdi.`,
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { conversation_id, sender_id } = body;

    if (!conversation_id || !sender_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (sender_id !== user.id) {
      return Response.json({ error: 'Sender mismatch' }, { status: 403 });
    }

    // Get conversation to find recipient
    const conv = await base44.entities.Conversation.get(conversation_id).catch(() => null);
    if (!conv) return Response.json({ ok: true, message: 'Conversation not found' });

    const recipientId = conv.a_id === sender_id ? conv.b_id : conv.a_id;
    if (!recipientId) return Response.json({ ok: true });

    // Check block/mute — don't send push if recipient blocked/muted sender
    const [blocks, mutes] = await Promise.all([
      base44.entities.Block.filter({ blocker_id: recipientId, blocked_id: sender_id }).catch(() => []),
      base44.entities.Mute.filter({ muter_id: recipientId, muted_id: sender_id }).catch(() => [])
    ]);
    if (blocks.length || mutes.length) return Response.json({ ok: true, message: 'Blocked or muted' });

    // Get recipient and sender user records
    const [recipient, sender] = await Promise.all([
      base44.entities.User.get(recipientId).catch(() => null),
      base44.entities.User.get(sender_id).catch(() => null)
    ]);
    if (!recipient) return Response.json({ ok: true, message: 'Recipient not found' });

    // Check recipient's DM notification preference
    let prefs = { dm: true };
    if (recipient.notif_prefs) {
      try { prefs = { ...prefs, ...JSON.parse(recipient.notif_prefs) }; } catch {}
    }
    if (prefs.dm === false) return Response.json({ ok: true, message: 'DM notifications disabled' });

    // Format push text in recipient's language
    const senderName = sender?.display_name || (sender?.email ? sender.email.split('@')[0] : 'Someone');
    const lang = recipient.language || 'en';
    const template = DM_PUSH_TEMPLATES[lang] || DM_PUSH_TEMPLATES.en;
    const text = template(senderName);

    // Send push notification (server-side only)
    await base44.asServiceRole.integrations.Core.SendPushNotification({
      user_id: recipientId,
      title: 'BELTVA',
      content: text,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}