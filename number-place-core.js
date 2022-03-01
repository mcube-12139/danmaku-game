class Grid {
    /**
     * 
     * @param {Number} row 
     * @param {Number} col 
     */
    constructor( row, col ) {
        this.row = row;
        this.col = col;
        // this.blockRow = Math.floor( row / 3 );
        // this.blockCol = Math.floor( col / 3 );
        this.visibility = true;
        this.value = 0;
        this.userValue = 0;
    }

    /**
     * 设置 value（数独终盘中的值）
     * @param {Number} value
     */
    setValue( value ) {
        this.value = value;
    }

    /**
     * 用户填写的值
     * @param {Number} value 
     */
    placeValue( value ) {
        this.userValue = value;
    }

    /**
     * 判断用户填写的值是否正确
     * @returns {Boolean}
     */
    isRight() {
        return this.value === this.userValue;
    }

    /**
     * 设置方格是否可见
     * @param {Boolean} v
     */
    setVisible( v ) {
        this.visibility = v;
    }

    /**
     * 查询方格是否可见
     */
    isVisible() {
        return this.visibility;
    }

    /**
     * 判断值 v 是否在有效区间内
     * @param {Number} v 
     */
    static isValidValue(v) {
        if( v > 0 && v < 10 ) {
            return true;
        }
        return false;
    }

    /**
     * 返回 grid 对象所在的块行列
     * @param {{row: Number, col: number}} grid 
     * @returns {{row:Number, col: Number}}
     */
    static blockBelonged(grid) {
        let block = {};
        block.row = Math.floor( grid.row / 3 );
        block.col = Math.floor( grid.col / 3 );
        return block;
    }
}

class Utils {
    /**
     * 数组中的元素去重，只保留唯一的元素
     * @param {Array<>} array 要去重的数组
     * @returns {Array<>} 元素全部唯一的数组
     */
    static distinctArray(array) {
        let result = array.sort().reduce( (pre, current) => {
            if( pre.length == 0 || pre[pre.length-1] != current ) {
                pre.push( current );
            }
            return pre;
        }, []);
        return result;
    }

    /**
     * 将 basic 数组中与 exclude 数组中相同的元素剔除掉
     * @param   {{basic: Array<Number>, exclude: Array<Number>, keepOrder: Boolean}} params
     * @param   {Array<Number>} basic  基本数组
     * @param   {Array<Number>} exclude  要排除的元素构成的数组
     * @param   {Bollean} keepOrder  是否保留原来的数组顺序，若否或无定义，则打乱数组
     * @returns {Array<Number>} 去掉重叠元素的数组的数组
     */
    static getRandomValue(params) {
        params = ( params === undefined ) ? {} : params;

        let basic = params.basic;
        let exclude = params.exclude;

        if( exclude && exclude.length > 0 ) {
            basic = [];
            for(let i = 1; i <= 9; i += 1) {
                if(exclude.indexOf(i) == -1) {
                    basic.push(i)
                }
            }
            // console.log("getR", basic, exclude)

            basic.sort( (a, b) => {
                return a > b;  // 从小到大顺序排列
            });

        } else if( basic === undefined ) {
            basic = this.genBasicArray();
            // let basic = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        }

        if( !params.keepOrder )
            return this.randomArray(basic);
        else
            return basic;
    }

    /**
     * 打乱数组
     * @param {Array<>} array 
     * @returns 数组乱序排列的数组
     */
    static randomArray(array) {
        let size = array.length;
        let arr = new Array(size);
        let randomIndex;
        let exCount = 0;
        for(let i = 0; i < size; i++) {
            randomIndex = Math.floor( Math.random() * (size - exCount) );
            arr[i] = array[randomIndex];
            array[randomIndex] = array[ size - 1 - exCount ];
            array[ size - 1 - exCount ] = 0;
            exCount++;
        }
        return arr;
    }

    /**
     * 判断某一组 Grid 对象是否有效，值从 1 ~ 9 且不重复
     * @param {Array<Number>} grids 
     *      
     * @returns {Boolean} 
     */
    static isGridsValueValid( gridsValue ) {
        let sum   = 0;
        let value = this.distinctArray(gridsValue);
        for( let i = 0; i < 9; i++ ) {
            sum += value[i];
        }

        if( sum == 45 ) {
            return true;
        }
        return false;
    }

    /**
     * 将 1~9 这 9 个元素填充到数组并返回该数组
     * @returns {Array<Number>} 包含 1~9 这 9 个顺序排列的数组
     */
    static genBasicArray() {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    /**
     * 顺序打印出所有格子
     */
    static printAll(board) {
        let toPrint = "";
        let value, grid;
        for( let i = 0; i < 9; i++ ) {
            for( let j = 0; j < 9; j++ ) {
                grid = board.grids[i * 9 + j];
                if( grid.isVisible() )
                    value = grid.value
                else
                    value = 'X';
                    
                toPrint += value + " ";
            }

            toPrint += "\n";
        }

        console.log( toPrint );
    }

    static printRow(board, row) {
        let toPrint = "";
        for( let j = 0; j < 9; j++ ) {
            toPrint += board.grids[row * 9 + j].value + " ";
        }
        toPrint += "\n";

        console.log( toPrint );
    }
}

class Choice {
    /**
     * 
     * @param {Array<Number>} choiceSet 
     */
    constructor(choiceSet) {
        this.choiceSet = choiceSet;
        this.attemptIndex = -1;
    }

    /**
     * 将索引移至下一个位置，并返回该位置的数字
     */
    next() {
        this.attemptIndex++;
        if(this.attemptIndex <= this.choiceSet.length) {
            return this.choiceSet[this.attemptIndex];
        }
        return undefined;
    }
}

class Board {

    constructor() {
        this.grids = new Array( 81 );

        for( let i = 0; i < 9; i++ ) {
            for( let j = 0; j < 9; j++ ) {
                this.grids[i * 9 + j] = new Grid( i, j );
            }
        }
    }

    init() {
        // populate the first row
        let row0 = this.getRowGrids(0);
        let randomArray = Utils.getRandomValue();
        randomArray.forEach( (element, index ) => {
            row0[index].setValue( element );
        });

        // Utils.printAll(this);
 
        let used, unused, grid, index;
        let temp = 0;
        for(let i = 1; i < 9; i += 1) {
            for(let j = 0; j < 9; j += 1) {
                grid = this.grids[i*9+j];
                // process.stdout.write( `i=${i}, j=${j}.  `);
                if( grid.choice === undefined ) {
                    used   = this.getUsedValueArrayAt( {row: i, col: j} );
                    unused = Utils.getRandomValue( {exclude: used} );
                    grid.choice = new Choice( unused );
                }
                index = this.populateGrid(grid);
                // console.log(used, unused, i, j, index)
                i = index.i; 
                j = index.j;
                temp += 1;
            }

        }
    }

    /**
     * 填充方格，并返回修正过的 i，j索引
     * 
     * 该函数属于回溯部分，在方格没有可选数字时，修正索引，以便进行回溯
     * @param {Grid} grid 
     * @returns {{i: Number, j: Number}}
     */
    populateGrid(grid) {
        let i = grid.row, j = grid.col;
        let value = grid.choice.next();

        if( value !== undefined ) {
            // 有可以选择的数字
            grid.setValue(value);
        }
        else {
            // 没有可选的数字
            // Utils.printRow(this, i);
            grid.value  = 0;
            grid.choice = undefined;
            if( j == 0 ) {
                // i = (i > 0 ? i - 1 : i );
                i -= 1;
                j -= 1;
                this.resetPartialGrids({rowStart: i, rowEnd: i+1, colStart: 1, colEnd: 9});  // 返回上一行后，清空该行其它列的数据
            }
            else {
                j -= 2;
            }
        }
        return {i, j};
    }

    /**
     * 获取位置 pos 上可以存放的值集合（乱序）
     * 
     * 注意，可能会出现每个位置没有可用的数字，这时该函数返回 0 而不是 undefined
     * @param {{row: Number, col: Number}} pos 
     * @return Number
     */
    getRandomValidValue(pos) {
        let used = this.getUsedValueArrayAt(pos);
        let valueArray = Utils.getRandomValue({exclude: used});
        return valueArray[0] === undefined ? 0 : valueArray[0];
    }

    /**
     * 按指定的模式，获得位置为（i，j）的使用过的数字集合
     * @param {{mode: String, row: Number, col: Number}} cond 
     *      mode can be row, column or block
     * @returns Array<Number>
     */
    getUsedValueArray( cond ) {
        let grids = this.getGrids( cond );
        let arr = new Array();
        grids.forEach( grid => {
            if( Grid.isValidValue( grid.value ) )
                arr.push( grid.value )
        });
        return arr;
    }

    /**
     * 获取 pos 位置上不可用的值集合，包括 pos 所在的行、列和块中有效的值
     * @param {{row: Number, col: Number}} pos 
     * @returns Array<Number>
     */
    getUsedValueArrayAt(pos) {
        let row = pos.row;
        let col = pos.col;
        let used = new Array();
        let block = Grid.blockBelonged(pos);
        let rowGrids = this.getUsedValueArray( {mode: "row", row: row} );
        let colGrids = this.getUsedValueArray( {mode: "column", col: col});
        let blockGrids = this.getUsedValueArray( {mode: "block", row: block.row, col: block.col} );
        used.push.apply( used, rowGrids );
        used.push.apply( used, colGrids );
        used.push.apply( used, blockGrids );
        let result = Utils.distinctArray( used );
        // console.log( `used at: ${row}  ${col}  ${result}` );
        return result;
    }

    /**
     * 获取第 row 行的所有格子对象
     * @param {Number} row
     * @return {Array<Grid>}
     */
    getRowGrids( row ) {
        let rowArray = new Array( 9 );

        for( let i = 0; i < 9; i++ ) {
            rowArray[i] = this.grids[i + row * 9];
        }

        return rowArray;
    }

    /**
     * 获取第 col 列的所有格子对象
     * @param {Number} col 
     * @return {Array<Grid>}
     */
    getColumnGrids( col ) {
        let colArray = new Array( 9 );

        for( let i = 0; i < 9; i++ ) {
            colArray[i] = this.grids[i * 9 + col];
        }

        return colArray;
    }

    /**
     * 获取某一块（块的行数为 row， 块的列数为 col）的格子对象
     * @param {Number} row 
     * @param {Number} col 
     * @return {Array<Grid>}
     */
    getBlockGrids( row, col ) {
        let block = new Array( 9 );

        for( let i = 0; i < 3; i++ ) {
            for( let j = 0; j < 3; j++ ) {
                block[i * 3 + j] = this.grids[ ( row ) * 27 + col * 3 + i * 9 + j ];
            }
        }

        return block;
    }

    /**
     * 获取任意有效区域的格子
     * row range: [rowStart, rowEnd) , rowStart is INCLUDED while rowEnd is not
     * col range: [colStart, colEnd)
     * @param {{rowStart: Number, colStart: Number, rowEnd: Number, colEnd: Number}} area 
     * @return {Array<Grid>}
     */
    getPartialGrids(area) {
        let size = (area.rowEnd - area.rowStart) * (area.colEnd - area.colStart);
        if( size <= 0 ) {
            return new Array();
        }
        let part = new Array();

        for(let i = area.rowStart; i < area.rowEnd; i++) {
            for( let j = area.colStart; j < area.colEnd; j++ ) {
                part.push( this.grids[i*9+j] );
            }
        }
        return part;
    }

    /**
     * 将某部分格子的值重设为 0
     * 
     * row range: [rowStart, rowEnd) , rowStart is INCLUDED while rowEnd is not
     * 
     * col range: [colStart, colEnd)
     * @param {{rowStart: Number, colStart: Number, rowEnd: Number, colEnd: Number}} area 
     */
    resetPartialGrids(area) {
        let part = this.getPartialGrids(area);
        part.forEach( grid => {
            grid.value = 0;
            grid.choice = undefined;
        });
    }

    /**
     * 根据 cond 参数获取格子
     * @param {{mode: String, row:Number, col: Number}} cond 
     */
    getGrids(cond) {
        let mode = cond.mode;
        let grids;
        switch (mode) {
            case "row":
            grids = this.getRowGrids( cond.row );
            break;
            case "column":
            grids = this.getColumnGrids( cond.col );
            break;
            case "block":
            grids = this.getBlockGrids( cond.row, cond.col );
            break;
            default: 
            grids = new Array();
            break;
        }
        return grids;
    }

    /**
     * 用户填写第 row 行，第 col 列的值 num
     * @param {Number} row 
     * @param {Number} col 
     * @param {Number} num 
     */
    setNumberAt( row, col, num ) {
        if(     row < 0 || row > 8
            ||  col < 0 || col > 8
            ||  num < 0 || num > 9 ) {
            console.log( "Position or Number is invalid." )
            return;
        }

        let grid = this.grids[row * 9 + col];
        grid.placeValue( num );
    }

    /**
     * 判断当前棋盘是否是有效的数独终盘，若不符合数独的规则，则返回 false
     * @param {Boolean} userPlaced 是否判断用户填写的值
     */
    isValid(userPlaced) {
        let grids;
        let sum = 0;
        let valid = true;
        for(let i = 0; i < 9; i++) {
            grids = this.getRowGrids(i);
            sum = this.sumGrids( grids, userPlaced );
            valid &= ( sum === 45 );
            sum = 0;
        }

        for(let i = 0; i < 9; i++) {
            grids = this.getColumnGrids(i);
            sum = this.sumGrids( grids, userPlaced );
            valid &= ( sum === 45 );
            sum = 0;
        }

        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                grids = this.getBlockGrids(i, j);
                sum = this.sumGrids( grids, userPlaced );
                valid &= ( sum === 45 );
                sum = 0;
            }
        }
        return valid;
    }

    /**
     * 
     * @param {Array<Grid>} grids 
     * @param {Boolean} userPlaced
     */
    sumGrids(grids, userPlaced) {
        let sum = 0;
        grids.forEach(g => {
            if( userPlaced && !g.isVisible()) {
                sum += g.userValue;
            }
            else {
                sum += g.value;
            }
        });
        return sum;
    }
}

Board.width  = 9;
Board.height = 9;

class Game {
    constructor( digTime ) {
        this.board = new Board();
        this.board.init();
        this.digTimes = digTime;

        this.digBoard();
    }

    /**
     * 挖去一部分格子，将属性设为隐藏
     */
    digBoard() {
        let dig = 0, block;
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                for( let k = 0; k < this.digTimes; k++) {
                    block = this.board.getBlockGrids(i, j);
                    dig   = Math.floor( Math.random() * 9 );

                    if( block[dig].isVisible() ) {
                        // avoid duplicated hiding
                        block[dig].setVisible(false);
                    } 
                }
            }
        }
        // Utils.printAll(this.board);
    }

    /**
     * 若返回值为 undefined，说明该位置的值不应该显示出来
     * @param {Number} row 行索引
     * @param {Number} col 列索引
     */
    getValueAt(row, col) {
        let grid = this.board.grids[ row * 9 + col ];
        if( grid.isVisible() )
            return grid.value;

        return undefined
    }

}

Game.DifficutyEasy = 1;
Game.DifficutyNormal = 2;
Game.DifficutyHard = 3;

// export {Game, Board, Grid}