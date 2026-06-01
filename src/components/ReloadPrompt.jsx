import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const ReloadPrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    }
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null;

  return (
    <div style={styles.container}>
      <div style={styles.toast}>
        <div style={styles.message}>
          {offlineReady
            ? <span>แอปพร้อมใช้งานแบบออฟไลน์แล้ว!</span>
            : <span>มีอัปเดตเวอร์ชันใหม่! กดรีเฟรชเพื่อดูข้อมูลล่าสุด</span>}
        </div>
        <div style={styles.buttonGroup}>
          {needRefresh && (
            <button style={styles.buttonReload} onClick={() => updateServiceWorker(true)}>
              รีเฟรช
            </button>
          )}
          <button style={styles.buttonClose} onClick={() => close()}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    right: '0',
    bottom: '0',
    margin: '16px',
    zIndex: '10000',
  },
  toast: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '300px'
  },
  message: {
    color: '#333',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  },
  buttonReload: {
    backgroundColor: '#ec4899', // สีชมพู GL
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  buttonClose: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer'
  }
}

export default ReloadPrompt;