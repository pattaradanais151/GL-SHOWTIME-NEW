import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, LogOut, Settings, CalendarDays, Film, Heart, Users, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';

const Navbar = ({ adminSession, guestUser, theme, toggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  // ตรวจสอบว่ากำลังอยู่หน้า BL หรือไม่
  const isBLZone = location.pathname.startsWith('/bl');

  // ฟังก์ชันออกจากระบบสำหรับ Admin
  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('isAdmin');
    navigate('/');
    window.location.reload();
  };

  // ฟังก์ชันออกจากระบบสำหรับ Guest
  const handleGuestLogout = () => {
    localStorage.removeItem('guestUser');
    navigate('/');
    window.location.reload();
  };

  // จัดสไตล์ปุ่ม Navigation (Active State รองรับ Light/Dark Mode)
  const navLinkClass = (path) => {
    const isActive = location.pathname === path;
    const activeColor = isBLZone 
      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/15' 
      : 'text-pink-600 bg-pink-50 dark:text-pink-500 dark:bg-pink-500/15';
    const inactiveColor = 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10';
    
    return `flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${isActive ? activeColor : inactiveColor}`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#0f1015]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg transition-all duration-300 font-prompt">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* ================= LOGO ================= */}
          <Link to={isBLZone ? "/bl" : "/"} className="flex items-center gap-2 text-xl font-black text-gray-900 dark:text-white tracking-wide shrink-0 transition-transform hover:scale-105">
            <span className={isBLZone ? "text-blue-500 dark:text-blue-400" : "text-pink-600 dark:text-pink-500"}>
              {isBLZone ? "BL" : "GL"}
            </span> 
            <span>SHOWTIME</span>
          </Link>
          
          {/* ================= MAIN LINKS (Desktop) ================= */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/" className={navLinkClass('/')}>
              <Film size={18} /> <span>GL Home</span>
            </Link>
            <Link to="/bl" className={navLinkClass('/bl')}>
              <Film size={18} /> <span>BL Home</span>
            </Link>
            <Link to="/community" className={navLinkClass('/community')}>
              <Users size={18} /> <span>Community</span>
            </Link>
            <Link to="/schedule" className={navLinkClass('/schedule')}>
              <CalendarDays size={18} /> <span>{t('nav.schedule') || 'ตารางออนแอร์'}</span>
            </Link>
            <Link to="/donate" className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${location.pathname === '/donate' ? 'text-pink-600 bg-pink-50 dark:text-pink-500 dark:bg-pink-500/15' : 'text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:text-pink-400 dark:hover:text-pink-300 dark:hover:bg-pink-500/10'}`}>
              <Heart size={18} /> <span>{t('nav.donate') || 'สนับสนุน'}</span>
            </Link>
          </div>

          {/* ================= CONTROLS (Right) ================= */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Selector */}
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-100 dark:bg-black/30 text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm outline-none cursor-pointer focus:border-pink-500 transition-colors appearance-none"
            >
              <option value="th" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Thailand</option>
              <option value="en" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">English</option>
              <option value="ja" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Japan</option>
              <option value="lo" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Lanna</option>
            </select>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* ================= AUTHENTICATION STATUS ================= */}
            {adminSession ? (
              // โหมด Admin
              <div className="flex items-center gap-2">
                <Link to="/admin" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-white rounded-lg text-sm font-medium transition-colors">
                  <Settings size={16} /> <span>Admin</span>
                </Link>
                <button onClick={handleAdminLogout} className="flex items-center gap-2 px-3 py-1.5 border border-red-500/50 text-red-500 dark:text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500 dark:hover:text-white rounded-lg text-sm font-medium transition-all">
                  <LogOut size={16} /> <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </div>
            ) : guestUser ? (
              // โหมด Guest (UI สไตล์เดียวกับ Admin)
              <div className="flex items-center gap-2">
                <Link to="/guest" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 dark:bg-pink-500/10 dark:hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 rounded-lg text-sm font-medium transition-colors border border-transparent dark:border-pink-500/20">
                  <User size={16} /> <span className="max-w-[100px] truncate">{guestUser.username}</span>
                </Link>
                <button onClick={handleGuestLogout} className="flex items-center gap-2 px-3 py-1.5 border border-red-500/50 text-red-500 dark:text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500 dark:hover:text-white rounded-lg text-sm font-medium transition-all">
                  <LogOut size={16} /> <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              // โหมดทั่วไป (ยังไม่ได้ล็อกอิน)
              <div className="flex items-center gap-2">
                <Link to="/auth" className="flex items-center gap-2 px-4 py-1.5 bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-pink-500/30">
                  <User size={16} /> <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                </Link>
                <Link to="/login" className="flex items-center gap-1 px-2 py-1.5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors text-xs" title="Admin Login">
                  <Settings size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ================= MOBILE NAVIGATION (Scrollable) ================= */}
        <div className="lg:hidden flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
          <Link to="/" className={`whitespace-nowrap shrink-0 ${navLinkClass('/')}`}>
            <Film size={16} /> <span>GL Home</span>
          </Link>
          <Link to="/bl" className={`whitespace-nowrap shrink-0 ${navLinkClass('/bl')}`}>
            <Film size={16} /> <span>BL Home</span>
          </Link>
          <Link to="/community" className={`whitespace-nowrap shrink-0 ${navLinkClass('/community')}`}>
            <Users size={16} /> <span>Community</span>
          </Link>
          <Link to="/schedule" className={`whitespace-nowrap shrink-0 ${navLinkClass('/schedule')}`}>
            <CalendarDays size={16} /> <span>{t('nav.schedule') || 'ตารางออนแอร์'}</span>
          </Link>
          
          {/* แถบสำหรับหน้าจอมือถือ (เมื่อล็อกอิน Guest) */}
          {guestUser && (
            <Link to="/guest" className={`whitespace-nowrap shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${location.pathname === '/guest' ? 'text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-500/15' : 'text-pink-600 hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-500/10'}`}>
              <User size={16} /> <span>{guestUser.username}</span>
            </Link>
          )}

          <Link to="/donate" className={`whitespace-nowrap shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${location.pathname === '/donate' ? 'text-pink-600 bg-pink-50 dark:text-pink-500 dark:bg-pink-500/15' : 'text-pink-500 hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-500/10'}`}>
            <Heart size={16} /> <span>{t('nav.donate') || 'สนับสนุน'}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;