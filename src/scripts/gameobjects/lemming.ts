import { GameObject } from "./gameobject";
import { LemmingStates } from "../enums/lemmingStates";
import { Direction } from "../enums/direction";
import { ANIMS } from "../enums/keys/animations";
import { ASSETS } from "../enums/keys/assets";
import { LemmingTask } from "../enums/lemmingTasks";
import StateManager, { State } from "./components/stateManager";
import Context from "./context";
import SensorBox from "./components/sensorBox";


export const MOVESPEED = 25;
export const LEMMING_SIZE = {width:16, height:16};

export default class Lemming extends GameObject{
    // lemming specific
    private lemmingFrontSensor : SensorBox;
    private lemmingGroundSensor : SensorBox;

    private stateManager : StateManager
    private task: LemmingTask;
    private direction: Direction;
    private animation: string;

    private standingTile?:  Phaser.Tilemaps.Tile;
    private bumpTile?: Phaser.Tilemaps.Tile;

    private isDeadOnImpact: boolean;

    // states
    private idle? : State; 
    private falling? : State;  
    private digDown? : State; 
    private digSideways? : State; 
    private blocking? : State; 
    private selfDestruct? : State;
    private exit? : State;
    private fallDead? : State;

    constructor(id:string, position: {x:number, y: number}){
        super(id, Context.physics.add.sprite(
            position.x,
            position.y, 
            ASSETS.LEMMING_SPRITESHEET
        ));

        this.task = LemmingTask.IDLE;
        this.direction=Direction.RIGHT;
        this.animation = ANIMS.FALLING;
        this.sprite?.setOrigin(0.5);
        this.isDeadOnImpact=false;

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
        Context.physics.add.collider(this.sprite!, Context.tileImageLayer); 
        Context.lemmingColliders!.add(this.sprite!);

        this.initStates();
        this.stateManager = new StateManager(this.falling!);

        this.sprite!.setInteractive().on(
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

        this.exit = {
            name: LemmingStates.EXIT,
            entryCondition: ()=>{return this.canExit()},
            onEnter: ()=>{return this.exitDoor()}
        }

        this.selfDestruct = {
            name: LemmingStates.SELF_DESTRUCT,
            entryCondition: ()=>{return this.canSelfDestruct()},
            onEnter: ()=>{return this.doSelfDestruct()}
        }

        this.idle = {
            name: LemmingStates.IDLE,
            nextState: [
                this.falling,
                this.digDown, 
                this.blocking, 
                this.digSideways, 
                this.selfDestruct, 
                this.exit],
            entryCondition: ()=>{return this.isTouchingGround()},
            onUpdate: ()=>{this.doIdle()}
        }

        this.fallDead = {
            name:LemmingStates.FALL_DEAD,
            entryCondition: ()=>{return this.isDeadOnImpact},
            onEnter: ()=>{this.killLemming()}
        }

        this.falling.nextState=[this.idle,this.fallDead, this.selfDestruct];
        this.digDown.nextState=[this.falling];
        this.digSideways.nextState=[this.idle,this.falling];
        this.blocking.nextState=[this.falling, this.selfDestruct];
    }

    private turnAround(){
        if (this.direction===Direction.RIGHT)
            this.direction=Direction.LEFT;
        else if (this.direction===Direction.LEFT)
            this.direction=Direction.RIGHT;
        
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
        const sprite = this.sprite! as Phaser.Physics.Arcade.Sprite;
        sprite.setRotation(slopeAngle);
        sprite.setOffset(0,-10);
    }

    private updateVelocity(){
        const sprite = this.sprite! as Phaser.Physics.Arcade.Sprite;
        const state = this.stateManager.getState();
        if (state===this.idle){
            if (this.direction===Direction.RIGHT)
                sprite!.setVelocityX(MOVESPEED);
            else if (this.direction===Direction.LEFT)
                sprite!.setVelocityX(-MOVESPEED);
        }
        else sprite!.setVelocityX(0);      
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
        else if (state===this.blocking)
            animation=ANIMS.BLOCKING;
        else if (state===this.exit)
            animation=ANIMS.EXIT;
        else if (state===this.fallDead)
            animation=ANIMS.FALL_DEAD;
        else if (state===this.selfDestruct)
            animation=ANIMS.SELF_DESTRUCT;
        

        if (this.animation !== animation){
            this.animation = animation;
            this.sprite!.play(this.animation);
        }
    }

    private isTouchingGround(){
        const body = this.sprite!.body! as Phaser.Physics.Arcade.StaticBody;
        return body.blocked.down;
    }

    private doIdle(){
        if (!this.isTouchingGround() /*&& !standingTile */){
            this.stateManager.tryNext(LemmingStates.FALLING);
            return;
        }

        const body = this.sprite!.body! as Phaser.Physics.Arcade.StaticBody;
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

        if (this.canExit())
            this.stateManager.tryNext(LemmingStates.EXIT);
    }

    private doFalling(){
        const body = this.sprite!.body! as Phaser.Physics.Arcade.StaticBody;
        if (body.offset.y !=0)
            body.setOffset(0,0);
        


        if (this.isTouchingGround() && this.standingTile){
            if(this.isDeadOnImpact)
                this.stateManager.tryNext(LemmingStates.FALL_DEAD);
            else
                this.stateManager.tryNext(LemmingStates.IDLE);
            return;
        }
        
        this.standingTile=undefined;
        if (body.velocity.y>=250)
            this.isDeadOnImpact=true;
        
    }

    assignDigSideways(){
        this.task = LemmingTask.DIG_SIDEWAYS;
    }

    canDigSideways(){
        const body = this.sprite!.body! as Phaser.Physics.Arcade.StaticBody;
        return (
            (body.blocked.right||body.blocked.left)
            && this.task===LemmingTask.DIG_SIDEWAYS
            && this.bumpTile!=undefined
        );
    }

    private doDigSideways() {
        const body = this.sprite!.body! as Phaser.Physics.Arcade.StaticBody;
        if ((body.blocked.right && this.direction===Direction.RIGHT) || 
            (body.blocked.left && this.direction===Direction.LEFT))
            Context.scene.time.addEvent({ 
                delay: 5000, callback: ()=>{
                    console.log("Destroy tile at X=" + this.bumpTile!.x);
                    Context.tileImageLayer?.removeTileAt(this.bumpTile!.x, this.bumpTile!.y);
                    this.stateManager.tryNext(LemmingStates.IDLE);
    
                    const nextTileX = this.bumpTile!.x + (
                        (this.direction === Direction.LEFT) ? -1 : +1
                    );
    
                    if (!Context.tileImageLayer.getTileAt(nextTileX, this.bumpTile!.y))
                        this.task = LemmingTask.IDLE;
                }, 
                callbackScope: this
            });
    }

    assignBlock(){
        this.task=LemmingTask.BLOCK;
    }

    canBlock(){
        return this.isTouchingGround() && this.task===LemmingTask.BLOCK;
    }

    private doBlockingEnter(){
        const body = this.sprite!.body! as Phaser.Physics.Arcade.StaticBody;
        body.immovable=true;
        Context.physics.add.collider(this.sprite!,Context.lemmingColliders);
    }

    assignDigDown(){
        this.task=LemmingTask.DIG_DOWN;
    }

    canDigDown(){
        return this.isTouchingGround() && this.task===LemmingTask.DIG_DOWN;
    }

    private doDigDown(){
        const body = this.sprite!.body! as Phaser.Physics.Arcade.StaticBody;
        const tileToRemoveX = Math.floor(body.x/32);
        const tileToRemoveY = Math.floor(body.y/24)+1;
        body.position.x = (tileToRemoveX*32)+8;    // center lemming on tile to dig

        Context.scene.time.addEvent({ 
            delay: 5000, callback: ()=>{
                Context.tileImageLayer?.removeTileAt(tileToRemoveX,tileToRemoveY);
            
                let nextTileY = tileToRemoveY+1;
    
                if (!Context.tileImageLayer.getTileAt(tileToRemoveX,nextTileY)){
                    this.task=LemmingTask.IDLE;
                    this.stateManager.tryNext(LemmingStates.FALLING);
                }
            }, 
            callbackScope: this
        });
    }

    assignSelfDestruct(){
        this.task=LemmingTask.SELF_DESTRUCT;
        Context.scene.time.addEvent({ 
            delay: 5000, callback: ()=>{
                this.stateManager.tryNext(LemmingStates.SELF_DESTRUCT);
            }, 
            callbackScope: this
        });
    }

    private canSelfDestruct(){
        return this.task===LemmingTask.SELF_DESTRUCT;
    }

    private doSelfDestruct(){
        const body = this.sprite!.body! as Phaser.Physics.Arcade.StaticBody;

        this.sprite!.once(
            "animationcomplete",
            ()=>{
                const currentTileX = Math.floor(body.x/32);
                const currentTileY = Math.floor(body.y/24);
                const downTile = Context.tileImageLayer.getTileAt(currentTileX, currentTileY+1);
                const leftTile = Context.tileImageLayer.getTileAt(currentTileX-1, currentTileY);
                const rightTile = Context.tileImageLayer.getTileAt(currentTileX+1, currentTileY);
                if (downTile)
                    Context.tileImageLayer.removeTileAt(currentTileX,currentTileY+1);
                if (leftTile)
                    Context.tileImageLayer.removeTileAt(currentTileX-1,currentTileY);
                if (rightTile)
                    Context.tileImageLayer.removeTileAt(currentTileX+1,currentTileY);
            }
        )
        this.killLemming();
    }


    private updateFrontSensor(){
        let x = this.sprite!.x;
        if (this.direction===Direction.RIGHT)
            x+=LEMMING_SIZE.width;
        else if (this.direction===Direction.LEFT) 
            x-=LEMMING_SIZE.width;
        
        if (x!== this.sprite!.x)
            this.lemmingFrontSensor.setPosition(x,this.sprite!.y);
    }

    private updateGroundSensor(){
        this.lemmingGroundSensor.setPosition(this.sprite!.x,this.sprite!.y + LEMMING_SIZE.height);
    }

    private canExit(){
        const body = this.sprite!.body! as Phaser.Physics.Arcade.StaticBody;
        const exitDoor = Context.exitDoor.getSprite()!;
        return body.x >= exitDoor.x - 8
            && body.x <= exitDoor.x - 4
            && body.y >= exitDoor.y
            && body.y <= exitDoor.y + 24;
    }

    private exitDoor(){
        Context.lemmingsSaved++;
        const sprite = this.sprite!;
        sprite.once(
            'animationcomplete',
            ()=>{
                Context.lemmingColliders.remove(sprite);
                if (Context.selected === this)
                    Context.selected=undefined;
            }
        )
    }

    private killLemming(){
        const sprite = this.sprite!;
        Context.lemmingColliders.remove(sprite);
        Context.lemmingsDead++;
        if (Context.selected === this)
            Context.selected=undefined;
    }

    update(){
        this.stateManager.update();
        this.updateAnimation();
        this.updateVelocity();
        this.updateFrontSensor();
        this.updateGroundSensor();
    }
}

