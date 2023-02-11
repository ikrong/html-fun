import './style.scss'
// 俄罗斯方块
// 地图大小 10*20
// 每次随机使用四个方块生成 S、Z、L、I、O、T 等形状
// prettier-ignore

// 预设拼图形状
const Shapes = [
  [[1, 1], [1, 1]], // O
  [[0, 1, 1], [1, 1, 0]],// S
  [[1, 1, 0], [0, 1, 1]],// Z
  [[1, 0], [1, 0], [1, 1]],// L
  [[0, 1], [0, 1], [1, 1]],// 倒 L
  [[1], [1], [1], [1]],// I
  [[1, 1, 1], [0, 1, 0]],// T
]
const MapSize = { width: 12, height: 20 };
const CubeSize = 20;
const Colors = [
  "#70dcbb",
  "#94cce9",
  "#f37c85",
  "#ffce82",
  "#e5b8f0",
  "#7296cb",
];

function sleep(timeout) {
  return new Promise((r) => setTimeout(r, timeout));
}

class TetrisEvent {
  _fns = {};

  on(name, cb) {
    this._fns[name] = this._fns[name] || [];
    this._fns[name].push(cb);
  }

  off(name, cb) {
    const i = (this._fns[name] || []).indexOf(cb);
    if (i !== -1) {
      this._fns[name].splice(i, 1);
    }
  }

  emit(name, ...data) {
    const fns = this._fns[name] || [];
    fns.map((fn) => fn(...data));
  }
}

class TetrisCube {
  x;
  y;
  disappear;
  el;
  color;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // 渲染方块
  render() {
    if (!this.el) {
      const div = document.createElement("div");
      div.classList.add("tetris-item");
      this.el = div;
    }
    this.el.setAttribute("x", this.x);
    this.el.setAttribute("y", this.y);
    Object.assign(this.el.style, {
      width: `${CubeSize}px`,
      height: `${CubeSize}px`,
      left: `${this.x * CubeSize}px`,
      top: `${this.y * CubeSize}px`,
      opacity: this.disappear ? 0 : 1,
      backgroundColor: `${this.color}`,
    });
    return this.el;
  }

  destory() {
    this.el.remove();
  }
}

class TetrisShape {
  shape = [];
  center;
  map;
  merged = false;
  color;
  constructor(map) {
    this.map = map;
    this.color = Colors[Math.floor(Math.random() * (Colors.length - 1))];
    this.init();
  }

  // 根据预设随机生成一种拼图形状
  init() {
    const i = Math.round(Math.random() * (Shapes.length - 1));
    const shape = Shapes[i];
    const center = { x: 5, y: -1 };
    this.center = center;
    const startPos = {
      x: center.x - Math.floor(shape[0].length / 2),
      y: center.y - (shape.length - 1),
    };
    for (let dy = 0; dy < shape.length; dy++) {
      for (let dx = 0; dx < shape[dy].length; dx++) {
        if (shape[dy][dx]) {
          const cube = new TetrisCube(startPos.x + dx, startPos.y + dy);
          cube.color = this.color;
          this.shape.push(cube);
        }
      }
    }
  }

  // 计算旋转并保证不会偏离地图的最小偏移量
  turnFixDelta() {
    const xlist = this.shape.map((cube) => {
      const { x, y } = this.rotate(cube, this.center);
      return x;
    });
    if (Math.min(...xlist) < 0) {
      return -1 * Math.min(...xlist);
    } else if (Math.max(...xlist) > this.map.width - 1) {
      return -1 * (Math.max(...xlist) - (this.map.width - 1));
    } else return 0;
  }

  // 旋转
  turn() {
    if (this.merged) return;
    const dx = this.turnFixDelta();
    if (
      !this.shape.some((cube) => {
        const { x, y } = this.rotate(cube, this.center);
        // prettier-ignore
        return this.checkExist(x + dx, y) || (x + dx < 0 || x + dx > this.map.width - 1 || y > this.map.height - 1);
      })
    ) {
      this.shape.map((cube) => {
        const { x, y } = this.rotate(cube, this.center);
        cube.x = x + dx;
        cube.y = y;
      });
    }
  }

  // 左移
  left() {
    if (this.merged) return;
    if (
      !this.shape.some(
        // prettier-ignore
        (cube) => this.checkExist(cube.x - 1, cube.y) || cube.x - 1 < 0
      )
    ) {
      this.shape.map((cube) => (cube.x -= 1));
      this.center.x -= 1;
    }
  }

  // 右移
  right() {
    if (this.merged) return;
    if (
      !this.shape.some(
        // prettier-ignore
        (cube) => this.checkExist(cube.x + 1, cube.y) || cube.x + 1 > this.map.width - 1
      )
    ) {
      this.shape.map((cube) => (cube.x += 1));
      this.center.x += 1;
    }
  }

  // 向下移动
  down() {
    if (this.merged) return;
    if (
      !this.shape.some(
        // prettier-ignore
        (cube) => this.checkExist(cube.x, cube.y + 1) || cube.y + 1 > this.map.height - 1
      )
    ) {
      this.shape.map((cube) => (cube.y += 1));
      this.center.y += 1;
    } else {
      this.merged = true;
    }
  }

  // 根据坐标判断方块是否存在
  checkExist(x, y) {
    return !!this.map.map.find(
      (cube) => !this.shape.includes(cube) && cube.x === x && cube.y === y
    );
  }

  // prettier-ignore
  rotate(pos, origin) {
    const cos = Math.cos(Math.PI / 2);
    const sin = Math.sin(Math.PI / 2);
    const x = Math.round(origin.x + (pos.x - origin.x) * cos - (pos.y - origin.y) * sin);
    const y = Math.round(origin.y + (pos.x - origin.x) * sin - (pos.y - origin.y) * cos);
    return { x, y };
  }
}

class TetrisGame extends TetrisEvent {
  map = [];
  width = MapSize.width;
  height = MapSize.height;
  shape;
  nextShape;
  timer;
  timeout = 1000;
  rootEl;
  nextShapeEl;
  finish;
  score;

  constructor() {
    super();
    // 监听键盘按钮动作
    document.addEventListener("keydown", (e) => {
      if (!this.shape && this.shape.merged) return;
      switch (e.code) {
        case "ArrowUp":
          this.shape.turn();
          break;
        case "ArrowLeft":
          this.shape.left();
          break;
        case "ArrowRight":
          this.shape.right();
          break;
        case "ArrowDown":
          if (this.timeout !== 100) {
            clearTimeout(this.timer);
            this.timer = null;
            this.timeout = 100;
            this.run();
          }
          break;
      }
      this.render();
    });
    document.addEventListener("keyup", (e) => {
      this.timeout = 1000;
      if (!this.shape && this.shape.merged) return;
    });
    this.run();
  }

  run() {
    if (!this.timer) {
      this.move();
    }
    clearTimeout(this.timer);
    if (this.finish) return;
    this.timer = setTimeout(async () => {
      if (this.finish) return;
      await this.move();
      this.run();
    }, this.timeout);
  }

  // 根据坐标获取方块
  getCube(x, y) {
    return this.map.find((cube) => cube.x === x && cube.y === y);
  }

  // 定时向下循环移动方块
  async move() {
    if (this.finish) return
    // prettier-ignore
    if (!this.shape || (this.shape && this.shape.merged)) {
      await this.erase();
      if (this.nextShape) {
        this.shape = this.nextShape;
      } else {
        this.shape = new TetrisShape(this);
      }
      this.nextShape = new TetrisShape(this);
      this.renderNextShape();

      this.map.push(...this.shape.shape);
      this.shape.down();
    } else {
      this.shape.down();
    }

    // prettier-ignore
    if (this.shape.center.y === -1) {
      this.finish = true;
      this.emit("gameover");
    }

    this.render();
  }

  // 获取垂直方向所有方块
  getVertical(x) {
    return Array(this.height)
      .fill()
      .map((_, i) => this.getCube(x, i));
  }

  // 获取水平方向所有方块
  getHorizon(y) {
    return Array(this.width)
      .fill()
      .map((_, i) => this.getCube(i, y));
  }

  // 检查垂直方向方块是否都存在
  checkVertical(x) {
    return !this.getVertical(x).some((cube) => !cube);
  }

  // 检查水平方向方块是否都存在
  checkHorizon(y) {
    return !this.getHorizon(y).some((cube) => !cube);
  }

  // 消除水平方向连成直线的方块，同时将上方方块平移下来
  async erase() {
    const yIndex = [];
    for (let h = 0; h < this.height; h++) {
      if (this.checkHorizon(h)) {
        yIndex.push(h);
      }
    }

    if (!yIndex.length) return;

    yIndex.reverse();

    for (let i = 0; i < yIndex.length; i++) {
      this.getHorizon(yIndex[i]).map((cube) => (cube.disappear = true));
      this.render();
      await sleep(200);
    }

    this.map = this.map.filter((cube) => {
      if (yIndex.includes(cube.y)) {
        cube.destory();
        return false;
      } else {
        cube.y += yIndex.filter((i) => i > cube.y).length;
        return true;
      }
    });

    this.score = this.score || 0;
    this.score += 100 * yIndex.length + (yIndex.length > 1 ? 50 : 0);

    this.emit("score", this.score);

    this.render();
  }

  // 加载游戏到界面
  mount(el) {
    this.rootEl = document.createElement("div");
    this.rootEl.classList.add("tetris-game");
    Object.assign(this.rootEl.style, {
      width: `${this.width * CubeSize + 2}px`,
      height: `${this.height * CubeSize + 2}px`,
    });
    const lines = document.createDocumentFragment();

    for (let h = 1; h < this.height; h++) {
      const div = document.createElement("div");
      div.classList.add("tetris-line");
      Object.assign(div.style, {
        top: `${h * CubeSize}px`,
        left: 0,
        width: "100%",
        height: "1px",
      });
      lines.append(div);
    }

    for (let w = 1; w < this.width; w++) {
      const div = document.createElement("div");
      div.classList.add("tetris-line");
      Object.assign(div.style, {
        left: `${w * CubeSize}px`,
        top: 0,
        height: "100%",
        width: "1px",
      });
      lines.append(div);
    }

    this.rootEl.append(lines);
    el.append(this.rootEl);

    // next shape
    const nextShapeBoxWrap = document.createElement("div");
    nextShapeBoxWrap.classList.add("tetris-next-shape-wrap");

    const nextShapebox = document.createElement("div");
    nextShapebox.classList.add("tetris-next-shape");
    this.nextShapeEl = nextShapebox;
    nextShapeBoxWrap.append(nextShapebox);
    el.append(nextShapeBoxWrap);
  }

  // 渲染提示下一个即将出现的方块
  renderNextShape() {
    const cubes = this.nextShape.shape;
    this.nextShapeEl.innerHTML = "";
    const start = cubes.reduce(
      (data, cube) => {
        data.x = Math.min(cube.x, data.x);
        data.y = Math.min(cube.y, data.y);
        return data;
      },
      { x: 4, y: 4 }
    );
    const end = cubes.reduce(
      (data, cube) => {
        data.x = Math.max(cube.x, data.x);
        data.y = Math.max(cube.y, data.y);
        return data;
      },
      { x: -4, y: -4 }
    );
    Object.assign(this.nextShapeEl.style, {
      width: `${((end.x - start.x + 1) * CubeSize) / 2}`,
      height: `${((end.y - start.y + 1) * CubeSize) / 2}`,
    });
    cubes.map((cube) => {
      const div = document.createElement("div");
      div.classList.add("tetris-item");
      Object.assign(div.style, {
        width: `${CubeSize / 2}px`,
        height: `${CubeSize / 2}px`,
        top: `${((cube.y - start.y) * CubeSize) / 2}px`,
        left: `${((cube.x - start.x) * CubeSize) / 2}px`,
      });
      this.nextShapeEl.append(div);
    });
  }

  // 渲染游戏所有方块
  render() {
    this.map.map((cube) => {
      const el = cube.render();
      if (!this.rootEl.contains(el)) {
        this.rootEl.append(el);
      }
    });
  }
}

const game = new TetrisGame();
game.mount(document.querySelector(".game-container"));
game.on("score", (score) => {
  document.querySelector(".game-score .score").textContent = score;
});
game.on("gameover", () => {
  document.querySelector(".game-score .game-score-txt").textContent =
    "游戏结束，得分";
});
