import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Taskflow',
        short_name: 'Taskflow',
        description: 'Eliminez le chaos, suivez le flux',
        theme_color: '#0f0f0f',
        background_color: '#0f0f0f',
        display: 'standalone',
        start_url: '/tasks',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Met en cache les assets statiques
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Stratégie Network First pour l'API (tente le réseau, fallback cache)
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/localhost:8000\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'taskflow-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }, // 24h
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
});
