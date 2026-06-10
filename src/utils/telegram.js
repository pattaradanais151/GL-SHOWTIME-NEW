const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export const getClientIP = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("ไม่สามารถดึง IP ได้:", error);
        return 'ไม่ทราบ IP';
    }
};

const sendTelegramMessage = async (message) => {
    if (!BOT_TOKEN || !CHAT_ID) return;
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error("ส่งข้อความ Telegram ล้มเหลว:", error);
    }
};

export const notifyVisit = async (pageName) => {
    const ip = await getClientIP();
    const time = new Date().toLocaleString('th-TH');
    const text = `👀 <b>มีผู้เข้าชมเว็บไซต์!</b>\n📌 <b>หน้าเว็บ:</b> ${pageName}\n🌐 <b>IP Address:</b> ${ip}\n⏰ <b>เวลา:</b> ${time}`;
    await sendTelegramMessage(text);
};

export const notifyMovieAction = async (action, movieTitle, movieType, adminName) => {
    const ip = await getClientIP();
    const time = new Date().toLocaleString('th-TH');
    let icon = '📝';
    let actionText = 'อัปเดตข้อมูล';
    
    if (action === 'ADD') { icon = '✅'; actionText = 'เพิ่มข้อมูลหนังใหม่'; }
    if (action === 'EDIT') { icon = '✏️'; actionText = 'แก้ไขข้อมูลหนัง'; }
    if (action === 'DELETE') { icon = '🗑️'; actionText = 'ลบข้อมูลหนัง'; }

    const text = `${icon} <b>${actionText}</b>\n\n` +
                 `🎬 <b>ชื่อเรื่อง:</b> ${movieTitle}\n` +
                 `📌 <b>หมวดหมู่:</b> ${movieType}\n` + 
                 `👤 <b>ผู้ดำเนินการ:</b> ${adminName}\n` +
                 `🌐 <b>IP Address:</b> ${ip}\n` +
                 `⏰ <b>เวลา:</b> ${time}`;
                 
    await sendTelegramMessage(text);
};