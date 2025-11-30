// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap'; // <--- Se añadió esto

// https://astro.build/config
export default defineConfig({
  // IMPORTANTE: Aquí define tu dominio futuro. 
  // Esto asegura que Google sepa que "voltioacademy.lat" es el dueño del contenido.
  site: 'https://voltioacademy.lat', 
  
  integrations: [
    tailwind(), 
    react(),
    sitemap() // <--- Y esto
  ],
});