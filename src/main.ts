

const WIDTH = 10; //一个小格子的宽度
const BOARD_WIDTH = 10;//盘面的宽度
const BOARD_HEIGHT = 20;//盘面的长度
//俄罗斯方块的7种形状
const SHAPE_ARR = 
[
    [ [0,0],[0,1],[0,2],[0,3] ], //长条
    [ [0,0],[0,1],[1,0],[1,1] ],//田
    [ [0,0],[0,1],[0,2],[1,2] ],//L
    [ [1,0],[1,1],[1,2],[0,2] ],//倒L
    [ [0,0],[1,0],[2,0],[1,1] ],//山
    [ [0,0],[1,0],[1,1],[2,1] ],//Z
    [ [0,1],[1,1],[1,0],[2,0] ] //倒Z
];

enum SHAPE {YI,TIAN,L,RL,SHAN,Z,RZ};

const canvas = window.document.getElementById("tetris") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;


class game{
    public score:number ;
    public gameSpeed:number ;
    public startTime:number;
    public currentBlock:block;
    public nextBlock:block;
    public board:board;
    public timer:number;
    public static isGameOver = false;

    public cell1 = new cell(20,20);
    constructor(gameSpeed:number){
        this.score = 0;
        this.gameSpeed = gameSpeed;
        this.startTime = 0;
        //随机生成当前块和下一块
        this.currentBlock = new block(Math.floor(Math.random() * SHAPE_ARR.length));
        this.nextBlock = new block(Math.floor(Math.random() * SHAPE_ARR.length));
        this.board = new board();
        this.timer = 0;
    }

    public start():void{
        this.init();
        this.update();
        this.addEventListener();
    }

    public init():void{
        // let cell1 = new cell(20,20);
        // cell1.drawSelf();
    }
    public update():void{
        let that = this;
        let currentTime = this.startTime;
        function tick(){
            currentTime += 10;
            if((currentTime  - that.startTime)  >that.gameSpeed){
                that.startTime = currentTime;
                
                if(game.isGameOver){
                    context.save();
                    context.fillStyle = "blacK";
                    context.fillText("GAME OVER",BOARD_WIDTH*WIDTH/2,BOARD_HEIGHT*WIDTH/2);
                    context.restore();
                    cancelAnimationFrame(that.timer);
                    return; 	
                }
                console.log("111",that.isCanDown());

                if(that.isCanDown()){
                    that.board.claerMap();
                    that.board.drawMap();
                    that.currentBlock.move(0,1);
                    that.currentBlock.drawSelf();
                }else{
                    that.checkGetScoreAndCleanRow();
                    that.board.claerMap();
                    that.currentBlock.finishMoveAndDrawToMap();
                    that.board.drawMap();
                    that.currentBlock = that.nextBlock;
                    that.nextBlock = new block(Math.floor(Math.random() * SHAPE_ARR.length));
                    that.currentBlock.move(0,1);
                    that.currentBlock.drawSelf();
                }
                
            }
            that.timer = requestAnimationFrame(tick);
        };
        
        requestAnimationFrame(tick);
    }

    /**
     * isCanDown
     * 判断是否能够再往下走
     */
    public isCanDown():boolean {
        return this.currentBlock.isCanDown();
    }

    /**
     * isCanLeft
     * 能否往左走
     */
    public isCanLeft() {
        return this.currentBlock.isCanLfet();
    }


    /**
     * isCanRight
     */
    public isCanRight() {
        return this.currentBlock.isCanRight();
        
    }

    /**
     * isGetScore
     * 判断是否得分并清楚某一行
     */
    public checkGetScoreAndCleanRow():void {
        let i = 0;
        let j = 0;
        for(;i<BOARD_HEIGHT;i++){
            let isGetScore = true;
            for(;j<BOARD_WIDTH;j++){
                if(!board.state[j][i]){
                    isGetScore = false;
                    break;
                }
            }
            if(isGetScore){
                for(let k =0;k<BOARD_WIDTH;k++){
                    board.state[k].splice(i,1);
                    board.state[k].unshift(false);
                }
                this.score++;
            }
        }
    }

    public addEventListener():void{
        let that = this;
        document.onkeydown = function(event){
            var e = event || window.event;
            if(e && e.keyCode == 37 ){ //左
                if(that.isCanLeft()){
                    that.currentBlock.move(-1,0);
                }
            }
            else if(e && e.keyCode == 39){ //右
                if(that.isCanRight()){
                    that.currentBlock.move(1,0);
                }
            }
            else if(e && e.keyCode == 40){
                if(that.isCanDown()){
                    that.currentBlock.move(0,1);
                }
            }
        };
    }
}

class board{

    public static state:boolean[][] = [];

    constructor(){
        for(let i = 0;i<BOARD_HEIGHT;i++){
            let tempArray = [];
            for(let j = 0;j < BOARD_WIDTH;j++){
                tempArray.push(false);
            }
            board.state.push(tempArray);
        }
    }

    /**
     * claerMap
     * 清除栅格上的数据
     */
    public claerMap() {
        context.clearRect(0,0,canvas.width,canvas.height);
    }

    /**
     * drawMap
     * 画地图栅格
     */
    public drawMap() {
        for(let i =0;i<BOARD_WIDTH;i++){
            for(let j=0;j<BOARD_HEIGHT;j++){
                if(board.state[i][j]){
                    context.fillStyle = "blue";
                    context.strokeStyle = "green";
                    context.fillRect(i * WIDTH,j * WIDTH , WIDTH ,WIDTH);
                    context.strokeRect(i * WIDTH,j * WIDTH , WIDTH ,WIDTH);
                }else{
                    context.fillStyle = "white";
                    context.fillRect(i * WIDTH,j * WIDTH , WIDTH ,WIDTH);
                    context.strokeStyle = "gray";
                    context.strokeRect(i * WIDTH,j * WIDTH , WIDTH ,WIDTH);
                }
            }
        }
    }
}



class block{
    public position:cell[] = [];
    public type:SHAPE;

    constructor(type:SHAPE){
        this.type = type;
        for(let i = 0 ; i < 4 ; i++){
            this.position.push(new cell(SHAPE_ARR[type][i][0] + Math.floor(BOARD_WIDTH / 2) -1
                ,SHAPE_ARR[type][i][1])) ;
        }
    }

    /**
     * drawSelf
     * 把自己画出来
     */
    public drawSelf():void {
        if(this.position.length == 4){
            for(let i = 0;i<this.position.length;i++){
                this.position[i].drawSelf();
            }
        }
    }

    /**
     * move
     * 向左或者向右移动
     */
    public move(x:number,y:number):void {
        if(this.position.length == 4){
            for(let i = 0;i<this.position.length;i++){
                this.position[i].move(x,y);
            }
        }
    }
    
    /**
     * rotate
     *顺时针旋转
     */
    public rotate():void {
        switch(this.type){
            case SHAPE.YI:

                break;
        }
    }

    /**
     * isCanDown
     * 是否还能往下走
     */
    public isCanDown():boolean {
        if(this.position.length == 4){
            for(let i = 0;i<this.position.length;i++){
                if(this.position[i].y == BOARD_HEIGHT -1 
                    || board.state[this.position[i].x][(this.position[i].y)+1]){
                        if(this.position[i].y <= 1){
                            game.isGameOver = true;
                        }
                        return false;
                    }
            }
        }
        //this.isGameOver = false;
        return true;
    }

    /**
     * isCanLfet
     */
    public isCanLfet():boolean {
        if(this.position.length == 4){
            for(let i = 0;i<this.position.length;i++){
                if(this.position[i].x == 0 
                    || board.state[this.position[i].x-1][this.position[i].y]){
                        return false;
                    }
            }
        }
        return true;
    }

    /**
     * isCanRight
     */
    public isCanRight():boolean {
        if(this.position.length == 4){
            for(let i = 0;i<this.position.length;i++){
                if(this.position[i].x == BOARD_WIDTH - 1 
                    || board.state[this.position[i].x+1][this.position[i].y]){
                        return false;
                    }
            }
        }
        return true;
    }

    /**
     * FinishMoveAndDrawToMap
     * 结束移动并且将其固定在地图上
     */
    public finishMoveAndDrawToMap():void {
        if(this.position.length == 4){
            for(let i = 0;i<this.position.length;i++){
                board.state[this.position[i].x][this.position[i].y] = true;
            }
        }
    }
}

class cell{
    public x:number;
    public y:number;

    constructor(x:number,y:number){
        this.x = x;
        this.y = y;
    }

    /**
     * drawSelf
     * 把自己画出来
     */
    public drawSelf():void {
        context.fillStyle = "blue";
        context.strokeStyle = "green";
        context.fillRect(this.x * WIDTH,this.y * WIDTH,WIDTH,WIDTH);
        context.strokeRect(this.x* WIDTH,this.y* WIDTH,WIDTH,WIDTH);
    }

    /**
     * move
     * 移动
     */
    public move(x:number,y:number):void {
        this.x += x ;
        this.y += y ;
    }
}


let myGame = new game(100);
myGame.start();