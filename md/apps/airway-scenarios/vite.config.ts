import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig(({ mode }) => ({
  base: '/AIRWAY-SCENARIOS/',
  define: {
    __CLOSEDOSE_MD_BUILD_MODE__: JSON.stringify(mode)
  },
  plugins: [react(), tailwindcss()],
  build: { outDir: '../../dist/AIRWAY-SCENARIOS', emptyOutDir: true }
}));
