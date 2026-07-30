import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Analytics } from "@vercel/analytics/react";

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotFound from './pages/NotFound';
import { LanguageProvider } from './contexts/LanguageContext';
import { supabase } from './utils/supabase';
import { useScheduleNotifier } from './hooks/useScheduleNotifier';

import OfflineFallback from './components/OfflineFallback';
import ReloadPrompt from './components/ReloadPrompt';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const HomeBL = lazy(() => import('./pages/HomeBL'));
const Login = lazy(() => import('./pages/Login'));
const GuestLogin = lazy(() => import('./pages/GuestLogin'));
const GuestDashboard = lazy(() => import('./pages/GuestDashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Donate = lazy(() => import('./pages/Donate'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const License = lazy(() => import('./pages/License'));
const CommunityFeed = lazy(() => import('./pages/CommunityFeed'));

const ProtectedAdminRoute = ({ children, session }) => {
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  useScheduleNotifier();

  // State สำหรับแยกระบบ Authentication
  const [adminSession, setAdminSession] = useState(false);
  const [guestUser, setGuestUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    // 1. ตรวจสอบสถานะ Admin (Supabase Auth)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminSession(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminSession(!!session);
    });

    // 2. ตรวจสอบสถานะ Guest (LocalStorage จากตาราง guestlogin)
    const storedGuest = localStorage.getItem('guestUser');
    if (storedGuest) {
      try {
        setGuestUser(JSON.parse(storedGuest));
      } catch (error) {
        console.error("Failed to parse guest user");
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  // จัดการ Theme Light / Dark (ตามมาตรฐาน Tailwind)
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (theme === 'light') {
      htmlElement.classList.remove('dark');
    } else {
      htmlElement.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <HelmetProvider>
      <LanguageProvider>
        <Router>
          {/* อัปเดตคลาสพื้นหลังตรงนี้ให้รองรับ Light/Dark Mode */}
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0f1015] text-gray-900 dark:text-white transition-colors duration-300 font-prompt">
            <Helmet>
              <meta name="theme-color" content={theme === 'dark' ? '#0f1015' : '#f9fafb'} />
            </Helmet>

            <OfflineFallback />
            <ReloadPrompt />

            <Navbar 
              adminSession={adminSession} 
              guestUser={guestUser} 
              theme={theme} 
              toggleTheme={toggleTheme} 
            />
            
            <div className="flex-1 w-full">
              <Suspense fallback={
                <div className="flex justify-center items-center h-[50vh] text-pink-500 text-lg font-bold">
                  กำลังโหลดข้อมูล...
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home currentUser={guestUser} />} />
                  <Route path="/bl" element={<HomeBL currentUser={guestUser} />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/donate" element={<Donate />} />
                  <Route path="/community" element={<CommunityFeed currentUser={guestUser} isAdmin={adminSession} />} />
                  
                  {/* ระบบของ Guest */}
                  <Route path="/auth" element={!guestUser ? <GuestLogin /> : <Navigate to="/" />} />
                  <Route path="/guest" element={guestUser ? <GuestDashboard /> : <Navigate to="/auth" />} />
                  
                  {/* ระบบของ Admin */}
                  <Route path="/login" element={!adminSession ? <Login setSession={setAdminSession} /> : <Navigate to="/admin" />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedAdminRoute session={adminSession}>
                        <Admin />
                      </ProtectedAdminRoute>
                    } 
                  />

                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/license" element={<License />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
            
            <Footer />
            <Analytics />
          </div>
        </Router>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;