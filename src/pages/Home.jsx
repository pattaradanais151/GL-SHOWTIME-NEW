import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import MovieCard from '../components/MovieCard';
import { Search, X, PlayCircle, Star, Calendar, Clock, Tv, User, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { getYoutubeThumbnail } from '../utils/youtube';

const ITEMS_PER_PAGE = 12;

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  
  // States สำหรับ Filter และ Pagination
  const [filterGenre, setFilterGenre] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setMovies(data);
  };

  // ดึงหมวดหมู่และแพลตฟอร์มทั้งหมดที่มีมาทำ Dropdown อัตโนมัติ
  const uniqueGenres = useMemo(() => {
    const genres = movies.flatMap(m => m.genre ? m.genre.split(',').map(g => g.trim()) : []);
    return [...new Set(genres)].filter(Boolean).sort();
  }, [movies]);

  const uniquePlatforms = useMemo(() => {
    const platforms = movies.map(m => m.platform ? m.platform.trim() : '');
    return [...new Set(platforms)].filter(Boolean).sort();
  }, [movies]);

  // ระบบกรองข้อมูล (Filter & Search)
  const filteredMovies = useMemo(() => {
    return movies.filter(m => {
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
      const matchGenre = filterGenre === "" || (m.genre && m.genre.includes(filterGenre));
      const matchPlatform = filterPlatform === "" || (m.platform && m.platform.includes(filterPlatform));
      return matchSearch && matchGenre && matchPlatform;
    });
  }, [movies, search, filterGenre, filterPlatform]);

  // ระบบแบ่งหน้า (Pagination)
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterGenre, filterPlatform]);

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      {/* Header Section */}
      <div className="text-center" style={{ margin: '2rem 0', padding: '0 1rem' }}>
        <span className="gl-subtitle" style={{ fontSize: '0.75rem' }}>Girl Love Collection</span>
        <h1 className="gl-title" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', lineHeight: '1.2' }}>GL Showtime TH</h1>
        <p className="gl-desc" style={{ fontSize: '0.9rem' }}>คลังภาพยนตร์ GIRL LOVE - อัปเดตล่าสุด</p>
      </div>

      {/* แถบค้นหา - ปรับให้ Responsive */}
      <div className="glass-panel search-wrapper" style={{ 
        width: 'calc(100% - 2rem)', 
        maxWidth: '600px', 
        margin: '0 auto 1.5rem auto' 
      }}>
        <div className="search-icon"><Search size={20} /></div>
        <input
          className="search-input"
          type="text"
          placeholder="ค้นหาชื่อภาพยนตร์..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {/* แถบตัวกรอง - ปรับให้ยืดหยุ่นตามจอ */}
      <div className="filter-container" style={{ 
        padding: '0 1rem', 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: '0.75rem' 
      }}>
        <select 
          className="filter-select" 
          value={filterGenre} 
          onChange={(e) => setFilterGenre(e.target.value)}
          style={{ flex: '1 1 160px', maxWidth: '280px' }}
        >
          <option value="">ทุกหมวดหมู่ (All Genres)</option>
          {uniqueGenres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        
        <select 
          className="filter-select" 
          value={filterPlatform} 
          onChange={(e) => setFilterPlatform(e.target.value)}
          style={{ flex: '1 1 160px', maxWidth: '280px' }}
        >
          <option value="">ทุกแพลตฟอร์ม (All Platforms)</option>
          {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* แสดงรายการหนัง - ปรับ Grid ให้รองรับมือถือ */}
      <div className="movie-grid" style={{ 
        marginTop: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {paginatedMovies.map(movie => (
          <div key={movie.id} onClick={() => setSelectedMovie(movie)} style={{ cursor: 'pointer' }}>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '5rem 0' }}>ไม่พบภาพยนตร์ที่ค้นหา</div>
      )}

      {/* ปุ่มแบ่งหน้า */}
      {totalPages > 1 && (
        <div className="pagination" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft size={16} />
          </button>
          <span className="page-info">หน้า {currentPage} / {totalPages}</span>
          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Modal Popup - ปรับขนาดคอนเทนต์ให้ Responsive */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="glass-panel modal-content" style={{ 
            width: '95%', 
            maxWidth: '750px', 
            borderRadius: '1.5rem',
            margin: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMovie(null)}><X size={20} /></button>
            
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
              <img src={getYoutubeThumbnail(selectedMovie.youtube_url)} alt={selectedMovie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1.5rem 1.5rem 0 0' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-color), transparent)' }}></div>
              <a href={selectedMovie.youtube_url} target="_blank" rel="noreferrer" style={{ 
                position: 'absolute', bottom: '1rem', right: '1rem', 
                background: 'var(--pink-accent)', color: 'white', padding: '0.5rem 1rem', 
                borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', 
                textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem' 
              }}>
                <PlayCircle size={18} /> ดูตัวอย่าง
              </a>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontFamily: 'Playfair Display, serif' }}>{selectedMovie.title}</h2>
                {selectedMovie.rating && <div className="rating-badge"><Star size={14} fill="currentColor" /> {selectedMovie.rating}</div>}
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '0.75rem', 
                marginBottom: '1.5rem', 
                color: 'var(--text-muted)', 
                fontSize: '0.85rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Tv size={14} color="var(--pink-accent)"/> {selectedMovie.platform || '-'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14} color="var(--pink-accent)"/> {selectedMovie.release_date || '-'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} color="var(--pink-accent)"/> {selectedMovie.air_day} {selectedMovie.air_time}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} color="var(--pink-accent)"/> {selectedMovie.director || '-'}</div>
              </div>

              {selectedMovie.admin_note && (
                <div style={{ background: 'rgba(236, 72, 153, 0.08)', borderLeft: '4px solid var(--pink-accent)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pink-accent)', fontWeight: 'bold', marginBottom: '0.4rem', fontSize: '0.9rem' }}><Info size={16} /> ADMIN NOTE</div>
                  <p style={{ color: 'var(--text-main)', lineHeight: '1.5', whiteSpace: 'pre-line', fontSize: '0.9rem' }}>{selectedMovie.admin_note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;