import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/files": {
        target: "http://localhost:5000/files",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/files/, ""),
      },
      "/socket.io": {
        target: "ws://localhost:5000",
        ws: true,
      },
    },
  },
});
