import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.email) return Response.json({ error: 'no_email', message: 'メールアドレスが登録されていません' }, { status: 400 });

    const body = await req.json();
    const action = body.action;

    // --- 認証コード送信 ---
    if (action === 'send_code') {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // 前の未使用コードを無効化
      const existing = await base44.asServiceRole.entities.DeletionCode.filter({ user_id: user.id, used: false });
      for (const c of existing) {
        await base44.asServiceRole.entities.DeletionCode.update(c.id, { used: true });
      }

      // 新しいコードを保存
      await base44.asServiceRole.entities.DeletionCode.create({
        user_id: user.id,
        code,
        expires_at: expiresAt,
        used: false,
        attempts: 0,
      });

      // メール送信
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: 'BELTVA 認証コード',
        body: `BELTVA アカウント削除の本人確認コードです。\n\n認証コード: ${code}\n\nこのコードは10分間有効です。本人以外には共有しないでください。`,
      });

      return Response.json({ ok: true });
    }

    // --- 認証コード検証 ---
    if (action === 'verify_code') {
      const code = String(body.code || '').trim();
      if (!code) return Response.json({ error: 'empty', message: '認証コードを入力してください' }, { status: 400 });

      const codes = await base44.asServiceRole.entities.DeletionCode.filter(
        { user_id: user.id, used: false },
        '-created_date',
        1
      );

      if (!codes.length) {
        return Response.json({ error: 'no_code', message: '認証コードを送信してください' }, { status: 400 });
      }

      const record = codes[0];

      // 期限切れチェック
      if (new Date(record.expires_at) < new Date()) {
        await base44.asServiceRole.entities.DeletionCode.update(record.id, { used: true });
        return Response.json({ error: 'expired', message: '認証コードの有効期限が切れました' }, { status: 400 });
      }

      // 試行回数チェック
      if ((record.attempts || 0) >= 5) {
        await base44.asServiceRole.entities.DeletionCode.update(record.id, { used: true });
        return Response.json({ error: 'too_many', message: '試行回数が上限に達しました' }, { status: 400 });
      }

      // コード照合
      if (record.code !== code) {
        await base44.asServiceRole.entities.DeletionCode.update(record.id, { attempts: (record.attempts || 0) + 1 });
        const left = 5 - ((record.attempts || 0) + 1);
        return Response.json({ error: 'wrong', message: '認証コードが正しくありません', attempts_left: left }, { status: 400 });
      }

      // 認証成功
      await base44.asServiceRole.entities.DeletionCode.update(record.id, {
        used: true,
        verified_at: new Date().toISOString(),
      });

      return Response.json({ ok: true, verified: true });
    }

    // --- 削除申請送信 ---
    if (action === 'submit_deletion') {
      // 10分以内に認証済みのコードがあるか確認
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const codes = await base44.asServiceRole.entities.DeletionCode.filter({ user_id: user.id, used: true });
      const recentlyVerified = codes.find((c) => c.verified_at && c.verified_at > tenMinAgo);

      if (!recentlyVerified) {
        return Response.json({ error: 'not_verified', message: '本人確認が完了していません' }, { status: 403 });
      }

      // ユーザーに削除申請フラグを設定 + プロフィール非公開化
      await base44.auth.updateMe({
        deletion_requested: true,
        deletion_requested_at: new Date().toISOString(),
        timeline_visibility: 'private',
        searchable_by: 'none',
        show_online_status: false,
        share_country: false,
      });

      return Response.json({ ok: true });
    }

    return Response.json({ error: 'invalid_action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}