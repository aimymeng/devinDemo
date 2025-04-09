import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    cors: true,
    hmr: {
      clientPort: 443
    },
    allowedHosts: [
      'github-demo-app-tunnel-6tnnq4bx.devinapps.com',
      'github-demo-app-tunnel-919xe89p.devinapps.com',
      'github-demo-app-tunnel-*.devinapps.com'
    ]
  },
});
