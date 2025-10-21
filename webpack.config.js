const wordpressConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

function extendScriptConfig(config) {
    return {
        ...config,
        mode: 'production',
        watchOptions: {
            ignored: '/node_modules/',
        },
        entry: {
            ...config.entry(),
            theme: './app/dev/js/theme.js',
            admin: './app/dev/js/admin.js',
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

module.exports = (() => {
    if (Array.isArray(wordpressConfig)) {
        const [scriptConfig, moduleConfig] = wordpressConfig;
        return [extendScriptConfig(scriptConfig), moduleConfig];
    } else {
        return extendScriptConfig(wordpressConfig);
    }
})();
