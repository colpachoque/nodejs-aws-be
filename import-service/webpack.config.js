const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  target: 'node',
  plugins: [
    new webpack.IgnorePlugin({resourceRegExp: /^pg-native$/}),
  ]
};
