import { CANVAS_SIZE } from "../../config";
import { UI_BG_COLOR } from "../../constants";
const PADDING :number = 25;

export default class OverlayMenuPanel{
    private container: Phaser.GameObjects.Container;
    private bg:Phaser.GameObjects.Rectangle;
    private overlay? : Phaser.GameObjects.Rectangle;

    private children: Phaser.GameObjects.Container[];
    

    constructor(scene:Phaser.Scene, children:Phaser.GameObjects.Container[]){
        this.container = scene.add.container(0,0);
        this.overlay = scene.add.rectangle(0,0,CANVAS_SIZE.width, CANVAS_SIZE.height,0x000000,0.5).setOrigin(0);

        this.bg = scene.add.rectangle(
            CANVAS_SIZE.width/4,
            CANVAS_SIZE.height/4,
            CANVAS_SIZE.width/2,
            children.length * (CANVAS_SIZE.height/16+PADDING) + (PADDING*2),
            UI_BG_COLOR)
            .setOrigin(0);


        this.container.add(this.overlay);
        this.container.add(this.bg);

        this.children=children;

        for (let i =0;i<this.children.length; i++){
            const child = this.children[i];
            const x = this.bg.x+PADDING;
            const y = this.bg.y+PADDING+(i*this.bg.height/this.children.length);
            child.setPosition(x,y);
            this.container.add(child);
        }

        this.container.setScrollFactor(0);
    }
}