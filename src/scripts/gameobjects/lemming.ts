import { GameObject } from "./gameobject";
import { LemmingStatus } from "../enums/lemmingStatus";
import { Direction } from "../enums/direction";
import { ANIMS } from "../enums/keys/animations";
import { ASSETS } from "../enums/keys/assets";
import { LemmingTask } from "../enums/lemmingTasks";

const MOVESPEED = 25;

export default class Lemming extends GameObject{
    // global physics
    private tileImageLayer :Phaser.Tilemaps.TilemapLayer;
    private physics: Phaser.Physics.Arcade.ArcadePhysics;
    private lemmingColliders: Phaser.Physics.Arcade.Group;

    // lemming specific
    private status: LemmingStatus;
    private task: LemmingTask;
    private direction: Direction;
    private sprite : Phaser.Physics.Arcade.Sprite;
    private animation: string;
    


    constructor(position: {x:number, y: number}, 
                physics: Phaser.Physics.Arcade.ArcadePhysics,
                tileImageLayer: Phaser.Tilemaps.TilemapLayer,
                lemmingColliders: Phaser.Physics.Arcade.Group){
        super({x:position.x, y:position.y});
        this.tileImageLayer = tileImageLayer;
        this.physics = physics;
        this.lemmingColliders=lemmingColliders;

        this.status = LemmingStatus.IDLE;
        this.task = LemmingTask.IDLE;
        this.direction=Direction.RIGHT;
        this.sprite = physics.add.sprite(
            position.x,
            position.y, 
            ASSETS.LEMMING_SPRITESHEET
        );
        this.animation = ANIMS.IDLE_RIGHT;

        physics.add.collider(this.sprite, this.tileImageLayer!,
            ()=>{
                const body = this.sprite.body!;
                if (this.task===LemmingTask.DIG_SIDEWAYS && (body.blocked.left || body.blocked.right))
                    this.digSideways();
            }
        );
        this.lemmingColliders!.add(this.sprite);
    }

    setStatus(status: LemmingStatus){
        this.status=status;
    }

    getStatus(){
        return this.status;
    }

    setDirection(direction : Direction){
        this.direction = direction;
    }

    getDirection(){
        return this.direction;
    }

    getSprite(){
        return this.sprite;
    }

    updateStatus(){
        const body = this.sprite.body!;
        let status = this.status;

        if (!body.blocked.down){
            status=LemmingStatus.FALLING;
        }
        else if (body.blocked.down && this.status===LemmingStatus.FALLING)
            status=LemmingStatus.IDLE;

        if (this.task===LemmingTask.DIG_SIDEWAYS)
            status=LemmingStatus.DIG_SIDEWAYS;

        if (this.status !== status)
            this.status=status;      
    }

    updateDirection(){
        const body = this.sprite.body!;
        let direction = this.direction;

        if (this.status===LemmingStatus.FALLING)
            direction = Direction.DOWN;
        else {
            if (direction === Direction.DOWN)
                direction = Direction.RIGHT;
            
            if (this.status===LemmingStatus.IDLE){
                if (body.blocked.right)
                    direction = Direction.LEFT;
                else if (body.blocked.left)
                    direction = Direction.RIGHT;
            }
            else if (this.status===LemmingStatus.DIG_SIDEWAYS)
                direction = this.direction;  
        }
        
        
        this.direction = direction;
        this.updateAnimation();
        this.updateVelocity();
    }

    updateVelocity(){
        if (this.status === LemmingStatus.IDLE){
            let movespeed = 0;
            switch(this.direction){
                case Direction.RIGHT:
                    movespeed=MOVESPEED;
                    break;
                case Direction.LEFT:
                    movespeed=MOVESPEED * -1;
                    break;
                default:
                    break;
            }
            this.sprite.setVelocityX(movespeed)
        }
        else if (this.status=== LemmingStatus.DIG_SIDEWAYS){
            const body = this.sprite.body!;
            if (body.blocked.left || body.blocked.right)
                this.sprite.setVelocity(0);
        }
        else {
            this.sprite.setVelocityX(0);
        }
        
    }

    assignDigSideways(){
        this.task = LemmingTask.DIG_SIDEWAYS;
        this.status=LemmingStatus.DIG_SIDEWAYS;
    }

    digSideways(){
        if (this.status===LemmingStatus.FALLING) return;
        const body = this.sprite.body!;
        let tileToRemoveX :number|undefined = undefined;
        const tileToRemoveY = Math.floor(body.y/24);
        
        if (body.blocked.right)
            tileToRemoveX = Math.floor(body.x/32)+1;
        else if (body.blocked.left){
            tileToRemoveX = Math.floor(body.x/32)-1;
        }

        if (tileToRemoveX || tileToRemoveX===0){
            this.status = LemmingStatus.DIG_SIDEWAYS;
            setTimeout(()=>{
                this.tileImageLayer?.removeTileAt(tileToRemoveX!,tileToRemoveY);
                this.status=LemmingStatus.IDLE;

                let nextTileX = tileToRemoveX!;

                if(this.direction ===Direction.RIGHT) nextTileX+=1;
                else if(this.direction ===Direction.LEFT) nextTileX-=1;

                if (this.tileImageLayer.getTileAt(nextTileX,tileToRemoveY)){
                    this.updateVelocity()
                }
                else
                    this.task=LemmingTask.IDLE;
                
            },5000)
        }
    }
    

    assignBlock(){
        this.task=LemmingTask.BLOCK;
    }

    block(){
        if (this.status===LemmingStatus.BLOCKING || this.status===LemmingStatus.FALLING) return;
        this.status=LemmingStatus.BLOCKING;
        this.sprite.body!.immovable=true;
        this.physics.add.collider(this.sprite,this.lemmingColliders);
    }


    assignDigDown(){
        this.task=LemmingTask.DIG_DOWN;
    }

    digDown(){
        if (this.status===LemmingStatus.FALLING) return;
        const body = this.sprite.body!;
        const tileToRemoveX = Math.floor(body.x/32);
        const tileToRemoveY = Math.floor(body.y/24)+1;
        this.status=LemmingStatus.DIG_DOWN;
        body.position.x = (tileToRemoveX*32)+8;    // center lemming on tile to dig

        setTimeout(()=>{   
            this.tileImageLayer?.removeTileAt(tileToRemoveX,tileToRemoveY);
            

            let nextTileY = tileToRemoveY+1;

            if (!this.tileImageLayer.getTileAt(tileToRemoveX,nextTileY)){
                this.task=LemmingTask.IDLE;
                this.status=LemmingStatus.IDLE;
            }
        },5000)

    }

    updateAnimation(){
        let animation = this.animation;
        if (this.status===LemmingStatus.IDLE)
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
        else if (this.status===LemmingStatus.FALLING)
            animation=ANIMS.FALLING;
        else if (this.status===LemmingStatus.DIG_DOWN)
            animation=ANIMS.DIG_DOWN;
        else if (this.status===LemmingStatus.BLOCKING){
            animation=ANIMS.BLOCKING;
        }

        if (this.animation !== animation){
            this.animation = animation;
            this.sprite.play(this.animation);
        }
    }

    update(){
        this.updateStatus();
        this.updateDirection();


        switch(this.task){
            case LemmingTask.BLOCK:
                this.block();
                break;
            case LemmingTask.DIG_DOWN:
                this.digDown();
                break;
            default:
                break;
        }
    }
}

