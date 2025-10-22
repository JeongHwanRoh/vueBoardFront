import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  builder: 'vite',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  // nitor.devProxy ->  Vite devServer proxy 방식으로 변경(3.9 이상 version에서)
  // 실제 version: 4.1.3 ㅜ
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8092',  // 백엔드 주소
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./', import.meta.url)),
        '~': fileURLToPath(new URL('./', import.meta.url)),
      },
    },
  },
})
