const THAI_DAYS = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];

export const REMINDER_MINUTES_BEFORE = 30;
export const REMINDER_WINDOW_MINUTES = 12;
export const DIGEST_HOUR_BANGKOK = 8;
export const DIGEST_MINUTE_WINDOW = 15;

const WEEKDAY_SHORT = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function getBangkokWeekdayIndex(date = new Date()) {
  const short = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Bangkok', weekday: 'short' }).format(date);
  return WEEKDAY_SHORT[short] ?? 0;
}

export function getTodayThaiDay(date = new Date()) {
  return THAI_DAYS[getBangkokWeekdayIndex(date)];
}

export function getBangkokDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(date);
}

export function getBangkokMinutesNow(date = new Date()) {
  const timeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function getBangkokHourMinute(date = new Date()) {
  const mins = getBangkokMinutesNow(date);
  return { hour: Math.floor(mins / 60), minute: mins % 60 };
}

export function parseAirTimeMinutes(timeStr) {
  if (!timeStr || timeStr === 'N/A') return null;
  const parts = String(timeStr).replace(':', '.').split('.');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) || 0;
  if (Number.isNaN(h) || h < 0 || h > 23) return null;
  return h * 60 + m;
}

export function isOnAirMovie(movie) {
  const status = (movie.status || '').toLowerCase();
  return status.includes('on air') || status.includes('standard');
}

export function isSchedulableMovie(movie) {
  if (!isOnAirMovie(movie)) return false;
  const day = (movie.air_day || '').trim();
  const time = parseAirTimeMinutes(movie.air_time);
  return day !== '' && day !== 'N/A' && time !== null;
}

export function getMovieNotifyKey(movie) {
  return `${movie.domain || 'GL'}_${movie.id}`;
}

export function getMoviesAiringToday(movies, date = new Date()) {
  const today = getTodayThaiDay(date);
  return movies
    .filter((m) => isSchedulableMovie(m) && m.air_day.trim() === today)
    .sort((a, b) => parseAirTimeMinutes(a.air_time) - parseAirTimeMinutes(b.air_time));
}

export function getUpcomingReminders(movies, date = new Date(), minutesBefore = REMINDER_MINUTES_BEFORE) {
  const today = getTodayThaiDay(date);
  const nowMinutes = getBangkokMinutesNow(date);

  return movies.filter((movie) => {
    if (!isSchedulableMovie(movie) || movie.air_day.trim() !== today) return false;
    const airMinutes = parseAirTimeMinutes(movie.air_time);
    const diff = airMinutes - nowMinutes;
    const minDiff = minutesBefore - REMINDER_WINDOW_MINUTES / 2;
    const maxDiff = minutesBefore + REMINDER_WINDOW_MINUTES / 2;
    return diff >= minDiff && diff <= maxDiff;
  });
}

export function shouldSendDailyDigest(date = new Date()) {
  const { hour, minute } = getBangkokHourMinute(date);
  return hour === DIGEST_HOUR_BANGKOK && minute < DIGEST_MINUTE_WINDOW;
}

export function formatBangkokDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatMovieLine(movie) {
  const time = movie.air_time || 'N/A';
  const platform = movie.platform && movie.platform !== 'N/A' ? movie.platform : '-';
  return `• <b>${time}</b> — ${escapeHtml(movie.title)} (${escapeHtml(platform)})`;
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildDailyDigestMessage(movies, date = new Date()) {
  const airingToday = getMoviesAiringToday(movies, date);
  const dateLabel = formatBangkokDateLabel(date);
  const todayThai = getTodayThaiDay(date);

  if (airingToday.length === 0) {
    return [
      `📅 <b>ตารางออนแอร์วันนี้</b>`,
      `🗓 ${dateLabel}`,
      '',
      `วัน${todayThai.replace('วัน', '')}นี้ไม่มีรายการ On Air ในตาราง`,
    ].join('\n');
  }

  const gl = airingToday.filter((m) => m.domain === 'GL');
  const bl = airingToday.filter((m) => m.domain === 'BL');
  const lines = [
    `📅 <b>ตารางออนแอร์วันนี้</b>`,
    `🗓 ${dateLabel}`,
    `📺 รวม <b>${airingToday.length}</b> เรื่อง`,
    '',
  ];

  if (gl.length > 0) {
    lines.push(`💗 <b>GL — ${gl.length} เรื่อง</b>`);
    gl.forEach((m) => lines.push(formatMovieLine(m)));
    lines.push('');
  }

  if (bl.length > 0) {
    lines.push(`💙 <b>BL — ${bl.length} เรื่อง</b>`);
    bl.forEach((m) => lines.push(formatMovieLine(m)));
    lines.push('');
  }

  lines.push('🔗 gl-showtime.vercel.app/schedule');
  return lines.join('\n').trim();
}

export function buildReminderMessage(movie, minutesBefore = REMINDER_MINUTES_BEFORE) {
  const domain = movie.domain || 'GL';
  const domainIcon = domain === 'BL' ? '💙' : '💗';
  const platform = movie.platform && movie.platform !== 'N/A' ? movie.platform : '-';

  return [
    `⏰ <b>ใกล้ถึงเวลาออนแอร์!</b> (อีก ~${minutesBefore} นาที)`,
    '',
    `${domainIcon} <b>${escapeHtml(movie.title)}</b>`,
    `📌 ${domain} | ${escapeHtml(platform)}`,
    `📺 ${escapeHtml(movie.air_day)} ${escapeHtml(movie.air_time)}`,
    movie.genre ? `🎭 ${escapeHtml(movie.genre)}` : null,
    '',
    '🔗 gl-showtime.vercel.app/schedule',
  ].filter(Boolean).join('\n');
}

export async function fetchScheduleMovies(supabaseUrl, supabaseKey) {
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };

  const [glRes, blRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/movies?select=*`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/movies_bl?select=*`, { headers }),
  ]);

  if (!glRes.ok || !blRes.ok) {
    throw new Error('Failed to fetch schedule data from Supabase');
  }

  const glData = await glRes.json();
  const blData = await blRes.json();

  const gl = Array.isArray(glData) ? glData.map((m) => ({ ...m, domain: 'GL' })) : [];
  const bl = Array.isArray(blData) ? blData.map((m) => ({ ...m, domain: 'BL' })) : [];

  return [...gl, ...bl];
}
