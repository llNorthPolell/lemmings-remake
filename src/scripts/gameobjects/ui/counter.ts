export default class Counter extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Rectangle;
    name:string;
    private display: Phaser.GameObjects.Text;

    constructor(
        context: any, 
        name: string, 
        value: string,
        position: {x:number,y:number},
        width : number,
        height: number,
        bgcolor: number){
    
        super(context.scene,position.x,position.y);
        this.name=name;
        this.bg = context.scene.add.rectangle(
            0,
            0,
            width,
            height,
            bgcolor
        ).setOrigin(0);

        this.display = context.scene.add.text(
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