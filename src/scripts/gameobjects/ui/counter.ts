export default class Counter extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Rectangle;
    name:string;
    private display: Phaser.GameObjects.Text;

    constructor(
        scene: Phaser.Scene, 
        name: string, 
        value: string,
        position: {x:number,y:number},
        width : number,
        height: number,
        bgcolor: number){
    
        super(scene,position.x,position.y);
        this.name=name;
        this.bg = scene.add.rectangle(
            0,
            0,
            width,
            height,
            bgcolor
        ).setOrigin(0);

        this.display = scene.add.text(
            0,
            0,
            value
        );

        this.add(this.bg);
        this.add(this.display);

    }


    updateValue(newValue:number){
        this.display.setText(String(newValue));
    }
}