const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    main: './index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './index.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /.ts$/,
        loader: 'ts-loader',
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'samples', to: 'samples' },
      ],
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    writeToDisk: true,
  },
};
