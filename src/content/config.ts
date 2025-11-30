// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Definimos el esquema (Schema) de validación
const blogCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.date(),
		author: z.string().default('Admin'),
		image: z.string(), // URL de la imagen destacada
		category: z.string(),
		tags: z.array(z.string()).optional(),
        isFeatured: z.boolean().default(false),
	}),
});

// Exportamos la colección para que Astro la reconozca
export const collections = {
	'blog': blogCollection,
};