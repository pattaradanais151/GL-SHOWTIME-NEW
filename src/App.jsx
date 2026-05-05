import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { init } from '@aptabase/web';

import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Schedule from './pages/Schedule';
import Donate from './pages/Donate';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import License from './pages/License';
import { LanguageProvider } from './contexts/LanguageContext';

init("A-TH-YOUR_APTABASE_KEY");

const ProtectedRoute = ({ children, session }) => {
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [session, setSession] = useState(localStorage.getItem('isAdmin') === 'true');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

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
      <LanguageProvider>
        <Router>
          <div className="app-wrapper">
            <Helmet>
              <meta name="theme-color" content={theme === 'dark' ? '#0f1015' : '#f0f2f5'} />
              <meta name="description" content="GL SHOWTIME - Your destination for Girl Love series" />
            </Helmet>

            <Navbar session={session} setSession={setSession} theme={theme} toggleTheme={toggleTheme} />
            
            <div className="main-content">
              <div className="container">
                <Routes>
                  <Route path="/" element={<Home />} />
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
              </div>
            </div>
            <Footer />
          </div>
        </Router>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;