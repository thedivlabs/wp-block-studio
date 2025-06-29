const wordpressConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

function extendSharedConfig(config) {
    return {
        ...config,
        mode: 'production',
        module: {
            rules: [

                ...config.module.rules.filter(rule => !String(rule.test).includes('.scss')),
            ],
        }
    };
}

function extendScriptConfig(config) {
    return {
        ...config,
        // Add non-module config extensions here...
        entry: {
            ...config.entry(),
            theme: './app/dev/js/theme.js',
            admin: './app/dev/js/theme.js',
        },
        output: {
            filename: '[name].js', // This will output theme.js, admin.js, etc.
            path: path.resolve(__dirname, 'build'), // Specify your desired output directory
        },
        resolve: {
            ...wordpressConfig.resolve,
            alias: {
                Includes: path.resolve(__dirname, 'app/dev/js/inc/'),
                Dev: path.resolve(__dirname, 'app/dev/js'),
                Style: path.resolve(__dirname, 'app/dev/scss'),
                Components: path.resolve(__dirname, 'app/dev/js/components'),
                Modules: path.resolve(__dirname, 'app/dev/js/modules'),
            }
        }
    };
}

module.exports = (() => {
    if (Array.isArray(wordpressConfig)) {
        const [scriptConfig, moduleConfig] = wordpressConfig;

        const extendedScriptConfig = extendSharedConfig(extendScriptConfig(scriptConfig));
        const extendedModuleConfig = extendSharedConfig(moduleConfig);

        return [extendedScriptConfig, extendedModuleConfig];
    } else {
        return extendSharedConfig(extendScriptConfig(wordpressConfig));
    }
})();