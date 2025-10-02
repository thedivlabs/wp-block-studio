module.exports = {
    content: [
        './app/dev/*.{js,jsx,ts,tsx,css,scss,php,html}',
        './app/dev/**/*.{js,jsx,ts,tsx,css,scss,php,html}',
        './app/public/wp-content/plugins/wp-block-studio/*.{php,html}',
        './app/public/wp-content/plugins/wp-block-studio/core/**/*.{js,jsx,ts,tsx,css,scss,php,html}',
    ],
    safelist: ['col-span-1'],
    theme: {
        extend: {
            animation: {
                wiggle: 'wiggle .2s ease-in-out 2',
                marquee: 'marquee 25s linear infinite',
            },
            keyframes: {
                wiggle: {
                    '25%': {transform: 'translate(-2px,0)'},
                    '50%': {transform: 'translate(0,0)'},
                    '75%': {transform: 'translate(2px,0)'},
                    '100%': {transform: 'translate(0,0)'},
                },
                marquee: {
                    from: {transform: 'translateX(0)'},
                    to: {transform: 'translateX(-100%)'},
                }
            },
        },
    },
    plugins: [],
};