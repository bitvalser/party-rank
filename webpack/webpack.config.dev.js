const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPluginWebpackPlugin = require('copy-webpack-plugin');
const makeWebpackCommonConfig = require('./webpack.config.common');

module.exports = () => {
  const webpackCommonConfig = makeWebpackCommonConfig({
    isProd: false,
  });

  return merge(webpackCommonConfig, {
    mode: 'development',
    entry: [
      'react-hot-loader/patch', // activate HMR for React
      'webpack-dev-server/client?http://0.0.0.0:3001', // bundle the client for webpack-dev-server and connect to the provided endpoint
      'webpack/hot/only-dev-server', // bundle the client for hot reloading, only means to only hot reload for successful updates
      path.join(process.cwd(), 'src/index.tsx'), // the entry point of our app
    ],
    devServer: {
      hot: true, // enable HMR on the server
      historyApiFallback: true,
    },
    devtool: 'cheap-module-source-map',
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
      new webpack.HotModuleReplacementPlugin(), // enable HMR globally
    ],
  });
};
