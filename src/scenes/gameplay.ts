import { createLemmingAnimations } from "../animations/lemming";
import { ASSETS } from "../scripts/enums/keys/assets";
import { SCENES } from "../scripts/enums/keys/scenes";
import Context from "../scripts/gameobjects/context";
import { Position } from "../scripts/gameobjects/gameobject";
import Lemming from "../scripts/gameobjects/lemming";
import Spawner from "../scripts/gameobjects/spawner";
import UIPanel from "../scripts/gameobjects/ui/ui";

export default class GameplayScene extends Phaser.Scene{
    private tileImageLayer? : Phaser.Tilemaps.TilemapLayer;
    private uiPanel : UIPanel|undefined;
    private lemmings:Lemming[];
    private lemmingColliderGroup?:Phaser.Physics.Arcade.Group;
    private start: Spawner|undefined;


    private maxLemmings:number;
    private lemmingsOut:number;
    private lemmingsRequired:number;
    private lemmingsDead: number;
    private lemmingsSaved: number;

    private selected?: Lemming;

    private dragStartX?:number;
    private dragX?:number;

    constructor(){
        super({
            key: SCENES.GAMEPLAY
        });
        this.lemmings=[];
        this.maxLemmings=0;
        this.lemmingsOut=0;
        this.lemmingsRequired=0;
        this.lemmingsDead=0;
        this.lemmingsSaved=0;
    }

    preload(){
        this.load.image(ASSETS.TILE_SET, "src/assets/tilesets/tiles.png")
        this.load.tilemapTiledJSON(ASSETS.TILE_MAP,"src/assets/levels/1.json");

        this.load.spritesheet(ASSETS.LEMMING_SPRITESHEET,"src/assets/sprites/lemming.png", {frameWidth:16,frameHeight:16});
    }

    private spawn(gameobject: string, position: Position){
        switch (gameobject) {
            case "lemming":
                const lemming = new Lemming(String(this.lemmings.length),position);
                this.lemmings.push(lemming);
                break;
            case "Entrance":
                this.start = new Spawner(position);
                break;
            case "Exit":
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
                this.maxLemmings=object.properties![0].value;
                //this.maxLemmings=1;
            else if (object.name=="Exit")
                this.lemmingsRequired=object.properties![0].value;
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
           }
        );
        
        Context.tileImageLayer=this.tileImageLayer;
    }
    
    create(){
        this.cameras.main.setBounds(0,0,1600,0);
        createLemmingAnimations(this.anims);

        this.generateLevel();
        
        this.lemmingColliderGroup=this.physics.add.group();

        Context.scene = this;
        Context.physics=this.physics;
        Context.lemmingColliders=this.lemmingColliderGroup;

        this.uiPanel= new UIPanel(Context);

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

        const spawnLemmings = setInterval(()=>{
            if (this.lemmingsOut==this.maxLemmings){  
                clearInterval(spawnLemmings);
                return;
            }
            this.spawn("lemming", this.start!.getPosition());
            this.lemmingsOut++;
        },3000)

    }

    update(){
        this.lemmings.forEach(lemming=>{
            lemming.update();
        });
        this.uiPanel!.updateProgressText(this.maxLemmings,this.lemmingsOut, this.lemmingsSaved);
    }
}