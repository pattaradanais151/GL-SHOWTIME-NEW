import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { useLanguage } from '../contexts/LanguageContext';

const adminTranslations = {
  th: {
    // Tabs
    tab_add: "เพิ่มภาพยนตร์",
    tab_editing: "กำลังแก้ไขหนัง...",
    tab_manage: "จัดการหนัง",
    tab_users: "จัดการแอดมิน",
    tab_logs: "System Logs",
    tab_settings: "เปลี่ยนรหัสผ่านตัวเอง",
    
    // Form Add/Edit
    form_edit_title: "แก้ไขข้อมูลภาพยนตร์",
    form_add_title: "เพิ่มภาพยนตร์ใหม่",
    status: "สถานะภาพยนตร์ *",
    status_ended: "Ended (จบแล้ว)",
    status_onair: "On Air (กำลังออนแอร์)",
    status_soon: "Coming Soon (เร็วๆ นี้)",
    title_req: "ชื่อเรื่อง *",
    title_ph: "ชื่อภาพยนตร์หรือซีรีส์",
    rating: "คะแนน",
    release_date: "วันฉาย",
    genre: "หมวดหมู่",
    director: "ผู้กำกับ",
    platform: "แพลตฟอร์ม",
    air_day: "วันออนแอร์",
    air_time: "เวลาออนแอร์",
    youtube_req: "ลิงก์ตัวอย่าง YOUTUBE *",
    admin_note: "ADMIN NOTE",
    btn_cancel_edit: "ยกเลิกการแก้ไข",
    btn_save_edit: "บันทึกการแก้ไข",
    btn_add_movie: "เพิ่มภาพยนตร์",

    // Manage Movies
    manage_all: "รายการทั้งหมด",
    manage_search_ph: "ค้นหาเพื่อแก้ไข/ลบ...",
    manage_status: "สถานะ",
    txt_onair: "กำลังออนแอร์",
    txt_soon: "เร็วๆ นี้",
    txt_ended: "จบแล้ว",
    btn_edit: "แก้ไข",
    btn_delete: "ลบ",
    btn_prev: "ก่อนหน้า",
    page_info: "หน้า {current} จาก {total}",
    btn_next: "ถัดไป",

    // Manage Admins
    admin_title: "จัดการบัญชีผู้ดูแลระบบ (Admins)",
    admin_new_user: "Username ใหม่",
    admin_new_pass: "Password (6 ตัวขึ้นไป)",
    btn_add_admin: "เพิ่ม Admin",
    admin_warning: "* สิทธิ์การลบ/เปลี่ยนรหัสผ่านคนอื่น ถูกจำกัดให้ทำได้เพียง 2 ครั้งต่อสัปดาห์",
    admin_you: "(คุณ)",
    btn_change_pass: "เปลี่ยนรหัส",

    // Logs
    logs_title: "บันทึกระบบ (System Logs)",
    btn_deselect: "ยกเลิกการเลือก",
    btn_select_all: "เลือกทั้งหมดในหน้านี้",
    btn_del_selected: "ลบที่เลือก",
    btn_del_all: "ลบทั้งหมด",
    log_col_select: "เลือก",
    log_col_time: "เวลา (Date/Time)",
    log_col_action: "การกระทำ (Action)",
    log_col_user: "ผู้ดำเนินการ (User)",
    log_col_details: "รายละเอียด (Details)",
    log_no_data: "ไม่มีข้อมูลบันทึก",

    // Settings
    set_title: "ตั้งค่าความปลอดภัยบัญชีของคุณ",
    set_user: "Username",
    set_old_pass: "รหัสผ่านเดิม",
    set_new_pass: "รหัสผ่านใหม่",
    set_confirm_pass: "ยืนยันรหัสผ่านใหม่",
    btn_save_pass: "บันทึกรหัสผ่านใหม่",

    // Messages & Alerts
    msg_err_check_perm: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์",
    msg_warn_limit: "คำเตือน: คุณใช้สิทธิ์จัดการผู้ดูแลระบบคนอื่นครบ 2 ครั้งในสัปดาห์นี้แล้ว",
    msg_update_success: "อัปเดตข้อมูลสำเร็จ!",
    msg_update_fail: "แก้ไขไม่สำเร็จ: ",
    msg_add_success: "เพิ่มภาพยนตร์เข้าสู่ระบบสำเร็จ!",
    msg_err: "เกิดข้อผิดพลาด: ",
    msg_confirm_del_movie: 'ต้องการลบเรื่อง "{title}" ใช่หรือไม่?',
    msg_del_success: "ลบข้อมูลเรียบร้อยแล้ว",
    msg_del_fail: "ลบไม่สำเร็จ: ",
    msg_confirm_del_logs: "ยืนยันการลบ Log จำนวน {count} รายการ?",
    msg_del_log_success: "ลบ Log สำเร็จ",
    msg_confirm_del_all_logs: "คุณแน่ใจหรือไม่ที่จะลบประวัติ Log ทั้งหมดในระบบ? (การกระทำนี้ไม่สามารถกู้คืนได้)",
    msg_del_all_log_success: "ลบ Log ทั้งหมดสำเร็จ",
    msg_err_user_pass_len: "Username ต้อง 3 ตัวขึ้นไป และรหัส 6 ตัวขึ้นไป",
    msg_err_user_exist: "Username นี้มีคนใช้แล้ว!",
    msg_add_admin_success: "เพิ่มผู้ดูแลระบบใหม่สำเร็จ!",
    msg_err_del_self: "คุณไม่สามารถลบบัญชีของตัวเองได้!",
    msg_confirm_del_admin: "ยืนยันการลบแอดมิน {user} ใช่หรือไม่?",
    msg_del_admin_success: "ลบผู้ดูแลระบบสำเร็จ",
    msg_err_change_self: "กรุณาไปที่แท็บ 'เปลี่ยนรหัสผ่านตัวเอง' เพื่อเปลี่ยนรหัสของตัวเอง",
    msg_prompt_new_pass: "ตั้งรหัสผ่านใหม่ให้กับ {user} (อย่างน้อย 6 ตัวอักษร):",
    msg_change_pass_success: "เปลี่ยนรหัสผ่านให้ {user} สำเร็จ!",
    msg_err_pass_len: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    msg_err_pass_mismatch: "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน!",
    msg_err_wrong_pass: "Username หรือ รหัสผ่านเดิมไม่ถูกต้อง!",
    msg_change_own_pass_success: "เปลี่ยนรหัสผ่านสำเร็จ!",
    msg_err_change_pass: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน"
  },
  en: {
    // Tabs
    tab_add: "Add Movie",
    tab_editing: "Editing Movie...",
    tab_manage: "Manage Movies",
    tab_users: "Manage Admins",
    tab_logs: "System Logs",
    tab_settings: "Change My Password",
    
    // Form Add/Edit
    form_edit_title: "Edit Movie Details",
    form_add_title: "Add New Movie",
    status: "Movie Status *",
    status_ended: "Ended",
    status_onair: "On Air",
    status_soon: "Coming Soon",
    title_req: "Title *",
    title_ph: "Movie or Series Title",
    rating: "Rating",
    release_date: "Release Date",
    genre: "Genre",
    director: "Director",
    platform: "Platform",
    air_day: "Air Day",
    air_time: "Air Time",
    youtube_req: "YouTube Trailer URL *",
    admin_note: "ADMIN NOTE",
    btn_cancel_edit: "Cancel Edit",
    btn_save_edit: "Save Changes",
    btn_add_movie: "Add Movie",

    // Manage Movies
    manage_all: "All Items",
    manage_search_ph: "Search to edit/delete...",
    manage_status: "Status",
    txt_onair: "On Air",
    txt_soon: "Coming Soon",
    txt_ended: "Ended",
    btn_edit: "Edit",
    btn_delete: "Delete",
    btn_prev: "Previous",
    page_info: "Page {current} of {total}",
    btn_next: "Next",

    // Manage Admins
    admin_title: "Manage Administrator Accounts (Admins)",
    admin_new_user: "New Username",
    admin_new_pass: "Password (Min 6 chars)",
    btn_add_admin: "Add Admin",
    admin_warning: "* Deleting/changing other admin's password is limited to 2 times/week",
    admin_you: "(You)",
    btn_change_pass: "Change Pass",

    // Logs
    logs_title: "System Logs",
    btn_deselect: "Deselect All",
    btn_select_all: "Select All on Page",
    btn_del_selected: "Delete Selected",
    btn_del_all: "Delete All",
    log_col_select: "Select",
    log_col_time: "Date/Time",
    log_col_action: "Action",
    log_col_user: "User",
    log_col_details: "Details",
    log_no_data: "No logs available",

    // Settings
    set_title: "Account Security Settings",
    set_user: "Username",
    set_old_pass: "Current Password",
    set_new_pass: "New Password",
    set_confirm_pass: "Confirm New Password",
    btn_save_pass: "Save New Password",

    // Messages & Alerts
    msg_err_check_perm: "Error checking permissions",
    msg_warn_limit: "Warning: You have reached the 2-action limit for managing other admins this week",
    msg_update_success: "Update successful!",
    msg_update_fail: "Failed to edit: ",
    msg_add_success: "Movie added successfully!",
    msg_err: "Error: ",
    msg_confirm_del_movie: 'Are you sure you want to delete "{title}"?',
    msg_del_success: "Deleted successfully",
    msg_del_fail: "Failed to delete: ",
    msg_confirm_del_logs: "Confirm deletion of {count} logs?",
    msg_del_log_success: "Logs deleted successfully",
    msg_confirm_del_all_logs: "Are you sure you want to delete ALL logs? This cannot be undone.",
    msg_del_all_log_success: "All logs deleted successfully",
    msg_err_user_pass_len: "Username must be 3+ chars and password 6+ chars",
    msg_err_user_exist: "Username already exists!",
    msg_add_admin_success: "New admin added successfully!",
    msg_err_del_self: "You cannot delete your own account!",
    msg_confirm_del_admin: "Are you sure you want to delete admin {user}?",
    msg_del_admin_success: "Admin deleted successfully",
    msg_err_change_self: "Please use the 'Change My Password' tab to change your own password",
    msg_prompt_new_pass: "Set new password for {user} (min 6 chars):",
    msg_change_pass_success: "Password changed for {user} successfully!",
    msg_err_pass_len: "Password must be at least 6 characters",
    msg_err_pass_mismatch: "New password and confirmation do not match!",
    msg_err_wrong_pass: "Invalid username or current password!",
    msg_change_own_pass_success: "Password changed successfully!",
    msg_err_change_pass: "Error changing password"
  }
};

const ITEMS_PER_PAGE = 10;

const Admin = () => {
  const { language } = useLanguage();
  // กำหนดให้ถ้าเลือกภาษาอังกฤษถึงจะเป็น 'en' นอกนั้น (ไทย, ญี่ปุ่น, เหนือ) จะให้ใช้ภาษาไทย (th) เป็นหลัก[cite: 9]
  const adminLang = language === 'en' ? 'en' : 'th';
  const tAd = (key) => adminTranslations[adminLang]?.[key] || key;

  const currentAdmin = localStorage.getItem('currentAdmin') || 'Unknown';
  const [ipAddress, setIpAddress] = useState('Unknown IP');

  const [movies, setMovies] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [logsList, setLogsList] = useState([]);
  
  const [selectedLogs, setSelectedLogs] = useState([]);
  
  const [activeTab, setActiveTab] = useState('add');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [editingId, setEditingId] = useState(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  
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
      showToast(tAd('msg_err_check_perm'), 'error');
      return false;
    }

    if (count >= 2) {
      showToast(tAd('msg_warn_limit'), 'error');
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

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    
    let statusText = formData.status === 'Standard' ? tAd('txt_onair') : formData.status === 'Coming Soon' ? tAd('txt_soon') : tAd('txt_ended');

    if (editingId) {
      const { error } = await supabase.from('movies').update(formData).eq('id', editingId);
      if (!error) {
        showToast(tAd('msg_update_success'), 'success');
        writeLog('EDIT_MOVIE', formData.title, `Updated movie details (Status: ${statusText})`);
        resetForm(); fetchMovies(); setActiveTab('manage');
      } else showToast(tAd('msg_update_fail') + error.message, 'error');
    } else {
      const { error } = await supabase.from('movies').insert([formData]);
      if (!error) {
        showToast(tAd('msg_add_success'), 'success');
        writeLog('ADD_MOVIE', formData.title, `Added new movie (Status: ${statusText})`);
        resetForm(); fetchMovies();
      } else showToast(tAd('msg_err') + error.message, 'error');
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
    if(window.confirm(tAd('msg_confirm_del_movie').replace('{title}', title))){
      const { error } = await supabase.from('movies').delete().eq('id', id);
      if (!error) { 
        showToast(tAd('msg_del_success'), 'success'); 
        writeLog('DELETE_MOVIE', title, 'Deleted movie');
        fetchMovies(); 
      } else showToast(tAd('msg_del_fail') + error.message, 'error');
    }
  };

  const filteredAdminMovies = useMemo(() => {
    return movies.filter(m => m.title.toLowerCase().includes(adminSearch.toLowerCase()));
  }, [movies, adminSearch]);
  const totalPages = Math.ceil(filteredAdminMovies.length / ITEMS_PER_PAGE);
  const paginatedAdminMovies = filteredAdminMovies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => { setCurrentPage(1); }, [adminSearch]);

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
    if (window.confirm(tAd('msg_confirm_del_logs').replace('{count}', selectedLogs.length))) {
      const { error } = await supabase.from('logs').delete().in('id', selectedLogs);
      if (!error) {
        showToast(tAd('msg_del_log_success'), 'success');
        setSelectedLogs([]);
        fetchLogs();
      } else {
        showToast(tAd('msg_err') + error.message, 'error');
      }
    }
  };

  const deleteAllLogs = async () => {
    if (window.confirm(tAd('msg_confirm_del_all_logs'))) {
      const { error } = await supabase.from('logs').delete().neq('id', 0);
      if (!error) {
        showToast(tAd('msg_del_all_log_success'), 'success');
        setSelectedLogs([]);
        fetchLogs();
      } else {
        showToast(tAd('msg_err') + error.message, 'error');
      }
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if(newAdminForm.username.length < 3 || newAdminForm.password.length < 6) {
      showToast(tAd('msg_err_user_pass_len'), 'error'); return;
    }
    const { data: existing } = await supabase.from('admins').select('id').eq('username', newAdminForm.username);
    if(existing && existing.length > 0) {
      showToast(tAd('msg_err_user_exist'), 'error'); return;
    }
    const { error } = await supabase.from('admins').insert([{ username: newAdminForm.username, password: newAdminForm.password }]);
    if(!error) {
      showToast(tAd('msg_add_admin_success'), 'success');
      writeLog('ADD_ADMIN', newAdminForm.username, 'Created new admin account');
      setNewAdminForm({ username: '', password: '' });
      fetchAdmins();
    } else {
      showToast(tAd('msg_err') + error.message, 'error');
    }
  };

  const handleDeleteAdmin = async (id, targetUsername) => {
    if(targetUsername === currentAdmin) {
      showToast(tAd('msg_err_del_self'), 'error'); return;
    }
    const canEdit = await checkAdminEditLimit();
    if (!canEdit) return;

    if(window.confirm(tAd('msg_confirm_del_admin').replace('{user}', targetUsername))) {
      const { error } = await supabase.from('admins').delete().eq('id', id);
      if(!error) {
        showToast(tAd('msg_del_admin_success'), 'success');
        writeLog('DELETE_OTHER_ADMIN', targetUsername, 'Deleted admin account');
        fetchAdmins();
      }
    }
  };

  const handleForceChangePassword = async (id, targetUsername) => {
    if(targetUsername === currentAdmin) {
      showToast(tAd('msg_err_change_self'), 'error'); return;
    }
    const canEdit = await checkAdminEditLimit();
    if (!canEdit) return;

    const newPass = window.prompt(tAd('msg_prompt_new_pass').replace('{user}', targetUsername));
    if(newPass && newPass.length >= 6) {
      const { error } = await supabase.from('admins').update({ password: newPass }).eq('id', id);
      if(!error) {
        showToast(tAd('msg_change_pass_success').replace('{user}', targetUsername), 'success');
        writeLog('CHANGE_OTHER_ADMIN_PASSWORD', targetUsername, 'Forced changed password');
      } else {
        showToast(tAd('msg_err'), 'error');
      }
    } else if (newPass) {
      showToast(tAd('msg_err_pass_len'), 'error');
    }
  };

  const handleChangeOwnPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast(tAd('msg_err_pass_mismatch'), 'error'); return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast(tAd('msg_err_pass_len'), 'error'); return;
    }
    const { data, error: fetchError } = await supabase.from('admins').select('*').eq('username', passwordForm.username).eq('password', passwordForm.oldPassword).single();
    if (fetchError || !data) {
      showToast(tAd('msg_err_wrong_pass'), 'error'); return;
    }
    const { error: updateError } = await supabase.from('admins').update({ password: passwordForm.newPassword }).eq('id', data.id);
    if (!updateError) {
      showToast(tAd('msg_change_own_pass_success'), 'success');
      writeLog('CHANGE_OWN_PASSWORD', passwordForm.username, 'Changed own password');
      setPasswordForm({ username: currentAdmin, oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showToast(tAd('msg_err_change_pass'), 'error');
    }
  };

  return (
    <div>
      <div className="admin-tabs" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <div className="admin-mode-badge">ADMIN MODE</div>
        <button className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`} onClick={() => { setActiveTab('add'); if(!editingId) resetForm(); }}>
          {editingId ? tAd('tab_editing') : tAd('tab_add')}
        </button>
        <button className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
          {tAd('tab_manage')} ({movies.length})
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          {tAd('tab_users')}
        </button>
        <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          {tAd('tab_logs')}
        </button>
        <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          {tAd('tab_settings')}
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="admin-form-container glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.25rem', color: editingId ? '#3b82f6' : 'inherit' }}>{editingId ? tAd('form_edit_title') : tAd('form_add_title')}</h2>
          <form onSubmit={handleSaveMovie}>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">{tAd('status')}</label>
              <select name="status" className="form-input" value={formData.status} onChange={handleInputChange} style={{ cursor: 'pointer' }}>
                <option value="Ended">{tAd('status_ended')}</option>
                <option value="Standard">{tAd('status_onair')}</option>
                <option value="Coming Soon">{tAd('status_soon')}</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">{tAd('title_req')}</label>
              <input type="text" name="title" className="form-input" placeholder={tAd('title_ph')} required value={formData.title} onChange={handleInputChange} />
            </div>
            <div className="form-grid-4">
              <div><label className="form-label">{tAd('rating')}</label><input type="number" step="0.1" name="rating" className="form-input" value={formData.rating} onChange={handleInputChange} /></div>
              <div><label className="form-label">{tAd('release_date')}</label><input type="text" name="release_date" className="form-input" value={formData.release_date} onChange={handleInputChange} /></div>
              <div><label className="form-label">{tAd('genre')}</label><input type="text" name="genre" className="form-input" value={formData.genre} onChange={handleInputChange} /></div>
              <div><label className="form-label">{tAd('director')}</label><input type="text" name="director" className="form-input" value={formData.director} onChange={handleInputChange} /></div>
            </div>
            <div className="form-grid-3">
              <div><label className="form-label">{tAd('platform')}</label><input type="text" name="platform" className="form-input" value={formData.platform} onChange={handleInputChange} /></div>
              <div><label className="form-label">{tAd('air_day')}</label><input type="text" name="air_day" className="form-input" value={formData.air_day} onChange={handleInputChange} /></div>
              <div><label className="form-label">{tAd('air_time')}</label><input type="text" name="air_time" className="form-input" value={formData.air_time} onChange={handleInputChange} /></div>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
              <label className="form-label">{tAd('youtube_req')}</label>
              <input type="url" name="youtube_url" className="form-input" required value={formData.youtube_url} onChange={handleInputChange} />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">{tAd('admin_note')}</label>
              <textarea name="admin_note" className="form-input" rows="3" value={formData.admin_note} onChange={handleInputChange} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: editingId ? '1fr 1fr' : '1fr', gap: '1rem' }}>
              {editingId && <button type="button" className="btn-secondary" onClick={() => { resetForm(); setActiveTab('manage'); }}>{tAd('btn_cancel_edit')}</button>}
              <button type="submit" className="btn-primary" style={{ padding: '1rem', background: editingId ? '#3b82f6' : '' }}>{editingId ? tAd('btn_save_edit') : tAd('btn_add_movie')}</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2>{tAd('manage_all')} ({movies.length})</h2>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', borderRadius: '0.5rem', padding: '0.5rem 1rem' }}>
              <span style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }}></span>
              <input type="text" placeholder={tAd('manage_search_ph')} value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paginatedAdminMovies.map(movie => (
              <div key={movie.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--item-bg)', borderRadius: '0.5rem' }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{movie.title}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {tAd('manage_status')}: {movie.status === 'Standard' ? tAd('txt_onair') : movie.status === 'Coming Soon' ? tAd('txt_soon') : tAd('txt_ended')} | {movie.genre || '-'} | {movie.platform || '-'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEditClick(movie)} className="btn-edit" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{tAd('btn_edit')}</button>
                  <button onClick={() => handleDeleteMovie(movie.id, movie.title)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>{tAd('btn_delete')}</button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: '2rem' }}>
              <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>{tAd('btn_prev')}</button>
              <span className="page-info">{tAd('page_info').replace('{current}', currentPage).replace('{total}', totalPages)}</span>
              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>{tAd('btn_next')}</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-form-container glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{tAd('admin_title')}</h2>
          
          <form onSubmit={handleAddAdmin} style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <input type="text" className="form-input" style={{ flex: 1, minWidth: '150px' }} placeholder={tAd('admin_new_user')} value={newAdminForm.username} onChange={(e)=>setNewAdminForm({...newAdminForm, username: e.target.value})} required />
            <input type="password" className="form-input" style={{ flex: 1, minWidth: '150px' }} placeholder={tAd('admin_new_pass')} value={newAdminForm.password} onChange={(e)=>setNewAdminForm({...newAdminForm, password: e.target.value})} required />
            <button type="submit" className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{tAd('btn_add_admin')}</button>
          </form>

          <div style={{ background: 'var(--item-bg)', borderRadius: '0.5rem', padding: '1rem', border: '1px solid var(--glass-border)' }}>
            <p style={{ color: 'var(--pink-accent)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 'bold' }}>{tAd('admin_warning')}</p>
            {adminsList.map(admin => (
              <div key={admin.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ background: 'var(--glass-hover)', padding: '0.5rem', borderRadius: '50%' }}>👤</div>
                  <strong style={{ color: admin.username === currentAdmin ? 'var(--pink-accent)' : 'var(--text-main)' }}>
                    {admin.username} {admin.username === currentAdmin ? tAd('admin_you') : ''}
                  </strong>
                </div>
                {admin.username !== currentAdmin && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleForceChangePassword(admin.id, admin.username)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{tAd('btn_change_pass')}</button>
                    <button onClick={() => handleDeleteAdmin(admin.id, admin.username)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{tAd('btn_delete')}</button>
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
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{tAd('logs_title')}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={selectAllLogs} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                {selectedLogs.length === paginatedLogs.length && paginatedLogs.length > 0 ? tAd('btn_deselect') : tAd('btn_select_all')}
              </button>
              <button onClick={deleteSelectedLogs} disabled={selectedLogs.length === 0} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto', background: selectedLogs.length > 0 ? '#ef4444' : 'var(--input-bg)' }}>
                {tAd('btn_del_selected')}
              </button>
              <button onClick={deleteAllLogs} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}>
                {tAd('btn_del_all')}
              </button>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--item-bg)', color: 'var(--pink-accent)' }}>
                  <th style={{ padding: '1rem', width: '50px', textAlign: 'center' }}>{tAd('log_col_select')}</th>
                  <th style={{ padding: '1rem' }}>{tAd('log_col_time')}</th>
                  <th style={{ padding: '1rem' }}>{tAd('log_col_action')}</th>
                  <th style={{ padding: '1rem' }}>{tAd('log_col_user')}</th>
                  <th style={{ padding: '1rem' }}>{tAd('log_col_details')}</th>
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
                    <td style={{ padding: '1rem' }}>{new Date(log.created_at).toLocaleString(adminLang === 'en' ? 'en-US' : 'th-TH')}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{log.action}</td>
                    <td style={{ padding: '1rem' }}>{log.performed_by}</td>
                    <td style={{ padding: '1rem' }}>{log.target} <br/><span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{log.details}</span></td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paginatedLogs.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{tAd('log_no_data')}</div>}
          </div>
          {totalLogPages > 1 && (
            <div className="pagination" style={{ marginTop: '2rem' }}>
              <button className="page-btn" disabled={logPage === 1} onClick={() => setLogPage(p => p - 1)}>{tAd('btn_prev')}</button>
              <span className="page-info">{tAd('page_info').replace('{current}', logPage).replace('{total}', totalLogPages)}</span>
              <button className="page-btn" disabled={logPage === totalLogPages} onClick={() => setLogPage(p => p + 1)}>{tAd('btn_next')}</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="admin-form-container glass-panel" style={{ padding: '2rem', maxWidth: '500px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{tAd('set_title')}</h2>
          <form onSubmit={handleChangeOwnPassword}>
            <div className="form-group"><label className="form-label" style={{ textAlign: 'left' }}>{tAd('set_user')}</label><input type="text" className="form-input" value={passwordForm.username} readOnly disabled style={{ opacity: 0.7 }} /></div>
            <div className="form-group"><label className="form-label" style={{ textAlign: 'left' }}>{tAd('set_old_pass')}</label><input type="password" className="form-input" required value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})} /></div>
            <div className="form-group"><label className="form-label" style={{ textAlign: 'left' }}>{tAd('set_new_pass')}</label><input type="password" className="form-input" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} /></div>
            <div className="form-group" style={{ marginBottom: '2rem' }}><label className="form-label" style={{ textAlign: 'left' }}>{tAd('set_confirm_pass')}</label><input type="password" className="form-input" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} /></div>
            <button type="submit" className="btn-primary" style={{ padding: '1rem' }}>{tAd('btn_save_pass')}</button>
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