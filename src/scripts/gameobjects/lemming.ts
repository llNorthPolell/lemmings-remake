import { GameObject } from "./gameobject";
import { LemmingStates } from "../enums/lemmingStates";
import { Direction } from "../enums/direction";
import { ANIMS } from "../enums/keys/animations";
import { ASSETS } from "../enums/keys/assets";
import { LemmingTask } from "../enums/lemmingTasks";
import StateManager, { State } from "./components/stateManager";


const MOVESPEED = 25;

export default class Lemming extends GameObject{
    // global physics
    private tileImageLayer :Phaser.Tilemaps.TilemapLayer;
    private physics: Phaser.Physics.Arcade.ArcadePhysics;
    private lemmingColliders: Phaser.Physics.Arcade.Group;

    // lemming specific
    //private status: LemmingStatus;
    private stateManager : StateManager
    private task: LemmingTask;
    private direction: Direction;
    private sprite : Phaser.Physics.Arcade.Sprite;
    private animation: string;

    // states
    private idle : State | undefined = undefined; 
    private falling : State| undefined = undefined;  
    private digDown : State| undefined = undefined; 
    private digSideways : State| undefined = undefined; 
    private blocking : State| undefined = undefined; 

    constructor(position: {x:number, y: number}, 
                physics: Phaser.Physics.Arcade.ArcadePhysics,
                tileImageLayer: Phaser.Tilemaps.TilemapLayer,
                lemmingColliders: Phaser.Physics.Arcade.Group){
        super({x:position.x, y:position.y});
        this.tileImageLayer = tileImageLayer;
        this.physics = physics;
        this.lemmingColliders=lemmingColliders;

        this.task = LemmingTask.IDLE;
        this.direction=Direction.RIGHT;
        this.animation = ANIMS.FALLING;

        this.sprite = physics.add.sprite(
            position.x,
            position.y, 
            ASSETS.LEMMING_SPRITESHEET
        );

        physics.add.collider(this.sprite, this.tileImageLayer!);
        this.lemmingColliders!.add(this.sprite);

        this.initStates();
        this.stateManager = new StateManager(this.falling!);
    }


    initStates(){       
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

    turnAround(){
        if (this.direction===Direction.RIGHT)
            this.direction=Direction.LEFT;
        else if (this.direction===Direction.LEFT)
            this.direction=Direction.RIGHT;
    }

    getSprite(){
        return this.sprite;
    }

    setSlopeMovement(slopeAngle:number){
        this.sprite.setRotation(slopeAngle);
        this.sprite.setOffset(0,-10);
    }

    updateVelocity(){
        const state = this.stateManager.getState();
        if (state===this.idle){
            if (this.direction===Direction.RIGHT)
                this.sprite.setVelocityX(MOVESPEED);
            else if (this.direction===Direction.LEFT)
                this.sprite.setVelocityX(-MOVESPEED);
        }
        else this.sprite.setVelocityX(0);      
    }

    updateAnimation(){
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

    getNearbyTile(direction: Direction, distance=1){
        const body = this.sprite.body!;
        const tileX= Math.floor(body.x/32);
        const tileY = Math.floor(body.y/24);

        switch (direction){
            case Direction.LEFT:
                return this.tileImageLayer.getTileAt(tileX-distance,tileY);
            case Direction.RIGHT:
                return this.tileImageLayer.getTileAt(tileX+distance,tileY);
            case Direction.DOWN:
                return this.tileImageLayer.getTileAt(tileX,tileY+distance);
            default:
                return undefined;
        }
    }


    isTouchingGround(){
        return this.sprite.body!.blocked.down;
    }

    doIdle(){
        const body = this.sprite.body!;
        if ((body.blocked.left && this.direction===Direction.LEFT) || 
            (body.blocked.right && this.direction===Direction.RIGHT)
            && this.task !== LemmingTask.DIG_SIDEWAYS){
            this.turnAround();
            return;
        }

        if (!this.isTouchingGround()){
            this.stateManager.tryNext(LemmingStates.FALLING);
            return;
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

    doFalling(){
        if (this.isTouchingGround())
            this.stateManager.tryNext(LemmingStates.IDLE);
    }

    assignDigSideways(){
        this.task = LemmingTask.DIG_SIDEWAYS;
    }

    canDigSideways(){
        const body = this.sprite.body!;
        return (
            (body.blocked.right||body.blocked.left)
            && this.task===LemmingTask.DIG_SIDEWAYS
        );
    }

    doDigSideways(){
        const body = this.sprite.body!;
        let tileToRemoveX :number|undefined = undefined;
        const tileToRemoveY = Math.floor(body.y/24);
        
        if (body.blocked.right)
            tileToRemoveX = Math.floor(body.x/32)+1;
        else if (body.blocked.left)
            tileToRemoveX = Math.floor(body.x/32)-1;
        
        if (tileToRemoveX || tileToRemoveX===0){
            console.log("Destroy tile at X="+tileToRemoveX);
            setTimeout(()=>{
                this.tileImageLayer?.removeTileAt(tileToRemoveX!,tileToRemoveY);
                this.stateManager.tryNext(LemmingStates.IDLE);

                if (!this.getNearbyTile(this.direction,2))
                    this.task=LemmingTask.IDLE;
                
            },5000)
        }
    }

    assignBlock(){
        this.task=LemmingTask.BLOCK;
    }

    canBlock(){
        return this.isTouchingGround() && this.task===LemmingTask.BLOCK;
    }

    doBlockingEnter(){
        console.log("Blocking");
        this.sprite.body!.immovable=true;
        this.physics.add.collider(this.sprite,this.lemmingColliders);

    }

    assignDigDown(){
        this.task=LemmingTask.DIG_DOWN;
    }

    canDigDown(){
        return this.isTouchingGround() && this.task===LemmingTask.DIG_DOWN;
    }

    doDigDown(){
        const body = this.sprite.body!;
        const tileToRemoveX = Math.floor(body.x/32);
        const tileToRemoveY = Math.floor(body.y/24)+1;
        body.position.x = (tileToRemoveX*32)+8;    // center lemming on tile to dig

        setTimeout(()=>{   
            this.tileImageLayer?.removeTileAt(tileToRemoveX,tileToRemoveY);
            
            let nextTileY = tileToRemoveY+1;

            if (!this.tileImageLayer.getTileAt(tileToRemoveX,nextTileY)){
                this.task=LemmingTask.IDLE;
                this.stateManager.tryNext(LemmingStates.FALLING);
            }
        },5000)
    }

    update(){
        this.stateManager.update();
        this.updateAnimation();
        this.updateVelocity();
    }
}

