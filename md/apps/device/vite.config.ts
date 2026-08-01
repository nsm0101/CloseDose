import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: '/DEVICE/',
  define: {
    __CLOSEDOSE_MD_BUILD_MODE__: JSON.stringify(mode)
  },
  plugins: [react()],
  build: {
    outDir: '../../dist/DEVICE',
    emptyOutDir: true
  }
}));
