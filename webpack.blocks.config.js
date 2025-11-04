// webpack.blocks.config.js
const path = require('path');
const wordpressConfig = require('@wordpress/scripts/config/webpack.config');

function extendBlocksConfig(config) {
    return {
        ...config,
        cache: {
            ...(config?.cache ?? {}),
            type: 'filesystem',
            buildDependencies: {
                config: [__filename], // invalidate cache when config changes
            },
        },
        mode: 'production',
        watchOptions: {
            ignored: '/node_modules/',
        },
        entry: {
            ...config.entry(),
            // Only build block JS from your Gutenberg blocks folder
            index: './app/dev/blocks/index.js',
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'app/public/wp-content/plugins/wp-block-studio/build'),
        },
        resolve: {
            alias: {
                ...wordpressConfig.resolve?.alias,
                Includes: path.resolve(__dirname, 'app/dev/js/inc/'),
                Dev: path.resolve(__dirname, 'app/dev/js'),
                Style: path.resolve(__dirname, 'app/dev/scss'),
                Components: path.resolve(__dirname, 'app/dev/js/components'),
                Modules: path.resolve(__dirname, 'app/dev/js/modules'),
            },
        },
    };
}

module.exports = extendBlocksConfig(wordpressConfig);
