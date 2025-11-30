/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'; // <--- IMPORTANTE

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'volt-dark': '#0a0a0f',
				'volt-primary': '#00f0ff',
				'volt-secondary': '#7000ff',
				'volt-accent': '#ff003c',
				'volt-glass': 'rgba(255, 255, 255, 0.05)',
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				display: ['Orbitron', 'sans-serif'],
			},
			boxShadow: {
				'neon': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
			},
            // PERSONALIZACIÓN DE LA LECTURA (Markdown)
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: theme('colors.slate.300'), // Texto general gris claro
                        a: {
                            color: theme('colors.volt-primary'), // Enlaces Cyan
                            '&:hover': {
                                color: '#fff',
                            },
                        },
                        h1: { color: '#fff', fontFamily: theme('fontFamily.display') },
                        h2: { color: '#fff', fontFamily: theme('fontFamily.display') },
                        h3: { color: '#fff', fontFamily: theme('fontFamily.display') },
                        strong: { color: '#fff' },
                        code: { color: theme('colors.volt-primary') },
                        blockquote: {
                            borderLeftColor: theme('colors.volt-primary'),
                            color: theme('colors.slate.400'),
                            backgroundColor: 'rgba(0, 240, 255, 0.05)',
                            padding: '1rem',
                        },
                    },
                },
            }),
		},
	},
	plugins: [
        typography, // <--- ACTIVAMOS EL PLUGIN
    ],
}