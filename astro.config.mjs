import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown'; // <--- Esto se añadió solo

export default defineConfig({
  site: 'https://voltioacademy.lat', 
  
  integrations: [
    tailwind(), 
    react(),
    sitemap(),
    
    // CONFIGURACIÓN ESPECIAL PARA GOOGLE ANALYTICS
    partytown({
      config: {
        forward: ["dataLayer.push"], // Esto permite enviar datos a GA
      },
    }),
  ],
});