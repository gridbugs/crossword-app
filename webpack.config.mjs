import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';

export default {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    main: './ts/index.ts',
  },
  output: {
    path: path.resolve('./dist'),
    filename: './index.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    // needed for opencv
    fallback: {
      fs: false,
      path: false,
      crypto: false
    },
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
      template: './static/index.html',
      filename: 'index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'samples', to: 'samples' },
      ],
    }),
    new ESLintPlugin({
      files: './ts/**',
      fix: true,
    }),
  ],
  devServer: {
    contentBase: './dist',
    writeToDisk: true,
  },
};
