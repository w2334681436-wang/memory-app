import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// 1. 自动生成版本号 (例如: v2023-10-27 14:30)
const buildDate = new Date().toLocaleString('zh-CN', { 
  year: 'numeric', month: '2-digit', day: '2-digit', 
  hour: '2-digit', minute: '2-digit' 
}).replace(/\//g, '-');

export default defineConfig({
  // 2. 将版本号注入到全局变量
  define: {
    '__APP_VERSION__': JSON.stringify(`v${buildDate}`)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // 检测到新代码立即更新
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Mnemo 记忆复利',
        short_name: 'Mnemo',
        description: '基于艾宾浩斯遗忘曲线的高效复习工具',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // 核心：让它像原生APP一样全屏运行
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png', // 稍后我们会准备这个图片
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // 稍后我们会准备这个图片
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
