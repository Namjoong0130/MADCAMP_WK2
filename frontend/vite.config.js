import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 프론트엔드에서 '/api'로 시작하는 요청을 보내면
      "/api": {
        // 백엔드 서버(80번 포트)로 전달해줍니다.
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
