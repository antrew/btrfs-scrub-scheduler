const path = require("path");
const ShebangPlugin = require("webpack-shebang-plugin");

module.exports = {
  entry: "./index-webpack.ts",
  target: "node",
  mode: "production",
  plugins: [new ShebangPlugin()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "btrfs-scrub-scheduler",
    path: path.resolve(__dirname, "dist"),
  },
};
