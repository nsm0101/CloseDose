import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig({ base: '/RSI-TIMELINE/', plugins: [react(), tailwindcss()], build: { outDir: '../../dist/RSI-TIMELINE', emptyOutDir: true } });
