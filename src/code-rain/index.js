import './style.scss'


let text = [1, 0, 2, 4]
let fontSize = 14;

let canvas = document.querySelector('canvas')
let context = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let pipe = [];
let textIndex = []
let columns = canvas.width / fontSize;
for (let i = 0; i < columns; i++) {
    pipe[i] = 1;
    textIndex[i] = 0;
}

setInterval(() => {
    context.fillStyle = "rgba(0, 0, 0, 0.1)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "green";
    context.font = `${fontSize}px Verdana`;

    for (let i = 0; i < columns; i++) {
        context.fillText(text[textIndex[i]], i * fontSize, pipe[i] * fontSize);
        textIndex[i]++
        if (textIndex[i] > text.length - 1) {
            textIndex[i] = 0
        }
        if (pipe[i] * fontSize > (canvas.height * 2 / 3) && Math.random() > 0.9) {
            pipe[i] = 0;
        }
        pipe[i]++;
    }
}, 50);