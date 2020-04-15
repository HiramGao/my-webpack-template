const path = require('path');
const webpack = require('webpack');
//提取单独CSS 文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//将文件注入html文件中
const HtmlWebpackPlugin = require('html-webpack-plugin');
//清理构建目录
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
//友好输出构建信息
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
//体积分析
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
//并行压缩
const TerserPlugin = require('terser-webpack-plugin');

const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
//缓存
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');


module.exports = {
    stats: 'minimal',
    entry: {
        index: path.join(__dirname, 'src/index.js'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name]_[hash:8].js'
    },
    module: {
        rules: [{
                test: /\.js$/i,
                exclude: /node_modules/,
                use: [{
                        //多进程打包
                        loader: "thread-loader",
                        options: {
                            workers: 2,
                        }
                    },
                    'babel-loader?cacheDirectory=true',
                    //语法检查
                    {
                        loader: 'eslint-loader',
                        options: {
                            fix: true,
                        }
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    'postcss-loader'
                ],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 10240,
                            name: '[name]_[hash:8].[ext]',
                        },
                    }, {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                progressive: true,
                                quality: 65
                            },
                            optipng: {
                                enabled: false,
                            },
                            pngquant: {
                                quality: [0.65, 0.90],
                                speed: 4
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            webp: {
                                quality: 75
                            }
                        }
                    },

                ],
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
        new FriendlyErrorsWebpackPlugin(),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].[hash:8].css',
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/index.hbs'),
            filename: 'index.html',
            inject: false,
            cache: false,
            chunks: ['index']
        }),
        new HtmlWebpackTagsPlugin({
            tags: '/library/library.dll.js',
            publicPath: 'build/'
        }),
        function errorPlugin() {
            this.hooks.done.tap('done', (stats) => {
                if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') === -1) {
                    // console.error(stats.compilation.errors)
                    process.exit(1);
                }
            });
        },
        new BundleAnalyzerPlugin({
            analyzerMode: 'json'
        }),
        //DLL
        new webpack.DllReferencePlugin({
            manifest: require('./build/library/library.json')
        }),
        new HardSourceWebpackPlugin()
    ],
    optimization: {
        //依赖分隔
        splitChunks: {
            minSize: 0,
            cacheGroups: {
                commons: {
                    test: /(lodash)/,
                    name: 'vendors',
                    chunks: 'all',
                    minChunks: 1,
                },
            }
        },
        minimize: true,
        minimizer: [new TerserPlugin({
            parallel: true
        })],
    },
    resolve: {
        alias: {
            'lodash': path.resolve(__dirname, './node_modules/lodash/lodash.min.js'),
        },
        extensions: ['.js'],
        mainFields: ['main']
    }
};