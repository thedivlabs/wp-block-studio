module.exports = {
    content: [
        './**/*.{js,scss,php}',
    ],
    theme: {
        extend: {
            minHeight: {
                'section-xs': 'min(18rem, 18svh)',
                'section-sm': 'min(24rem, 25svh)',
                'section-md': 'min(32rem, 45svh)',
                'section-lg': 'min(48rem, 65svh)',
                'section-full': '100svh',
            }
        },
    }
}

