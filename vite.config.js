import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const buildDate = new Date().toLocaleString('zh-CN', { 
  year: 'numeric', month: '2-digit', day: '2-digit', 
  hour: '2-digit', minute: '2-digit' 
}).replace(/\//g, '-');

export default defineConfig({
  define: {
    '__APP_VERSION__': JSON.stringify(`v${buildDate}`)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'], // 确保包含你的svg文件
      manifest: {
        name: 'Mnemo 记忆复利',
        short_name: 'Mnemo',
        description: '基于艾宾浩斯遗忘曲线的高效复习工具',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon.svg', // 直接使用 SVG
            sizes: 'any',    // 关键：告诉浏览器这是矢量图，任意尺寸
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
