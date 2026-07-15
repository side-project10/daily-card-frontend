import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 로컬 개발 프록시: 프론트(:5173)에서 `/api/*` 요청을 백엔드(:3000)로 전달한다.
  // 프로덕션의 Vercel rewrite와 동일한 규약(`/api` 접두사를 떼고 백엔드로 전달)을
  // 맞춰, 클라이언트는 dev·prod 모두 same-origin `/api/...`로만 호출한다.
  // (same-origin이라 anon_id 쿠키가 퍼스트파티로 정상 전송/저장됨)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
