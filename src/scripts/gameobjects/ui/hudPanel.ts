import { CANVAS_SIZE } from "../../config";
import { UI_BG_COLOR, UI_BTN_CLICK_COLOR, UI_BTN_COLOR, UI_BTN_HOVER_COLOR, UI_COUNTER_COLOR } from "../../constants";
import { LemmingTask } from "../../enums/lemmingTasks";
import Context from "../context";
import Button from "./button";
import Counter from "./counter";

export default class HUDPanel {
    private hudContainer : Phaser.GameObjects.Container;
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
        this.hudContainer = hudScene.add.container(0,600);
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
                lemming.assignParachute();
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
                const lemming = Context.selected;
                if (!lemming) return;
                if (lemming.getTask()!==LemmingTask.IDLE && lemming.getTask()!==LemmingTask.BLOCK) return;
                lemming.assignSelfDestruct();
                this.resetBtnEffect(this.selfDestructButton);
            },
            ()=>{this.btnHoverEffect(this.selfDestructButton)},
            ()=>{this.resetBtnEffect(this.selfDestructButton)}
        );

        this.hudContainer.add(this.bg);
        this.hudContainer.add(this.progressText);
        this.hudContainer.add(this.blockCounter);
        this.hudContainer.add(this.blockButton);
        this.hudContainer.add(this.digSidewaysCounter);
        this.hudContainer.add(this.digSidewaysButton);
        this.hudContainer.add(this.digDownCounter);
        this.hudContainer.add(this.digDownButton);
        this.hudContainer.add(this.parachuteCounter);
        this.hudContainer.add(this.parachuteButton);
        this.hudContainer.add(this.selfDestructButton);

        this.hudContainer.setScrollFactor(0);
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

        const progress = Math.round(Context.lemmingsSaved/Context.lemmingsRequired*100);
        
        this.progressText.setText(`Out:${Context.lemmingsOut}  `+  
            `In:${(progress>100)?100: progress}%  `+
            `Required: ${Context.lemmingsRequired}`)
    }
}