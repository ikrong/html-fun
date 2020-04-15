const Path = require('path');
const fs = require('fs')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineCSSAndJS = require('./inline')

const projectsIndex = fs.readdirSync('./src').filter(dir => fs.existsSync(`./src/${dir}/index.js`))
const projectsHTML = fs.readdirSync('./src').filter(dir => fs.existsSync(`./src/${dir}/index.html`))
const projectsAssets = fs.readdirSync('./src').filter(dir => fs.existsSync(`./src/${dir}/assets/`))

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
    // 复制index.html
    ...projectsHTML.map(dir => {
      return new HtmlWebpackPlugin({
        template: Path.resolve(__dirname, `../src/${dir}/index.html`),
        chunks: [`${dir}/app`],
        filename: `${dir}/index.html`,
        inlineSource: '.(js|css)$',
      })
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
