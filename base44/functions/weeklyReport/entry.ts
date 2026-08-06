import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // Allow workflow (no user) and admin direct calls; block non-admins
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calendar-aligned week boundaries (Monday start)
    const now = new Date();
    const thisMonday = new Date(now);
    const dow = now.getDay();
    const daysFromMon = dow === 0 ? 6 : dow - 1;
    thisMonday.setDate(now.getDate() - daysFromMon);
    thisMonday.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisMonday);
    lastWeekStart.setDate(thisMonday.getDate() - 7);
    const prevWeekStart = new Date(thisMonday);
    prevWeekStart.setDate(thisMonday.getDate() - 14);

    // Fetch users and recent records
    const users = await base44.asServiceRole.entities.User.list("-created_date", 500);
    const allRecords = await base44.asServiceRole.entities.WorkoutRecord.list("-created_date", 1000);

    // Group by user, sum volume per week, count session days
    const stats: Record<string, { lastWeek: number; prevWeek: number; lastWeekDays: Set<string> }> = {};
    for (const r of allRecords) {
      const d = new Date(r.created_date);
      const uid = r.created_by_id;
      if (!stats[uid]) stats[uid] = { lastWeek: 0, prevWeek: 0, lastWeekDays: new Set() };
      const vol = Number(r.volume) || 0;
      if (d >= lastWeekStart && d < thisMonday) {
        stats[uid].lastWeek += vol;
        stats[uid].lastWeekDays.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
      } else if (d >= prevWeekStart && d < lastWeekStart) {
        stats[uid].prevWeek += vol;
      }
    }

    let created = 0;
    for (const u of users) {
      const s = stats[u.id];
      if (!s) continue;
      if (s.lastWeek === 0 && s.prevWeek === 0) continue;

      let text: string;
      if (s.prevWeek === 0) {
        text = `📊 週次レポート\n先週の総ボリューム: ${s.lastWeek.toLocaleString()}kg（${s.lastWeekDays.size}回）\n前週の記録なし — この調子で頑張りましょう！🔥`;
      } else {
        const rate = ((s.lastWeek - s.prevWeek) / s.prevWeek) * 100;
        const arrow = rate >= 0 ? "↑" : "↓";
        const emoji = rate >= 10 ? "🔥" : rate >= 0 ? "💪" : "⚠️";
        text = `📊 週次レポート\n先週の総ボリューム: ${s.lastWeek.toLocaleString()}kg（${s.lastWeekDays.size}回）\n前週比: ${arrow}${Math.abs(rate).toFixed(1)}% ${emoji}`;
      }

      await base44.asServiceRole.entities.Notification.create({
        user_id: u.id,
        type: "weekly_report",
        actor_id: u.id,
        text,
        target_type: "weekly_report",
      });
      created++;
    }

    return Response.json({ success: true, notificationsCreated: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}