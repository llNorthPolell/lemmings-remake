import { CANVAS_SIZE } from "../../config";
import { LemmingTask } from "../../enums/lemmingTasks";
import Context from "../context";
import Button from "./button";
import Counter from "./counter";

const UI_BG_COLOR=0x004455;
const UI_BTN_COLOR=0x002233;
const UI_BTN_CLICK_COLOR=0x001122;
const UI_BTN_HOVER_COLOR=0x007788;
const UI_COUNTER_COLOR=0x001122;

export default class UIPanel {
    private uiContainer : Phaser.GameObjects.Container;
    private bg : Phaser.GameObjects.Rectangle;
    private progressText: Phaser.GameObjects.Text;

    private blockCounter: Counter;
    private blockButton: Button;

    private digSidewaysCounter: Counter;
    private digSidewaysButton: Button;

    private digDownCounter: Counter;
    private digDownButton: Button;

    private parachuteCounter: Counter;
    private parachuteButton: Button;

    private selfDestructButton: Button;

    constructor(hudScene: Phaser.Scene){
        this.uiContainer = hudScene.add.container(0,600);
        this.bg = hudScene.add.rectangle(0,0,CANVAS_SIZE.width,CANVAS_SIZE.height/4,UI_BG_COLOR).setOrigin(0,0);
        this.bg.depth=Infinity;

        this.progressText = hudScene.add.text(
            400,
            0,
            "Out: 0  In: 0%  Required: 0");


        this.blockCounter = new Counter(
            hudScene,
            "BLOCK",
            String(Context.inventory.numBlocks),
            {x:10,y:40},
            100,
            20,
            UI_COUNTER_COLOR
        );

        this.blockButton = new Button(
            hudScene,
            "BLOCK",
            "\n\n\n\n\nBLOCK",
            {x:10,y:60},
            100,
            130,
            UI_BTN_COLOR,
            ()=>{this.btnDownEffect(this.blockButton)},
            ()=>{
                if (Context.inventory.numBlocks==0) return;
                const lemming = Context.selected;
                if (!lemming) return;
                if (lemming.getTask()!==LemmingTask.IDLE) return;
                lemming.assignBlock();
                Context.inventory.numBlocks--;
                this.resetBtnEffect(this.blockButton);
            },
            ()=>{this.btnHoverEffect(this.blockButton)},
            ()=>{this.resetBtnEffect(this.blockButton)}
        );


        this.digSidewaysCounter = new Counter(
            hudScene,
            "DIG_SDWY",
            String(Context.inventory.numDigSideways),
            {x:120,y:40},
            100,
            20,
            UI_COUNTER_COLOR
        );

        this.digSidewaysButton = new Button(
            hudScene,
            "DIG_SDWY",
            "\n\n\n\n\nDIG_SDWY",
            {x:120,y:60},
            100,
            130,
            UI_BTN_COLOR,
            ()=>{this.btnDownEffect(this.digSidewaysButton)},
            ()=>{
                if (Context.inventory.numDigSideways==0) return;
                const lemming = Context.selected;
                if (!lemming) return;
                if (lemming.getTask()!==LemmingTask.IDLE) return;
                lemming.assignDigSideways();
                Context.inventory.numDigSideways--;
                this.resetBtnEffect(this.digSidewaysButton);
            },
            ()=>{this.btnHoverEffect(this.digSidewaysButton)},
            ()=>{this.resetBtnEffect(this.digSidewaysButton)}
        );

        this.digDownCounter = new Counter(
            hudScene,
            "DIG_DOWN",
            String(Context.inventory.numDigDowns),
            {x:230,y:40},
            100,
            20,
            UI_COUNTER_COLOR
        );

        this.digDownButton = new Button(
            hudScene,
            "DIG_DOWN",
            "\n\n\n\n\nDIG_DOWN",
            {x:230,y:60},
            100,
            130,
            UI_BTN_COLOR,
            ()=>{this.btnDownEffect(this.digDownButton)},
            ()=>{
                if (Context.inventory.numDigDowns==0) return;
                const lemming = Context.selected;
                if (!lemming) return;
                if (lemming.getTask()!==LemmingTask.IDLE) return;
                lemming.assignDigDown();
                Context.inventory.numDigDowns--;
                this.resetBtnEffect(this.digDownButton);
            },
            ()=>{this.btnHoverEffect(this.digDownButton)},
            ()=>{this.resetBtnEffect(this.digDownButton)}
        );

        this.parachuteCounter = new Counter(
            hudScene,
            "PARACHUTE",
            String(Context.inventory.numParachutes),
            {x:340,y:40},
            100,
            20,
            UI_COUNTER_COLOR
        );
        
        this.parachuteButton = new Button(
            hudScene,
            "PARACHUTE",
            "\n\n\n\n\nPARACHUTE",
            {x:340,y:60},
            100,
            130,
            UI_BTN_COLOR,
            ()=>{this.btnDownEffect(this.parachuteButton)},
            ()=>{
                if (Context.inventory.numParachutes==0) return;
                const lemming = Context.selected;
                if (!lemming) return;
                if (lemming.getTask()!==LemmingTask.IDLE) return;
                console.log("SET PARACHUTE");
                Context.inventory.numParachutes--;
                this.resetBtnEffect(this.parachuteButton);
            },
            ()=>{this.btnHoverEffect(this.parachuteButton)},
            ()=>{this.resetBtnEffect(this.parachuteButton)}
        );

        this.selfDestructButton = new Button(
            hudScene,
            "SELF_DESTRUCT",
            `\n\n\n\n\nSELF\nDESTRUCT`,
            {x:450,y:40},
            100,
            150,
            UI_BTN_COLOR,
            ()=>{this.btnDownEffect(this.selfDestructButton)},
            ()=>{
                console.log("SET SELF_DESTRUCT");
                this.resetBtnEffect(this.selfDestructButton);
            },
            ()=>{this.btnHoverEffect(this.selfDestructButton)},
            ()=>{this.resetBtnEffect(this.selfDestructButton)}
        );

        this.uiContainer.add(this.bg);
        this.uiContainer.add(this.progressText);
        this.uiContainer.add(this.blockCounter);
        this.uiContainer.add(this.blockButton);
        this.uiContainer.add(this.digSidewaysCounter);
        this.uiContainer.add(this.digSidewaysButton);
        this.uiContainer.add(this.digDownCounter);
        this.uiContainer.add(this.digDownButton);
        this.uiContainer.add(this.parachuteCounter);
        this.uiContainer.add(this.parachuteButton);
        this.uiContainer.add(this.selfDestructButton);

        this.uiContainer.setScrollFactor(0);
    }

    private resetBtnEffect= (btn:Button)=>{
        btn.bg.setFillStyle(UI_BTN_COLOR);
    }

    private btnHoverEffect= (btn:Button)=>{
        btn.bg.setFillStyle(UI_BTN_HOVER_COLOR);
    }

    private btnDownEffect = (btn:Button)=>{
        btn.bg.setFillStyle(UI_BTN_CLICK_COLOR);
    }


    update(){
        this.blockCounter.updateValue(Context.inventory.numBlocks);
        this.digSidewaysCounter.updateValue(Context.inventory.numDigSideways);
        this.digDownCounter.updateValue(Context.inventory.numDigDowns);
        this.parachuteCounter.updateValue(Context.inventory.numParachutes);
        this.progressText.setText(`Out:${Context.lemmingsOut}  `+  
            `In:${Context.lemmingsSaved/Context.lemmingsRequired*100}%  `+
            `Required: ${Context.lemmingsRequired}`)
    }
}