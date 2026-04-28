import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ontogony.example',
  integrations: [mdx(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
