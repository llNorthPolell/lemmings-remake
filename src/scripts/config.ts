import Phaser from "phaser";


export const CANVAS_SIZE = {
    width:800,
    height:800,
}

//const gravity = 0.0981;
export const gravity = 200;

export const config : Phaser.Types.Core.GameConfig= {
    type: Phaser.AUTO,
    scale: {
        width:CANVAS_SIZE.width,
        height:CANVAS_SIZE.height,
    },
    backgroundColor: 0x000000,
    physics: {
       /* default:'matter',
        matter: {
            gravity: {y : gravity}
        }*/
        default: 'arcade',
        arcade:{
            gravity: {y: gravity},
            //debug: true
        }
    },
}

