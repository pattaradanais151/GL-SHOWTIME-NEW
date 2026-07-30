import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Mail, Lock, User, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

export default function GuestLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        // เข้าสู่ระบบด้วยตาราง guestlogin
        const { data, error } = await supabase
          .from('guestlogin')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (error || !data) {
          throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }
        
        // เก็บข้อมูลลง LocalStorage
        localStorage.setItem('guestUser', JSON.stringify(data));
        
        setSuccessMsg('เข้าสู่ระบบสำเร็จ! กำลังพาท่านกลับสู่หน้าหลัก...');
        setTimeout(() => {
          navigate('/');
          window.location.reload(); // รีเฟรชเพื่อให้ระบบอ่านค่า LocalStorage ใหม่
        }, 1500);

      } else {
        // สมัครสมาชิก Guest
        if (password !== confirmPassword) throw new Error('รหัสผ่านและการยืนยันไม่ตรงกัน');
        if (password.length < 6) throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        
        // ตรวจสอบความซ้ำซ้อน
        const { data: existingUser } = await supabase
          .from('guestlogin')
          .select('id')
          .or(`email.eq.${email},username.eq.${username}`);

        if (existingUser && existingUser.length > 0) {
          throw new Error('อีเมลหรือชื่อผู้ใช้นี้มีคนใช้แล้ว');
        }
        
        // บันทึกข้อมูลลงตาราง guestlogin
        const { error } = await supabase.from('guestlogin').insert([{
          username: username,
          email: email,
          password: password
        }]);
        
        if (error) throw error;
        
        setSuccessMsg('สมัครสมาชิกสำเร็จ! ระบบกำลังสลับไปหน้าเข้าสู่ระบบ...');
        setTimeout(() => {
          setIsLogin(true);
          setUsername('');
          setPassword('');
          setConfirmPassword('');
          setSuccessMsg('');
        }, 2000);
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 font-prompt">
      <div className="w-full max-w-md bg-[#1a1a2e]/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-8 transition-all duration-300 relative overflow-hidden">
        
        {/* Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4 shadow-lg">
              <Sparkles className="text-pink-500" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'ยินดีต้อนรับกลับมา' : 'สร้างบัญชีผู้ใช้งาน'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isLogin 
                ? 'เข้าสู่ระบบเพื่อเก็บซีรีส์โปรดและร่วมให้คะแนนซีรีส์' 
                : 'สมัครสมาชิกเพื่อเริ่มต้นเก็บ Watchlist ของคุณ'}
            </p>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium animate-in fade-in">
              <AlertCircle size={18} /> <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-sm font-medium animate-in fade-in">
              <CheckCircle size={18} /> <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="ชื่อผู้ใช้ (Username)" 
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all"
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="อีเมล (Email)" 
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="รหัสผ่าน (6 ตัวอักษรขึ้นไป)" 
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all"
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง" 
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all"
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || successMsg !== ''} 
              className="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_15px_rgba(236,72,153,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(236,72,153,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'กำลังดำเนินการ...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            {isLogin ? 'ยังไม่มีบัญชีใช่ไหม?' : 'มีบัญชีอยู่แล้ว?'}
            <button 
              type="button" 
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
              }} 
              className="ml-2 text-pink-400 font-semibold hover:text-pink-300 hover:underline transition-colors"
            >
              {isLogin ? 'สมัครสมาชิกที่นี่' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}