import { mainMenu } from "../enums/gameStates";
import { State } from "./components/stateManager";
import Exit from "./exit";
import Lemming from "./lemming";

export default class Context{
    static state? : State = mainMenu;
    static level : number = 1;
    static paused : boolean = false;
    static restart: boolean = false;

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

    static exitDoor: Exit;

    static currentTime:number;
    static timeInSeconds:number;

}