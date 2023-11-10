import Exit from "./exit";
import Lemming from "./lemming";

export default class Context{
    static tileImageLayer :Phaser.Tilemaps.TilemapLayer;
    static physics: Phaser.Physics.Arcade.ArcadePhysics;
    static lemmingColliders: Phaser.Physics.Arcade.Group;
    static scene: Phaser.Scene;

    static maxLemmings:number=0;
    static lemmingsOut:number=0;
    static lemmingsRequired:number=0;
    static lemmingsDead: number=0;
    static lemmingsSaved: number=0;

    static inventory= {
        numDigDowns:0,
        numDigSideways:0,
        numBlocks:0,
        numParachutes:0
    };

    static selected?: Lemming;

    static exitDoor: Exit;

    static currentTime:number = 0;
    static timeInSeconds:number = 0;

}