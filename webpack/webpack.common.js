const Path = require('path');
const fs = require('fs')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineCSSAndJS = require('./inline')
const { getFileExt, getFileName } = require('./utils')

const projectsIndex = fs.readdirSync('./src').filter(dir => fs.existsSync(`./src/${dir}/index.js`))
const projectsHTML = fs.readdirSync('./src').filter(dir => fs.existsSync(`./src/${dir}/index.html`))
const projectsAssets = fs.readdirSync('./src').filter(dir => fs.existsSync(`./src/${dir}/assets/`))
const projectsInfo = fs.readdirSync('./src')
  .filter(dir => fs.existsSync(`./src/${dir}/index.html`))
  .reduce((data, dir) => {
    let file = fs.readdirSync(`./src/${dir}`).find(
      name => getFileExt(name) == 'md'
    )
    let content = fs.readFileSync(`./src/${dir}/${file}`).toString()
    let match = /^([a-z0-9]+): /
    let extras = content.split(/[\r\n]/g).filter(a => a.match(match)).reduce((data, str) => {
      let i = str.indexOf(':')
      let [key, value] = [str.substr(0, i), str.substr(i + 1)]
      data[key.trim()] = value.trim()
      return data
    }, {})
    data.push({
      dir, name: getFileName(file),
      extras,
    })
    return data;
  }, [])

module.exports = {
  entry: function () {
    return projectsIndex.reduce((data, dir) => {
      data[`${dir}/app`] = Path.resolve(__dirname, '../src', dir, 'index.js')
      return data;
    }, {})
  },
  output: {
    path: Path.join(__dirname, '../build'),
    filename: '[name].js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    // 复制公共文件
    ...projectsAssets.map(dir => {
      return new CopyWebpackPlugin([
        { from: Path.resolve(__dirname, `../src/${dir}/assets/`), to: `${dir}/assets` }
      ])
    }),
    new CopyWebpackPlugin([
      { from: Path.resolve(__dirname, `../README.md`), to: `./` }
    ]),
    // 复制index.html
    ...projectsHTML.map(dir => {
      return new HtmlWebpackPlugin({
        template: Path.resolve(__dirname, `../src/${dir}/index.html`),
        chunks: [`${dir}/app`],
        filename: `${dir}/index.html`,
        inlineSource: '.(js|css)$',
      })
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      dirs: JSON.stringify(projectsInfo),
      chunks: [],
    }),
    ...process.env.NODE_ENV == 'production' ? [new InlineCSSAndJS()] : [],
  ],
  resolve: {
    alias: {
      '~': Path.resolve(__dirname, '../src')
    }
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            emitFile: false,
            outputPath: (url, resourcePath, context) => {
              let relative = Path.relative(Path.resolve(context, 'src'), resourcePath)
              let path = relative.split("\\")
              path.shift()
              return path.join('/');
            },
          },
        }
      },
    ]
  }
};
