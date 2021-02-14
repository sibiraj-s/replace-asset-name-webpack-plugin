const path = require('path');

const webpack = require('webpack');

const getCompiler = (dev = false) => {
  const mode = dev ? 'development' : 'production';

  const compiler = webpack({
    entry: {
      main: './index.js',
      secondary: './secondary.js',
    },
    mode,
    devtool: 'source-map',
    context: path.resolve(__dirname, '../fixtures'),
    output: {
      clean: true,
      filename: dev ? 'js/[name].js' : 'js/[name]-[contenthash].js',
    },
    optimization: {
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
    },
  });

  return compiler;
};

module.exports = getCompiler;
