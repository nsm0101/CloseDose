import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig({ base: '/POST-INTUBATION/', plugins: [react(), tailwindcss()], build: { outDir: '../../dist/POST-INTUBATION', emptyOutDir: true } });
