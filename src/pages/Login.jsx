import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Lock, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha"; // <-- Import เข้ามา

const Login = ({ setSession }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState('Unknown IP');
  
  // State สำหรับเก็บค่า reCAPTCHA
  const [captchaToken, setCaptchaToken] = useState(null);
  
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const navigate = useNavigate();

  // ดึงค่า Theme เพื่อให้สี reCAPTCHA กลืนกับเว็บ
  const currentTheme = localStorage.getItem('theme') || 'dark';

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress('Unknown IP'));

    checkBlockStatus();
    const interval = setInterval(checkBlockStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkBlockStatus = () => {
    const blockUntil = localStorage.getItem('blockUntil');
    if (blockUntil) {
      const now = Date.now();
      const timeRemaining = parseInt(blockUntil) - now;
      if (timeRemaining > 0) {
        setIsBlocked(true);
        const minutes = Math.floor(timeRemaining / (60 * 1000));
        const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
        setBlockMessage(`ถูกบล็อก! กรุณาลองใหม่ในอีก ${minutes} นาที ${seconds} วินาที`);
      } else {
        setIsBlocked(false);
        localStorage.removeItem('blockUntil');
        localStorage.removeItem('loginAttempts');
        setBlockMessage('');
        setError(null);
      }
    }
  };

  const writeLog = async (action, details) => {
    await supabase.from('logs').insert([{ action, performed_by: username || 'Unknown', target: 'System Login', details, ip_address: ipAddress }]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isBlocked) return;

    // เช็คว่าติ๊ก reCAPTCHA หรือยัง
    if (!captchaToken) {
      setError("กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ (reCAPTCHA)");
      return;
    }

    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase.from('admins').select('*').eq('username', username).eq('password', password).single();

    if (fetchError || !data) {
      await writeLog('LOGIN_FAILED', `Attempted User: [${username}], Pass: [${password}]`);
      let attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
      attempts += 1;
      localStorage.setItem('loginAttempts', attempts.toString());

      if (attempts >= 2) {
        const blockTime = Date.now() + (60 * 60 * 1000);
        localStorage.setItem('blockUntil', blockTime.toString());
        setIsBlocked(true);
        checkBlockStatus();
      } else {
        setError(`Username หรือ Password ไม่ถูกต้อง (เหลือโอกาสอีก ${2 - attempts} ครั้ง)`);
      }
      setLoading(false);
    } else {
      await writeLog('LOGIN_SUCCESS', 'Logged in successfully');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('currentAdmin', username);
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('blockUntil');
      setSession(true);
      navigate('/admin');
    }
  };

  return (
    <div className="login-page">
      <div className="glass-panel login-box">
        <div className="login-icon-wrapper">
          {isBlocked ? <AlertOctagon className="login-icon" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.2)' }} size={32} /> : <Lock className="login-icon" size={32} />}
        </div>
        <h2 className="text-center" style={{ marginBottom: '2rem' }}>Admin Portal</h2>
        
        {error && !isBlocked && <div className="error-msg">{error}</div>}
        
        {isBlocked && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#ef4444' }}>⚠️ SECURITY ALERT</strong>
            {blockMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input type="text" placeholder="Username" className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isBlocked} style={{ opacity: isBlocked ? 0.5 : 1 }} />
          </div>
          <div className="form-group">
            <input type="password" placeholder="Password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isBlocked} style={{ opacity: isBlocked ? 0.5 : 1 }} />
          </div>

          {/* ส่วนของ reCAPTCHA */}
          {!isBlocked && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                theme={currentTheme === 'light' ? 'light' : 'dark'}
              />
            </div>
          )}

          <button type="submit" disabled={loading || isBlocked || !captchaToken} className="btn-primary" style={{ background: (isBlocked || !captchaToken) ? '#4b5563' : 'var(--pink-accent)', cursor: (isBlocked || !captchaToken) ? 'not-allowed' : 'pointer' }}>
            {isBlocked ? 'Access Blocked' : loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;