const merge = require('webpack-merge');
//每个 loader 和插件执行耗时
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

const baseConfig = require('./webpack.base');

const prodConfig = {
  mode: 'production',
  plugins: [
  ],
};

module.exports = smp.wrap(merge(baseConfig, prodConfig));
