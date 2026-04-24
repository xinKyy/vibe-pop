import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 所有 /api/* 请求在 dev 阶段都走到本地 worker（wrangler dev，默认 8787）。
// AI 配置（AI_API_KEY / AI_BASE_URL / AI_MODEL）只在 worker/.dev.vars 维护一份，
// 不要再在 frontend 侧起一层代理，避免两边配置漂移。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
