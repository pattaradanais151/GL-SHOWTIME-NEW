// src/pages/HomeBL.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase'; 
import { useLanguage } from '../contexts/LanguageContext';
import { notifyVisit } from '../utils/telegram'; 
import { 
  Search, Star, X, PlayCircle, BookmarkPlus, BookmarkCheck, 
  MessageSquare, Calendar, Clock, Tv, User, Info, AlertCircle, CheckCircle
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function HomeBL({ currentUser }) {
  const { t, language } = useLanguage();
  
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [heroMovies, setHeroMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('latest');

  const [watchlist, setWatchlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3000);
  };

  useEffect(() => {
    notifyVisit('หน้าหลัก (BL)');
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('movies_bl').select('*').order('id', { ascending: false });
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
        console.error('Error fetching BL movies:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!currentUser) return;
      try {
        const { data, error } = await supabase.from('watchlists').select('movie_id').eq('user_id', currentUser.id).eq('domain', 'BL');
        if (error) throw error;
        if (data) setWatchlist(data.map(item => item.movie_id));
      } catch (error) {
        console.error("Watchlist Fetch Error:", error.message);
      }
    };
    fetchWatchlist();
  }, [currentUser]);

  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [heroMovies]);

  useEffect(() => {
    let result = [...movies];
    
    if (searchTerm) {
      result = result.filter(m => m.title?.toLowerCase().includes(searchTerm.toLowerCase()));
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

    if (sortBy === 'rating_high') {
      result.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    } else if (sortBy === 'title_a_z') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      result.sort((a, b) => b.id - a.id);
    }

    setFilteredMovies(result);
    setCurrentPage(1);
  }, [searchTerm, selectedGenre, selectedPlatform, selectedStatus, sortBy, movies]);

  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = filteredMovies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: document.getElementById('movie-section').offsetTop - 100, behavior: 'smooth' });
  };

  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie);
    try {
      const { data, error } = await supabase.from('reviews')
        .select('*, profiles(username)')
        .eq('movie_id', movie.id)
        .eq('domain', 'BL')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setReviews(data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleWatchlist = async (e, movieId) => {
    e.stopPropagation();
    if (!currentUser) return showToast('กรุณาเข้าสู่ระบบก่อนเพิ่มเข้ารายการโปรด', 'error');
    
    try {
      const isSaved = watchlist.includes(movieId);
      if (isSaved) {
        const { error } = await supabase.from('watchlists').delete().eq('user_id', currentUser.id).eq('movie_id', movieId).eq('domain', 'BL');
        if (error) throw error;
        setWatchlist(prev => prev.filter(id => id !== movieId));
        showToast('ลบออกจากรายการโปรดแล้ว', 'success');
      } else {
        const { error } = await supabase.from('watchlists').insert([{ user_id: currentUser.id, movie_id: movieId, domain: 'BL' }]);
        if (error) throw error;
        setWatchlist(prev => [...prev, movieId]);
        showToast('เพิ่มเข้ารายการโปรดแล้ว!', 'success');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
      console.error(error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) return showToast('กรุณาเข้าสู่ระบบเพื่อรีวิว', 'error');
    setIsSubmittingReview(true);
    
    try {
      const { error } = await supabase.from('reviews').insert([{
        user_id: currentUser.id, movie_id: selectedMovie.id, domain: 'BL', rating: newRating, review_text: newReview
      }]);

      if (error) throw error;

      setNewReview('');
      showToast('ส่งรีวิวสำเร็จ! ขอบคุณสำหรับความคิดเห็น', 'success');
      const { data } = await supabase.from('reviews').select('*, profiles(username)').eq('movie_id', selectedMovie.id).eq('domain', 'BL').order('created_at', { ascending: false });
      if (data) setReviews(data);
    } catch (error) {
      showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
      console.error(error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-prompt">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-8 right-4 md:right-8 z-[9999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border animate-in fade-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-red-500/90 border-red-400 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* HERO SLIDER */}
        {!loading && heroMovies.length > 0 && (
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] min-h-[350px] md:min-h-[400px] rounded-2xl overflow-hidden mb-12 shadow-2xl bg-black group">
            {heroMovies.map((movie, index) => (
              <div 
                key={movie.id} 
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                onClick={() => handleMovieClick(movie)}
              >
                <img src={getCoverImage(movie)} alt={movie.title} className={`w-full h-full object-cover object-[center_20%] transition-transform duration-[6000ms] ease-out ${index === currentSlide ? 'scale-100' : 'scale-105'}`} />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-gray-900/95 via-gray-900/60 to-transparent"></div>
                <div className="absolute bottom-6 left-4 right-4 md:top-1/2 md:left-12 md:-translate-y-1/2 md:w-1/2 z-20 text-white flex flex-col md:block items-center md:items-start text-center md:text-left">
                  <span className="inline-block bg-[#4db8ff] text-white px-3 py-1 rounded text-xs font-bold mb-3 uppercase tracking-widest">{movie.status || 'ON AIR'}</span>
                  <h1 className="font-serif text-2xl md:text-4xl font-bold mb-2 leading-tight drop-shadow-md line-clamp-2">{movie.title}</h1>
                  <p className="text-[#4db8ff] font-medium mb-2 md:mb-4 text-sm md:text-base">{movie.genre} {movie.rating ? `• ${movie.rating}` : ''}</p>
                  <p className="hidden md:block text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3 drop-shadow-md">{movie.admin_note ? movie.admin_note : ''}</p>
                  <button className="bg-[#4db8ff] hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-bold transition-all duration-300 flex items-center gap-2 shadow-[0_4px_15px_rgba(77,184,255,0.4)] hover:-translate-y-0.5 hover:scale-105">
                    <PlayCircle size={20} /> ดูข้อมูลเพิ่มเติม
                  </button>
                </div>
              </div>
            ))}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 flex gap-2 z-20">
              {heroMovies.map((_, index) => (
                <button 
                  key={index} 
                  className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 bg-[#4db8ff]' : 'w-2.5 bg-white/40 hover:bg-white/60'}`}
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ADVANCED FILTERS */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 mb-12 shadow-lg">
          <div className="relative w-full max-w-2xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder={t('home.search') || "ค้นหาชื่อภาพยนตร์..."} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-black/20 border border-white/10 text-white rounded-xl pl-12 pr-4 py-3 backdrop-blur-md focus:outline-none focus:bg-black/40 focus:border-[#4db8ff] focus:ring-1 focus:ring-[#4db8ff]/30 transition-all duration-300 placeholder:text-gray-500"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 w-full mb-6">
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="flex-1 min-w-[150px] max-w-[250px] bg-black/20 border border-white/10 text-gray-200 rounded-xl px-4 py-2.5 backdrop-blur-md focus:outline-none focus:border-[#4db8ff] transition-colors [&>option]:bg-gray-900 cursor-pointer appearance-none">
              <option value="All Genres">{t('home.all_genres') || 'หมวดหมู่ทั้งหมด'}</option>
              <option>Drama Romance</option>
              <option>Fantasy</option>
              <option>Romance</option>
              <option>Drama</option>
              <option>Comedy</option>
            </select>

            <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} className="flex-1 min-w-[150px] max-w-[250px] bg-black/20 border border-white/10 text-gray-200 rounded-xl px-4 py-2.5 backdrop-blur-md focus:outline-none focus:border-[#4db8ff] transition-colors [&>option]:bg-gray-900 cursor-pointer appearance-none">
              <option value="All Platforms">{t('home.all_platforms') || 'แพลตฟอร์มทั้งหมด'}</option>
              <option>oneD</option>
              <option>iQIYI</option>
              <option>CH3 Plus</option>
              <option>Netflix</option>
              <option>Youtube</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 min-w-[150px] max-w-[250px] bg-black/20 border border-white/10 text-gray-200 rounded-xl px-4 py-2.5 backdrop-blur-md focus:outline-none focus:border-[#4db8ff] transition-colors [&>option]:bg-gray-900 cursor-pointer appearance-none">
              <option value="latest">อัปเดตล่าสุด</option>
              <option value="rating_high">คะแนนสูงสุด</option>
              <option value="title_a_z">ชื่อเรื่อง (A-Z)</option>
            </select>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {statusOptions.map(stat => (
              <button 
                key={stat.id} 
                onClick={() => setSelectedStatus(stat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${selectedStatus === stat.id ? 'bg-[#4db8ff]/20 text-[#4db8ff] border-[#4db8ff]/50' : 'bg-black/20 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}
              >
                {stat.label}
              </button>
            ))}
          </div>
        </div>

        <div id="movie-section" className="mb-6 pl-4 border-l-4 border-[#4db8ff]">
          <h2 className="text-2xl md:text-3xl font-bold text-white">BL Now Showing</h2>
        </div>

        {/* MOVIE GRID */}
        {loading ? (
          <div className="text-center py-20 text-[#4db8ff] font-bold text-xl">{t('home.loading') || 'กำลังโหลด...'}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedMovies.length > 0 ? paginatedMovies.map(movie => (
                <div key={movie.id} className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:border-[#4db8ff]/50 hover:shadow-[0_15px_40px_-10px_rgba(77,184,255,0.3)]" onClick={() => handleMovieClick(movie)}>
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-black">
                    <img src={getCoverImage(movie)} alt={movie.title || 'Movie'} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-yellow-400 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Star size={12} fill="currentColor" /> {movie.rating || '-'}
                    </div>
                    
                    {movie.platform && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        {movie.platform}
                      </div>
                    )}

                    <button 
                      className={`absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-lg ${watchlist.includes(movie.id) ? 'bg-[#4db8ff] border-none text-white' : 'bg-black/50 border border-white/20 text-white hover:bg-[#4db8ff] hover:border-[#4db8ff] hover:scale-110'}`}
                      onClick={(e) => toggleWatchlist(e, movie.id)}
                      title={watchlist.includes(movie.id) ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                    >
                      {watchlist.includes(movie.id) ? <BookmarkCheck size={18} /> : <BookmarkPlus size={18} />}
                    </button>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold mb-1 text-white truncate" title={movie.title}>{movie.title || t('home.no_title')}</h3>
                    <div className="text-sm text-gray-400 mb-4">
                       <span>{movie.genre || 'N/A'}</span>
                    </div>
                    <div className="mt-auto w-full bg-[#4db8ff]/10 text-[#4db8ff] border border-white/5 py-2.5 rounded-lg font-semibold text-center text-sm transition-all duration-300 group-hover:bg-[#4db8ff] group-hover:text-white group-hover:border-[#4db8ff]">
                      More Details
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-16 text-gray-500 bg-white/5 border border-white/10 border-dashed rounded-2xl">{t('home.no_data') || 'ไม่พบข้อมูล'}</div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 mb-8 flex-wrap">
                <button 
                  className="bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#4db8ff] hover:border-[#4db8ff] disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  disabled={currentPage === 1} 
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  &laquo; {tPage.prev}
                </button>
                <span className="text-gray-400 font-medium">
                  {tPage.page} <span className="text-white">{currentPage}</span> {tPage.of} {totalPages}
                </span>
                <button 
                  className="bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#4db8ff] hover:border-[#4db8ff] disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  disabled={currentPage === totalPages} 
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  {tPage.next} &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MOVIE MODAL */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex justify-center items-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedMovie(null)}>
          <div className="bg-gray-900/60 backdrop-blur-2xl border border-white/10 w-full max-w-4xl rounded-2xl flex flex-col max-h-[90vh] shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-center p-5 border-b border-white/10 bg-black/20">
              <h2 className="text-lg font-bold text-white m-0">{t('home.details') || 'รายละเอียด'}</h2>
              <button className="bg-white/5 border border-white/10 rounded-full text-gray-400 w-9 h-9 flex items-center justify-center transition-all duration-300 hover:text-white hover:bg-[#4db8ff] hover:border-[#4db8ff] hover:rotate-90" onClick={() => setSelectedMovie(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
              <div className="relative w-full pt-[56.25%] mb-6 rounded-xl overflow-hidden bg-black shadow-lg">
                {getYoutubeId(selectedMovie.youtube_url) ? (
                  <iframe 
                    className="absolute inset-0 w-full h-full border-none"
                    src={`https://www.youtube.com/embed/${getYoutubeId(selectedMovie.youtube_url)}?autoplay=1`} 
                    title={selectedMovie.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <>
                    <img src={getCoverImage(selectedMovie)} alt="Cover" className={`absolute inset-0 w-full h-full object-cover ${selectedMovie.youtube_url ? 'opacity-40' : 'opacity-100'}`} />
                    {selectedMovie.youtube_url && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <a href={selectedMovie.youtube_url} target="_blank" rel="noopener noreferrer" className="bg-[#4db8ff] hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-2 shadow-[0_4px_15px_rgba(77,184,255,0.5)] hover:scale-105">
                          <PlayCircle size={20} /> Watch Video
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-[#4db8ff] m-0 leading-tight">{selectedMovie.title || t('home.no_title')}</h1>
                <button 
                  className={`shrink-0 px-4 py-2 rounded-full flex items-center gap-2 font-medium transition-all duration-300 border ${watchlist.includes(selectedMovie.id) ? 'bg-[#4db8ff] border-[#4db8ff] text-white shadow-[0_0_15px_rgba(77,184,255,0.3)]' : 'bg-transparent border-[#4db8ff]/50 text-[#4db8ff] hover:bg-[#4db8ff]/10'}`}
                  onClick={(e) => toggleWatchlist(e, selectedMovie.id)}
                >
                  {watchlist.includes(selectedMovie.id) ? <><BookmarkCheck size={18}/> บันทึกแล้ว</> : <><BookmarkPlus size={18}/> เก็บไว้ดู</>}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {selectedMovie.status && <span className="bg-white/5 border border-white/10 text-gray-200 px-3 py-1 rounded-md text-sm font-medium">{selectedMovie.status}</span>}
                {selectedMovie.genre && <span className="bg-white/5 border border-white/10 text-gray-200 px-3 py-1 rounded-md text-sm font-medium">{selectedMovie.genre}</span>}
                {selectedMovie.platform && <span className="bg-white/5 border border-white/10 text-gray-200 px-3 py-1 rounded-md text-sm font-medium">{selectedMovie.platform}</span>}
                <span className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-500 flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-bold"><Star size={14} fill="currentColor"/> {selectedMovie.rating || '-'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-black/20 border border-white/5 p-5 rounded-xl text-sm text-gray-300">
                <div><strong className="block text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><User size={12}/> {t('home.director') || 'Director'}</strong> <span className="font-medium text-white">{selectedMovie.director || '-'}</span></div>
                <div><strong className="block text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={12}/> {t('home.release_date') || 'Release'}</strong> <span className="font-medium text-white">{selectedMovie.release_date || '-'}</span></div>
                <div><strong className="block text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={12}/> {t('home.air_day') || 'Air Day'}</strong> <span className="font-medium text-white">{selectedMovie.air_day || '-'}</span></div>
                <div><strong className="block text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={12}/> {t('home.air_time') || 'Air Time'}</strong> <span className="font-medium text-white">{selectedMovie.air_time || '-'}</span></div>
              </div>

              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Info size={18} className="text-[#4db8ff]"/> {t('home.synopsis') || 'Synopsis'}</h4>
              <p className="bg-white/5 border border-white/5 p-5 rounded-xl text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedMovie.admin_note || t('home.no_synopsis') || '-'}</p>

              {/* REVIEWS SECTION */}
              <div className="mt-10 border-t border-white/10 pt-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><MessageSquare size={20} className="text-[#4db8ff]"/> คะแนนและรีวิวจากผู้ชม</h3>
                
                {currentUser ? (
                  <form onSubmit={submitReview} className="bg-black/20 p-6 rounded-xl border border-white/5 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-400 mr-2">ให้คะแนน:</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} size={24} className="cursor-pointer transition-all duration-200 hover:scale-110"
                          fill={star <= newRating ? '#eab308' : 'none'} 
                          color={star <= newRating ? '#eab308' : '#666'} 
                          onClick={() => setNewRating(star)} 
                        />
                      ))}
                    </div>
                    <textarea 
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-4 focus:outline-none focus:border-[#4db8ff] focus:ring-1 focus:ring-[#4db8ff]/30 transition-all duration-300 resize-none placeholder:text-gray-600" 
                      rows="3" 
                      placeholder="บอกความรู้สึกของคุณเกี่ยวกับเรื่องนี้หน่อยสิ..." 
                      value={newReview} onChange={e => setNewReview(e.target.value)} required 
                    />
                    <div className="flex justify-end mt-4">
                      <button type="submit" className="bg-[#4db8ff] hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold transition-all duration-300 shadow-[0_4px_12px_rgba(77,184,255,0.3)]" disabled={isSubmittingReview}>
                        {isSubmittingReview ? 'กำลังส่ง...' : 'ส่งรีวิว'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-[#4db8ff]/10 border border-[#4db8ff]/20 p-4 rounded-xl text-center text-[#4db8ff] mb-8">
                    กรุณา <a href="/auth" className="text-white font-bold hover:underline mx-1">เข้าสู่ระบบ</a> เพื่อร่วมเขียนรีวิวและให้คะแนนซีรีส์เรื่องนี้
                  </div>
                )}
                
                <div className="flex flex-col gap-4">
                  {reviews.length > 0 ? reviews.map(rev => (
                    <div key={rev.id} className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-3">
                        <strong className="text-white font-medium">{rev.profiles?.username || 'สมาชิก'}</strong>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < rev.rating ? '#eab308' : 'none'} color={i < rev.rating ? '#eab308' : '#444'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed m-0">{rev.review_text}</p>
                      <div className="text-[11px] text-gray-500 mt-3 text-right">
                        {new Date(rev.created_at).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500 italic">ยังไม่มีรีวิวสำหรับเรื่องนี้ เป็นคนแรกที่รีวิวสิ!</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 md:p-5 border-t border-white/10 bg-black/20 flex justify-end">
              <button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-2 rounded-lg font-medium transition-all duration-300" onClick={() => setSelectedMovie(null)}>
                {t('home.close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}