const { resolve } = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv");

dotenv.config()

module.exports = () => {
  return {
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      alias: {
        '@core': resolve(__dirname, '../src/core/'),
        '@assets': resolve(__dirname, '../src/assets/'),
        '@pages': resolve(__dirname, '../src/pages/'),
      },
    },
    context: resolve(__dirname, "../src"),
    module: {
      rules: [
        {
          test: [/\.jsx?$/, /\.tsx?$/],
          use: ["ts-loader"],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
          exclude: /node_modules/,
        },
        {
          test: /\.(scss|sass)$/,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.(jpe?g|png|svg|gif)$/i,
          use: [
            "file-loader?hash=sha512&digest=hex&name=img/[contenthash].[ext]",
          ],
        },
        {
          test: /\.(woff|woff2|ttf|eot|otf|mp3)$/,
          loader: "url-loader",
        },
      ],
    },
    plugins: [new webpack.DefinePlugin({
      'process.env.DISCORD_REDIRECT_URL': JSON.stringify(process.env.DISCORD_REDIRECT_URL),
      'process.env.SERVER_BASE_URL': JSON.stringify(process.env.SERVER_BASE_URL)
    })],
    performance: {
      hints: false,
    },
  };
};
