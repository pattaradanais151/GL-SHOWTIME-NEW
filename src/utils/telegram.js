import {
    buildDailyDigestMessage,
    buildReminderMessage,
} from '../../lib/scheduleNotify.js';

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

// ดึง IP โดยมี fallback หลายตัว กรณี CSP บล็อก
export const getClientIP = async () => {
    const sources = [
        'https://api.ipify.org?format=json',
        'https://api4.my-ip.io/ip.json',
        'https://api.seeip.org/jsonip',
    ];

    for (const url of sources) {
        try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();
            // แต่ละ API ใช้ key ต่างกัน
            const ip = data.ip || data.IP || data.query;
            if (ip) return ip;
        } catch {
            // ลอง source ถัดไป
        }
    }
    return 'ไม่ทราบ IP';
};

const sendTelegramMessage = async (message) => {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn('Telegram: BOT_TOKEN หรือ CHAT_ID ยังไม่ถูกตั้งค่า');
        return;
    }

    // ป้องกัน message ว่าง
    if (!message || message.trim() === '') {
        console.warn('Telegram: ข้อความว่างเปล่า ไม่ส่ง');
        return;
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            console.error('Telegram API error:', err.description);
        }
    } catch (error) {
        console.error('ส่งข้อความ Telegram ล้มเหลว:', error);
    }
};

export const notifyVisit = async (pageName) => {
    const ip = await getClientIP();
    const time = new Date().toLocaleString('th-TH');
    const text = [
        `👀 <b>มีผู้เข้าชมเว็บไซต์!</b>`,
        `📌 <b>หน้าเว็บ:</b> ${pageName || 'ไม่ทราบ'}`,
        `🌐 <b>IP Address:</b> ${ip}`,
        `⏰ <b>เวลา:</b> ${time}`,
    ].join('\n');

    await sendTelegramMessage(text);
};

export const notifyMovieAction = async (action, movieTitle, movieType, adminName = 'ไม่ทราบ') => {
    const ip = await getClientIP();
    const time = new Date().toLocaleString('th-TH');

    const actionMap = {
        ADD:    { icon: '✅', label: 'เพิ่มข้อมูลหนังใหม่' },
        EDIT:   { icon: '✏️', label: 'แก้ไขข้อมูลหนัง' },
        DELETE: { icon: '🗑️', label: 'ลบข้อมูลหนัง' },
    };
    const { icon, label } = actionMap[action] ?? { icon: '📝', label: 'อัปเดตข้อมูล' };

    const text = [
        `${icon} <b>${label}</b>`,
        ``,
        `🎬 <b>ชื่อเรื่อง:</b> ${movieTitle || 'ไม่ทราบ'}`,
        `📌 <b>หมวดหมู่:</b> ${movieType || 'ไม่ทราบ'}`,
        `👤 <b>ผู้ดำเนินการ:</b> ${adminName}`,
        `🌐 <b>IP Address:</b> ${ip}`,
        `⏰ <b>เวลา:</b> ${time}`,
    ].join('\n');

    await sendTelegramMessage(text);
};

export const notifyScheduleDigest = async (movies) => {
    const message = buildDailyDigestMessage(movies);
    await sendTelegramMessage(message);
};

export const notifyScheduleReminder = async (movie) => {
    const message = buildReminderMessage(movie);
    await sendTelegramMessage(message);
};