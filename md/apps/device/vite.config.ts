import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/DEVICE/',
  plugins: [react()],
  build: {
    outDir: '../../dist/DEVICE',
    emptyOutDir: true
  }
});
