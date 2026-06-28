import { sendTelegramMessage } from '../lib/telegramSend.js';

function getEnv(name, fallbackName) {
  return process.env[name] || process.env[fallbackName] || '';
}

export default async function handler(req, res) {
  // รับเฉพาะ Method POST ที่ Sentry ยิงมา
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const data = req.body;
  const botToken = getEnv('TELEGRAM_BOT_TOKEN', 'VITE_TELEGRAM_BOT_TOKEN');
  const chatId = getEnv('TELEGRAM_CHAT_ID', 'VITE_TELEGRAM_CHAT_ID');

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Telegram env not configured' });
  }

  try {
    // ดึงข้อมูล Error ที่ Sentry ส่งมา
    const projectName = data.project_name || 'GL/BL Showtime';
    const errorMsg = data.message || data.culprit || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    const url = data.url || 'https://sentry.io';
    const level = data.level ? data.level.toUpperCase() : 'ERROR';

    // จัดรูปแบบข้อความแจ้งเตือนให้สวยงาม
    const message = `🚨 *Sentry Alert [${level}]*\n\n*โปรเจกต์:* ${projectName}\n*ปัญหาที่พบ:* ${errorMsg}\n\n[🔍 กดเพื่อดูรายละเอียดใน Sentry](${url})`;

    // ส่งเข้า Telegram
    await sendTelegramMessage(message, botToken, chatId);

    return res.status(200).json({ ok: true, message: 'Alert sent to Telegram' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}