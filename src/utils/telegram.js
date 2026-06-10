const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

console.log("Token:", BOT_TOKEN ? "มีค่า" : "ไม่มีค่า", "ChatID:", CHAT_ID);

// ดึง IP Address ของผู้ใช้
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

// ฟังก์ชันหลักสำหรับยิงข้อความเข้า Telegram
const sendTelegramMessage = async (message) => {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn("Telegram Bot Token หรือ Chat ID ไม่ได้ตั้งค่าไว้");
        return;
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    try {
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML' // ใช้ HTML เพื่อจัดฟอร์แมตตัวหนา/เอียงได้
            })
        });
    } catch (error) {
        console.error("ส่งข้อความ Telegram ล้มเหลว:", error);
    }
};

// แจ้งเตือนเมื่อมีคนเข้าชมเว็บไซต์
export const notifyVisit = async (pageName) => {
    const ip = await getClientIP();
    const time = new Date().toLocaleString('th-TH');
    
    const text = `👀 <b>มีผู้เข้าชมเว็บไซต์!</b>\n\n` +
                 `📌 <b>หน้าเว็บ:</b> ${pageName}\n` +
                 `🌐 <b>IP Address:</b> ${ip}\n` +
                 `⏰ <b>เวลา:</b> ${time}`;
                 
    await sendTelegramMessage(text);
};

// อัปเดตฟังก์ชันใน src/utils/telegram.js
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

// แจ้งเตือนเมื่อมีการ เพิ่ม/แก้ไข/ลบ หนัง
export const notifyMovieAction = async (action, movieTitle, movieType) => {
    const ip = await getClientIP();
    const time = new Date().toLocaleString('th-TH');
    
    let icon = '📝';
    let actionText = 'อัปเดตข้อมูล';
    
    if (action === 'ADD') { icon = '✅'; actionText = 'เพิ่มหนังใหม่'; }
    if (action === 'EDIT') { icon = '✏️'; actionText = 'แก้ไขข้อมูลหนัง'; }
    if (action === 'DELETE') { icon = '🗑️'; actionText = 'ลบหนัง'; }

    const text = `${icon} <b>${actionText}</b>\n\n` +
                 `🎬 <b>ชื่อเรื่อง:</b> ${movieTitle}\n` +
                 `หมวดหมู่:</b> ${movieType}\n` + // ระบุว่าเป็น GL หรือ BL
                 `🌐 <b>ดำเนินการโดย IP:</b> ${ip}\n` +
                 `⏰ <b>เวลา:</b> ${time}`;
                 
    await sendTelegramMessage(text);
};