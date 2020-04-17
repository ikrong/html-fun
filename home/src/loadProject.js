export class LoadProject {
    proj = document.createElement('div')
    cloneProj
    dir
    progressNow = 0
    t
    interval

    constructor(proj) {
        this.proj = proj
        this.init()
    }

    init() {
        this.copy()
        this.fetch()
    }

    progress(progress) {
        return new Promise(r => {
            if (this.t) {
                this.t.pause()
                this.t = null
            }
            let target = {
                progress: this.progressNow,
            }
            this.t = new TWEEN.Tween(target)
                .to({
                    progress: progress
                }, 1000)
                .onUpdate(() => {
                    let path = document.querySelector('#projprogress path')
                    path.setAttribute('d', `M0,0 ${target.progress},0 ${target.progress},1 0,1 Z`)
                    this.progressNow = target.progress
                })
                .onComplete(r)
                .start()
        })
    }

    copy() {
        if (!this.proj) return;
        document.body.style.pointerEvents = 'none'
        this.progress(0)
        let position = this.proj.getBoundingClientRect()
        let dir = this.proj.getAttribute('data-project')
        this.dir = dir
        // 复制项目dom
        let cloneProj = this.proj.cloneNode(true)
        this.cloneProj = cloneProj
        this.proj.parentElement.append(cloneProj)
        cloneProj.classList.add('clone')
        Object.assign(cloneProj.style, {
            top: position.top,
            left: position.left,
        })
        // 复制背景
        let bg = cloneProj.querySelector('.bg')
        let bg2 = bg.cloneNode()
        bg2.classList.add('clone')
        cloneProj.append(bg2)
        // 设置加载文字
        let name = cloneProj.querySelector('.name')
        name.innerHTML = '加载中...'

        // document.body.style.pointerEvents = 'auto'
    }

    // 请求文件
    fetch() {
        let href = `./${this.dir}`
        let progress = 0
        fetch(href).then(resp => {
            if (resp.status == 200) {
                return resp.text()
            } else {
                throw new Error()
            }
        }).then((data) => {
            clearInterval(this.interval)
            this.progress(1).then(() => {
                console.log('进度条结束')
                document.body.style.pointerEvents = 'auto'
                this.cloneProj.remove()
                // document.write(data)
                location.href = href
            })
        }, () => {
            clearInterval(this.interval)
            this.progress(0).then(() => {
                document.body.style.pointerEvents = 'auto'
                this.cloneProj.remove()
            })
        })
        this.interval = setInterval(() => {
            let num = (progress += progress == 90 ? 0.1 : 1) / 100
            console.log(num)
            this.progress(num)
        }, 1000)
    }

}