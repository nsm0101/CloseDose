import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/PMD/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../../dist/PMD',
    emptyOutDir: true
  }
});
