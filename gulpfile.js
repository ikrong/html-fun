const gulp = require('gulp')
const fs = require('fs')

function genProjectMD() {
    let projects = fs.readdirSync('./src').reduce((data, dir) => {
        let file = fs.readdirSync(`./src/${dir}`).find(
            name => getFileExt(name) == 'md'
        )
        data.push({
            dir, name: getFileName(file)
        })
        return data;
    }, [])

    let table = []
    table.push(['项目名', '代码目录', '预览'])
    table.push(['---', '----', '--'])

    projects.map(item => {
        table.push([
            item.name,
            `src/${item.dir}`,
            '-'
        ])
    })

    let mdStr = table.map(row => `| ${row.join(' | ')} |`).join('\n');

    let readme = fs.readFileSync('./README.md').toString()
    readme = readme.split(/[\r\n]----------------[\r\n]/)
    readme[1] = mdStr
    readme = readme.join('\n----------------\n')

    fs.writeFileSync('./README.md',readme)
}

/**获取文件名 */
function getFileName(file) {
    return file.split('.').shift()
}

/**获取文件后缀 */
function getFileExt(file) {
    return file.slice(
        (file.lastIndexOf('.') >>> 0) + 1
    ).toLowerCase()
}

gulp.task('genmd', (d) => {
    genProjectMD()
    d()
})