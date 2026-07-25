import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/SEDATION/',
  plugins: [react()],
  build: {
    outDir: '../../dist/SEDATION',
    emptyOutDir: true
  }
});
