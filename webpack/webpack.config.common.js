const { resolve } = require("path");
const webpack = require("webpack");

module.exports = () => {
  return {
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
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
            "image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false",
          ],
        },
        {
          test: /\.(woff|woff2|ttf|eot|otf|mp3)$/,
          loader: "url-loader",
        },
      ],
    },
    plugins: [new webpack.EnvironmentPlugin({})],
    performance: {
      hints: false,
    },
  };
};
