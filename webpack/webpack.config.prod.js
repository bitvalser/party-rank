const path = require('path');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const version = require('../package.json').version;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPluginWebpackPlugin = require('copy-webpack-plugin');

const makeWebpackCommonConfig = require('./webpack.config.common');

const buildDir = path.join(process.cwd(), 'build');

module.exports = () => {
  const webpackCommonConfig = makeWebpackCommonConfig({
    isProd: true,
  });

  return merge(webpackCommonConfig, {
    mode: 'production',
    entry: path.join(process.cwd(), 'src/index.tsx'),
    output: {
      filename: `[hash]_${version}.js`,
      path: buildDir,
      globalObject: 'this',
      umdNamedDefine: true,
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: '../public/index.html',
        templateParameters: {
          baseUrl: process.env.BASE_URL,
        },
      }),
      new CopyPluginWebpackPlugin({
        patterns: [{ from: '../public', filter: (resourcePath) => !resourcePath.includes('index.html') }],
      }),
    ],
  });
};
