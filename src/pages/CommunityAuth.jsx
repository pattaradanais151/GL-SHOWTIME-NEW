import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import './CommunityAuth.css';

const CommunityAuth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // เพิ่ม State สำหรับข้อความสำเร็จ

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        // ========== ระบบเข้าสู่ระบบ ==========
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        setSuccessMsg('เข้าสู่ระบบสำเร็จ! กำลังพาท่านเข้าสู่คอมมูนิตี้...');
        // หน่วงเวลา 1.5 วินาทีให้ผู้ใช้เห็นข้อความก่อนเปลี่ยนหน้า
        setTimeout(() => {
          navigate('/community');
        }, 1500);

      } else {
        // ========== ระบบสมัครสมาชิก ==========
        if (password !== confirmPassword) {
          throw new Error('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              username: username,
              full_name: fullName,
              phone_number: phoneNumber
            }
          }
        });
        
        if (error) throw error;
        
        setSuccessMsg('สมัครสมาชิกสำเร็จ! ระบบกำลังเปลี่ยนไปหน้าเข้าสู่ระบบ...');
        
        // หน่วงเวลา 2 วินาที เคลียร์ฟอร์มและสลับไปหน้า Login
        setTimeout(() => {
          setIsLogin(true);
          setUsername('');
          setFullName('');
          setPhoneNumber('');
          setPassword('');
          setConfirmPassword('');
          setSuccessMsg('');
        }, 2000);
      }
    } catch (error) {
      // แปลงข้อความ Error ภาษาอังกฤษให้เข้าใจง่ายขึ้น
      if (error.message.includes('Email not confirmed')) {
        setErrorMsg('อีเมลนี้ยังไม่ได้รับการยืนยัน (หากคุณปิด Confirm Email ใน Supabase แล้ว ให้ลองสมัครใหม่อีกครั้ง)');
      } else if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (error.message.includes('User already registered')) {
        setErrorMsg('อีเมลนี้มีผู้ใช้งานแล้ว');
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comm-auth-container">
      <div className="comm-auth-box">
        <h2 className="comm-auth-title">{isLogin ? 'เข้าสู่ระบบคอมมูนิตี้' : 'สมัครสมาชิกใหม่'}</h2>
        
        {/* กล่องแจ้งเตือน */}
        {errorMsg && <div className="comm-auth-alert error">{errorMsg}</div>}
        {successMsg && <div className="comm-auth-alert success">{successMsg}</div>}
        
        <form onSubmit={handleAuth} className="comm-auth-form">
          {!isLogin && (
            <>
              <div className="comm-form-group">
                <label>ชื่อผู้ใช้ (Username)</label>
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="เช่น PloyGL" />
              </div>
              <div className="comm-form-group">
                <label>ชื่อ-นามสกุล (Full Name)</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="กรอกชื่อ-นามสกุลจริง" />
              </div>
              <div className="comm-form-group">
                <label>เบอร์โทรศัพท์ (Phone Number)</label>
                <input type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="08X-XXX-XXXX" />
              </div>
            </>
          )}
          
          <div className="comm-form-group">
            <label>อีเมล (Email)</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
          </div>
          
          <div className="comm-form-group">
            <label>รหัสผ่าน (Password)</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน 6 ตัวอักษรขึ้นไป" />
          </div>

          {!isLogin && (
            <div className="comm-form-group">
              <label>ยืนยันรหัสผ่าน (Confirm Password)</label>
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="กรอกรหัสผ่านอีกครั้ง" />
            </div>
          )}

          <button type="submit" disabled={loading || successMsg !== ''} className="btn-comm-auth">
            {loading ? 'กำลังดำเนินการ...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="comm-auth-switch">
          <span>{isLogin ? 'ยังไม่มีบัญชีใช่ไหม?' : 'มีบัญชีอยู่แล้ว?'}</span>
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="btn-switch">
            {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityAuth;