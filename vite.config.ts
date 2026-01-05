import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Ensure paths work correctly on GitHub Pages (if deployed to a subdirectory)
  base: './',
  define: {
    // Polyfill process.env for the geminiService
    'process.env': process.env
  }
});