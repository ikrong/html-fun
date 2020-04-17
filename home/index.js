import './index.scss'
import * as Utils from './src/utils'
import { LoadProject } from './src/loadProject'

let body = document.querySelector('.project-list')

if (process.env.NODE_ENV != 'production') {
    window.dirs = window.dirs.concat(window.dirs, Array(30).fill('').map(() => {
        return window.dirs[Math.floor(Math.random() * window.dirs.length)]
    }))
}

window.dirs.sort((a, b) => {
    return +new Date(a.extras.date || 0) > +new Date(b.extras.date || 0) ? -1 : 1
}).map(({
    dir,
    name
}, i) => {
    let preview = `https://ikrong.github.io/html-fun/${dir}/index.html`
    let source = `https://github.com/ikrong/html-fun/tree/master/src/${dir}`
    if (env != 'production') {
        preview = `./${dir}/index.html`
        source = `#`
    }
    let div = document.createElement('div')
    div.classList.add('project')
    div.setAttribute('data-project', dir)
    div.innerHTML = `
    <div class="bg" style="background-color:${Utils.genColor(name)};"></div>
    <div class="name">${name}</div>
    `
    body.append(div)
})

function checkScreenshot() {
    Array.from(body.querySelectorAll('.project')).map(dom => {
        if (Utils.checkDomVisible(dom) && !dom.classList.contains('load-image')) {
            dom.classList.add('load-image')
            let dir = dom.getAttribute('data-project')
            let img = (process.env.NODE_ENV == 'production' ? `https://cdn.jsdelivr.net/gh/ikrong/html-fun/src/` : "./") +
                `${dir}/assets/screenshot.png`
            Utils.loadImage(img).then(() => {
                Object.assign(dom.querySelector('.bg').style, {
                    backgroundImage: `url('${img}')`
                })
            })
        }
    })
}

document.addEventListener('scroll', () => checkScreenshot())
checkScreenshot()


body.addEventListener('click', e => {
    new LoadProject(e)
    console.log(e)
})