import Context from "./context";
import { Position } from "./gameobject";
import { LEMMING_SIZE } from "./lemming";

export default class SelectionBox{
    private show: boolean;
    private box : Phaser.GameObjects.Rectangle;

    constructor(position:Position){
        this.box=Context.scene.add.rectangle(
            position.x,
            position.y,
            LEMMING_SIZE.width+1,
            LEMMING_SIZE.height+1
        );
        this.box.setStrokeStyle(1,0xffff00);
        this.show=false;
        this.box.setVisible(this.show);
    }

    update(){
        if (!Context.selected){ 
            if (this.show){ 
                this.show=false;
                this.box.setVisible(this.show);
            }
            return;
        }

        if (!this.show) {
            this.show=true;
            this.box.setVisible(this.show);
        }
        const position = Context.selected?.getPosition()!;
        this.box.setPosition(position.x, position.y);
    }
}