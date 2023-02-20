import './style.scss'

class LotteryStore {

    static data = {}

    static init() {
        if (localStorage.getItem('ssq_lottery_list')) {
            this.data = JSON.parse(localStorage.getItem('ssq_lottery_list'))
        }
    }

    static has(key) {
        return !!this.data[key]
    }

    static get(key) {
        return JSON.parse(JSON.stringify(this.data[key]))
    }

    static set(key, value) {
        this.data[key] = JSON.parse(JSON.stringify(value))
        localStorage.setItem('ssq_lottery_list', JSON.stringify(this.data))
    }

}

LotteryStore.init();

class SsqLottery {

    reds = []
    blue = ''
    code = ''

    reward = -1

    el
    constructor(
        reds,
        blue,
        code,
    ) {
        this.reds = reds || []
        this.blue = blue || ''
        this.code = code || ''
    }

    setCode(code) {
        this.code = code
    }

    set(reds, blue) {
        this.reds = reds || []
        this.blue = blue || ''
    }

    async checkReward() {
        if (this.code) {
            if (LotteryStore.has(this.code)) {
                return this.check(LotteryStore.get(this.code))
            }
            const url = new URL('https://api-next.ikrong.com/ex/lottery/list/latest')
            url.searchParams.set('code', this.code)
            const resp = await (await fetch(url.toString())).json()
            if (resp.data.length) {
                const reds = res.data.num.split(',')
                const blue = balls.pop()
                LotteryStore.set(this.code, { reds, blue })
                this.check(LotteryStore.get(this.code))
            }
        }
    }

    check(lottery = {
        reds: [],
        blue: ''
    }) {
        let matchRed = 0;
        let matchBlue = false;
        for (let i = 0; i < 6; i++) {
            if (lottery.reds.includes(this.reds[i])) {
                matchRed++;
            }
        }
        if (blueBall === lottery.blue) {
            matchBlue = true;
        }
        if (matchRed === 6 && matchBlue) {
            this.reward = 1
        } else if (matchRed === 6) {
            this.reward = 2
        } else if (matchRed === 5 && matchBlue) {
            this.reward = 3
        } else if (matchRed === 5 || (matchRed === 4 && matchBlue)) {
            this.reward = 4
        } else if (matchRed === 4 || (matchRed === 3 && matchBlue)) {
            this.reward = 5
        } else if (matchBlue) {
            this.reward = 6
        } else {
            this.reward = 0
        }
    }

    render() {
        if(!this.el) {
            const div = document.createElement('div')
            div.classList.add('lottery-info')
        }

        this.el.innerHTML = `<div class="lottery-code">${this.code}</div>
        <div class="lottery-number">
            ${this.reds.map(num=>`<div class="red-ball">${num}</div>`)}
            <div class="blue-ball">${this.blue}</div>
        </div>
        <div class="lottery-reward">${this.reward}</div>
        `
        this.el = div

        return this.el
    }

}

class LotterySelector {

    allReds = []
    allBlues = []
    code = ''
    el

    reds = []
    blue = ''
    constructor() {
        this.init()
    }

    init() {
        const root = document.createElement('div')
        const redBallContainer = document.createElement('div')
        const blueBallContainer = document.createElement('div')
        root.append(redBallContainer)
        root.append(blueBallContainer)
        this.allReds = Array(33).fill().map((_, i) => i + 1).map(num => {
            const div = document.createElement('div')
            div.textContent = num
            div.setAttribute('lottery', `r_${num}`)
            redBallContainer.append(div)
            return {
                num,
                el: div,
            }
        })
        this.allBlues = Array(16).fill().map((_, i) => i + 1).map(num => {
            const div = document.createElement('div')
            div.textContent = num
            div.setAttribute('lottery', `b_${num}`)
            blueBallContainer.append(div)
            return {
                num,
                el: div,
            }
        })
        this.el = root
        root.addEventListener('click', this.clickListener = (e) => {
            const target = e.target
            const info = e.target.getAttribute('lottery')
            if (info) {
                const [type, num] = info.split('_')
                if (!target.classList.contains('active')) {
                    if (type === 'r' && this.reds.length < 6) {
                        target.classList.add('active')
                        this.reds.push(num)
                    } else if (type === 'b') {
                        this.allBlues.map(({ el }) => {
                            if (el !== target) {
                                el.classList.remove('active')
                            }
                        })
                        target.classList.add('active')
                        this.blue = num
                    }
                } else {
                    target.classList.remove('active')
                    if (type === 'r') {
                        this.reds.splice(this.reds.indexOf(num), 1)
                    } else if (type === 'b') {
                        this.blue = ''
                    }
                }
            }
        })
    }

    getSelect() {
        if (this.reds.length === 6 && this.blue) {
            return new SsqLottery(this.reds, this.blue, this.code)
        }
    }

    destory() {
        this.el.removeEventListener('click', this.clickListener)
        this.allReds = []
        this.allBlues = []
    }

}

class LotteryController {


    latest = []
    selector

    constructor() {
        this.init()
    }

    async init() {
        // <div class="lottery-container">
        //     <div class="lottery-select">
        //         <div class="lottery-view">
        //             <div class="lottery-selectarea"></div>
        //             <div class="lottery-btn">
        //                 <button>查验</button>
        //             </div>
        //         </div>
        //         <div class="lottery-list"></div>
        //     </div>
        //     <div class="lottery-latest"></div>
        // </div>
        const latestRoot = document.querySelector('.lottery-container .lottery-latest')
        const selector = document.querySelector('.lottery-container .lottery-select .lottery-view .lottery-selectarea')

        this.selector = new LotterySelector()
        selector.append(this.selector.el)


        const resp = await (await fetch('https://api-next.ikrong.com/ex/lottery/list/latest')).json()
        this.latest = resp.data.map(item => {
            const reds = item.num.split(',')
            const blue = reds.pop()
            LotteryStore.set(item.code, { reds, blue })

            const div = document.createElement('div')
            div.classList.add('lottery-info')
            div.innerHTML = `<div class="lottery-code">${item.code}</div>
            <div class="lottery-number">
                ${reds.map(num=>`<div class="red-ball">${num}</div>`)}
                <div class="blue-ball">${blue}</div>
            </div>
            `
            latestRoot.append(div)
            return {
                el: div,
                reds,
                blue,
                code: item.code,
            }
        })
    }



}


new LotteryController()