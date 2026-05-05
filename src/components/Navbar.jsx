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
    <nav className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--pink-accent)' }}>GL</span> SHOWTIME
        </Link>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'color 0.3s' }}>
            <Film size={18} /> {t('nav.home')}
          </Link>
          <Link to="/schedule" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'color 0.3s' }}>
            <CalendarDays size={18} /> {t('nav.schedule')}
          </Link>
          <Link to="/donate" style={{ color: 'var(--pink-accent)', textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500', transition: 'color 0.3s' }}>
            <Heart size={18} /> {t('nav.donate')}
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ 
              background: 'transparent', color: 'var(--text-main)', 
              border: '1px solid var(--glass-border)', borderRadius: '0.5rem',
              padding: '0.2rem 0.5rem', outline: 'none', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            <option value="th" style={{color: '#000'}}>Thailand</option>
            <option value="en" style={{color: '#000'}}>English</option>
            <option value="ja" style={{color: '#000'}}>Japan</option>
            <option value="lo" style={{color: '#000'}}>Thailand (North)</option>
          </select>

          <button 
            onClick={toggleTheme} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.3s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-hover)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {theme === 'dark' ? <Sun size={20} color="var(--text-muted)" /> : <Moon size={20} color="var(--text-muted)" />}
          </button>
          
          {session ? (
            <>
              <Link to="/admin" className="btn-primary" style={{ padding: '0.4rem 1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={16} /> Admin
              </Link>
              <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.4rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={16} /> {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={16} /> {t('nav.admin')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;