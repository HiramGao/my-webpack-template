const webpack = require('webpack');
const merge = require('webpack-merge');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

const baseConfig = require('./webpack.base');



const devConfig = {
    mode: 'development',
    module: {
        rules: [
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
    devServer: {
        contentBase: './dist',
        hot: true,
        stats: 'errors-only',
    },
    devtool: 'source-map',
};


module.exports = smp.wrap(merge(baseConfig, devConfig));