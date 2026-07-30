import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { notifyMovieAction } from '../utils/telegram';
import { Film, Plus, Save, AlertCircle, CheckCircle, Bookmark, KeyRound, Star, PlayCircle, Trash2, ExternalLink } from 'lucide-react';

export default function GuestDashboard() {
  const navigate = useNavigate();
  const [guestUser, setGuestUser] = useState(null);
  const [activeTab, setActiveTab] = useState('add');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // State สำหรับฟอร์มเพิ่มหนัง
  const initialForm = {
    domain: 'GL', status: 'Coming Soon', title: '', platform: '', genre: '', 
    director: '', release_date: '', rating: '', air_day: '', air_time: '', 
    youtube_url: '', admin_note: 'เพิ่มโดยสมาชิกคอมมูนิตี้'
  };
  const [formData, setFormData] = useState(initialForm);

  // State สำหรับ Watchlist และ เปลี่ยนรหัสผ่าน
  const [watchlist, setWatchlist] = useState([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // ดึงข้อมูล User ตอนเริ่มต้น
  useEffect(() => {
    const storedGuest = localStorage.getItem('guestUser');
    if (storedGuest) {
      try {
        const parsedUser = JSON.parse(storedGuest);
        setGuestUser(parsedUser);
        fetchWatchlist(parsedUser.id);
      } catch (error) {
        console.error("Failed to parse guest user");
      }
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  // ฟังก์ชันช่วยดึงรูปปกจาก YouTube
  const getYoutubeThumbnail = (url) => {
    if (!url) return 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=No+Cover';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=Invalid+Link';
  };

  // ดึงข้อมูล Watchlist พร้อมข้อมูลหนัง
  const fetchWatchlist = async (userId) => {
    setIsLoadingWatchlist(true);
    try {
      // 1. ดึง ID ของหนังที่เซฟไว้ทั้งหมด
      const { data: watchData, error } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      if (watchData && watchData.length > 0) {
        // 2. แยก ID ตามหมวดหมู่ GL และ BL
        const glIds = watchData.filter(w => w.domain === 'GL').map(w => w.movie_id);
        const blIds = watchData.filter(w => w.domain === 'BL').map(w => w.movie_id);

        let glMovies = [];
        let blMovies = [];

        // 3. ดึงข้อมูลหนังจากตาราง movies (GL)
        if (glIds.length > 0) {
          const { data: glData } = await supabase.from('movies').select('*').in('id', glIds);
          glMovies = glData || [];
        }

        // 4. ดึงข้อมูลหนังจากตาราง movies_bl (BL)
        if (blIds.length > 0) {
          const { data: blData } = await supabase.from('movies_bl').select('*').in('id', blIds);
          blMovies = blData || [];
        }

        // 5. นำข้อมูลหนังมาเชื่อมกับ Watchlist Data
        const enrichedWatchlist = watchData.map(item => {
          const movieDetails = item.domain === 'GL' 
            ? glMovies.find(m => m.id === item.movie_id)
            : blMovies.find(m => m.id === item.movie_id);
          
          return { ...item, movie: movieDetails };
        }).filter(item => item.movie); // กรองเอาเฉพาะที่ยังไม่ถูกลบออกจากระบบ

        setWatchlist(enrichedWatchlist);
      } else {
        setWatchlist([]);
      }
    } catch (error) {
      console.error(error);
      showToast('ไม่สามารถดึงข้อมูลรายการโปรดได้', 'error');
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  const removeFromWatchlist = async (id) => {
    try {
      const { error } = await supabase.from('watchlists').delete().eq('id', id);
      if (error) throw error;
      
      setWatchlist(prev => prev.filter(item => item.id !== id));
      showToast('ลบออกจากรายการโปรดแล้ว', 'success');
    } catch (error) {
      showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ================= 1. ฟังก์ชันเพิ่มหนัง =================
  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!guestUser) return;
    
    setLoading(true);
    const { domain, ...saveData } = formData;
    const tableName = domain === 'GL' ? 'movies' : 'movies_bl';

    try {
      const { error } = await supabase.from(tableName).insert([saveData]);
      if (error) throw error;

      showToast('เพิ่มภาพยนตร์เข้าสู่ระบบสำเร็จ! ขอบคุณที่ร่วมแบ่งปัน', 'success');
      notifyMovieAction('ADD', formData.title, domain, `Guest: ${guestUser.username}`);
      setFormData(initialForm);
      
      setTimeout(() => { navigate(domain === 'GL' ? '/' : '/bl'); }, 2000);
    } catch (error) {
      showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ================= 2. ฟังก์ชันเปลี่ยนรหัสผ่าน =================
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showToast('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน', 'error');
    }
    if (passwordForm.newPassword.length < 6) {
      return showToast('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
    }

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('guestlogin')
        .select('*')
        .eq('id', guestUser.id)
        .eq('password', passwordForm.oldPassword)
        .single();

      if (fetchError || !data) throw new Error('รหัสผ่านเดิมไม่ถูกต้อง');

      const { error: updateError } = await supabase
        .from('guestlogin')
        .update({ password: passwordForm.newPassword })
        .eq('id', guestUser.id);

      if (updateError) throw updateError;

      showToast('เปลี่ยนรหัสผ่านสำเร็จ!', 'success');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      
      // อัปเดต LocalStorage ใหม่
      const updatedUser = { ...guestUser, password: passwordForm.newPassword };
      localStorage.setItem('guestUser', JSON.stringify(updatedUser));
      setGuestUser(updatedUser);

    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!guestUser) return null;

  return (
    <div className="py-10 px-4 max-w-6xl mx-auto min-h-[80vh] font-prompt">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-8 right-4 md:right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border animate-in fade-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-red-500/90 border-red-400 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* ================= HEADER SECTION ================= */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-wider mb-3">
          GUEST MODE
        </h1>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-gray-500 dark:text-gray-400">เข้าสู่ระบบในฐานะ:</span>
          <strong className="text-sm text-gray-900 dark:text-white">{guestUser.username}</strong>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/30 font-bold tracking-wider">
            ★ GUEST
          </span>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-white/5 p-2 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm w-fit">
          <button 
            onClick={() => setActiveTab('add')} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'add' 
                ? 'bg-pink-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <Plus size={16} /> เพิ่มภาพยนตร์
          </button>
          <button 
            onClick={() => setActiveTab('watchlist')} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'watchlist' 
                ? 'bg-pink-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <Bookmark size={16} /> รายการโปรด
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'settings' 
                ? 'bg-pink-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <KeyRound size={16} /> เปลี่ยนรหัสผ่าน
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ADD MOVIE ================= */}
      {activeTab === 'add' && (
        <div className="bg-white dark:bg-[#1a1a2e]/60 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
            เพิ่มภาพยนตร์ใหม่
          </h2>
          
          <form onSubmit={handleAddMovie} className="flex flex-col gap-6">
            {/* Domain Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">หมวดหมู่เว็บไซต์ (GL / BL) <span className="text-pink-500">*</span></label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  type="button" onClick={() => setFormData({...formData, domain: 'GL'})}
                  className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    formData.domain === 'GL' 
                      ? 'bg-pink-50 border-pink-500 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 font-bold shadow-sm' 
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-black/30 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.domain === 'GL' ? 'border-pink-500' : 'border-gray-400'}`}>
                    {formData.domain === 'GL' && <span className="w-2 h-2 bg-pink-500 rounded-full"></span>}
                  </span>
                  GL SHOWTIME
                </button>
                <button 
                  type="button" onClick={() => setFormData({...formData, domain: 'BL'})}
                  className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    formData.domain === 'BL' 
                      ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold shadow-sm' 
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-black/30 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.domain === 'BL' ? 'border-blue-500' : 'border-gray-400'}`}>
                    {formData.domain === 'BL' && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                  </span>
                  BL SHOWTIME
                </button>
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">สถานะภาพยนตร์ <span className="text-pink-500">*</span></label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['Standard', 'Coming Soon', 'Ended'].map((status) => {
                  const isSelected = formData.status === status;
                  const themeColor = formData.domain === 'BL' ? 'blue' : 'pink';
                  const activeClass = formData.domain === 'BL' 
                    ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold shadow-sm' 
                    : 'bg-pink-50 border-pink-500 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 font-bold shadow-sm';
                  
                  return (
                    <button 
                      key={status} type="button" onClick={() => setFormData({...formData, status})}
                      className={`py-3 px-4 rounded-xl border flex items-center gap-3 transition-all text-sm ${
                        isSelected ? activeClass : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-black/30 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? `border-${themeColor}-500` : 'border-gray-400'}`}>
                        {isSelected && <span className={`w-2 h-2 bg-${themeColor}-500 rounded-full`}></span>}
                      </span>
                      {status === 'Standard' ? 'On Air (กำลังออนแอร์)' : status === 'Coming Soon' ? 'Coming Soon (เร็วๆ นี้)' : 'Ended (จบแล้ว)'}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">ชื่อเรื่อง <span className="text-pink-500">*</span></label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 focus:ring-1 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">แพลตฟอร์ม</label>
                <input type="text" name="platform" value={formData.platform} onChange={handleInputChange} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">หมวดหมู่</label>
                <input type="text" name="genre" value={formData.genre} onChange={handleInputChange} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">ผู้กำกับ</label>
                <input type="text" name="director" value={formData.director} onChange={handleInputChange} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">วันฉาย</label>
                <input type="text" name="release_date" value={formData.release_date} onChange={handleInputChange} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">คะแนน</label>
                <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleInputChange} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">วันออนแอร์</label>
                <input type="text" name="air_day" value={formData.air_day} onChange={handleInputChange} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">เวลาออนแอร์</label>
                <input type="text" name="air_time" value={formData.air_time} onChange={handleInputChange} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">ลิงก์ตัวอย่าง YOUTUBE <span className="text-pink-500">*</span></label>
                <input type="url" name="youtube_url" required value={formData.youtube_url} onChange={handleInputChange} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-all" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">เรื่องย่อ / Note</label>
              <textarea name="admin_note" rows="3" value={formData.admin_note} onChange={handleInputChange} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-all resize-none"></textarea>
            </div>

            <div className="mt-2 pt-6 border-t border-gray-200 dark:border-white/10 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full md:w-auto px-8 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                  formData.domain === 'BL' 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30' 
                    : 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'กำลังบันทึกข้อมูล...' : <><Save size={18} /> ยืนยันการเพิ่ม</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 2: WATCHLIST ================= */}
      {activeTab === 'watchlist' && (
        <div className="bg-white dark:bg-[#1a1a2e]/60 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
            รายการโปรดของคุณ (Watchlist)
          </h2>
          
          {isLoadingWatchlist ? (
            <div className="text-center py-10 text-pink-500 font-bold">กำลังโหลดรายการโปรด...</div>
          ) : watchlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {watchlist.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative bg-gray-50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                  onClick={() => {
                     // เมื่อกดที่การ์ด ให้ลิงก์กลับไปหน้าแรกของ GL หรือ BL 
                     // (หรือถ้าต้องการให้ทำ Modal Popup ตรงนี้ก็สามารถเพิ่มได้)
                     navigate(item.domain === 'BL' ? '/bl' : '/');
                  }}
                >
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-black cursor-pointer">
                    <img 
                      src={getYoutubeThumbnail(item.movie.youtube_url)} 
                      alt={item.movie.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold shadow-lg border border-white/10">
                      {item.domain}
                    </div>
                    {/* ปุ่มสำหรับลบออกจากรายการโปรด */}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromWatchlist(item.id); }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-lg hover:scale-110"
                      title="ลบออกจากรายการโปรด"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-base font-bold mb-1 text-gray-900 dark:text-white truncate" title={item.movie.title}>
                      {item.movie.title}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between">
                       <span>{item.movie.genre || 'N/A'}</span>
                       <span className="flex items-center gap-1 text-yellow-500 font-bold text-xs"><Star size={12} fill="currentColor"/> {item.movie.rating || '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 border-dashed rounded-2xl">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-30 text-gray-400" />
              คุณยังไม่มีรายการโปรดในตอนนี้ <br/> ไปที่หน้าแรกแล้วกดไอคอน <b>เก็บไว้ดู</b> เพื่อเพิ่มซีรีส์โปรดของคุณสิ!
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-[#1a1a2e]/60 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-xl animate-in fade-in slide-in-from-bottom-4 max-w-xl mx-auto">
          <div className="text-center mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
            <KeyRound className="w-10 h-10 mx-auto text-pink-500 mb-3" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">เปลี่ยนรหัสผ่าน</h2>
          </div>
          
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">รหัสผ่านเดิม <span className="text-pink-500">*</span></label>
              <input type="password" required value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">รหัสผ่านใหม่ (6 ตัวขึ้นไป) <span className="text-pink-500">*</span></label>
              <input type="password" required minLength={6} value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">ยืนยันรหัสผ่านใหม่ <span className="text-pink-500">*</span></label>
              <input type="password" required minLength={6} value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full bg-transparent border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-all" />
            </div>
            <button type="submit" disabled={loading} className="w-full mt-4 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}