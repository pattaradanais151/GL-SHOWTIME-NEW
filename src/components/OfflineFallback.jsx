import React, { useState, useEffect } from 'react';

const OfflineFallback = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={styles.banner}>
      ⚠️ ดูเหมือนตอนนี้คุณจะไม่ได้เชื่อมต่ออินเทอร์เน็ตนะ แต่ยังสามารถดูเนื้อหาที่โหลดไว้แล้วได้!
    </div>
  );
};

const styles = {
  banner: {
    backgroundColor: '#ff4d4f',
    color: '#fff',
    textAlign: 'center',
    padding: '10px',
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    zIndex: '9999',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  }
};

export default OfflineFallback;