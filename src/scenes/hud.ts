import { SCENES } from "../scripts/enums/keys/scenes";
import UIPanel from "../scripts/gameobjects/ui/ui";

export default class HUD extends Phaser.Scene{
    private uiPanel : UIPanel|undefined;

    
    constructor(){
        super({
            key: SCENES.HUD,
            active:true
        });
    }

    preload(){

    }

    create(){
        this.uiPanel= new UIPanel(this);
    }


    update(){
        this.uiPanel!.update();
    }
}