import { base44 } from "@/api/base44Client";

export function displayName(user) {
  if (!user) return "匿名";
  return user.display_name || user.full_name || (user.email && user.email.split("@")[0]) || "匿名";
}

export function flagEmoji(code) {
  if (!code || code.length !== 2) return "";
  const cc = code.toUpperCase();
  return String.fromCodePoint(...[...cc].map((c) => 127397 + c.charCodeAt(0)));
}

// All world countries (ISO 3166-1 alpha-2).
// The `name` field is a fallback; the UI uses Intl.DisplayNames for localized names.
export const COUNTRIES = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" }, { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" }, { code: "AO", name: "Angola" }, { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" }, { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" }, { code: "AZ", name: "Azerbaijan" }, { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" }, { code: "BD", name: "Bangladesh" }, { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" }, { code: "BE", name: "Belgium" }, { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" }, { code: "BT", name: "Bhutan" }, { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" }, { code: "BW", name: "Botswana" }, { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" }, { code: "BG", name: "Bulgaria" }, { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" }, { code: "KH", name: "Cambodia" }, { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" }, { code: "CV", name: "Cape Verde" }, { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" }, { code: "CL", name: "Chile" }, { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" }, { code: "KM", name: "Comoros" }, { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo (DRC)" }, { code: "CR", name: "Costa Rica" }, { code: "CI", name: "Côte d'Ivoire" },
  { code: "HR", name: "Croatia" }, { code: "CU", name: "Cuba" }, { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" }, { code: "DK", name: "Denmark" }, { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" }, { code: "DO", name: "Dominican Republic" }, { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" }, { code: "SV", name: "El Salvador" }, { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" }, { code: "EE", name: "Estonia" }, { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" }, { code: "FJ", name: "Fiji" }, { code: "FI", name: "Finland" },
  { code: "FR", name: "France" }, { code: "GA", name: "Gabon" }, { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" }, { code: "DE", name: "Germany" }, { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" }, { code: "GD", name: "Grenada" }, { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" }, { code: "GW", name: "Guinea-Bissau" }, { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" }, { code: "HN", name: "Honduras" }, { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" }, { code: "IS", name: "Iceland" }, { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" }, { code: "IR", name: "Iran" }, { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" }, { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" }, { code: "JP", name: "Japan" }, { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" }, { code: "KE", name: "Kenya" }, { code: "KI", name: "Kiribati" },
  { code: "KP", name: "North Korea" }, { code: "KR", name: "South Korea" }, { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" }, { code: "LA", name: "Laos" }, { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" }, { code: "LS", name: "Lesotho" }, { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" }, { code: "LI", name: "Liechtenstein" }, { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" }, { code: "MO", name: "Macao" }, { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" }, { code: "MY", name: "Malaysia" }, { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" }, { code: "MT", name: "Malta" }, { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" }, { code: "MX", name: "Mexico" }, { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" }, { code: "MC", name: "Monaco" }, { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" }, { code: "MA", name: "Morocco" }, { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" }, { code: "NA", name: "Namibia" }, { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" }, { code: "NL", name: "Netherlands" }, { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" }, { code: "NE", name: "Niger" }, { code: "NG", name: "Nigeria" },
  { code: "MK", name: "North Macedonia" }, { code: "NO", name: "Norway" }, { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" }, { code: "PW", name: "Palau" }, { code: "PS", name: "Palestine" },
  { code: "PA", name: "Panama" }, { code: "PG", name: "Papua New Guinea" }, { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" }, { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" }, { code: "QA", name: "Qatar" }, { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" }, { code: "RW", name: "Rwanda" }, { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" }, { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" }, { code: "SM", name: "San Marino" }, { code: "ST", name: "São Tomé and Príncipe" },
  { code: "SA", name: "Saudi Arabia" }, { code: "SN", name: "Senegal" }, { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" }, { code: "SL", name: "Sierra Leone" }, { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" }, { code: "SI", name: "Slovenia" }, { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" }, { code: "ZA", name: "South Africa" }, { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" }, { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" }, { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" }, { code: "TW", name: "Taiwan" }, { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" }, { code: "TH", name: "Thailand" }, { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" }, { code: "TO", name: "Tonga" }, { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" }, { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" }, { code: "UG", name: "Uganda" }, { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" }, { code: "VA", name: "Vatican City" }, { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" }, { code: "YE", name: "Yemen" }, { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" }
];

const BODYWEIGHT_TYPES = ["腕立て伏せ", "懸垂", "プランク"];

export function computePRs(records) {
  const byType = {};
  records.forEach((r) => {
    if (!r.workout_type) return;
    if (!byType[r.workout_type]) byType[r.workout_type] = [];
    byType[r.workout_type].push(r);
  });
  const prs = [];
  Object.keys(byType).forEach((t) => {
    const recs = byType[t];
    const hasWeight = recs.some((r) => Number(r.weight) > 0);
    let value, unit;
    if (hasWeight) {
      value = Math.max(...recs.map((r) => Number(r.weight) || 0));
      unit = "kg";
    } else if (t === "プランク") {
      value = Math.max(...recs.map((r) => Number(r.duration_sec) || 0));
      unit = "秒";
    } else {
      value = Math.max(...recs.map((r) => Number(r.reps) || 0));
      unit = "回";
    }
    prs.push({ workout_type: t, value, unit });
  });
  return prs.sort((a, b) => b.value - a.value);
}

export function computeStreak(records) {
  if (!records.length) return 0;
  const days = new Set();
  records.forEach((r) => {
    if (!r.created_date) return;
    const d = new Date(r.created_date);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });
  const ts = [...days].map((s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m, d).getTime();
  }).sort((a, b) => b - a);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();
  let cursor;
  if (ts[0] === todayTs) cursor = todayTs;
  else if (ts[0] === todayTs - 86400000) cursor = todayTs - 86400000;
  else return 0;
  let streak = 0;
  for (const t of ts) {
    if (t === cursor) { streak++; cursor -= 86400000; }
    else if (t < cursor) break;
  }
  return streak;
}

export function computeStats(records) {
  return {
    sessions: records.length,
    totalSeconds: records.reduce((s, r) => s + (Number(r.duration_sec) || 0), 0),
    streak: computeStreak(records),
    prs: computePRs(records)
  };
}

export function formatDuration(sec, t) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (t) {
    if (h > 0) return t("dur.hms").replace("{h}", h).replace("{m}", m).replace("{s}", 0);
    if (m > 0) return t("dur.ms").replace("{m}", m);
    return t("dur.s").replace("{s}", sec);
  }
  if (h > 0) return `${h}時間${m}分`;
  if (m > 0) return `${m}分`;
  return `${sec}秒`;
}

const _userCache = new Map();

export async function fetchUser(id) {
  if (!id) return null;
  if (_userCache.has(id)) return _userCache.get(id);
  try {
    const u = await base44.entities.User.get(id);
    _userCache.set(id, u);
    return u;
  } catch {
    try {
      const recs = await base44.entities.WorkoutRecord.filter({ created_by_id: id }, "-created_date", 1);
      if (recs[0]?.created_by) { _userCache.set(id, recs[0].created_by); return recs[0].created_by; }
    } catch {}
    try {
      const ps = await base44.entities.Post.filter({ created_by_id: id }, "-created_date", 1);
      if (ps[0]?.created_by) { _userCache.set(id, ps[0].created_by); return ps[0].created_by; }
    } catch {}
    _userCache.set(id, null);
    return null;
  }
}