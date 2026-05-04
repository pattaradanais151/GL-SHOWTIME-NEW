import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import License from './pages/License';

const ProtectedRoute = ({ children, session }) => {
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [session, setSession] = useState(localStorage.getItem('isAdmin') === 'true');
  
  // ระบบ Theme
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    // นำคลาส light-mode ไปแปะที่ body ถ้ายูสเซอร์เลือก Light Mode
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    // บันทึกการตั้งค่าลงเครื่อง
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ฟังก์ชันสลับ Theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <div className="app-wrapper">
        {/* ส่ง props theme และ toggleTheme ไปให้ Navbar */}
        <Navbar session={session} setSession={setSession} theme={theme} toggleTheme={toggleTheme} />
        
        <div className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
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
  );
}

export default App;