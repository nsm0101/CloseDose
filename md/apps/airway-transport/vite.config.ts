import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig({ base: '/AIRWAY-TRANSPORT/', plugins: [react(), tailwindcss()], build: { outDir: '../../dist/AIRWAY-TRANSPORT', emptyOutDir: true } });
