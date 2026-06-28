import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { Calendar, Clock, Tv, Star, HelpCircle, X, PlayCircle, Info, User, Bell } from 'lucide-react';
import { getYoutubeThumbnail } from '../utils/youtube';
import { useLanguage } from '../contexts/LanguageContext';

const DAY_ORDER = ['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์', 'N/A'];

const timeToMinutes = (t) => {
  if (!t || t === 'N/A') return 9999;
  const parts = t.replace(':', '.').split('.');
  return parseInt(parts[0]) * 60 + (parseInt(parts[1]) || 0);
};

const PLATFORM_COLORS = {
  iQIYI: '#00c850', 'CH3 Plus': '#e53e3e', oneD: '#f6ad55', Youtube: '#ff0000', Netflix: '#e50914', WeTV: '#1890ff',
};
const getPlatformColor = (platform) => PLATFORM_COLORS[platform] || 'var(--pink-accent)';

const Schedule = () => {
  const { t } = useLanguage();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all'); // เพิ่ม State สำหรับเลือก GL / BL / All
  const [selectedMovie, setSelectedMovie] = useState(null);

  const translateDay = (dayStr) => {
    if (dayStr === 'N/A') return t('schedule.unknown_day') || 'ไม่ระบุวัน';
    const dayMap = {
      'วันจันทร์': t('day.mon') || 'วันจันทร์', 'วันอังคาร': t('day.tue') || 'วันอังคาร', 'วันพุธ': t('day.wed') || 'วันพุธ',
      'วันพฤหัสบดี': t('day.thu') || 'วันพฤหัสบดี', 'วันศุกร์': t('day.fri') || 'วันศุกร์', 'วันเสาร์': t('day.sat') || 'วันเสาร์', 'วันอาทิตย์': t('day.sun') || 'วันอาทิตย์',
    };
    return dayMap[dayStr] || dayStr;
  };

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      // ดึงข้อมูลทั้งตาราง movies (GL) และ movies_bl (BL) พร้อมกัน
      const [glRes, blRes] = await Promise.all([
        supabase.from('movies').select('*'),
        supabase.from('movies_bl').select('*')
      ]);

      // เพิ่มฟิลด์ domain เพื่อใช้แยกประเภท
      const glData = glRes.data ? glRes.data.map(m => ({ ...m, domain: 'GL' })) : [];
      const blData = blRes.data ? blRes.data.map(m => ({ ...m, domain: 'BL' })) : [];

      setMovies([...glData, ...blData]);
      setLoading(false);
    };
    fetchMovies();
  }, []);

  // กรองข้อมูลตามหมวดหมู่ (GL / BL / All)
  const filteredMovies = useMemo(() => {
    if (selectedDomain === 'all') return movies;
    return movies.filter(m => m.domain === selectedDomain);
  }, [movies, selectedDomain]);

  const groupedByDay = useMemo(() => {
    const groups = {};
    DAY_ORDER.forEach((d) => { groups[d] = []; });
    filteredMovies.forEach((m) => {
      const day = m.air_day && m.air_day.trim() !== '' ? m.air_day.trim() : 'N/A';
      if (!groups[day]) groups[day] = [];
      groups[day].push(m);
    });
    Object.keys(groups).forEach((d) => {
      groups[d].sort((a, b) => timeToMinutes(a.air_time) - timeToMinutes(b.air_time));
    });
    return groups;
  }, [filteredMovies]);

  const activeDays = DAY_ORDER.filter((d) => groupedByDay[d]?.length > 0);

  const displayMovies = useMemo(() => {
    if (selectedDay === 'all') return DAY_ORDER.flatMap((d) => groupedByDay[d] || []);
    return groupedByDay[selectedDay] || [];
  }, [selectedDay, groupedByDay]);

  return (
    <div>
      <div className="text-center" style={{ margin: '3rem 0 2rem' }}>
        <span className="gl-subtitle">{t('schedule.subtitle') || 'อัปเดตทุกสัปดาห์'}</span>
        <h1 className="gl-title">{t('schedule.title') || 'ตารางออนแอร์'}</h1>
        <p className="gl-desc">{t('schedule.desc') || 'ติดตามเวลาออกอากาศของซีรีส์ที่คุณชื่นชอบ'}</p>
      </div>

      <div className="glass-panel" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem 1.25rem', marginBottom: '2rem', borderLeft: '3px solid var(--pink-accent)' }}>
        <Bell size={20} color="var(--pink-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.95rem' }}>
            {t('schedule.notify_title') || 'แจ้งเตือน Telegram อัตโนมัติ'}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
            {t('schedule.notify_desc') || 'ระบบจะส่งสรุปตารางวันนี้เวลา 08:00 น. และแจ้งเตือนก่อนออนแอร์ 30 นาที ไปยัง Telegram ของทีมงาน'}
          </p>
        </div>
      </div>

      {/* Domain Toggle (GL / BL / ทั้งหมด) */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem', background: 'var(--glass-bg)', padding: '0.4rem', borderRadius: '2rem', width: 'fit-content', margin: '0 auto 2rem', border: '1px solid var(--glass-border)' }}>
        <button
          onClick={() => setSelectedDomain('all')}
          style={{
            background: selectedDomain === 'all' ? 'var(--text-main)' : 'transparent',
            color: selectedDomain === 'all' ? 'var(--bg-color)' : 'var(--text-main)',
            padding: '0.4rem 1.25rem', borderRadius: '2rem', cursor: 'pointer', fontFamily: 'Prompt, sans-serif', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.25s ease', border: 'none'
          }}
        >
          {t('schedule.all') || 'ทั้งหมด'}
        </button>
        <button
          onClick={() => setSelectedDomain('GL')}
          style={{
            background: selectedDomain === 'GL' ? 'var(--pink-accent)' : 'transparent',
            color: selectedDomain === 'GL' ? 'white' : 'var(--text-main)',
            padding: '0.4rem 1.25rem', borderRadius: '2rem', cursor: 'pointer', fontFamily: 'Prompt, sans-serif', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.25s ease', border: 'none'
          }}
        >
          GL Series
        </button>
        <button
          onClick={() => setSelectedDomain('BL')}
          style={{
            background: selectedDomain === 'BL' ? '#4db8ff' : 'transparent',
            color: selectedDomain === 'BL' ? 'white' : 'var(--text-main)',
            padding: '0.4rem 1.25rem', borderRadius: '2rem', cursor: 'pointer', fontFamily: 'Prompt, sans-serif', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.25s ease', border: 'none'
          }}
        >
          BL Series
        </button>
      </div>

      {/* Day Filter Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}>
        <button
          onClick={() => setSelectedDay('all')}
          style={{
            background: selectedDay === 'all' ? (selectedDomain === 'BL' ? '#4db8ff' : 'var(--pink-accent)') : 'var(--input-bg)',
            color: selectedDay === 'all' ? 'white' : 'var(--text-muted)',
            border: `1px solid ${selectedDay === 'all' ? (selectedDomain === 'BL' ? '#4db8ff' : 'var(--pink-accent)') : 'var(--glass-border)'}`,
            padding: '0.5rem 1.25rem', borderRadius: '2rem', cursor: 'pointer', fontFamily: 'Prompt, sans-serif', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.25s ease',
          }}
        >
          {t('schedule.all') || 'ทั้งหมด'}
        </button>

        {activeDays.map((day) => (
          <button
            key={day} onClick={() => setSelectedDay(day)}
            style={{
              background: selectedDay === day ? (selectedDomain === 'BL' ? '#4db8ff' : 'var(--pink-accent)') : 'var(--input-bg)',
              color: selectedDay === day ? 'white' : 'var(--text-muted)',
              border: `1px solid ${selectedDay === day ? (selectedDomain === 'BL' ? '#4db8ff' : 'var(--pink-accent)') : 'var(--glass-border)'}`,
              padding: '0.5rem 1.25rem', borderRadius: '2rem', cursor: 'pointer', fontFamily: 'Prompt, sans-serif', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.25s ease', position: 'relative',
            }}
          >
            <span className="day-full" style={{ display: 'inline' }}>{translateDay(day)}</span>
            <span style={{ 
              marginLeft: '0.4rem', 
              background: selectedDay === day ? 'rgba(255,255,255,0.25)' : (selectedDomain === 'BL' ? 'rgba(77,184,255,0.15)' : 'rgba(236,72,153,0.15)'), 
              color: selectedDay === day ? 'white' : (selectedDomain === 'BL' ? '#4db8ff' : 'var(--pink-accent)'), 
              borderRadius: '999px', fontSize: '0.7rem', padding: '0 0.4rem', fontWeight: 700 
            }}>
              {groupedByDay[day].length}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          {t('schedule.loading') || 'กำลังโหลดข้อมูล...'}
        </div>
      )}

      {!loading && (
        <>
          {selectedDay === 'all' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {activeDays.map((day) => (
                <DaySection key={day} day={day} translatedDay={translateDay(day)} movies={groupedByDay[day]} onSelect={setSelectedMovie} t={t} selectedDomain={selectedDomain} />
              ))}
            </div>
          ) : (
            <DaySection day={selectedDay} translatedDay={translateDay(selectedDay)} movies={displayMovies} onSelect={setSelectedMovie} hideHeader t={t} selectedDomain={selectedDomain} />
          )}

          {displayMovies.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
              {t('schedule.no_data') || 'ไม่พบซีรีส์ในวันนี้'}
            </div>
          )}
        </>
      )}

      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} t={t} />}
    </div>
  );
};

const DaySection = ({ day, translatedDay, movies, onSelect, hideHeader, t, selectedDomain }) => {
  if (movies.length === 0) return null;
  const themeColor = selectedDomain === 'BL' ? '#4db8ff' : 'var(--pink-accent)';
  const badgeBg = selectedDomain === 'BL' ? 'rgba(77,184,255,0.12)' : 'rgba(236,72,153,0.12)';

  return (
    <div>
      {!hideHeader && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 4, height: 28, borderRadius: 4, background: day === 'N/A' ? 'var(--text-muted)' : themeColor }} />
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: day === 'N/A' ? 'var(--text-muted)' : 'var(--text-main)' }}>
            {translatedDay}
          </h2>
          <span style={{ background: badgeBg, color: themeColor, fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
            {movies.length} {t('schedule.movies_count') || 'เรื่อง'}
          </span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {movies.map((movie) => <ScheduleRow key={movie.id} movie={movie} onSelect={onSelect} />)}
      </div>
    </div>
  );
};

const ScheduleRow = ({ movie, onSelect }) => {
  const time = movie.air_time || 'N/A';
  const platform = movie.platform || 'N/A';
  const thumbnail = movie.youtube_url ? getYoutubeThumbnail(movie.youtube_url) : null;
  
  // สีตกแต่งอิงตามประเภท GL / BL (เว้นแต่จะใช้ Platform Color ที่มีอยู่)
  const isBL = movie.domain === 'BL';
  const rowThemeColor = isBL ? '#4db8ff' : 'var(--pink-accent)';
  const rowThemeBg = isBL ? 'rgba(77,184,255,0.12)' : 'rgba(236,72,153,0.12)';

  return (
    <div
      className="glass-panel" onClick={() => onSelect(movie)}
      style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', cursor: 'pointer', transition: 'all 0.25s ease', borderLeft: `3px solid ${getPlatformColor(platform)}` }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = rowThemeColor; e.currentTarget.style.boxShadow = `0 4px 20px ${isBL ? 'rgba(77,184,255,0.15)' : 'rgba(236,72,153,0.15)'}`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = getPlatformColor(platform); e.currentTarget.style.boxShadow = ''; }}
    >
      {thumbnail ? (
        <img src={thumbnail} alt={movie.title} style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: '0.375rem', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 80, height: 45, background: 'var(--item-bg)', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Tv size={20} color="var(--text-muted)" />
        </div>
      )}

      <div style={{ minWidth: 60, textAlign: 'center', flexShrink: 0 }}>
        <div style={{ background: time === 'N/A' ? 'var(--item-bg)' : rowThemeBg, color: time === 'N/A' ? 'var(--text-muted)' : rowThemeColor, borderRadius: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          {time === 'N/A' ? <HelpCircle size={12} /> : <Clock size={12} />} {time}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.975rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.2rem' }}>
          {movie.title}
          {movie.domain && (
            <span style={{
              background: isBL ? 'rgba(77,184,255,0.1)' : 'rgba(236,72,153,0.1)',
              color: rowThemeColor,
              border: `1px solid ${isBL ? 'rgba(77,184,255,0.3)' : 'rgba(236,72,153,0.3)'}`,
              fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.3rem', borderRadius: '0.25rem',
              marginLeft: '0.5rem', verticalAlign: 'middle'
            }}>
              {movie.domain}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem', flexWrap: 'wrap' }}>
          {movie.genre && <span>{movie.genre}</span>}
          {movie.release_date && (<span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Calendar size={11} /> {movie.release_date}</span>)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
        {platform !== 'N/A' && (
          <span style={{ background: `${getPlatformColor(platform)}22`, color: getPlatformColor(platform), border: `1px solid ${getPlatformColor(platform)}44`, fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.25rem', letterSpacing: '0.03em' }}>{platform}</span>
        )}
        {movie.rating && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#eab308', fontSize: '0.78rem', fontWeight: 700 }}><Star size={12} fill="currentColor" /> {movie.rating}</span>
        )}
      </div>
    </div>
  );
};

const MovieModal = ({ movie, onClose, t }) => {
  const thumbnail = movie.youtube_url ? getYoutubeThumbnail(movie.youtube_url) : null;
  const isBL = movie.domain === 'BL';
  const themeColor = isBL ? '#4db8ff' : 'var(--pink-accent)';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        {thumbnail && (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
            <img src={thumbnail} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem 1rem 0 0' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-color), transparent)', borderRadius: '1rem 1rem 0 0' }} />
            {movie.youtube_url && (
              <a href={movie.youtube_url} target="_blank" rel="noreferrer" style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', background: themeColor, color: 'white', padding: '0.75rem 1.5rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: 'bold', boxShadow: `0 4px 15px ${isBL ? 'rgba(77,184,255,0.4)' : 'rgba(236,72,153,0.4)'}` }}>
                <PlayCircle size={20} /> {t('schedule.trailer') || 'ดูตัวอย่าง'}
              </a>
            )}
          </div>
        )}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'Playfair Display, serif', margin: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              {movie.title}
              {movie.domain && (
                <span style={{
                  background: isBL ? 'rgba(77,184,255,0.1)' : 'rgba(236,72,153,0.1)',
                  color: themeColor,
                  border: `1px solid ${isBL ? 'rgba(77,184,255,0.3)' : 'rgba(236,72,153,0.3)'}`,
                  fontSize: '0.8rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '0.5rem',
                  fontFamily: 'Prompt, sans-serif'
                }}>
                  {movie.domain} SERIES
                </span>
              )}
            </h2>
            {movie.rating && (<div className="rating-badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem', flexShrink: 0 }}><Star size={18} fill="currentColor" /> {movie.rating}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Tv size={16} color={themeColor} /> {movie.platform || 'N/A'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} color={themeColor} /> {movie.release_date || 'N/A'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} color={themeColor} /> {movie.air_day || 'N/A'} {movie.air_time ? `(${movie.air_time})` : ''}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} color={themeColor} /> {movie.director || 'N/A'}</div>
          </div>
          {movie.admin_note && (
            <div style={{ background: isBL ? 'rgba(77,184,255,0.1)' : 'rgba(236,72,153,0.1)', borderLeft: `4px solid ${themeColor}`, padding: '1rem', borderRadius: '0 0.5rem 0.5rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: themeColor, fontWeight: 'bold', marginBottom: '0.5rem' }}><Info size={18} /> {t('schedule.admin_note') || 'บันทึกจากผู้ดูแลระบบ'}</div>
              <p style={{ color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{movie.admin_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;