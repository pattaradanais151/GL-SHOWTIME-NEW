import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Landmark, MessageCircle, Copy, CheckCircle } from 'lucide-react';

const Donate = () => {
  const bankAccount = "5140531208";
  const formattedAccount = "514-053-1208";
  const bankName = "ธนาคารกรุงไทย";
  const lineOA = "@186utlil";

  // State สำหรับจัดการสถานะการคัดลอก
  const [copied, setCopied] = useState(false);

  // ฟังก์ชันสำหรับคัดลอกเลขบัญชี
  const handleCopy = () => {
    navigator.clipboard.writeText(bankAccount);
    setCopied(true);
    // รีเซ็ตข้อความ "คัดลอกแล้ว" กลับเป็นไอคอนเดิมหลังผ่านไป 2 วินาที
    setTimeout(() => setCopied(false), 2000);
  };

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
          เว็บไซต์นี้เปิดให้ได้ใช้งานแบบฟรีไม่คิดค่าใช้จ่ายแม้แต่บาทเดียว ที่ทำส่วนนี้ขึ้นมาก็เพื่อให้คนที่สนใจจะสนับสนุนผู้พัฒนาเว็บไซต์สามารถสนับสนุนได้ที่ด้านล่างนี้เลยครับ/ค่ะ
        </p>
      </div>

      <div className="glass-panel" style={{ maxWidth: '520px', margin: '0 auto', padding: '2.5rem' }}>
        
        {/* Bank Account Details */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', color: 'var(--pink-accent)', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <Landmark size={28} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
            โอนเงินผ่านบัญชีธนาคาร
          </div>
          
          <div style={{ 
            background: 'var(--input-bg)', 
            border: '1px solid var(--glass-border)',
            padding: '20px', 
            borderRadius: '16px', 
            display: 'inline-block',
            width: '100%',
            maxWidth: '350px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '0.5rem' }}>
              {bankName}
            </p>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              background: 'rgba(0,0,0,0.2)',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--text-main)' }}>
                {formattedAccount}
              </span>
              <button 
                onClick={handleCopy}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: copied ? '#10b981' : 'var(--pink-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '5px',
                  transition: 'color 0.3s ease'
                }}
                title="คัดลอกเลขบัญชี"
              >
                {copied ? <CheckCircle size={22} /> : <Copy size={22} />}
              </button>
            </div>
            
            <div style={{ minHeight: '20px' }}>
              {copied && <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '500' }}>คัดลอกเลขบัญชีแล้ว!</span>}
            </div>
          </div>
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
          Back To Home
        </Link>
      </div>
    </div>
  );
};

export default Donate;