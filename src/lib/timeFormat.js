// ISO文字列をパース（タイムゾーン情報がない場合はUTCとして扱う）
function parseISO(iso) {
  if (!iso) return null;
  const s = String(iso).trim();
  if (s.endsWith("Z") || s.endsWith("z") || /[+-]\d{2}:?\d{2}$/.test(s)) {
    return new Date(s);
  }
  return new Date(s + "Z");
}

// 投稿一覧（タイムライン）用の相対時刻フォーマット
// 1分未満 → たった今
// 1〜59分 → ○分前
// 当日（1時間以上）→ ○時間前
// 昨日 → 昨日
// 昨日より前（同年）→ 月/日
// 前年以前 → 年/月/日
export function formatPostListTime(iso) {
  if (!iso) return "";
  const d = parseISO(iso);
  if (!d || isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return "";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffSec / 3600);

  if (diffSec < 60) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;

  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (isSameDay) return `${diffHour}時間前`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  if (isYesterday) return "昨日";
  if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}/${d.getDate()}`;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

// 投稿詳細・コメント用の時刻フォーマット
// 当日 → ○分前 / ○時間前（相対）
// 昨日 → 昨日 時:分
// 昨日より前（同年）→ 月/日 時:分
// 前年以前 → 年/月/日 時:分
export function formatAbsoluteTime(iso) {
  if (!iso) return "";
  const d = parseISO(iso);
  if (!d || isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffSec / 3600);
  const pad = (n) => String(n).padStart(2, "0");
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  // 当日は相対時刻
  if (diffMs >= 0 && diffSec < 60) return "たった今";
  if (diffMs >= 0 && diffMin < 60) return `${diffMin}分前`;

  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (isSameDay && diffMs >= 0) return `${diffHour}時間前`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  if (isYesterday) return `昨日 ${hm}`;
  if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}