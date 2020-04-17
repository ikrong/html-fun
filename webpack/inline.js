const HtmlWebpackPlugin = require('html-webpack-plugin');
const { inlineSource } = require('inline-source')

class InlineCSSAndJS {
    apply(compiler) {
        compiler.hooks.compilation.tap('InlineCSSAndJS', (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('InlineCSSAndJS', async (data, cb) => {
                let warning = console.warn
                console.warn = () => { }
                let name = data.outputName.split('/')[0]
                if (process.env.NODE_ENV == 'production') {
                    data.html = data.html.replace(
                        '</head>',
                        `<base href="https://cdn.jsdelivr.net/gh/ikrong/html-fun/src/${name}" /></head>`
                    )
                }
                data.html = await inlineSource(data.html, {
                    saveRemote: false,
                    attribute: false,
                    swallowErrors: true,
                    handlers: [(source) => {
                        if (source.isRemote || !source.sourcepath) {
                            source.fileContent = null
                            source.content = null
                            return Promise.resolve()
                        }
                        let path = source.sourcepath.split('/')
                        path.shift()
                        path = path.join('/')
                        let assetsSource = compilation.assets[path] || compilation.assets[source.sourcepath]
                        if (!assetsSource) return Promise.resolve()
                        source.fileContent = assetsSource.source()
                        source.content = source.fileContent
                        if (source.type == 'css') {
                            source.replace = `<style>${source.content}</style>`
                        } else if (source.type == 'js') {
                            source.replace = `<script>${source.content}</script>`
                        }
                        return Promise.resolve()
                    }]
                })
                console.warn = warning
                cb(null, data)
            })
        })
    }
}

module.exports = InlineCSSAndJS