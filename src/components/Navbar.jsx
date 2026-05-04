import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, Settings } from 'lucide-react';

const Navbar = ({ session, setSession, theme, toggleTheme }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setSession(false);
    navigate('/');
  };

  return (
    <nav className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '1rem 2rem' }}>
      <div className="container" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1.2rem' }}>
          <span style={{ color: 'var(--pink-accent)' }}>GL</span> SHOWTIME
        </Link>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          
          {/* ปุ่มสลับโหมด Dark / Light */}
          <button 
            onClick={toggleTheme} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.3s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-hover)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {theme === 'dark' ? (
              <Sun size={20} color="var(--text-muted)" />
            ) : (
              <Moon size={20} color="var(--text-muted)" />
            )}
          </button>
          
          {session ? (
            <>
              <Link to="/admin" className="btn-primary" style={{ padding: '0.4rem 1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={16} /> Admin
              </Link>
              <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.4rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={16} /> ADMIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;