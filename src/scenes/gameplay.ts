import { createLemmingAnimations } from "../animations/lemming";
import { ASSETS } from "../scripts/enums/keys/assets";
import { SCENES } from "../scripts/enums/keys/scenes";
import { Position } from "../scripts/gameobjects/gameobject";
import Lemming from "../scripts/gameobjects/lemming";
import Spawner from "../scripts/gameobjects/spawner";

export default class GameplayScene extends Phaser.Scene{
    private tileImageLayer : Phaser.Tilemaps.TilemapLayer|undefined;
    private lemmings:Lemming[];
    private lemmingColliderGroup:Phaser.Physics.Arcade.Group|undefined;
    private start: Spawner|undefined;

    private maxLemmings:number;
    private lemmingsOut:number;
    private lemmingsRequired:number;
    

    constructor(){
        super({
            key: SCENES.GAMEPLAY
        });
        this.lemmings=[];
        this.start=undefined;
        this.maxLemmings=0;
        this.lemmingsOut=0;
        this.lemmingsRequired=0;
        this.lemmingColliderGroup = undefined;
    }

    preload(){
        this.load.image(ASSETS.TILE_SET, "src/assets/tilesets/tiles.png")
        this.load.tilemapTiledJSON(ASSETS.TILE_MAP,"src/assets/levels/1.json");

        this.load.spritesheet(ASSETS.LEMMING_SPRITESHEET,"src/assets/sprites/lemming.png", {frameWidth:16,frameHeight:16});
    }

    private spawn(gameobject: string, position: Position){
        switch (gameobject) {
            case "lemming":
                const lemming = new Lemming(
                    position, this.physics,this.tileImageLayer!,this.lemmingColliderGroup!);
                this.lemmings.push(lemming);

                // blocker test
                if (this.lemmings.length === 2)
                    setTimeout(()=>{
                        lemming.block();
                    },7000)

                // dig sideways test
                /*if (this.lemmings.length === 1)
                    setTimeout(()=>{
                        lemming.assignDigSideways();
                    },15000)*/
                if (this.lemmings.length === 1)
                    setTimeout(()=>{
                        lemming.assignDigDown();
                    },14600)

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

    
    create(){
        const map = this.make.tilemap({key:ASSETS.TILE_MAP, tileWidth:32, tileHeight:24});
        const tileset = map.addTilesetImage(ASSETS.TILE_MAP_TILE_SET_IMG,ASSETS.TILE_SET)!;
        this.tileImageLayer= map.createLayer(ASSETS.TILE_IMG_LAYER, tileset)!;

        this.tileImageLayer.setCollisionByProperty({collides: true});

        const objectLayer = map.getObjectLayer(ASSETS.TILE_MAP_OBJECT_LAYER);

        objectLayer!.objects.forEach(object=>{
            this.spawn(object.name,{x:object.x!, y:object.y!})
            
            if (object.name=="Entrance")
                this.maxLemmings=object.properties![0].value;
            else if (object.name=="Exit")
                this.lemmingsRequired=object.properties![0].value;
        })

        createLemmingAnimations(this.anims);

        this.lemmingColliderGroup=this.physics.add.group();

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
    }
}