import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      devOptions: {
        enabled: false
      },
      manifest: {
        "theme_color": "#fff",
        "background_color": "#fff",
        "display": "fullscreen",
        "scope": "/",
        "start_url": "/",
        "name": "Soft Chat",
        "short_name": "Soft Chat",
        "icons": [
          {
            "src": "/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-256x256.png",
            "sizes": "256x256",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-384x384.png",
            "sizes": "384x384",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ]
      }
    })],
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
