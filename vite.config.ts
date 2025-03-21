import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically update the service worker
      manifest: {
        name: 'Staffio',
        short_name: 'StaffioPWA',
        description: 'My React Progressive Web App for Staffio',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        start_url: '.', // This makes the app start from the root directory
        display: 'standalone', // Display mode (standalone)
        background_color: '#ffffff', // Background color for loading screen
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Alias for '@' pointing to the 'src' folder
    },
  },
  server: {
    host: '0.0.0.0',  // This binds the server to all IPs, including the local IP
    port: 5173,        // Ensure you're running on the desired port
  }
})
