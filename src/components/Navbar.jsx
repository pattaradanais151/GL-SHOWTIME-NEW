import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, LogOut, Settings, CalendarDays, Film, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = ({ session, setSession, theme, toggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  // ตรวจสอบว่าผู้ใช้กำลังอยู่ในหน้าของโซน BL หรือไม่
  const isBLZone = location.pathname.startsWith('/bl');

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setSession(false);
    navigate('/');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="container nav-container">
        
        {/* โลโก้ (แสดงผลเหมือนกันทุกหน้าอย่างมั่นคง หากอยู่โซน BL จะสลับชื่อให้อัตโนมัติ) */}
        <Link to={isBLZone ? "/bl" : "/"} className="nav-logo">
          <span>{isBLZone ? "BL" : "GL"}</span> SHOWTIME
        </Link>
        
        {/* เมนูนำทาง (แสดงเหมือนกันหมดในทุกๆ หน้า) */}
        <div className="nav-links">
          {/* ปุ่มกลับหน้าแรกของโซนนั้นๆ */}
          <Link to="/">
            <Film size={18} /> <span className="link-text">GL Home</span>
          </Link>
          
          <Link to="/bl">
            <Film size={18} /> <span className="link-text">BL Home</span>
          </Link>
          
          <Link to="/community" className="nav-link">
            Community
          </Link>
          
          <Link to="/schedule">
            <CalendarDays size={18} /> <span className="link-text">{t('nav.schedule') || 'Schedule'}</span>
          </Link>
          
          <Link to="/donate" className="donate-link">
            <Heart size={18} /> <span className="link-text">{t('nav.donate') || 'Donate'}</span>
          </Link>
        </div>

        {/* ส่วนควบคุมระบบ (ขวาสุด) */}
        <div className="nav-controls">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="nav-lang-select"
          >
            <option value="th">Thailand</option>
            <option value="en">English</option>
            <option value="ja">Japan</option>
            <option value="lo">Thailand (North)</option>
          </select>

          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {session ? (
            <>
              <Link to="/admin" className="btn-primary admin-btn">
                <Settings size={16} /> <span className="btn-text">Admin</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} /> <span className="btn-text">{t('nav.logout') || 'Logout'}</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="login-link">
              <Settings size={16} /> <span className="btn-text">{t('nav.admin') || 'Admin'}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;