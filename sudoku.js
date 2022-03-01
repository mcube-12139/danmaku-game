/**
 * @type {Map<string, string>}
 */
const writeCmdMap = new Map();

let problem;

let difficulty = 0;
let winCount = 0;

const diffText = {
    x: 208,
    y: 312,
    textX: 328,
    setPos(xx, yy) {
        this.x = xx;
        this.y = yy;
        this.textX = xx + 120;
    },
    initDraw() {
        ctx.font = "24px 黑体";
        ctx.fillText("当前难度：", this.x, this.y);
    },
    setup(diff) {
        ctx.clearRect(this.textX, this.y, 48, 24);
        ctx.font = "24px 黑体";
        ctx.fillText(diff, this.textX, this.y);
    }
};

const winCountText = {
    x: 208,
    y: 312,
    textX: 328,
    setPos(xx, yy) {
        this.x = xx;
        this.y = yy;
        this.textX = xx + 120;
    },
    initDraw() {
        ctx.font = "24px 黑体";
        ctx.fillText("当前连胜：", this.x, this.y);
    },
    setup(wc) {
        ctx.clearRect(this.textX, this.y, 48, 24);
        ctx.font = "24px 黑体";
        ctx.fillText(wc, this.textX, this.y);
    }
};

const grid = {
    x: 352,
    y: 224,
    /**
     * @type {number[]}
     */
    numbers: [],
    /**
     * @type {number[]}
     */
    answer: [],
    /**
     * @type {string[]}
     */
    writer: [],
    /**
     * 0=incredible 1=credible 2=fixed
     * @type {(0 | 1 | 2)[]}
     */
    flag: [],
    emptyCount: 0,
    drawGrid() {
        ctx.fillStyle = "#808080";
        for (let i = 0, xx = this.x + 48; i != 3; ++i, xx += 144) {
            for (let j = 0, xxx = xx; j != 2; ++j, xxx += 48) {
                ctx.fillRect(xxx, this.y, 2, 432);
            }
        }
        for (let i = 0, yy = this.y + 48; i != 3; ++i, yy += 144) {
            for (let j = 0, yyy = yy; j != 2; ++j, yyy += 48) {
                ctx.fillRect(this.x, yyy, 432, 2);
            }
        }
        ctx.fillStyle = "#ffffff";
        for (let i = 0, xx = this.x; i != 4; ++i, xx += 144) {
            ctx.fillRect(xx, this.y, 2, 434);
        }
        for (let i = 0, yy = this.y; i != 4; ++i, yy += 144) {
            ctx.fillRect(this.x, yy, 434, 2);
        }

        ctx.font = "24px 黑体";
        ctx.textBaseline = "middle";
        // line number
        for (let i = 0, yy = this.y + 24; i != 9; ++i, yy += 48) {
            ctx.fillText(i.toString(), this.x + 448, yy);
            ctx.textAlign = "right";
            ctx.fillText(i.toString(), this.x - 16, yy);
            ctx.textAlign = "left";
        }
        // column number
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        for (let i = 0, xx = this.x + 24; i != 9; ++i, xx += 48) {
            ctx.fillText(i.toString(), xx, this.y + 448);
            ctx.textBaseline = "bottom";
            ctx.fillText(i.toString(), xx, this.y - 16);
            ctx.textBaseline = "top";
        }
        ctx.textAlign = "left";
    },
    drawNumber() {
        ctx.font = "32px 黑体";
        ctx.textAlign = "center";
        ctx.fillStyle = "#00ff80";
        for (let k = 0, i = 0, yy = this.y; i != 9; ++i, yy += 48) {
            for (let j = 0, xx = this.x; j != 9; ++j, xx += 48) {
                ctx.clearRect(xx + 8, yy + 8, 32, 32);

                let num = this.numbers[k++];
                if (num != 0) {
                    ctx.fillText(num.toString(), xx + 24, yy + 8);
                }
            }
        }
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
    },
    /**
     * 
     * @param {number} line 
     * @param {number} column 
     * @param {number} num 
     * @returns {null | "行" | "列" | "宫"}
     */
    getConflict(line, column, num) {
        let index = 9 * line + column;

        // line
        for (let i = 0, ii = 9 * line; i != 9; ++i, ++ii) {
            if (ii != index && this.numbers[ii] == num) {
                return "行";
            }
        }

        // column
        for (let i = 0, ii = column; i != 9; ++i, ii += 9) {
            if (ii != index && this.numbers[ii] == num) {
                return "列";
            }
        }

        // area
        let areaLine = Math.floor(line / 3);
        let areaColumn = Math.floor(column / 3);
        let start = 27 * areaLine + 3 * areaColumn;
        for (let i = 0, ii = start; i != 3; ++i, ii += 6) {
            for (let j = 0; j != 3; ++j, ++ii) {
                if (ii != index && this.numbers[ii] == num) {
                    return "宫";
                }
            }
        }

        return null;
    },
    /**
     * 
     * @param {number} line 
     * @param {number} column 
     * @param {number} num 
     */
    writeNumber(line, column, num) {
        let index = 9 * line + column;

        if (this.flag[index] != 2) {
            // not fixed

            let old = this.numbers[index];

            let xx = this.x + 48 * column;
            let yy = this.y + 48 * line;

            ctx.font = "32px 黑体";

            let key = `${index}-${num}`;
            if (num != 0) {
                // write number

                let con = this.getConflict(line, column, num);
                if (con == null) {
                    // no conflict

                    ctx.textAlign = "center";
                    if (old == 0) {
                        // write empty

                        writeCmdMap.set(key, userName);
                        this.numbers[index] = num;
                        --this.emptyCount;

                        ctx.clearRect(xx + 8, yy + 8, 32, 32);
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText(num.toString(), xx + 24, yy + 8);

                        ctx.textAlign = "left";
                        danmaku.add("#ffffff", `${userName}在(${line}, ${column})填写${num}`);
                        if (this.writer[index] == null) {
                            this.writer[index] = userName;
                        }
                    } else {
                        if (num == old && writeCmdMap.get(key) != userName) {
                            // set credible
                            this.flag[index] = 1;

                            ctx.clearRect(xx + 8, yy + 8, 32, 32);
                            ctx.fillStyle = "#40a0ff";
                            ctx.fillText(num.toString(), xx + 24, yy + 8);

                            ctx.textAlign = "left";
                            danmaku.add("#ffffff", `${userName}确认(${line}, ${column})`);
                        } else {
                            // rewrite
                            if (this.flag[index] != 1) {
                                // not credible
                                writeCmdMap.set(key, userName);
                                setTimeout(() => writeCmdMap.delete(key), 20000);
                                let oldKey = `${index}-0`;
                                if (writeCmdMap.has(oldKey)) {
                                    writeCmdMap.delete(oldKey);
                                }

                                this.numbers[index] = num;

                                ctx.clearRect(xx + 8, yy + 8, 32, 32);
                                ctx.fillStyle = "#ffffff";
                                ctx.fillText(num.toString(), xx + 24, yy + 8);

                                ctx.textAlign = "left";
                                danmaku.add("#ffffff", `${userName}在(${line}, ${column})重写${num}`);
                                if (this.writer[index] == null) {
                                    this.writer[index] = userName;
                                }
                            } else {
                                // credible
                                if (!writeCmdMap.has(key)) {
                                    // no friend command
                                    writeCmdMap.set(key, userName);
                                    setTimeout(() => writeCmdMap.delete(key), 20000);
                                } else {
                                    // friend command
                                    let oname = writeCmdMap.get(key);
                                    if (oname != userName) {
                                        this.numbers[index] = num;

                                        ctx.clearRect(xx + 8, yy + 8, 32, 32);
                                        ctx.fillStyle = "#40a0ff";
                                        ctx.fillText(num.toString(), xx + 24, yy + 8);

                                        ctx.textAlign = "left";
                                        danmaku.add("#ffffff", `[${oname}, ${userName}]在(${line}, ${column})重写${num}`);
                                        if (this.writer[index] == null) {
                                            this.writer[index] = userName;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    ctx.textAlign = "left";
                    ctx.fillStyle = "#ffffff";
                    if (this.emptyCount == 0) {
                        this.win();
                    }
                } else {
                    // conflict
                    danmaku.add("#f77979", `${userName}在(${line}, ${column})填写的${num}有${con}冲突，填写失败`);
                }
            } else {
                // erase number
                if (old != 0) {
                    if (this.flag[index] != 1) {
                        // not credible
                        let ok = false;
                        if (!writeCmdMap.has(key)) {
                            ok = true;
                        } else if (writeCmdMap.get(key) != userName) {
                            ok = true;
                            writeCmdMap.delete(key);
                        }
                        if (ok) {
                            // not erased
                            let oldKey = `${index}-${old}`;
                            if (writeCmdMap.has(oldKey)) {
                                writeCmdMap.delete(oldKey);
                            }
                            ++this.emptyCount;
                            this.numbers[index] = 0;

                            ctx.clearRect(xx + 8, yy + 8, 32, 32);

                            danmaku.add("#ffffff", `${userName}擦除(${line}, ${column})`);
                        }
                    } else {
                        // credible
                        // set incredible
                        writeCmdMap.set(key, userName);
                        this.flag[index] = 0;

                        ctx.textAlign = "center";
                        ctx.clearRect(xx + 8, yy + 8, 32, 32);
                        ctx.fillText(old.toString(), xx + 24, yy + 8);
                        ctx.textAlign = "left";

                        danmaku.add("#ffffff", `${userName}擦除一次(${line}, ${column})`);
                    }
                }
            }
        }
    },
    win() {
        gameOver = true;
        ++winCount;

        // stop time
        timeText.stop();
        winText.show("游戏胜利", true);

        // clear banned
        banned.clear();
        bannedName.clear();

        // set win player list
        let winPlayerMap = new Map();
        for (let i = 0; i != 81; ++i) {
            if (this.flag[i] != 2) {
                let p = this.writer[i];
                if (winPlayerMap.has(p)) {
                    winPlayerMap.set(p, winPlayerMap.get(p) + 1);
                } else {
                    winPlayerMap.set(p, 1);
                }
            }
        }
        winPlayers = Array.from(winPlayerMap).sort((a, b) => {
            return b[1] - a[1];
        });

        // check record
        if (timeText.mytime < minTime) {
            minTime = timeText.mytime;
            recPlayers = winPlayers.map(v => v[0]);
            // save record
            fs.writeFileSync(`sudoku-record-${difficulty}.txt`, JSON.stringify({
                minTime: minTime,
                players: recPlayers
            }));

            recText.draw();
        }

        // show win player
        danmaku.wpIndex = 0;
        danmaku.showWinner();
    }
}

function setup() {
    danmaku.setRect(928, 16, 1264, 448);
    danmaku.drawBorder();
    winText.setPos(640, 16);
    ruleText.setPos(16, 16, 288, 688);
    ruleText.draw([
        [[
        ],
        [
            "绿色是固定数字",
            "蓝色是玩家确定的数字",
            "白色是暂不确定的数字",
            "唯一解"
        ]],
        [[
            "<行数>-<列数>-<数字>",
            "b-<行数>-<列数>-<数字>"
        ],
        [
            "填数",
            "填0表示擦除",
            "b开头表示使用二进制数",
            "违禁词 6-4 8-9 等 不能用十进制",
            "2名玩家在同一位置填同一数可以确定数字",
            "擦除确定的数字会取消确定状态",
            "重写确定的数字需要2名玩家同时下令"
        ]],
        [[
            "dg-<网易云音乐id>"
        ],
        [
            "点歌",
            "每首歌播完之后可以重新点"
        ]],
        [[
            "ju-<玩家名>",
            "ju-/u-<玩家uid>"
        ],
        [
            "举报玩家",
            "3人举报封禁玩家，被封禁的玩家本局无法下令"
        ]],
    ]);
    timeText.setPos(640, 88);
    timeText.initDraw();
    diffText.setPos(640, 112);
    diffText.initDraw();
    winCountText.setPos(640, 136);
    winCountText.initDraw();

    // load record
    let rec = JSON.parse(fs.readFileSync(`sudoku-record-${difficulty}.txt`).toString());
    minTime = rec["minTime"];
    recPlayers = rec["players"];

    recText.setPos(928, 464);
    recText.draw();

    // load problem
    problem = JSON.parse(fs.readFileSync(`sudoku-problem-${difficulty}.txt`).toString());

    grid.drawGrid();

    start();
}

function start() {
    writeCmdMap.clear();

    if (difficulty < 3) {
        if (winCount == 3) {
            // increase difficulty
            winCount = 0;
            ++difficulty;

            // load record
            let rec = JSON.parse(fs.readFileSync(`sudoku-record-${difficulty}.txt`).toString());
            minTime = rec["minTime"];
            recPlayers = rec["players"];

            // load problem
            problem = JSON.parse(fs.readFileSync(`sudoku-problem-${difficulty}.txt`).toString());

            recText.draw();
        }
    } else {
        if (winCount == 6) {
            ipcRenderer.send("new-game");
            return;
        }
    }
    timeText.mytime = 0;
    timeText.setup();
    diffText.setup(["简单", "一般", "难", "很难"][difficulty]);
    winCountText.setup(winCount.toString());
    winText.clear();

    let p = problem[winCount];
    let answer = p["answer"];
    let empty = p["empty"];
    grid.numbers = answer.map((value, index) => empty[index] ? 0 : value);
    // grid.numbers = answer.map((value, index) => value);
    grid.answer = answer;
    grid.writer = [];
    grid.emptyCount = 0;
    grid.flag = [];
    for (let n of grid.numbers) {
        if (n == 0) {
            ++grid.emptyCount;
            grid.flag.push(0);
        } else {
            grid.flag.push(2);
        }
        grid.writer.push(null);
    }
    grid.drawNumber();

    gameOver = false;
}

function execGameCommand(cmd) {
    let line;
    let column;
    let num;

    if (cmd.length == 3) {
        for (let i = 0; i != 3; ++i) {
            let nn = cmd[i];
            let n = parseInt(nn);
            if (!isNaN(n)) {
                cmd[i] = n;
            } else {
                return;
            }
        }
        line = cmd[0];
        column = cmd[1];
        num = cmd[2];
    } else if (cmd.length == 4) {
        if (cmd[0] == "b") {
            for (let i = 1; i != 4; ++i) {
                let n = parseInt(cmd[i], 2);
                if (!isNaN(n)) {
                    cmd[i] = n;
                } else {
                    return;
                }
            }
        }
        line = cmd[1];
        column = cmd[2];
        num = cmd[3];
    }
    if (line >= 0 && line < 9 && column >= 0 && column < 9 && num >= 0 && num <= 9) {
        grid.writeNumber(line, column, num);
    }
}

function onGift(data) {

}

function onFansUpdate(fans) {

}

/**
 * 
 * @param {{name: string, score: number}} p 
 * @returns {string}
 */
function getWinPlayerText(p) {
    return `${p[0]} 填写数${p[1]}`;
}