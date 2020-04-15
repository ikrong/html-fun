/**
 * @author ikrong.com
 * @description 数字转为汉字
 */

export function numberToChinese(number) {
    var a = (number + '').split(''),
        s = [],
        t = {
            units: '个十百千万@#%亿^&~',
            chars: '零一二三四五六七八九',
        };
    if (a.length > 12) {
        throw new Error('too big');
    } else {
        for (var i = 0, j = a.length - 1; i <= j; i++) {
            if (j == 1 || j == 5 || j == 9) { //两位数 处理特殊的 1*
                if (i == 0) {
                    if (a[i] != '1') s.push(t.chars.charAt(a[i]));
                } else {
                    s.push(t.chars.charAt(a[i]));
                }
            } else {
                s.push(t.chars.charAt(a[i]));
            }
            if (i != j) {
                s.push(t.units.charAt(j - i));
            }
        }
    }
    //return s;
    return s.join('').replace(/零([十百千万亿@#%^&~])/g, function (m, d, b) { //优先处理 零百 零千 等
        b = t.units.indexOf(d);
        if (b != -1) {
            if (d == '亿') return d;
            if (d == '万') return d;
            if (a[j - b] == '0') return '零'
        }
        return '';
    }).replace(/零+/g, '零').replace(/零([万亿])/g, function (m, b) { // 零百 零千处理后 可能出现 零零相连的 再处理结尾为零的
        return b;
    }).replace(/亿[万千百]/g, '亿').replace(/[零]$/, '').replace(/[@#%^&~]/g, function (m) {
        return {
            '@': '十',
            '#': '百',
            '%': '千',
            '^': '十',
            '&': '百',
            '~': '千'
        }[m];
    }).replace(/([亿万])([一-九])/g, function (m, d, b, c) {
        c = t.units.indexOf(d);
        if (c != -1) {
            if (a[j - c] == '0') return d + '零' + b
        }
        return m;
    }) || '零';
}