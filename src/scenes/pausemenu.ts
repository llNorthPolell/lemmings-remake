import { UI_BTN_CLICK_COLOR, UI_BTN_COLOR, UI_BTN_HOVER_COLOR } from "../scripts/constants";
import { SCENES } from "../scripts/enums/keys/scenes";
import Context from "../scripts/gameobjects/context";
import Button from "../scripts/gameobjects/ui/button";
import OverlayMenuPanel from "../scripts/gameobjects/ui/overlayMenu";

export default class PauseMenu extends Phaser.Scene{
    constructor(){
        super({
            key:SCENES.PAUSE_MENU, 
            active:true
        });
    }

    preload(){}
    create(){
        const resumeBtn = new Button(
            this,
            "RESUME",
            "RESUME",
            {x:0,y:0},
            350,
            50,
            UI_BTN_COLOR,
            ()=>{resumeBtn.bg.setFillStyle(UI_BTN_CLICK_COLOR)},
            ()=>{
                resumeBtn.bg.setFillStyle(UI_BTN_COLOR);

                Context.paused=false;
                this.game.scene.resume(SCENES.GAMEPLAY);
                this.game.scene.resume(SCENES.HUD);
                
                this.scene.sleep();
            },
            ()=>{resumeBtn!.bg.setFillStyle(UI_BTN_HOVER_COLOR)},
            ()=>{resumeBtn!.bg.setFillStyle(UI_BTN_COLOR)}
        );

        const restartBtn = new Button(
            this,
            "RESTART",
            "RESTART",
            {x:0,y:0},
            350,
            50,
            UI_BTN_COLOR,
            ()=>{restartBtn.bg.setFillStyle(UI_BTN_CLICK_COLOR)},
            ()=>{
                console.log("Restarting");
                restartBtn.bg.setFillStyle(UI_BTN_COLOR);

                Context.paused=false;
                Context.restart=true;
                this.game.scene.resume(SCENES.GAMEPLAY);

                this.game.scene.resume(SCENES.HUD);

                this.scene.sleep();
            },
            ()=>{restartBtn.bg.setFillStyle(UI_BTN_HOVER_COLOR)},
            ()=>{restartBtn.bg.setFillStyle(UI_BTN_COLOR)}
        );
        

        const mainMenuBtn = new Button(
            this,
            "MAIN_MENU",
            "MAIN_MENU",
            {x:0,y:0},
            350,
            50,
            UI_BTN_COLOR,
            ()=>{mainMenuBtn.bg.setFillStyle(UI_BTN_CLICK_COLOR)},
            ()=>{
                mainMenuBtn.bg.setFillStyle(UI_BTN_COLOR);
            },
            ()=>{mainMenuBtn.bg.setFillStyle(UI_BTN_HOVER_COLOR)},
            ()=>{mainMenuBtn.bg.setFillStyle(UI_BTN_COLOR)}
        );

        const overlayMenu = new OverlayMenuPanel(this,[
            resumeBtn,
            restartBtn,
            mainMenuBtn
        ])

        // Needed as setting constructor to false and setting this scene
        // to active will cause scene to skip create()
        this.scene.sleep();
    }
    
    update(){

    }
}