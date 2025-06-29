const wordpressConfig = require('@wordpress/scripts/config/webpack.config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

function extendSharedConfig(config) {
    return {
        ...config,
        // Add shared config extensions here...


        module: {
            rules: [
                // Remove existing SCSS rules from defaultConfig
                ...config.module.rules.filter(rule => !String(rule.test).includes('.scss')),

                // SCSS loader with includePaths to fix your '@use "includes"' import
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                sassOptions: {
                                    loadPaths: [
                                        path.resolve(__dirname, 'app/dev/scss')
                                    ],
                                },
                            },
                        },
                    ],
                },
            ],
        },
    };
}

function extendScriptConfig(config) {
    return {
        ...config,
        // Add non-module config extensions here...
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