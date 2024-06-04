import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve('src')
    }
  },
  server: {
    host: 'vcap.me',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://vcap.me:4000/',
        secure: false
      }
    }
  }
});
