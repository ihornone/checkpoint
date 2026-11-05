import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/paymock-api': {
          target: 'https://paymock.ihornone.site',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/paymock-api/, ''),
          headers: {
            'X-Token': process.env.PAYMOCK_TOKEN || '',
          },
        },
      },
    },
  },
});
