const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const entryAndPlugins = (() => {
  const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js')).map((entryFile) => entryFile.match(/src\/(.*)\/index\.js/));
  const entry = {};
  const HtmlWebpackPlugins = entryFiles.map((entryFile) => {
    entry[entryFile[1]] = `./${entryFile[0]}`;
    return new HtmlWebpackPlugin({
      template: path.join(__dirname, `src/${entryFile[1]}/index.html`),
      filename: `${entryFile[1]}.html`,
      chunks: [entryFile[1]],
      inject: true,
      minify: {
        html5: true,
        collapseWhitespace: true,
        preserveLineBreaks: false,
        removeComments: false,
        minifyJS: true,
        minifyCSS: true,
      },
    });
  });
  return {
    entry,
    HtmlWebpackPlugins,
  };
})();

module.exports = {
  entry: entryAndPlugins.entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  // watch: true,
  // watchOptios: {
  //     ingore: /node_modules/,
  //     aggregateTimeout: 300,
  //     poll: 100
  // },
  mode: 'development',
  module: {
    rules: [{
      test: /\.js$/i,
      use: 'babel-loader',
    },
    {
      test: /\.css$/i,
      use: ['style-loader', 'css-loader'],
    },
    {
      test: /\.less$/i,
      use: ['style-loader', 'css-loader', 'less-loader'],
    },
    {
      test: /\.(png|jpe?g|gif)$/i,
      use: 'file-loader',
    },
    {
      test: /\.(woff)|(svg)|(eot)|(ttf)$/i,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10240,
        },
      },
    },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    ...entryAndPlugins.HtmlWebpackPlugins,
    new FriendlyErrorsWebpackPlugin(),
  ],
  devServer: {
    contentBase: './dist',
    hot: true,
    stats: 'errors-only',
  },
  devtool: 'inline-source-map',
};
