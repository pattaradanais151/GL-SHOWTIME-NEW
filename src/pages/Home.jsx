// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase'; 
import { useLanguage } from '../contexts/LanguageContext';
import { notifyVisit } from '../utils/telegram'; // นำเข้าฟังก์ชันแจ้งเตือน

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const { t, language } = useLanguage();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [heroMovies, setHeroMovies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const tPage = {
    th: { prev: "ก่อนหน้า", next: "ถัดไป", page: "หน้า", of: "จาก" },
    en: { prev: "Previous", next: "Next", page: "Page", of: "of" },
    ja: { prev: "前へ", next: "次へ", page: "ページ", of: "/" },
    lo: { prev: "ก่อนหน้า", next: "ถัดไป", page: "หน้า", of: "จาก" }
  }[language] || { prev: "ก่อนหน้า", next: "ถัดไป", page: "หน้า", of: "จาก" };

  const statusOptions = [
    { id: 'ALL', label: t('home.status_all') || 'ทั้งหมด' },
    { id: 'ENDED', label: t('home.status_ended') || 'Ended' },
    { id: 'ONAIR', label: t('home.status_onair') || 'On Air' },
    { id: 'SOON', label: t('home.status_soon') || 'Coming Soon' }
  ];

  // แจ้งเตือนเมื่อมีการเข้าชมหน้าเว็บ GL
  useEffect(() => {
    notifyVisit('หน้าหลัก (GL)');
  }, []);

  // ดึงข้อมูล
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('movies').select('*').order('id', { ascending: false });
        if (error) throw error;
        if (data) {
          setMovies(data);
          setFilteredMovies(data);

          let onAir = data.filter(m => (m.status || '').toLowerCase().includes('on air') || (m.status || '').toLowerCase().includes('standard'));
          if (onAir.length < 5) {
            const others = data.filter(m => !onAir.includes(m));
            onAir = [...onAir, ...others.slice(0, 5 - onAir.length)];
          } else {
            onAir = onAir.slice(0, 5);
          }
          setHeroMovies(onAir);
        }
      } catch (error) {
        console.error('Error fetching movies:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // ระบบ Auto-slide สำหรับ Hero Banner
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroMovies]);

  // ฟิลเตอร์
  useEffect(() => {
    let result = movies;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m => m.title?.toLowerCase().includes(term));
    }
    if (selectedGenre !== 'All Genres') result = result.filter(m => m.genre === selectedGenre);
    if (selectedPlatform !== 'All Platforms') result = result.filter(m => m.platform === selectedPlatform);
    
    if (selectedStatus !== 'ALL') {
      result = result.filter(m => {
        const dbStatus = (m.status || '').toLowerCase();
        if (selectedStatus === 'ENDED') return dbStatus.includes('ended');
        if (selectedStatus === 'ONAIR') return dbStatus.includes('on air') || dbStatus.includes('standard');
        if (selectedStatus === 'SOON') return dbStatus.includes('coming soon');
        return false;
      });
    }
    setFilteredMovies(result);
    setCurrentPage(1);
  }, [searchTerm, selectedGenre, selectedPlatform, selectedStatus, movies]);

  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getCoverImage = (movie) => {
    if (movie.image_url) return movie.image_url;
    const ytId = getYoutubeId(movie.youtube_url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    return 'https://via.placeholder.com/1280x720/2a2a32/FFFFFF?text=No+Cover';
  };

  const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>;
  const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>;
  const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>;
  const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: document.querySelector('.section-header').offsetTop - 100, behavior: 'smooth' });
  };

  return (
    <div className="home-wrapper">
      <div className="container">
        {!loading && heroMovies.length > 0 && (
          <div className="hero-slider-container">
            {heroMovies.map((movie, index) => (
              <div 
                key={movie.id} 
                className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setSelectedMovie(movie)}
              >
                <img src={getCoverImage(movie)} alt={movie.title} className="hero-slide-bg" />
                <div className="hero-slide-overlay"></div>
                <div className="hero-slide-content">
                  <span className="hero-badge">{movie.status || 'ON AIR'}</span>
                  <h1>{movie.title}</h1>
                  <p className="hero-genre">{movie.genre} {movie.rating ? `• ${movie.rating}` : ''}</p>
                  <p className="hero-synopsis">{movie.admin_note ? movie.admin_note.substring(0, 150) + '...' : ''}</p>
                  <button className="cta-btn">
                    <PlayIcon /> ดูข้อมูลเพิ่มเติม
                  </button>
                </div>
              </div>
            ))}
            
            <div className="hero-indicators">
              {heroMovies.map((_, index) => (
                <button 
                  key={index} 
                  className={`indicator-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="filter-section">
          <div className="search-wrapper-home">
            <div className="search-icon"><SearchIcon /></div>
            <input 
              type="text" 
              placeholder={t('home.search') || "ค้นหาชื่อภาพยนตร์..."} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="search-input-home"
            />
          </div>
          
          <div className="filter-dropdowns">
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="filter-select">
              <option value="All Genres">{t('home.all_genres') || 'All Genres'}</option>
              <option>Drama Romance</option>
              <option>Fantasy</option>
              <option>Romance</option>
              <option>Drama</option>
              <option>Comedy</option>
            </select>
            <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} className="filter-select">
              <option value="All Platforms">{t('home.all_platforms') || 'All Platforms'}</option>
              <option>oneD</option>
              <option>iQIYI</option>
              <option>CH3 Plus</option>
              <option>Netflix</option>
              <option>Youtube</option>
            </select>
          </div>

          <div className="status-filters">
            {statusOptions.map(stat => (
              <button 
                key={stat.id} 
                onClick={() => setSelectedStatus(stat.id)}
                className={`status-btn ${selectedStatus === stat.id ? 'active' : ''}`}
              >
                {stat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="section-header">
          <h2>Now Showing</h2>
        </div>

        {loading ? (
          <div className="loading-state">{t('home.loading') || 'กำลังโหลด...'}</div>
        ) : (
          <>
            <div className="movie-poster-grid">
              {paginatedMovies.length > 0 ? paginatedMovies.map(movie => (
                <div key={movie.id} className="movie-poster-card" onClick={() => setSelectedMovie(movie)}>
                  <div className="card-image-container">
                    <img src={getCoverImage(movie)} alt={movie.title || 'Movie'} className="card-image" />
                    
                    <div className="rating-overlay">
                      <StarIcon /> {movie.rating || '-'}
                    </div>
                    {movie.platform && (
                      <div className="platform-tag">
                        {movie.platform}
                      </div>
                    )}
                  </div>
                  
                  <div className="card-content">
                    <h3 className="card-title" title={movie.title}>{movie.title || t('home.no_title')}</h3>
                    <div className="card-meta">
                       <span className="card-genre">{movie.genre || 'N/A'}</span>
                    </div>
                    <button className="card-action-btn">
                      More Details
                    </button>
                  </div>
                </div>
              )) : (
                <div className="empty-state">{t('home.no_data') || 'ไม่พบข้อมูล'}</div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                  &laquo; {tPage.prev}
                </button>
                <span className="page-info">
                  {tPage.page} {currentPage} {tPage.of} {totalPages}
                </span>
                <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                  {tPage.next} &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content-movie" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('home.details') || 'รายละเอียด'}</h2>
              <button className="modal-close-btn" onClick={() => setSelectedMovie(null)}><CloseIcon /></button>
            </div>

            <div className="modal-body">
              <div className="modal-video-container">
                {getYoutubeId(selectedMovie.youtube_url) ? (
                  <iframe 
                    className="modal-iframe"
                    src={`https://www.youtube.com/embed/${getYoutubeId(selectedMovie.youtube_url)}?autoplay=1`} 
                    title={selectedMovie.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <>
                    <img src={getCoverImage(selectedMovie)} alt="Cover" className="modal-cover-img" style={{ opacity: selectedMovie.youtube_url ? 0.4 : 1 }} />
                    {selectedMovie.youtube_url && (
                      <div className="modal-play-btn-wrapper">
                        <a href={selectedMovie.youtube_url} target="_blank" rel="noopener noreferrer" className="modal-play-btn">
                          <PlayIcon /> Watch Video
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>

              <h1 className="modal-movie-title">{selectedMovie.title || t('home.no_title')}</h1>
              
              <div className="modal-tags">
                {selectedMovie.status && <span className="modal-tag">{selectedMovie.status}</span>}
                {selectedMovie.genre && <span className="modal-tag">{selectedMovie.genre}</span>}
                {selectedMovie.platform && <span className="modal-tag">{selectedMovie.platform}</span>}
                <span className="modal-tag highlight"><StarIcon /> {selectedMovie.rating || '-'}</span>
              </div>

              <div className="modal-info-grid">
                <div><strong>{t('home.director') || 'Director'}</strong> {selectedMovie.director || '-'}</div>
                <div><strong>{t('home.release_date') || 'Release'}</strong> {selectedMovie.release_date || '-'}</div>
                <div><strong>{t('home.air_day') || 'Air Day'}</strong> {selectedMovie.air_day || '-'}</div>
                <div><strong>{t('home.air_time') || 'Air Time'}</strong> {selectedMovie.air_time || '-'}</div>
              </div>

              <h4>{t('home.synopsis') || 'Synopsis'}</h4>
              <p className="modal-synopsis">{selectedMovie.admin_note || t('home.no_synopsis') || '-'}</p>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedMovie(null)}>
                {t('home.close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}