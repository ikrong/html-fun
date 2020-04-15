const HtmlWebpackPlugin = require('html-webpack-plugin');
const { inlineSource } = require('inline-source')

class InlineCSSAndJS {
    apply(compiler) {
        compiler.hooks.compilation.tap('InlineCSSAndJS', (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('InlineCSSAndJS', async (data, cb) => {
                let warning = console.warn
                console.warn = () => { }
                data.html = await inlineSource(data.html, {
                    attribute: false,
                    swallowErrors: true,
                    handlers: [(source) => {
                        let path = source.sourcepath.split('/')
                        path.shift()
                        path = path.join('/')
                        source.fileContent = compilation.assets[path].source()
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