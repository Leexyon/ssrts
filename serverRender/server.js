/* eslint-disable no-console */
const logger = require('log4js').getLogger();
logger.level = 'info';


const fs = require('fs')
const path = require('path')
const express = require('express')
const rootPath = '../dist'
const proxyPath = 'http://10.100.2.44'
const proxyPort = '33518'

const { createProxyMiddleware } = require('http-proxy-middleware')
const {
    createBundleRenderer
} = require('vue-server-renderer')

const devServerBaseURL = process.env.DEV_SERVER_BASE_URL || 'http://localhost'
const devServerPort = process.env.DEV_SERVER_PORT || 8081

const app = express();

app.use('/css', express.static(path.join(__dirname, 'public/css')));

function createRenderer(bundle, options) {
    return createBundleRenderer(bundle, Object.assign(options, {
        runInNewContext: false
    }))
}

let renderer
const templatePath = path.resolve(__dirname, './index.template.html')

const bundle = require(rootPath + '/vue-ssr-server-bundle.json')
const template = fs.readFileSync(templatePath, 'utf-8')
const clientManifest = require(rootPath + '/vue-ssr-client-manifest.json')
renderer = createRenderer(bundle, {
    template,
    clientManifest
})


app.use('/cms*', createProxyMiddleware({
    target: `${proxyPath}:${proxyPort}`,
    changeOrigin: true,
    pathRewrite: {
        "^/cms": ""
    }
}))


app.use('/js', express.static(path.resolve(__dirname, rootPath + '/js')));
app.use('/imgs', express.static(path.resolve(__dirname, rootPath + '/imgs')));
app.use('/img', express.static(path.resolve(__dirname, rootPath + '/img')));
app.use('/css', express.static(path.resolve(__dirname, rootPath + '/css')));
app.use('/dist', express.static(path.join(__dirname, rootPath)));

app.get('*', (req, res) => {

    res.setHeader('Content-Type', 'text/html');

    const context = {
        title: 'Vue CLI 3 SSR example',
        url: req.url
    }

    renderer.renderToString(context, (err, html) => {
        if (err) {
            if (err.url) {
                res.redirect(err.url)
            } else {
                // Render Error Page or Redirect
                res.status(500).end('500 | Internal Server Error')
                console.error(`error during render : ${req.url}`)
                console.error(err.stack)
            }
        }
        res.status(context.HTTPStatus || 200)
        res.send(html)
    })
})

module.exports = app
