import './style.scss'
// 开心消消乐
// 横、竖方向上，连续超过3个或3个以上一样则消除，
// 消除后上方下落，同时空白处随机填充
// 地图暂定为 9 * 12

const FillString = ["🐵", "🐶", "🐸", "🐷", "🐼"];
const CubeSize = 40;
const CubeGap = 5;
const TransitionDuration = 500;
const GameTimeout = 60; // 1分钟

function sleep(timeout = TransitionDuration) {
  return new Promise((r) => setTimeout(r, timeout));
}

class FunFestEvent {
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

class FunFestCube {
  x;
  y;
  fill;
  selected;
  willDestoryed;
  destoryed;
  game;
  el;
  constructor(x, y, fill, game) {
    this.x = x;
    this.y = y;
    this.fill = fill;
    this.game = game;
  }

  // 判断是否可以消除
  canErase() {
    return this.game.canErase(this.x, this.y);
  }

  // 设置填充
  setFill(fill) {
    this.fill = fill;
  }

  // 销毁
  destory() {
    this.el.remove();
    this.destoryed = true;
  }

  // 渲染
  render() {
    if (!this.el) {
      const div = document.createElement("div");
      div.classList.add("game-item");
      this.el = div;
    }
    this.el.textContent = this.fill;
    this.el.setAttribute("x", this.x);
    this.el.setAttribute("y", this.y);
    if (this.selected) {
      this.el.classList.add("selected");
    } else {
      this.el.classList.remove("selected");
    }
    Object.assign(this.el.style, {
      top: `${this.y * (CubeSize + CubeGap)}px`,
      left: `${this.x * (CubeSize + CubeGap)}px`,
      width: `${CubeSize}px`,
      height: `${CubeSize}px`,
      opacity: this.willDestoryed ? 0 : 1,
      transitionDuration: `${TransitionDuration}ms`,
    });
    return this.el;
  }
}

class FunFestGame extends FunFestEvent {
  width;
  height;
  rootEl;
  map;
  score = 0;
  finish = false;
  timeout = GameTimeout;
  constructor(width = 9, height = 9) {
    super();
    this.width = width;
    this.height = height;
    this.rootEl = document.createElement("div");
    this.rootEl.classList.add("game-container");
    Object.assign(this.rootEl.style, {
      width: `${width * (CubeSize + CubeGap) - CubeGap}px`,
      height: `${height * (CubeSize + CubeGap) - CubeGap}px`,
    });

    let preCube = null;
    let processing = false;
    // 点击事件
    this.rootEl.addEventListener("click", async (e) => {
      if (this.finish) return;
      if (processing) return;
      if (e.target.classList.contains("game-item")) {
        const x = +e.target.getAttribute("x");
        const y = +e.target.getAttribute("y");
        const cube = this.getCube(x, y);
        let erase = [];
        // prettier-ignore
        if (!preCube) {
          cube.selected = true
          preCube = cube
        } else if (preCube!=cube && (
          (Math.abs(preCube.x-cube.x)===0&&Math.abs(preCube.y-cube.y)===1) ||
          (Math.abs(preCube.x-cube.x)===1&&Math.abs(preCube.y-cube.y)===0)
        )) {
          if (this.checkErase(preCube.x,preCube.y,cube.x,cube.y)) {
            erase.push(cube, preCube)
            preCube.selected=false
            preCube=null
          } else {
            preCube.selected=false
            preCube=cube
            cube.selected=true
          }
        } else {
          preCube.selected = false
          preCube = cube
          cube.selected = true
        }
        await this.render();
        if (erase.length) {
          processing = true;
          erase.sort((a, b) => (a.x < b.x || a.y < b.y ? -1 : 1));
          for (let i = 0; i < erase.length; i++) {
            await this.erase(erase[i].x, erase[i].y);
          }
          for (;;) {
            const cube = this.findErase();
            if (cube) {
              await this.erase(cube.x, cube.y);
            } else {
              break;
            }
          }
          processing = false;
        }
      }
    });

    this.generate();

    const interval = setInterval(() => {
      this.emit("timeupdate", --this.timeout);
      if (this.timeout == 0) {
        clearInterval(interval);
        this.finish = true;
        this.emit("end");
      }
    }, 1000);
  }

  dEdge = [
    { dx: 0, dy: -1 }, // 上
    { dx: 0, dy: 1 }, // 下
    { dx: -1, dy: 0 }, // 左
    { dx: 1, dy: 0 }, // 右
  ];

  // 装载游戏界面
  mount(el) {
    el.append(this.rootEl);
  }

  // 根据坐标获取方块
  getCube(x, y) {
    return this.map.find((cube) => cube.x === x && cube.y === y);
  }

  // 根据坐标判断方块是否可以消除
  canErase(x, y) {
    const { count } = this.findSame(x, y);
    if (count[0] + count[1] + 1 >= 3) return true;
    else if (count[2] + count[3] + 1 >= 3) return true;
    else return false;
  }

  // 根据坐标检索上下左右四周相邻相同的方块
  findSame(x, y) {
    const xsames = [];
    const ysames = [];
    const count = [];
    const currentCube = this.getCube(x, y);
    this.dEdge.map(({ dx, dy }, i) => {
      let cube = this.getCube(x + dx, y + dy);
      count[i] = 0;
      while (cube && cube.fill === currentCube.fill) {
        if (dx === 0) {
          ysames.push(cube);
          dy += dy < 0 ? -1 : 1;
        } else {
          xsames.push(cube);
          dx += dx < 0 ? -1 : 1;
        }
        count[i]++;
        cube = this.getCube(x + dx, y + dy);
      }
    });
    return { xsames, ysames, count };
  }

  // 根据字符串随机获取一个填充
  getRandomFill(fills = FillString) {
    return fills[Math.round(Math.random() * (fills.length - 1))];
  }

  // 根据坐标获取紧邻的四周的方块
  getEdgeCube(x, y) {
    return this.dEdge.map((dx, dy) => this.getCube(x + dx, y + dy));
  }

  // 获取四周填充的图案
  getEdgeFill(x, y) {
    return this.getEdgeCube(x, y)
      .filter(Boolean)
      .map((cube) => cube.fill)
      .filter((fill, i, arr) => arr.indexOf(fill) === i);
  }

  // 获取不同于四周的图案
  getEdgeDiffFill(x, y) {
    const fills = this.getEdgeFill(x, y);
    return FillString.filter((fill) => !fills.includes(fill));
  }

  // 检查两个方块是否可以交换，如果交换后方块之一可以消除则是可以交换的
  // prettier-ignore
  checkErase(x1, y1, x2, y2) {
    const cube1 = this.getCube(x1, y1);
    const cube2 = this.getCube(x2, y2);
    [cube1.fill, cube2.fill] = [cube2.fill, cube1.fill];
    if (cube1.canErase() || cube2.canErase()) {
      [cube1.fill, cube2.fill] = [cube2.fill, cube1.fill];
      [cube1.x, cube1.y, cube2.x, cube2.y] = [cube2.x, cube2.y, cube1.x, cube1.y];
      return true;
    } else {
      [cube1.fill, cube2.fill] = [cube2.fill, cube1.fill];
      return false;
    }
  }

  // 根据坐标消除附近相同的方块
  async erase(x, y) {
    const cube = this.getCube(x, y);
    if (!cube.canErase()) return;
    this.timeout += 3; // 每消除一个方块时间延长3秒
    const { xsames, ysames, count } = this.findSame(x, y);
    const score = this.calcScore(x, y);
    this.score += score;
    this.emit("score", this.score);
    const fallPos = [];
    if (count[0] + count[1] + 1 >= 3) {
      ysames.map((cube) => (cube.willDestoryed = true));

      fallPos.push({ x, y: y + count[1], step: count[0] + count[1] + 1 });
    }
    if (count[2] + count[3] + 1 >= 3) {
      xsames.map((cube) => (cube.willDestoryed = true));

      for (let i = x - count[2]; i <= x + count[3]; i++) {
        if (count[0] + count[1] + 1 >= 3 && x === i) {
          continue;
        }
        fallPos.push({ x: i, y, step: 1 });
      }
    }
    cube.willDestoryed = true;
    // 所有需要处理的方块都被 fallPos:{x y step} 囊括
    // 接下，需要依次处理方块
    // 1. 首先，需要将消除的方块，统一透明化
    // 2. 需要将消除的方块删除
    // 3. 生成后面需要填充的方块，填充数量为 step
    // 4. 将消除方块上方方块统一下移
    // 结束
    fallPos.map(({ x, y, step }) => this.fillErase(x, y, step));
    await this.render();
    fallPos.map(({ x, y, step }) => this.removeErase(x, y, step));
    fallPos.map(({ x, y, step }) => this.fall(x, y, step));
    await this.render();
  }

  calcScore(x, y) {
    // 3个 10分
    // 超过3个 50分
    // 消除交叉 100分
    const { xsames, ysames, count } = this.findSame(x, y);
    const eraseCount = this.eraseCount(x, y);
    const vertical = count[0] + count[1] + 1 >= 3;
    const horizontal = count[2] + count[3] + 1 >= 3;
    if (vertical && horizontal) {
      return 100;
    } else if (eraseCount > 3) {
      return 50;
    } else {
      return 10;
    }
  }

  // 准备用于填充消除方块的方块
  fillErase(x, y, step) {
    for (let i = 1; i <= step; i++) {
      const cube = new FunFestCube(x, -1 * i, this.getRandomFill(), this);
      const el = cube.render();
      this.rootEl.append(el);
      this.map.push(cube);
    }
  }

  // 删除消除的方块
  removeErase(x, y, step) {
    for (let i = 0; i < step; i++) {
      const eraseCube = this.getCube(x, y - i);
      eraseCube.destory();
    }
    this.map = this.map.filter((cube) => !cube.destoryed);
  }

  // 消除坐标处方块并将上方方块落下来
  fall(x, y, step) {
    for (let i = step; i < y + 1 + step; i++) {
      const cube = this.getCube(x, y - i);
      cube.y = y - i + step;
    }
  }

  eraseCount(x, y) {
    const { count } = this.findSame(x, y);
    let cubeCount = 0;
    if (count[0] + count[1] + 1 >= 3) {
      cubeCount += count[0] + count[1];
    }
    if (count[2] + count[3] + 1 >= 3) {
      cubeCount += count[2] + count[3];
    }
    return cubeCount + 1;
  }

  // 消除一组后重新检查是否还需要消除
  findErase() {
    const cube = this.map.find((cube) => cube.canErase());
    if (cube) {
      const { xsames, ysames } = this.findSame(cube.x, cube.y);
      const maxCube = [...xsames, ...ysames, cube]
        .map((cube) => {
          return {
            count: this.eraseCount(cube.x, cube.y),
            cube,
          };
        })
        .sort((a, b) => (a.count < b.count ? 1 : -1))[0].cube;
      return maxCube;
    }
  }

  // 生成方块
  generate() {
    this.map = [];
    for (let h = 0; h < this.height; h++) {
      for (let w = 0; w < this.width; w++) {
        this.map.push(new FunFestCube(w, h, this.getRandomFill(), this));
      }
    }

    // 自动去掉可消除的方块
    let cube = null;
    while (
      this.map.some((c) => {
        if (c.canErase()) {
          cube = c;
          return true;
        }
      })
    ) {
      cube.fill = this.getRandomFill(this.getEdgeDiffFill(cube.x, cube.y));
    }

    this.render();
  }

  // 渲染
  async render() {
    this.map = this.map.filter((cube) => !cube.destoryed);
    this.map.map((cube) => {
      const el = cube.render();
      if (!this.rootEl.contains(el)) {
        this.rootEl.append(el);
      }
    });
    await sleep();
    this.emit("render");
  }
}

const game = new FunFestGame();
game.mount(document.querySelector(".fun-fest"));
game.on("score", (score) => {
  document.querySelector(".fun-fest-count .score").textContent = score;
});
game.on("timeupdate", (time) => {
  const m = Math.floor(time / 60);
  const s = time % 60;
  document.querySelector(".fun-fest-count .timeout").textContent = `${String(
    m
  ).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
});
game.on("end", () => {
  document.querySelector(".fun-fest-count .score-tip").textContent =
    "游戏结束,最终得分";
});
