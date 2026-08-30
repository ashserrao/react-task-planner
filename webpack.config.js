const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  const isDevelopment = argv?.mode === "development"; // Fix: Ensure `argv` is defined

  return {
    entry: "./src/index.js", // Entry point for your app
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.[contenthash].js",
      publicPath: process.env.PUBLIC_URL || "./", // Ensure proper asset loading in production
    },
    resolve: {
      extensions: [".js", ".jsx", ".css"], // Resolve .js and .jsx files
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/, // Match .js and .jsx files
          exclude: /node_modules/,
          use: {
            loader: "babel-loader", // Transpile ES6+ and JSX
          },
        },
        {
          test: /\.css$/,
          use: [
            isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader", // Ensure Tailwind and other PostCSS plugins work
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i, // Match image files
          type: "asset",
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(), // Clean the dist folder before each build
      new HtmlWebpackPlugin({
        template: "./public/index.html", // Use your HTML template
      }),
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css", // Extract CSS into separate files
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "public/assets", to: "assets" }, // Copy assets to dist/assets
          { from: "public/assets/manifest.json", to: "assets/manifest.json" }, // Ensure manifest.json is included
          { from: "public/assets/favicon.ico", to: "assets/favicon.ico" }, // Ensure favicon is included
        ],
      }),
    ],
    devServer: {
      static: {
        directory: path.resolve(__dirname, "dist"), // Fix: Use `directory` instead of `static`
      },
      historyApiFallback: true, // Support React Router
      port: 3000, // Development server port
      open: true, // Automatically open the browser
      hot: true, // Enable hot module replacement
      compress: true, // Enable gzip compression
    },
    optimization: {
      splitChunks: {
        chunks: "all", // Split vendor and app code
      },
    },
  };
};
