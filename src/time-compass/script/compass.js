/**
 * @author ikrong.com
 * @description 生成罗盘
 */
export class Compass {
    _dom = null
    _num = 0
    _list = []
    _center = [0, 0]
    _radius = 0
    _rotate = 0
    _rotateIndex = 0
    constructor(
        /** 间隔数量 */
        num,
        radius,
    ) {
        this._dom = document.createElement('div')
        document.body.append(this._dom)
        this._setStyle(this._dom, {
            userSelect: 'none',
        })
        this._num = num
        this._radius = radius

        this._split()
        this._getPos()
    }
    /**
     * 根据数量分割罗盘
     */
    _split() {
        for (let i = 0; i < this._num; i++) {
            let slice = document.createElement('div')
            this._list.push(slice)
            this._dom.append(slice)
        }
    }
    /**
     * 计算罗盘指针角度
     */
    _getPos() {
        let {
            innerWidth,
            innerHeight
        } = window
        this._center = [innerWidth / 2, innerHeight / 2]
        this._setStyle(this._dom, {
            position: 'fixed',
            top: this._center[1] - 7 + 'px',
            left: this._center[0] + this._radius + 'px'
        })
        this.each((dom, i) => {
            this._setStyle(dom, {
                position: 'absolute',
                top: -50 + '%',
                left: 0,
                transformOrigin: `-${this._radius}px center`,
                transform: `rotate(${360 / this._num * i + this._rotate}deg)`,
                transition: "transform 0.5s ease-in-out,color 0.8s 0.2s ease-out",
                color: this._rotateIndex == i ? '#ccc' : '#333',
                fontWeight: this._rotateIndex == i ? 'bold' : 'normal',
            })
        })
    }

    /**
     * 设置dom样式
     */
    _setStyle(dom, obj) {
        Object.assign(dom.style, obj)
    }

    /**
     * 罗盘指针循环
     */
    each(cb) {
        this._list.map(cb)
        return this;
    }

    /**
     * 设置大小
     */
    setSize(width, height) {
        width && this.each(dom => dom.style.width = `${width}px`)
        height && this.each(dom => dom.style.height = `${height}px`)
        return this;
    }
    /**
     * 旋转罗盘至某个指针的序号，从1开始 
     */
    rotateTo(index) {
        if (this._rotateIndex == index - 1) return this._getPos()
        if (index == 1) {
            this.each((dom, i) => this._setStyle(dom, {
                transition: "none",
            }))
            this.each((dom, i) => this._setStyle(dom, {
                transform: `rotate(${360 / this._num * i + 360 + this._rotate}deg)`,
            }))
        }
        setTimeout(() => {
            if (index == 1) {
                this.each((dom, i) => this._setStyle(dom, {
                    transition: "transform 0.5s ease-in-out,color 0.8s 0.2s ease-out",
                }))
            }
            this._rotateIndex = index - 1
            this._rotate = -360 / this._num * this._rotateIndex
            this._getPos()
        }, index == 1 ? 500 : 0)
    }
}