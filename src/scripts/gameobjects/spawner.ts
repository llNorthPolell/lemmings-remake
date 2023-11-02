import { GameObject, Position } from "./gameobject";

export default class Spawner extends GameObject {
    constructor(position: Position){
        super(position);
    }
}