const path = require('path');

module.exports = function override(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['react-dom/server'] = path.resolve(
        __dirname, 'node_modules/react-dom/server'
    );
    return config;
};
