import { createLemmingAnimations } from "../animations/lemming";
import { ASSETS } from "../scripts/enums/keys/assets";
import { SCENES } from "../scripts/enums/keys/scenes";
import Context from "../scripts/gameobjects/context";
import Exit from "../scripts/gameobjects/exit";
import { Position } from "../scripts/gameobjects/gameobject";
import Lemming from "../scripts/gameobjects/lemming";
import SelectionBox from "../scripts/gameobjects/selectionBox";
import Spawner from "../scripts/gameobjects/spawner";

export default class GameplayScene extends Phaser.Scene{
    private tileImageLayer? : Phaser.Tilemaps.TilemapLayer;
    private lemmings:Lemming[];
    private startDoor?: Spawner;
    private exitDoor?: Exit;

    private dragStartX?:number;
    private dragX?:number;

    private selectionBox?: SelectionBox;

    private gameOver: boolean;
    private win: boolean;


    constructor(){
        super({
            key: SCENES.GAMEPLAY,
            active:true
        });
        this.lemmings=[];
        this.gameOver=false;
        this.win = false;
    }

    preload(){
        this.load.image(ASSETS.TILE_SET, "src/assets/tilesets/tiles.png")
        this.load.tilemapTiledJSON(ASSETS.TILE_MAP,"src/assets/levels/1.json");

        this.load.spritesheet(ASSETS.LEMMING_SPRITESHEET,"src/assets/sprites/lemming.png", {frameWidth:16,frameHeight:16});
        this.load.spritesheet(ASSETS.DOOR_SPRITESHEET,"src/assets/sprites/door.png", {frameWidth:60,frameHeight:60});
    }

    private spawn(gameobject: string, position: Position){
        switch (gameobject) {
            case "lemming":
                const lemming = new Lemming(String(this.lemmings.length),position);
                this.lemmings.push(lemming);
                break;
            case "Entrance":
                this.startDoor = new Spawner(position);
                break;
            case "Exit":
                this.exitDoor = new Exit(position);
                Context.exitDoor = this.exitDoor;
                console.log("Exit set at " + JSON.stringify(this.exitDoor.getPosition()));
                break;
            default:
                break;

        }

    }

    private generateLevel(){
        const map = this.make.tilemap({key:ASSETS.TILE_MAP, tileWidth:32, tileHeight:24});
        const tileset = map.addTilesetImage(ASSETS.TILE_MAP_TILE_SET_IMG,ASSETS.TILE_SET)!;
        this.tileImageLayer= map.createLayer(ASSETS.TILE_IMG_LAYER, tileset)!;
        
        this.tileImageLayer.setCollisionByProperty({collides: true});

        const objectLayer = map.getObjectLayer(ASSETS.TILE_MAP_OBJECT_LAYER);
        
        objectLayer!.objects.forEach(object=>{
            this.spawn(object.name,{x:object.x!, y:object.y!})
            
            if (object.name=="Entrance")
                Context.maxLemmings=object.properties![0].value;
                //this.maxLemmings=1;
            else if (object.name=="Exit")
                Context.lemmingsRequired=object.properties![0].value;
        });
   
        (map.properties as Array<{name:string, type:string, value:number}>).forEach(
           (item:{name:string, type:string,value:number})=> {
                if (item.name=="numDigDowns")
                    Context.inventory.numDigDowns=item.value;
                else if (item.name=="numDigSideways")
                    Context.inventory.numDigSideways=item.value;
                else if (item.name=="numBlocks")
                    Context.inventory.numBlocks=item.value;
                else if (item.name=="numParachutes")
                    Context.inventory.numParachutes=item.value;
                else if (item.name=="time"){
                    Context.currentTime=item.value;
                    Context.timeInSeconds=item.value;
                }
           }
        );
        
        Context.tileImageLayer=this.tileImageLayer;
    }
    
    create(){
        Context.scene = this;
        Context.physics=this.physics;
        Context.lemmingColliders=this.physics.add.group();
        Context.lemmingsDead=0;

        this.cameras.main.setBounds(0,0,1600,0);
        createLemmingAnimations(this.anims);

        this.generateLevel();

        this.input
        .on(
            Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,
            ()=>{
                if (!this.dragStartX)
                    this.dragStartX = this.game.input.activePointer.downX;        
            }
        )
        .on(
            Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE,
            ()=>{
                if (this.game.input.activePointer.primaryDown){
                    if (!this.dragStartX) this.dragStartX = 0;
                    
                    this.dragX=this.game.input.activePointer.position.x;
                    this.cameras.main.scrollX+= (this.dragStartX!-this.dragX)/32;
                }
            }
        )
        .on(
            Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
            ()=>{
                if (this.dragStartX){
                    this.dragStartX = undefined;
                    this.dragX=undefined;
                }
            }
        )


        const spawnLemmings = this.time.addEvent({ 
            delay: 3000, callback: ()=>{
                this.spawn("lemming", this.startDoor!.getPosition());
                Context.lemmingsOut++;
                if (Context.lemmingsOut == Context.maxLemmings)
                    this.time.removeEvent(spawnLemmings);
            }, 
            callbackScope: this,
            loop:true
        });
 
        this.selectionBox = new SelectionBox({x:0,y:0});

        /*setTimeout(()=>{
            this.game.pause();
            console.log("Game paused");
        },5000);

        setTimeout(()=>{
            this.game.resume();
            console.log("Game resumed");
        },15000);*/
    }

    update(){
        this.lemmings.forEach(lemming=>{
            lemming.update();
        });
        this.selectionBox!.update();

        if (this.gameOver) return;
        if (Context.lemmingsDead+Context.lemmingsSaved==Context.maxLemmings){
            this.gameOver=true;
            if(Context.lemmingsSaved>=Context.lemmingsRequired){
                console.log("You win!");
                this.win=true;
            }
            else 
                console.log("Mission Failed...");
        }
    }
}