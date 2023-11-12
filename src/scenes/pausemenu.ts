import { CANVAS_SIZE } from "../scripts/config";
import { UI_BG_COLOR, UI_BTN_CLICK_COLOR, UI_BTN_COLOR, UI_BTN_HOVER_COLOR } from "../scripts/constants";
import { SCENES } from "../scripts/enums/keys/scenes";
import Context from "../scripts/gameobjects/context";
import Button from "../scripts/gameobjects/ui/button";

export default class PauseMenu extends Phaser.Scene{
    private pauseContainer?: Phaser.GameObjects.Container;
    private bg?:Phaser.GameObjects.Rectangle;
    private overlay? : Phaser.GameObjects.Rectangle;

    private resumeBtn?: Button;
    private restartBtn?: Button;
    private mainMenuBtn?: Button;
    
    constructor(){
        super({
            key:SCENES.PAUSE_MENU, 
            active:true
        });
    }

    preload(){}
    create(){
        this.pauseContainer = this.add.container(0,0);
        this.overlay = this.add.rectangle(0,0,CANVAS_SIZE.width, CANVAS_SIZE.height,0x000000,0.5).setOrigin(0);
        this.bg = this.add.rectangle(
            CANVAS_SIZE.width/4,
            CANVAS_SIZE.height/4,
            CANVAS_SIZE.width/2,
            CANVAS_SIZE.height/3,
            UI_BG_COLOR)
            .setOrigin(0);
        
        this.resumeBtn = new Button(
            this,
            "RESUME",
            "RESUME",
            {x:this.bg.x+25,y:this.bg.y+25},
            350,
            50,
            UI_BTN_COLOR,
            ()=>{this.resumeBtn!.bg.setFillStyle(UI_BTN_CLICK_COLOR)},
            ()=>{
                this.resumeBtn!.bg.setFillStyle(UI_BTN_COLOR);

                Context.paused=false;
                this.game.scene.resume(SCENES.GAMEPLAY);
                this.game.scene.resume(SCENES.HUD);
                
                this.scene.setVisible(false);
                this.scene.setActive(false);
            },
            ()=>{this.resumeBtn!.bg.setFillStyle(UI_BTN_HOVER_COLOR)},
            ()=>{this.resumeBtn!.bg.setFillStyle(UI_BTN_COLOR)}
        );

        this.restartBtn = new Button(
            this,
            "RESTART",
            "RESTART",
            {x:this.bg.x+25,y:this.bg.y+100},
            350,
            50,
            UI_BTN_COLOR,
            ()=>{this.restartBtn!.bg.setFillStyle(UI_BTN_CLICK_COLOR)},
            ()=>{
                this.restartBtn!.bg.setFillStyle(UI_BTN_COLOR);

                Context.paused=false;
                Context.restart=true;
                this.game.scene.resume(SCENES.GAMEPLAY);

                this.game.scene.resume(SCENES.HUD);

                this.scene.setVisible(false);
                this.scene.setActive(false);
            },
            ()=>{this.restartBtn!.bg.setFillStyle(UI_BTN_HOVER_COLOR)},
            ()=>{this.restartBtn!.bg.setFillStyle(UI_BTN_COLOR)}
        );
        

        this.mainMenuBtn = new Button(
            this,
            "MAIN_MENU",
            "MAIN_MENU",
            {x:this.bg.x+25,y:this.bg.y+175},
            350,
            50,
            UI_BTN_COLOR,
            ()=>{this.mainMenuBtn!.bg.setFillStyle(UI_BTN_CLICK_COLOR)},
            ()=>{
                this.mainMenuBtn!.bg.setFillStyle(UI_BTN_COLOR);
            },
            ()=>{this.mainMenuBtn!.bg.setFillStyle(UI_BTN_HOVER_COLOR)},
            ()=>{this.mainMenuBtn!.bg.setFillStyle(UI_BTN_COLOR)}
        );

        this.resumeBtn.bg.setOrigin(0);

        this.pauseContainer.add(this.overlay);
        this.pauseContainer.add(this.bg);
        this.pauseContainer.add(this.resumeBtn);
        this.pauseContainer.add(this.restartBtn);    
        this.pauseContainer.add(this.mainMenuBtn); 

        this.pauseContainer.setScrollFactor(0);


        // Needed as setting constructor to false and setting this scene
        // to active will cause scene to skip create()
        this.scene.setVisible(false);
        this.scene.setActive(false);
    }
    update(){

    }
}