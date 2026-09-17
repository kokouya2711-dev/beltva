import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// ユーザーID(ハンドル)の一意性チェック
// クライアントは他ユーザーを参照できないためサービスロールで検索する
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const username = String(body?.username || '').trim().toLowerCase();

    if (!username) return Response.json({ available: false, reason: 'empty' });
    // 英数字・アンダースコア 3〜20文字 先頭は数字/アンダースコア不可
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return Response.json({ available: false, reason: 'invalid' });
    }
    if (/^[0-9_]/.test(username)) {
      return Response.json({ available: false, reason: 'invalid' });
    }

    const matches = await base44.asServiceRole.entities.User.filter({ username });
    const taken = matches.some((u: any) => u.id !== user.id);
    return Response.json({ available: !taken, reason: taken ? 'taken' : 'ok' });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}