import { Compass } from './script/compass'
import { numberToChinese } from './script/numberToChinese'
import { solarTerm, getTerm } from './script/solarTerm'

function getMaxDate() {
    let now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
}

// 年
let yearDom = document.createElement('div')
document.body.append(yearDom)

// 月 日 节气 周 时 分 秒
let compassList = [
    // 月
    new Compass(12, 70).setSize(50).each((dom, i) => {
        dom.innerHTML = `${numberToChinese(i + 1)}月`
    }),
    // 日
    new Compass(getMaxDate(), 120).setSize(60).each((dom, i) => {
        dom.innerHTML = `${numberToChinese(i + 1)}日`
    }),
    // 节气
    new Compass(48, 190).setSize(60).each((dom, i) => {
        dom.innerHTML = `${solarTerm[i / 2] || ''}`
    }),
    // 周
    new Compass(7, 230).setSize(60).each((dom, i) => {
        dom.innerHTML = `周${(i + 1 == 7) ? '日' : (numberToChinese(i + 1))}`
    }),
    // 时
    new Compass(24, 280).setSize(60).each((dom, i) => {
        dom.innerHTML = `${numberToChinese(i)}时`
    }),
    // 分
    new Compass(60, 370).setSize(60).each((dom, i) => {
        dom.innerHTML = `${numberToChinese(i)}分`
    }),
    // 秒
    new Compass(60, 480).setSize(60).each((dom, i) => {
        dom.innerHTML = `${numberToChinese(i)}秒`
    }),
]

function CountCompassPos() {
    let now = new Date()
    // 设置年份
    yearDom.innerHTML = String(now.getFullYear()).split('').map(numberToChinese).join('') + '年'
    Object.assign(yearDom.style, {
        position: 'fixed',
        width: '80px',
        height: '14px',
        left: window.innerWidth / 2 - 40 + 'px',
        top: window.innerHeight / 2 - 7 + 'px',
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#ccc',
        userSelect: 'none',
    })
    let [term, isNear] = getTerm(now.getFullYear(), now.getMonth() + 1, now.getDate())
    // 月 日 节气 周 时 分 秒
    let pos = [
        now.getMonth() + 1,
        now.getDate(),
        solarTerm.indexOf(term) * 2 + (isNear ? 2 : 1),
        now.getDay() == 0 ? 7 : now.getDay(),
        now.getHours() + 1,
        now.getMinutes() + 1,
        now.getSeconds() + 1,
    ]
    compassList.map((_, i) => _.rotateTo(pos[i]))
}

window.addEventListener('resize', CountCompassPos)
CountCompassPos()
setInterval(CountCompassPos, 1000)