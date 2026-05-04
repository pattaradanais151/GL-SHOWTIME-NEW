import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabase';

const ITEMS_PER_PAGE = 10;

const Admin = () => {
  const currentAdmin = localStorage.getItem('currentAdmin') || 'Unknown';
  const [ipAddress, setIpAddress] = useState('Unknown IP');

  const [movies, setMovies] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [logsList, setLogsList] = useState([]);
  
  // State สำหรับจัดการการเลือก Logs
  const [selectedLogs, setSelectedLogs] = useState([]);
  
  const [activeTab, setActiveTab] = useState('add');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [editingId, setEditingId] = useState(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  
  // เพิ่ม status เข้าไปใน initialForm
  const initialForm = { title: '', rating: '', release_date: '', genre: '', director: '', platform: '', air_day: '', air_time: '', youtube_url: '', admin_note: '', status: 'Standard' };
  const [formData, setFormData] = useState(initialForm);

  const [newAdminForm, setNewAdminForm] = useState({ username: '', password: '' });
  const [passwordForm, setPasswordForm] = useState({ username: currentAdmin, oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => {});
    
    fetchMovies();
    fetchAdmins();
    fetchLogs();
  }, []);

  const fetchMovies = async () => {
    const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
    if (data) setMovies(data);
  };

  const fetchAdmins = async () => {
    const { data } = await supabase.from('admins').select('id, username').order('id', { ascending: true });
    if (data) setAdminsList(data);
  };

  const fetchLogs = async () => {
    const { data } = await supabase.from('logs').select('*').order('created_at', { ascending: false });
    if (data) setLogsList(data);
  };

  const writeLog = async (action, target, details) => {
    await supabase.from('logs').insert([{
      action, performed_by: currentAdmin, target, details, ip_address: ipAddress
    }]);
    fetchLogs();
  };

  const checkAdminEditLimit = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count, error } = await supabase
      .from('logs')
      .select('*', { count: 'exact', head: true })
      .eq('performed_by', currentAdmin)
      .in('action', ['DELETE_OTHER_ADMIN', 'CHANGE_OTHER_ADMIN_PASSWORD'])
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) {
      showToast('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์', 'error');
      return false;
    }

    if (count >= 2) {
      showToast('คำเตือน: คุณใช้สิทธิ์จัดการผู้ดูแลระบบคนอื่นครบ 2 ครั้งในสัปดาห์นี้แล้ว', 'error');
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // -------------------------
  // ส่วนจัดการ Movies
  // -------------------------
  const handleSaveMovie = async (e) => {
    e.preventDefault();
    
    let statusText = formData.status === 'Standard' ? 'กำลังออนแอร์' : formData.status === 'Coming Soon' ? 'เร็วๆ นี้' : 'จบไปแล้ว';

    if (editingId) {
      const { error } = await supabase.from('movies').update(formData).eq('id', editingId);
      if (!error) {
        showToast('อัปเดตข้อมูลสำเร็จ!', 'success');
        writeLog('EDIT_MOVIE', formData.title, `Updated movie details (สถานะ: ${statusText})`);
        resetForm(); fetchMovies(); setActiveTab('manage');
      } else showToast('แก้ไขไม่สำเร็จ: ' + error.message, 'error');
    } else {
      const { error } = await supabase.from('movies').insert([formData]);
      if (!error) {
        showToast('เพิ่มภาพยนตร์เข้าสู่ระบบสำเร็จ!', 'success');
        writeLog('ADD_MOVIE', formData.title, `Added new movie (สถานะ: ${statusText})`);
        resetForm(); fetchMovies();
      } else showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
  };

  const handleEditClick = (movie) => {
    setFormData({ 
      title: movie.title || '', 
      rating: movie.rating || '', 
      release_date: movie.release_date || '', 
      genre: movie.genre || '', 
      director: movie.director || '', 
      platform: movie.platform || '', 
      air_day: movie.air_day || '', 
      air_time: movie.air_time || '', 
      youtube_url: movie.youtube_url || '', 
      admin_note: movie.admin_note || '',
      status: movie.status || 'Standard' 
    });
    setEditingId(movie.id);
    setActiveTab('add');
  };

  const resetForm = () => { setFormData(initialForm); setEditingId(null); };

  const handleDeleteMovie = async (id, title) => {
    if(window.confirm(`ต้องการลบเรื่อง "${title}" ใช่หรือไม่?`)){
      const { error } = await supabase.from('movies').delete().eq('id', id);
      if (!error) { 
        showToast('ลบข้อมูลเรียบร้อยแล้ว', 'success'); 
        writeLog('DELETE_MOVIE', title, 'Deleted movie');
        fetchMovies(); 
      } else showToast('ลบไม่สำเร็จ: ' + error.message, 'error');
    }
  };

  const filteredAdminMovies = useMemo(() => {
    return movies.filter(m => m.title.toLowerCase().includes(adminSearch.toLowerCase()));
  }, [movies, adminSearch]);
  const totalPages = Math.ceil(filteredAdminMovies.length / ITEMS_PER_PAGE);
  const paginatedAdminMovies = filteredAdminMovies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => { setCurrentPage(1); }, [adminSearch]);

  // -------------------------
  // ส่วนจัดการ Logs (แก้ไขเพิ่มระบบลบ)
  // -------------------------
  const totalLogPages = Math.ceil(logsList.length / ITEMS_PER_PAGE);
  const paginatedLogs = logsList.slice((logPage - 1) * ITEMS_PER_PAGE, logPage * ITEMS_PER_PAGE);

  const toggleSelectLog = (id) => {
    setSelectedLogs(prev => prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]);
  };

  const selectAllLogs = () => {
    if (selectedLogs.length === paginatedLogs.length && paginatedLogs.length > 0) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(paginatedLogs.map(log => log.id));
    }
  };

  const deleteSelectedLogs = async () => {
    if (selectedLogs.length === 0) return;
    if (window.confirm(`ยืนยันการลบ Log จำนวน ${selectedLogs.length} รายการ?`)) {
      const { error } = await supabase.from('logs').delete().in('id', selectedLogs);
      if (!error) {
        showToast('ลบ Log สำเร็จ', 'success');
        setSelectedLogs([]);
        fetchLogs();
      } else {
        showToast('ลบไม่สำเร็จ: ' + error.message, 'error');
      }
    }
  };

  const deleteAllLogs = async () => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบประวัติ Log ทั้งหมดในระบบ? (การกระทำนี้ไม่สามารถกู้คืนได้)')) {
      const { error } = await supabase.from('logs').delete().neq('id', 0);
      if (!error) {
        showToast('ลบ Log ทั้งหมดสำเร็จ', 'success');
        setSelectedLogs([]);
        fetchLogs();
      } else {
        showToast('ลบไม่สำเร็จ: ' + error.message, 'error');
      }
    }
  };

  // -------------------------
  // ส่วนจัดการ User (Admin)
  // -------------------------
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if(newAdminForm.username.length < 3 || newAdminForm.password.length < 6) {
      showToast('Username ต้อง 3 ตัวขึ้นไป และรหัส 6 ตัวขึ้นไป', 'error'); return;
    }
    const { data: existing } = await supabase.from('admins').select('id').eq('username', newAdminForm.username);
    if(existing && existing.length > 0) {
      showToast('Username นี้มีคนใช้แล้ว!', 'error'); return;
    }
    const { error } = await supabase.from('admins').insert([{ username: newAdminForm.username, password: newAdminForm.password }]);
    if(!error) {
      showToast('เพิ่มผู้ดูแลระบบใหม่สำเร็จ!', 'success');
      writeLog('ADD_ADMIN', newAdminForm.username, 'Created new admin account');
      setNewAdminForm({ username: '', password: '' });
      fetchAdmins();
    } else {
      showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
  };

  const handleDeleteAdmin = async (id, targetUsername) => {
    if(targetUsername === currentAdmin) {
      showToast('คุณไม่สามารถลบบัญชีของตัวเองได้!', 'error'); return;
    }
    const canEdit = await checkAdminEditLimit();
    if (!canEdit) return;

    if(window.confirm(`ยืนยันการลบแอดมิน ${targetUsername} ใช่หรือไม่?`)) {
      const { error } = await supabase.from('admins').delete().eq('id', id);
      if(!error) {
        showToast('ลบผู้ดูแลระบบสำเร็จ', 'success');
        writeLog('DELETE_OTHER_ADMIN', targetUsername, 'Deleted admin account');
        fetchAdmins();
      }
    }
  };

  const handleForceChangePassword = async (id, targetUsername) => {
    if(targetUsername === currentAdmin) {
      showToast('กรุณาไปที่แท็บ "เปลี่ยนรหัสผ่าน" เพื่อเปลี่ยนรหัสของตัวเอง', 'error'); return;
    }
    const canEdit = await checkAdminEditLimit();
    if (!canEdit) return;

    const newPass = window.prompt(`ตั้งรหัสผ่านใหม่ให้กับ ${targetUsername} (อย่างน้อย 6 ตัวอักษร):`);
    if(newPass && newPass.length >= 6) {
      const { error } = await supabase.from('admins').update({ password: newPass }).eq('id', id);
      if(!error) {
        showToast(`เปลี่ยนรหัสผ่านให้ ${targetUsername} สำเร็จ!`, 'success');
        writeLog('CHANGE_OTHER_ADMIN_PASSWORD', targetUsername, 'Forced changed password');
      } else {
        showToast('เกิดข้อผิดพลาด', 'error');
      }
    } else if (newPass) {
      showToast('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
    }
  };

  const handleChangeOwnPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน!', 'error'); return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 'error'); return;
    }
    const { data, error: fetchError } = await supabase.from('admins').select('*').eq('username', passwordForm.username).eq('password', passwordForm.oldPassword).single();
    if (fetchError || !data) {
      showToast('Username หรือ รหัสผ่านเดิมไม่ถูกต้อง!', 'error'); return;
    }
    const { error: updateError } = await supabase.from('admins').update({ password: passwordForm.newPassword }).eq('id', data.id);
    if (!updateError) {
      showToast('เปลี่ยนรหัสผ่านสำเร็จ!', 'success');
      writeLog('CHANGE_OWN_PASSWORD', passwordForm.username, 'Changed own password');
      setPasswordForm({ username: currentAdmin, oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showToast('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error');
    }
  };

  return (
    <div>
      <div className="admin-tabs" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <div className="admin-mode-badge">ADMIN MODE</div>
        <button className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`} onClick={() => { setActiveTab('add'); if(!editingId) resetForm(); }}>
          {editingId ? 'กำลังแก้ไขหนัง...' : 'เพิ่มภาพยนตร์'}
        </button>
        <button className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
          จัดการหนัง ({movies.length})
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          จัดการแอดมิน
        </button>
        <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          System Logs
        </button>
        <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          เปลี่ยนรหัสผ่านตัวเอง
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="admin-form-container glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.25rem', color: editingId ? '#3b82f6' : 'inherit' }}>{editingId ? 'แก้ไขข้อมูลภาพยนตร์' : 'เพิ่มภาพยนตร์ใหม่'}</h2>
          <form onSubmit={handleSaveMovie}>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">สถานะภาพยนตร์ *</label>
              <select name="status" className="form-input" value={formData.status} onChange={handleInputChange} style={{ cursor: 'pointer' }}>
                <option value="Ended">Ended (จบแล้ว)</option>
                <option value="Standard">On Air (กำลังออนแอร์)</option>
                <option value="Coming Soon">Coming Soon (เร็วๆ นี้)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">ชื่อเรื่อง *</label>
              <input type="text" name="title" className="form-input" placeholder="ชื่อภาพยนตร์หรือซีรีส์" required value={formData.title} onChange={handleInputChange} />
            </div>
            <div className="form-grid-4">
              <div><label className="form-label">คะแนน</label><input type="number" step="0.1" name="rating" className="form-input" value={formData.rating} onChange={handleInputChange} /></div>
              <div><label className="form-label">วันฉาย</label><input type="text" name="release_date" className="form-input" value={formData.release_date} onChange={handleInputChange} /></div>
              <div><label className="form-label">หมวดหมู่</label><input type="text" name="genre" className="form-input" value={formData.genre} onChange={handleInputChange} /></div>
              <div><label className="form-label">ผู้กำกับ</label><input type="text" name="director" className="form-input" value={formData.director} onChange={handleInputChange} /></div>
            </div>
            <div className="form-grid-3">
              <div><label className="form-label">แพลตฟอร์ม</label><input type="text" name="platform" className="form-input" value={formData.platform} onChange={handleInputChange} /></div>
              <div><label className="form-label">วันออนแอร์</label><input type="text" name="air_day" className="form-input" value={formData.air_day} onChange={handleInputChange} /></div>
              <div><label className="form-label">เวลาออนแอร์</label><input type="text" name="air_time" className="form-input" value={formData.air_time} onChange={handleInputChange} /></div>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
              <label className="form-label">ลิงก์ตัวอย่าง YOUTUBE *</label>
              <input type="url" name="youtube_url" className="form-input" required value={formData.youtube_url} onChange={handleInputChange} />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">ADMIN NOTE</label>
              <textarea name="admin_note" className="form-input" rows="3" value={formData.admin_note} onChange={handleInputChange} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: editingId ? '1fr 1fr' : '1fr', gap: '1rem' }}>
              {editingId && <button type="button" className="btn-secondary" onClick={() => { resetForm(); setActiveTab('manage'); }}>ยกเลิกการแก้ไข</button>}
              <button type="submit" className="btn-primary" style={{ padding: '1rem', background: editingId ? '#3b82f6' : '' }}>{editingId ? 'บันทึกการแก้ไข' : 'เพิ่มภาพยนตร์'}</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2>รายการทั้งหมด ({movies.length} เรื่อง)</h2>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', borderRadius: '0.5rem', padding: '0.5rem 1rem' }}>
              <span style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }}>🔍</span>
              <input type="text" placeholder="ค้นหาเพื่อแก้ไข/ลบ..." value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paginatedAdminMovies.map(movie => (
              <div key={movie.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--item-bg)', borderRadius: '0.5rem' }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{movie.title}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    สถานะ: {movie.status === 'Standard' ? 'กำลังออนแอร์' : movie.status === 'Coming Soon' ? 'เร็วๆ นี้' : 'จบแล้ว'} | {movie.genre || '-'} | {movie.platform || '-'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEditClick(movie)} className="btn-edit" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>แก้ไข</button>
                  <button onClick={() => handleDeleteMovie(movie.id, movie.title)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>ลบ</button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: '2rem' }}>
              <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>ก่อนหน้า</button>
              <span className="page-info">หน้า {currentPage} จาก {totalPages}</span>
              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>ถัดไป</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-form-container glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>จัดการบัญชีผู้ดูแลระบบ (Admins)</h2>
          
          <form onSubmit={handleAddAdmin} style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <input type="text" className="form-input" style={{ flex: 1, minWidth: '150px' }} placeholder="Username ใหม่" value={newAdminForm.username} onChange={(e)=>setNewAdminForm({...newAdminForm, username: e.target.value})} required />
            <input type="password" className="form-input" style={{ flex: 1, minWidth: '150px' }} placeholder="Password (6 ตัวขึ้นไป)" value={newAdminForm.password} onChange={(e)=>setNewAdminForm({...newAdminForm, password: e.target.value})} required />
            <button type="submit" className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>เพิ่ม Admin</button>
          </form>

          <div style={{ background: 'var(--item-bg)', borderRadius: '0.5rem', padding: '1rem', border: '1px solid var(--glass-border)' }}>
            <p style={{ color: 'var(--pink-accent)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 'bold' }}>* สิทธิ์การลบ/เปลี่ยนรหัสผ่านคนอื่น ถูกจำกัดให้ทำได้เพียง 2 ครั้งต่อสัปดาห์</p>
            {adminsList.map(admin => (
              <div key={admin.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ background: 'var(--glass-hover)', padding: '0.5rem', borderRadius: '50%' }}>👤</div>
                  <strong style={{ color: admin.username === currentAdmin ? 'var(--pink-accent)' : 'var(--text-main)' }}>
                    {admin.username} {admin.username === currentAdmin ? '(คุณ)' : ''}
                  </strong>
                </div>
                {admin.username !== currentAdmin && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleForceChangePassword(admin.id, admin.username)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>เปลี่ยนรหัส</button>
                    <button onClick={() => handleDeleteAdmin(admin.id, admin.username)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>ลบ</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>บันทึกระบบ (System Logs)</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={selectAllLogs} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                {selectedLogs.length === paginatedLogs.length && paginatedLogs.length > 0 ? 'ยกเลิกการเลือก' : 'เลือกทั้งหมดในหน้านี้'}
              </button>
              <button onClick={deleteSelectedLogs} disabled={selectedLogs.length === 0} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto', background: selectedLogs.length > 0 ? '#ef4444' : 'var(--input-bg)' }}>
                ลบที่เลือก
              </button>
              <button onClick={deleteAllLogs} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}>
                ลบทั้งหมด
              </button>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--item-bg)', color: 'var(--pink-accent)' }}>
                  <th style={{ padding: '1rem', width: '50px', textAlign: 'center' }}>เลือก</th>
                  <th style={{ padding: '1rem' }}>เวลา (Date/Time)</th>
                  <th style={{ padding: '1rem' }}>การกระทำ (Action)</th>
                  <th style={{ padding: '1rem' }}>ผู้ดำเนินการ (User)</th>
                  <th style={{ padding: '1rem' }}>รายละเอียด (Details)</th>
                  <th style={{ padding: '1rem' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-border)', color: log.action === 'LOGIN_FAILED' ? '#ef4444' : 'inherit' }}>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedLogs.includes(log.id)} 
                        onChange={() => toggleSelectLog(log.id)} 
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(log.created_at).toLocaleString('th-TH')}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{log.action}</td>
                    <td style={{ padding: '1rem' }}>{log.performed_by}</td>
                    <td style={{ padding: '1rem' }}>{log.target} <br/><span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{log.details}</span></td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paginatedLogs.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>ไม่มีข้อมูลบันทึก</div>}
          </div>
          {totalLogPages > 1 && (
            <div className="pagination" style={{ marginTop: '2rem' }}>
              <button className="page-btn" disabled={logPage === 1} onClick={() => setLogPage(p => p - 1)}>ก่อนหน้า</button>
              <span className="page-info">หน้า {logPage} จาก {totalLogPages}</span>
              <button className="page-btn" disabled={logPage === totalLogPages} onClick={() => setLogPage(p => p + 1)}>ถัดไป</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="admin-form-container glass-panel" style={{ padding: '2rem', maxWidth: '500px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>ตั้งค่าความปลอดภัยบัญชีของคุณ</h2>
          <form onSubmit={handleChangeOwnPassword}>
            <div className="form-group"><label className="form-label" style={{ textAlign: 'left' }}>Username</label><input type="text" className="form-input" value={passwordForm.username} readOnly disabled style={{ opacity: 0.7 }} /></div>
            <div className="form-group"><label className="form-label" style={{ textAlign: 'left' }}>รหัสผ่านเดิม</label><input type="password" className="form-input" required value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})} /></div>
            <div className="form-group"><label className="form-label" style={{ textAlign: 'left' }}>รหัสผ่านใหม่</label><input type="password" className="form-input" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} /></div>
            <div className="form-group" style={{ marginBottom: '2rem' }}><label className="form-label" style={{ textAlign: 'left' }}>ยืนยันรหัสผ่านใหม่</label><input type="password" className="form-input" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} /></div>
            <button type="submit" className="btn-primary" style={{ padding: '1rem' }}>บันทึกรหัสผ่านใหม่</button>
          </form>
        </div>
      )}

      {toast.show && (
        <div className="toast-container">
          <div className={`toast-alert ${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;