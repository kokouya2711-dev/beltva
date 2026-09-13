import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SUBJECTS = {
  request: '[BELTVA] リクエスト',
  bug: '[BELTVA] 不具合を報告',
  help: '[BELTVA] ヘルプ',
};

const SUPPORT_EMAIL = 'beltva.support@gmail.com';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, body } = await req.json();
    if (!type || !SUBJECTS[type]) return Response.json({ error: 'Invalid type' }, { status: 400 });
    if (typeof body !== 'string' || !body.trim()) return Response.json({ error: 'Empty body' }, { status: 400 });

    const subject = SUBJECTS[type];
    const fullBody = `${body}\n\n---\nユーザーID: ${user.id}\nメールアドレス: ${user.email || ''}`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: SUPPORT_EMAIL,
      subject,
      text: fullBody,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}