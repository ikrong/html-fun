import './style.scss'

/**砖块状态 */
class MineCube {
  isBumb = false;
  isOpen = false;
  isFlag = false;
  around = 0;

  x = 0;
  y = 0;

  game = null;
  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.game = game;
  }

  get id() {
    return this.game.getId(this.x, this.y);
  }
}

/**地图状态及控制 */
class MineMap {
  map = [];
  width = 0;
  height = 0;
  level = 10;
  finish = false;

  constructor(width, height, level) {
    this.width = width;
    this.height = height;
    this.level = level;
  }

  generate() {
    for (let n = 0; n < this.height; n++) {
      for (let i = 0; i < this.width; i++) {
        const cube = new MineCube(i, n, this);
        this.map.push(cube);
        cube.isBumb = Math.ceil(Math.random() * 100) <= this.level;
      }
    }
  }

  getCube(x, y) {
    const id = this.getId(x, y);
    return this.map[id];
  }

  getId(x, y) {
    if (x < 0 || x >= this.width) return;
    if (y < 0 || y >= this.height) return;
    return x + this.width * y;
  }

  getNineGrid(x, y) {
    // prettier-ignore
    const nine = [
      [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
      [x - 1, y], [x, y], [x + 1, y],
      [x - 1, y + 1], [x, y + 1], [x + 1, y + 1],
    ]
    return nine.map(([x, y]) => {
      return this.getCube(x, y);
    });
  }

  calcAround() {
    this.map.map((cube) => {
      if (!cube.isBumb) {
        const nine = this.getNineGrid(cube.x, cube.y);
        nine.splice(4, 1);
        cube.around = nine.filter(Boolean).reduce((total, cube) => {
          return total + (cube.isBumb ? 1 : 0);
        }, 0);
      }
    });
  }

  isEmpty(x, y) {
    const cube = this.map[this.getId(x, y)];
    return !cube.isBumb && cube.around === 0;
  }

  findEmpty(x, y, arr = []) {
    const [, b, , d, , f, , h] = this.getNineGrid(x, y);
    [, b, , d, f, , h].filter(Boolean).map((cube) => {
      if (cube.isOpen) return;
      if (cube.isFlag) return;
      if (cube.isBumb) return;
      if (arr.includes(cube)) return;
      arr.push(cube);
      if (this.isEmpty(cube.x, cube.y)) {
        this.findEmpty(cube.x, cube.y, arr);
      }
    });
    return arr;
  }

  open(x, y) {
    let cube = this.map[this.getId(x, y)];
    if (cube.isOpen || cube.isFlag) return;
    if (
      !this.map.some((cube) => cube.isOpen) &&
      this.map.some((cube) => !cube.isBumb)
    ) {
      while (this.map[this.getId(x, y)].isBumb) {
        this.map.unshift(this.map.pop());
        for (let h = 0; h < this.height; h++) {
          for (let w = 0; w < this.width; w++) {
            const cube = this.getCube(w, h)
            cube.x = w
            cube.y = h
          }
        }
        this.calcAround();
      }
      cube = this.map[this.getId(x, y)];
    }
    // 打开是炸弹，则结束
    if (cube.isBumb) {
      this.finish = true;
      cube.isOpen = true;
      return false;
    }
    // 打开是空白，则需要展开上下和左右
    if (this.isEmpty(x, y)) {
      const emptyCubes = this.findEmpty(x, y);
      cube.isOpen = true;
      emptyCubes.map((cube) => {
        cube.isOpen = true;
      });
      return true;
    }
    // 打开是数字，则只打开这个
    if (cube.around > 0) {
      cube.isOpen = true;
      return true;
    }
  }

  /**判断是否游戏结束，结束且成功返回true失败返回false 未结束返回null */
  isGameOver() {
    // 结束则cube状态
    // 炸弹且被标记 true
    // 炸弹且被打开 false
    // 空白且被打开 true
    // 数字且被打开 true
    const status = this.map.map((cube) => {
      if (cube.isBumb && cube.isOpen) return false;
      if (cube.isBumb && cube.isFlag) return true;
      if (cube.isFlag) return null;
      if (cube.isOpen) return true;
      return null;
    });
    if (status.some((s) => s === false)) return false;
    if (status.some((s) => s === null)) return null;
    return true;
  }
}

/**UI控制 */
class MineGame {
  map;
  rootEl;
  logEl;
  width;
  height;

  constructor(width, height, level) {
    this.width = width;
    this.height = height;
    this.map = new MineMap(width, height, level);
    this.map.generate();
    this.map.calcAround();

    this.rootEl = document.createElement("div");
    this.rootEl.classList.add("mine-game");
    this.rootEl.style.gridTemplate = `repeat(${this.height}, 30px)/repeat(${this.width}, 30px)`;

    this.logEl = document.createElement("div");
    this.logEl.classList.add("mine-log");

    document.querySelector(".game").append(this.rootEl);
    document.querySelector(".game").append(this.logEl);

    this.log(
      `游戏地图:${width}*${height} 难度水平:${level} 砖块数量:${width * height
      } 炸弹数量:${this.map.map.filter((a) => a.isBumb).length}`
    );

    this.rootEl.addEventListener("click", (e) => {
      if (this.map.finish) return this.log("游戏已经结束");
      if (e.target.getAttribute("data-x") === null) return;
      const x = +e.target.getAttribute("data-x");
      const y = +e.target.getAttribute("data-y");
      const result = this.map.open(x, y);
      if (result === false) {
        this.log("触及炸弹，游戏结束");
        this.render();
      } else if (result) {
        this.render();
      }
    });

    this.rootEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (this.map.finish) return this.log("游戏已经结束");
      if (e.target.getAttribute("data-x") === null) return;
      const x = +e.target.getAttribute("data-x");
      const y = +e.target.getAttribute("data-y");
      const cube = this.map.getCube(x, y);
      if (cube.isOpen) return;
      if (cube.isFlag) {
        cube.isFlag = false;
      } else {
        cube.isFlag = true;
      }
      this.render();
    });

    this.render();
  }

  log(txt) {
    const log = document.createElement("div");
    log.innerHTML = txt;
    this.logEl.prepend(log);
  }

  render() {
    const status = this.map.isGameOver();
    this.rootEl.innerHTML = "";

    if (status === false) {
      this.rootEl.classList.add("game-over");
      this.log("失败");
    } else if (status === true) {
      this.rootEl.classList.add("game-complete");
      this.log("获胜");
    }
    this.map.map.map((cube) => {
      const cubeEl = document.createElement("div");
      cubeEl.classList.add("mine-cube");
      cubeEl.setAttribute("data-x", cube.x);
      cubeEl.setAttribute("data-y", cube.y);

      if (cube.isOpen && cube.isBumb) {
        cubeEl.classList.add("cube-danger");
      } else if (cube.isOpen) {
        cubeEl.classList.add("cube-open");
        if (cube.around > 0) {
          cubeEl.innerText = cube.around;
        }
      } else if (cube.isFlag) {
        cubeEl.classList.add("cube-flag");
      }

      this.rootEl.appendChild(cubeEl);
    });
  }

  destory() {
    this.rootEl.remove();
    this.logEl.remove();
    this.rootEl = null;
    this.logEl = null;
    this.map = null;
    document.querySelector(".game").innerHTML = "";
  }
}

// 表单控制
let game = null;
let form = document.getElementById("form");
form.size.value = "9*6";
form.level.value = "10";
if (localStorage.getItem("mine-game")) {
  const { size, level } = JSON.parse(localStorage.getItem("mine-game"));
  form.size.value = size;
  form.level.value = level;
}
form.begin.addEventListener("click", () => generateGame());

function generateGame() {
  game && game.destory();
  const [width, height] = form.size.value.split("*");
  const level = form.level.value;
  localStorage.setItem(
    "mine-game",
    JSON.stringify({
      size: form.size.value,
      level: form.level.value,
    })
  );
  game = new MineGame(+width, +height, +level);
}

// 开始一个游戏
generateGame();
