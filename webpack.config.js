import path from 'path';

export default {
  mode: 'development',
  target: 'web', // برای مرورگر

  entry: './main.js', // مسیر فایل JS اصلی شما

  output: {
    filename: 'bundle.js',
    path: path.resolve('dist')
  },

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },

  devServer: {
    static: {
      directory: path.join(process.cwd(), 'dist')
    },
    compress: true,
    port: 3000,
    open: true
  }
};

/*import path from 'path';

export default {
  mode: 'development',
  target: 'web',

  entry: './src/main.js',

  output: {
    filename: 'renderer.js',
    path: path.resolve('dist')
  },

};
*/