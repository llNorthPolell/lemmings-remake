import Lemming from "./lemming";

export default class Context{
    static tileImageLayer :Phaser.Tilemaps.TilemapLayer;
    static physics: Phaser.Physics.Arcade.ArcadePhysics;
    static lemmingColliders: Phaser.Physics.Arcade.Group;
    static scene: Phaser.Scene;

    static maxLemmings:number;
    static lemmingsOut:number;
    static lemmingsRequired:number;
    static lemmingsDead: number;
    static lemmingsSaved: number;

    static inventory= {
        numDigDowns:0,
        numDigSideways:0,
        numBlocks:0,
        numParachutes:0
    };

    static selected?: Lemming;

}