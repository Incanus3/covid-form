const path = require('path');

module.exports = function override(config, env) {
  config.resolve.alias = {
    'src': path.resolve('src'),
  }

  return config;
}
