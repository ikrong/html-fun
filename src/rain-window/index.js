import './style.scss'

class Rain {
    _dropNum = 50

    constructor(num = (window.innerWidth * window.innerHeight / (60 * 60) * 0.16 >>> 0)) {
        this._dropNum = num
        this._create()
    }

    _random(max = 100) {
        return Math.random() * max >> 0
    }

    _create() {
        Array(this._dropNum).fill('').map((_, i) => {
            let width = this._random(30)
            let top = this._random(100)
            let left = this._random(100)
            let bubble = document.createElement('div')
            let timer = this._random(20)
            bubble.classList.add('bubble')
            Object.assign(bubble.style, {
                width: width + 'px',
                height: width + 'px',
                top: top + '%',
                left: left + '%',
            })
            setTimeout(() => {
                document.querySelector('.rain-glass .rain-box').append(bubble)
            }, timer * 1000);
        })
    }
}

new Rain()