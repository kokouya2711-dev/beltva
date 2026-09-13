import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const action = body.action;

    // --- 認証コード送信 ---
    if (action === 'send_code') {
      const newEmail = String(body.new_email || '').trim().toLowerCase();
      if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        return Response.json({ error: 'invalid_email', message: '有効なメールアドレスを入力してください' }, { status: 400 });
      }
      if (newEmail === user.email) {
        return Response.json({ error: 'same_email', message: '現在のメールアドレスと同じです' }, { status: 400 });
      }

      // 重複チェック
      const existing = await base44.asServiceRole.entities.User.filter({ email: newEmail });
      if (existing.length > 0) {
        return Response.json({ error: 'email_exists', message: 'このメールアドレスは既に使用されています' }, { status: 400 });
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // 前の未使用コードを無効化
      const prev = await base44.asServiceRole.entities.EmailChangeCode.filter({ user_id: user.id, used: false });
      for (const c of prev) {
        await base44.asServiceRole.entities.EmailChangeCode.update(c.id, { used: true });
      }

      await base44.asServiceRole.entities.EmailChangeCode.create({
        user_id: user.id,
        new_email: newEmail,
        code,
        expires_at: expiresAt,
        used: false,
        attempts: 0,
      });

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: newEmail,
        subject: 'BELTVA 認証コード',
        body: `BELTVA メールアドレス変更の認証コードです。\n\n認証コード: ${code}\n\nこのコードは10分間有効です。本人以外には共有しないでください。`,
      });

      return Response.json({ ok: true });
    }

    // --- 認証＆メールアドレス変更 ---
    if (action === 'verify_and_change') {
      const code = String(body.code || '').trim();
      if (!code) return Response.json({ error: 'empty', message: '認証コードを入力してください' }, { status: 400 });

      const codes = await base44.asServiceRole.entities.EmailChangeCode.filter(
        { user_id: user.id, used: false },
        '-created_date',
        1
      );

      if (!codes.length) {
        return Response.json({ error: 'no_code', message: '認証コードを送信してください' }, { status: 400 });
      }

      const record = codes[0];

      if (new Date(record.expires_at) < new Date()) {
        await base44.asServiceRole.entities.EmailChangeCode.update(record.id, { used: true });
        return Response.json({ error: 'expired', message: '認証コードの有効期限が切れました' }, { status: 400 });
      }

      if ((record.attempts || 0) >= 5) {
        await base44.asServiceRole.entities.EmailChangeCode.update(record.id, { used: true });
        return Response.json({ error: 'too_many', message: '試行回数が上限に達しました' }, { status: 400 });
      }

      if (record.code !== code) {
        await base44.asServiceRole.entities.EmailChangeCode.update(record.id, { attempts: (record.attempts || 0) + 1 });
        return Response.json({ error: 'wrong', message: '認証コードが正しくありません' }, { status: 400 });
      }

      // 最終重複チェック
      const existing = await base44.asServiceRole.entities.User.filter({ email: record.new_email });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.EmailChangeCode.update(record.id, { used: true });
        return Response.json({ error: 'email_exists', message: 'このメールアドレスは既に使用されています' }, { status: 400 });
      }

      // メールアドレス更新
      await base44.asServiceRole.entities.User.update(user.id, { email: record.new_email });

      await base44.asServiceRole.entities.EmailChangeCode.update(record.id, { used: true });

      return Response.json({ ok: true, new_email: record.new_email });
    }

    return Response.json({ error: 'invalid_action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}