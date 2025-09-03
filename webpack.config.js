const wordpressConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

// Remove SCSS rule (only from non-block JS like theme/admin)
function extendSharedConfig(config) {
    return {
        ...config,
        module: {
            ...config.module,
            rules: config.module.rules.filter(
                (rule) => !(rule.test && rule.test.toString() === '/\\.scss$/')
            ),
        },
    };
}

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
            path: path.resolve(__dirname, 'build'),
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

        // Remove SCSS only from theme/admin config
        const extendedScriptConfig = extendSharedConfig(extendScriptConfig(scriptConfig));

        // Keep block config untouched
        return [extendedScriptConfig, moduleConfig];
    } else {
        // Single config — remove SCSS and add theme/admin if this is only used for that
        return extendSharedConfig(extendScriptConfig(wordpressConfig));
    }
})();
