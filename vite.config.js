import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // ให้ Service Worker อัปเดตตัวเองอัตโนมัติเมื่อมีเวอร์ชันใหม่
      registerType: 'autoUpdate',
      
      // ไฟล์ที่จะถูก Cache ไว้ล่วงหน้า
      includeAssets: ['favicon.svg', 'icons.svg', 'robots.txt'], 
      
      // เพิ่ม Workbox config เพื่อแก้ปัญหา glob patterns error ตอน Build
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      
      // การตั้งค่า Web App Manifest
      manifest: {
        name: 'Showtime TH',
        short_name: 'Showtime',
        description: 'GL and BL Showtime Application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
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