export default class SensorBox {
    private sensorBox: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

    constructor(
        context:any, 
        position: {x:number,y:number}, 
        width=1, 
        height=1, 
        debugColor=0xffff00, 
        alpha=0.5, 
        collideCallback: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, 
        processCollide: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback){
        this.sensorBox=context.scene.add.rectangle(
            position.x,
            position.y,
            width,
            height,
            debugColor,
            alpha
        ) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
        context.physics.add.existing(this.sensorBox);
        this.sensorBox.body.allowGravity=false;

        context.physics.add.overlap(this.sensorBox,context.tileImageLayer,
            collideCallback,
            processCollide,
            this
        );
    }

    getSensorBox(){
        return this.sensorBox;
    }

    setPosition(x:number,y:number){
        this.sensorBox.x=x;
        this.sensorBox.y=y;
    }

    update(){
        
    }
}