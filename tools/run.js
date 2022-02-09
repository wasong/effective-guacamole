require('dotenv-flow').config()
const fs = require('fs')
const ejs = require('ejs')
const rimraf = require('rimraf')
const webpack = require('webpack')
const Browsersync = require('browser-sync')
const task = require('./task')
const config = require('./config')

// Build the app and launch it in a browser for testing via Browsersync
module.exports = task('run', () => new Promise((resolve) => {
  rimraf.sync('public/dist/*', { nosort: true, dot: false })
  let count = 0
  const bs = Browsersync.create()
  const webpackConfig = require('./webpack.config')
  const compiler = webpack(webpackConfig)

  // Node.js middleware that compiles application in watch mode
  // http://webpack.github.io/docs/webpack-dev-middleware.html
  const webpackDevMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: webpackConfig.stats,
  })

  compiler.hooks.done.tap('done', (stats) => {
    // Generate index.html page
    let bundle
    let runtime
    let vendors

    stats.compilation.chunks.forEach((x) => {
      const [file] = x.files
      if (x.name === 'main') bundle = file
      if (x.name === 'vendors') vendors = file
      if (x.name === 'runtime') runtime = file
    })
    const template = fs.readFileSync('./public/index.ejs', 'utf8')
    const render = ejs.compile(template, { filename: './public/index.ejs' })
    const output = render({
      debug: true,
      bundle: `/dist/${bundle}`,
      vendors: `/dist/${vendors}`,
      runtime: `/dist/${runtime}`,
      config,
    })
    fs.writeFileSync('./public/index.html', output, 'utf8')

    // Launch Browsersync after the initial bundling is complete
    // For more information visit https://browsersync.io/docs/options
    count += 1
    if (count === 1) {
      bs.init({
        open: false,
        port: process.env.PORT || 8080,
        ui: { port: Number(9000) },
        // https://github.com/BrowserSync/browser-sync/issues/1503
        callbacks: {
          ready: (err, bsX) => {
            bsX.utils.serveStatic.mime.define({ 'application/wasm': ['wasm'] }) // TODO: check if AWS correctly handle WASM
          },
        },
        server: {
          baseDir: 'public',
          middleware: [
            webpackDevMiddleware,
            require('webpack-hot-middleware')(compiler),
            require('connect-history-api-fallback')(),
          ],
        },
      }, resolve)
    }
  })
}))
