import { GameObject } from "./gameobject";
import { LemmingStates } from "../enums/lemmingStates";
import { Direction } from "../enums/direction";
import { ANIMS } from "../enums/keys/animations";
import { ASSETS } from "../enums/keys/assets";
import { LemmingTask } from "../enums/lemmingTasks";
import StateManager, { State } from "./components/stateManager";
import Context from "./context";
import SensorBox from "./components/sensorBox";


const MOVESPEED = 25;
const LEMMING_SIZE = {width:16, height:16};

export default class Lemming extends GameObject{
    private id: string;

    // lemming specific
    private sprite : Phaser.Physics.Arcade.Sprite;
    private lemmingFrontSensor : SensorBox;
    private lemmingGroundSensor : SensorBox;

    private stateManager : StateManager
    private task: LemmingTask;
    private direction: Direction;
    private animation: string;

    private standingTile?:  Phaser.Tilemaps.Tile;
    private bumpTile?: Phaser.Tilemaps.Tile;

    // states
    private idle? : State; 
    private falling? : State;  
    private digDown? : State; 
    private digSideways? : State; 
    private blocking? : State; 

    constructor(id:string, position: {x:number, y: number}){
        super({x:position.x, y:position.y});
        this.id = id;

        this.task = LemmingTask.IDLE;
        this.direction=Direction.RIGHT;
        this.animation = ANIMS.FALLING;

        this.sprite = Context.physics.add.sprite(
            position.x,
            position.y, 
            ASSETS.LEMMING_SPRITESHEET
        );

        // for detecting if lemming is running into a wall
        this.lemmingFrontSensor=new SensorBox(
            Context,
            {x:0,y:0},
            LEMMING_SIZE.width/4,
            LEMMING_SIZE.height/4,
            0xffff00,
            0.5,
            (frontSensor,tile)=>{
                if (tile !== this.bumpTile){
                    this.bumpTile = tile as Phaser.Tilemaps.Tile;
                }
            },
            (frontSensor, tile)=>{
                return (tile as  Phaser.Tilemaps.Tile).collides;
            },
        );


        // for detecting if lemming is standing on ground
        this.lemmingGroundSensor=new SensorBox(
            Context,
            {x:0,y:0},
            LEMMING_SIZE.width/4,
            LEMMING_SIZE.height/4,
            0x00ffff,
            0.5,
            (frontSensor,tile)=>{
                if (tile !== this.standingTile){
                    this.standingTile = tile as Phaser.Tilemaps.Tile;
                }
            },
            (frontSensor, tile)=>{
                return (tile as  Phaser.Tilemaps.Tile).collides;
            },
        );

        // for stopping lemming from falling through ground
        Context.physics.add.collider(this.sprite, Context.tileImageLayer); 
        Context.lemmingColliders!.add(this.sprite);

        this.initStates();
        this.stateManager = new StateManager(this.falling!);

        this.sprite.setInteractive().on(
            Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
            ()=>{
                console.log("selected lemming #" + this.id);
                Context.selected = this;
            }
        )
    }


    private initStates(){       
        this.falling = {
            name: LemmingStates.FALLING,
            entryCondition: ()=>{return !this.isTouchingGround()},
            onUpdate: ()=>{this.doFalling()}
        }
        
        this.digDown = {
            name: LemmingStates.DIG_DOWN,
            entryCondition: ()=>{return this.canDigDown()},
            onUpdate: ()=>{this.doDigDown()}
        }
        
        this.digSideways = {
            name: LemmingStates.DIG_SIDEWAYS,
            entryCondition: ()=>{return this.canDigSideways()},
            onUpdate: ()=>{this.doDigSideways()}
        }

        this.blocking = {
            name:LemmingStates.BLOCKING,
            entryCondition: ()=>{return this.canBlock()},
            onEnter: ()=>{this.doBlockingEnter()}
        }

        this.idle = {
            name: LemmingStates.IDLE,
            nextState: [this.falling,this.digDown, this.blocking, this.digSideways],
            entryCondition: ()=>{return this.isTouchingGround()},
            onUpdate: ()=>{this.doIdle()}
        }

        this.falling.nextState=this.idle;
        this.digDown.nextState=[this.falling];
        this.digSideways.nextState=[this.idle,this.falling];
        this.blocking.nextState=this.falling;
    }

    private turnAround(){
        if (this.direction===Direction.RIGHT)
            this.direction=Direction.LEFT;
        else if (this.direction===Direction.LEFT)
            this.direction=Direction.RIGHT;
        
    }

    getSprite(){
        return this.sprite;
    }

    getTask(){
        return this.task;
    }

    getState(){
        return this.stateManager.getState();
    }
    
    cancelTask(){
        if (this.task===LemmingTask.IDLE) return;
        if (this.stateManager.getState()!.name==LemmingStates.IDLE)
            this.task = LemmingTask.IDLE;
    }

    private setSlopeMovement(slopeAngle:number){
        this.sprite.setRotation(slopeAngle);
        this.sprite.setOffset(0,-10);
    }

    private updateVelocity(){
        const state = this.stateManager.getState();
        if (state===this.idle){
            if (this.direction===Direction.RIGHT)
                this.sprite.setVelocityX(MOVESPEED);
            else if (this.direction===Direction.LEFT)
                this.sprite.setVelocityX(-MOVESPEED);
        }
        else this.sprite.setVelocityX(0);      
    }

    private updateAnimation(){
        let animation = this.animation;
        const state = this.stateManager.getState();
        if (state===this.idle)
            switch(this.direction){
                case Direction.LEFT:  
                    animation=ANIMS.IDLE_LEFT;
                    break;
                case Direction.RIGHT:
                    animation=ANIMS.IDLE_RIGHT;
                    break;
                default:
                    break;
            }
        else if (state===this.falling)
            animation=ANIMS.FALLING;
        else if (state===this.digDown)
            animation=ANIMS.DIG_DOWN;
        else if (state===this.blocking){
            animation=ANIMS.BLOCKING;
        }

        if (this.animation !== animation){
            this.animation = animation;
            this.sprite.play(this.animation);
        }
    }

    private isTouchingGround(){
        return this.sprite.body!.blocked.down;
    }

    private doIdle(){
        if (!this.isTouchingGround() /*&& !standingTile */){
            this.stateManager.tryNext(LemmingStates.FALLING);
            return;
        }

        const body = this.sprite.body!;
        if (this.task !== LemmingTask.DIG_SIDEWAYS){
            if ((body.blocked.left && this.direction===Direction.LEFT) || 
                (body.blocked.right && this.direction===Direction.RIGHT)){
                this.turnAround();
                return;
            }
        }
          
        if (this.standingTile){
            const properties = this.standingTile.properties;
            const tileBotY = this.standingTile.getBottom();     
            const tileLeftX = this.standingTile.getLeft();

            /*if (properties?.slopeTile){
                // let tileLeftX = x_1, m=properties.slopeValue
                // let x_0 = 0, y_0 = b (result from y=mx+b when x=0)
                // y_0-y_1 / x_0-x_1 = m


                // properties.leftHeight is value between 0 and 1 to represent height between 0 and 24 in Tiled properties
                const y1 = ((-properties.leftHeight)*24) + tileBotY;
                
                // b= (m*deltaX)+y_1, where deltaX=x_0-x_1=0-x_1=-x_1
                const deltaX = -tileLeftX 
                const b = (properties.slopeValue * deltaX)+y1; // if m=-0.375,deltaX=-96,y1=216, then b=252


                //console.log(`m=${properties.slopeValue},deltaX=${deltaX},b=${b},y1=${y1}`);

                // lemming height = 16, and sprite coordinates are top left corner. Take bottom right corner instead.
                const correctedY=(properties.slopeValue*(body.x))+b;
                
                // since offsets can only be applied from top right corner, add lemming height back
                const offsetY=(b-correctedY)-40;
                console.log("Corrected Y: " + correctedY+ ", Offset Y:" + offsetY);
                body.setOffset(16, offsetY-16);
            }
            else {
                body.setOffset(0,0);
            }*/
        }

        switch (this.task){
            case LemmingTask.BLOCK:
                this.stateManager.tryNext(LemmingStates.BLOCKING);
                break;
            case LemmingTask.DIG_DOWN:
                this.stateManager.tryNext(LemmingStates.DIG_DOWN);
                break;
            case LemmingTask.DIG_SIDEWAYS:
                this.stateManager.tryNext(LemmingStates.DIG_SIDEWAYS);  
                break;
            default:
                break;
        }   
    }

    private doFalling(){
        const body = this.sprite.body!;
        if (body.offset.y !=0)
            body.setOffset(0,0);

        if (this.isTouchingGround() && this.standingTile){
            this.stateManager.tryNext(LemmingStates.IDLE);
            return;
        }
        this.standingTile=undefined;
    }

    assignDigSideways(){
        this.task = LemmingTask.DIG_SIDEWAYS;
    }

    canDigSideways(){
        const body = this.sprite.body!;
        return (
            (body.blocked.right||body.blocked.left)
            && this.task===LemmingTask.DIG_SIDEWAYS
            && this.bumpTile!=undefined
        );
    }

    private doDigSideways() {
        const body = this.sprite.body!;
        if ((body.blocked.right && this.direction===Direction.RIGHT) || 
            (body.blocked.left && this.direction===Direction.LEFT))
            setTimeout(() => {
                console.log("Destroy tile at X=" + this.bumpTile!.x);
                Context.tileImageLayer?.removeTileAt(this.bumpTile!.x, this.bumpTile!.y);
                this.stateManager.tryNext(LemmingStates.IDLE);

                const nextTileX = this.bumpTile!.x + (
                    (this.direction === Direction.LEFT) ? -1 : +1
                );

                if (!Context.tileImageLayer.getTileAt(nextTileX, this.bumpTile!.y))
                    this.task = LemmingTask.IDLE;
            }, 5000)

    }

    assignBlock(){
        this.task=LemmingTask.BLOCK;
    }

    canBlock(){
        return this.isTouchingGround() && this.task===LemmingTask.BLOCK;
    }

    private doBlockingEnter(){
        console.log("Blocking");
        this.sprite.body!.immovable=true;
        Context.physics.add.collider(this.sprite,Context.lemmingColliders);

    }

    assignDigDown(){
        this.task=LemmingTask.DIG_DOWN;
    }

    canDigDown(){
        return this.isTouchingGround() && this.task===LemmingTask.DIG_DOWN;
    }

    private doDigDown(){
        const body = this.sprite.body!;
        const tileToRemoveX = Math.floor(body.x/32);
        const tileToRemoveY = Math.floor(body.y/24)+1;
        body.position.x = (tileToRemoveX*32)+8;    // center lemming on tile to dig

        setTimeout(()=>{   
            Context.tileImageLayer?.removeTileAt(tileToRemoveX,tileToRemoveY);
            
            let nextTileY = tileToRemoveY+1;

            if (!Context.tileImageLayer.getTileAt(tileToRemoveX,nextTileY)){
                this.task=LemmingTask.IDLE;
                this.stateManager.tryNext(LemmingStates.FALLING);
            }
        },5000)
    }


    private updateFrontSensor(){
        let x = this.sprite.x;
        if (this.direction===Direction.RIGHT)
            x+=LEMMING_SIZE.width;
        else if (this.direction===Direction.LEFT) 
            x-=LEMMING_SIZE.width;
        
        if (x!== this.sprite.x)
            this.lemmingFrontSensor.setPosition(x,this.sprite.y);
    }

    private updateGroundSensor(){
        this.lemmingGroundSensor.setPosition(this.sprite.x,this.sprite.y + LEMMING_SIZE.height);
    }

    update(){
        this.stateManager.update();
        this.updateAnimation();
        this.updateVelocity();
        this.updateFrontSensor();
        this.updateGroundSensor();
    }
}

