const wordpressConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

function extendSharedConfig(config) {
    return {
        ...config,
        // Add shared config extensions here...
    };
}

function extendScriptConfig(config) {
    return {
        ...config,
        // Add non-module config extensions here...
        resolve: {
            alias: {
                Dev: path.resolve(__dirname, 'app/dev/js'),
                Style: path.resolve(__dirname, 'app/dev/scss'),
                Components: path.resolve(__dirname, 'app/dev/js/components'),
                Modules: path.resolve(__dirname, 'app/dev/js/modules'),
                Inc: path.resolve(__dirname, 'app/dev/js/inc'),
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