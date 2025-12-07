import { defineCollection, z } from 'astro:content';

// Definimos el esquema (Schema) de validación
const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        // USA COERCE PARA EVITAR ERRORES DE TEXTO VS FECHA
        pubDate: z.coerce.date(), 
        author: z.string().default('Admin'),
        image: z.string(), 
        category: z.string(),
        tags: z.array(z.string()).optional(),
        isFeatured: z.boolean().default(false),
    }),
});

// Exportamos la colección
export const collections = {
    'blog': blogCollection,
};