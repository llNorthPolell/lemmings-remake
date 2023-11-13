import { UI_BTN_CLICK_COLOR, UI_BTN_COLOR, UI_BTN_HOVER_COLOR } from "../scripts/constants";
import { SCENES } from "../scripts/enums/keys/scenes";
import Context from "../scripts/gameobjects/context";
import Button from "../scripts/gameobjects/ui/button";
import HUDPanel from "../scripts/gameobjects/ui/hudPanel";

export default class HUD extends Phaser.Scene{
    private HUDPanel? : HUDPanel;
    private pauseButton?: Button;
    
    constructor(){
        super({
            key: SCENES.HUD,
            active:true
        });
    }

    preload(){

    }

    create(){
        this.HUDPanel= new HUDPanel(this);
        
        this.pauseButton=new Button(
            this,
            "PAUSE",
            "PAUSE",
            {x:0,y:0},
            50,
            20,
            UI_BTN_COLOR,
            ()=>{this.pauseButton!.bg.setFillStyle(UI_BTN_CLICK_COLOR)},
            ()=>{
                this.pauseButton!.bg.setFillStyle(UI_BTN_COLOR);
                Context.paused=true;

                this.game.scene.pause(SCENES.GAMEPLAY);
        
                const pauseMenu = this.scene.get(SCENES.PAUSE_MENU).scene;
                pauseMenu.wake();

                this.scene.pause();
            },
            ()=>{this.pauseButton!.bg.setFillStyle(UI_BTN_HOVER_COLOR)},
            ()=>{this.pauseButton!.bg.setFillStyle(UI_BTN_COLOR)},
        );
        this.add.container(725,5,this.pauseButton);

    }

    update(){
        this.HUDPanel!.update();

        if (!Context.paused && !this.pauseButton!.visible)
            this.pauseButton!.setVisible(true);
    }
}