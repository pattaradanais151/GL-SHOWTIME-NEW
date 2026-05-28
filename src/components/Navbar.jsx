import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, Settings, CalendarDays, Film, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = ({ session, setSession, theme, toggleTheme }) => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setSession(false);
    navigate('/');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="container nav-container">
        
        {/* โลโก้ (ซ้ายสุด) */}
        <Link to="/" className="nav-logo">
          <span>GL</span> SHOWTIME
        </Link>
        
        {/* เมนูนำทาง (ตรงกลาง - บนมือถือจะตกลงมาอยู่บรรทัดล่าง) */}
        <div className="nav-links">
          <Link to="/"><Film size={18} /> <span className="link-text">{t('nav.home')}</span></Link>
          <Link to="/community" className="nav-link">Community</Link>
          <Link to="/schedule"><CalendarDays size={18} /> <span className="link-text">{t('nav.schedule')}</span></Link>
          <Link to="/donate" className="donate-link"><Heart size={18} /> <span className="link-text">{t('nav.donate')}</span></Link>
        </div>

        {/* ส่วนควบคุม (ขวาสุด) */}
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
                <LogOut size={16} /> <span className="btn-text">{t('nav.logout')}</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="login-link">
              <Settings size={16} /> <span className="btn-text">{t('nav.admin')}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;