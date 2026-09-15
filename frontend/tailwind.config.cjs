// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            // ============================================
            // EXISTING CLIENT COLORS (KEEP AS-IS)
            // ============================================
            colors: {
                "gray-20": "#F8F4EB",
                "gray-50": "#EFE6E6",
                "gray-100": "#DFCCCC",
                "gray-500": "#5E0000",
                "primary-100": "#FFE1E0",
                "primary-300": "#FFA6A3",
                "primary-500": "#FF6B66",
                "secondary-400": "#FFCD5B",
                "secondary-500": "#FFC132",
                "secondary-600": "#559B2F",
                "secondary-700": "#173008",

                // ============================================
                // ADMIN PANEL COLORS (Namespaced)
                // ============================================
                admin: {
                    // Primary - KaJob Green for admin
                    primary: {
                        50: '#ecfdf5',
                        100: '#d1fae5',
                        200: '#a7f3d0',
                        300: '#6ee7b7',
                        400: '#34d399',
                        500: '#0A9F6E',
                        600: '#059669',
                        700: '#047857',
                        800: '#065f46',
                        900: '#064e3b',
                        DEFAULT: '#0A9F6E',
                    },
                    
                    // Text
                    text: {
                        primary: '#10243E',     // Deep navy
                        secondary: '#60738D',   // Blue gray
                        muted: '#8A9AAF',       // Muted
                    },
                    
                    // Backgrounds
                    bg: {
                        page: '#F7F9FB',
                        card: '#FFFFFF',
                        hover: '#F9FAFB',
                        active: '#F3F4F6',
                    },
                    
                    // Borders
                    border: {
                        light: '#E1E7EF',
                        default: '#D1D9E6',
                        dark: '#B8C4D4',
                    },
                    
                    // Status colors
                    success: '#0A9F6E',
                    warning: '#F59E0B',
                    danger: '#EF4444',
                    info: '#3B82F6',
                    neutral: '#6B7280',
                },
            },

            // ============================================
            // EXISTING BACKGROUNDS (KEEP AS-IS)
            // ============================================
            backgroundImage: (theme) => ({
                "gradient-yellowred":
                    "linear-gradient(90deg, #FF616A 0%, #FFC837 100%)",
                "mobile-home": "url('./assets/HomePageGraphic.png')",
            }),

            // ============================================
            // EXISTING FONTS (KEEP AS-IS)
            // ============================================
            fontFamily: {
                dmsans: ["DM Sans", "sans-serif"],
                montserrat: ["Montserrat", "sans-serif"],
                // Admin font
                admin: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },

            // ============================================
            // EXISTING CONTENT (KEEP AS-IS)
            // ============================================
            content: {
                evolvetext: "url('./assets/EvolveText.png')",
                abstractwaves: "url('./assets/AbstractWaves.png')",
                sparkles: "url('./assets/Sparkles.png')",
                circles: "url('./assets/Circles.png')",
            },

            // ============================================
            // ADMIN-SPECIFIC UTILITIES
            // ============================================
            fontSize: {
                'admin-page-title': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }],
                'admin-section-title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
                'admin-card-title': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
            },

            boxShadow: {
                'admin-card': '0 1px 3px 0 rgb(0 0 0 / 0.04)',
                'admin-card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.06)',
                'admin-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },

            borderRadius: {
                'admin-button': '0.5rem',
                'admin-card': '0.75rem',
                'admin-modal': '1rem',
            },
        },
        screens: {
            xs: "480px",
            sm: "768px",
            md: "1060px",
            // Admin responsive breakpoints
            'admin-sm': '640px',
            'admin-md': '768px',
            'admin-lg': '1024px',
            'admin-xl': '1280px',
            'admin-2xl': '1536px',
        },
    },
    plugins: [],
};
