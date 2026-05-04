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

  // ดึงหมวดหมู่และแพลตฟอร์มทั้งหมดที่มีมาทำ Dropdown อัตโนมัติ (ไม่ให้ซ้ำกัน)
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

  // รีเซ็ตหน้ากลับไปหน้าที่ 1 เสมอเวลาพิมพ์ค้นหาหรือเปลี่ยนฟิลเตอร์
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterGenre, filterPlatform]);

  return (
    <div>
      <div className="text-center" style={{ margin: '3rem 0' }}>
        <span className="gl-subtitle">Girl Love Collection</span>
        <h1 className="gl-title">GL Showtime TH</h1>
        <p className="gl-desc">คลังภาพยนตร์ GIRL LOVE - อัปเดตล่าสุด</p>
      </div>

      {/* แถบค้นหา */}
      <div className="glass-panel search-wrapper" style={{ marginBottom: '1rem' }}>
        <div className="search-icon"><Search size={20} /></div>
        <input
          className="search-input"
          type="text"
          placeholder="ค้นหาชื่อภาพยนตร์..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* แถบตัวกรอง */}
      <div className="filter-container">
        <select className="filter-select" value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
          <option value="">ทุกหมวดหมู่ (All Genres)</option>
          {uniqueGenres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        
        <select className="filter-select" value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
          <option value="">ทุกแพลตฟอร์ม (All Platforms)</option>
          {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* แสดงรายการหนัง */}
      <div className="movie-grid">
        {paginatedMovies.map(movie => (
          <div key={movie.id} onClick={() => setSelectedMovie(movie)} style={{ cursor: 'pointer' }}>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>ไม่พบภาพยนตร์ที่ค้นหา</div>
      )}

      {/* ปุ่มแบ่งหน้า */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft size={16} /> ก่อนหน้า
          </button>
          <span className="page-info">หน้า {currentPage} จาก {totalPages}</span>
          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            ถัดไป <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Modal Popup (โค้ดเดิม) */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMovie(null)}><X size={20} /></button>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
              <img src={getYoutubeThumbnail(selectedMovie.youtube_url)} alt={selectedMovie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem 1rem 0 0' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-color), transparent)', borderRadius: '1rem 1rem 0 0' }}></div>
              <a href={selectedMovie.youtube_url} target="_blank" rel="noreferrer" style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', background: 'var(--pink-accent)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' }}>
                <PlayCircle size={20} /> ดูตัวอย่าง
              </a>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontFamily: 'Playfair Display, serif' }}>{selectedMovie.title}</h2>
                {selectedMovie.rating && <div className="rating-badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}><Star size={18} fill="currentColor" /> {selectedMovie.rating}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Tv size={16} color="var(--pink-accent)"/> {selectedMovie.platform || '-'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} color="var(--pink-accent)"/> เริ่มฉาย: {selectedMovie.release_date || '-'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} color="var(--pink-accent)"/> ออนแอร์: {selectedMovie.air_day} {selectedMovie.air_time ? `(${selectedMovie.air_time})` : ''}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} color="var(--pink-accent)"/> กำกับโดย: {selectedMovie.director || '-'}</div>
              </div>
              {selectedMovie.admin_note && (
                <div style={{ background: 'rgba(236, 72, 153, 0.1)', borderLeft: '4px solid var(--pink-accent)', padding: '1rem', borderRadius: '0 0.5rem 0.5rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pink-accent)', fontWeight: 'bold', marginBottom: '0.5rem' }}><Info size={18} /> ADMIN NOTE</div>
                  <p style={{ color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{selectedMovie.admin_note}</p>
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