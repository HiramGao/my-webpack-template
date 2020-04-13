const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const autoprefixer = require('autoprefixer');

const projectRoot = process.cwd();

const entryAndPlugins = (() => {
  const entryFiles = glob.sync(path.join(projectRoot, './src/*/index.js')).map((entryFile) => entryFile.match(/src\/(.*)\/index\.js/));
  const entry = {};
  const HtmlWebpackPlugins = entryFiles.map((entryFile) => {
    entry[entryFile[1]] = `./${entryFile[0]}`;
    return new HtmlWebpackPlugin({
      template: path.join(projectRoot, `src/${entryFile[1]}/index.html`),
      filename: `${entryFile[1]}.html`,
      chunks: ['vendors', entryFile[1]],
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
    path: path.join(projectRoot, 'dist'),
    filename: '[name]_[hash:8].js',
  },
  mode: 'production',
  module: {
    rules: [{
      test: /\.js$/i,
      use: [
        'babel-loader',
        // 'eslint-loader'
      ],
    },
    {
      test: /\.css$/i,
      use: [
      MiniCssExtractPlugin.loader, 
      'css-loader'],
    },
    {
      test: /\.less$/i,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'less-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: [
            //TODO 配置
              autoprefixer({}),
            ],
          },
        },
      ],
    },
    {
      test: /\.(png|jpe?g|gif)$/i,
      use: {
        loader: 'file-loader',
        options: {
          limit: 10240,
          name: '[name]_[hash:8].[ext]',
        },
      },
    },
    {
      test: /\.(woff)|(svg)|(eot)|(ttf)$/i,
      use: {
        loader: 'file-loader',
        options: {
          limit: 10240,
          name: '[name]_[hash:8].[ext]',
        },
      },
    },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css',
    }),
    ...entryAndPlugins.HtmlWebpackPlugins,
    new FriendlyErrorsWebpackPlugin(),
    function errorPlugin() {
      this.hooks.done.tap('done', (stats) => {
        if (stats.compilation.errors && stats.compilation.errors.length && process.argv.index('--watch') === -1) {
          process.exit(1);
        }
      });
    },
  ],
  stats: 'errors-only',
};
