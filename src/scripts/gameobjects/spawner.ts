import { ASSETS } from "../enums/keys/assets";
import Context from "./context";
import { GameObject, Position } from "./gameobject";

export default class Spawner extends GameObject {
    constructor(position: Position){
        super("spawner",Context.scene.add.sprite(
            position.x,
            position.y, 
            ASSETS.DOOR_SPRITESHEET
        ));

    }
}