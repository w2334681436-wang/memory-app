import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // 核心：一旦检测到新版本，自动更新
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '记忆复利 - 复习计划',
        short_name: '记忆复利',
        description: '基于艾宾浩斯遗忘曲线的高效复习管理工具',
        theme_color: '#4f46e5', // Indigo-600
        background_color: '#f9fafb',
        display: 'standalone', // 核心：去除浏览器地址栏，全屏运行
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
