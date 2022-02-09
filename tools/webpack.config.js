const path = require('path')
const webpack = require('webpack')
const AssetsPlugin = require('assets-webpack-plugin')
const CpuProfilerWebpackPlugin = require('cpuprofile-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const pkg = require('../package.json')

const isDebug = !process.argv.includes('--release')
const withProfiler = process.argv.includes('--profile')
const babelConfig = Object.assign({}, pkg.babel, {
  babelrc: false,
  cacheDirectory: true,
})

if (isDebug) {
  babelConfig.plugins.unshift('react-refresh/babel')
}

// https://webpack.js.org/configuration/
const config = {
  mode: isDebug ? 'development' : 'production',

  context: path.resolve(__dirname, '../src'),
  entry: [
    ...(isDebug ? ['webpack-hot-middleware/client'] : []),
    '@babel/polyfill',
    'whatwg-fetch',
    './main.js',
  ],

  // Options affecting the output of the compilation
  output: {
    path: path.resolve(__dirname, '../public/dist'),
    publicPath: isDebug ? `http://localhost:${process.env.PORT}/dist/` : '/dist/',
    filename: isDebug ? '[name].js?[contenthash]' : '[name].[contenthash].js',
    chunkFilename: isDebug ? '[name].js?[chunkhash]' : '[name].[chunkhash].js',
  },

  resolve: {
    alias: {
      components: path.resolve(__dirname, '../src/components/'),
      theme: path.resolve(__dirname, '../src/styles/theme.js'),
      utils: path.resolve(__dirname, '../src/utils/'),
      'flex.css': path.resolve(__dirname, '../src/styles/flex.css'),
    },
  },

  // Developer tool to enhance debugging, source maps
  // https://webpack.js.org/configuration/devtool/#root
  devtool: isDebug ? 'eval-source-map' : false,
  devServer: { hot: true },

  stats: isDebug
    ? {
      colors: true,
      errors: true,
      warnings: true,
      chunks: true,
      chunkModules: false,
      dependentModules: false,
      chunkRelations: false,
      timings: true,
    }
    : {
      preset: 'errors-warnings',
    },

  // Improves caching of libraries that do not need to change often
  // https://webpack.js.org/guides/caching
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },

  cache: isDebug
    ? {
      type: 'filesystem',
      buildDependencies: {
        // This makes all dependencies of this file - build dependencies
        config: [__filename],
      },
    }
    : false,

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        VERSION: JSON.stringify(process.env.VERSION),
        API_URL: JSON.stringify(process.env.API_URL),
        // Auth
        AUTH0_CLIENT_ID: JSON.stringify(process.env.AUTH0_CLIENT_ID),
        AUTH0_DOMAIN: JSON.stringify(process.env.AUTH0_DOMAIN),
        AUTH0_REDIRECT_URI: JSON.stringify(process.env.AUTH0_REDIRECT_URI),
        AUTH0_AUDIENCE: JSON.stringify(process.env.AUTH0_AUDIENCE),
        // 3rd party
        GOOGLE_API_KEY: JSON.stringify(process.env.GOOGLE_API_KEY),
        STRIPE_PUBLISHABLE_KEY: JSON.stringify(process.env.STRIPE_PUBLISHABLE_KEY),
        PSPDFKITLICENSE: JSON.stringify(process.env.PSPDFKITLICENSE),
        // Modes
        __DEV__: isDebug,
        MAINTENANCE: JSON.stringify((process.env.MAINTENANCE || 'off') === 'on'), // Keep default. Not supplied in CodeBuild
        IGNOREDB_PDF_VIEWER: JSON.stringify(process.env.IGNOREDB_PDF_VIEWER),
        FEATURES_PARTNER_AD: JSON.stringify((process.env.FEATURES_PARTNER_AD) === 'on'), // ER-340
        SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
        SENTRY_ENVIRONMENT: JSON.stringify(process.env.SENTRY_ENVIRONMENT),
      },
      'process.features': {
        SUBSCRIPTIONS: JSON.stringify((process.env.FEATURES_SUBSCRIPTIONS) === 'on'),
        PDF_VIEWER: JSON.stringify((process.env.FEATURES_PDF_VIEWER) === 'on'),
      },
    }),
    // Emit a JSON file with assets paths
    // https://github.com/sporto/assets-webpack-plugin#options
    new AssetsPlugin({
      path: path.resolve(__dirname, '../public/dist'),
      filename: 'assets.json',
    }),
    new webpack.ProgressPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, '../src'),
        loader: 'babel-loader',
        exclude: '/node_modules/',
        options: babelConfig,
      },
      // https://jaketrent.com/post/load-both-css-and-css-modules-webpack/
      {
        test: /\.global\.css$/, // Matches *.global.css files ex. app.global.css
        exclude: '/node_modules/',
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /^(?!.*?\.global).*\.css$/,
        exclude: '/node_modules/',
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDebug,
              importLoaders: 1,
              modules: {
                mode: 'local',
                localIdentName: isDebug ? '[path][name]__[local]' : '[contenthash:base64:4]',
              },
            },
          },
          { loader: 'postcss-loader' },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|webp)$/,
        exclude: '/node_modules/',
        type: 'asset/inline',
      },
      {
        test: /\.(eot|ttf|wav|mp3)$/,
        exclude: '/node_modules/',
        type: 'asset/resource',
      },
    ],
  },
}

if (isDebug) {
  config.plugins.push(
    new ReactRefreshWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  )
}

if (withProfiler) {
  config.plugins.push(new CpuProfilerWebpackPlugin())
}

module.exports = config
