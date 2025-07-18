/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    // Disable only unused core plugins for bundle size reduction  
    corePlugins: {
        backdropBrightness: false,
        backdropContrast: false,
        backdropGrayscale: false,
        backdropHueRotate: false,
        backdropInvert: false,
        backdropSaturate: false,
        backdropSepia: false,
        backgroundAttachment: false,
        backgroundClip: false,
        backgroundOrigin: false,
        borderCollapse: false,
        borderSpacing: false,
        boxDecorationBreak: false,
        caretColor: false,
        clear: false,
        columns: false,
        counterIncrement: false,
        counterReset: false,
        counterSet: false,
        fill: false,
        float: false,
        fontVariantNumeric: false,
        isolation: false,
        listStylePosition: false,
        listStyleType: false,
        mixBlendMode: false,
        objectFit: false,
        objectPosition: false,
        resize: false,
        scrollBehavior: false,
        scrollMargin: false,
        scrollPadding: false,
        scrollSnapAlign: false,
        scrollSnapStop: false,
        scrollSnapType: false,
        stroke: false,
        strokeWidth: false,
        tableLayout: false,
        textDecorationColor: false,
        textDecorationStyle: false,
        textDecorationThickness: false,
        textUnderlineOffset: false,
        touchAction: false,
        willChange: false,
    },
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    DEFAULT: '#3b82f6',
                },
                secondary: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    DEFAULT: '#64748b',
                },
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                    DEFAULT: '#22c55e',
                },
                warning: {
                    50: '#fefce8',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                    DEFAULT: '#f59e0b',
                },
                error: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                    DEFAULT: '#ef4444',
                },
                // Design system CSS variables
                accent: 'var(--color-accent)',
                background: 'var(--color-background)',
                surface: 'var(--color-surface)',
                text: 'var(--color-text)',
                border: 'var(--color-border)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            spacing: {
                'xs': 'var(--spacing-xs)',
                'sm': 'var(--spacing-sm)',
                'md': 'var(--spacing-md)',
                'lg': 'var(--spacing-lg)',
                'xl': 'var(--spacing-xl)',
            },
            boxShadow: {
                'glass': 'var(--shadow-glass)',
            },
            transitionDuration: {
                'fast': 'var(--transition-fast)',
                'normal': 'var(--transition-normal)',
            },
            animation: {
                'fade': 'fadeIn 0.3s ease-out',
                'spin-slow': 'spin 2s linear infinite',
                'spin-fast': 'spin 0.5s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            },
        },
    },
    plugins: [],
};
