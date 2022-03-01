const { ipcRenderer } = require("electron");

const fs = require("fs");
// const { ipcRenderer } = require("electron");

/**
 * @type {HTMLCanvasElement}
 */
const mainCanvas = document.getElementById("mainCanvas");
/**
 * @type {CanvasRenderingContext2D}
 */
const ctx = mainCanvas.getContext("2d", { "alpha": false });
ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.fillStyle = "#ffffff";
ctx.font = "16px 黑体";

/**
 * @type {number}
 */
let userId;
/**
 * @type {string}
 */
let userName;
/**
 * @type {number}
 */
let minTime;
/**
 * @type {string[]}
 */
let recPlayers;

/**
 * @type {[string, number][]}
 */
let winPlayers;
/**
 * @type {Map<number, Set<number>>}
 */
let bannedMap = new Map();
/**
 * @type {Map<string, Set<number>>}
 */
let bannedNameMap = new Map();
/**
 * @type {Set<number>}
 */
let banned = new Set();
/**
 * @type {Set<string>}
 */
let bannedName = new Set();
/**
 * @type {boolean}
 */
let gameOver;

const timeText = {
    /**
     * @type {number}
     */
    x: 208,
    /**
     * @type {number}
     */
    y: 280,
    /**
     * @type {number}
     */
    textX: 280,
    /**
     * @type {number}
     */
    mytime: 0,
    /**
     * @type {NodeJS.Timeout}
     */
    hdl: null,
    /**
     * 
     * @param {number} xx 
     * @param {number} yy 
     */
    setPos(xx, yy) {
        this.x = xx;
        this.y = yy;
        this.textX = xx + 72;
    },
    initDraw() {
        ctx.font = "24px 黑体";
        ctx.fillText("时间：", this.x, this.y);
    },
    setup() {
        this.updateTime();

        this.hdl = setInterval(() => {
            ++this.mytime;
            this.updateTime();
        }, 1000);
    },
    updateTime() {
        ctx.clearRect(this.textX, this.y, 48, 24);
        ctx.font = "24px 黑体";
        ctx.fillText(this.mytime.toString(), this.textX, this.y);
    },
    stop() {
        clearInterval(this.hdl);
    }
};

const winText = {
    /**
     * @type {number}
     */
    x: 0,
    /**
     * @type {number}
     */
    y: 0,
    /**
     * 
     * @param {number} xx 
     * @param {number} yy 
     */
    setPos(xx, yy) {
        this.x = xx;
        this.y = yy;
    },
    /**
     * 
     * @param {string} text 
     * @param {boolean} winned 
     */
    show(text, winned) {
        // draw win text
        ctx.font = "48px 黑体";
        ctx.fillText(text, this.x, this.y);

        if (winned) {
            // draw new record text
            if (timeText.mytime < minTime) {
                ctx.font = "24px 黑体";
                ctx.fillText("新纪录！", this.x, this.y + 48);
            }
        }
    },
    clear() {
        ctx.clearRect(this.x, this.y, 192, 72);
    }
};

const ruleText = {
    /**
     * @type {number}
     */
    x: 0,
    /**
     * @type {number}
     */
    y: 0,
    /**
     * @type {number}
     */
    width: 288,
    /**
     * @type {number}
     */
    height: 208,
    /**
     * @type {number}
     */
    bottom: 208,
    /**
     * 
     * @param {number} xx 
     * @param {number} yy 
     * @param {number} width 
     * @param {number} height 
     */
    setPos(xx, yy, width, height) {
        this.x = xx;
        this.y = yy;
        this.width = width;
        this.height = height;
        this.bottom = yy + height;
    },
    /**
     * 
     * @param {[string, string][]} rules 
     */
    draw(rules) {
        let nextX = this.x;
        let nextY = this.y;

        ctx.font = "16px 黑体";
        for (let t of rules) {
            let t0 = t[0];
            let t1 = t[1];
            ctx.fillStyle = "#00ffff";
            for (let ttt of t0) {
                for (let tt of linesOfText(ttt, this.width)) {
                    ctx.fillText(tt, nextX, nextY);
                    nextY += 16;
                    if (nextY + 16 > this.bottom) {
                        nextX += this.width;
                        nextY = this.y;
                    }
                }
            }
            ctx.fillStyle = "#ffff00";
            for (let ttt of t1) {
                for (let tt of linesOfText(ttt, this.width)) {
                    ctx.fillText(tt, nextX, nextY);
                    nextY += 16;
                    if (nextY + 16 > this.bottom) {
                        nextX += this.width;
                        nextY = this.y;
                    }
                }
            }
        }
        ctx.fillStyle = "#ffffff";
    }
};

const recText = {
    /**
     * @type {number}
     */
    x: 0,
    /**
     * @type {number}
     */
    y: 0,
    /**
     * 
     * @param {number} xx 
     * @param {number} yy 
     */
    setPos(xx, yy) {
        this.x = xx;
        this.y = yy;
    },
    draw() {
        ctx.clearRect(this.x, this.y, 1280, 720);

        ctx.font = "16px 黑体";
        ctx.fillStyle = "#00ffff";

        let nextY = this.y;
        ctx.fillText(`当前难度最短用时：${minTime}`, this.x, nextY);
        nextY += 16;
        ctx.fillText(`完成者：`, this.x, nextY);
        nextY += 16;
        for (let t of recPlayers) {
            ctx.fillText(t, this.x, nextY);
            nextY += 16;
        }

        ctx.fillStyle = "#ffffff";
    }
};

const danmaku = {
    /**
     * @type {number}
     */
    x: 0,
    /**
     * @type {number}
     */
    y: 0,
    /**
     * @type {number}
     */
    nextY: 0,
    /**
     * @type {number}
     */
    width: 544,
    /**
     * @type {number}
     */
    height: 320,
    /**
     * @type {number}
     */
    right: 544,
    /**
     * @type {number}
     */
    bottom: 320,
    /**
     * @type {number}
     */
    wpIndex: 0,
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} right 
     * @param {number} bottom 
     */
    setRect(x, y, right, bottom) {
        this.x = x;
        this.y = y;
        this.nextY = y;
        this.width = right - x;
        this.height = bottom - y;
        this.right = right;
        this.bottom = bottom;
    },
    drawBorder() {
        ctx.fillStyle = "#808080";
        ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, 2);
        ctx.fillRect(this.x - 2, this.y, 2, this.height + 2);
        ctx.fillRect(this.right, this.y, 2, this.height + 2);
        ctx.fillRect(this.x, this.y + this.height, this.width, 2);
        ctx.fillStyle = "#ffffff";
    },
    /**
     * 
     * @param {string} color 
     * @param {string} text 
     */
    add(color, text) {
        ctx.fillStyle = color;
        ctx.font = "24px 黑体";

        for (let t of linesOfText(text, this.width)) {
            if (this.nextY + 24 > this.bottom) {
                this.nextY = this.y;
                ctx.clearRect(this.x, this.y, this.width, this.height);
            }
            ctx.fillText(t, this.x, this.nextY);
            this.nextY += 24;
        }
        ctx.fillStyle = "#ffffff";
    },
    showWinner() {
        if (this.wpIndex == winPlayers.length) {
            start();
            return;
        }
        if (this.nextY + 24 > this.bottom) {
            ctx.clearRect(this.x, this.y, this.width, this.height);
            this.nextY = this.y;
        }

        ctx.fillStyle = "#ffff00";
        ctx.font = "24px 黑体";

        _outer:
        for (; ;) {
            if (this.wpIndex == winPlayers.length) {
                break;
            }

            let p = winPlayers[this.wpIndex];
            let text = getWinPlayerText(p);
            ++this.wpIndex;
            for (let t of linesOfText(text, this.width)) {
                ctx.fillText(t, this.x, this.nextY);
                this.nextY += 24;
                if (this.nextY + 24 > this.bottom) {
                    break _outer;
                }
            }
        }

        setTimeout(() => this.showWinner(), 20000);
        ctx.fillStyle = "#ffffff";
    }
};

/**
 * 
 * @param {string} text 
 * @param {number} maxWidth 
 */
function* linesOfText(text, maxWidth) {
    let width = 0;
    let ii = 0;
    let len = text.length;

    for (let i = 0; ; ++i) {
        let w = ctx.measureText(text[i]).width;
        if (width + w > maxWidth || i == len) {
            width = w;
            yield text.substr(ii, i - ii);
            ii = i;
            if (i == len) {
                break;
            }
        } else {
            width += w;
        }
    }
}

/**
 * 
 * @param {string} str 
 */
function execCommand(str) {
    let nums = str.split("-");
    let opType = nums[0];

    if (opType == "dg") {
        // change music
        if (nums.length == 2) {
            if (enableMusic) {
                let musicId = parseInt(nums[1]);
                if (!isNaN(musicId)) {
                    // music id is number
                    music.src = `https://music.163.com/song/media/outer/url?id=${musicId}.mp3`;
                    let n = userName;
                    let mi = musicId;
                    music.play().then(() => {
                        // succeed
                        enableMusic = false;
                        musicTimeHdl = setTimeout(() => { enableMusic = true; }, music.duration <= 180 ? 1000 * music.duration : 180000);
                        danmaku.add("#ffff00", `${n}点歌: ${mi}`);
                    }).catch(() => {
                        // fail
                        danmaku.add("#ffff00", `歌曲不可用，${n}点歌失败`);
                    });
                }
            }
        }
    } else if (opType == "ju") {
        // report
        if (nums.length == 2) {
            // report name
            let name = nums[1];
            if (name != "") {
                danmaku.add("#ffff00", `${userName}举报了${name}`);

                if (!bannedNameMap.has(name)) {
                    // not reported
                    bannedNameMap.set(name, new Set([userId]));
                    setTimeout(() => bannedNameMap.delete(name), 60000);
                } else {
                    let reporters = bannedNameMap.get(name);
                    reporters.add(userId);
                    if (reporters.size == 3) {
                        // reported 3 times
                        bannedName.add(name);
                        danmaku.add("#ffff00", `玩家${name}被封禁`);
                    }
                }
            }
        } else if (nums.length == 3) {
            // report uid
            if (nums[1] == "/u") {
                let uid = nums[2];
                let uuid = parseInt(uid);
                if (!isNaN(uuid)) {
                    danmaku.add("#ffff00", `${userName}举报了uid: ${uuid}`);

                    if (!bannedMap.has(uuid)) {
                        // not reported
                        bannedMap.set(uuid, new Set([userId]));
                        setTimeout(() => bannedMap.delete(uuid), 60000);
                    } else {
                        let reporters = bannedMap.get(uuid);
                        reporters.add(userId);
                        if (reporters.size == 3) {
                            // reported 3 times
                            banned.add(uuid);
                            danmaku.add("#ffff00", `玩家uid: ${uuid}被封禁`);
                        }
                    }
                }
            }
        }
    } else {
        execGameCommand(nums);
    }
}

function forceStopMusic() {
    if (musicTimeHdl != null) {
        clearTimeout(musicTimeHdl);
        music.stop();
        enableMusic = true;
    }
}

/**
 * 
 * @param {string} msg 
 */
function onMessage(msg) {
    let jso = JSON.parse(msg);
    let cmd = jso["cmd"];

    if (cmd == "DANMU_MSG") {
        // danmaku
        let info = jso["info"];
        let text = info[1];

        if (!gameOver) {
            let info2 = info[2];
            userId = info2[0];
            userName = info2[1];
            if (!banned.has(userId) && !bannedName.has(userName)) {
                // not banned
                execCommand(text);
            }
        }
    } else if (cmd == "SEND_GIFT") {
        // gift
        let data = jso["data"];
        onGift(data);
    } else if (cmd == "ROOM_REAL_TIME_MESSAGE_UPDATE") {
        // room update
        let f = jso["data"]["fans"];
        onFansUpdate(f);
    }
}

/**
 * 
 * @param {number} i 
 * @returns {number}
 */
function irandom(i) {
    return Math.floor(Math.random() * (i + 1));
}

/**
 * 
 * @param {string} url 
 * @returns {HTMLImageElement}
 */
function loadImage(url) {
    const img = new Image();
    img.src = "image\\" + url;

    return img;
}

/**
 * @type {NodeJS.Timeout}
 */
let musicTimeHdl = null;
/**
 * @type {HTMLAudioElement}
 */
let music = new Audio("https://music.163.com/song/media/outer/url?id=32823258.mp3");
music.loop = true;
music.play();
/**
 * @type {boolean}
 */
let enableMusic = true;

/**
 * @type {BilibiliSocket}
 */
let bs = new BilibiliSocket(4449590);
bs.onMessage = msg => onMessage(msg);
bs.connect();

setup();

document.onkeydown = e => {
    if (e.key == "F12") {
        ipcRenderer.send("debug");
    }
};