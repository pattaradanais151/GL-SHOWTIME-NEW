import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { init } from '@aptabase/web';
import { Analytics } from "@vercel/analytics/react";

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LanguageProvider } from './contexts/LanguageContext';
import { supabase } from './utils/supabase';
import { useScheduleNotifier } from './hooks/useScheduleNotifier';

// ==========================================
// PWA Components (นำเข้า Component สำหรับแจ้งเตือน PWA)
// ==========================================
import OfflineFallback from './components/OfflineFallback';
import ReloadPrompt from './components/ReloadPrompt';

// ==========================================
// หน้าไว้อาลัย Overlay (วางทับเป็นฉากหน้าสุด)
// ==========================================
import MemorialPage from './components/MemorialPage';

// ==========================================
// เปลี่ยนการโหลดหน้าเว็บเป็นแบบ Lazy Loading
// ==========================================
const Home = lazy(() => import('./pages/Home'));
const HomeBL = lazy(() => import('./pages/HomeBL')); // 👉 สเต็ป 3: เพิ่มการดึงหน้าแรกของ BL เข้ามาตรงนี้
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Donate = lazy(() => import('./pages/Donate'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const License = lazy(() => import('./pages/License'));
const CommunityFeed = lazy(() => import('./pages/CommunityFeed'));
const CommunityAuth = lazy(() => import('./pages/CommunityAuth'));

// ปิด Aptabase ไว้ชั่วคราวเพื่อไม่ให้ขึ้น Error แจ้งเตือนสีแดง (จนกว่าจะมี Key จริง)
// init("A-TH-YOUR_APTABASE_KEY"); 

const ProtectedRoute = ({ children, session }) => {
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  useScheduleNotifier();

  const [session, setSession] = useState(localStorage.getItem('isAdmin') === 'true');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [communityUser, setCommunityUser] = useState(null);

  // ==========================================
  // ใช้ sessionStorage เพื่อจำว่าผู้ใช้เคยกดเข้าเว็บไซต์ไปแล้วหรือยัง
  // ==========================================
  const [hasEnteredSite, setHasEnteredSite] = useState(() => {
    return sessionStorage.getItem('hasEnteredMemorial') === 'true';
  });

  const handleEnterSite = () => {
    setHasEnteredSite(true);
    sessionStorage.setItem('hasEnteredMemorial', 'true');
  };

  // ตรวจสอบการล็อกอินของ User ในฝั่ง Community
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCommunityUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCommunityUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // จัดการ Theme (Dark / Light Mode)
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <HelmetProvider>
      {/* ==========================================
          แสดงหน้าไว้อาลัย (Overlay วางทับบนสุด)
          ========================================== */}
      {!hasEnteredSite && <MemorialPage onEnterSite={handleEnterSite} />}

      <LanguageProvider>
        <Router>
          <div className="app-wrapper">
            {/* โครงสร้าง SEO กลาง */}
            <Helmet>
              <meta name="theme-color" content={theme === 'dark' ? '#0f1015' : '#f0f2f5'} />
            </Helmet>

            {/* ========================================== */}
            {/* แสดง PWA UI (ทำงานอัตโนมัติ in ทุกหน้า) */}
            {/* ========================================== */}
            <OfflineFallback />
            <ReloadPrompt />

            <Navbar session={session} setSession={setSession} theme={theme} toggleTheme={toggleTheme} />
            
            <div className="main-content">
              <div className="container">
                {/* Suspense คือตัวรอโหลดระหว่างสลับหน้า */}
                <Suspense fallback={
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#ff2a7a', fontSize: '1.2rem', fontFamily: "'Prompt', sans-serif" }}>
                    กำลังโหลดข้อมูล...
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/bl" element={<HomeBL />} /> {/* 👉 สเต็ป 3: เพิ่มปุ่มเส้นทาง URL สำหรับหน้าแรกของ BL ตรงนี้ */}
                    <Route path="/community" element={<CommunityFeed currentUser={communityUser} isAdmin={session} />} />
                    <Route path="/community/auth" element={!communityUser ? <CommunityAuth /> : <Navigate to="/community" />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/donate" element={<Donate />} />
                    <Route path="/login" element={!session ? <Login setSession={setSession} /> : <Navigate to="/admin" />} />
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute session={session}>
                          <Admin />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/license" element={<License />} />
                  </Routes>
                </Suspense>
              </div>
            </div>
            
            <Footer />
            <Analytics /> {/* Vercel Analytics */}
          </div>
        </Router>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;