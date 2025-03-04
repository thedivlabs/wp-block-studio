const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');


module.exports = {
    ...defaultConfig,
    mode: 'production',
    resolve: {
        alias: {
            Dev: path.resolve(__dirname, 'app/dev/js'),
            Style: path.resolve(__dirname, 'app/dev/scss'),
            Components: path.resolve(__dirname, 'app/dev/js/components'),
            Inc: path.resolve(__dirname, 'app/dev/js/inc'),
        }
    }
};