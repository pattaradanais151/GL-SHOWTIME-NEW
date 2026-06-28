import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import * as Sentry from "@sentry/react"; // 1. Import Sentry

// 2. Initialize Sentry (เอา DSN ของคุณจากหน้า Sentry Dashboard มาใส่)
Sentry.init({
  dsn: "https://b58aa96fd02a9eefa5c0635e2c884d9b@o4511642276724736.ingest.us.sentry.io/4511642278887424",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // ปรับเป็น 1.0 เพื่อเก็บ Error ทุกครั้ง (หากใช้งานจริงและคนเยอะมาก อาจปรับลดเหลือ 0.1)
  tracesSampleRate: 1.0, 
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0, 
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)