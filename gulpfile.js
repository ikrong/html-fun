const gulp = require('gulp')
const fs = require('fs')
const chalk = require('chalk');
const meow = require('meow');
const { prompt } = require('enquirer')
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

gulp.task('new', async (d) => {
    let cli = meow({
        booleanDefault: undefined,
        flags: {
            name: {
                type: 'string',
                default: '',
            },
            code: {
                type: 'string',
                default: '',
            },
        }
    })
    let name, dir;
    name = cli.flags.name
    dir = cli.flags.code
    console.log(chalk.green('准备创建新的有趣HTML：'))
    if (!name || !dir) {
        const resp = await prompt([
            {
                type: 'input',
                name: 'name',
                message: '项目名是什么？'
            },
            {
                type: 'input',
                name: 'dir',
                message: '项目的英文代号是什么？'
            }
        ]);
        name = resp.name
        dir = resp.dir
    }
    if (name && dir) {
        (!fs.existsSync(`./src/${dir}`)) && fs.mkdirSync(`./src/${dir}`)
        fs.writeFileSync(`./src/${dir}/index.html`, `<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;">
    <title>${name}</title>
</head>
<body>
    
</body>
</html>`)
        fs.writeFileSync(`./src/${dir}/index.js`, `import './style.scss'\n`)
        fs.writeFileSync(`./src/${dir}/style.scss`, `*,
body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}`)
        let date = new Date().toLocaleString('zh-CN', {
            "hour12": false,
            "year": "numeric",
            "month": "2-digit",
            "day": "2-digit"
        });
        fs.writeFileSync(`./src/${dir}/${name}.md`, `date: ${date}`)
        console.log(chalk.green(`已创建成功`))
    }
    d()
})