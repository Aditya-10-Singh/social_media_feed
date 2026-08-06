import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (['ECONNRESET', 'ECONNABORTED', 'ECONNREFUSED', 'EPIPE'].includes(err?.code)) {
              return;
            }
            console.error('API proxy error:', err);
          });
        }
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (['ECONNRESET', 'ECONNABORTED', 'ECONNREFUSED', 'EPIPE'].includes(err?.code)) {
              return;
            }
            console.error('WS proxy error:', err);
          });
        }
      }
    }
  }
});

