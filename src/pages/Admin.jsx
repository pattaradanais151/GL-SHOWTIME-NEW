import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  Film, Plus, Edit, Trash2, Users, Activity, KeyRound, 
  Save, AlertCircle, CheckCircle, Search, X, ChevronLeft, ChevronRight, Info, AlertTriangle, Lock
} from 'lucide-react';

const adminTranslations = {
  th: {
    tab_add: "เพิ่มภาพยนตร์", tab_editing: "กำลังแก้ไขหนัง...", tab_manage: "จัดการหนัง",
    tab_users: "จัดการแอดมิน", tab_logs: "System Logs", tab_settings: "เปลี่ยนรหัสผ่านตัวเอง",
    form_edit_title: "แก้ไขข้อมูลภาพยนตร์", form_add_title: "เพิ่มภาพยนตร์ใหม่",
    status: "สถานะภาพยนตร์ *", status_ended: "Ended (จบแล้ว)", status_onair: "On Air (กำลังออนแอร์)", status_soon: "Coming Soon (เร็วๆ นี้)",
    title_req: "ชื่อเรื่อง *", title_ph: "ชื่อภาพยนตร์หรือซีรีส์", rating: "คะแนน", release_date: "วันฉาย",
    genre: "หมวดหมู่", director: "ผู้กำกับ", platform: "แพลตฟอร์ม", air_day: "วันออนแอร์", air_time: "เวลาออนแอร์",
    youtube_req: "ลิงก์ตัวอย่าง YOUTUBE *", admin_note: "ADMIN NOTE", btn_cancel_edit: "ยกเลิกการแก้ไข", btn_save_edit: "บันทึกการแก้ไข", btn_add_movie: "เพิ่มภาพยนตร์",
    manage_all: "รายการทั้งหมด", manage_search_ph: "ค้นหาเพื่อแก้ไข/ลบ...", manage_status: "สถานะ",
    txt_onair: "กำลังออนแอร์", txt_soon: "เร็วๆ นี้", txt_ended: "จบแล้ว", btn_edit: "แก้ไข", btn_delete: "ลบ",
    btn_prev: "ก่อนหน้า", page_info: "หน้า {current} จาก {total}", btn_next: "ถัดไป",
    admin_title: "จัดการบัญชีผู้ดูแลระบบ (Admins)", admin_new_user: "Username ใหม่", admin_new_pass: "Password (6 ตัวขึ้นไป)",
    btn_add_admin: "เพิ่ม Admin", admin_warning: "* สิทธิ์การลบ/เปลี่ยนรหัสผ่านคนอื่น ถูกจำกัดให้ทำได้เพียง 2 ครั้งต่อสัปดาห์",
    admin_you: "(คุณ)", btn_change_pass: "เปลี่ยนรหัส", logs_title: "บันทึกระบบ (System Logs)",
    btn_deselect: "ยกเลิกการเลือก", btn_select_all: "เลือกทั้งหมดในหน้านี้", btn_del_selected: "ลบที่เลือก", btn_del_all: "ลบทั้งหมด",
    log_col_select: "เลือก", log_col_time: "เวลา (Date/Time)", log_col_action: "การกระทำ (Action)",
    log_col_user: "ผู้ดำเนินการ (User)", log_col_details: "รายละเอียด (Details)", log_no_data: "ไม่มีข้อมูลบันทึก",
    set_title: "ตั้งค่าความปลอดภัยบัญชีของคุณ", set_user: "Username", set_old_pass: "รหัสผ่านเดิม", set_new_pass: "รหัสผ่านใหม่",
    set_confirm_pass: "ยืนยันรหัสผ่านใหม่", btn_save_pass: "บันทึกรหัสผ่านใหม่",
    msg_err_check_perm: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์", msg_warn_limit: "คำเตือน: คุณใช้สิทธิ์จัดการผู้ดูแลระบบคนอื่นครบ 2 ครั้งในสัปดาห์นี้แล้ว",
    msg_update_success: "อัปเดตข้อมูลสำเร็จ!", msg_update_fail: "แก้ไขไม่สำเร็จ: ", msg_add_success: "เพิ่มภาพยนตร์เข้าสู่ระบบสำเร็จ!",
    msg_err: "เกิดข้อผิดพลาด: ", msg_confirm_del_movie: 'ต้องการลบเรื่อง "{title}" ใช่หรือไม่?', msg_del_success: "ลบข้อมูลเรียบร้อยแล้ว",
    msg_del_fail: "ลบไม่สำเร็จ: ", msg_confirm_del_logs: "ยืนยันการลบ Log จำนวน {count} รายการ?", msg_del_log_success: "ลบ Log สำเร็จ",
    msg_confirm_del_all_logs: "คุณแน่ใจหรือไม่ที่จะลบประวัติ Log ทั้งหมดในระบบ? (การกระทำนี้ไม่สามารถกู้คืนได้)", msg_del_all_log_success: "ลบ Log ทั้งหมดสำเร็จ",
    msg_err_user_pass_len: "Username ต้อง 3 ตัวขึ้นไป และรหัส 6 ตัวขึ้นไป", msg_err_user_exist: "Username นี้มีคนใช้แล้ว!",
    msg_add_admin_success: "เพิ่มผู้ดูแลระบบใหม่สำเร็จ!", msg_err_del_self: "คุณไม่สามารถลบบัญชีของตัวเองได้!",
    msg_confirm_del_admin: "ยืนยันการลบแอดมิน {user} ใช่หรือไม่?", msg_del_admin_success: "ลบผู้ดูแลระบบสำเร็จ",
    msg_err_change_self: "กรุณาไปที่แท็บ 'เปลี่ยนรหัสผ่านตัวเอง' เพื่อเปลี่ยนรหัสของตัวเอง", msg_prompt_new_pass: "ตั้งรหัสผ่านใหม่ให้กับ {user} (อย่างน้อย 6 ตัวอักษร):",
    msg_change_pass_success: "เปลี่ยนรหัสผ่านให้ {user} สำเร็จ!", msg_err_pass_len: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    msg_err_pass_mismatch: "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน!", msg_err_wrong_pass: "Username หรือ รหัสผ่านเดิมไม่ถูกต้อง!",
    msg_change_own_pass_success: "เปลี่ยนรหัสผ่านสำเร็จ!", msg_err_change_pass: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน"
  },
  en: {
    tab_add: "Add Movie", tab_editing: "Editing Movie...", tab_manage: "Manage Movies",
    tab_users: "Manage Admins", tab_logs: "System Logs", tab_settings: "Change My Password",
    form_edit_title: "Edit Movie Details", form_add_title: "Add New Movie",
    status: "Movie Status *", status_ended: "Ended", status_onair: "On Air", status_soon: "Coming Soon",
    title_req: "Title *", title_ph: "Movie or Series Title", rating: "Rating", release_date: "Release Date",
    genre: "Genre", director: "Director", platform: "Platform", air_day: "Air Day", air_time: "Air Time",
    youtube_req: "YouTube Trailer URL *", admin_note: "ADMIN NOTE", btn_cancel_edit: "Cancel Edit", btn_save_edit: "Save Changes", btn_add_movie: "Add Movie",
    manage_all: "All Items", manage_search_ph: "Search to edit/delete...", manage_status: "Status",
    txt_onair: "On Air", txt_soon: "Coming Soon", txt_ended: "Ended", btn_edit: "Edit", btn_delete: "Delete",
    btn_prev: "Previous", page_info: "Page {current} of {total}", btn_next: "Next",
    admin_title: "Manage Administrator Accounts (Admins)", admin_new_user: "New Username", admin_new_pass: "Password (Min 6 chars)",
    btn_add_admin: "Add Admin", admin_warning: "* Deleting/changing other admin's password is limited to 2 times/week",
    admin_you: "(You)", btn_change_pass: "Change Pass", logs_title: "System Logs",
    btn_deselect: "Deselect All", btn_select_all: "Select All on Page", btn_del_selected: "Delete Selected", btn_del_all: "Delete All",
    log_col_select: "Select", log_col_time: "Date/Time", log_col_action: "Action",
    log_col_user: "User", log_col_details: "Details", log_no_data: "No logs available",
    set_title: "Account Security Settings", set_user: "Username", set_old_pass: "Current Password", set_new_pass: "New Password",
    set_confirm_pass: "Confirm New Password", btn_save_pass: "Save New Password",
    msg_err_check_perm: "Error checking permissions", msg_warn_limit: "Warning: You have reached the 2-action limit for managing other admins this week",
    msg_update_success: "Update successful!", msg_update_fail: "Failed to edit: ", msg_add_success: "Movie added successfully!",
    msg_err: "Error: ", msg_confirm_del_movie: 'Are you sure you want to delete "{title}"?', msg_del_success: "Deleted successfully",
    msg_del_fail: "Failed to delete: ", msg_confirm_del_logs: "Confirm deletion of {count} logs?", msg_del_log_success: "Logs deleted successfully",
    msg_confirm_del_all_logs: "Are you sure you want to delete ALL logs? This cannot be undone.", msg_del_all_log_success: "All logs deleted successfully",
    msg_err_user_pass_len: "Username must be 3+ chars and password 6+ chars", msg_err_user_exist: "Username already exists!",
    msg_add_admin_success: "New admin added successfully!", msg_err_del_self: "You cannot delete your own account!",
    msg_confirm_del_admin: "Are you sure you want to delete admin {user}?", msg_del_admin_success: "Admin deleted successfully",
    msg_err_change_self: "Please use the 'Change My Password' tab to change your own password", msg_prompt_new_pass: "Set new password for {user} (min 6 chars):",
    msg_change_pass_success: "Password changed for {user} successfully!", msg_err_pass_len: "Password must be at least 6 characters",
    msg_err_pass_mismatch: "New password and confirmation do not match!", msg_err_wrong_pass: "Invalid username or current password!",
    msg_change_own_pass_success: "Password changed successfully!", msg_err_change_pass: "Error changing password"
  }
};

const ITEMS_PER_PAGE = 10;
const SESSION_TIMEOUT_MS = 3 * 60 * 1000; // 3 นาที (หน่วยเป็นมิลลิวินาที)

const Admin = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);
  
  // Custom Modals States
  const [showConfirmModal, setShowConfirmModal] = useState(false); // สำหรับเช็ครายละเอียดฟอร์มเพิ่ม/แก้หนัง
  const [customAlert, setCustomAlert] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: null });
  const [promptModal, setPromptModal] = useState({ isOpen: false, targetId: null, targetUsername: '', newPassword: '' });

  const [editingId, setEditingId] = useState(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  
  const initialForm = { title: '', rating: '', release_date: '', genre: '', director: '', platform: '', air_day: '', air_time: '', youtube_url: '', admin_note: '', status: 'Standard' };
  const [formData, setFormData] = useState(initialForm);

  const [newAdminForm, setNewAdminForm] = useState({ username: '', password: '' });
  const [passwordForm, setPasswordForm] = useState({ username: currentAdmin, oldPassword: '', newPassword: '', confirmPassword: '' });

  const statusOptions = [
    { value: 'Standard', label: tAd('status_onair') },
    { value: 'Coming Soon', label: tAd('status_soon') },
    { value: 'Ended', label: tAd('status_ended') }
  ];

  // ==========================================
  // SESSION TIMEOUT LOGIC (3 นาที)
  // ==========================================
  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // เมื่อครบ 3 นาที จะเคลียร์ Session และเด้งออก
        localStorage.removeItem('isAdmin');
        alert('เซสชันหมดอายุเนื่องจากไม่มีการใช้งานเป็นเวลา 3 นาที ระบบได้ทำการลงชื่อออกอัตโนมัติเพื่อความปลอดภัย');
        navigate('/login'); 
      }, SESSION_TIMEOUT_MS);
    };

    // ดักจับการกระทำต่างๆ ของ User บนหน้าจอ
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // เริ่มจับเวลาครั้งแรก
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

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
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  // Movie Handlers
  const handleMovieSubmitClick = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const executeSaveMovie = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    let statusText = formData.status === 'Standard' ? tAd('txt_onair') : formData.status === 'Coming Soon' ? tAd('txt_soon') : tAd('txt_ended');

    try {
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
          resetForm(); fetchMovies(); setActiveTab('manage');
        } else showToast(tAd('msg_err') + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (movie) => {
    setFormData({ 
      title: movie.title || '', rating: movie.rating || '', release_date: movie.release_date || '', 
      genre: movie.genre || '', director: movie.director || '', platform: movie.platform || '', 
      air_day: movie.air_day || '', air_time: movie.air_time || '', youtube_url: movie.youtube_url || '', 
      admin_note: movie.admin_note || '', status: movie.status || 'Standard' 
    });
    setEditingId(movie.id);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setFormData(initialForm); setEditingId(null); };

  const handleDeleteMovie = (id, title) => {
    setCustomAlert({
      isOpen: true,
      type: 'danger',
      title: 'ยืนยันการลบภาพยนตร์',
      message: tAd('msg_confirm_del_movie').replace('{title}', title),
      onConfirm: async () => {
        const { error } = await supabase.from('movies').delete().eq('id', id);
        if (!error) { 
          showToast(tAd('msg_del_success'), 'success'); 
          writeLog('DELETE_MOVIE', title, 'Deleted movie');
          fetchMovies(); 
        } else {
          showToast(tAd('msg_del_fail') + error.message, 'error');
        }
      }
    });
  };

  // Logs Handlers
  const toggleSelectLog = (id) => {
    setSelectedLogs(prev => prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]);
  };

  const selectAllLogs = () => {
    if (selectedLogs.length === paginatedLogs.length && paginatedLogs.length > 0) setSelectedLogs([]);
    else setSelectedLogs(paginatedLogs.map(log => log.id));
  };

  const deleteSelectedLogs = () => {
    if (selectedLogs.length === 0) return;
    setCustomAlert({
      isOpen: true,
      type: 'danger',
      title: 'ยืนยันการลบข้อมูล (Logs)',
      message: tAd('msg_confirm_del_logs').replace('{count}', selectedLogs.length),
      onConfirm: async () => {
        const { error } = await supabase.from('logs').delete().in('id', selectedLogs);
        if (!error) { 
          showToast(tAd('msg_del_log_success'), 'success'); 
          setSelectedLogs([]); fetchLogs(); 
        } else showToast(tAd('msg_err') + error.message, 'error');
      }
    });
  };

  const deleteAllLogs = () => {
    setCustomAlert({
      isOpen: true,
      type: 'danger',
      title: 'ล้างบันทึกระบบทั้งหมด',
      message: tAd('msg_confirm_del_all_logs'),
      onConfirm: async () => {
        const { error } = await supabase.from('logs').delete().neq('id', 0);
        if (!error) { 
          showToast(tAd('msg_del_all_log_success'), 'success'); 
          setSelectedLogs([]); fetchLogs(); 
        } else showToast(tAd('msg_err') + error.message, 'error');
      }
    });
  };

  // Admins Handlers
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if(newAdminForm.username.length < 3 || newAdminForm.password.length < 6) {
      showToast(tAd('msg_err_user_pass_len'), 'error'); return;
    }
    const { data: existing } = await supabase.from('admins').select('id').eq('username', newAdminForm.username);
    if(existing && existing.length > 0) { showToast(tAd('msg_err_user_exist'), 'error'); return; }
    
    const { error } = await supabase.from('admins').insert([{ username: newAdminForm.username, password: newAdminForm.password }]);
    if(!error) {
      showToast(tAd('msg_add_admin_success'), 'success');
      writeLog('ADD_ADMIN', newAdminForm.username, 'Created new admin account');
      setNewAdminForm({ username: '', password: '' });
      fetchAdmins();
    } else showToast(tAd('msg_err') + error.message, 'error');
  };

  const handleDeleteAdmin = async (id, targetUsername) => {
    if(targetUsername === currentAdmin) { showToast(tAd('msg_err_del_self'), 'error'); return; }
    const canEdit = await checkAdminEditLimit();
    if (!canEdit) return;

    setCustomAlert({
      isOpen: true,
      type: 'danger',
      title: 'ลบบัญชีแอดมิน',
      message: tAd('msg_confirm_del_admin').replace('{user}', targetUsername),
      onConfirm: async () => {
        const { error } = await supabase.from('admins').delete().eq('id', id);
        if(!error) {
          showToast(tAd('msg_del_admin_success'), 'success');
          writeLog('DELETE_OTHER_ADMIN', targetUsername, 'Deleted admin account');
          fetchAdmins();
        } else {
          showToast(tAd('msg_err') + error.message, 'error');
        }
      }
    });
  };

  const handleForceChangePassword = async (id, targetUsername) => {
    if(targetUsername === currentAdmin) { showToast(tAd('msg_err_change_self'), 'error'); return; }
    const canEdit = await checkAdminEditLimit();
    if (!canEdit) return;

    setPromptModal({ isOpen: true, targetId: id, targetUsername, newPassword: '' });
  };

  const submitForceChangePassword = async (e) => {
    e.preventDefault();
    const { targetId, targetUsername, newPassword } = promptModal;
    if(newPassword.length >= 6) {
      const { error } = await supabase.from('admins').update({ password: newPassword }).eq('id', targetId);
      if(!error) {
        showToast(tAd('msg_change_pass_success').replace('{user}', targetUsername), 'success');
        writeLog('CHANGE_OTHER_ADMIN_PASSWORD', targetUsername, 'Forced changed password');
        setPromptModal({ isOpen: false, targetId: null, targetUsername: '', newPassword: '' });
      } else {
        showToast(tAd('msg_err') + error.message, 'error');
      }
    } else {
      showToast(tAd('msg_err_pass_len'), 'error');
    }
  };

  const handleChangeOwnPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { showToast(tAd('msg_err_pass_mismatch'), 'error'); return; }
    if (passwordForm.newPassword.length < 6) { showToast(tAd('msg_err_pass_len'), 'error'); return; }
    
    const { data, error: fetchError } = await supabase.from('admins').select('*').eq('username', passwordForm.username).eq('password', passwordForm.oldPassword).single();
    if (fetchError || !data) { showToast(tAd('msg_err_wrong_pass'), 'error'); return; }
    
    const { error: updateError } = await supabase.from('admins').update({ password: passwordForm.newPassword }).eq('id', data.id);
    if (!updateError) {
      showToast(tAd('msg_change_own_pass_success'), 'success');
      writeLog('CHANGE_OWN_PASSWORD', passwordForm.username, 'Changed own password');
      setPasswordForm({ username: currentAdmin, oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showToast(tAd('msg_err_change_pass') + ": " + updateError.message, 'error');
    }
  };

  // Pagination Logic
  const filteredAdminMovies = useMemo(() => {
    return movies.filter(m => m.title.toLowerCase().includes(adminSearch.toLowerCase()));
  }, [movies, adminSearch]);
  
  const totalPages = Math.ceil(filteredAdminMovies.length / ITEMS_PER_PAGE);
  const paginatedAdminMovies = filteredAdminMovies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => { setCurrentPage(1); }, [adminSearch]);

  const totalLogPages = Math.ceil(logsList.length / ITEMS_PER_PAGE);
  const paginatedLogs = logsList.slice((logPage - 1) * ITEMS_PER_PAGE, logPage * ITEMS_PER_PAGE);

  return (
    <div className="admin-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-alert ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{lineHeight: '1.4'}}>{toast.message}</span>
        </div>
      )}

      {/* =======================================
          CUSTOM ALERT MODAL (แทน window.confirm)
      ======================================= */}
      {customAlert.isOpen && (
        <div className="modal-overlay" onClick={() => setCustomAlert({ ...customAlert, isOpen: false })}>
          <div className="glass-panel modal-content" style={{ maxWidth: '400px', padding: '2rem', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <AlertTriangle size={56} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{customAlert.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>{customAlert.message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setCustomAlert({ ...customAlert, isOpen: false })}>ยกเลิก</button>
              <button 
                className="btn-primary" 
                style={{ flex: 1, background: '#ef4444' }} 
                onClick={() => { customAlert.onConfirm(); setCustomAlert({ ...customAlert, isOpen: false }); }}
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================
          CUSTOM PROMPT MODAL (แทน window.prompt)
      ======================================= */}
      {promptModal.isOpen && (
        <div className="modal-overlay" onClick={() => setPromptModal({ ...promptModal, isOpen: false })}>
          <div className="glass-panel modal-content" style={{ maxWidth: '400px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Lock size={48} color="#8b5cf6" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>บังคับเปลี่ยนรหัสผ่าน</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ตั้งรหัสผ่านใหม่ให้กับผู้ใช้ <strong>{promptModal.targetUsername}</strong></p>
            </div>
            <form onSubmit={submitForceChangePassword}>
              <div className="form-group">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)" 
                  required 
                  minLength={6}
                  value={promptModal.newPassword} 
                  onChange={e => setPromptModal({...promptModal, newPassword: e.target.value})} 
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setPromptModal({ ...promptModal, isOpen: false })}>ยกเลิก</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, background: '#8b5cf6' }}>บันทึกรหัสผ่าน</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================
          MODAL CONFIRMATION (ตรวจฟอร์มก่อนเซฟหนัง)
      ======================================= */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content-movie confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>ตรวจสอบความถูกต้อง</h2>
              <button className="modal-close-btn" onClick={() => setShowConfirmModal(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body confirm-details">
              <div className="alert-box warning" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem' }}>
                <AlertCircle size={18} />
                <span>กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนกดยืนยันการบันทึก</span>
              </div>
              
              <div className="confirm-grid">
                <div className="confirm-item full"><span className="label">{tAd('title_req').replace('*','')}</span> <span className="value highlight">{formData.title || '-'}</span></div>
                <div className="confirm-item"><span className="label">{tAd('status')}</span> <span className="value status">{statusOptions.find(opt => opt.value === formData.status)?.label || formData.status}</span></div>
                <div className="confirm-item"><span className="label">{tAd('platform')}</span> <span className="value">{formData.platform || '-'}</span></div>
                <div className="confirm-item"><span className="label">{tAd('genre')}</span> <span className="value">{formData.genre || '-'}</span></div>
                <div className="confirm-item"><span className="label">{tAd('director')}</span> <span className="value">{formData.director || '-'}</span></div>
                <div className="confirm-item"><span className="label">{tAd('release_date')}</span> <span className="value">{formData.release_date || '-'}</span></div>
                <div className="confirm-item"><span className="label">{tAd('rating')}</span> <span className="value">{formData.rating || '-'}</span></div>
                <div className="confirm-item"><span className="label">{tAd('air_day')}</span> <span className="value">{formData.air_day || '-'}</span></div>
                <div className="confirm-item"><span className="label">{tAd('air_time')}</span> <span className="value">{formData.air_time || '-'}</span></div>
                <div className="confirm-item full"><span className="label">{tAd('youtube_req').replace('*','')}</span> <span className="value link-break">{formData.youtube_url || '-'}</span></div>
                <div className="confirm-item full"><span className="label">{tAd('admin_note')}</span> <span className="value note">{formData.admin_note || '-'}</span></div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowConfirmModal(false)}>{tAd('btn_cancel_edit')}</button>
              <button type="button" className="btn-primary" onClick={executeSaveMovie} disabled={loading}>
                {loading ? 'กำลังบันทึก...' : (editingId ? 'ยืนยันการแก้ไข' : 'ยืนยันการเพิ่ม')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN MAIN UI */}
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-title">ADMIN MODE</h1>
          <div className="admin-tabs-nav">
            <button className={`admin-tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => {setActiveTab('add'); if(!editingId) resetForm();}}>
              <Plus size={18} /> {editingId ? tAd('tab_editing') : tAd('tab_add')}
            </button>
            <button className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
              <Film size={18} /> {tAd('tab_manage')} ({movies.length})
            </button>
            <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
              <Users size={18} /> {tAd('tab_users')}
            </button>
            <button className={`admin-tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
              <Activity size={18} /> {tAd('tab_logs')}
            </button>
            <button className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <KeyRound size={18} /> {tAd('tab_settings')}
            </button>
          </div>
        </div>

        {/* =======================================
            TAB 1: ADD / EDIT
        ======================================= */}
        {activeTab === 'add' && (
          <div className="admin-card animation-fade-in">
            <h2>{editingId ? tAd('form_edit_title') : tAd('form_add_title')}</h2>
            <form onSubmit={handleMovieSubmitClick} className="admin-form">
              
              <div className="form-group full-width">
                <label>{tAd('status')}</label>
                <div className="status-selector">
                  {statusOptions.map(opt => (
                    <div 
                      key={opt.value} 
                      className={`status-option ${formData.status === opt.value ? 'selected' : ''}`}
                      onClick={() => setFormData({...formData, status: opt.value})}
                    >
                      <div className="status-radio-circle"></div>
                      <span>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group"><label>{tAd('title_req')}</label><input required type="text" name="title" className="form-input" placeholder={tAd('title_ph')} value={formData.title} onChange={handleInputChange} /></div>
                <div className="form-group"><label>{tAd('platform')}</label><input type="text" name="platform" className="form-input" value={formData.platform} onChange={handleInputChange} /></div>
                <div className="form-group"><label>{tAd('genre')}</label><input type="text" name="genre" className="form-input" value={formData.genre} onChange={handleInputChange} /></div>
                <div className="form-group"><label>{tAd('director')}</label><input type="text" name="director" className="form-input" value={formData.director} onChange={handleInputChange} /></div>
                <div className="form-group"><label>{tAd('release_date')}</label><input type="text" name="release_date" className="form-input" value={formData.release_date} onChange={handleInputChange} /></div>
                <div className="form-group"><label>{tAd('rating')}</label><input type="number" step="0.1" name="rating" className="form-input" value={formData.rating} onChange={handleInputChange} /></div>
                <div className="form-group"><label>{tAd('air_day')}</label><input type="text" name="air_day" className="form-input" value={formData.air_day} onChange={handleInputChange} /></div>
                <div className="form-group"><label>{tAd('air_time')}</label><input type="text" name="air_time" className="form-input" value={formData.air_time} onChange={handleInputChange} /></div>
              </div>

              <div className="form-group full-width">
                <label>{tAd('youtube_req')}</label>
                <input required type="url" name="youtube_url" className="form-input" value={formData.youtube_url} onChange={handleInputChange} />
              </div>

              <div className="form-group full-width">
                <label>{tAd('admin_note')}</label>
                <textarea name="admin_note" className="form-input" rows="4" value={formData.admin_note} onChange={handleInputChange}></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: editingId ? '1fr 1fr' : '1fr', gap: '1rem', marginTop: '1rem' }}>
                {editingId && <button type="button" className="btn-secondary" onClick={() => { resetForm(); setActiveTab('manage'); }}>{tAd('btn_cancel_edit')}</button>}
                <button type="submit" className="btn-primary" style={{ padding: '1rem' }}>
                  {editingId ? <><Save size={20}/> ตรวจสอบก่อนแก้ไข</> : <><Plus size={20}/> ตรวจสอบก่อนเพิ่ม</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =======================================
            TAB 2: MANAGE
        ======================================= */}
        {activeTab === 'manage' && (
          <div className="admin-card animation-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2>{tAd('manage_all')} ({movies.length})</h2>
              <div className="search-box">
                <Search size={18} />
                <input type="text" placeholder={tAd('manage_search_ph')} value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} className="search-input-admin" />
              </div>
            </div>

            <div className="admin-list-container">
              {paginatedAdminMovies.map(movie => {
                let statusClass = movie.status === 'Standard' ? 'on-air' : movie.status === 'Coming Soon' ? 'soon' : 'ended';
                let statusText = movie.status === 'Standard' ? tAd('txt_onair') : movie.status === 'Coming Soon' ? tAd('txt_soon') : tAd('txt_ended');
                return (
                  <div key={movie.id} className="admin-list-item">
                    <div className="item-info">
                      <h3>{movie.title}</h3>
                      <p>
                        <span className={`status-badge ${statusClass}`}>{statusText}</span>
                        <span className="meta">{tAd('platform')}: {movie.platform || '-'} | {tAd('genre')}: {movie.genre || '-'}</span>
                      </p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => handleEditClick(movie)} className="btn-icon btn-edit-modern"><Edit size={16} /> {tAd('btn_edit')}</button>
                      <button onClick={() => handleDeleteMovie(movie.id, movie.title)} className="btn-icon btn-delete-modern"><Trash2 size={16} /> {tAd('btn_delete')}</button>
                    </div>
                  </div>
                )
              })}
              {paginatedAdminMovies.length === 0 && <div className="empty-state">ไม่พบข้อมูล</div>}
            </div>

            {totalPages > 1 && (
              <div className="admin-pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16}/> {tAd('btn_prev')}</button>
                <span>{tAd('page_info').replace('{current}', currentPage).replace('{total}', totalPages)}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>{tAd('btn_next')} <ChevronRight size={16}/></button>
              </div>
            )}
          </div>
        )}

        {/* =======================================
            TAB 3: USERS (ADMINS)
        ======================================= */}
        {activeTab === 'users' && (
          <div className="admin-card animation-fade-in">
            <h2>{tAd('admin_title')}</h2>
            
            <form onSubmit={handleAddAdmin} className="add-admin-form">
              <input type="text" className="form-input" placeholder={tAd('admin_new_user')} value={newAdminForm.username} onChange={e=>setNewAdminForm({...newAdminForm, username: e.target.value})} required />
              <input type="password" className="form-input" placeholder={tAd('admin_new_pass')} value={newAdminForm.password} onChange={e=>setNewAdminForm({...newAdminForm, password: e.target.value})} required />
              <button type="submit" className="btn-primary"><Plus size={18} /> {tAd('btn_add_admin')}</button>
            </form>

            <div className="alert-box warning"><AlertCircle size={18} /><span>{tAd('admin_warning')}</span></div>

            <div className="admin-list-container">
              {adminsList.map(admin => (
                <div key={admin.id} className="admin-list-item">
                  <div className="item-info flex-row">
                    <div className="avatar-placeholder"><Users size={20} /></div>
                    <h3>{admin.username} <span style={{color:'var(--pink-accent)', fontSize:'0.9rem'}}>{admin.username === currentAdmin ? tAd('admin_you') : ''}</span></h3>
                  </div>
                  {admin.username !== currentAdmin && (
                    <div className="item-actions">
                      <button onClick={() => handleForceChangePassword(admin.id, admin.username)} className="btn-outline">{tAd('btn_change_pass')}</button>
                      <button onClick={() => handleDeleteAdmin(admin.id, admin.username)} className="btn-outline danger">{tAd('btn_delete')}</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =======================================
            TAB 4: LOGS
        ======================================= */}
        {activeTab === 'logs' && (
          <div className="admin-card animation-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ margin: 0, padding: 0, border: 'none' }}>{tAd('logs_title')}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={selectAllLogs} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  {selectedLogs.length === paginatedLogs.length && paginatedLogs.length > 0 ? tAd('btn_deselect') : tAd('btn_select_all')}
                </button>
                <button onClick={deleteSelectedLogs} disabled={selectedLogs.length === 0} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: 'auto', background: selectedLogs.length > 0 ? '#ef4444' : 'var(--input-bg)' }}>
                  {tAd('btn_del_selected')}
                </button>
                <button onClick={deleteAllLogs} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}>
                  {tAd('btn_del_all')}
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>{tAd('log_col_select')}</th>
                    <th>{tAd('log_col_time')}</th>
                    <th>{tAd('log_col_action')}</th>
                    <th>{tAd('log_col_details')}</th>
                    <th>{tAd('log_col_user')}</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.length > 0 ? paginatedLogs.map(log => {
                    let badgeClass = log.action.includes('ADD') ? 'ADD_MOVIE' : log.action.includes('EDIT') ? 'EDIT_MOVIE' : log.action.includes('DELETE') ? 'DELETE_MOVIE' : log.action.includes('PASSWORD') ? 'CHANGE_PASSWORD' : 'CLEAR_LOGS';
                    return (
                      <tr key={log.id}>
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" checked={selectedLogs.includes(log.id)} onChange={() => toggleSelectLog(log.id)} style={{ cursor: 'pointer', transform: 'scale(1.2)' }} />
                        </td>
                        <td className="time-cell">{new Date(log.created_at).toLocaleString(adminLang === 'en' ? 'en-US' : 'th-TH')}</td>
                        <td><span className={`log-badge ${badgeClass}`}>{log.action}</span></td>
                        <td>
                          <strong>{log.target || '-'}</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.details}</div>
                        </td>
                        <td>{log.performed_by}</td>
                        <td className="ip-cell">{log.ip_address || <span style={{opacity: 0.5}}>Unknown IP</span>}</td>
                      </tr>
                    )
                  }) : (
                    <tr><td colSpan="6" className="empty-table" style={{textAlign: 'center', padding: '2rem'}}>{tAd('log_no_data')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalLogPages > 1 && (
              <div className="admin-pagination" style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', margin: 0 }}>
                <button disabled={logPage === 1} onClick={() => setLogPage(p => p - 1)}><ChevronLeft size={16}/> {tAd('btn_prev')}</button>
                <span>{tAd('page_info').replace('{current}', logPage).replace('{total}', totalLogPages)}</span>
                <button disabled={logPage === totalLogPages} onClick={() => setLogPage(p => p + 1)}>{tAd('btn_next')} <ChevronRight size={16}/></button>
              </div>
            )}
          </div>
        )}

        {/* =======================================
            TAB 5: SETTINGS (PASSWORD)
        ======================================= */}
        {activeTab === 'settings' && (
          <div className="admin-card animation-fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div className="icon-circle-wrapper"><KeyRound size={32} /></div>
              <h2 style={{ margin: '1rem 0 0.5rem 0', border: 'none', padding: 0 }}>{tAd('set_title')}</h2>
            </div>
            <form onSubmit={handleChangeOwnPassword} className="admin-form">
              <div className="form-group full-width"><label>{tAd('set_user')}</label><input type="text" className="form-input disabled" value={passwordForm.username} readOnly disabled /></div>
              <div className="form-group full-width"><label>{tAd('set_old_pass')}</label><input type="password" required className="form-input" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} /></div>
              <div className="form-group full-width"><label>{tAd('set_new_pass')}</label><input type="password" required minLength={6} className="form-input" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} /></div>
              <div className="form-group full-width"><label>{tAd('set_confirm_pass')}</label><input type="password" required minLength={6} className="form-input" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} /></div>
              <button type="submit" className="btn-primary submit-btn" style={{ marginTop: '1rem' }}>{tAd('btn_save_pass')}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;