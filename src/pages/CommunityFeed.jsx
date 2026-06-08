import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Settings, LogOut, Trash2, Image as ImageIcon, Link as LinkIcon, User, List, Camera, Lock, Sparkles, Film, Heart } from 'lucide-react';
import './CommunityFeed.css';

const POSTS_PER_PAGE = 10;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const CommunityFeed = ({ currentUser, isAdmin }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  const [creatorName, setCreatorName] = useState('');
  const [creatorLink, setCreatorLink] = useState('');
  const [copyrightAgreed, setCopyrightAgreed] = useState(false);
  
  // State ใหม่สำหรับแยกระบบ GL / BL
  const [postDomain, setPostDomain] = useState('GL'); // หมวดหมู่ตอนสร้างโพสต์
  const [filterDomain, setFilterDomain] = useState('ALL'); // หมวดหมู่ตอนดูฟีด
  
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Profile Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ username: '', full_name: '', phone_number: '', avatar_url: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  
  // Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [showMyPostsModal, setShowMyPostsModal] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [isLoadingMyPosts, setIsLoadingMyPosts] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

  // ================= FETCH POSTS =================
  const fetchPosts = async (pageNumber = 1, isLoadMore = false, currentFilter = filterDomain) => {
    if (isLoadMore) setIsLoadingMore(true);

    const from = (pageNumber - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    let query = supabase
      .from('community_posts')
      .select('*, profiles(username, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (!isAdmin) {
      query = query.eq('status', 'approved');
    }
    
    // กรองตามหมวดหมู่ GL / BL
    if (currentFilter !== 'ALL') {
      query = query.eq('domain', currentFilter);
    }

    const { data, count, error } = await query;
    
    if (!error) {
      if (isLoadMore) {
        setPosts(prev => [...prev, ...data]);
      } else {
        setPosts(data);
      }
      setHasMore(to < count - 1);
    }
    
    if (isLoadMore) setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchPosts(1, false, filterDomain);
  }, [filterDomain, isAdmin]); // โหลดใหม่เมื่อเปลี่ยนแท็บ

  useEffect(() => {
    if (currentUser) loadProfile();
  }, [currentUser]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true, filterDomain);
  };

  // ================= MY POSTS MANAGEMENT =================
  const fetchMyPosts = async () => {
    if (!currentUser) return;
    setIsLoadingMyPosts(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
      
    if (!error) setMyPosts(data);
    setIsLoadingMyPosts(false);
  };

  const handleOpenMyPosts = () => {
    fetchMyPosts();
    setShowMyPostsModal(true);
  };

  const handleDeleteOwnPost = async (postId) => {
    if (window.confirm('คุณต้องการลบโพสต์ของตัวเองใช่หรือไม่?')) {
      const { error } = await supabase.from('community_posts').delete().eq('id', postId);
      if (!error) {
        showToast('ลบโพสต์เรียบร้อย', 'success');
        setMyPosts(prev => prev.filter(post => post.id !== postId));
        setPosts(prev => prev.filter(post => post.id !== postId));
      } else {
        showToast('เกิดข้อผิดพลาดในการลบโพสต์', 'error');
      }
    }
  };

  // ================= PROFILE MANAGEMENT =================
  const loadProfile = async () => {
    if (!currentUser) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
    if (data) {
      setProfileData({ 
        username: data.username || '', full_name: data.full_name || '', 
        phone_number: data.phone_number || '', avatar_url: data.avatar_url || ''
      });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) { showToast('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 2MB', 'error'); return; }
      setAvatarFile(file);
      setProfileData(prev => ({ ...prev, avatar_url: URL.createObjectURL(file) }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      let avatarUrl = profileData.avatar_url;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${currentUser.id}_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = data.publicUrl;
      }

      const { error: profileError } = await supabase.from('profiles').update({
        username: profileData.username, full_name: profileData.full_name,
        phone_number: profileData.phone_number, avatar_url: avatarUrl
      }).eq('id', currentUser.id);

      if (profileError) throw profileError;

      if (newPassword) {
        if (newPassword !== confirmNewPassword) throw new Error("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน");
        if (newPassword.length < 6) throw new Error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        
        setIsChangingPassword(true);
        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        setIsChangingPassword(false);
        if (pwdError) throw pwdError;
        setNewPassword(''); setConfirmNewPassword('');
      }

      showToast('บันทึกการตั้งค่าเรียบร้อย', 'success');
      setShowProfileModal(false); setAvatarFile(null);
      fetchPosts(1, false, filterDomain);
    } catch (err) {
      showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
    } finally {
      setIsSavingProfile(false); setIsChangingPassword(false);
    }
  };

  // ================= POST ACTIONS =================
  const handleImageUpload = async (file) => {
    if (file.size > MAX_FILE_SIZE) throw new Error('ไฟล์แนบต้องมีขนาดไม่เกิน 2MB');
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${currentUser?.id || 'admin'}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('post_images').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('post_images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.trim() && !imageFile) { showToast('กรุณาใส่ข้อความหรือรูปภาพ', 'error'); return; }
    if (!copyrightAgreed) { showToast('กรุณายอมรับเงื่อนไขการเผยแพร่ข้อมูลก่อน', 'error'); return; }

    setIsUploading(true);
    try {
      let imageUrl = null;
      if (imageFile) imageUrl = await handleImageUpload(imageFile);

      const { error } = await supabase.from('community_posts').insert([
        {
          user_id: currentUser?.id || null, content: newContent, image_url: imageUrl,
          creator_name: creatorName || null, creator_link: creatorLink || null,
          copyright_agreed: copyrightAgreed, status: isAdmin ? 'approved' : 'pending',
          domain: postDomain // บันทึกว่าโพสต์นี้เป็นของ GL หรือ BL
        }
      ]);

      if (error) throw error;
      
      setNewContent(''); setImageFile(null); setCreatorName(''); setCreatorLink(''); setCopyrightAgreed(false);
      showToast(isAdmin ? 'โพสต์สำเร็จ!' : 'ส่งโพสต์สำเร็จ รอแอดมินตรวจสอบครับ', 'success');
      
      // สลับไปดูแท็บของเนื้อหาที่เพิ่งโพสต์
      setFilterDomain(postDomain);
      setPage(1);
    } catch (error) {
      showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdminAction = async (postId, action) => {
    if (action === 'approve') {
      await supabase.from('community_posts').update({ status: 'approved' }).eq('id', postId);
      showToast('อนุมัติโพสต์เรียบร้อย', 'success');
    } else if (action === 'delete') {
      if (window.confirm('ต้องการลบโพสต์นี้ใช่หรือไม่?')) {
        await supabase.from('community_posts').delete().eq('id', postId);
        showToast('ลบโพสต์เรียบร้อย', 'success');
      }
    }
    fetchPosts(1, false, filterDomain);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast('ออกจากระบบเรียบร้อย', 'success');
    setTimeout(() => { window.location.reload(); }, 1500);
  };

  return (
    <div className="community-wrapper">
      {/* Toast */}
      {toast.show && (
        <div className={`toast-alert glass-morphism ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ================= MODALS ================= */}
      {showMyPostsModal && (
        <div className="profile-modal-overlay" onClick={() => setShowMyPostsModal(false)}>
          <div className="profile-modal-content macos-window my-posts-modal" onClick={e => e.stopPropagation()}>
            <div className="macos-header">
              <div className="macos-buttons">
                <span className="close" onClick={() => setShowMyPostsModal(false)}></span>
                <span className="minimize"></span>
                <span className="maximize"></span>
              </div>
              <h3 className="modal-title"><List size={18} /> โพสต์ของฉัน</h3>
            </div>
            
            <div className="my-posts-list">
              {isLoadingMyPosts ? <p className="text-center">กำลังโหลดข้อมูล...</p> : myPosts.length === 0 ? <p className="text-center">คุณยังไม่เคยโพสต์ข้อมูล</p> : (
                myPosts.map(post => (
                  <div key={post.id} className="my-post-item glass-morphism">
                    <div className="my-post-content">
                      <div className="my-post-header">
                        <span className={`domain-badge ${post.domain === 'BL' ? 'badge-bl' : 'badge-gl'}`}>{post.domain}</span>
                        <span className="my-post-date">{new Date(post.created_at).toLocaleDateString('th-TH')}</span>
                      </div>
                      <p>{post.content || '(มีแต่รูปภาพ)'}</p>
                      <span className={`badge-status ${post.status === 'approved' ? 'approved' : 'pending'}`}>
                        {post.status === 'approved' ? 'เผยแพร่แล้ว' : 'รอการตรวจสอบ'}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteOwnPost(post.id)} className="btn-delete-mypost"><Trash2 size={16} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal-content macos-window settings-modal" onClick={e => e.stopPropagation()}>
            <div className="macos-header">
              <div className="macos-buttons">
                <span className="close" onClick={() => setShowProfileModal(false)}></span>
                <span className="minimize"></span>
                <span className="maximize"></span>
              </div>
              <h3 className="modal-title"><Settings size={18} /> การตั้งค่าบัญชี</h3>
            </div>
            
            <form onSubmit={handleSaveProfile} className="settings-form">
              <div className="settings-scroll-area">
                <div className="avatar-upload-section">
                  <div className="avatar-preview glass-morphism">
                    {profileData.avatar_url ? <img src={profileData.avatar_url} alt="Profile" /> : <span className="avatar-placeholder">{profileData.username?.charAt(0)?.toUpperCase() || 'U'}</span>}
                    <label className="avatar-upload-btn"><Camera size={16} /><input type="file" accept="image/*" onChange={handleAvatarChange} hidden /></label>
                  </div>
                </div>

                <div className="form-group"><label>ชื่อผู้ใช้ (Username)</label><input type="text" className="modern-input" value={profileData.username} onChange={e => setProfileData({...profileData, username: e.target.value})} required /></div>
                <div className="form-group"><label>ชื่อ-นามสกุล</label><input type="text" className="modern-input" value={profileData.full_name} onChange={e => setProfileData({...profileData, full_name: e.target.value})} required /></div>
                
                <div className="divider"></div>
                <h4 className="gradient-text"><Lock size={16} /> เปลี่ยนรหัสผ่าน</h4>
                <div className="form-group"><label>รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label><input type="password" className="modern-input" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
                <div className="form-group"><label>ยืนยันรหัสผ่านใหม่</label><input type="password" className="modern-input" placeholder="••••••••" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} /></div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-modern secondary" onClick={() => setShowProfileModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn-modern primary" disabled={isSavingProfile || isChangingPassword}>
                  {isSavingProfile || isChangingPassword ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= HEADER & HERO ================= */}
      <div className="community-hero glass-morphism">
        <div className="hero-content">
          <h1 className="hero-title"><Sparkles size={28} className="spin-slow" /> SHOWTIME <span className="gradient-text">COMMUNITY</span></h1>
          <p>พื้นที่พูดคุย แลกเปลี่ยน และหวีดซีรีส์เรื่องโปรดของคุณ</p>
        </div>
        
        {currentUser && !isAdmin && (
          <div className="hero-actions">
            <button onClick={handleOpenMyPosts} className="btn-glass"><List size={16} /> โพสต์ของฉัน</button>
            <button onClick={() => setShowProfileModal(true)} className="btn-glass"><Settings size={16} /> ตั้งค่า</button>
            <button onClick={handleLogout} className="btn-glass danger"><LogOut size={16} /></button>
          </div>
        )}
      </div>

      {/* ================= CREATE POST ================= */}
      <div className="create-post-container">
        {currentUser || isAdmin ? (
          <div className="create-post-card glass-morphism">
            {/* โซนเลือกหมวดหมู่ก่อนโพสต์ */}
            <div className="domain-selector-post">
              <span>กำลังโพสต์ลงในหมวดหมู่:</span>
              <button type="button" onClick={() => setPostDomain('GL')} className={`domain-btn gl ${postDomain === 'GL' ? 'active' : ''}`}>GL SHOWTIME</button>
              <button type="button" onClick={() => setPostDomain('BL')} className={`domain-btn bl ${postDomain === 'BL' ? 'active' : ''}`}>BL SHOWTIME</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="post-input-wrapper">
                <div className="current-user-avatar">
                  {profileData.avatar_url ? <img src={profileData.avatar_url} alt="Me" /> : (currentUser ? profileData.username?.charAt(0)?.toUpperCase() || 'U' : 'A')}
                </div>
                <textarea className="post-textarea modern-input" rows="3" placeholder={`มีอะไรอัปเดตเกี่ยวกับซีรีส์ ${postDomain} บ้างไหม?`} value={newContent} onChange={(e) => setNewContent(e.target.value)}></textarea>
              </div>
              
              <div className="post-attachments">
                <div className="input-with-icon modern-input"><User size={16} /><input type="text" placeholder="ชื่อเจ้าของเครดิต (ถ้ามี)" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} /></div>
                <div className="input-with-icon modern-input"><LinkIcon size={16} /><input type="url" placeholder="ลิงก์อ้างอิง (ถ้ามี)" value={creatorLink} onChange={(e) => setCreatorLink(e.target.value)} /></div>
              </div>

              <div className="post-footer">
                <div className="upload-btn-wrapper">
                  <label className="btn-glass"><ImageIcon size={18} /> {imageFile ? imageFile.name : 'แนบรูปภาพ'}<input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} hidden /></label>
                </div>
                
                <div className="submit-section">
                  <label className="modern-checkbox">
                    <input type="checkbox" checked={copyrightAgreed} onChange={(e) => setCopyrightAgreed(e.target.checked)} />
                    <span className="checkmark"></span> <span className="text">ยืนยันการอนุญาตลิขสิทธิ์</span>
                  </label>
                  <button type="submit" disabled={isUploading || !copyrightAgreed} className={`btn-modern ${postDomain === 'BL' ? 'bl-gradient' : 'gl-gradient'}`}>
                    {isUploading ? 'กำลังโพสต์...' : 'โพสต์เลย'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="guest-prompt glass-morphism">
            <Heart size={40} className="pulse-anim" color="#ff2a7a" />
            <h3>ร่วมเป็นส่วนหนึ่งในคอมมูนิตี้</h3>
            <p>แบ่งปันข่าวสาร อัปเดตตารางฉาย และหวีดซีรีส์ไปพร้อมกัน</p>
            <button onClick={() => navigate('/community/auth')} className="btn-modern gl-gradient">เข้าสู่ระบบ / สมัครสมาชิก</button>
          </div>
        )}
      </div>

      {/* ================= FILTER TABS ================= */}
      <div className="feed-filter-tabs glass-morphism">
        <button onClick={() => setFilterDomain('ALL')} className={`tab-btn ${filterDomain === 'ALL' ? 'active' : ''}`}><Sparkles size={16}/> ฟีดทั้งหมด</button>
        <button onClick={() => setFilterDomain('GL')} className={`tab-btn gl ${filterDomain === 'GL' ? 'active' : ''}`}><Film size={16}/> GL SHOWTIME</button>
        <button onClick={() => setFilterDomain('BL')} className={`tab-btn bl ${filterDomain === 'BL' ? 'active' : ''}`}><Film size={16}/> BL SHOWTIME</button>
      </div>

      {/* ================= FEED LIST ================= */}
      <div className="feed-container">
        {posts.length === 0 && !isLoadingMore ? (
          <div className="empty-feed glass-morphism">ยังไม่มีโพสต์ในหมวดหมู่นี้ สร้างโพสต์แรกเลย!</div>
        ) : (
          posts.map((post) => {
            const isOwnPost = currentUser && post.user_id === currentUser.id;
            return (
              <div key={post.id} className="feed-item glass-morphism">
                <div className="feed-avatar">
                  {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="Avatar" /> : post.profiles?.username?.charAt(0).toUpperCase() || post.creator_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="feed-content-wrapper">
                  <div className="feed-meta">
                    <div className="meta-left">
                      <span className="feed-author">{post.profiles?.username || 'สมาชิก Showtime'}</span>
                      <span className={`domain-tag ${post.domain === 'BL' ? 'tag-bl' : 'tag-gl'}`}>{post.domain}</span>
                      <span className="feed-date">• {new Date(post.created_at).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {isAdmin && post.status === 'pending' && <span className="badge-pending">รอตรวจสอบ</span>}
                    </div>
                    
                    <div className="meta-right">
                      {isAdmin && (
                        <div className="admin-quick-actions">
                          {post.status === 'pending' && <button onClick={() => handleAdminAction(post.id, 'approve')} className="action-approve glass-btn">อนุมัติ</button>}
                          <button onClick={() => handleAdminAction(post.id, 'delete')} className="action-delete glass-btn"><Trash2 size={16}/></button>
                        </div>
                      )}
                      {isOwnPost && !isAdmin && <button onClick={() => handleDeleteOwnPost(post.id)} className="action-delete glass-btn" title="ลบโพสต์ของฉัน"><Trash2 size={16}/></button>}
                    </div>
                  </div>

                  <div className="feed-text">{post.content}</div>
                  
                  {post.image_url && (
                    <div className="feed-image-box">
                      <img src={post.image_url} alt="Post attachment" loading="lazy" />
                    </div>
                  )}

                  {(post.creator_name || post.creator_link) && (
                    <div className="feed-credit glass-panel-sub">
                      <span className="credit-label">เครดิต:</span> {post.creator_name || 'ไม่ระบุชื่อ'}
                      {post.creator_link && <a href={post.creator_link} target="_blank" rel="noopener noreferrer" className="credit-link"><LinkIcon size={12}/> ดูต้นฉบับ</a>}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* ================= LOAD MORE ================= */}
        {hasMore && posts.length > 0 && (
          <div className="load-more-container">
            <button onClick={handleLoadMore} disabled={isLoadingMore} className="btn-modern outline">
              {isLoadingMore ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;