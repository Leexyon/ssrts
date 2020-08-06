const px2remExclude = require('postcss-px2rem-exclude')
// const CompressionWebpackplugin = require('compression-webpack-plugin')
const path = require('path')

const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const nodeExternals = require('webpack-node-externals')
const merge = require('lodash.merge')

function resolve(dir) {
    return path.join(__dirname, dir)
}

// 判断当前服务端或客服端 引用不同文件
const TARGET_NODE = process.env.WEBPACK_TARGET === 'node'
const createApiFile = TARGET_NODE
    ? './create-api-server.js'
    : './create-api-client.js'
const target = TARGET_NODE
    ? 'server'
    : 'client'
const config = {
    // eslint-loader 是否在保存的时候检查
    lintOnSave: true,
    // 生产环境 sourceMap
    productionSourceMap: false,
    // baseUrl: process.env.NODE_ENV === 'production' ? './' : '/',
    css: {
        loaderOptions: {
            scss: {
                // @/ 是 src/ 的别名
                // 所以这里假设你有 `src/variables.sass` 这个文件
                // 注意：在 sass-loader v8 中，这个选项名是 "prependData"
                prependData: `@import "~@/style/reset.scss";`
            },
        }
    },
    // webpack 配置，键值对象时会合并配置，为方法时会改写配置

    // configureWebpack: (configs) => {
    //   let plugins = []
    //   // 生产环境配置压缩
    //   if (process.env.NODE_ENV === 'production') {
    //     plugins = [
    //       new CompressionWebpackplugin({
    //         filename: '[path].gz[query]',
    //         algorithm: 'gzip',
    //         test: /\.['js','css'](\?.*)?$/i,
    //         threshold: 1024,
    //         minRatio: 0.8
    //       })
    //     ]
    //   } else {
    //     // 开发环境配置
    //   }
    //   configs.plugins.push(...plugins)
    // },

    // output是生成一个 commonjs 的 library， VueSSRServerPlugin 用于这是将服务器的整个输出构建为单个 JSON 文件的插件。
    configureWebpack: () => ({
        entry: `./src/entry-${target}`,
        target: TARGET_NODE ? 'node' : 'web',
        node: TARGET_NODE ? undefined : false,
        plugins: [
            TARGET_NODE ? new VueSSRServerPlugin() : new VueSSRClientPlugin()
            // process.env.NODE_ENV === 'production' && new CompressionWebpackplugin({
            //   filename: '[path].gz[query]',
            //   algorithm: 'gzip',
            //   test: /\.['js','css'](\?.*)?$/i,
            //   threshold: 1024,
            //   minRatio: 0.8
            // })
        ],
        externals: TARGET_NODE ? nodeExternals({
            whitelist: /\.css$/
        }) : undefined,
        output: {
            libraryTarget: TARGET_NODE
                ? 'commonjs2' : undefined
        },
        optimization: {
            splitChunks: TARGET_NODE ? false : undefined,
        },
        resolve: {
            alias: {
                'create-api': createApiFile
            }
        }
    }),
    // webpack 链接 API，用于生成和修改 webapck 配置
    chainWebpack: (webpackConfig) => {
        if (process.env.npm_config_report) {
            webpackConfig.plugin('webpack-bundle-analyzer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
        }
        // 设置组件别名
        webpackConfig.resolve.alias.set('fetch', resolve('src/utils/fetch.js'));

        webpackConfig.module
            .rule('vue')
            .use('vue-loader')
            .tap(options =>
                merge(options, {
                    optimizeSSR: false
                })
            )
    },
    devServer: {
        // 设置代理
        // open: true,
        proxy: {
            "/getaway": {
                target: "http://192.168.1.21:9001/", // 域名
                ws: true, // 是否启用websockets
                changOrigin: true, //
                pathRewrite: {
                    "^/getaway": "/"
                }
            },
            "/api": {
                target: "http://localhost:3000/", // 域名
                ws: true, // 是否启用websockets
                changOrigin: true, //
                pathRewrite: {
                    "^/api": "/"
                }
            },
            "/au": {
                target: "http://192.168.1.9:8080/", // 域名
                ws: true, // 是否启用websockets
                changOrigin: true, //
                pathRewrite: {
                    "^/au": "/"
                }
            }
        },
        hot: true,
        open: true
    }
}
module.exports = config
