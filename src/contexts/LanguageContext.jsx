import React, { createContext, useState, useContext, useEffect } from 'react';

export const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'th');

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let result = translations[language];
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        // Fallback ไปภาษาไทยถ้าหาคำแปลไม่เจอ
        let fallback = translations['th'];
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) fallback = fallback[fk];
          else return key;
        }
        return fallback || key;
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const translations = {
  th: {
    nav: { home: "หน้าแรก", schedule: "ตารางออนแอร์", donate: "สนับสนุน", admin: "ADMIN", logout: "Logout" },
    day: { mon: "วันจันทร์", tue: "วันอังคาร", wed: "วันพุธ", thu: "วันพฤหัสบดี", fri: "วันศุกร์", sat: "วันเสาร์", sun: "วันอาทิตย์" },
    home: {
      subtitle: "คลังภาพยนตร์ GL & BL - อัปเดตล่าสุด",
      search: "ค้นหาชื่อภาพยนตร์...",
      all_genres: "All Genres",
      all_platforms: "All Platforms",
      status_all: "ทั้งหมด",
      status_ended: "Ended (จบแล้ว)",
      status_onair: "On Air (กำลังออนแอร์)",
      status_soon: "Coming Soon (เร็วๆนี้)",
      loading: "กำลังโหลดข้อมูล...",
      no_data: "ไม่พบข้อมูลภาพยนตร์ที่คุณค้นหา",
      no_title: "ไม่มีชื่อเรื่อง",
      details: "รายละเอียด",
      director: "ผู้กำกับ:",
      release_date: "วันฉาย:",
      air_day: "วันออนแอร์:",
      air_time: "เวลาออนแอร์:",
      synopsis: "เรื่องย่อ / Note",
      no_synopsis: "ยังไม่มีคำอธิบายสำหรับเรื่องนี้",
      close: "ปิดหน้าต่าง"
    },
    schedule: {
      subtitle: "Weekly Schedule",
      title: "ตารางออนแอร์",
      desc: "ตารางฉายประจำสัปดาห์ — GL & BL Collection",
      all: "ทั้งหมด",
      loading: "กำลังโหลดตารางออนแอร์...",
      no_data: "ยังไม่มีรายการออนแอร์ในวันนี้",
      unknown_day: "❓ ยังไม่ทราบวันฉาย",
      movies_count: "เรื่อง",
      trailer: "ดูตัวอย่าง",
      admin_note: "ADMIN NOTE",
      notify_title: "แจ้งเตือน Telegram อัตโนมัติ",
      notify_desc: "ระบบจะส่งสรุปตารางวันนี้เวลา 08:00 น. และแจ้งเตือนก่อนออนแอร์ 30 นาที ไปยัง Telegram ของทีมงาน"
    },
    donate: {
      title: "สนับสนุนเว็บไซต์",
      desc1: "ขอบคุณที่ใช้บริการ SHOWTIME TH",
      desc2: "การสนับสนุนของคุณช่วยให้เว็บไซต์ดำเนินต่อไปได้อย่างยั่งยืน เว็บไซต์นี้เปิดให้ได้ใช้งานแบบฟรีไม่คิดค่าใช้จ่ายแม้แต่บาทเดียว ที่ทำส่วนนี้ขึ้นมาก็เพื่อให้คนที่สนใจจะสนับสนุนผู้พัฒนาเว็บไซต์สามารถสนับสนุนได้ที่ด้านล่างนี้เลยครับ/ค่ะ",
      bank_transfer: "โอนเงินผ่านบัญชีธนาคาร",
      copy: "คัดลอกเลขบัญชี",
      copied: "คัดลอกเลขบัญชีแล้ว!",
      any_amount1: "สามารถโอนด้วยจำนวนเงินเท่าไหร่ก็ได้",
      any_amount2: "ไม่ว่าจะ 10 บาท หรือ 1,000 บาท เราขอบคุณทุกบาททุกสตางค์",
      contact: "ติดต่อ / แจ้งปัญหา / ข้อเสนอแนะ",
      back: "Back To Home"
    },
    license: {
      title: "License Agreement",
      subtitle: "ข้อตกลงการใช้งานและลิขสิทธิ์",
      h1: "1. ข้อกำหนดทั่วไป",
      p1: "SHOWTIME TH เป็นเพียงเว็บไซต์รวบรวมรายชื่อภาพยนตร์และซีรีส์ (Watchlist Catalog) สำหรับหมวดหมู่ Girl Love (GL) และ Boy Love (BL) เนื้อหาวิดีโอทั้งหมดถูกดึงมาจากแพลตฟอร์มสาธารณะที่อนุญาตให้ฝังโค้ด (Embed) หรือแชร์ลิงก์ได้",
      h2: "2. ทรัพย์สินทางปัญญาและลิขสิทธิ์",
      p2: "รูปภาพหน้าปก (Thumbnails) ที่ถูกดึงจาก YouTube วิดีโอตัวอย่าง ชื่อภาพยนตร์ และเนื้อหาที่เกี่ยวข้อง เป็นลิขสิทธิ์ของสตูดิโอ ผู้ผลิต หรือเจ้าของผลงานนั้นๆ เว็บไซต์นี้จัดทำขึ้นเพื่อการโปรโมท แนะนำ และรีวิวเท่านั้น ไม่มีเจตนาละเมิดลิขสิทธิ์ และไม่มีการแสวงหาผลกำไรเชิงพาณิชย์จากการละเมิดเนื้อหาใดๆ",
      h3: "3. สิทธิ์การใช้งานโค้ดและดีไซน์ (Software License)",
      p3: "โครงสร้างเว็บไซต์ (Source Code) ดีไซน์สไตล์ Liquid Glass และระบบจัดการ (Admin Panel) เป็นลิขสิทธิ์ของผู้พัฒนาเว็บไซต์นี้ ห้ามมิให้ผู้ใดนำโค้ดไปดัดแปลงเพื่อนำไปขายต่อโดยไม่ได้รับอนุญาต",
      h4: "4. ข้อจำกัดความรับผิดชอบ",
      p4: "ผู้จัดทำเว็บไซต์จะไม่รับผิดชอบต่อความสูญเสีย หรือความเสียหายใดๆ ที่เกิดขึ้นจากการใช้งานเว็บไซต์นี้ ไม่ว่าทางตรงหรือทางอ้อม ข้อมูลทั้งหมดจัดทำขึ้นตามความจริงที่ปรากฏในขณะนั้นและอาจมีการเปลี่ยนแปลงได้ตลอดเวลา"
    },
    privacy: {
      title: "Privacy Policy",
      subtitle: "นโยบายความเป็นส่วนตัว - อัปเดตล่าสุด: พฤษภาคม 2026",
      h1: "1. ข้อมูลที่เรารวบรวม",
      p1: "เว็บไซต์ SHOWTIME TH ไม่มีการเก็บรวบรวมข้อมูลส่วนบุคคลที่สามารถระบุตัวตนได้จากผู้เข้าชมทั่วไป (Guest) สำหรับผู้ดูแลระบบ (Admin) จะมีการเก็บรักษา Session ในเบราว์เซอร์เพื่อใช้ในการเข้าสู่ระบบเท่านั้น",
      h2: "2. การนำข้อมูลไปใช้งาน",
      p2: "ข้อมูลภาพยนตร์ ลิงก์ และรายละเอียดต่างๆ ถูกรวบรวมเพื่อการนำเสนอและจัดทำแคตตาล็อกเท่านั้น เราไม่ได้เป็นเจ้าของลิขสิทธิ์ของวิดีโอที่แสดงบนเว็บไซต์ และไม่มีการนำข้อมูลส่วนบุคคลไปขายหรือแจกจ่ายให้บุคคลที่สาม",
      h3: "3. คุกกี้ (Cookies) และ Local Storage",
      p3: "เว็บไซต์มีการใช้งาน Local Storage ในเบราว์เซอร์ของคุณเพื่อจดจำสถานะการเข้าสู่ระบบของผู้ดูแลระบบ และป้องกันการสุ่มรหัสผ่าน (Brute-force protection) เท่านั้น ไม่ได้ใช้เพื่อติดตามพฤติกรรมผู้ใช้ภายนอก",
      h4: "4. การเชื่อมโยงไปยังเว็บไซต์ภายนอก",
      p4: "เว็บไซต์นี้มีการเชื่อมโยงลิงก์ (Embed/Link) ไปยังแพลตฟอร์มภายนอก เช่น YouTube หรือแพลตฟอร์มสตรีมมิ่งอื่นๆ เราไม่มีส่วนรับผิดชอบต่อนโยบายความเป็นส่วนตัวหรือเนื้อหาของเว็บไซต์เหล่านั้น"
    }
  },
  en: {
    nav: { home: "Home", schedule: "Schedule", donate: "Donate", admin: "ADMIN", logout: "Logout" },
    day: { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" },
    home: {
      subtitle: "GL & BL COLLECTION - LATEST UPDATES",
      search: "Search movies...",
      all_genres: "All Genres",
      all_platforms: "All Platforms",
      status_all: "All",
      status_ended: "Ended",
      status_onair: "On Air",
      status_soon: "Coming Soon",
      loading: "Loading data...",
      no_data: "No movies found matching your search",
      no_title: "No Title",
      details: "Details",
      director: "Director:",
      release_date: "Release Date:",
      air_day: "Air Day:",
      air_time: "Air Time:",
      synopsis: "Synopsis / Note",
      no_synopsis: "No description available for this title.",
      close: "Close Window"
    },
    schedule: {
      subtitle: "Weekly Schedule",
      title: "Air Schedule",
      desc: "Weekly Broadcast Schedule — GL & BL Collection",
      all: "All",
      loading: "Loading schedule...",
      no_data: "No broadcasts scheduled for today",
      unknown_day: "❓ Unknown Air Date",
      movies_count: "Movies",
      trailer: "Watch Trailer",
      admin_note: "ADMIN NOTE",
      notify_title: "Automatic Telegram Alerts",
      notify_desc: "Daily schedule summary at 08:00 and a 30-minute pre-air reminder are sent to the team Telegram channel."
    },
    donate: {
      title: "Support Us",
      desc1: "Thank you for using SHOWTIME TH",
      desc2: "Your support helps keep this website running sustainably. The website is completely free to use. This section is created for those who wish to support the developer.",
      bank_transfer: "Bank Transfer",
      copy: "Copy Account Number",
      copied: "Copied!",
      any_amount1: "Any amount is highly appreciated",
      any_amount2: "Whether it's 10 THB or 1,000 THB, we thank you for every cent.",
      contact: "Contact / Report / Suggestions",
      back: "Back To Home"
    },
    license: {
      title: "License Agreement",
      subtitle: "Terms of Use and Copyright",
      h1: "1. General Terms",
      p1: "SHOWTIME TH is a watchlist catalog for the Girl Love (GL) and Boy Love (BL) categories. All video content is pulled from public platforms that allow embedding or link sharing.",
      h2: "2. Intellectual Property & Copyright",
      p2: "Thumbnails pulled from YouTube, trailers, movie titles, and related content are the copyright of their respective studios or owners. This website is for promotional and review purposes only. There is no intent to infringe copyright, nor do we seek commercial profit from any content.",
      h3: "3. Software License",
      p3: "The website source code, Liquid Glass design, and Admin Panel are copyrighted by the developer. Modifying the code for resale without permission is prohibited.",
      h4: "4. Disclaimer",
      p4: "The creators of this website are not liable for any direct or indirect losses or damages arising from its use. All information is provided as-is and may change at any time."
    },
    privacy: {
      title: "Privacy Policy",
      subtitle: "Privacy Policy - Last Updated: May 2026",
      h1: "1. Information We Collect",
      p1: "SHOWTIME TH does not collect personally identifiable information from general visitors (Guests). For administrators, a browser session is kept strictly for login purposes.",
      h2: "2. Use of Information",
      p2: "Movie data, links, and details are collected solely for catalog presentation. We do not own the copyright to the videos displayed and do not sell or distribute personal data to third parties.",
      h3: "3. Cookies and Local Storage",
      p3: "This site uses Local Storage in your browser to remember administrator login states and prevent brute-force attacks. It is not used to track external user behavior.",
      h4: "4. External Links",
      p4: "This website links to external platforms like YouTube or streaming services. We are not responsible for the privacy policies or content of those websites."
    }
  },
  ja: {
    nav: { home: "ホーム", schedule: "放送予定", donate: "サポート", admin: "管理", logout: "ログアウト" },
    day: { mon: "月曜日", tue: "火曜日", wed: "水曜日", thu: "木曜日", fri: "金曜日", sat: "土曜日", sun: "日曜日" },
    home: {
      subtitle: "GL & BL コレクション - 最新情報",
      search: "映画を検索...",
      all_genres: "すべてのジャンル",
      all_platforms: "すべてのプラットフォーム",
      status_all: "すべて",
      status_ended: "放送終了",
      status_onair: "放送中",
      status_soon: "まもなく放送",
      loading: "読み込み中...",
      no_data: "条件に一致する映画が見つかりません",
      no_title: "タイトルなし",
      details: "詳細",
      director: "監督:",
      release_date: "公開日:",
      air_day: "放送日:",
      air_time: "放送時間:",
      synopsis: "あらすじ / メモ",
      no_synopsis: "この作品の説明はまだありません。",
      close: "閉じる"
    },
    schedule: {
      subtitle: "Weekly Schedule",
      title: "放送スケジュール",
      desc: "週間放送スケジュール — GL & BL Collection",
      all: "すべて",
      loading: "スケジュールを読み込み中...",
      no_data: "今日の放送予定はありません",
      unknown_day: "❓ 放送日未定",
      movies_count: "作品",
      trailer: "予告編を見る",
      admin_note: "管理者メモ",
      notify_title: "Telegram 自動通知",
      notify_desc: "毎日 08:00 に本日のスケジュール概要、放送 30 分前にリマインダーを Telegram に送信します"
    },
    donate: {
      title: "ウェブサイトを支援",
      desc1: "SHOWTIME THをご利用いただきありがとうございます",
      desc2: "皆様のサポートがサイトの持続的な運営に繋がります。このサイトは完全無料でご利用いただけます。支援をご希望の方は下記よりお願いいたします。",
      bank_transfer: "銀行振込",
      copy: "口座番号をコピー",
      copied: "コピーしました！",
      any_amount1: "金額にかかわらず歓迎いたします",
      any_amount2: "10バーツでも1,000バーツでも、すべての支援に感謝します。",
      contact: "お問い合わせ / ご意見",
      back: "ホームに戻る"
    },
    license: {
      title: "利用規約 (License)",
      subtitle: "利用規約および著作権",
      h1: "1. 一般条項",
      p1: "SHOWTIME THはGirl Love (GL) および Boy Love (BL) カテゴリのウォッチリストカタログです。すべての動画コンテンツは埋め込み可能な公開プラットフォームから取得しています。",
      h2: "2. 知的財産権と著作権",
      p2: "YouTubeのサムネイル、予告編、タイトル等の著作権は各スタジオまたは所有者に帰属します。本サイトはプロモーション目的であり、著作権侵害の意図はありません。",
      h3: "3. ソフトウェアライセンス",
      p3: "本サイトのソースコード、デザイン、管理パネルの著作権は開発者に帰属します。無断での改変・転売を禁じます。",
      h4: "4. 免責事項",
      p4: "本サイトの利用により生じた直接的・間接的な損害について、開発者は一切の責任を負いません。"
    },
    privacy: {
      title: "プライバシーポリシー",
      subtitle: "最終更新: 2026年5月",
      h1: "1. 収集する情報",
      p1: "SHOWTIME THは一般の訪問者（ゲスト）から個人を特定できる情報を収集することはありません。管理者のみ、ログイン維持のためにセッションを保存します。",
      h2: "2. 情報の利用",
      p2: "映画データやリンクはカタログ提示のみに使用されます。第三者へ個人情報を販売・配布することはありません。",
      h3: "3. クッキーとローカルストレージ",
      p3: "管理者ログイン状態の記憶やブルートフォース攻撃防止のためのみにローカルストレージを使用します。",
      h4: "4. 外部リンク",
      p4: "YouTube等の外部プラットフォームへのリンクが含まれますが、リンク先のプライバシーポリシーについては責任を負いません。"
    }
  },
  lo: {
    nav: { home: "กาดหน้า", schedule: "ต๋ารางออนแอร์", donate: "อุดหนุนจุนเจือ", admin: "ADMIN", logout: "Logout" },
    day: { mon: "วันจั๋น", tue: "วันอังก๋าน", wed: "วันปุ๊ด", thu: "วันผัด", fri: "วันศุกร์", sat: "วันเสาร์", sun: "วันติ๊ด" },
    home: {
      subtitle: "คลังหนัง GL & BL - อัปเดตล่าสุด",
      search: "เซาะหาจื่อหนัง...",
      all_genres: "ตึงหมด",
      all_platforms: "กู้แพลตฟอร์ม",
      status_all: "ตึงหมด",
      status_ended: "จบไปละ",
      status_onair: "กะลังออนแอร์",
      status_soon: "แหมหน้อยมา",
      loading: "กะลังโหลดข้อมูลเน้อ...",
      no_data: "บ่ปะข้อมูลหนังตี้กึ๊ดหา",
      no_title: "บ่มีจื่อเรื่อง",
      details: "รายละเอียด",
      director: "ป้อกำกับ:",
      release_date: "วันฉาย:",
      air_day: "วันออนแอร์:",
      air_time: "เวลาออนแอร์:",
      synopsis: "เรื่องย่อ / Note",
      no_synopsis: "บ่มีคำอธิบายเตื้อเน้อ",
      close: "ปิดหน้าต่าง"
    },
    schedule: {
      subtitle: "Weekly Schedule",
      title: "ต๋ารางออนแอร์",
      desc: "ต๋ารางฉายกู้สัปดาห์ — GL & BL Collection",
      all: "ตึงหมด",
      loading: "กะลังโหลดต๋ารางเน้อ...",
      no_data: "บ่มีรายการออนแอร์วันนี้เน้อ",
      unknown_day: "❓ บะฮู้วันฉายเตื้อ",
      movies_count: "เรื่อง",
      trailer: "ผ่อตัวอย่าง",
      admin_note: "ADMIN NOTE",
      notify_title: "แจ้งเตือน Telegram อัตโนมัติ",
      notify_desc: "ระบบจะส่งสรุปต๋ารางวันนี้เวลา 08:00 โมง และแจ้งก่อนออนแอร์ 30 นาที ไป Telegram ทีมงาน"
    },
    donate: {
      title: "อุดหนุนเว็บไซต์",
      desc1: "ยินดีจ้าดนักตี้ใจ้บริการ SHOWTIME TH",
      desc2: "ก๋านอุดหนุนของท่านจ่วยหื้อเว็บอยู่เมินๆ เว็บนี้เปิ๊ดหื้อใจ้ฟรีบ่แปงซักบาท ตี้แป๋งส่วนนี้ขึ้นมาเพื่อหื้อคนตี้ไค่อุดหนุนคนแป๋งเว็บสามารถจ่วยเหลือได้ตางลุ่มนี้เลยจ้าว/ครับ",
      bank_transfer: "โอนเงินผ่านบัญชีธนาคาร",
      copy: "ก๊อปปี้เลขบัญชี",
      copied: "ก๊อปปี้แล้วเน้อ!",
      any_amount1: "โอนเต้าใดก็กึ๊ดดีจ้าดนัก",
      any_amount2: "บ่ว่าจะ 10 บาท กา 1,000 บาท เฮายินดีจ้าดนักกู้บาทกู้สตางค์",
      contact: "ติดต่อ / แจ้งปัญหา / แนะนำ",
      back: "ปิ๊กกาดหน้า"
    },
    license: {
      title: "ข้อตกลงก๋านใจ้งาน",
      subtitle: "ข้อตกลงก๋านใจ้งานและลิขสิทธิ์",
      h1: "1. ข้อกำหนดทั่วไป",
      p1: "SHOWTIME TH เป๋นก้าเว็บรวบรวมรายชื่อหนังและซีรีส์ สำหรับหมวดหมู่ Girl Love (GL) และ Boy Love (BL) เนื้อหาวิดีโอตึงหมดดึงมาจากแพลตฟอร์มสาธารณะตี้เปิ้นอนุญาตหื้อฝังโค้ดเน้อ",
      h2: "2. ทรัพย์สินทางปัญญาและลิขสิทธิ์",
      p2: "ฮูปหน้าปก ตี้ดึงจาก YouTube วิดีโอตั๋วอย่าง เป๋นลิขสิทธิ์ของเปิ้น เว็บนี้แป๋งขึ้นมาเพื่อแนะนำบ่าดาย บ่มีเจตนาละเมิดลิขสิทธิ์เน้อ",
      h3: "3. สิทธิ์ก๋านใจ้งานโค้ดและดีไซน์",
      p3: "โครงสร้างเว็บ ดีไซน์สไตล์ Liquid Glass เป๋นลิขสิทธิ์ของคนแป๋งเว็บ ห้ามเอาไปดัดแปลงขายต่อเด็ดขาด",
      h4: "4. ข้อจำกัดความรับผิดชอบ",
      p4: "คนแป๋งเว็บจะบ่ฮับผิดชอบต่อความสูญเสียใดๆ ตี้เกิดขึ้นจากก๋านใจ้งานเว็บนี้เน้อ"
    },
    privacy: {
      title: "นโยบายความเป็นส่วนตัว",
      subtitle: "อัปเดตล่าสุด: พฤษภาคม 2026",
      h1: "1. ข้อมูลตี้เฮาเก็บ",
      p1: "เว็บ SHOWTIME TH บ่เก็บข้อมูลส่วนตั๋วของคนเข้ามาผ่อ (Guest) สำหรับแอดมินเฮาจะเก็บ Session เพื่อเข้าสู่ระบบบ่าดาย",
      h2: "2. ก๋านนำข้อมูลไปใจ้งาน",
      p2: "ข้อมูลหนังและลิงก์ต่างๆ เฮาเก็บมาโชว์บ่าดาย เฮาบ่ได้เป๋นเจ้าของลิขสิทธิ์ และบ่เอาข้อมูลไปขายหื้อไผเน้อ",
      h3: "3. คุกกี้และ Local Storage",
      p3: "เว็บเฮาใจ้ Local Storage ในเบราว์เซอร์ของท่านเพื่อจ๋ำสถานะแอดมิน ป้องกันก๋านสุ่มรหัสผ่านบ่าดาย บ่ได้ใจ้ติดตามพฤติกรรมคนใจ้ภายนอก",
      h4: "4. ก๋านเชื่อมโยงไปเว็บอื่น",
      p4: "เว็บนี้มีลิงก์ไปเว็บอื่นอย่าง YouTube เฮาบ่ฮับผิดชอบต่อนโยบายความเป็นส่วนตัวของเว็บปู้นเน้อ"
    }
  }
};