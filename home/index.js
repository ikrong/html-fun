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

let rowP = 2
if (window.innerWidth > 1000) {
    rowP = 5
} else if (window.innerWidth > 700) {
    rowP = 3
}
if (window.dirs.length % rowP && window.dirs.length > rowP) {
    let fixP = rowP - window.dirs.length % rowP
    Array(fixP).fill('').map(() => {
        let project = document.createElement('div')
        project.classList.add('project', 'fake')
        body.append(project)
    })
    console.log({ fixP })
}

function checkScreenshot() {
    Array.from(body.querySelectorAll('.project')).filter(dom => !dom.classList.contains('fake')).map(dom => {
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
    let eles
    if (document.elementsFromPoint) {
        eles = Array.from(document.elementsFromPoint(e.clientX, e.clientY))
    } else if (document.msElementsFromPoint) {
        eles = Array.from(document.msElementsFromPoint(e.clientX, e.clientY))
    }
    let proj = eles.find(dom => dom.classList.contains('project') && !dom.classList.contains('fake'))
    if (!proj) return
    let dir = proj.getAttribute('data-project')
    if (navigator.userAgent.match(/(iphone|mobile|ipad)/gi)) {
        location.href = `./${dir}`
    } else {
        new LoadProject(proj)
    }
    // console.log(e)
})