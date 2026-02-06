
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase-core': ['firebase/app', 'firebase/firestore'],
          'react-core': ['react', 'react-dom'],
          'ui-components': ['lucide-react', 'recharts']
        },
      },
    },
  },
  server: {
    historyApiFallback: true,
  }
});
