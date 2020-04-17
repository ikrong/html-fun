const gulp = require('gulp')
const fs = require('fs')
const { getFileExt, getFileName } = require('./webpack/utils')

function genProjectMD() {
    let projects = fs.readdirSync('./src')
        .filter(dir => fs.existsSync(`./src/${dir}/index.html`))
        .reduce((data, dir) => {
            let file = fs.readdirSync(`./src/${dir}`).find(
                name => getFileExt(name) == 'md'
            )
            data.push({
                dir, name: file ? getFileName(file) : dir
            })
            return data;
        }, [])

    let table = []
    table.push(['项目名', '代码目录(src/)', '预览'])
    table.push(['---', '----', '--'])

    projects.map(item => {
        let preview = `https://ikrong.github.io/html-fun/${item.dir}/index.html`
        let source = `https://github.com/ikrong/html-fun/tree/master/src/${item.dir}`
        table.push([
            item.name,
            `[${item.dir}](${source})`,
            `[${preview}](${preview})`
        ])
    })

    let mdStr = table.map(row => `| ${row.join(' | ')} |`).join('\n');

    let readme = fs.readFileSync('./README.md').toString()
    readme = readme.split(/[\r\n]{2}\[\/\/\]: # \(实现的内容表格\)[\r\n]{2}/)
    readme[1] = mdStr
    readme = readme.join('\n\n\[\/\/\]: # \(实现的内容表格\)\n\n')

    fs.writeFileSync('./README.md', readme)
}

gulp.task('genmd', (d) => {
    genProjectMD()
    d()
})