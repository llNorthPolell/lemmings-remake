import Phaser from "phaser";


const canvasSize = {
    width:800,
    height:800,
}

//const gravity = 0.0981;
const gravity = 200;

export const config = {
    type: Phaser.AUTO,
    scale: {
        width:canvasSize.width,
        height:canvasSize.height,
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
            debug: true
        }
    }
}

