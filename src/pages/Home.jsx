import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase'; 

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const STATUS_ALL = 'ทั้งหมด';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedStatus, setSelectedStatus] = useState(STATUS_ALL);

  const [selectedMovie, setSelectedMovie] = useState(null);

  // ดึงข้อมูลจาก Supabase
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('movies') 
          .select('*')
          .order('id', { ascending: false });

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

  // ระบบ Filter ข้อมูล
  useEffect(() => {
    let result = movies;
    
    // ค้นหาชื่อเรื่อง (title)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m => m.title?.toLowerCase().includes(term));
    }
    
    // กรองหมวดหมู่ (genre)
    if (selectedGenre !== 'All Genres') {
      result = result.filter(m => m.genre === selectedGenre);
    }
    
    // กรองแพลตฟอร์ม (platform)
    if (selectedPlatform !== 'All Platforms') {
      result = result.filter(m => m.platform === selectedPlatform);
    }
    
    // กรองสถานะ (status)
    if (selectedStatus !== STATUS_ALL) {
      result = result.filter(m => {
        // ดึงสถานะจาก DB มาเป็นตัวพิมพ์เล็กเพื่อเทียบ
        const dbStatus = (m.status || '').toLowerCase();
        
        if (selectedStatus === 'Ended (จบแล้ว)') return dbStatus.includes('ended');
        // จัดการกรณีพิเศษ ถ้า On Air ดันเก็บเป็น Standard ใน DB (ตามที่คุณเคยแจ้ง)
        if (selectedStatus === 'On Air (กำลังออนแอร์)') return dbStatus.includes('on air') || dbStatus.includes('standard');
        if (selectedStatus === 'Coming Soon (เร็วๆนี้)') return dbStatus.includes('coming soon');
        
        return dbStatus === selectedStatus.toLowerCase();
      });
    }
    setFilteredMovies(result);
  }, [searchTerm, selectedGenre, selectedPlatform, selectedStatus, movies]);

  // ฟังก์ชันแยก ID YouTube
  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/) || url.match(/embed\/([^?]+)/);
    return match ? match[1] : null;
  };

  // ฟังก์ชันสกัดภาพปกจาก YouTube หรือใช้รูปภาพที่มี
  const getCoverImage = (movie) => {
    // ถ้ามี URL ภาพ (กรณีที่คุณอาจจะเพิ่ม column ภาพในอนาคต)
    if (movie.image_url) return movie.image_url;
    
    // ใช้ youtube_url จากโครงสร้าง DB ของคุณ
    const ytId = getYoutubeId(movie.youtube_url);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    }
    return 'https://via.placeholder.com/400x250/2a2a32/FFFFFF?text=No+Cover';
  };

  const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>;
  const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#FFD700" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>;
  const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>;

  return (
    <div style={{ backgroundColor: '#0f0f13', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem', boxSizing: 'border-box' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ color: '#ff4d85', fontSize: '0.875rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Girl Love Collection</p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>GL Showtime TH</h1>
          <p style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>คลังภาพยนตร์ GIRL LOVE - อัปเดตล่าสุด</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '500px' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#a0a0a0' }}><SearchIcon /></div>
              <input type="text" placeholder="ค้นหาชื่อภาพยนตร์..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', backgroundColor: '#1c1c21', border: '1px solid #2a2a32', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}/>
            </div>
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} style={{ padding: '0.75rem 1rem', backgroundColor: '#1c1c21', border: '1px solid #2a2a32', borderRadius: '8px', color: '#fff', outline: 'none', cursor: 'pointer', flex: '1 1 150px' }}>
              <option>All Genres</option>
              <option>Drama Romance</option>
              <option>Fantasy</option>
              <option>Romance</option>
              <option>Drama</option>
              <option>Comedy</option>
            </select>
            <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} style={{ padding: '0.75rem 1rem', backgroundColor: '#1c1c21', border: '1px solid #2a2a32', borderRadius: '8px', color: '#fff', outline: 'none', cursor: 'pointer', flex: '1 1 150px' }}>
              <option>All Platforms</option>
              <option>oneD</option>
              <option>iQIYI</option>
              <option>CH3 Plus</option>
              <option>Netflix</option>
              <option>Youtube</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[STATUS_ALL, 'Ended (จบแล้ว)', 'On Air (กำลังออนแอร์)', 'Coming Soon (เร็วๆนี้)'].map(stat => (
              <button 
                key={stat} onClick={() => setSelectedStatus(stat)}
                style={{
                  padding: '0.5rem 1.5rem', borderRadius: '99px',
                  backgroundColor: selectedStatus === stat ? '#331a24' : '#1c1c21',
                  color: selectedStatus === stat ? '#ff4d85' : '#a0a0a0',
                  border: `1px solid ${selectedStatus === stat ? '#ff4d85' : '#2a2a32'}`,
                  cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.875rem'
                }}
              >
                {stat}
              </button>
            ))}
          </div>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#ff4d85' }}>กำลังโหลดข้อมูล...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
            {filteredMovies.length > 0 ? filteredMovies.map(movie => (
              <div 
                key={movie.id} onClick={() => setSelectedMovie(movie)}
                style={{ backgroundColor: '#1c1c21', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2a32', cursor: 'pointer', transition: 'transform 0.2s ease, borderColor 0.2s ease', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#ff4d85'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#2a2a32'; }}
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
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {movie.title || 'ไม่มีชื่อเรื่อง'}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ color: '#a0a0a0', fontSize: '0.875rem' }}>{movie.genre || '-'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#332a00', color: '#ffd700', padding: '2px 8px', borderRadius: '4px', fontSize: '0.875rem' }}>
                      <StarIcon /> {movie.rating || '-'}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#a0a0a0' }}>ไม่พบข้อมูลภาพยนตร์ที่คุณค้นหา</div>
            )}
          </div>
        )}
      </div>

      {/* Modal Details */}
      {selectedMovie && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem', boxSizing: 'border-box'
        }} onClick={() => setSelectedMovie(null)}>
          
          <div style={{
            backgroundColor: '#1c1c21', width: '100%', maxWidth: '650px', borderRadius: '12px', overflow: 'hidden', 
            border: '1px solid #3a3a42', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #2a2a32' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>รายละเอียด</h2>
              <button onClick={() => setSelectedMovie(null)} style={{ background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer', padding: '4px' }}><CloseIcon /></button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              
              {/* Media Section: โชว์วิดีโอถ้ามีลิงก์ youtube_url ถ้าไม่มีให้โชว์รูปปกแทน */}
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

              <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#ff4d85' }}>
                {selectedMovie.title || 'ไม่มีชื่อเรื่อง'}
              </h1>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {/* แสดงสถานะ (status) ตรงๆ จาก Database */}
                {selectedMovie.status && <span style={{ backgroundColor: '#2a2a32', padding: '4px 10px', borderRadius: '4px', fontSize: '0.875rem' }}>{selectedMovie.status}</span>}
                
                {selectedMovie.genre && <span style={{ backgroundColor: '#2a2a32', padding: '4px 10px', borderRadius: '4px', fontSize: '0.875rem' }}>{selectedMovie.genre}</span>}
                {selectedMovie.platform && <span style={{ backgroundColor: '#2a2a32', padding: '4px 10px', borderRadius: '4px', fontSize: '0.875rem' }}>{selectedMovie.platform}</span>}
                <span style={{ backgroundColor: '#332a00', color: '#ffd700', padding: '4px 10px', borderRadius: '4px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <StarIcon /> {selectedMovie.rating || '-'}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.9rem', color: '#ccc', marginBottom: '1.5rem', backgroundColor: '#202026', padding: '1rem', borderRadius: '8px' }}>
                <div><strong style={{ color: '#fff' }}>ผู้กำกับ:</strong> {selectedMovie.director || '-'}</div>
                <div><strong style={{ color: '#fff' }}>วันฉาย:</strong> {selectedMovie.release_date || '-'}</div>
                {/* 
                  หมายเหตุ: ในรายการ Column ไม่มี 'onair_day' หรือ 'day' เลย 
                  คุณอาจต้องเพิ่ม Column นี้ใน DB หรือไม่ก็ใช้วิธีเก็บวันออนแอร์ไว้ใน admin_note แทน
                  (อันนี้ผมคงโค้ดไว้ให้ก่อนเผื่อคุณไปเพิ่มทีหลัง)
                */}
                <div><strong style={{ color: '#fff' }}>วันออนแอร์:</strong> {selectedMovie.air_day || '-'}</div>
                <div><strong style={{ color: '#fff' }}>เวลาออนแอร์:</strong> {selectedMovie.air_time || '-'}</div>
              </div>

              <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>เรื่องย่อ / Note</h4>
              <p style={{ color: '#d0d0d0', lineHeight: '1.6', margin: 0, backgroundColor: '#2a2a32', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                {/* ดึงข้อมูลจาก admin_note ตรงๆ เลย เพราะนี่คือ Column เดียวที่เก็บเนื้อหานี้ */}
                {selectedMovie.admin_note || 'ยังไม่มีคำอธิบายสำหรับเรื่องนี้'}
              </p>
            </div>
            
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #2a2a32', textAlign: 'right' }}>
              <button onClick={() => setSelectedMovie(null)} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#3a3a42', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}