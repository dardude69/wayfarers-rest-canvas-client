const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  mode: 'development',
  devServer: {
    contentBase: './dist'
  },

  devtool: 'eval-source-map',

  entry: [ '@babel/polyfill', './src/index.html', './src/index.css', './src/index.js' ],

  module: {
    rules: [
      {
        test: /\.css$/,
        loader: ['style-loader', 'css-loader']
      },

      /* <img> tags should have their src added to the dependency graph. */
      {
        test: /\.html$/,
        loader: 'html-loader'
      },

      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] }
        }
      },

      {
        test: /\.png$/,
        loader: 'file-loader',
        options: {
          name: 'assets/images/[name].[ext]'
        }
      },

      {
        test: /\.woff2?$/,
        loader: 'file-loader',
        options: {
          name: 'assets/fonts/[name].[ext]'
        }
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
}
