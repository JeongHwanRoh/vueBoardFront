import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  builder: 'vite',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  // nitor.devProxy ->  Vite devServer proxy 방식으로 변경(3.9 이상 version에서)
  // 실제 version: 4.1.3 ㅜ
  vite: {
    server: {
      cors: false, // nuxt dev 서버가 CORS 헤더 추가하지 않도록 설정
      proxy: {
        '/api': {
          target: 'http://localhost:8092',  // 백엔드 주소
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws-chat':{
  
          target: 'http://localhost:8092',
          changeOrigin: true,
          secure: false, // HTTP 환경에서 SSL 검사 비활성화
          ws: true, // websocket proxy 활성화
          rewrite: (path) => path,
        }
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./', import.meta.url)),
        '~': fileURLToPath(new URL('./', import.meta.url)),
      },
    },
  
  },
  routeRules: {
    '/ws-chat/**': { ssr: false, prerender: false },
  },
})
