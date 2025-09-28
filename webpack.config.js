const path = require('path');
const { env: processEnv } = require('process');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');


dotenv.config();

module.exports = (env = {}) => {
  const isProduction = env.production || processEnv.NODE_ENV === 'production';

  const config = {
    entry: path.join(__dirname, 'client/src/index.ts'),
    mode: isProduction ? 'production' : 'development',
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({
        terserOptions: {
          compress: {
            hoist_funs: false,
          }
        }
      })],
    },
    module: {
      rules: [
        {
          test: /\.(js|ts|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          }
        }
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', 'scss'],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'client/build'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: 'body',
        template: path.join(__dirname, 'client/src/assets/index.html'),
      }),
      new CopyPlugin({
        patterns: [
          { from: "./client/src/assets/styles" },
        ],
      }),
    ],
  };

  if (!isProduction) {
    config.devServer = {
      static: {
        directory: path.join(__dirname, 'client/build'),
      },
      compress: true,
      port: 9000,
      proxy: {
        '/api': 'http://localhost:3000',
      },
    };
  }

  return config;
};