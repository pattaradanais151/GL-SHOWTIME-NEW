import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase'; 
import { useLanguage } from '../contexts/LanguageContext';

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const { t, language } = useLanguage();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
    { id: 'ALL', label: t('home.status_all') },
    { id: 'ENDED', label: t('home.status_ended') },
    { id: 'ONAIR', label: t('home.status_onair') },
    { id: 'SOON', label: t('home.status_soon') }
  ];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('movies').select('*').order('id', { ascending: false });
        if (error) throw error;
        if (data) {
          setMovies(data);
          setFilteredMovies(data);
        }
      } catch (error) {
        console.error('Error fetching movies:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

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
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/) || url.match(/embed\/([^?]+)/);
    return match ? match[1] : null;
  };

  const getCoverImage = (movie) => {
    if (movie.image_url) return movie.image_url;
    const ytId = getYoutubeId(movie.youtube_url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    return 'https://via.placeholder.com/400x250/2a2a32/FFFFFF?text=No+Cover';
  };

  const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>;
  const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#FFD700" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>;
  const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text-main)', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem', boxSizing: 'border-box' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ color: 'var(--pink-accent)', fontSize: '0.875rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Girl Love Collection</p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>GL Showtime TH</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('home.subtitle')}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '500px' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><SearchIcon /></div>
              <input type="text" placeholder={t('home.search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', backgroundColor: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box' }}/>
            </div>
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', flex: '1 1 150px' }}>
              <option value="All Genres">{t('home.all_genres')}</option>
              <option>Drama Romance</option>
              <option>Fantasy</option>
              <option>Romance</option>
              <option>Drama</option>
              <option>Comedy</option>
            </select>
            <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', flex: '1 1 150px' }}>
              <option value="All Platforms">{t('home.all_platforms')}</option>
              <option>oneD</option>
              <option>iQIYI</option>
              <option>CH3 Plus</option>
              <option>Netflix</option>
              <option>Youtube</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            {statusOptions.map(stat => (
              <button 
                key={stat.id} onClick={() => setSelectedStatus(stat.id)}
                style={{
                  padding: '0.5rem 1.5rem', borderRadius: '99px',
                  backgroundColor: selectedStatus === stat.id ? 'rgba(236, 72, 153, 0.1)' : 'var(--input-bg)',
                  color: selectedStatus === stat.id ? 'var(--pink-accent)' : 'var(--text-muted)',
                  border: `1px solid ${selectedStatus === stat.id ? 'var(--pink-accent)' : 'var(--glass-border)'}`,
                  cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.875rem'
                }}
              >
                {stat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--pink-accent)' }}>{t('home.loading')}</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
              {paginatedMovies.length > 0 ? paginatedMovies.map(movie => (
                <div 
                  key={movie.id} onClick={() => setSelectedMovie(movie)}
                  style={{ backgroundColor: 'var(--item-bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'transform 0.2s ease, borderColor 0.2s ease', display: 'flex', flexDirection: 'column' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--pink-accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                >
                  <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                    <img src={getCoverImage(movie)} alt={movie.title || 'Movie'} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    {movie.platform && (
                      <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#e50914', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {movie.platform}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
                      {movie.title || t('home.no_title')}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{movie.genre || '-'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(250, 204, 21, 0.1)', color: '#eab308', padding: '2px 8px', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                        <StarIcon /> {movie.rating || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>{t('home.no_data')}</div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination" style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className="page-btn" 
                  disabled={currentPage === 1} 
                  onClick={() => handlePageChange(currentPage - 1)}
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1 }}
                >
                  &laquo; {tPage.prev}
                </button>
                <span className="page-info" style={{ color: 'var(--text-muted)' }}>
                  {tPage.page} {currentPage} {tPage.of} {totalPages}
                </span>
                <button 
                  className="page-btn" 
                  disabled={currentPage === totalPages} 
                  onClick={() => handlePageChange(currentPage + 1)}
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.3 : 1 }}
                >
                  {tPage.next} &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedMovie && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem', boxSizing: 'border-box'
        }} onClick={() => setSelectedMovie(null)}>
          <div style={{
            backgroundColor: 'var(--bg-color)', width: '100%', maxWidth: '650px', borderRadius: '12px', overflow: 'hidden', 
            border: '1px solid var(--glass-border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{t('home.details')}</h2>
              <button onClick={() => setSelectedMovie(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}><CloseIcon /></button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
                {getYoutubeId(selectedMovie.youtube_url) ? (
                  <iframe 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    src={`https://www.youtube.com/embed/${getYoutubeId(selectedMovie.youtube_url)}`} 
                    title={selectedMovie.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <img src={getCoverImage(selectedMovie)} alt="Cover" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: 'var(--pink-accent)' }}>
                {selectedMovie.title || t('home.no_title')}
              </h1>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {selectedMovie.status && <span style={{ backgroundColor: 'var(--item-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.875rem' }}>{selectedMovie.status}</span>}
                {selectedMovie.genre && <span style={{ backgroundColor: 'var(--item-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.875rem' }}>{selectedMovie.genre}</span>}
                {selectedMovie.platform && <span style={{ backgroundColor: 'var(--item-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.875rem' }}>{selectedMovie.platform}</span>}
                <span style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)', color: '#eab308', padding: '4px 10px', borderRadius: '4px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                  <StarIcon /> {selectedMovie.rating || '-'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1.5rem', backgroundColor: 'var(--input-bg)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px' }}>
                <div><strong style={{ color: 'var(--text-main)' }}>{t('home.director')}</strong> {selectedMovie.director || '-'}</div>
                <div><strong style={{ color: 'var(--text-main)' }}>{t('home.release_date')}</strong> {selectedMovie.release_date || '-'}</div>
                <div><strong style={{ color: 'var(--text-main)' }}>{t('home.air_day')}</strong> {selectedMovie.air_day || '-'}</div>
                <div><strong style={{ color: 'var(--text-main)' }}>{t('home.air_time')}</strong> {selectedMovie.air_time || '-'}</div>
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{t('home.synopsis')}</h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', margin: 0, backgroundColor: 'var(--item-bg)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                {selectedMovie.admin_note || t('home.no_synopsis')}
              </p>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--glass-border)', textAlign: 'right', backgroundColor: 'var(--bg-color)' }}>
              <button onClick={() => setSelectedMovie(null)} style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                {t('home.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}