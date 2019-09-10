const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  mode: 'development',
  devServer: {
    contentBase: './dist'
  },

  entry: [ '@babel/polyfill', './src/index.html', './src/index.css', './src/index.js' ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },

      /* <img> tags should have their src added to the dependency graph. */
      {
        test: /\.html$/,
        use: 'html-loader'
      },

      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] }
        }
      },

      {
        test: /\.png$/,
        use: 'file-loader'
      },

      {
        test: /\.woff2?$/,
        use: 'file-loader'
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
}
