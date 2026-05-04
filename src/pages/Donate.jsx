import { Link } from 'react-router-dom';
import { Heart, QrCode, MessageCircle } from 'lucide-react';

const Donate = () => {
  const promptpayId = "5140531208"; // 514-053-1208
  const lineOA = "@186utlil";

  return (
    <div className="static-page" style={{ paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Heart size={42} color="#ec4899" fill="#ec4899" />
          <h1 className="gl-title" style={{ margin: 0, fontSize: '2.8rem' }}>สนับสนุนเว็บไซต์</h1>
        </div>
        <p className="gl-desc" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          ขอบคุณที่ใช้บริการ GL SHOWTIME<br />
          การสนับสนุนของคุณช่วยให้เว็บไซต์ดำเนินต่อไปได้อย่างยั่งยืน
          เว็บไซต์นี้เปิดให้ได้ใช้งานแบบฟรีไม่คิดค่าใช้จ่ายแม้แต่บาทเดียว ที่ทำส่วนนี้ขึ้นมาก็เพื่อให้ทุกคนที่สนใจจะสนับสนุนสามารถสนับสนุนได้ที่ด้านล่างนี้เลยครับ
        </p>
      </div>

      <div className="glass-panel" style={{ maxWidth: '520px', margin: '0 auto', padding: '2.5rem' }}>
        {/* QR Code */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--pink-accent)', fontWeight: 'bold' }}>
            <QrCode size={28} style={{ display: 'inline-block', marginRight: '8px' }} />
            สแกน QR Code PromptPay
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '15px', 
            borderRadius: '16px', 
            display: 'inline-block',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={`https://promptpay.io/${promptpayId}`} 
              alt="PromptPay QR Code" 
              style={{ width: '260px', height: '260px', borderRadius: '12px' }}
            />
          </div>
          
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            ธนาคารกรุงไทย • 514-053-1208
          </p>
        </div>

        {/* ข้อมูลเพิ่มเติม */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
            สามารถโอนด้วยจำนวนเงินเท่าไหร่ก็ได้<br />
            ไม่ว่าจะ 10 บาท หรือ 1,000 บาท เราขอบคุณทุกบาททุกสตางค์
          </p>
        </div>

        {/* Line OA */}
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(236, 72, 153, 0.1)' }}>
          <MessageCircle size={32} color="#ec4899" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--pink-accent)' }}>ติดต่อ / แจ้งปัญหา / ข้อเสนอแนะ</h3>
          <a 
            href={`https://line.me/R/ti/p/${lineOA}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: 'var(--pink-accent)', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              textDecoration: 'none'
            }}
          >
            Line OA: <strong>{lineOA}</strong>
          </a>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/" className="btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
};

export default Donate;