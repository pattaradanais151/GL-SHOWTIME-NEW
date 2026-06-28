import {
  buildDailyDigestMessage,
  buildReminderMessage,
  fetchScheduleMovies,
  getBangkokDateKey,
  getMovieNotifyKey,
  getUpcomingReminders,
  shouldSendDailyDigest,
} from '../../lib/scheduleNotify.js';
import { sendTelegramMessage } from '../../lib/telegramSend.js';

function getEnv(name, fallbackName) {
  return process.env[name] || process.env[fallbackName] || '';
}

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return res.status(503).json({ error: 'CRON_SECRET is not configured' });
  }

  const auth = req.headers.authorization;
  if (auth !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
  const supabaseKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');
  const botToken = getEnv('TELEGRAM_BOT_TOKEN', 'VITE_TELEGRAM_BOT_TOKEN');
  const chatId = getEnv('TELEGRAM_CHAT_ID', 'VITE_TELEGRAM_CHAT_ID');

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase env not configured' });
  }

  const now = new Date();
  const sent = { digest: false, reminders: [] };

  try {
    const movies = await fetchScheduleMovies(supabaseUrl, supabaseKey);

    if (shouldSendDailyDigest(now)) {
      const digestKey = `digest_${getBangkokDateKey(now)}`;
      const message = buildDailyDigestMessage(movies, now);
      const result = await sendTelegramMessage(message, botToken, chatId);
      sent.digest = result.ok;
      sent.digestKey = digestKey;
    }

    const reminders = getUpcomingReminders(movies, now);
    for (const movie of reminders) {
      const message = buildReminderMessage(movie);
      const result = await sendTelegramMessage(message, botToken, chatId);
      if (result.ok) {
        sent.reminders.push(getMovieNotifyKey(movie));
      }
    }

    return res.status(200).json({
      ok: true,
      time: now.toISOString(),
      sent,
    });
  } catch (error) {
    console.error('schedule-notify cron error:', error);
    return res.status(500).json({ error: error.message });
  }
}
