import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { Calendar, Clock, Tv, Star, HelpCircle } from 'lucide-react';
import { getYoutubeThumbnail } from '../utils/youtube';

// ลำดับวันในสัปดาห์ (ไทย) + N/A ไว้ท้ายสุด
const DAY_ORDER = [
  'วันจันทร์',
  'วันอังคาร',
  'วันพุธ',
  'วันพฤหัสบดี',
  'วันศุกร์',
  'วันเสาร์',
  'วันอาทิตย์',
  'N/A',
];

// แปลงเวลา "HH.MM" → นาที สำหรับ sort (N/A ให้ไปท้ายสุด)
const timeToMinutes = (t) => {
  if (!t || t === 'N/A') return 9999;
  const parts = t.replace(':', '.').split('.');
  return parseInt(parts[0]) * 60 + (parseInt(parts[1]) || 0);
};

// สีแถบ platform
const PLATFORM_COLORS = {
  iQIYI: '#00c850',
  'CH3 Plus': '#e53e3e',
  oneD: '#f6ad55',
  Youtube: '#ff0000',
  Netflix: '#e50914',
  WeTV: '#1890ff',
};
const getPlatformColor = (platform) => PLATFORM_COLORS[platform] || 'var(--pink-accent)';

// วันสั้น สำหรับ tab
const DAY_SHORT = {
  'วันจันทร์': 'จ.',
  'วันอังคาร': 'อ.',
  'วันพุธ': 'พ.',
  'วันพฤหัสบดี': 'พฤ.',
  'วันศุกร์': 'ศ.',
  'วันเสาร์': 'ส.',
  'วันอาทิตย์': 'อา.',
  'N/A': 'N/A',
};

const Schedule = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('all');
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('air_time', { ascending: true });
      if (!error && data) setMovies(data);
      setLoading(false);
    };
    fetchMovies();
  }, []);

  // จัดกลุ่มหนังตามวัน
  const groupedByDay = useMemo(() => {
    const groups = {};
    DAY_ORDER.forEach((d) => { groups[d] = []; });

    movies.forEach((m) => {
      const day = m.air_day && m.air_day.trim() !== '' ? m.air_day.trim() : 'N/A';
      if (!groups[day]) groups[day] = [];
      groups[day].push(m);
    });

    // sort ตามเวลาในแต่ละวัน
    Object.keys(groups).forEach((d) => {
      groups[d].sort((a, b) => timeToMinutes(a.air_time) - timeToMinutes(b.air_time));
    });

    return groups;
  }, [movies]);

  // วันที่มีหนัง (ไม่นับวันที่ว่าง)
  const activeDays = DAY_ORDER.filter((d) => groupedByDay[d]?.length > 0);

  // รายการหนังที่จะโชว์
  const displayMovies = useMemo(() => {
    if (selectedDay === 'all') {
      // รวมทุกวันตามลำดับ
      return DAY_ORDER.flatMap((d) => groupedByDay[d] || []);
    }
    return groupedByDay[selectedDay] || [];
  }, [selectedDay, groupedByDay]);

  return (
    <div>
      {/* Header */}
      <div className="text-center" style={{ margin: '3rem 0 2rem' }}>
        <span className="gl-subtitle">Weekly Schedule</span>
        <h1 className="gl-title">ตารางออนแอร์</h1>
        <p className="gl-desc">ตารางฉายประจำสัปดาห์ — Girl Love Collection</p>
      </div>

      {/* Day Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}
      >
        {/* ปุ่ม "ทั้งหมด" */}
        <button
          onClick={() => setSelectedDay('all')}
          style={{
            background: selectedDay === 'all' ? 'var(--pink-accent)' : 'var(--input-bg)',
            color: selectedDay === 'all' ? 'white' : 'var(--text-muted)',
            border: `1px solid ${selectedDay === 'all' ? 'var(--pink-accent)' : 'var(--glass-border)'}`,
            padding: '0.5rem 1.25rem',
            borderRadius: '2rem',
            cursor: 'pointer',
            fontFamily: 'Prompt, sans-serif',
            fontWeight: 500,
            fontSize: '0.875rem',
            transition: 'all 0.25s ease',
          }}
        >
          ทั้งหมด
        </button>

        {activeDays.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            style={{
              background: selectedDay === day ? 'var(--pink-accent)' : 'var(--input-bg)',
              color: selectedDay === day ? 'white' : 'var(--text-muted)',
              border: `1px solid ${selectedDay === day ? 'var(--pink-accent)' : 'var(--glass-border)'}`,
              padding: '0.5rem 1.25rem',
              borderRadius: '2rem',
              cursor: 'pointer',
              fontFamily: 'Prompt, sans-serif',
              fontWeight: 500,
              fontSize: '0.875rem',
              transition: 'all 0.25s ease',
              position: 'relative',
            }}
          >
            <span className="day-full" style={{ display: 'inline' }}>{day}</span>
            {/* badge จำนวนเรื่อง */}
            <span
              style={{
                marginLeft: '0.4rem',
                background: selectedDay === day ? 'rgba(255,255,255,0.25)' : 'rgba(236,72,153,0.15)',
                color: selectedDay === day ? 'white' : 'var(--pink-accent)',
                borderRadius: '999px',
                fontSize: '0.7rem',
                padding: '0 0.4rem',
                fontWeight: 700,
              }}
            >
              {groupedByDay[day].length}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          กำลังโหลดตารางออนแอร์...
        </div>
      )}

      {/* Schedule Content */}
      {!loading && (
        <>
          {selectedDay === 'all' ? (
            /* ALL VIEW — แสดงแยกตามวัน */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {activeDays.map((day) => (
                <DaySection
                  key={day}
                  day={day}
                  movies={groupedByDay[day]}
                  onSelect={setSelectedMovie}
                />
              ))}
            </div>
          ) : (
            /* SINGLE DAY VIEW */
            <DaySection
              day={selectedDay}
              movies={displayMovies}
              onSelect={setSelectedMovie}
              hideHeader
            />
          )}

          {displayMovies.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
              ยังไม่มีรายการออนแอร์ในวันนี้
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
};

/* ─── Day Section ─────────────────────────────────── */
const DaySection = ({ day, movies, onSelect, hideHeader }) => {
  if (movies.length === 0) return null;

  return (
    <div>
      {!hideHeader && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: 4,
              height: 28,
              borderRadius: 4,
              background: day === 'N/A' ? 'var(--text-muted)' : 'var(--pink-accent)',
            }}
          />
          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.4rem',
              color: day === 'N/A' ? 'var(--text-muted)' : 'var(--text-main)',
            }}
          >
            {day === 'N/A' ? '❓ ยังไม่ทราบวันฉาย' : day}
          </h2>
          <span
            style={{
              background: 'rgba(236,72,153,0.12)',
              color: 'var(--pink-accent)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
            }}
          >
            {movies.length} เรื่อง
          </span>
        </div>
      )}

      {/* Timeline list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {movies.map((movie) => (
          <ScheduleRow key={movie.id} movie={movie} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};

/* ─── Schedule Row ────────────────────────────────── */
const ScheduleRow = ({ movie, onSelect }) => {
  const time = movie.air_time || 'N/A';
  const platform = movie.platform || 'N/A';
  const thumbnail = movie.youtube_url ? getYoutubeThumbnail(movie.youtube_url) : null;

  return (
    <div
      className="glass-panel"
      onClick={() => onSelect(movie)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        borderLeft: `3px solid ${getPlatformColor(platform)}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.borderColor = 'var(--pink-accent)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(236,72,153,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.borderColor = getPlatformColor(platform);
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Thumbnail */}
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={movie.title}
          style={{
            width: 80,
            height: 45,
            objectFit: 'cover',
            borderRadius: '0.375rem',
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 80,
            height: 45,
            background: 'var(--item-bg)',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Tv size={20} color="var(--text-muted)" />
        </div>
      )}

      {/* Time bubble */}
      <div
        style={{
          minWidth: 60,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: time === 'N/A' ? 'var(--item-bg)' : 'rgba(236,72,153,0.12)',
            color: time === 'N/A' ? 'var(--text-muted)' : 'var(--pink-accent)',
            borderRadius: '0.5rem',
            padding: '0.25rem 0.5rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
          }}
        >
          {time === 'N/A' ? <HelpCircle size={12} /> : <Clock size={12} />}
          {time}
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: '0.975rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '0.2rem',
          }}
        >
          {movie.title}
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            flexWrap: 'wrap',
          }}
        >
          {movie.genre && <span>{movie.genre}</span>}
          {movie.release_date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Calendar size={11} /> {movie.release_date}
            </span>
          )}
        </div>
      </div>

      {/* Right: platform + rating */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
        {platform !== 'N/A' && (
          <span
            style={{
              background: `${getPlatformColor(platform)}22`,
              color: getPlatformColor(platform),
              border: `1px solid ${getPlatformColor(platform)}44`,
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '0.25rem',
              letterSpacing: '0.03em',
            }}
          >
            {platform}
          </span>
        )}
        {movie.rating && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              color: '#eab308',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            <Star size={12} fill="currentColor" /> {movie.rating}
          </span>
        )}
      </div>
    </div>
  );
};

/* ─── Movie Modal ─────────────────────────────────── */
import { X, PlayCircle, Info, User } from 'lucide-react';

const MovieModal = ({ movie, onClose }) => {
  const thumbnail = movie.youtube_url ? getYoutubeThumbnail(movie.youtube_url) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
      >
        <button className="modal-close" onClick={onClose}><X size={20} /></button>

        {/* Thumbnail */}
        {thumbnail && (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
            <img
              src={thumbnail}
              alt={movie.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem 1rem 0 0' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-color), transparent)', borderRadius: '1rem 1rem 0 0' }} />
            {movie.youtube_url && (
              <a
                href={movie.youtube_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  right: '1.5rem',
                  background: 'var(--pink-accent)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(236,72,153,0.4)',
                }}
              >
                <PlayCircle size={20} /> ดูตัวอย่าง
              </a>
            )}
          </div>
        )}

        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'Playfair Display, serif' }}>{movie.title}</h2>
            {movie.rating && (
              <div className="rating-badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem', flexShrink: 0 }}>
                <Star size={18} fill="currentColor" /> {movie.rating}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Tv size={16} color="var(--pink-accent)" /> {movie.platform || 'N/A'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} color="var(--pink-accent)" /> {movie.release_date || 'N/A'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} color="var(--pink-accent)" /> {movie.air_day || 'N/A'} {movie.air_time ? `(${movie.air_time})` : ''}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} color="var(--pink-accent)" /> {movie.director || 'N/A'}</div>
          </div>

          {movie.admin_note && (
            <div style={{ background: 'rgba(236,72,153,0.1)', borderLeft: '4px solid var(--pink-accent)', padding: '1rem', borderRadius: '0 0.5rem 0.5rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pink-accent)', fontWeight: 'bold', marginBottom: '0.5rem' }}><Info size={18} /> ADMIN NOTE</div>
              <p style={{ color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{movie.admin_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;