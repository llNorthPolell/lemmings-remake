export interface Position{
    x:number,
    y:number
}

export abstract class GameObject {
    protected id: string;
    protected sprite? : Phaser.Physics.Arcade.Sprite | Phaser.GameObjects.Sprite;

    constructor(id:string, sprite? : Phaser.Physics.Arcade.Sprite | Phaser.GameObjects.Sprite){
        this.id=id;
        this.sprite=sprite;
    }

    getSprite(){
        return this.sprite;
    }

    getPosition(){
        return {x:this.sprite!.x,y:this.sprite!.y}
    }
}


