/**获取文件名 */
function getFileName(file) {
    return file.split('.').shift()
}

/**获取文件后缀 */
function getFileExt(file) {
    return file.slice(
        (file.lastIndexOf('.') >>> 0) + 1
    ).toLowerCase()
}

module.exports = {
    getFileName,
    getFileExt
}