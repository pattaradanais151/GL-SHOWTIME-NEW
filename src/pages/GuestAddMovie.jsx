import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { notifyMovieAction } from '../utils/telegram';
import { Film, Plus, Save, AlertCircle, CheckCircle, User } from 'lucide-react';

export default function GuestAddMovie() {
  const navigate = useNavigate();
  const [guestUser, setGuestUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const initialForm = {
    domain: 'GL',
    status: 'Coming Soon',
    title: '',
    platform: '',
    genre: '',
    director: '',
    release_date: '',
    rating: '',
    air_day: '',
    air_time: '',
    youtube_url: '',
    admin_note: 'เพิ่มโดยสมาชิกคอมมูนิตี้'
  };
  
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const storedGuest = localStorage.getItem('guestUser');
    if (storedGuest) {
      try {
        setGuestUser(JSON.parse(storedGuest));
      } catch (error) {
        console.error("Failed to parse guest user");
      }
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guestUser) return;
    
    setLoading(true);
    const { domain, ...saveData } = formData;
    const tableName = domain === 'GL' ? 'movies' : 'movies_bl';

    try {
      const { error } = await supabase.from(tableName).insert([saveData]);
      
      if (error) throw error;

      showToast('เพิ่มภาพยนตร์เข้าสู่ระบบสำเร็จ! ขอบคุณที่ร่วมแบ่งปัน', 'success');
      
      // แจ้งเตือน Telegram โดยระบุชื่อ Guest
      notifyMovieAction('ADD', formData.title, domain, `Guest: ${guestUser.username}`);

      setFormData(initialForm); // รีเซ็ตฟอร์ม
      
      // หน่วงเวลาแล้วพากลับหน้าแรก
      setTimeout(() => {
        navigate(domain === 'GL' ? '/' : '/bl');
      }, 2000);

    } catch (error) {
      showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // หากยังไม่ได้เข้าสู่ระบบ
  if (!guestUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 font-prompt">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <AlertCircle className="w-16 h-16 text-pink-500 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold text-white mb-2">จำกัดสิทธิ์การเข้าถึง</h2>
          <p className="text-gray-400 mb-6">กรุณาเข้าสู่ระบบก่อนร่วมเพิ่มข้อมูลซีรีส์</p>
          <Link to="/auth" className="inline-flex items-center justify-center w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl transition-all duration-300">
            <User className="mr-2" size={18} /> เข้าสู่ระบบเลย
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 font-prompt">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-8 right-4 md:right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border animate-in fade-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-red-500/90 border-red-400 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-[#1a1a2e]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
          <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500">
            <Plus size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white m-0">เพิ่มข้อมูลซีรีส์ใหม่</h1>
            <p className="text-gray-400 text-sm mt-1">ร่วมแบ่งปันข้อมูลซีรีส์ที่คุณชื่นชอบให้กับคอมมูนิตี้</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Domain Selection */}
          <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
            <label className="block text-sm font-medium text-gray-400 mb-3">หมวดหมู่เว็บไซต์ (GL / BL) <span className="text-pink-500">*</span></label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setFormData({...formData, domain: 'GL'})}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  formData.domain === 'GL' ? 'bg-pink-500/20 border-pink-500 text-pink-400 font-bold' : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                <Film size={18} /> GL SHOWTIME
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, domain: 'BL'})}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  formData.domain === 'BL' ? 'bg-blue-500/20 border-blue-500 text-blue-400 font-bold' : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                <Film size={18} /> BL SHOWTIME
              </button>
            </div>
          </div>

          {/* Status Selection */}
          <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
            <label className="block text-sm font-medium text-gray-400 mb-3">สถานะภาพยนตร์ <span className="text-pink-500">*</span></label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['Standard', 'Coming Soon', 'Ended'].map((status) => (
                <button 
                  key={status}
                  type="button"
                  onClick={() => setFormData({...formData, status})}
                  className={`py-2.5 px-4 rounded-xl border text-sm transition-all ${
                    formData.status === status 
                      ? (formData.domain === 'BL' ? 'bg-blue-500/20 border-blue-500 text-blue-400 font-bold' : 'bg-pink-500/20 border-pink-500 text-pink-400 font-bold')
                      : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {status === 'Standard' ? 'On Air (กำลังออนแอร์)' : status === 'Coming Soon' ? 'Coming Soon (เร็วๆ นี้)' : 'Ended (จบแล้ว)'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-400">ชื่อเรื่อง <span className="text-pink-500">*</span></label>
              <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="เช่น 23.5 องศาที่โลกเอียง" className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-400">แพลตฟอร์ม</label>
              <input type="text" name="platform" value={formData.platform} onChange={handleInputChange} placeholder="เช่น YouTube, Netflix" className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-400">หมวดหมู่ (Genre)</label>
              <input type="text" name="genre" value={formData.genre} onChange={handleInputChange} placeholder="เช่น Drama Romance" className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-400">ผู้กำกับ</label>
              <input type="text" name="director" value={formData.director} onChange={handleInputChange} placeholder="ชื่อผู้กำกับ" className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-400">วันที่ฉาย</label>
              <input type="text" name="release_date" value={formData.release_date} onChange={handleInputChange} placeholder="เช่น 08 Mar 2024" className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-400">วันออนแอร์ (Air Day)</label>
              <input type="text" name="air_day" value={formData.air_day} onChange={handleInputChange} placeholder="เช่น วันศุกร์" className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-400">เวลาออนแอร์</label>
              <input type="text" name="air_time" value={formData.air_time} onChange={handleInputChange} placeholder="เช่น 20:30" className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-400">เรตติ้งเบื้องต้น</label>
              <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleInputChange} placeholder="เช่น 9.5" className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400">ลิงก์ตัวอย่าง YOUTUBE <span className="text-pink-500">*</span></label>
            <input type="url" name="youtube_url" required value={formData.youtube_url} onChange={handleInputChange} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400">เรื่องย่อ / Note</label>
            <textarea name="admin_note" rows="4" value={formData.admin_note} onChange={handleInputChange} placeholder="เรื่องย่อหรือข้อมูลเพิ่มเติม" className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all resize-none"></textarea>
          </div>

          <div className="mt-4 pt-6 border-t border-white/10">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                formData.domain === 'BL' 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30' 
                  : 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'กำลังบันทึกข้อมูล...' : <><Save size={20} /> บันทึกข้อมูลซีรีส์</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}