import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel/serverless'; // <--- IMPORTANTE

export default defineConfig({
  site: 'https://voltioacademy.lat',
  output: 'server', // <--- CAMBIO CLAVE: Modo Servidor
  adapter: vercel(), // <--- Conectamos con Vercel

  integrations: [
    tailwind(), 
    react(),
    sitemap(),
    partytown({
      config: { forward: ["dataLayer.push"] },
    }),
  ],
});