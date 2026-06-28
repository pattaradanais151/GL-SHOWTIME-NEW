import {
  buildDailyDigestMessage,
  fetchScheduleMovies,
  getBangkokDateKey,
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
  const sent = { digest: false };

  try {
    // 1. ดึงข้อมูลหนังทั้งหมด
    const movies = await fetchScheduleMovies(supabaseUrl, supabaseKey);

    // 2. สร้างข้อความสรุปรายวัน (Daily Digest) และส่ง Telegram
    const digestKey = `digest_${getBangkokDateKey(now)}`;
    const message = buildDailyDigestMessage(movies, now);
    
    // ตรวจสอบว่ามีข้อความให้ส่งหรือไม่ (ป้องกันการส่งข้อความว่าง)
    if (message && message.trim() !== "") {
        const result = await sendTelegramMessage(message, botToken, chatId);
        sent.digest = result.ok;
        sent.digestKey = digestKey;
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