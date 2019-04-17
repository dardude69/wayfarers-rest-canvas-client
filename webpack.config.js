module.exports = {

  mode: 'development',
  devServer: {
    contentBase: './dist'
  },

  entry: [ '@babel/polyfill', './src/index.js' ],

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] }
        }
      }
    ]
  }
}
