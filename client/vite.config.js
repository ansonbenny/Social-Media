import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  return defineConfig({
    plugins: [
      react(),
      VitePWA({
        devOptions: {
          enabled: true
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
          target: `${env.BACK_END}/api`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/files": {
          target: `${env.BACK_END}/files`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/files/, ""),
        },
        "/socket.io": {
          target: `ws://${env?.BACK_END.substring(env?.BACK_END.indexOf("://") + 3, env?.BACK_END?.length)}`,
          ws: true,
        },
      },
    },
  });
}
