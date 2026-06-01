import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // ให้ Service Worker อัปเดตตัวเองอัตโนมัติเมื่อมีเวอร์ชันใหม่
      registerType: 'autoUpdate',
      
      // ไฟล์ที่จะถูก Cache ไว้ล่วงหน้า
      includeAssets: ['favicon.svg', 'icons.svg', 'robots.txt'], 
      
      // การตั้งค่า Web App Manifest
      manifest: {
        name: 'Girl Love TH',
        short_name: 'GL TH',
        description: 'Girl Love TH Application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // ให้แสดงผลแบบแอปเต็มจอ ไม่มีแถบ URL
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})