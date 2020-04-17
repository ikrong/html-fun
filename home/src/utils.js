
export function checkDomVisible(dom = document.createElement('div')) {
    let rect = dom.getBoundingClientRect()
    if (rect.y < window.innerHeight && (rect.y + rect.height) > 0) {
        return true
    } else {
        return false
    }
}

export function loadImage(src = '') {
    return new Promise((r, j) => {
        let img = document.createElement('img')
        img.onload = r
        img.onerror = j
        img.src = src
    })
}

export function genColor(text) {
    let color = [
        { bg: '#55efc4' },
        { bg: '#74b9ff' },
        { bg: '#a29bfe' },
        { bg: '#6c5ce7' },
        { bg: '#00cec9' },
        { bg: '#00b894' },
        { bg: '#ff7675' },
        { bg: '#d63031' },
        { bg: '#e17055' },
        { bg: '#fdcb6e' },
    ];
    let total = String(text)
        .split('').map((a, i) => a.charCodeAt(0) * (i + 1))
        .reduce((total, a) => total + (a || 0), 0)
    return color[total % (color.length - 1)].bg
}
