import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  Film, Plus, Edit, Trash2, Users, Activity, KeyRound, 
  Save, AlertCircle, CheckCircle, Search, X, ChevronLeft, ChevronRight, AlertTriangle, Lock, MessageSquare, Shield, ShieldCheck, ToggleLeft, ToggleRight
} from 'lucide-react';

const adminTranslations = {
  th: {
    tab_add: "เพิ่มภาพยนตร์", tab_editing: "กำลังแก้ไขหนัง...", tab_manage: "จัดการหนัง",
    tab_users: "จัดการแอดมิน", tab_logs: "System Logs", tab_settings: "เปลี่ยนรหัสผ่านตัวเอง",
    tab_community: "จัดการสมาชิก", tab_posts: "จัดการโพสต์",
    form_edit_title: "แก้ไขข้อมูลภาพยนตร์", form_add_title: "เพิ่มภาพยนตร์ใหม่",
    domain: "หมวดหมู่เว็บไซต์ (GL / BL) *",
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
    msg_change_own_pass_success: "เปลี่ยนรหัสผ่านสำเร็จ!", msg_err_change_pass: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
    c_confirm_kick: "ยืนยันการลบผู้ใช้งาน", c_kick_warn: "โพสต์ทั้งหมดของผู้ใช้นี้ในคอมมูนิตี้จะถูกลบไปด้วย", c_kick_success: "ลบผู้ใช้สำเร็จ", c_empty: "ยังไม่มีผู้ใช้งานคอมมูนิตี้",
    p_list: "รายการโพสต์รอตรวจสอบและเผยแพร่", p_author: "ผู้โพสต์", p_content: "เนื้อหา/ข้อความ", p_status: "สถานะ", p_action: "จัดการ",
    perm_title: "สิทธิ์การเข้าถึง", perm_superadmin: "Superadmin (ทุกสิทธิ์)", perm_gl: "จัดการ GL SHOWTIME", perm_bl: "จัดการ BL SHOWTIME",
    perm_community: "จัดการสมาชิก/โพสต์", perm_logs: "ดู/จัดการ System Logs",
    msg_no_perm: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้", msg_update_perm_success: "อัปเดตสิทธิ์เรียบร้อยแล้ว",
    superadmin_badge: "SUPERADMIN", admin_badge: "ADMIN",
    c_name: "Username", c_fullname: "ชื่อ-นามสกุล", c_email: "อีเมล", c_phone: "เบอร์โทร", c_date: "วันที่สมัคร", c_kick: "จัดการ",
  },
  en: {
    tab_add: "Add Movie", tab_editing: "Editing Movie...", tab_manage: "Manage Movies",
    tab_users: "Manage Admins", tab_logs: "System Logs", tab_settings: "Change My Password",
    tab_community: "Manage Members", tab_posts: "Manage Posts",
    form_edit_title: "Edit Movie Details", form_add_title: "Add New Movie",
    domain: "Website Category (GL / BL) *",
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
    msg_change_own_pass_success: "Password changed successfully!", msg_err_change_pass: "Error changing password",
    c_confirm_kick: "Are you sure to delete", c_kick_warn: "All posts from this user will be deleted.", c_kick_success: "User deleted successfully", c_empty: "No community users yet",
    p_list: "Community Posts", p_author: "Author", p_content: "Content", p_status: "Status", p_action: "Action",
    perm_title: "Access Permissions", perm_superadmin: "Superadmin (All Access)", perm_gl: "Manage GL SHOWTIME", perm_bl: "Manage BL SHOWTIME",
    perm_community: "Manage Members/Posts", perm_logs: "View/Manage System Logs",
    msg_no_perm: "You don't have permission to access this section", msg_update_perm_success: "Permissions updated successfully",
    superadmin_badge: "SUPERADMIN", admin_badge: "ADMIN",
    c_name: "Username", c_fullname: "Full Name", c_email: "Email", c_phone: "Phone", c_date: "Join Date", c_kick: "Action",
  }
};

const ITEMS_PER_PAGE = 10;
const SESSION_TIMEOUT_MS = 3 * 60 * 1000; 

// ==============================
// PERMISSION TOGGLE COMPONENT
// ==============================
const PermToggle = ({ label, value, onChange, disabled }) => (
  <div
    onClick={() => !disabled && onChange(!value)}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderRadius: '10px', cursor: disabled ? 'not-allowed' : 'pointer',
      background: value ? 'rgba(236, 72, 153, 0.08)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${value ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.07)'}`,
      opacity: disabled ? 0.5 : 1, transition: 'all 0.2s',
      marginBottom: '8px', userSelect: 'none',
    }}
  >
    <span style={{ fontSize: '0.875rem', color: value ? 'var(--pink-accent)' : 'var(--text-muted)' }}>{label}</span>
    {value
      ? <ToggleRight size={22} color="var(--pink-accent)" />
      : <ToggleLeft size={22} color="#555" />}
  </div>
);

const NoPermission = () => (
  <div className="admin-card animation-fade-in" style={{ textAlign: 'center', padding: '3rem', marginTop: '2rem' }}>
    <Lock size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
    <h3 style={{ color: 'var(--text-muted)', fontWeight: 400 }}>คุณไม่มีสิทธิ์เข้าถึงส่วนนี้</h3>
  </div>
);

const Admin = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const adminLang = language === 'en' ? 'en' : 'th';
  const tAd = (key) => adminTranslations[adminLang]?.[key] || key;

  const currentAdmin = localStorage.getItem('currentAdmin') || 'Unknown';
  const [ipAddress, setIpAddress] = useState('Unknown IP');
  const [currentAdminData, setCurrentAdminData] = useState(null); // holds full row incl. permissions

  const [manageDomain, setManageDomain] = useState('GL'); 

  const [movies, setMovies] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [logsList, setLogsList] = useState([]);
  
  const [communityUsers, setCommunityUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [selectedLogs, setSelectedLogs] = useState([]);
  
  const [activeTab, setActiveTab] = useState('add');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customAlert, setCustomAlert] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: null });
  const [promptModal, setPromptModal] = useState({ isOpen: false, targetId: null, targetUsername: '', newPassword: '' });

  // Permission editing modal state
  const [permModal, setPermModal] = useState({
    isOpen: false,
    targetId: null,
    targetUsername: '',
    perms: { is_superadmin: false, can_manage_gl: false, can_manage_bl: false, can_manage_community: false, can_manage_logs: false }
  });

  const [editingId, setEditingId] = useState(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  
  const initialForm = { title: '', rating: '', release_date: '', genre: '', director: '', platform: '', air_day: '', air_time: '', youtube_url: '', admin_note: '', status: 'Standard', domain: 'GL' };
  const [formData, setFormData] = useState(initialForm);

  // New admin form — includes permissions
  const defaultNewAdminPerms = { is_superadmin: false, can_manage_gl: true, can_manage_bl: false, can_manage_community: false, can_manage_logs: false };
  const [newAdminForm, setNewAdminForm] = useState({ username: '', password: '', ...defaultNewAdminPerms });
  const [passwordForm, setPasswordForm] = useState({ username: currentAdmin, oldPassword: '', newPassword: '', confirmPassword: '' });

  const statusOptions = [
    { value: 'Standard', label: tAd('status_onair') },
    { value: 'Coming Soon', label: tAd('status_soon') },
    { value: 'Ended', label: tAd('status_ended') }
  ];

  // =====================
  // PERMISSION HELPERS
  // =====================
  const isSuperAdmin = currentAdminData?.is_superadmin === true;

  // check if current admin can access a tab
  const canAccess = (tab) => {
    if (!currentAdminData) return false;
    if (currentAdminData.is_superadmin) return true;
    switch (tab) {
      case 'add':
      case 'manage':
        return currentAdminData.can_manage_gl || currentAdminData.can_manage_bl;
      case 'community':
      case 'posts':
        return currentAdminData.can_manage_community;
      case 'logs':
        return currentAdminData.can_manage_logs;
      case 'users':
        return currentAdminData.is_superadmin; // Only superadmin can manage admins
      case 'settings':
        return true; // Everyone can change their own password
      default:
        return false;
    }
  };

  // Can manage specific domain
  const canManageDomain = (domain) => {
    if (!currentAdminData) return false;
    if (currentAdminData.is_superadmin) return true;
    return domain === 'GL' ? currentAdminData.can_manage_gl : currentAdminData.can_manage_bl;
  };

  // ==========================================
  // SESSION TIMEOUT LOGIC
  // ==========================================
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        localStorage.removeItem('isAdmin');
        alert('เซสชันหมดอายุเนื่องจากไม่มีการใช้งานเป็นเวลา 3 นาที ระบบได้ทำการลงชื่อออกอัตโนมัติเพื่อความปลอดภัย');
        navigate('/login'); 
      }, SESSION_TIMEOUT_MS);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
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
    
    fetchCurrentAdminData();
    fetchAdmins();
    fetchLogs();
  }, []);

  useEffect(() => {
    fetchMovies(manageDomain);
  }, [manageDomain]);

  useEffect(() => {
    if (activeTab === 'community') fetchCommunityUsers();
    if (activeTab === 'posts') fetchCommunityPostsAdmin();
  }, [activeTab]);

  // Redirect to first accessible tab once permissions loaded
  useEffect(() => {
    if (!currentAdminData) return;
    if (!canAccess(activeTab)) {
      const tabs = ['add', 'manage', 'community', 'posts', 'logs', 'users', 'settings'];
      const first = tabs.find(t => canAccess(t)) || 'settings';
      setActiveTab(first);
    }
  }, [currentAdminData]);

  const fetchCurrentAdminData = async () => {
    const { data } = await supabase
      .from('admins')
      .select('id, username, is_superadmin, can_manage_gl, can_manage_bl, can_manage_community, can_manage_logs')
      .eq('username', currentAdmin)
      .single();
    if (data) setCurrentAdminData(data);
  };

  const fetchMovies = async (domain = manageDomain) => {
    const tableName = domain === 'GL' ? 'movies' : 'movies_bl';
    const { data } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
    if (data) {
      setMovies(data.map(m => ({ ...m, domain })));
    }
  };

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from('admins')
      .select('id, username, is_superadmin, can_manage_gl, can_manage_bl, can_manage_community, can_manage_logs')
      .order('id', { ascending: true });
    if (data) setAdminsList(data);
  };

  const fetchLogs = async () => {
    const { data } = await supabase.from('logs').select('*').order('created_at', { ascending: false });
    if (data) setLogsList(data);
  };

  const fetchCommunityUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error) setCommunityUsers(data);
    setLoadingUsers(false);
  };

  const fetchCommunityPostsAdmin = async () => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, profiles(username)')
      .order('status', { ascending: false }) 
      .order('created_at', { ascending: false });
    if (!error) setCommunityPosts(data);
    setLoadingPosts(false);
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
    if (!canManageDomain(formData.domain)) {
      showToast(tAd('msg_no_perm'), 'error');
      return;
    }
    setShowConfirmModal(true);
  };

  const executeSaveMovie = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    let statusText = formData.status === 'Standard' ? tAd('txt_onair') : formData.status === 'Coming Soon' ? tAd('txt_soon') : tAd('txt_ended');

    const { domain, ...saveData } = formData;
    const tableName = domain === 'GL' ? 'movies' : 'movies_bl';

    try {
      if (editingId) {
        const { error } = await supabase.from(tableName).update(saveData).eq('id', editingId);
        if (!error) {
          showToast(tAd('msg_update_success'), 'success');
          writeLog('EDIT_MOVIE', formData.title, `Updated movie in ${domain} (Status: ${statusText})`);
          resetForm(); 
          setManageDomain(domain);
          fetchMovies(domain); 
          setActiveTab('manage');
        } else showToast(tAd('msg_update_fail') + error.message, 'error');
      } else {
        const { error } = await supabase.from(tableName).insert([saveData]);
        if (!error) {
          showToast(tAd('msg_add_success'), 'success');
          writeLog('ADD_MOVIE', formData.title, `Added new movie to ${domain} (Status: ${statusText})`);
          resetForm(); 
          setManageDomain(domain);
          fetchMovies(domain); 
          setActiveTab('manage');
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
      admin_note: movie.admin_note || '', status: movie.status || 'Standard',
      domain: movie.domain || manageDomain
    });
    setEditingId(movie.id);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setFormData(initialForm); setEditingId(null); };

  const handleDeleteMovie = (id, title, domain) => {
    setCustomAlert({
      isOpen: true,
      type: 'danger',
      title: 'ยืนยันการลบภาพยนตร์',
      message: tAd('msg_confirm_del_movie').replace('{title}', title),
      onConfirm: async () => {
        const tableName = domain === 'GL' ? 'movies' : 'movies_bl';
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (!error) { 
          showToast(tAd('msg_del_success'), 'success'); 
          writeLog('DELETE_MOVIE', title, `Deleted movie from ${domain}`);
          fetchMovies(domain); 
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
    
    const { error } = await supabase.from('admins').insert([{
      username: newAdminForm.username,
      password: newAdminForm.password,
      is_superadmin: newAdminForm.is_superadmin,
      can_manage_gl: newAdminForm.is_superadmin ? true : newAdminForm.can_manage_gl,
      can_manage_bl: newAdminForm.is_superadmin ? true : newAdminForm.can_manage_bl,
      can_manage_community: newAdminForm.is_superadmin ? true : newAdminForm.can_manage_community,
      can_manage_logs: newAdminForm.is_superadmin ? true : newAdminForm.can_manage_logs,
    }]);
    if(!error) {
      const permSummary = newAdminForm.is_superadmin ? 'Superadmin' : [
        newAdminForm.can_manage_gl && 'GL',
        newAdminForm.can_manage_bl && 'BL',
        newAdminForm.can_manage_community && 'Community',
        newAdminForm.can_manage_logs && 'Logs',
      ].filter(Boolean).join(', ') || 'No permissions';
      showToast(tAd('msg_add_admin_success'), 'success');
      writeLog('ADD_ADMIN', newAdminForm.username, `Created new admin account. Permissions: ${permSummary}`);
      setNewAdminForm({ username: '', password: '', ...defaultNewAdminPerms });
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

  // ============================
  // PERMISSIONS MODAL HANDLERS
  // ============================
  const openPermModal = (admin) => {
    setPermModal({
      isOpen: true,
      targetId: admin.id,
      targetUsername: admin.username,
      perms: {
        is_superadmin: admin.is_superadmin || false,
        can_manage_gl: admin.can_manage_gl || false,
        can_manage_bl: admin.can_manage_bl || false,
        can_manage_community: admin.can_manage_community || false,
        can_manage_logs: admin.can_manage_logs || false,
      }
    });
  };

  const handleUpdatePermissions = async () => {
    const { targetId, targetUsername, perms } = permModal;
    const updateData = perms.is_superadmin
      ? { is_superadmin: true, can_manage_gl: true, can_manage_bl: true, can_manage_community: true, can_manage_logs: true }
      : { ...perms };

    const { error } = await supabase.from('admins').update(updateData).eq('id', targetId);
    if (!error) {
      showToast(tAd('msg_update_perm_success'), 'success');
      const permSummary = perms.is_superadmin ? 'Superadmin' : [
        perms.can_manage_gl && 'GL',
        perms.can_manage_bl && 'BL',
        perms.can_manage_community && 'Community',
        perms.can_manage_logs && 'Logs',
      ].filter(Boolean).join(', ') || 'None';
      writeLog('UPDATE_ADMIN_PERMISSIONS', targetUsername, `Permissions set to: ${permSummary}`);
      fetchAdmins();
      setPermModal(prev => ({ ...prev, isOpen: false }));
    } else {
      showToast(tAd('msg_err') + error.message, 'error');
    }
  };

  const handleDeleteCommunityUser = async (userId, username) => {
    setCustomAlert({
      isOpen: true,
      type: 'danger',
      title: tAd('c_confirm_kick') + ` "${username}"?`,
      message: tAd('c_kick_warn'),
      onConfirm: async () => {
        try {
          const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: userId });
          if (error) throw error;
          showToast(tAd('c_kick_success'), 'success');
          fetchCommunityUsers();
          writeLog('DELETE_USER', username, `Deleted community user: ${username}`);
        } catch (error) {
          showToast(tAd('msg_err') + error.message, 'error');
        }
      }
    });
  };

  const handleApprovePost = async (id) => {
    const { error } = await supabase.from('community_posts').update({ status: 'approved' }).eq('id', id);
    if (!error) {
      showToast('อนุมัติโพสต์เรียบร้อย', 'success');
      writeLog('APPROVE_POST', `Post ID: ${id}`, 'Approved community post');
      fetchCommunityPostsAdmin();
    } else {
      showToast(tAd('msg_err') + error.message, 'error');
    }
  };

  const handleDeletePost = async (id) => {
    setCustomAlert({
      isOpen: true,
      type: 'danger',
      title: 'ยืนยันการลบโพสต์',
      message: 'คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้ออกจากคอมมูนิตี้?',
      onConfirm: async () => {
        const { error } = await supabase.from('community_posts').delete().eq('id', id);
        if (!error) {
          showToast('ลบโพสต์เรียบร้อย', 'success');
          writeLog('DELETE_POST', `Post ID: ${id}`, 'Deleted community post');
          fetchCommunityPostsAdmin();
        } else {
          showToast(tAd('msg_err') + error.message, 'error');
        }
      }
    });
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

  // =====================
  // PERMISSION BADGE
  // =====================
  const AdminPermBadges = ({ admin }) => {
    if (admin.is_superadmin) {
      return (
        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(236,72,153,0.15)', color: 'var(--pink-accent)', border: '1px solid rgba(236,72,153,0.4)', fontWeight: 700, letterSpacing: '0.05em' }}>
          ★ SUPERADMIN
        </span>
      );
    }
    const badges = [];
    if (admin.can_manage_gl) badges.push({ label: 'GL', color: '#ec4899' });
    if (admin.can_manage_bl) badges.push({ label: 'BL', color: '#4db8ff' });
    if (admin.can_manage_community) badges.push({ label: 'Community', color: '#8b5cf6' });
    if (admin.can_manage_logs) badges.push({ label: 'Logs', color: '#10b981' });
    if (badges.length === 0) return <span style={{ fontSize: '0.75rem', color: '#666' }}>ไม่มีสิทธิ์</span>;
    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
        {badges.map(b => (
          <span key={b.label} style={{ fontSize: '0.68rem', padding: '1px 7px', borderRadius: '20px', background: `${b.color}18`, color: b.color, border: `1px solid ${b.color}55`, fontWeight: 600 }}>
            {b.label}
          </span>
        ))}
      </div>
    );
  };

  // ============================
  // PERMISSION GUARD COMPONENT
  // ============================
  const NoPermission = () => (
    <div className="admin-card animation-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
      <Shield size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
      <h3 style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{tAd('msg_no_perm')}</h3>
    </div>
  );

  return (
    <div className="admin-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-alert ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{lineHeight: '1.4'}}>{toast.message}</span>
        </div>
      )}

      {/* CUSTOM ALERT MODAL */}
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

      {/* CUSTOM PROMPT MODAL */}
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

      {/* ================================
          PERMISSION EDIT MODAL
      ================================ */}
      {permModal.isOpen && (
        <div className="modal-overlay" onClick={() => setPermModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="glass-panel modal-content" style={{ maxWidth: '420px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <ShieldCheck size={28} color="var(--pink-accent)" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{tAd('perm_title')}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{permModal.targetUsername}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              {/* Superadmin toggle */}
              <PermToggle
                label={`★ ${tAd('perm_superadmin')}`}
                value={permModal.perms.is_superadmin}
                onChange={(val) => setPermModal(prev => ({ ...prev, perms: { ...prev.perms, is_superadmin: val } }))}
              />
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '12px 0 10px', paddingTop: '10px' }}>
                <p style={{ fontSize: '0.78rem', color: '#666', marginBottom: '8px' }}>สิทธิ์เฉพาะ (ใช้เมื่อไม่ใช่ Superadmin)</p>
                <PermToggle
                  label={tAd('perm_gl')}
                  value={permModal.perms.can_manage_gl}
                  onChange={(val) => setPermModal(prev => ({ ...prev, perms: { ...prev.perms, can_manage_gl: val } }))}
                  disabled={permModal.perms.is_superadmin}
                />
                <PermToggle
                  label={tAd('perm_bl')}
                  value={permModal.perms.can_manage_bl}
                  onChange={(val) => setPermModal(prev => ({ ...prev, perms: { ...prev.perms, can_manage_bl: val } }))}
                  disabled={permModal.perms.is_superadmin}
                />
                <PermToggle
                  label={tAd('perm_community')}
                  value={permModal.perms.can_manage_community}
                  onChange={(val) => setPermModal(prev => ({ ...prev, perms: { ...prev.perms, can_manage_community: val } }))}
                  disabled={permModal.perms.is_superadmin}
                />
                <PermToggle
                  label={tAd('perm_logs')}
                  value={permModal.perms.can_manage_logs}
                  onChange={(val) => setPermModal(prev => ({ ...prev, perms: { ...prev.perms, can_manage_logs: val } }))}
                  disabled={permModal.perms.is_superadmin}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setPermModal(prev => ({ ...prev, isOpen: false }))}>ยกเลิก</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleUpdatePermissions}>บันทึกสิทธิ์</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION (ตรวจสอบก่อนเซฟหนัง) */}
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
                <div className="confirm-item full">
                  <span className="label">หมวดหมู่เว็บ</span> 
                  <span className="value highlight" style={{ color: formData.domain === 'BL' ? '#4db8ff' : 'var(--pink-accent)' }}>
                    {formData.domain === 'BL' ? 'BL SHOWTIME' : 'GL SHOWTIME'}
                  </span>
                </div>
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

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>ย้อนกลับแก้ไข</button>
              <button className="btn-primary" onClick={executeSaveMovie} disabled={loading}>
                {loading ? 'กำลังบันทึก...' : (editingId ? <><Save size={18}/> ยืนยันการแก้ไข</> : <><Plus size={18}/> ยืนยันการเพิ่ม</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN HEADER */}
      <div className="admin-header">
        <h1 className="admin-mode-title">ADMIN MODE</h1>
        {currentAdminData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>เข้าสู่ระบบในฐานะ</span>
            <strong style={{ color: 'var(--text-main)' }}>{currentAdmin}</strong>
            {currentAdminData.is_superadmin
              ? <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(236,72,153,0.15)', color: 'var(--pink-accent)', border: '1px solid rgba(236,72,153,0.35)', fontWeight: 700 }}>★ SUPERADMIN</span>
              : <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px solid #333', fontWeight: 600 }}>ADMIN</span>
            }
          </div>
        )}
        <div
  className="admin-tabs"
  style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    marginBottom: '2rem'
  }}
>
  {canAccess('add') && (
    <button
      className={`admin-tab ${(activeTab === 'add') ? 'active' : ''}`}
      onClick={() => setActiveTab('add')}
    >
      <Plus size={18} /> {editingId ? tAd('tab_editing') : tAd('tab_add')}
    </button>
  )}

  {canAccess('manage') && (
    <button
      className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`}
      onClick={() => setActiveTab('manage')}
    >
      <Film size={18} /> {tAd('tab_manage')}
    </button>
  )}

  {isSuperAdmin && (
    <button
      className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
      onClick={() => setActiveTab('users')}
    >
      <Users size={18} /> {tAd('tab_users')}
    </button>
  )}

  {canAccess('community') && (
    <button
      className={`admin-tab ${activeTab === 'community' ? 'active' : ''}`}
      onClick={() => setActiveTab('community')}
    >
      <Users size={18} color="#8b5cf6" />
      <span style={{ color: '#8b5cf6' }}>{tAd('tab_community')}</span>
    </button>
  )}

  {canAccess('posts') && (
    <button
      className={`admin-tab ${activeTab === 'posts' ? 'active' : ''}`}
      onClick={() => setActiveTab('posts')}
    >
      <MessageSquare size={18} color="#ff2a7a" />
      <span style={{ color: 'var(--pink-accent)' }}>{tAd('tab_posts')}</span>
    </button>
  )}

  {canAccess('logs') && (
    <button
      className={`admin-tab ${activeTab === 'logs' ? 'active' : ''}`}
      onClick={() => setActiveTab('logs')}
    >
      <Activity size={18} /> {tAd('tab_logs')}
    </button>
  )}

  <button
    className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
    onClick={() => setActiveTab('settings')}
  >
    <KeyRound size={18} /> {tAd('tab_settings')}
  </button>
</div>

      {/* =======================================
          TAB 1: ADD / EDIT
      ======================================= */}
      {activeTab === 'add' && (
        canAccess('add') ? (
          <div className="admin-card animation-fade-in">
            <h2>{editingId ? tAd('form_edit_title') : tAd('form_add_title')}</h2>
            <form onSubmit={handleMovieSubmitClick} className="admin-form">
              
              <div className="form-group full-width">
                <label>{tAd('domain')}</label>
                <div className="status-selector" style={{ pointerEvents: editingId ? 'none' : 'auto', opacity: editingId ? 0.6 : 1 }}>
                  {/* Only show GL if has GL permission */}
                  {(isSuperAdmin || currentAdminData?.can_manage_gl) && (
                    <div 
                      className={`status-option ${formData.domain === 'GL' ? 'selected' : ''}`}
                      onClick={() => !editingId && setFormData({...formData, domain: 'GL'})}
                    >
                      <div className="status-radio-circle"></div>
                      <span style={{ fontWeight: formData.domain === 'GL' ? 'bold' : 'normal', color: formData.domain === 'GL' ? 'var(--pink-accent)' : '' }}>GL SHOWTIME</span>
                    </div>
                  )}
                  {/* Only show BL if has BL permission */}
                  {(isSuperAdmin || currentAdminData?.can_manage_bl) && (
                    <div 
                      className={`status-option ${formData.domain === 'BL' ? 'selected' : ''}`}
                      onClick={() => !editingId && setFormData({...formData, domain: 'BL'})}
                    >
                      <div className="status-radio-circle" style={{ borderColor: formData.domain === 'BL' ? '#4db8ff' : '' }}></div>
                      <span style={{ fontWeight: formData.domain === 'BL' ? 'bold' : 'normal', color: formData.domain === 'BL' ? '#4db8ff' : '' }}>BL SHOWTIME</span>
                    </div>
                  )}
                </div>
                {editingId && <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>* ไม่สามารถย้ายหมวดหมู่เว็บไซต์ขณะแก้ไขได้ หากต้องการย้ายให้ลบเรื่องนี้แล้วเพิ่มใหม่</small>}
              </div>

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
                <button type="submit" className="btn-primary" style={{ padding: '1rem', background: formData.domain === 'BL' ? '#4db8ff' : '' }}>
                  {editingId ? <><Save size={20}/> ตรวจสอบก่อนแก้ไข</> : <><Plus size={20}/> ตรวจสอบก่อนเพิ่ม</>}
                </button>
              </div>
            </form>
          </div>
        ) : <NoPermission />
      )}

      {/* =======================================
          TAB 2: MANAGE
      ======================================= */}
      {activeTab === 'manage' && (
        canAccess('manage') ? (
          <div className="admin-card animation-fade-in">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', background: 'var(--glass-bg)', padding: '0.5rem', borderRadius: '12px' }}>
              {(isSuperAdmin || currentAdminData?.can_manage_gl) && (
                <button 
                  className={`admin-tab ${manageDomain === 'GL' ? 'active' : ''}`}
                  onClick={() => setManageDomain('GL')}
                  style={{ flex: 1, textAlign: 'center', background: manageDomain === 'GL' ? 'var(--pink-accent)' : 'transparent', color: manageDomain === 'GL' ? 'white' : '' }}
                >
                  คลังข้อมูล GL SHOWTIME
                </button>
              )}
              {(isSuperAdmin || currentAdminData?.can_manage_bl) && (
                <button 
                  className={`admin-tab ${manageDomain === 'BL' ? 'active' : ''}`}
                  onClick={() => setManageDomain('BL')}
                  style={{ flex: 1, textAlign: 'center', background: manageDomain === 'BL' ? '#4db8ff' : 'transparent', color: manageDomain === 'BL' ? 'white' : '' }}
                >
                  คลังข้อมูล BL SHOWTIME
                </button>
              )}
            </div>

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
                  <div key={movie.id} className="admin-list-item" style={{ borderLeft: `4px solid ${movie.domain === 'BL' ? '#4db8ff' : 'var(--pink-accent)'}` }}>
                    <div className="item-info">
                      <h3>{movie.title}</h3>
                      <p>
                        <span className={`status-badge ${statusClass}`}>{statusText}</span>
                        <span className="meta">{tAd('platform')}: {movie.platform || '-'} | {tAd('genre')}: {movie.genre || '-'}</span>
                      </p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => handleEditClick(movie)} className="btn-icon btn-edit-modern"><Edit size={16} /> {tAd('btn_edit')}</button>
                      <button onClick={() => handleDeleteMovie(movie.id, movie.title, movie.domain)} className="btn-icon btn-delete-modern"><Trash2 size={16} /> {tAd('btn_delete')}</button>
                    </div>
                  </div>
                )
              })}
              {paginatedAdminMovies.length === 0 && <div className="empty-state">ไม่พบข้อมูลในหมวดหมู่นี้</div>}
            </div>

            {totalPages > 1 && (
              <div className="admin-pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16}/> {tAd('btn_prev')}</button>
                <span>{tAd('page_info').replace('{current}', currentPage).replace('{total}', totalPages)}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>{tAd('btn_next')} <ChevronRight size={16}/></button>
              </div>
            )}
          </div>
        ) : <NoPermission />
      )}

      {/* =======================================
          TAB 3: USERS (ADMINS) — SUPERADMIN ONLY
      ======================================= */}
      {activeTab === 'users' && (
        isSuperAdmin ? (
          <div className="admin-card animation-fade-in">
            <h2>{tAd('admin_title')}</h2>
            
            {/* ========== ADD NEW ADMIN FORM ========== */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} color="var(--pink-accent)" /> เพิ่มแอดมินใหม่
              </h3>
              <form onSubmit={handleAddAdmin}>
                {/* Username + Password row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={tAd('admin_new_user')}
                    value={newAdminForm.username}
                    onChange={e => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    className="form-input"
                    placeholder={tAd('admin_new_pass')}
                    value={newAdminForm.password}
                    onChange={e => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    required
                  />
                </div>

                {/* Permissions section */}
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Shield size={13} /> กำหนดสิทธิ์การเข้าถึง
                  </p>
                  <PermToggle
                    label={`★ ${tAd('perm_superadmin')}`}
                    value={newAdminForm.is_superadmin}
                    onChange={(val) => setNewAdminForm(prev => ({ ...prev, is_superadmin: val }))}
                  />
                  {!newAdminForm.is_superadmin && (
                    <>
                      <PermToggle
                        label={tAd('perm_gl')}
                        value={newAdminForm.can_manage_gl}
                        onChange={(val) => setNewAdminForm(prev => ({ ...prev, can_manage_gl: val }))}
                      />
                      <PermToggle
                        label={tAd('perm_bl')}
                        value={newAdminForm.can_manage_bl}
                        onChange={(val) => setNewAdminForm(prev => ({ ...prev, can_manage_bl: val }))}
                      />
                      <PermToggle
                        label={tAd('perm_community')}
                        value={newAdminForm.can_manage_community}
                        onChange={(val) => setNewAdminForm(prev => ({ ...prev, can_manage_community: val }))}
                      />
                      <PermToggle
                        label={tAd('perm_logs')}
                        value={newAdminForm.can_manage_logs}
                        onChange={(val) => setNewAdminForm(prev => ({ ...prev, can_manage_logs: val }))}
                      />
                    </>
                  )}
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  <Plus size={18} /> {tAd('btn_add_admin')}
                </button>
              </form>
            </div>

            <div className="alert-box warning"><AlertCircle size={18} /><span>{tAd('admin_warning')}</span></div>

            {/* ========== ADMIN LIST ========== */}
            <div className="admin-list-container">
              {adminsList.map(admin => (
                <div key={admin.id} className="admin-list-item">
                  <div className="item-info flex-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="avatar-placeholder"><Users size={20} /></div>
                      <h3 style={{ margin: 0 }}>
                        {admin.username}
                        {admin.username === currentAdmin && (
                          <span style={{ color: 'var(--pink-accent)', fontSize: '0.85rem', marginLeft: '6px' }}>{tAd('admin_you')}</span>
                        )}
                      </h3>
                    </div>
                    <AdminPermBadges admin={admin} />
                  </div>
                  <div className="item-actions" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {/* Edit Permissions button — for others */}
                    {admin.username !== currentAdmin && (
                      <button
                        onClick={() => openPermModal(admin)}
                        className="btn-outline"
                        style={{ color: 'var(--pink-accent)', borderColor: 'rgba(236,72,153,0.4)', fontSize: '0.8rem', padding: '5px 10px' }}
                      >
                        <Shield size={14} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
                        สิทธิ์
                      </button>
                    )}
                    {admin.username !== currentAdmin && (
                      <>
                        <button onClick={() => handleForceChangePassword(admin.id, admin.username)} className="btn-outline" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>{tAd('btn_change_pass')}</button>
                        <button onClick={() => handleDeleteAdmin(admin.id, admin.username)} className="btn-outline danger" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>{tAd('btn_delete')}</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : <NoPermission />
      )}

      {/* =======================================
          TAB 4: COMMUNITY USERS
      ======================================= */}
      {activeTab === 'community' && (
        canAccess('community') ? (
          <div className="admin-card animation-fade-in">
            <h2 style={{ marginBottom: '20px' }}>{tAd('tab_community')}</h2>
            
            {loadingUsers ? (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>กำลังโหลดข้อมูล...</p>
            ) : (
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#121212', borderBottom: '2px solid #333' }}>
                      <th style={{ padding: '12px', color: '#ccc' }}>{tAd('c_name')}</th>
                      <th style={{ padding: '12px', color: '#ccc' }}>{tAd('c_fullname')}</th>
                      <th style={{ padding: '12px', color: '#ccc' }}>{tAd('c_email')}</th>
                      <th style={{ padding: '12px', color: '#ccc' }}>{tAd('c_phone')}</th>
                      <th style={{ padding: '12px', color: '#ccc' }}>{tAd('c_date')}</th>
                      <th style={{ padding: '12px', color: '#ccc', textAlign: 'right' }}>{tAd('c_kick')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {communityUsers.length > 0 ? (
                      communityUsers.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #222' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#8b5cf6' }}>{user.username}</td>
                          <td style={{ padding: '12px' }}>{user.full_name}</td>
                          <td style={{ padding: '12px' }}>{user.email || '-'}</td>
                          <td style={{ padding: '12px' }}>{user.phone_number || '-'}</td>
                          <td style={{ padding: '12px' }}>{new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <button 
                              onClick={() => handleDeleteCommunityUser(user.id, user.username)}
                              className="btn-outline danger"
                              style={{ padding: '6px 12px' }}
                            >
                              <Trash2 size={14} style={{ marginRight: '4px', display: 'inline' }}/> เตะออก
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                          <AlertCircle size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
                          {tAd('c_empty')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : <NoPermission />
      )}

      {/* =======================================
          TAB 5: MANAGE POSTS
      ======================================= */}
      {activeTab === 'posts' && (
        canAccess('posts') ? (
          <div className="admin-card animation-fade-in posts-panel">
            <h2 style={{ marginBottom: '20px' }}>{tAd('p_list')}</h2>
            
            {loadingPosts ? (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>กำลังโหลดข้อมูล...</p>
            ) : (
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#121212', borderBottom: '2px solid #333' }}>
                      <th style={{ padding: '12px', color: '#ccc' }}>{tAd('p_author')}</th>
                      <th style={{ padding: '12px', color: '#ccc' }}>{tAd('p_content')}</th>
                      <th style={{ padding: '12px', color: '#ccc' }}>รูปภาพ</th>
                      <th style={{ padding: '12px', color: '#ccc' }}>{tAd('p_status')}</th>
                      <th style={{ padding: '12px', color: '#ccc', textAlign: 'right' }}>{tAd('p_action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {communityPosts.length > 0 ? communityPosts.map(post => (
                      <tr key={post.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '12px', color: '#ff2a7a', fontWeight: 'bold' }}>{post.profiles?.username || post.creator_name || 'แอดมิน'}</td>
                        <td style={{ padding: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.content || '-'}</td>
                        <td style={{ padding: '12px' }}>
                          {post.image_url ? <a href={post.image_url} target="_blank" rel="noreferrer" style={{color: '#3b82f6', textDecoration: 'underline'}}>ดูรูป</a> : '-'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                            background: post.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: post.status === 'pending' ? '#f59e0b' : '#10b981',
                            border: `1px solid ${post.status === 'pending' ? '#f59e0b' : '#10b981'}`
                          }}>
                            {post.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {post.status === 'pending' && (
                            <button onClick={() => handleApprovePost(post.id)} className="btn-outline" style={{ padding: '4px 8px', color: '#10b981', borderColor: '#10b981' }}>อนุมัติ</button>
                          )}
                          <button onClick={() => handleDeletePost(post.id)} className="btn-outline danger" style={{ padding: '4px 8px' }}>ลบ</button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>ไม่มีโพสต์ในระบบ</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : <NoPermission />
      )}

      {/* =======================================
          TAB 6: LOGS
      ======================================= */}
      {activeTab === 'logs' && (
        canAccess('logs') ? (
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
                    let badgeClass = log.action.includes('ADD') ? 'ADD_MOVIE' : log.action.includes('EDIT') ? 'EDIT_MOVIE' : log.action.includes('DELETE') ? 'DELETE_MOVIE' : log.action.includes('PASSWORD') ? 'CHANGE_PASSWORD' : log.action.includes('PERM') ? 'UPDATE_PERM' : 'CLEAR_LOGS';
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
        ) : <NoPermission />
      )}

      {/* =======================================
          TAB 7: SETTINGS (PASSWORD)
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
  );
};

export default Admin;