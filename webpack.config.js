const HtmlWebpackPlugin = require('html-webpack-plugin');
const injectConfig = new HtmlWebpackPlugin({
  template: './index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  context: __dirname + '/app',
  entry: './index.js',
  output: {
    path: __dirname + '/build',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
       { test: /\.css$/, loader: "style-loader!css-loader", exclude: /node_modules/  }
    ]
  },
  plugins: [injectConfig]
}
