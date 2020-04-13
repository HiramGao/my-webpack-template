const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');


const entryAndPlugins = (() => {
  const entryFiles = glob.sync(path.join(__dirname, './src/*/index-server.js')).map((entryFile) => entryFile.match(/src\/(.*)\/index-server\.js/));
  const entry = {};
  const HtmlWebpackPlugins = entryFiles.map((entryFile) => {
    entry[entryFile[1]] = `./${entryFile[0]}`;
    return new HtmlWebpackPlugin({
      template: path.join(__dirname, `src/${entryFile[1]}/index.html`),
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
    path: path.join(__dirname, 'dist'),
    filename: '[name]-server.js',
    libraryTarget: 'umd',
  },
  mode: 'production',
  module: {
    rules: [{
      test: /\.js$/i,
      use: [
        'babel-loader',
      ],
    },
    {
      test: /\.css$/i,
      use: [MiniCssExtractPlugin.loader, 'css-loader'],
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
        loader: 'url-loader',
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
    new OptimizeCSSAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: cssnano,
    }),
    ...entryAndPlugins.HtmlWebpackPlugins,
  ],
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        commons: {
          name: 'common.js',
          chunks: 'initial',
          minChunks: 2,
        },
      },
    },
  },
};
