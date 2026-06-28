export async function sendTelegramMessage(message, botToken, chatId) {
  if (!botToken || !chatId) {
    console.warn('Telegram: BOT_TOKEN or CHAT_ID is not configured');
    return { ok: false, reason: 'missing_config' };
  }

  if (!message || message.trim() === '') {
    console.warn('Telegram: empty message, skipped');
    return { ok: false, reason: 'empty_message' };
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Telegram API error:', err.description);
      return { ok: false, reason: err.description };
    }

    return { ok: true };
  } catch (error) {
    console.error('Telegram send failed:', error);
    return { ok: false, reason: error.message };
  }
}
