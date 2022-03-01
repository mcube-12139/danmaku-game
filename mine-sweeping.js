let otherName;
let firstOpen;
/**
 * @type {Map<string, number>}
 */
let players = new Map();
/**
 * @type {Map<string, number>}
 */
let openCmdMap = new Map();

let enableVerify = false;
let maxFans = -1;

let imgGrid;
let imgMine;
let imgRedMine;
let imgFlag;
let imgNumber;

const mineText = {
    x: 208,
    y: 312,
    textX: 296,
    setPos(xx, yy) {
        this.x = xx;
        this.y = yy;
        this.textX = xx + 72;
    },
    initDraw() {
        ctx.font = "24px 黑体";
        ctx.fillText("余雷：", this.x, this.y);
    },
    setup(mineCount) {
        ctx.clearRect(this.textX, this.y, 48, 24);
        ctx.font = "24px 黑体";
        ctx.fillText(mineCount.toString(), this.textX, this.y);
    },
    updateMineCount(n) {
        ctx.font = "24px 黑体";
        ctx.clearRect(this.textX, this.y, 48, 24);
        ctx.fillText(n.toString(), this.textX, this.y);
    }
};

const grid = {
    x: 0,
    y: 0,
    lineCount: 16,
    columnCount: 30,
    gridCount: 480,
    totalNumber: 381,
    numberCount: 381,
    unmarkedMine: 99,
    width: 720,
    height: 384,
    right: 720,
    bottom: 384,
    numbers: [],
    openFlag: [],
    setPos(xx, yy) {
        this.x = xx;
        this.y = yy;
        this.right = xx + this.width;
        this.bottom = yy + this.height;
    },
    setGrid(lineCount, columnCount, mineCount) {
        this.lineCount = lineCount;
        this.columnCount = columnCount;
        this.gridCount = lineCount * columnCount;
        this.width = 24 * columnCount;
        this.height = 24 * lineCount;
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
        this.totalNumber = this.gridCount - mineCount;
        this.numberCount = this.totalNumber;
        this.unmarkedMine = mineCount;
    },
    inRange(l, c) {
        return l >= 0 && l < this.lineCount && c >= 0 && c < this.columnCount;
    },
    * neighbors(l, c) {
        for (let i = -1; i != 2; ++i) {
            for (let j = -1; j != 2; ++j) {
                if (i != 0 || j != 0) {
                    if (this.inRange(l + i, c + j)) {
                        yield [l + i, c + j];
                    }
                }
            }
        }
    },
    lcti(l, c) {
        return this.columnCount * l + c;
    },
    drawLine() {
        // vertical lines
        ctx.fillStyle = "#00ff80";
        for (let i = 0,
            lc = Math.ceil(this.columnCount / 5) - 1,
            xx = this.x + 119;

            i != lc;

            ++i,
            xx += 120
        ) {
            ctx.fillRect(xx, this.y, 3, this.height);
        }

        // horizontal lines
        for (let i = 0,
            lc = Math.ceil(this.lineCount / 5) - 1,
            yy = this.y + 119;

            i != lc;

            ++i,
            yy += 120
        ) {
            ctx.fillRect(this.x, yy, this.width, 3);
        }
        ctx.fillStyle = "#ffffff";
    },
    setup() {
        this.numbers = [];
        this.openFlag = [];
        this.numberCount = this.totalNumber;
        this.unmarkedMine = this.gridCount - this.numberCount;

        // set up mines
        for (let i = 0; i != this.unmarkedMine; ++i) {
            this.numbers.push(-1);
        }
        for (let i = 0; i != this.numberCount; ++i) {
            this.numbers.push(0);
        }

        // shuffle
        for (let i = this.gridCount - 1; i != -1; --i) {
            let ii = irandom(i);
            let t = this.numbers[i];
            this.numbers[i] = this.numbers[ii];
            this.numbers[ii] = t;
        }

        // set up numbers
        let n = 0;
        for (let i = 0; i != this.lineCount; ++i) {
            for (let j = 0; j != this.columnCount; ++j) {
                if (this.numbers[n++] == -1) {
                    for (let [l, c] of this.neighbors(i, j)) {
                        let ii = this.lcti(l, c);
                        if (this.numbers[ii] != -1) {
                            ++this.numbers[ii];
                        }
                    }
                }
            }
        }

        // set open flag
        for (let i = 0; i != this.gridCount; ++i) {
            this.openFlag.push(0);
        }

        // draw grids
        ctx.clearRect(this.x, this.y, this.width, this.height);
        for (let i = 0,
            xx = this.x,
            yy = this.y;

            i != this.lineCount;

            ++i,
            xx = this.x,
            yy += 24
        ) {
            for (let j = 0;

                j != this.columnCount;

                ++j,
                xx += 24
            ) {
                ctx.drawImage(imgGrid, xx, yy, 24, 24);
            }
        }

        this.drawLine();
    },
    redraw() {
        let n = 0;
        for (let i = 0,
            yy = this.y;

            i != this.lineCount;

            ++i,
            yy += 24
        ) {
            for (let j = 0,
                xx = this.x;

                j != this.columnCount;

                ++j,
                xx += 24
            ) {
                let of = this.openFlag[n];
                if (of == 2) {
                    let nn = this.numbers[n];
                    ctx.drawImage(imgNumber[nn], xx, yy, 24, 24);
                } else if (of == 1) {
                    ctx.drawImage(imgFlag, xx, yy, 24, 24);
                } else {
                    ctx.drawImage(imgGrid, xx, yy, 24, 24);
                }
                ++n;
            }
        }

        this.drawLine();
    },
    drawNumber() {
        ctx.fillStyle = "#808080";

        // line seperators
        for (let i = 0,
            lc = this.lineCount - 1,
            xx = this.x - 48,
            yy = this.y + 23;

            i != lc;

            ++i,
            yy += 24
        ) {
            ctx.fillRect(xx, yy, 48, 2);
            ctx.fillRect(this.right, yy, 48, 2);
        }
        // column seperators
        for (let i = 0,
            lc = this.columnCount - 1,
            xx = this.x + 23,
            yy = this.y - 48;

            i != lc;

            ++i,
            xx += 24
        ) {
            ctx.fillRect(xx, this.bottom, 2, 48);
            ctx.fillRect(xx, yy, 2, 48);
        }

        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.font = "24px 黑体";
        // line numbers
        for (let i = 0,
            lc = this.lineCount,
            xx1 = this.x - 12,
            xx2 = this.right + 12,
            yy = this.y + 12;

            i != lc;

            ++i,
            yy += 24
        ) {
            ctx.textAlign = "right";
            ctx.fillText(i.toString(), xx1, yy);
            ctx.textAlign = "left";
            ctx.fillText(i.toString(), xx2, yy);
        }

        // column numbers
        ctx.textAlign = "center";
        // 0-9
        let columnNumberX = this.x + 12;
        for (let i = 0,
            yy1 = this.y - 12,
            yy2 = this.bottom + 12;

            i != 10;

            ++i,
            columnNumberX += 24
        ) {
            ctx.textBaseline = "bottom";
            ctx.fillText(i.toString(), columnNumberX, yy1);
            ctx.textBaseline = "top";
            ctx.fillText(i.toString(), columnNumberX, yy2);
        }
        // 10-...
        _outer:
        for (let i = 10,
            high = 1,
            yy11 = this.y - 24,
            yy12 = this.y,
            yy21 = this.bottom,
            yy22 = this.bottom + 24;

            ;

            i += 10,
            ++high
        ) {
            for (let j = 0; j != 10; ++j, columnNumberX += 24) {
                if (i + j == this.columnCount) {
                    break _outer;
                }

                ctx.textBaseline = "bottom";
                // high
                ctx.fillText(high.toString(), columnNumberX, yy11);
                // low
                ctx.fillText(j.toString(), columnNumberX, yy12);

                ctx.textBaseline = "top";
                ctx.fillText(high.toString(), columnNumberX, yy21);
                ctx.fillText(j.toString(), columnNumberX, yy22);
            }
        }
        ctx.textAlign = "left";
    },

    doOpen(l, c) {
        checkOpenCmd(l, c, 0);
        if (otherName != null) {
            if (this.openFlag[this.lcti(l, c)] == 0) {
                danmaku.add("#ffffff", `[${otherName}, ${userName}]点开(${l}, ${c})`);
                this.open(l, c);
            }
        }
    },
    doMark(l, c) {
        if (this.openFlag[this.lcti(l, c)] == 0) {
            danmaku.add("#ffffff", `${userName}插旗(${l}, ${c})`);
            this.mark(l, c);
        }
    },
    open(l, c) {
        let i = this.lcti(l, c);
        let n = this.numbers[i];

        if (n != -1) {
            // number
            if (firstOpen) {
                firstOpen = false;
                timeText.setup();
                mineText.setup(this.unmarkedMine);
            }
            addPlayer(otherName);
            addPlayer(userName);

            this.openFlag[i] = 2;
            let xx = this.x + 24 * c;
            let yy = this.y + 24 * l;
            ctx.clearRect(xx, yy, 24, 24);
            ctx.drawImage(imgNumber[n], xx, yy, 24, 24);
            this.redrawLine(l, c);
            if (n == 0) {
                // zero
                // open neighbors
                for (let [ll, cc] of this.neighbors(l, c)) {
                    if (this.openFlag[this.lcti(ll, cc)] == 0) {
                        this.open(ll, cc);
                    }
                }
            }

            // all numbers opened
            --this.numberCount;
            if (this.numberCount == 0) {
                // mark all mines
                for (let [ii, nn] of this.numbers.entries()) {
                    if (nn == -1 && this.openFlag[ii] == 0) {
                        let [ll, cc] = getLineColumn(ii);
                        grid.mark(ll, cc);
                    }
                }
                winGame();
            }
        } else {
            // mine
            // open all mines
            for (let [ii, n] of this.numbers.entries()) {
                if (n == -1) {
                    let [line, column] = getLineColumn(ii);
                    ctx.drawImage(ii != i ? imgMine : imgRedMine, this.x + 24 * column, this.y + 24 * line, 24, 24);
                    this.redrawLine(line, column);
                }
            }
            loseGame();
        }
    },
    mark(l, c) {
        let i = this.lcti(l, c);

        this.openFlag[i] = 1;
        ctx.drawImage(imgFlag, this.x + 24 * c, this.y + 24 * l, 24, 24);

        this.redrawLine(l, c);

        --this.unmarkedMine;
        mineText.updateMineCount(this.unmarkedMine);
    },
    openNeighbor(l, c) {
        checkOpenCmd(l, c, 2);
        if (otherName == null) {
            return;
        }

        let n = this.lcti(l, c);
        if (this.openFlag[n] == 2) {
            // opened
            let sum = 0;
            for (let [ll, cc] of this.neighbors(l, c)) {
                if (this.openFlag[this.lcti(ll, cc)] == 1) {
                    ++sum;
                }
            }
            if (this.numbers[n] == sum) {
                let ok = false;
                for (let [ll, cc] of this.neighbors(l, c)) {
                    if (this.openFlag[this.lcti(ll, cc)] == 0) {
                        if (!ok) {
                            ok = true;
                            danmaku.add("#ffffff", `[${otherName}, ${userName}]四周全开(${l}, ${c})`);
                        }
                        this.open(ll, cc);
                    }
                }
            }
        }
    },
    unmark(l, c) {
        let i = this.lcti(l, c);

        if (this.openFlag[i] == 1) {
            this.openFlag[i] = 0;
            ctx.drawImage(imgGrid, this.x + 24 * c, this.y + 24 * l, 24, 24);
            this.redrawLine(l, c);

            // add danmaku
            danmaku.add("#ffffff", `${userName}拔旗(${l}, ${c})`);

            ++this.unmarkedMine;
            mineText.updateMineCount(this.unmarkedMine);
        }
    },
    verify(l, c) {
        if (enableVerify) {
            enableVerify = false;

            // add danmaku
            danmaku.add("#ffffff", `${userName}查验(${l}, ${c})`);
            danmaku.add("#ffff00", `(${l}行, ${c}列)${this.numbers[this.lcti(l, c)] == -1 ? "是" : "不是"}雷`);
        }
    },
    redrawLine(l, c) {
        ctx.fillStyle = "#00ff80";
        let xx = this.x + 24 * c;
        let yy = this.y + 24 * l;
        if (l >= 5 && l % 5 == 0) {
            // horizontal top
            ctx.fillRect(xx, yy, 24, 2);
        } else if (l < this.lineCount - 1 && l % 5 == 4) {
            // horizontal bottom
            ctx.fillRect(xx, yy + 23, 24, 1);
        }
        if (c >= 5 && c % 5 == 0) {
            // vertical left
            ctx.fillRect(xx, yy, 2, 24);
        } else if (c < this.columnCount - 1 && c % 5 == 4) {
            // vertical right
            ctx.fillRect(xx + 23, yy, 1, 24);
        }
        ctx.fillStyle = "#ffffff";
    }
};

function execGameCommand(nums) {
    // grid
    let line;
    let column;
    let op;
    if (nums.length == 3) {
        for (let [i, n] of nums.entries()) {
            let num = parseInt(n);
            if (isNaN(num)) {
                return;
            }
            nums[i] = num;
        }
        line = nums[0];
        column = nums[1];
        op = nums[2];
    } else if (nums.length == 4) {
        if (nums[0] == "b") {
            for (let i = 1; i != 4; ++i) {
                let n = parseInt(nums[i], 2);
                if (isNaN(n)) {
                    return;
                }
                nums[i] = n;
            }
        }
        line = nums[1];
        column = nums[2];
        op = nums[3];
    }
    if (grid.inRange(line, column)) {
        switch (op) {
            case 0:
                grid.doOpen(line, column);
                break;
            case 1:
                grid.doMark(line, column);
                break;
            case 2:
                grid.openNeighbor(line, column);
                break;
            case 3:
                grid.unmark(line, column);
                break;
            case 4:
                grid.verify(line, column);
                break;
        }
    }
}

function onGift(data) {
    enableVerify = true;
    danmaku.add("#ffff00", `${data["uname"]}送出了${data["num"]}个${data["giftName"]}，获得查验机会`);
}

function onFansUpdate(fans) {
    if (maxFans == -1) {
        maxFans = fans;
    } else if (fans > maxFans) {
        maxFans = fans;
        enableVerify = true;
        danmaku.add("#ffff00", "关注数增加，获得查验机会");
    }
}

function getLineColumn(i) {
    return [Math.floor(i / 30), i % 30];
}

function start() {
    firstOpen = false;
    gameOver = false;
    players.clear();
    openCmdMap.clear();

    grid.setup();
    timeText.mytime = 0;
    // open a zero
    _outer:
    for (let l = 4; l != 12; ++l) {
        for (let c = 8; c != 22; ++c) {
            if (grid.numbers[grid.lcti(l, c)] == 0) {
                grid.open(l, c);
                break _outer;
            }
        }
    }
    firstOpen = true;

    winText.clear();
}

function checkOpenCmd(l, c, opt) {
    let cmd = `${l}-${c}-${opt}`;
    if (!openCmdMap.has(cmd)) {
        openCmdMap.set(cmd, userName);
        setTimeout(() => {
            openCmdMap.delete(cmd);
        }, 60000);
        otherName = null;
        return;
    } else {
        let on = openCmdMap.get(cmd);
        if (on != userName) {
            openCmdMap.delete(cmd);
            otherName = on;
            return;
        }
    }

    otherName = null;
}

function winGame() {
    gameOver = true;
    timeText.stop();
    winText.show("游戏胜利", true);

    winPlayers = Array.from(players);
    winPlayers.sort((a, b) => b[1] - a[1]);

    banned.clear();
    bannedName.clear();

    // check record
    if (timeText.mytime < minTime) {
        minTime = timeText.mytime;
        recPlayers = winPlayers.map(v => v[0]);
        // save record
        fs.writeFileSync("record.txt", JSON.stringify({
            minTime: minTime,
            players: recPlayers
        }));

        recText.draw();
    }

    // show winners
    danmaku.wpIndex = 0;
    danmaku.showWinner();
}

function loseGame() {
    gameOver = true;
    timeText.stop();
    winText.show("游戏失败", false);

    // restart
    setTimeout(start, 10000);
}

function saveGame() {
    let data = {
        lineCount: grid.lineCount,
        columnCount: grid.columnCount,
        totalNumber: grid.totalNumber,
        numbers: grid.numbers,
        openFlag: grid.openFlag,
        mytime: timeText.mytime,
        players: Array.from(players),
    };
    fs.writeFileSync("save.txt", JSON.stringify(data));
}

function loadGame() {
    let data = JSON.parse(fs.readFileSync("save.txt").toString());
    let lineCount = data["lineCount"];
    let columnCount = data["columnCount"];
    let gridCount = lineCount * columnCount;
    let mineCount = gridCount - data["totalNumber"];

    grid.setGrid(lineCount, columnCount, mineCount);
    grid.numbers = data["numbers"];
    grid.openFlag = data["openFlag"];
    let nc = 0;
    for (let i = 0; i != gridCount; ++i) {
        if (grid.openFlag[i] == 2) {
            ++nc;
        }
    }
    grid.numberCount = data["totalNumber"] - nc;
    let marked = 0;
    for (let i = 0; i != gridCount; ++i) {
        if (grid.openFlag[i] == 1) {
            ++marked;
        }
    }
    grid.unmarkedMine = mineCount - marked;

    timeText.mytime = data["mytime"];
    timeText.updateTime();
    mineText.updateMineCount(grid.unmarkedMine);

    players.clear();
    for (let p of data["players"]) {
        players.set(p[0], p[1]);
    }
    openCmdMap.clear();

    grid.redraw();

    gameOver = false;
    winText.clear();
}

function addPlayer(name) {
    players.set(name, players.has(name) ? players.get(name) + 1 : 1);
}

function setup() {
    grid.setPos(64, 272);
    grid.drawNumber();
    danmaku.setRect(928, 16, 1264, 448);
    danmaku.drawBorder();
    winText.setPos(640, 16);
    ruleText.setPos(16, 16, 288, 208);
    ruleText.draw([
        [[
            "<行数>-<列数>-<操作>",
            "b-<行数>-<列数>-<操作>"
        ], [
            "0: 点开",
            "1: 插旗",
            "2: 四周全开",
            "3: 拔旗",
            "4: 查验类型",
            "b开头表示使用二进制数",
            "开格操作需要2名下令者",
            "送礼物可获得查验机会，不可累计"
        ]],
        [[
            "dg-<网易云音乐id>",
        ], [
            "点歌",
            "每首歌播完之后可以重新点"
        ]],
        [[
            "ju-<玩家名>",
            "ju-/u-<玩家uid>"
        ], [
            "举报玩家",
            "3人举报封禁玩家，被封禁的玩家本局无法下令",
            "",
            "自动刷开局",
            "失败10秒后重新开始"
        ]]
    ]);
    timeText.setPos(640, 88);
    timeText.initDraw();
    mineText.setPos(640, 112);
    mineText.initDraw();

    // load record
    let rec = JSON.parse(fs.readFileSync("record.txt").toString());
    minTime = rec["minTime"];
    recPlayers = rec["players"];

    recText.setPos(928, 464);
    recText.draw();

    // load image
    imgGrid = loadImage("grid.png");
    imgMine = loadImage("mine.png");
    imgRedMine = loadImage("red-mine.png");
    imgFlag = loadImage("flag.png");
    imgNumber = [];
    for (let i = 0; i != 9; ++i) {
        imgNumber.push(loadImage(`${i}.png`));
    }

    imgNumber[8].onload = () => start();
}

function getWinPlayerText(p) {
    return `${p[0]} 开格数${p[1]}`;
}

function openAllNumbers() {
    for (let i = 0; i != grid.gridCount - 4; ++i) {
        if (grid.numbers[i] != -1) {
            grid.openFlag[i] = 2;
        }
    }
    grid.redraw();
}