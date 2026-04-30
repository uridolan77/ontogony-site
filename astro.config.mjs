import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ontogony.net',
  integrations: [mdx(), react(), sitemap()],
  vite: {
    optimizeDeps: {
      include: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'],
    },
    plugins: [tailwindcss()],
  },
});
