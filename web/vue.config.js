const CompressionWebpackPlugin = require('compression-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { resolve, env } = require('./ci/utils')
const PreloadWebpackPlugin = require('./ci/plugins/preload.webpack.plugin')
const merge = require('webpack-merge')
const isProduction = process.env.NODE_ENV === 'production'
const { mode, code } = require('yargs').argv
const isCommon = code === 'common'
const isTender = code.includes('tender')

env(resolve(`../${code}/.env`))
isProduction && env(resolve(`../${code}/.env.${mode || 'production'}`))

module.exports = merge(
  {
    publicPath: `/ggzy/${code}/`,
    outputDir: `dist/${code}`,
    assetsDir: 'public',
    pages: isCommon
      ? undefined
      : {
          index: {
            entry: './src/main',
            template: `../${code}/public/index.html`,
            filename: 'index.html',
            chunks: ['chunk-vendors', 'chunk-common', 'index']
          }
        },
    css: {
      loaderOptions: {
        scss: {
          // prependData: `@import 'common/src/assets/styles/_variables';`
        }
      }
    },
    lintOnSave: false,
    productionSourceMap: false,
    devServer: {
      port: 9097
    },
    chainWebpack: config => {
      config.resolve.alias.set('@', resolve(`../${code}/src`))
      config.resolve.alias.set('@common', resolve('../common'))
      if (!isCommon && isProduction && !isTender) {
        config.plugin('html-index').tap(args => [
          {
            ...args[0],
            templateParameters: (compilation, assets, pluginOptions) => {
              const prefix = `${process.env.VUE_APP_GZ_SYSTEM_PREFIX}/common/${process.env.VUE_APP_MODE}.`
              assets.css.unshift(`${prefix}css`)
              assets.js.unshift(`${prefix}umd.min.js`)
              return args[0].templateParameters(compilation, assets, pluginOptions)
            }
          }
        ])
      }
    },
    configureWebpack: config => {
      // if (!isCommon) {
      //   if (isProduction && !isTender) {
      //     config.externals = (context, request, callback) => {
      //       const packages = {
      //         vue: 'Vue',
      //         vuex: 'Vuex',
      //         moment: 'moment',
      //         axios: 'axios',
      //         'vue-router': 'VueRouter',
      //         'element-ui': 'ElementUi',
      //       }
      //       if (Object.keys(packages).includes(request)) {
      //         return callback(null, packages[request])
      //       }
      //       callback()
      //     }
      //     config.plugins.push(new PreloadWebpackPlugin())
      //   }
      //   config.plugins.push(
      //     new CopyWebpackPlugin([
      //       {
      //         from: resolve(`../${code}/public`),
      //         to: resolve(`dist/${code}`),
      //         ignore: ['.*']
      //       }
      //     ])
      //   )
      // }
      // isProduction &&
      //   config.plugins.push(
      //     new CompressionWebpackPlugin({
      //       algorithm: 'gzip',
      //       test: new RegExp('\\.(js|css)$'),
      //       threshold: 10240,
      //       minRatio: 0.8
      //     })
      //   )
    }
  },
  isCommon ? {} : require(resolve(`../${code}/vue.config`))
)
